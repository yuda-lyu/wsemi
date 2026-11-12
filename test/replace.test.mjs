import assert from 'assert'
import replace from '../src/replace.mjs'


describe(`replace`, function() {

    it(`should return '1.20bc' when input '1.25abc', '5a', '0'`, function() {
        let r = replace('1.25abc', '5a', '0')
        assert.strict.deepStrictEqual(r, '1.20bc')
    })

    it(`should return '1.2bc' when input '1.25abc', '5a', ''`, function() {
        let r = replace('1.25abc', '5a', '')
        assert.strict.deepStrictEqual(r, '1.2bc')
    })

    it(`should return '' when input '1.25abc', '5a', []`, function() {
        let r = replace('1.25abc', '5a', [])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', '5a', {}`, function() {
        let r = replace('1.25abc', '5a', {})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', '5a', null`, function() {
        let r = replace('1.25abc', '5a', null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', '5a', undefined`, function() {
        let r = replace('1.25abc', '5a', undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', ''`, function() {
        let r = replace('1.25abc', '')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', []`, function() {
        let r = replace('1.25abc', [])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', {}`, function() {
        let r = replace('1.25abc', {})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', null`, function() {
        let r = replace('1.25abc', null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', undefined`, function() {
        let r = replace('1.25abc', undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = replace('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = replace([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = replace({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = replace(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = replace(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = replace(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

    //--- R-REPLACE-LITERAL-01(ws427 wsrep): 取代字串r為字面文字, $&、$'、$`、$$、$<name>、$1等皆不展開(JSDoc: r為字面文字) ---

    it(`should return '價格$&5' when input '價格{p}', '{p}', '$&5' (JSDoc example)`, function() {
        let r = replace('價格{p}', '{p}', '$&5')
        assert.strict.deepStrictEqual(r, '價格$&5')
    })

    it(`should keep '$&' literal: replace('a{x}b', '{x}', '$&') -> 'a$&b' (not the matched text)`, function() {
        let r = replace('a{x}b', '{x}', '$&')
        assert.strict.deepStrictEqual(r, 'a$&b')
    })

    it(`should keep "$'" literal: replace('a{x}b', '{x}', "$'") -> "a$'b" (not the text after the match)`, function() {
        let r = replace('a{x}b', '{x}', `$'`)
        assert.strict.deepStrictEqual(r, `a$'b`)
    })

    it('should keep "$`" literal: replace(\'a{x}b\', \'{x}\', "$`") -> "a$`b" (not the text before the match)', function() {
        let r = replace('a{x}b', '{x}', '$`')
        assert.strict.deepStrictEqual(r, 'a$`b')
    })

    it(`should keep '$$' literal: replace('a{x}b', '{x}', '$$') -> 'a$$b' (not a single '$')`, function() {
        let r = replace('a{x}b', '{x}', '$$')
        assert.strict.deepStrictEqual(r, 'a$$b')
    })

    it(`should keep '$<x>' literal: replace('a{x}b', '{x}', '$<x>') -> 'a$<x>b'`, function() {
        let r = replace('a{x}b', '{x}', '$<x>')
        assert.strict.deepStrictEqual(r, 'a$<x>b')
    })

    it(`should keep '$1' literal: replace('a{x}b', '{x}', '$1') -> 'a$1b'`, function() {
        let r = replace('a{x}b', '{x}', '$1')
        assert.strict.deepStrictEqual(r, 'a$1b')
    })

    it(`should keep every '$' pattern literal and replace all occurrences`, function() {
        for (let s of ['$', '$$', '$$$', '$&', '$&$&', '$0', '$1', '$01', '$10', '$99', '$<a>', '$<>', `$'`, '$`', 'x$&y$1z', '$ $', '100$', '$&$', '\\$&', '$$&']) {
            assert.strict.deepStrictEqual(replace('a{x}b{x}c{x}', '{x}', s), `a${s}b${s}c${s}`, s)
            assert.strict.deepStrictEqual(replace('{x}', '{x}', s), s, s)
        }
    })

    it(`should treat t as literal text, including '$' and regexp metacharacters`, function() {
        assert.strict.deepStrictEqual(replace('a$b', '$', '$$'), 'a$$b')
        assert.strict.deepStrictEqual(replace('a$b', '$', '$&'), 'a$&b')
        assert.strict.deepStrictEqual(replace('a.b.c', '.', '$&'), 'a$&b$&c')
        assert.strict.deepStrictEqual(replace('a(b)c', '(b)', '$1'), 'a$1c')
    })

    it(`should accept String object r and keep its '$' literal`, function() {
        let r = replace('a{x}b', '{x}', new String('$&')) // eslint-disable-line no-new-wrappers
        assert.strict.deepStrictEqual(r, 'a$&b')
    })

    it(`should match split/join oracle on seeded random strings containing '$' patterns`, function() {
        let chars = ['$', '&', `'`, '`', '<', '>', '1', '0', 'a', 'x', ' ', '{', '}']
        let seed = 12345
        let rnd = (n) => { //LCG, 固定種子
            seed = (seed * 1103515245 + 12345) % 2147483648
            return seed % n
        }
        let mk = (len) => {
            let s = ''
            for (let i = 0; i < len; i++) {
                s += chars[rnd(chars.length)]
            }
            return s
        }
        let n = 0
        for (let i = 0; i < 400; i++) {
            let c = mk(1 + rnd(14))
            let t = mk(1 + rnd(3))
            let rr = mk(rnd(6))
            assert.strict.deepStrictEqual(replace(c, t, rr), c.split(t).join(rr), JSON.stringify([c, t, rr]))
            n++
        }
        assert.strict.deepStrictEqual(n, 400)
    })

})
