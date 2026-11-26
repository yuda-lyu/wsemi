import assert from 'assert'
import path from 'path'
import { scanCode, scanDir } from './tools/judgeSourceScan.mjs'


//R-JUDGE-SOURCE-01(sgud/rule/rulebook_data.md; 排程第599項③補守門): src/內判斷布林與函數只經isbol/isfun,
//  除src/isfun.mjs(委派lodash之isFunction)外不得取得lodash之isFunction, isBoolean無例外
//  掃描器以AST判定(test/tools/judgeSourceScan.mjs), 不計註解與字串; 允許之站點以各檔數釘住(新增或消失皆失敗)
//  變異驗證: 環境變數WSEMI_JUDGE_SRC指向另一資料夾時改掃該處


let SRC = process.env.WSEMI_JUDGE_SRC ? path.resolve(process.env.WSEMI_JUDGE_SRC) : path.resolve(import.meta.dirname, '..', 'src')

//ALLOWED, 允許之站點: 檔名 → 站點名稱之陣列
let ALLOWED = {
    'isfun.mjs': ['isFunction'],
}


describe(`R-JUDGE-SOURCE-01 lodash isFunction/isBoolean 之取得只在src/isfun.mjs`, function() {

    it(`scanner self-test: every known form of obtaining them is found, and comments, strings and other lodash functions are not`, function() {
        let pos = [
            [`import isFunction from 'lodash-es/isFunction.js'`, ['isFunction']],
            [`import isBoolean from 'lodash-es/isBoolean.js'`, ['isBoolean']],
            [`import f from 'lodash-es/isFunction'`, ['isFunction']],
            [`import f from 'lodash/isBoolean.js'`, ['isBoolean']],
            [`import { isFunction } from 'lodash-es'`, ['isFunction']],
            [`import { isBoolean as b, map } from 'lodash'`, ['isBoolean']],
            [`import { 'isFunction' as f } from 'lodash-es'`, ['isFunction']],
            [`import * as _ from 'lodash-es'`, ['*']],
            [`import _ from 'lodash'`, ['*']],
            [`import _ from 'lodash-es/lodash.js'`, ['*']],
            [`export { isFunction } from 'lodash-es'`, ['isFunction']],
            [`export { default as f } from 'lodash-es/isFunction.js'`, ['isFunction']],
            [`export * from 'lodash-es'`, ['*']],
            [`let m = await import('lodash-es/isBoolean.js')`, ['isBoolean']],
            ['let m = import(`lodash-es/isFunction.js`)', ['isFunction']],
            //獨立複審(wsr1)指出之盲點: 彙整模組lang與default、獨立套件、require類呼叫
            [`import { isFunction } from 'lodash-es/lang.js'`, ['isFunction']],
            [`import { isBoolean } from 'lodash-es/lodash.default.js'`, ['isBoolean']],
            [`import lang from 'lodash-es/lang.default.js'`, ['*']],
            [`import { isFunction } from 'lodash/lang'`, ['isFunction']],
            [`import isFunction from 'lodash.isfunction'`, ['isFunction']],
            [`import b from 'lodash.isBoolean'`, ['isBoolean']],
            [`let f = require('lodash/isFunction')`, ['isFunction']],
            [`let req = createRequire(import.meta.url); let f = req('lodash-es/isBoolean.js')`, ['isBoolean']],
            [`let r; r = createRequire(import.meta.url); let g = r('lodash-es/isFunction.js')`, ['isFunction']],
            [`let myRequire = makeIt(); let f = myRequire('lodash-es/isBoolean.js')`, ['isBoolean']],
            [`let f = createRequire(import.meta.url)('lodash')`, ['*']],
        ]
        for (let [code, exp] of pos) {
            assert.strict.deepStrictEqual(scanCode(code).map((x) => x.name), exp, code)
        }
        let neg = [
            `import isNumber from 'lodash-es/isNumber.js'`,
            `import { map, isString } from 'lodash-es'`,
            `//import isFunction from 'lodash-es/isFunction.js'`,
            `/** import isBoolean from 'lodash-es/isBoolean.js' */ let a = 1`,
            `let s = "import isFunction from 'lodash-es/isFunction.js'"`,
            `import isfun from './isfun.mjs'`,
            `import 'lodash-es/isFunction.js'`,
            `import { isString } from 'lodash-es/lang.js'`,
            `let f = require('lodash/isNumber')`,
            `let s = 'lodash-es/' + 'isFunction.js'`,
        ]
        for (let code of neg) {
            assert.strict.deepStrictEqual(scanCode(code), [], code)
        }
    })

    it(`src/ should obtain lodash isFunction only in isfun.mjs (pinned per file) and isBoolean nowhere`, function() {
        let r = scanDir(SRC)
        assert.ok(r.nFiles >= 500, `scanned files should cover src (got ${r.nFiles})`) //範圍壞了時(0檔或明顯偏少)不得採信空結果
        let got = {}
        for (let [f, ss] of Object.entries(r.sites)) {
            got[f] = ss.map((x) => x.name)
        }
        assert.strict.deepStrictEqual(got, ALLOWED)
    })

})
