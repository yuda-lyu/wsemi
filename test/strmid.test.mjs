import assert from 'assert'
import strmid from '../src/strmid.mjs'


describe(`strmid`, function() {

    it(`sould return 's' when input 'test中文', 2, 1`, function() {
        let r = strmid('test中文', 2, 1)
        let rr = 's'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 's' when input 'test中文', 2, 3`, function() {
        let r = strmid('test中文', 2, 3)
        let rr = 'st中'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'st中文' when input 'test中文', 2, 10`, function() {
        let r = strmid('test中文', 2, 10)
        let rr = 'st中文'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, 0`, function() {
        let r = strmid('test中文', 2, 0)
        let rr = 's'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, -1`, function() {
        let r = strmid('test中文', 2, -1)
        let rr = 's'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 10, 1`, function() {
        let r = strmid('test中文', 10, 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 't' when input 'test中文', 0, 1`, function() {
        let r = strmid('test中文', 0, 1)
        let rr = 't'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', -1, 1`, function() {
        let r = strmid('test中文', -1, 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, ''`, function() {
        let r = strmid('test中文', 2, '')
        let rr = 's'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, []`, function() {
        let r = strmid('test中文', 2, [])
        let rr = 's'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, {}`, function() {
        let r = strmid('test中文', 2, {})
        let rr = 's'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, null`, function() {
        let r = strmid('test中文', 2, null)
        let rr = 's'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, undefined`, function() {
        let r = strmid('test中文', 2, undefined)
        let rr = 's'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', '', 1`, function() {
        let r = strmid('test中文', '', 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', [], 1`, function() {
        let r = strmid('test中文', [], 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}, 1`, function() {
        let r = strmid('test中文', {}, 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null, 1`, function() {
        let r = strmid('test中文', null, 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', undefined, 1`, function() {
        let r = strmid('test中文', undefined, 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input '', 2, 1`, function() {
        let r = strmid('', 2, 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input [], 2, 1`, function() {
        let r = strmid([], 2, 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}, 2, 1`, function() {
        let r = strmid({}, 2, 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null, 2, 1`, function() {
        let r = strmid(null, 2, 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined, 2, 1`, function() {
        let r = strmid(undefined, 2, 1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = strmid('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = strmid([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strmid({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strmid(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strmid(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input NaN`, function() {
        let r = strmid(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項已知缺陷先修(ws270): s為必須參數, 改iseint(s, { use: 'index' })並Number()後才與n相加; n為opt類參數(JSDoc [n=1]), 改iseint(n, { use: 'count', min: 1 }), 非預期(含Infinity)改用預設1

    describe(`valid numeric strings (s and n converted by Number() before s + n)`, function() {

        for (let [label, s, n, rr] of [
            [`'1', '2'`, '1', '2', 'bc'], // 修前s + n為字串相加'12', 回'bcdef'
            [`'1', 2`, '1', 2, 'bc'],
            [`1, '2'`, 1, '2', 'bc'],
            [`' 1 ', ' 2 '`, ' 1 ', ' 2 ', 'bc'],
            [`'+1.', '2.0'`, '+1.', '2.0', 'bc'],
            [`'1e0', '1e0'`, '1e0', '1e0', 'b'],
            [`'0', '3'`, '0', '3', 'abc'],
            [`'5', '9'`, '5', '9', 'f'],
            [`'10', 3 (s beyond the end)`, '10', 3, ''],
        ]) {
            it(`sould return '${rr}' when input 'abcdef', ${label}`, function() {
                assert.strict.deepStrictEqual(strmid('abcdef', s, n), rr)
            })
        }

        it(`sould return 'b' when input 'abcdef', '1' (n default 1)`, function() {
            assert.strict.deepStrictEqual(strmid('abcdef', '1'), 'b')
        })

    })

    describe(`unexpected n (not iseint count min 1) should use the default 1, no throw`, function() {

        // 使用者2026-10-31裁定: opt類參數遇非預期輸入(含超出範圍)視為未給、改用預設; Infinity一律非預期(原n為Infinity取到結尾)
        for (let [label, n] of [
            ['Infinity', Infinity],
            ['-Infinity', -Infinity],
            [`'Infinity'`, 'Infinity'],
            ['0', 0],
            [`'0'`, '0'],
            ['-2', -2],
            ['1.5', 1.5],
            [`'2.5'`, '2.5'],
            [`'0x3'`, '0x3'],
            ['new Number(3)', new Number(3)], // eslint-disable-line no-new-wrappers
            ['3n', 3n],
            ['true', true],
            ['NaN', NaN],
            [`'abc'`, 'abc'],
            ['2 ** 32 (over the count limit)', 2 ** 32],
            ['Number.MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER],
            ['1e21', 1e21],
        ]) {
            it(`sould return 'b' when input 'abcdef', 1, ${label}`, function() {
                assert.strict.deepStrictEqual(strmid('abcdef', 1, n), 'b')
            })
        }

        it(`sould still take to the end when n is the largest valid count 4294967295`, function() {
            assert.strict.deepStrictEqual(strmid('abcdef', 1, 4294967295), 'bcdef')
            assert.strict.deepStrictEqual(strmid('abcdef', 1, '4294967295'), 'bcdef')
        })

    })

    describe(`invalid s (not iseint index) should return ''`, function() {

        for (let [label, s] of [
            ['Infinity', Infinity],
            ['-Infinity', -Infinity],
            [`'Infinity'`, 'Infinity'],
            ['-1', -1],
            [`'-1'`, '-1'],
            ['1.5', 1.5],
            [`'1.5'`, '1.5'],
            [`'0x1'`, '0x1'],
            ['4294967295 (over the index limit 4294967294)', 4294967295],
            ['2 ** 53', 2 ** 53],
            ['1e21', 1e21],
            [`'1e21'`, '1e21'],
            ['new Number(1)', new Number(1)], // eslint-disable-line no-new-wrappers
            ['1n', 1n],
            ['true', true],
            ['NaN', NaN],
            [`'abc'`, 'abc'],
            [`'  '`, '  '],
        ]) {
            it(`sould return '' when input 'abcdef', ${label}, 2`, function() {
                assert.strict.deepStrictEqual(strmid('abcdef', s, 2), '')
            })
        }

        it(`sould return '' when s is the largest valid index 4294967294 (beyond the string)`, function() {
            assert.strict.deepStrictEqual(strmid('abcdef', 4294967294, 2), '')
        })

    })

})
