import assert from 'assert'
import sepInt from '../src/sepInt.mjs'


//ws286b: v、n為必須參數, 無效改拋錯(原回[]); breverse無效改用預設true(原回[]); 使用者2026-11-02逐列確認
//  規格: dspec〈輸入參數之檢測機制〉§5.1(同步之數值計算throw Error)、V19(訊息格式)、V20(不回顯輸入值)
//  訊息: v為安全整數 'invalid v: must be an integer'; n為切分數量1~4294967295 'invalid n: must be a positive integer'; 檢測順序v、n
describe(`sepInt`, function() {

    const MSG_V = 'invalid v: must be an integer'
    const MSG_N = 'invalid n: must be a positive integer'

    it(`should return [3, 3, 4] when input 10, 3`, function() {
        let r = sepInt(10, 3)
        assert.strict.deepStrictEqual(r, [3, 3, 4])
    })

    it(`should return [-4, -3, -3] when input -10, 3`, function() {
        let r = sepInt(-10, 3)
        assert.strict.deepStrictEqual(r, [-4, -3, -3])
    })

    it(`should throw ${MSG_N} when input 10, 0`, function() {
        assert.throws(() => sepInt(10, 0), { message: MSG_N })
    })

    it(`should throw ${MSG_N} when input 10, '', [], {}, null, undefined`, function() {
        assert.throws(() => sepInt(10, ''), { message: MSG_N })
        assert.throws(() => sepInt(10, []), { message: MSG_N })
        assert.throws(() => sepInt(10, {}), { message: MSG_N })
        assert.throws(() => sepInt(10, null), { message: MSG_N })
        assert.throws(() => sepInt(10, undefined), { message: MSG_N })
        assert.throws(() => sepInt(10), { message: MSG_N })
    })

    it(`should throw ${MSG_V} when v is '', [], {}, null, undefined, NaN or not given`, function() {
        assert.throws(() => sepInt(''), { message: MSG_V })
        assert.throws(() => sepInt([]), { message: MSG_V })
        assert.throws(() => sepInt({}), { message: MSG_V })
        assert.throws(() => sepInt(null), { message: MSG_V })
        assert.throws(() => sepInt(undefined), { message: MSG_V })
        assert.throws(() => sepInt(NaN), { message: MSG_V })
        assert.throws(() => sepInt(), { message: MSG_V })
    })

    //第221項已知缺陷先修(ws270): v、n為必須參數, 改iseint(v)、iseint(n, { use: 'count', min: 1 }), 通過後以Number()取值再計算
    //  n為Infinity等使迴圈不終止之輸入於intInputHang.test.mjs(子行程加逾時)驗

    describe(`valid numeric strings (iseint: trimmed, converted by Number())`, function() {

        for (let [label, v, n, rr] of [
            [`'10', '3'`, '10', '3', [3, 3, 4]],
            [`' 10 ', ' 3 '`, ' 10 ', ' 3 ', [3, 3, 4]],
            [`'+10.', '3.0'`, '+10.', '3.0', [3, 3, 4]],
            [`'1e2', 3`, '1e2', 3, [33, 33, 34]],
            [`10, '1e0'`, 10, '1e0', [10]],
            [`'-10', '3'`, '-10', '3', [-4, -3, -3]],
            [`0, 3`, 0, 3, [0, 0, 0]],
            [`10, 1`, 10, 1, [10]],
            [`2, 5 (v < n)`, 2, 5, [0, 0, 0, 1, 1]],
        ]) {
            it(`should return ${JSON.stringify(rr)} when input ${label}`, function() {
                assert.strict.deepStrictEqual(sepInt(v, n), rr)
            })
        }

        it(`should accept the ends of the safe integer range for v (n = 1)`, function() {
            assert.strict.deepStrictEqual(sepInt(9007199254740991, 1), [9007199254740991])
            assert.strict.deepStrictEqual(sepInt(-9007199254740991, 1), [-9007199254740991])
            assert.strict.deepStrictEqual(sepInt('9007199254740991', '1'), [9007199254740991])
        })

        it(`should keep the order switch with breverse`, function() {
            assert.strict.deepStrictEqual(sepInt('10', '3', false), [4, 3, 3])
            assert.strict.deepStrictEqual(sepInt('10', '3', true), [3, 3, 4])
            assert.strict.deepStrictEqual(sepInt(10, 3, false), [4, 3, 3])
            assert.strict.deepStrictEqual(sepInt(10, 3), [3, 3, 4])
        })

    })

    //breverse無效改用預設true(原回[]): sepInt(10, 3, 'x') -> [3, 3, 4]; 未給(undefined)同預設
    describe(`invalid breverse (not boolean) should use the default true`, function() {

        for (let [label, b] of [
            [`'x'`, 'x'],
            [`'false'`, 'false'],
            [`'true'`, 'true'],
            ['null', null],
            ['undefined', undefined],
            ['0', 0],
            ['1', 1],
            [`''`, ''],
            ['NaN', NaN],
            ['{}', {}],
            ['[]', []],
            ['() => false', () => false],
        ]) {
            it(`should return [3, 3, 4] when input 10, 3, ${label}`, function() {
                assert.strict.deepStrictEqual(sepInt(10, 3, b), [3, 3, 4])
            })

            it(`should return [-4, -3, -3] when input -10, 3, ${label}`, function() {
                assert.strict.deepStrictEqual(sepInt(-10, 3, b), [-4, -3, -3])
            })
        }

        it(`should not throw for an invalid breverse even when n is 1`, function() {
            assert.strict.deepStrictEqual(sepInt(10, 1, 'x'), [10])
        })

    })

    describe(`invalid v (iseint false) should throw ${MSG_V}`, function() {

        for (let [label, v] of [
            ['Infinity', Infinity],
            ['-Infinity', -Infinity],
            [`'Infinity'`, 'Infinity'],
            [`'0x10'`, '0x10'],
            ['1.5', 1.5],
            [`'1.5'`, '1.5'],
            ['2 ** 53 (not safe)', 2 ** 53],
            ['1e21', 1e21],
            [`'1e21'`, '1e21'],
            [`'9007199254740993' (precision lost)`, '9007199254740993'],
            ['new Number(10)', new Number(10)], // eslint-disable-line no-new-wrappers
            ['10n', 10n],
            ['true', true],
            [`'abc'`, 'abc'],
            [`'x'`, 'x'],
            [`'  '`, '  '],
        ]) {
            it(`should throw when input ${label}, 3`, function() {
                assert.throws(() => sepInt(v, 3), (err) => {
                    assert.strict.deepStrictEqual(err instanceof Error, true)
                    assert.strict.deepStrictEqual(err.message, MSG_V)
                    return true
                })
            })
        }

    })

    describe(`invalid n (iseint count min 1 false) should throw ${MSG_N}`, function() {

        // 修前即不終止者(Infinity、2 ** 32等)於intInputHang.test.mjs(子行程)驗, 此處為修前亦回[]或不卡死者, 驗修後改為拋錯
        for (let [label, n] of [
            ['0', 0],
            [`'0'`, '0'],
            ['-1', -1],
            [`'-3'`, '-3'],
            ['1.5', 1.5],
            [`'3.5'`, '3.5'],
            ['3.5', 3.5],
            [`'0x3'`, '0x3'],
            ['new Number(3)', new Number(3)], // eslint-disable-line no-new-wrappers
            ['3n', 3n],
            ['true', true],
            ['NaN', NaN],
            [`'abc'`, 'abc'],
            ['4294967296 (over count max)', 4294967296],
        ]) {
            it(`should throw when input 10, ${label}`, function() {
                assert.throws(() => sepInt(10, n), (err) => {
                    assert.strict.deepStrictEqual(err instanceof Error, true)
                    assert.strict.deepStrictEqual(err.message, MSG_N)
                    return true
                })
            })
        }

    })

    it(`should throw for the user-confirmed rows: sepInt('x', 3), sepInt(10, 3.5), sepInt(10, 0)`, function() {
        assert.throws(() => sepInt('x', 3), { message: MSG_V })
        assert.throws(() => sepInt(10, 3.5), { message: MSG_N })
        assert.throws(() => sepInt(10, 0), { message: MSG_N })
    })

    it(`should check v before n (both invalid reports v)`, function() {
        assert.throws(() => sepInt('x', 'y'), { message: MSG_V })
        assert.throws(() => sepInt(undefined, undefined), { message: MSG_V })
    })

    it(`the error messages should not carry the input values`, function() {
        assert.throws(() => sepInt('SECRET-VALUE-123', 3), (err) => {
            assert.ok(!err.message.includes('SECRET'), err.message)
            return true
        })
        assert.throws(() => sepInt(10, 'SECRET-VALUE-123'), (err) => {
            assert.ok(!err.message.includes('SECRET'), err.message)
            return true
        })
        assert.throws(() => sepInt(10, { secret: 'SECRET-VALUE-123' }), (err) => {
            assert.ok(!err.message.includes('SECRET'), err.message)
            return true
        })
    })

})
