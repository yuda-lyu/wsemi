//cpHideScan.mjs: 以acorn解析原始碼, 列出對child_process之各函數(spawn、spawnSync、exec、execSync、execFile、execFileSync、fork)之呼叫及其選項是否帶windowsHide: true(第681項)
//  對象: 由'child_process'或'node:child_process'匯入之具名(import { spawn })與預設(import cp)之呼叫; 不含注入之函數(如Core檔之參數spawn)與.exec(正規式之exec)
//  選項判定: 呼叫之引數中有物件字面值且含鍵windowsHide、值為字面值true者為已帶; 物件含展開(...x)或選項非物件字面值者為'dynamic'(無法靜態判定)
//  盲點(已知, 不抓): 先別名再呼叫(let f = cp.spawn; f(...))、動態鍵(cp[name])、以注入取得之函數、eval與Function字串碼
import * as acorn from 'acorn'


let FUNS = new Set(['spawn', 'spawnSync', 'exec', 'execSync', 'execFile', 'execFileSync', 'fork'])


function walk(node, fn) {
    if (!node || typeof node.type !== 'string') {
        return
    }
    fn(node)
    for (let k of Object.keys(node)) {
        let v = node[k]
        if (Array.isArray(v)) {
            for (let x of v) {
                walk(x, fn)
            }
        }
        else if (v && typeof v === 'object' && typeof v.type === 'string') {
            walk(v, fn)
        }
    }
}


//scanCpHide, 回傳[{ fn, line, hide: 'yes'|'no'|'dynamic' }]
function scanCpHide(code) {
    let ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true })
    let named = new Map() //本地名稱 → 原函數名
    let defaults = new Set() //預設匯入之本地名稱(cp)
    let namespaces = new Set() //import * as cp
    for (let n of ast.body) {
        if (n.type === 'ImportDeclaration' && (n.source.value === 'child_process' || n.source.value === 'node:child_process')) {
            for (let s of n.specifiers) {
                if (s.type === 'ImportSpecifier' && FUNS.has(s.imported.name)) {
                    named.set(s.local.name, s.imported.name)
                }
                else if (s.type === 'ImportDefaultSpecifier') {
                    defaults.add(s.local.name)
                }
                else if (s.type === 'ImportNamespaceSpecifier') {
                    namespaces.add(s.local.name)
                }
            }
        }
    }
    let hits = []
    walk(ast, (n) => {
        if (n.type !== 'CallExpression') {
            return
        }
        let fn = null
        let c = n.callee
        if (c.type === 'Identifier' && named.has(c.name)) {
            fn = named.get(c.name)
        }
        else if (c.type === 'MemberExpression' && !c.computed && c.object.type === 'Identifier' && (defaults.has(c.object.name) || namespaces.has(c.object.name)) && c.property.type === 'Identifier' && FUNS.has(c.property.name)) {
            fn = c.property.name
        }
        if (fn === null) {
            return
        }
        let hide = 'no'
        for (let a of n.arguments) {
            if (a.type === 'ObjectExpression') {
                let has = a.properties.some((p) => p.type === 'Property' && !p.computed && ((p.key.type === 'Identifier' && p.key.name === 'windowsHide') || (p.key.type === 'Literal' && p.key.value === 'windowsHide')) && p.value.type === 'Literal' && p.value.value === true)
                let spread = a.properties.some((p) => p.type === 'SpreadElement')
                if (has) {
                    hide = 'yes'
                }
                else if (spread && hide !== 'yes') {
                    hide = 'dynamic'
                }
            }
            else if (a.type === 'Identifier' && hide === 'no' && a.name !== 'undefined' && /opt|option/i.test(a.name)) {
                hide = 'dynamic'
            }
        }
        hits.push({ fn, line: n.loc.start.line, hide })
    })
    return hits
}


export { scanCpHide }
