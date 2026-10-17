import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { findBigIntLiterals } from './tools/bigintLiteralScan.mjs'


//src/內程式碼位置不得有BigInt字面值(如1n): 發布時jsdoc 4.0.5(script.txt第4列, 只掃src/)把它讀成真BigInt再JSON.stringify,
//拋TypeError: Do not know how to serialize a BigInt 而使文件產製與發布中止(2026-10-17 src/_cvOrmFindCases.mjs 首次觸發, R-FIND-01).
//需要BigInt值時寫BigInt(1); 註解與字串內之文字不受影響. 註: jsdoc之-X模式不會觸發, 須以實際設定產文件才會


let dirSrc = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')

let listFiles = (dir) => {
    let out = []
    for (let ent of fs.readdirSync(dir, { withFileTypes: true })) {
        let fp = path.join(dir, ent.name)
        if (ent.isDirectory()) {
            out.push(...listFiles(fp))
        }
        else if (/\.(mjs|js)$/.test(ent.name)) {
            out.push(fp)
        }
    }
    return out
}


describe('src內不得有BigInt字面值(jsdoc發布會中止)', function() {

    it('should detect BigInt literals in code positions only (not in comments, strings, template strings, or BigInt() calls)', function() {
        assert.deepStrictEqual(findBigIntLiterals('let a = 1n'), [1])
        assert.deepStrictEqual(findBigIntLiterals('let f = () => ({ x: [10n] })\nlet g = () => 0xffn'), [1, 2])
        assert.deepStrictEqual(findBigIntLiterals('export default { a: 1n, b: -2n }'), [1, 1])
        assert.deepStrictEqual(findBigIntLiterals('let s = `' + '$' + '{3n}`'), [1])
        assert.deepStrictEqual(findBigIntLiterals('// 1n\n/* 2n */\nlet a = \'3n\'\nlet b = "4n"\nlet c = `5n`\nlet d = BigInt(6)\nlet e = BigInt(\'7\')\nlet f = 1\nlet n = 1 // 1n'), [])
        assert.deepStrictEqual(findBigIntLiterals('/** @example\n * let x = 1n\n */\nfunction f() {}'), [])
        assert.deepStrictEqual(findBigIntLiterals('let re = /1n/\nlet o = { n1: 1, n: 2 }'), [])
    })

    it('should find no BigInt literal in any code of src/', function() {
        let files = listFiles(dirSrc)
        assert.ok(files.length > 400, String(files.length))
        let found = []
        let bad = []
        for (let fp of files) {
            try {
                for (let line of findBigIntLiterals(fs.readFileSync(fp, 'utf8'))) {
                    found.push(`${path.relative(dirSrc, fp)}:${line}`)
                }
            }
            catch (err) {
                bad.push(`${path.relative(dirSrc, fp)}: ${err.message}`)
            }
        }
        assert.deepStrictEqual(bad, [], 'files that could not be parsed')
        assert.deepStrictEqual(found, [], 'BigInt literals in src (use BigInt(n); jsdoc stops on them)')
    })

})
