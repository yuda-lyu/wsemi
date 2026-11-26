//judgeSourceScan.mjs: R-JUDGE-SOURCE-01之原始碼掃描(以acorn解析, 不計註解與字串內之字樣), 列出取得lodash之isFunction、isBoolean之站點
//  站點之形: 預設匯入'lodash-es/isFunction.js'等單檔路徑(含無副檔名、'lodash/'), 自整包或彙整模組('lodash-es'、'lodash'、其lodash.js、lodash.default.js、lang.js、lang.default.js)之具名匯入(含別名)、
//  命名空間或預設匯入(可經_.isFunction取得, 一律計為站點), 獨立套件'lodash.isfunction'、'lodash.isboolean', 上述來源之re-export(export { isFunction } from、export * from),
//  動態import()與require類呼叫(require、名稱含require之函數、createRequire(...)(...))之字面來源(字串或無插值之樣板字串); 非字面之來源(字串相加等)無法判定, 不計
import fs from 'fs'
import path from 'path'
import * as acorn from 'acorn'


let NAMES = ['isFunction', 'isBoolean']
let RE_FILE = /^lodash(?:-es)?\/(isFunction|isBoolean)(?:\.js)?$/
//RE_PKG, 含isFunction、isBoolean之彙整模組: 整包、lodash.js、lodash.default.js、lang.js、lang.default.js(lodash-es與lodash皆同; 獨立複審指出lang與default之漏抓)
let RE_PKG = /^lodash(?:-es)?(?:\/(?:lodash|lang)(?:\.default)?(?:\.js)?)?$/
//RE_SOLO, 獨立發布之單一函數套件(預設匯入即該函數)
let RE_SOLO = /^lodash\.(isfunction|isboolean)$/i

//classify, 依匯入來源與匯入名稱判定站點名稱('isFunction'、'isBoolean'、'*'為整包)或null
function classify(src, imported) {
    if (typeof src !== 'string') {
        return null
    }
    let m = RE_FILE.exec(src)
    if (m) {
        return m[1]
    }
    let s = RE_SOLO.exec(src)
    if (s) {
        return s[1].toLowerCase() === 'isfunction' ? 'isFunction' : 'isBoolean'
    }
    if (RE_PKG.test(src)) {
        if (imported === null) {
            return '*'
        }
        return NAMES.includes(imported) ? imported : null
    }
    return null
}

//litOf, 動態import之字面來源
function litOf(node) {
    if (!node) {
        return null
    }
    if (node.type === 'Literal' && typeof node.value === 'string') {
        return node.value
    }
    if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
        return node.quasis[0].value.cooked
    }
    return null
}

function walk(node, fn) {
    if (!node || typeof node.type !== 'string') {
        return
    }
    fn(node)
    for (let k of Object.keys(node)) {
        let v = node[k]
        if (Array.isArray(v)) {
            for (let x of v) {
                if (x && typeof x.type === 'string') {
                    walk(x, fn)
                }
            }
        }
        else if (v && typeof v.type === 'string') {
            walk(v, fn)
        }
    }
}

/**
 * 掃描一段原始碼
 *
 * @param {String} code 輸入原始碼
 * @returns {Array} 回傳站點陣列[{ name, line, source }]
 */
function scanCode(code) {
    let ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true, allowHashBang: true })
    let out = []
    let add = (name, node, source) => {
        if (name !== null) {
            out.push({ name, line: node.loc.start.line, source })
        }
    }
    //reqNames, 以createRequire(...)之結果賦值之變數名(let req = createRequire(...)、req = createRequire(...)), 其呼叫視同require
    let reqNames = new Set()
    let isCreateRequire = (x) => x && x.type === 'CallExpression' && x.callee.type === 'Identifier' && x.callee.name === 'createRequire'
    walk(ast, (n) => {
        if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && isCreateRequire(n.init)) {
            reqNames.add(n.id.name)
        }
        if (n.type === 'AssignmentExpression' && n.left.type === 'Identifier' && isCreateRequire(n.right)) {
            reqNames.add(n.left.name)
        }
    })
    walk(ast, (n) => {
        if (n.type === 'ImportDeclaration') {
            let src = n.source.value
            if (n.specifiers.length === 0) {
                return //副作用匯入(import 'x')不取得任何函數, 不計
            }
            for (let sp of n.specifiers) {
                if (sp.type === 'ImportSpecifier') {
                    let im = sp.imported.type === 'Identifier' ? sp.imported.name : sp.imported.value
                    add(RE_FILE.test(src) ? classify(src, null) : classify(src, im), n, src)
                }
                else {
                    add(classify(src, null), n, src) //預設或命名空間
                }
            }
        }
        else if (n.type === 'ExportNamedDeclaration' && n.source) {
            let src = n.source.value
            for (let sp of n.specifiers) {
                let lo = sp.local.type === 'Identifier' ? sp.local.name : sp.local.value
                add(RE_FILE.test(src) ? classify(src, null) : classify(src, lo), n, src)
            }
        }
        else if (n.type === 'ExportAllDeclaration') {
            add(classify(n.source.value, null), n, n.source.value)
        }
        else if (n.type === 'ImportExpression') {
            let src = litOf(n.source)
            add(classify(src, null), n, src)
        }
        else if (n.type === 'CallExpression' && n.arguments.length > 0) {
            //require('x')、名稱含require之函數、以createRequire(...)之結果賦值之變數(如const req = createRequire(...); req('x'))、createRequire(...)('x'): 字面來源同樣判定
            let c = n.callee
            let isReq = (c.type === 'Identifier' && (/require/i.test(c.name) || reqNames.has(c.name))) || isCreateRequire(c)
            if (isReq) {
                let src = litOf(n.arguments[0])
                add(classify(src, null), n, src)
            }
        }
    })
    return out
}

/**
 * 掃描資料夾內之全部.mjs
 *
 * @param {String} dir 輸入資料夾
 * @returns {Object} 回傳{ nFiles, sites: { 檔名: [站點] } }
 */
function scanDir(dir) {
    let files = fs.readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort()
    let sites = {}
    for (let f of files) {
        let r = scanCode(fs.readFileSync(path.join(dir, f), 'utf8'))
        if (r.length > 0) {
            sites[f] = r
        }
    }
    return { nFiles: files.length, sites }
}


export { scanCode, scanDir }
