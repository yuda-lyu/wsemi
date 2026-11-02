import assert from 'assert'
import cfilesize from '../src/cfilesize.mjs'


describe(`cfilesize`, function() {

    it(`should return '0.0 b' when input 0`, function() {
        let r = cfilesize(0)
        assert.strict.deepStrictEqual(r, '0.0 b')
    })

    it(`should return '100.0 b' when input 100`, function() {
        let r = cfilesize(100)
        assert.strict.deepStrictEqual(r, '100.0 b')
    })

    it(`should return '1000.0 b' when input 1000`, function() {
        let r = cfilesize(1000)
        assert.strict.deepStrictEqual(r, '1000.0 b')
    })

    it(`should return '1.0 kb' when input 1024`, function() {
        let r = cfilesize(1024)
        assert.strict.deepStrictEqual(r, '1.0 kb')
    })

    it(`should return '1.9 kb' when input 1900`, function() {
        let r = cfilesize(1900)
        assert.strict.deepStrictEqual(r, '1.9 kb')
    })

    it(`should return '2.0 kb' when input 2000`, function() {
        let r = cfilesize(2000)
        assert.strict.deepStrictEqual(r, '2.0 kb')
    })

    it(`should return '2.0 kb' when input 2048`, function() {
        let r = cfilesize(2048)
        assert.strict.deepStrictEqual(r, '2.0 kb')
    })

    it(`should return '19.5 kb' when input 20000`, function() {
        let r = cfilesize(20000)
        assert.strict.deepStrictEqual(r, '19.5 kb')
    })

    it(`should return '97.7 kb' when input 100000`, function() {
        let r = cfilesize(100000)
        assert.strict.deepStrictEqual(r, '97.7 kb')
    })

    it(`should return '195.3 kb' when input 200000`, function() {
        let r = cfilesize(200000)
        assert.strict.deepStrictEqual(r, '195.3 kb')
    })

    it(`should return '976.6 kb' when input 1000000`, function() {
        let r = cfilesize(1000000)
        assert.strict.deepStrictEqual(r, '976.6 kb')
    })

    it(`should return '1.0 mb' when input 1048576`, function() {
        let r = cfilesize(1048576)
        assert.strict.deepStrictEqual(r, '1.0 mb')
    })

    it(`should return '1.9 mb' when input 2000000`, function() {
        let r = cfilesize(2000000)
        assert.strict.deepStrictEqual(r, '1.9 mb')
    })

    it(`should return '9.5 mb' when input 10000000`, function() {
        let r = cfilesize(10000000)
        assert.strict.deepStrictEqual(r, '9.5 mb')
    })

    it(`should return '95.4 mb' when input 100000000`, function() {
        let r = cfilesize(100000000)
        assert.strict.deepStrictEqual(r, '95.4 mb')
    })

    it(`should return '1.9 gb' when input 2000000000`, function() {
        let r = cfilesize(2000000000)
        assert.strict.deepStrictEqual(r, '1.9 gb')
    })

    it(`should return '0.0 b' when input '0'`, function() {
        let r = cfilesize('0')
        assert.strict.deepStrictEqual(r, '0.0 b')
    })

    it(`should return '100.0 b' when input '100'`, function() {
        let r = cfilesize('100')
        assert.strict.deepStrictEqual(r, '100.0 b')
    })

    it(`should return '1000.0 b' when input '1000'`, function() {
        let r = cfilesize('1000')
        assert.strict.deepStrictEqual(r, '1000.0 b')
    })

    it(`should return '1.0 kb' when input '1024'`, function() {
        let r = cfilesize('1024')
        assert.strict.deepStrictEqual(r, '1.0 kb')
    })

    it(`should return '1.9 kb' when input '1900'`, function() {
        let r = cfilesize('1900')
        assert.strict.deepStrictEqual(r, '1.9 kb')
    })

    it(`should return '2.0 kb' when input '2000'`, function() {
        let r = cfilesize('2000')
        assert.strict.deepStrictEqual(r, '2.0 kb')
    })

    it(`should return '2.0 kb' when input '2048'`, function() {
        let r = cfilesize('2048')
        assert.strict.deepStrictEqual(r, '2.0 kb')
    })

    it(`should return '19.5 kb' when input '20000'`, function() {
        let r = cfilesize('20000')
        assert.strict.deepStrictEqual(r, '19.5 kb')
    })

    it(`should return '97.7 kb' when input '100000'`, function() {
        let r = cfilesize('100000')
        assert.strict.deepStrictEqual(r, '97.7 kb')
    })

    it(`should return '195.3 kb' when input '200000'`, function() {
        let r = cfilesize('200000')
        assert.strict.deepStrictEqual(r, '195.3 kb')
    })

    it(`should return '976.6 kb' when input '1000000'`, function() {
        let r = cfilesize('1000000')
        assert.strict.deepStrictEqual(r, '976.6 kb')
    })

    it(`should return '1.0 mb' when input '1048576'`, function() {
        let r = cfilesize('1048576')
        assert.strict.deepStrictEqual(r, '1.0 mb')
    })

    it(`should return '1.9 mb' when input '2000000'`, function() {
        let r = cfilesize('2000000')
        assert.strict.deepStrictEqual(r, '1.9 mb')
    })

    it(`should return '9.5 mb' when input '10000000'`, function() {
        let r = cfilesize('10000000')
        assert.strict.deepStrictEqual(r, '9.5 mb')
    })

    it(`should return '95.4 mb' when input '100000000'`, function() {
        let r = cfilesize('100000000')
        assert.strict.deepStrictEqual(r, '95.4 mb')
    })

    it(`should return '1.9 gb' when input '2000000000'`, function() {
        let r = cfilesize('2000000000')
        assert.strict.deepStrictEqual(r, '1.9 gb')
    })

    it(`should return '' when input '100abc'`, function() {
        let r = cfilesize('100abc')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = cfilesize('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = cfilesize([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = cfilesize({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = cfilesize(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = cfilesize(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = cfilesize(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

    //ws286b: 新增tb為最高單位(使用者2026-11-02定); 1 TB以上之有效輸入不再回'', 無效輸入維持回''
    describe(`tb as the highest unit (ws286b)`, function() {

        const TB = 1024 ** 4

        it(`should keep '1024.0 gb' for 1 byte below 1 TB and give '1.0 tb' at 1 TB`, function() {
            assert.strict.deepStrictEqual(cfilesize(TB - 1), '1024.0 gb') // 1099511627775
            assert.strict.deepStrictEqual(cfilesize(1099511627775), '1024.0 gb')
            assert.strict.deepStrictEqual(cfilesize(TB), '1.0 tb') // 1099511627776
            assert.strict.deepStrictEqual(cfilesize(1099511627776), '1.0 tb')
            assert.strict.deepStrictEqual(cfilesize(TB + 1), '1.0 tb')
        })

        it(`should give '1024.0 tb' for 1 PB (1024 ** 5), tb being the highest unit`, function() {
            assert.strict.deepStrictEqual(cfilesize(1024 ** 5), '1024.0 tb')
            assert.strict.deepStrictEqual(cfilesize(2 * 1024 ** 5), '2048.0 tb')
        })

        it(`should convert by TB with one decimal`, function() {
            assert.strict.deepStrictEqual(cfilesize(1.5 * TB), '1.5 tb')
            assert.strict.deepStrictEqual(cfilesize(10 * TB), '10.0 tb')
            assert.strict.deepStrictEqual(cfilesize(2000000000000), '1.8 tb') // 2e12 / 2^40 = 1.819...
        })

        it(`should give the same text for the numeric string forms`, function() {
            assert.strict.deepStrictEqual(cfilesize('1099511627775'), '1024.0 gb')
            assert.strict.deepStrictEqual(cfilesize('1099511627776'), '1.0 tb')
            assert.strict.deepStrictEqual(cfilesize(' 1099511627776 '), '1.0 tb')
            assert.strict.deepStrictEqual(cfilesize(String(1024 ** 5)), '1024.0 tb')
        })

        it(`should keep returning '' for invalid input, including very large non-finite values`, function() {
            for (let v of [Infinity, -Infinity, 'Infinity', '0x10', '1e400', '-', '', null, undefined, NaN, {}, [], true]) {
                assert.strict.deepStrictEqual(cfilesize(v), '', String(v))
            }
        })

        it(`should keep the units below 1 TB unchanged at their boundaries`, function() {
            assert.strict.deepStrictEqual(cfilesize(1023), '1023.0 b')
            assert.strict.deepStrictEqual(cfilesize(1024), '1.0 kb')
            assert.strict.deepStrictEqual(cfilesize(1024 ** 2 - 1), '1024.0 kb')
            assert.strict.deepStrictEqual(cfilesize(1024 ** 2), '1.0 mb')
            assert.strict.deepStrictEqual(cfilesize(1024 ** 3 - 1), '1024.0 mb')
            assert.strict.deepStrictEqual(cfilesize(1024 ** 3), '1.0 gb')
        })

    })

})
