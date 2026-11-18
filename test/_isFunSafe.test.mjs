import assert from 'assert'
import isfun from '../src/isfun.mjs'
import isFunSafe from '../src/_isFunSafe.mjs'
import { nonFunValues, revokedFn } from './tools/caseKit.mjs'


describe(`_isFunSafe(內部: 計時與流程函數之函數參數判定, dspec §11 W-15)`, function() {

    it(`函數(一般、箭頭、async、generator、class)為true, 與isfun一致`, function() {
        class C {}
        for (let f of [function() {}, () => {}, async () => {}, function* () {}, C, Math.max]) {
            assert.strict.deepStrictEqual([isFunSafe(f), isfun(f)], [true, true])
        }
    })

    it(`非函數(12值)為false: async generator函數同isfun為false; isfun拋錯之已撤銷Proxy(物件與函數)亦為false, 不外拋`, function() {
        //JSDoc「判定拋錯視為非函數」; 前提: 已撤銷之函數Proxy使isfun拋TypeError(若此前提不成立, 此案應先失敗, 避免下方之false只是isfun本身回false)
        assert.strict.throws(() => isfun(revokedFn()), TypeError)
        for (let [k, v] of nonFunValues()) {
            assert.strict.deepStrictEqual([k, isFunSafe(v)], [k, false])
        }
    })

    it(`回傳值恆為布林值(不回傳truthy之其他值)`, function() {
        for (let v of [function() {}, undefined, null, 0, 'a', {}, []]) {
            assert.strict.deepStrictEqual(typeof isFunSafe(v), 'boolean')
        }
    })

})
