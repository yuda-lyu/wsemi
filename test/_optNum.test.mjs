import assert from 'assert'
import optNum from '../src/_optNum.mjs'


describe(`_optNum`, function() {

    let MAX = 2147483647

    it(`should return a finite number as is`, function() {
        assert.strict.deepStrictEqual(optNum({ a: 12 }, 'a', 5), 12)
        assert.strict.deepStrictEqual(optNum({ a: 1.5 }, 'a', 5), 1.5)
        assert.strict.deepStrictEqual(optNum({ a: -2 }, 'a', 5), -2)
        assert.strict.deepStrictEqual(optNum({ a: 0 }, 'a', 5), 0)
        assert.strict.deepStrictEqual(optNum({ a: new Number(3) }, 'a', 5), 3) // eslint-disable-line no-new-wrappers
    })

    it(`should convert a numeric string to a number before checking it`, function() {
        //外部資料常為字串型數字(網頁輸入、表格轉存、前後端傳遞): 先轉為數字再判定, 浮點數與整數皆同
        assert.strict.deepStrictEqual(optNum({ a: '12.34' }, 'a', 5), 12.34)
        assert.strict.deepStrictEqual(optNum({ a: '5' }, 'a', 1), 5)
        assert.strict.deepStrictEqual(optNum({ a: '-1.25' }, 'a', 5), -1.25)
        assert.strict.deepStrictEqual(optNum({ a: ' 7 ' }, 'a', 5), 7) //網頁輸入常帶前後空白
        assert.strict.deepStrictEqual(optNum({ a: '0' }, 'a', 5), 0)
        assert.strict.deepStrictEqual(optNum({ a: '1e3' }, 'a', 5), 1000)
        assert.strict.deepStrictEqual(optNum({ a: '5' }, 'a', 1, { int: true, min: 0, minOpen: true }), 5)
        assert.strict.deepStrictEqual(optNum({ a: '0.4' }, 'a', 1, { min: 0 }), 0.4)
    })

    it(`should return the default for a missing key, an empty or blank string, a non numeric string, null, a boolean or NaN`, function() {
        //空字串與純空白字串視為未給(isnum會將純空白視為0, 如未填之網頁輸入)
        for (let v of [undefined, null, '', ' ', '\t', '\n', 'abc', '5px', '1,000', true, false, {}, [], () => 1, NaN]) {
            assert.strict.deepStrictEqual(optNum({ a: v }, 'a', 5), 5, JSON.stringify(String(v)))
        }
        assert.strict.deepStrictEqual(optNum({}, 'a', 5), 5)
        assert.strict.deepStrictEqual(optNum(null, 'a', 5), 5)
        assert.strict.deepStrictEqual(optNum(undefined, 'a', 5), 5)
    })

    it(`should treat +Infinity by intent: clamp a timer, keep it with inf keep, otherwise the default`, function() {
        //不經cdbl(其把Infinity轉為有限之MAX_VALUE): 計時器之+Infinity夾至上限(同delay), 容許誤差類保留, 其餘用預設
        for (let v of [Infinity, 'Infinity', '1e309']) {
            assert.strict.deepStrictEqual(optNum({ a: v }, 'a', 5, { timer: true }), MAX, `timer ${v}`)
            assert.strict.deepStrictEqual(optNum({ a: v }, 'a', 5, { min: 0, inf: 'keep' }), Infinity, `keep ${v}`)
            assert.strict.deepStrictEqual(optNum({ a: v }, 'a', 5, { min: 0, int: true, inf: 'keep' }), Infinity, `keep int ${v}`)
            assert.strict.deepStrictEqual(optNum({ a: v }, 'a', 5), 5, `def ${v}`)
        }
    })

    it(`should treat -Infinity as below any bound`, function() {
        assert.strict.deepStrictEqual(optNum({ a: -Infinity }, 'a', 5), 5)
        assert.strict.deepStrictEqual(optNum({ a: '-Infinity' }, 'a', 5, { timer: true }), 5)
        assert.strict.deepStrictEqual(optNum({ a: -Infinity }, 'a', 5, { min: 0, inf: 'keep' }), 5)
        assert.strict.deepStrictEqual(optNum({ a: -Infinity }, 'a', 5, { min: 0, below: 'clamp', timer: true }), 0)
    })

    it(`should apply the lower bound, open or closed, using the default or clamping below it`, function() {
        assert.strict.deepStrictEqual(optNum({ a: 0 }, 'a', 5, { min: 0 }), 0)
        assert.strict.deepStrictEqual(optNum({ a: -0.1 }, 'a', 5, { min: 0 }), 5)
        assert.strict.deepStrictEqual(optNum({ a: 0 }, 'a', 5, { min: 0, minOpen: true }), 5)
        assert.strict.deepStrictEqual(optNum({ a: 0.1 }, 'a', 5, { min: 0, minOpen: true }), 0.1)
        assert.strict.deepStrictEqual(optNum({ a: '-1' }, 'a', 5, { min: 0 }), 5)
        assert.strict.deepStrictEqual(optNum({ a: -5 }, 'a', 5, { min: 0, below: 'clamp' }), 0)
        assert.strict.deepStrictEqual(optNum({ a: '-5' }, 'a', 5, { min: 0, below: 'clamp' }), 0)
        assert.strict.deepStrictEqual(optNum({ a: -5 }, 'a', 5, { min: 0, minOpen: true, below: 'clamp' }), 5)
        assert.strict.deepStrictEqual(optNum({ a: NaN }, 'a', 5, { min: 0, below: 'clamp' }), 5) //NaN非低於下界, 用預設而非夾至下界
        assert.strict.deepStrictEqual(optNum({ a: ' ' }, 'a', 5, { min: 0, below: 'clamp' }), 5) //純空白視為未給, 用預設而非0
    })

    it(`should require an integer when int is set`, function() {
        assert.strict.deepStrictEqual(optNum({ a: 20 }, 'a', 5, { int: true }), 20)
        assert.strict.deepStrictEqual(optNum({ a: '20' }, 'a', 5, { int: true }), 20)
        assert.strict.deepStrictEqual(optNum({ a: '20.0' }, 'a', 5, { int: true }), 20)
        assert.strict.deepStrictEqual(optNum({ a: 20.5 }, 'a', 5, { int: true }), 5)
        assert.strict.deepStrictEqual(optNum({ a: '12.34' }, 'a', 5, { int: true }), 5)
    })

    it(`should clamp a timer value to the timer limit instead of treating it as invalid`, function() {
        //_const.mjs: 超大毫秒之意圖為「很久」, 夾至2^31-1
        assert.strict.deepStrictEqual(optNum({ a: 2 ** 31 }, 'a', 5, { timer: true }), MAX)
        assert.strict.deepStrictEqual(optNum({ a: 2 ** 53 + 2 }, 'a', 5, { int: true, timer: true }), MAX)
        assert.strict.deepStrictEqual(optNum({ a: '1e20' }, 'a', 5, { timer: true }), MAX)
        assert.strict.deepStrictEqual(optNum({ a: MAX }, 'a', 5, { timer: true }), MAX)
        assert.strict.deepStrictEqual(optNum({ a: '50' }, 'a', 5, { timer: true }), 50)
        assert.strict.deepStrictEqual(optNum({ a: 2 ** 31 }, 'a', 5), 2 ** 31)
    })

})
