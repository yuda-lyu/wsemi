//bigintLiteralScan.mjs: 找出原始碼中「程式碼位置」之BigInt字面值(如1n), 註解與字串內之文字不計
//  原因: 發布時(script.txt第4列 jsdoc -c .jsdoc)jsdoc 4.0.5 以estree剖析, 把BigInt字面值讀成真BigInt後JSON.stringify而拋
//  TypeError: Do not know how to serialize a BigInt(node_modules/jsdoc/lib/jsdoc/src/astnode.js), 使文件產製與發布中止; jsdoc只掃src/
//  以jsdoc同一個剖析器(@babel/parser, estree外掛)取AST, 不以正規式去註解(去不乾淨字串與樣板字串內之文字)
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
    plugins: ['estree'], //與jsdoc相同: BigInt字面值成為value為bigint之Literal節點
}

let walk = (node, lines) => {
    if (node === null || typeof node !== 'object') {
        return
    }
    if (Array.isArray(node)) {
        for (let x of node) {
            walk(x, lines)
        }
        return
    }
    if (node.type === 'Literal' && typeof node.value === 'bigint') {
        lines.push(node.loc.start.line)
    }
    for (let k of Object.keys(node)) {
        if (k === 'loc' || k === 'range' || k === 'comments' || k === 'tokens') {
            continue
        }
        walk(node[k], lines)
    }
}

/**
 * 回傳原始碼中程式碼位置之BigInt字面值所在行號(1起算)陣列, 剖析失敗時拋錯
 *
 * @param {String} source 輸入原始碼字串
 * @returns {Array} 回傳行號陣列
 */
function findBigIntLiterals(source) {
    let ast = parse(source, opts)
    let lines = []
    walk(ast.program, lines)
    return lines
}


export { findBigIntLiterals }
