//optReadScan.mjs: 以acorn解析原始碼(不計註解與字串內之字樣), 列出對設定物件之鍵之讀取站點(第663項, R-C1-HOSTILE-01之盤點)
//  direct: 對識別字opt(呼叫端傳入之設定物件)之直接讀取, 形如get(opt, 'k')、lodashGet(opt, 'k')、opt.k、opt['k']、opt?.k、let { k } = opt
//  keys: 對任一識別字之鍵讀取(get(X, 'k')、X.k、X['k']), 供找出「讀某鍵之檔」(含讀快照者)
//  不計: 把opt當引數傳出(pickOpt(opt, …)、diagIfAsked(opt, …)、f(a, opt))、預設參數(opt = {})、typeof opt
//  盲點(已知, 不抓): 先別名再讀(let o = opt; o.k)、以動態鍵讀取(opt[k], k為變數: 計為'*')之鍵名、eval與Function字串碼
import * as acorn from 'acorn'


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


let isId = (n, name) => n && n.type === 'Identifier' && (name === undefined || n.name === name)
let isGetName = (n) => n && n.type === 'Identifier' && /^(get|lodashGet)$/i.test(n.name)


//scanOptReads, 回傳{ direct: [{ key, line }], keys: [字串] }
function scanOptReads(code) {
    let ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true })
    let direct = []
    let keys = new Set()
    walk(ast, (n) => {

        //get(X, 'k', …)
        if (n.type === 'CallExpression' && isGetName(n.callee) && n.arguments.length >= 2 && n.arguments[0].type === 'Identifier') {
            let a1 = n.arguments[1]
            let k = (a1.type === 'Literal' && typeof a1.value === 'string') ? a1.value : '*'
            keys.add(k)
            if (n.arguments[0].name === 'opt') {
                direct.push({ key: k, line: n.loc.start.line })
            }
        }

        //X.k、X['k']、X[k]
        if (n.type === 'MemberExpression' && n.object.type === 'Identifier') {
            let k = '*'
            if (!n.computed && n.property.type === 'Identifier') {
                k = n.property.name
            }
            else if (n.computed && n.property.type === 'Literal' && typeof n.property.value === 'string') {
                k = n.property.value
            }
            keys.add(k)
            if (n.object.name === 'opt') {
                direct.push({ key: k, line: n.loc.start.line })
            }
        }

        //let { k } = X
        if (n.type === 'VariableDeclarator' && n.id.type === 'ObjectPattern' && isId(n.init)) {
            for (let p of n.id.properties) {
                let k = '*'
                if (p.type === 'Property' && !p.computed && p.key.type === 'Identifier') {
                    k = p.key.name
                }
                else if (p.type === 'Property' && p.key.type === 'Literal' && typeof p.key.value === 'string') {
                    k = p.key.value
                }
                keys.add(k)
                if (n.init.name === 'opt') {
                    direct.push({ key: k, line: n.loc.start.line })
                }
            }
        }
    })
    return { direct, keys: [...keys] }
}


//scanErrEcho, 列出「把錯誤值轉字串後原樣放入失敗回傳」之站點: retError(…)之引數內(含條件式、樣板字串內)有errToStr(…)之呼叫, 回傳[{ line }]
//  retError為本庫各轉換函數之失敗出口(狀態模式之msg); 呼叫端所拋出之文字(存取器、Proxy陷阱、toJSON等)不得經此轉出(V20, 第663項)
//  只計errToStr(可含呼叫端所拋之任意值); err.toString()之站點(其try內只有引擎對已驗證輸入之運算, 文字由引擎產生)不計
//  盲點(已知, 不抓): 先存入變數再傳入(let s = errToStr(err); retError(s))、經別名函數傳入
function scanErrEcho(code) {
    let ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true })
    let hits = []
    walk(ast, (n) => {
        if (n.type === 'CallExpression' && isId(n.callee, 'retError')) {
            for (let a of n.arguments) {
                walk(a, (m) => {
                    if (m.type !== 'CallExpression') {
                        return
                    }
                    let c = m.callee
                    if (isId(c, 'errToStr')) {
                        hits.push({ line: m.loc.start.line })
                    }
                })
            }
        }
    })
    return hits
}


export { scanOptReads, scanErrEcho }
