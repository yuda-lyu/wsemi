//rangeParamKit.mjs: 隨機系範圍參數(vstart、vend)之表驅動測試建構器(ws426)
//  依據: dspec〈輸入參數之檢測機制〉§11 Q1-b(使用者2026-11-12定: C10隨機範圍無效即同步拋錯, 如randomIntRange('a', 2)不再回0)、K4(檢測之值即使用之值)、K9(訊息不帶值)、§6 V19
//  規則: undefined、null視為未給 → 預設; 有給而非有效 → throw Error(`invalid <name>: must be <desc>`)且訊息不含輸入值; 有效 → 轉換值
//  同一helper只定義一次; 各測試檔以defineRangeParam逐參數宣告, probe回傳「實際採用之值」或'ERR:<訊息>'
import assert from 'assert'
import { INVALID } from './enumInputs.mjs'


//defineRangeParam, spec: { fn: 函數名, name: 參數名, def: 預設, desc: 種類描述(如'an integer'), probe: (v) => 採用值或'ERR:訊息', valid: [[標籤, 值, 期望]], invalid: 無效清單(預設INVALID), extraInvalid: 另加之無效 }
function defineRangeParam(spec) {
    let { fn, name, def, desc, probe } = spec
    let invalid = [...(spec.invalid || INVALID), ...(spec.extraInvalid || [])].filter(([, v]) => v !== undefined && v !== null)
    let valid = [...(spec.valid || [])]
    let msg = `invalid ${name}: must be ${desc}`

    describe(`range param ${fn} ${name}`, function() {

        it(`should use the default ${def} when not given (undefined, null)`, function() {
            // §1 未給: 範圍參數有預設(JSDoc [${name}=${def}]), undefined與null視為未給
            assert.strict.deepStrictEqual(probe(undefined), def)
            assert.strict.deepStrictEqual(probe(null), def)
        })

        for (let [label, v] of invalid) {
            it(`should throw "${msg}" for the invalid input ${label} (formerly the default was used)`, function() {
                // Q1-b(2026-11-12): 範圍無效即同步拋錯; K9: 訊息為固定詞彙, 不含輸入值
                assert.strict.deepStrictEqual(probe(v), `ERR:${msg}`)
            })
        }

        for (let [label, v, exp] of valid) {
            it(`should use the value for the valid input ${label}`, function() {
                // K4: 檢測之值即使用之值
                assert.strict.deepStrictEqual(probe(v), exp)
            })
        }

    })
}


export { defineRangeParam }
