import assert from 'assert'
import sepInt from '../src/sepInt.mjs'


describe(`sepInt`, function() {

    it(`should return [3, 3, 4] when input 10, 3`, function() {
        let r = sepInt(10, 3)
        assert.strict.deepStrictEqual(r, [3, 3, 4])
    })

    it(`should return [-4, -3, -3] when input -10, 3`, function() {
        let r = sepInt(-10, 3)
        assert.strict.deepStrictEqual(r, [-4, -3, -3])
    })

    it(`should return [] when input 10, 0`, function() {
        let r = sepInt(10, 0)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 10, ''`, function() {
        let r = sepInt(10, '')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 10, []`, function() {
        let r = sepInt(10, [])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 10, {}`, function() {
        let r = sepInt(10, {})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 10, null`, function() {
        let r = sepInt(10, null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 10, undefined`, function() {
        let r = sepInt(10, undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ''`, function() {
        let r = sepInt('')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input []`, function() {
        let r = sepInt([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input {}`, function() {
        let r = sepInt({})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input null`, function() {
        let r = sepInt(null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input undefined`, function() {
        let r = sepInt(undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input NaN`, function() {
        let r = sepInt(NaN)
        assert.strict.deepStrictEqual(r, [])
    })

    //第221項已知缺陷先修(ws270): v、n為必須參數, 改iseint(v)、iseint(n, { use: 'count', min: 1 }), 通過後以Number()取值再計算; 無效維持回傳[]
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
        })

        it(`should return [] when breverse is not boolean`, function() {
            assert.strict.deepStrictEqual(sepInt(10, 3, 'false'), [])
            assert.strict.deepStrictEqual(sepInt(10, 3, null), [])
        })

    })

    describe(`invalid v (iseint false) should return []`, function() {

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
            [`'  '`, '  '],
        ]) {
            it(`should return [] when input ${label}, 3`, function() {
                assert.strict.deepStrictEqual(sepInt(v, 3), [])
            })
        }

    })

    describe(`invalid n (iseint count min 1 false) should return []`, function() {

        // 修前即不終止者(Infinity、2 ** 32等)於intInputHang.test.mjs(子行程)驗, 此處為修前亦回[]或不卡死者, 驗修後仍為[]
        for (let [label, n] of [
            ['0', 0],
            [`'0'`, '0'],
            ['-1', -1],
            [`'-3'`, '-3'],
            ['1.5', 1.5],
            [`'3.5'`, '3.5'],
            [`'0x3'`, '0x3'],
            ['new Number(3)', new Number(3)], // eslint-disable-line no-new-wrappers
            ['3n', 3n],
            ['true', true],
            ['NaN', NaN],
            [`'abc'`, 'abc'],
        ]) {
            it(`should return [] when input 10, ${label}`, function() {
                assert.strict.deepStrictEqual(sepInt(10, n), [])
            })
        }

    })

})
