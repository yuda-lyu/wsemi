import assert from 'assert'
import getltdtkeys from '../src/getltdtkeys.mjs'


describe(`getltdtkeys 列物件只依自有鍵(R-OBJ-ITER-01 候選11)`, function() {

    it(`should return the own keys of a row that fakes Arguments with a non-writable Symbol.toStringTag`, function() {
        //lodash keys 對不可寫偽稱 Arguments 之物件走 baseTimes(length), 修前得 ['0','1','a']
        let row = Object.defineProperty({ a: 1, length: 2 }, Symbol.toStringTag, { value: 'Arguments' })
        assert.strict.deepStrictEqual(getltdtkeys([row]), ['a', 'length'])
        assert.strict.deepStrictEqual(getltdtkeys([{ x: 1 }, row, { y: 2 }]), ['x', 'a', 'length', 'y'])
    })

    it(`should return the own keys of a row that fakes Array or Arguments with a writable tag`, function() {
        assert.strict.deepStrictEqual(getltdtkeys([{ a: 1, length: 2, [Symbol.toStringTag]: 'Arguments' }]), ['a', 'length'])
        assert.strict.deepStrictEqual(getltdtkeys([{ a: 1, length: 2, [Symbol.toStringTag]: 'Array' }]), ['a', 'length'])
    })

    it(`should treat length as an ordinary key of a row (any non-negative integer, small values)`, function() {
        assert.strict.deepStrictEqual(getltdtkeys([{ length: 2, a: 'x' }]), ['length', 'a'])
        assert.strict.deepStrictEqual(getltdtkeys([{ length: 0, a: 'x' }, { length: 1000, b: 'y' }]), ['length', 'a', 'b'])
        assert.strict.deepStrictEqual(getltdtkeys([{ a: 1, length: -0 }]), ['a', 'length'])
    })

    it(`should keep the behavior for rows that are arrays (including holes), strings, typed arrays, null and primitives`, function() {
        //列為真陣列者沿用 lodash keys: 含空洞索引(Object.keys 不含)
        assert.strict.deepStrictEqual(getltdtkeys([[1, 2]]), ['0', '1'])
        assert.strict.deepStrictEqual(getltdtkeys([[, 1]]), ['0', '1']) // eslint-disable-line no-sparse-arrays
        assert.strict.deepStrictEqual(getltdtkeys([new Uint8Array(2)]), ['0', '1'])
        assert.strict.deepStrictEqual(getltdtkeys([null, undefined, 5, true, 'ab', { a: 1 }]), ['0', '1', 'a'])
        assert.strict.deepStrictEqual(getltdtkeys([new Map([['k', 1]]), new Date(0), /a/, () => 1]), [])
    })

    it(`should return the own enumerable string keys of class instances, null-prototype rows and rows with inherited keys`, function() {
        class Foo {
            constructor() {
                this.a = 1
            }
        }
        let np = Object.create(null)
        np.n = 1
        let inh = Object.create({ p: 1 })
        inh.q = 2
        assert.strict.deepStrictEqual(getltdtkeys([new Foo(), np, inh]), ['a', 'n', 'q'])
    })

    it(`should return the same keys as the lodash keys on 500 random rows without length keys`, function() {
        let seed = 20261020
        let rnd = () => {
            seed = (seed * 1103515245 + 12345) % 2147483648
            return seed / 2147483648
        }
        let names = ['a', 'b', 'c', '0', '1', '10', 'constructor', 'toString', 'x y', '中文']
        let rows = []
        for (let i = 0; i < 500; i++) {
            let o = {}
            let n = Math.floor(rnd() * 5)
            for (let j = 0; j < n; j++) {
                o[names[Math.floor(rnd() * names.length)]] = j
            }
            rows.push(o)
        }
        let expected = []
        for (let o of rows) {
            for (let k of Object.keys(o)) {
                if (!expected.includes(k)) {
                    expected.push(k)
                }
            }
        }
        assert.strict.deepStrictEqual(getltdtkeys(rows), expected)
    })

})

describe(`getltdtkeys`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        in: [{ a: 123, b: 'xyz', c: '45op', d: null }, { a: 123.456, b: 'xyz', d: '45op', e: '' }],
        out: ['a', 'b', 'c', 'd', 'e']
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${o[k].in}`, function() {
        k = 1
        let r = getltdtkeys(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input { a: 123, b: 'xyz', c: '45op', d: null }`, function() {
        let r = getltdtkeys({ a: 123, b: 'xyz', c: '45op', d: null })
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return '' when input ''`, function() {
        let r = getltdtkeys('')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return '' when input []`, function() {
        let r = getltdtkeys([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return '' when input {}`, function() {
        let r = getltdtkeys({})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return '' when input null`, function() {
        let r = getltdtkeys(null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return '' when input undefined`, function() {
        let r = getltdtkeys(undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return '' when input NaN`, function() {
        let r = getltdtkeys(NaN)
        assert.strict.deepStrictEqual(r, [])
    })

})
