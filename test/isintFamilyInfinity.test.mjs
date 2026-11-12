import assert from 'assert'
import isint from '../src/isint.mjs'
import ispint from '../src/ispint.mjs'
import isp0int from '../src/isp0int.mjs'
import isnint from '../src/isnint.mjs'
import isn0int from '../src/isn0int.mjs'
import iseint from '../src/iseint.mjs'


//Q1-h(使用者2026-11-12定): is*依數學定義判斷, Infinity為整數(行為不改); 要判可用、可計算之整數用iseint
//本檔鎖定isint家族JSDoc所載之主張, 與iseint之對照
describe(`isint family: Infinity and '0x10' by mathematical definition(Q1-h)`, function() {

    it(`isint(±Infinity) should be true [isint JSDoc「isint(Infinity)、isint(-Infinity)為true」]`, function() {
        assert.strict.deepStrictEqual([isint(Infinity), isint(-Infinity)], [true, true])
    })

    it(`ispint(Infinity) and ispint('0x10') should be true [ispint JSDoc]`, function() {
        assert.strict.deepStrictEqual([ispint(Infinity), ispint('0x10')], [true, true])
    })

    it(`isp0int(Infinity) and isp0int('0x10') should be true [isp0int JSDoc]`, function() {
        assert.strict.deepStrictEqual([isp0int(Infinity), isp0int('0x10')], [true, true])
    })

    it(`isnint(-Infinity) should be true [isnint JSDoc]`, function() {
        assert.strict.deepStrictEqual(isnint(-Infinity), true)
    })

    it(`isn0int(-Infinity) should be true [isn0int JSDoc]`, function() {
        assert.strict.deepStrictEqual(isn0int(-Infinity), true)
    })

    it(`iseint should be false for ±Infinity and '0x10' [JSDoc「要判可用、可計算之整數用iseint」]`, function() {
        assert.strict.deepStrictEqual([iseint(Infinity), iseint(-Infinity), iseint('0x10')], [false, false, false])
    })

})
