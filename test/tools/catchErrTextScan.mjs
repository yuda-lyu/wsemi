//catchErrTextScan.mjs: 以acorn解析原始碼(不計註解與字串內之字樣), 列出catch子句內把捕捉到之錯誤值轉成文字之站點(第676項, R-CATCH-TEXT-01之盤點)
//  形狀(皆以catch之參數名為對象): err.toString()、String(err)、`${err}`(樣板字串嵌入)、err.message、err + '字串'(字串串接)
//  不計: 把err當引數傳出(diagIfAsked(opt, label, err)、errToStr(err)、getErrorMessage(err)、fsErrMsg(err))、err instanceof、err.code等其他屬性之讀取、
//        catch參數為解構者
//  盲點(已知, 不抓): 先別名再轉(let e2 = err; e2.toString())、經呼叫端函數轉換(f(err)內部再轉文字)、以動態鍵讀取(err[k])、eval與Function字串碼、.vue檔(src無)
import * as acorn from 'acorn'


function walk(node, fn, parents = []) {
    if (!node || typeof node.type !== 'string') {
        return
    }
    fn(node, parents)
    parents = [...parents, node]
    for (let k of Object.keys(node)) {
        let v = node[k]
        if (Array.isArray(v)) {
            for (let x of v) {
                walk(x, fn, parents)
            }
        }
        else if (v && typeof v === 'object' && typeof v.type === 'string') {
            walk(v, fn, parents)
        }
    }
}


//scanCatchErrText, 回傳[{ kind, line }]
function scanCatchErrText(code) {
    let ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true })
    let hits = []
    walk(ast, (n) => {
        if (n.type !== 'CatchClause' || !n.param || n.param.type !== 'Identifier') {
            return
        }
        let p = n.param.name
        let isP = (x) => x && x.type === 'Identifier' && x.name === p
        walk(n.body, (m) => {

            //p.toString()、p.message(非呼叫亦計: 讀取即轉出)
            if (m.type === 'MemberExpression' && isP(m.object)) {
                let key = !m.computed && m.property.type === 'Identifier' ? m.property.name : (m.computed && m.property.type === 'Literal' ? String(m.property.value) : '*')
                if (key === 'toString' || key === 'message') {
                    hits.push({ kind: `.${key}`, line: m.loc.start.line })
                }
            }

            //String(p)
            if (m.type === 'CallExpression' && m.callee.type === 'Identifier' && m.callee.name === 'String' && m.arguments.length >= 1 && isP(m.arguments[0])) {
                hits.push({ kind: 'String()', line: m.loc.start.line })
            }

            //`${p}`
            if (m.type === 'TemplateLiteral' && m.expressions.some(isP)) {
                hits.push({ kind: 'template', line: m.loc.start.line })
            }

            //p + x、x + p
            if (m.type === 'BinaryExpression' && m.operator === '+' && (isP(m.left) || isP(m.right))) {
                hits.push({ kind: 'concat', line: m.loc.start.line })
            }
        })
    })
    return hits
}


export { scanCatchErrText }
