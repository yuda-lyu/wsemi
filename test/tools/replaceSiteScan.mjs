//replaceSiteScan.mjs: 找出原始碼「程式碼位置」之 String.prototype.replace / replaceAll 呼叫站點, 並依其取代值(第2引數)分類(R-REPLACE-LITERAL-01)
//  原因: replace/replaceAll 之取代字串會展開 $&、$'、$`、$$、$<name>、$1…; 取代值來自呼叫端或外部輸入而本意為字面文字時, 含 $ 即寫出錯誤結果.
//  以 AST 取站點(註解與字串內之文字不計), 剖析器與 bigintLiteralScan.mjs 相同(@babel/parser, estree外掛)
//  分類(kind):
//    'lit'        取代值為不含 $ 之字串字面值(含無內插之樣板字串、字串字面值相加)
//    'dollar-lit' 取代值為含 $ 之字串字面值(刻意之 $ 樣式, 須列入帳本)
//    'fn'         取代值為函式(其回傳值不展開 $ 樣式)
//    'dynamic'    其餘(變數、參數、有內插之樣板字串、函式呼叫回傳值等): 取代值可能含 $ 而被展開, 須改為函式回傳
//    'noarg'      少於2個引數
import { createRequire } from 'module'


let req = createRequire(import.meta.url)
let { parse } = req('@babel/parser')

let opts = {
    sourceType: 'module',
    allowAwaitOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowSuperOutsideMethod: true,
    allowUndeclaredExports: true,
    plugins: ['estree'],
}

let METHODS = ['replace', 'replaceAll']

//字串字面值(含無內插樣板字串、字串字面值相加)之值, 非此類回傳null
let litValue = (n) => {
    if (n === null || typeof n !== 'object') {
        return null
    }
    if (n.type === 'Literal' && typeof n.value === 'string') {
        return n.value
    }
    if (n.type === 'TemplateLiteral' && n.expressions.length === 0 && n.quasis.length === 1) {
        return n.quasis[0].value.cooked
    }
    if (n.type === 'BinaryExpression' && n.operator === '+') {
        let a = litValue(n.left)
        let b = litValue(n.right)
        if (a !== null && b !== null) {
            return a + b
        }
    }
    return null
}

let methodName = (callee) => {
    if (callee === null || typeof callee !== 'object' || callee.type !== 'MemberExpression') {
        return ''
    }
    let p = callee.property
    if (!callee.computed && p.type === 'Identifier') {
        return p.name
    }
    if (callee.computed) {
        let v = litValue(p)
        return v === null ? '' : v
    }
    return ''
}

let walk = (node, out) => {
    if (node === null || typeof node !== 'object') {
        return
    }
    if (Array.isArray(node)) {
        for (let x of node) {
            walk(x, out)
        }
        return
    }
    if (node.type === 'CallExpression') {
        let m = methodName(node.callee)
        if (METHODS.includes(m)) {
            let a = node.arguments[1]
            let kind = 'noarg'
            let text = ''
            if (a) {
                let v = litValue(a)
                if (v !== null) {
                    kind = v.includes('$') ? 'dollar-lit' : 'lit'
                    text = v
                }
                else if (a.type === 'ArrowFunctionExpression' || a.type === 'FunctionExpression') {
                    kind = 'fn'
                }
                else {
                    kind = 'dynamic'
                }
            }
            out.push({ line: node.loc.start.line, method: m, kind, text })
        }
    }
    for (let k of Object.keys(node)) {
        if (k === 'loc' || k === 'range' || k === 'comments' || k === 'tokens') {
            continue
        }
        walk(node[k], out)
    }
}

//scanReplaceSites(source) -> [{ line, method, kind, text }]
function scanReplaceSites(source) {
    let ast = parse(source, opts)
    let out = []
    walk(ast.program, out)
    return out
}


export { scanReplaceSites }
