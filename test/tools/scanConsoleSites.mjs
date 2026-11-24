//scanConsoleSites, 全庫「函數內自行console」之盤點(AST; R-DIAG-01規則14、20之站點全集): 列出src/*.mjs內每一處console之參照(呼叫、當值使用、x.console)與process.stdout/stderr之參照
//以acorn解析(開發環境之間接相依), 不計註解與字串內之字樣(JSDoc範例之console.log不算)
//用法: node test/tools/scanConsoleSites.mjs [srcDir]          印出站點表(檔:行 [種類 方法] fn=所在函數 args=引數原文)
//      node test/tools/scanConsoleSites.mjs --selfcheck       以內建夾具驗證本工具抓得到7種寫法(無則離開碼1)
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as acorn from 'acorn'


//walk, 走訪AST(parents為祖先鏈)
let walk = (node, parents, cb) => {
    if (!node || typeof node.type !== 'string') {
        return
    }
    cb(node, parents)
    let ps = [...parents, node]
    for (let k of Object.keys(node)) {
        if (k === 'loc' || k === 'start' || k === 'end') {
            continue
        }
        let v = node[k]
        if (Array.isArray(v)) {
            for (let x of v) {
                if (x && typeof x.type === 'string') {
                    walk(x, ps, cb)
                }
            }
        }
        else if (v && typeof v.type === 'string') {
            walk(v, ps, cb)
        }
    }
}


//fnName, 所在函數之名稱
let fnName = (parents) => {
    for (let i = parents.length - 1; i >= 0; i--) {
        let p = parents[i]
        if (p.type === 'FunctionDeclaration' && p.id) {
            return p.id.name
        }
        if (p.type === 'FunctionExpression' || p.type === 'ArrowFunctionExpression') {
            let q = parents[i - 1]
            if (q && q.type === 'VariableDeclarator' && q.id && q.id.name) {
                return q.id.name
            }
            if (q && q.type === 'Property' && q.key) {
                return q.key.name || q.key.value
            }
            if (q && q.type === 'AssignmentExpression' && q.left) {
                return q.left.type === 'MemberExpression' && q.left.property ? `${q.left.object.name || '?'}.${q.left.property.name}` : (q.left.name || '?')
            }
        }
    }
    return '(top)'
}


//scanCode, 單一檔案之站點
let scanCode = (f, code) => {
    let sites = []
    let ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true, allowHashBang: true })
    let txt = (a, b) => code.slice(a, b).replace(/\s+/g, ' ').slice(0, 160)
    walk(ast, [], (node, parents) => {
        if (node.type === 'Identifier' && node.name === 'console') {
            let par = parents[parents.length - 1]
            if (par && par.type === 'MemberExpression' && par.property === node && !par.computed) {
                sites.push({ f, line: node.loc.start.line, kind: 'prop-console', method: null, fn: fnName(parents), args: txt(par.start, par.end + 40) })
                return
            }
            if (par && par.type === 'Property' && par.key === node && !par.computed) {
                return
            }
            let kind = 'ref'
            let method = null
            let args = null
            if (par && par.type === 'MemberExpression' && par.object === node) {
                method = par.computed ? `[${code.slice(par.property.start, par.property.end)}]` : par.property.name
                let gp = parents[parents.length - 2]
                if (gp && gp.type === 'CallExpression' && gp.callee === par) {
                    kind = 'call'
                    args = gp.arguments.length ? txt(gp.arguments[0].start, gp.arguments[gp.arguments.length - 1].end) : ''
                }
                else {
                    kind = 'member'
                }
            }
            sites.push({ f, line: node.loc.start.line, kind, method, fn: fnName(parents), args })
        }
        if (node.type === 'MemberExpression' && !node.computed && node.property && (node.property.name === 'stdout' || node.property.name === 'stderr')) {
            if (node.object && node.object.type === 'Identifier' && node.object.name === 'process') {
                sites.push({ f, line: node.loc.start.line, kind: `process.${node.property.name}`, method: null, fn: fnName(parents), args: null })
            }
        }
    })
    return sites
}


/**
 * 盤點srcDir下全部.mjs之console參照
 * @param {String} srcDir 輸入src資料夾路徑
 * @returns {Object} 回傳{ files, parseFail, sites }
 */
function scanConsoleSites(srcDir) {
    let files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.mjs')).sort()
    let sites = []
    let parseFail = []
    for (let f of files) {
        try {
            sites.push(...scanCode(f, fs.readFileSync(path.join(srcDir, f), 'utf8')))
        }
        catch (err) {
            parseFail.push({ f, msg: err.message })
        }
    }
    return { files: files.length, parseFail, sites }
}


//FIXTURE, 自我檢查之夾具: 須抓到7處(第2~8行), 註解與字串內之字樣不算
const FIXTURE = [
    `console.log('a')`,
    `console['warn']('b')`,
    `let c = console`,
    `const { info } = console`,
    `globalThis.console.debug('d')`,
    `process.stderr.write('e')`,
    `let f = (0, console.error)`,
    `// console.log('comment')`,
    `let s = 'console.log("string")'`,
    `export default s`,
].join('\n')


/**
 * 以內建夾具驗證本工具(7種寫法皆抓到、註解與字串不算)
 * @returns {Boolean} 回傳是否通過
 */
function selfCheck() {
    let ss = scanCode('fixture.mjs', FIXTURE)
    let lines = ss.map((s) => s.line).join(',')
    return lines === '1,2,3,4,5,6,7'
}


export { scanConsoleSites, selfCheck }


//CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv[2] === '--selfcheck') {
        let ok = selfCheck()
        console.log(`selfcheck ${ok ? 'ok' : 'FAILED'}`)
        process.exitCode = ok ? 0 : 1
    }
    else {
        let r = scanConsoleSites(process.argv[2] || './src')
        console.log(`files=${r.files} parseFail=${r.parseFail.length} sites=${r.sites.length} filesWithSites=${new Set(r.sites.map((s) => s.f)).size}`)
        for (let s of r.sites) {
            console.log(`${s.f}:${s.line} [${s.kind}${s.method ? ' ' + s.method : ''}] fn=${s.fn} args=${s.args}`)
        }
    }
}
