import assert from 'assert'
import treeObj from '../src/treeObj.mjs'


describe(`treeObj 偽稱Array之物件視為物件(R-OBJ-ITER-01 候選10)`, function() {

    //以Symbol.toStringTag偽稱'Array'之物件(isarr為真而非真陣列), 可寫與不可寫兩種標籤
    let mkFake = (len, writable) => {
        let o = { a: 'kept', length: len }
        if (writable) {
            o[Symbol.toStringTag] = 'Array'
        }
        else {
            Object.defineProperty(o, Symbol.toStringTag, { value: 'Array' })
        }
        return o
    }
    let ident = (v) => v

    for (let writable of [true, false]) {
        let tag = writable ? 'writable' : 'non-writable'
        for (let len of [0, 2, 1000]) {
            it(`should keep the keys of a nested object faking Array (${tag} tag, length ${len}) and not turn it into an index array`, function() {
                let r = treeObj({ child: mkFake(len, writable) }, ident)
                assert.ok(!Array.isArray(r.child))
                assert.strict.deepStrictEqual(Object.keys(r.child), ['a', 'length'])
                assert.strict.strictEqual(r.child.a, 'kept')
                assert.strict.strictEqual(r.child.length, len)
            })
        }

        it(`should call the hook for the keys of an object faking Array (${tag} tag) with the path, as for a plain object`, function() {
            let m = []
            treeObj({ child: mkFake(2, writable) }, (value, key, nk) => {
                m.push({ value, key, nk })
                return value
            })
            let mm = []
            treeObj({ child: { a: 'kept', length: 2 } }, (value, key, nk) => {
                mm.push({ value, key, nk })
                return value
            })
            //第0筆為child本身(其value為物件, 比對鍵與路徑), 其後為a與length
            assert.strict.deepStrictEqual(m.map((v) => [v.key, v.nk]), mm.map((v) => [v.key, v.nk]))
            assert.strict.deepStrictEqual(m.slice(1).map((v) => v.value), ['kept', 2])
        })

        it(`should handle an object faking Array (${tag} tag) at the root as an object`, function() {
            let r = treeObj(mkFake(2, writable), ident)
            assert.ok(!Array.isArray(r))
            assert.strict.deepStrictEqual(Object.keys(r), ['a', 'length'])
            assert.strict.strictEqual(r.length, 2)
        })
    }

    it(`should keep Symbol keys of an object faking Array with force`, function() {
        let sym = Symbol('s')
        let o = mkFake(1, false)
        o[sym] = 'sv'
        let r = treeObj({ child: o }, ident, { force: true })
        assert.strict.strictEqual(r.child[sym], 'sv')
        assert.strict.strictEqual(r.child.a, 'kept')
    })

    it(`should still turn real arrays (including Array subclasses and holes) into arrays by index`, function() {
        class Arr2 extends Array {}
        let r = treeObj({ a: [1, [2, 3]], b: Arr2.from([4, 5]), c: [, 6] }, ident) // eslint-disable-line no-sparse-arrays
        assert.ok(Array.isArray(r.a) && Array.isArray(r.a[1]) && Array.isArray(r.b) && Array.isArray(r.c))
        assert.strict.deepStrictEqual(r.a, [1, [2, 3]])
        assert.strict.deepStrictEqual([...r.b], [4, 5])
        assert.strict.deepStrictEqual(r.c, [undefined, 6])
    })

    it(`should visit the non-enumerable string keys of an object faking Array like those of a plain object (own property names)`, function() {
        let mk = (fake) => {
            let o = { a: 1 }
            Object.defineProperty(o, 'h', { value: 2, enumerable: false })
            if (fake) {
                Object.defineProperty(o, Symbol.toStringTag, { value: 'Array' })
            }
            return o
        }
        let keysOf = (o) => {
            let m = []
            treeObj({ child: o }, (value, key) => {
                m.push(key)
                return value
            })
            return m
        }
        assert.strict.deepStrictEqual(keysOf(mk(false)), ['child', 'a', 'h'])
        assert.strict.deepStrictEqual(keysOf(mk(true)), ['child', 'a', 'h'])
    })

    for (let tag of ['Foo', 'Object', 'Arguments']) {
        it(`should still traverse a real array with another Symbol.toStringTag (${tag}) by index, nested and at the root`, function() {
            let mk = () => Object.defineProperty([1, 2], Symbol.toStringTag, { value: tag })
            let m = []
            let r = treeObj({ child: mk() }, (value, key, nk) => {
                m.push([key, nk.length])
                return value
            })
            assert.ok(Array.isArray(r.child))
            assert.strict.deepStrictEqual(r.child, [1, 2])
            assert.strict.deepStrictEqual(m, [['child', 0], [0, 1], [1, 1]])
            let m2 = []
            let r2 = treeObj(mk(), (value, key) => {
                m2.push(key)
                return value
            })
            assert.ok(Array.isArray(r2))
            assert.strict.deepStrictEqual(r2, [1, 2])
            assert.strict.deepStrictEqual(m2, [0, 1])
        })
    }

    it(`should treat an object with a numeric length key as an ordinary object`, function() {
        let r = treeObj({ child: { a: 'kept', length: 2 } }, ident)
        assert.strict.deepStrictEqual(r, { child: { a: 'kept', length: 2 } })
    })

})

describe(`treeObj`, function() {
    let data = {
        a: 123,
        b: 145.67,
        c: 'test中文1',
        d: true,
        e: function() {},
        f: [11, 'xyz', false, new Uint8Array([166, 197, 215])],
        g: {
            ga: 223,
            gb: 245.67,
            gc: 'test中文2',
            gd: new Uint8Array([66, 97, 115]),
        },
        h: Symbol('foo'),
        [Symbol('i-sym-key')]: 'i-sym-value',
    }

    let cdata1 = `{ a: 123, b: 145.67, c: 'test中文1', d: true, e: function() {}, f: [11, 'xyz', false, new Uint8Array([166, 197, 215])], g: { ga: 223, gb: 245.67, gc: 'test中文2', gd: new Uint8Array([66, 97, 115]), }, h: Symbol('foo'), [Symbol('i-sym-key')]: 'i-sym-value' }`
    let cres1 = `[{"value":123,"key":"a","nk":[]},{"value":145.67,"key":"b","nk":[]},{"value":"test中文1","key":"c","nk":[]},{"value":true,"key":"d","nk":[]},{"key":"e","nk":[]},{"value":[11,"xyz",false,{"0":166,"1":197,"2":215}],"key":"f","nk":[]},{"value":11,"key":0,"nk":["f"]},{"value":"xyz","key":1,"nk":["f"]},{"value":false,"key":2,"nk":["f"]},{"value":{"0":166,"1":197,"2":215},"key":3,"nk":["f"]},{"value":{"ga":223,"gb":245.67,"gc":"test中文2","gd":{"0":66,"1":97,"2":115}},"key":"g","nk":[]},{"value":223,"key":"ga","nk":["g"]},{"value":245.67,"key":"gb","nk":["g"]},{"value":"test中文2","key":"gc","nk":["g"]},{"value":{"0":66,"1":97,"2":115},"key":"gd","nk":["g"]},{"key":"h","nk":[]},{"a":123,"b":145.67,"c":"test中文1","d":true,"f":[11,"xyz",false,{"0":166,"1":197,"2":215}],"g":{"ga":223,"gb":245.67,"gc":"test中文2","gd":{"0":66,"1":97,"2":115}}}]`
    it(`should return ${cres1} when input ${cdata1}`, function() {
        let m = []
        let r = treeObj(data, (value, key, nk) => {
            m.push({ value, key, nk })
            return value
        })
        m.push(r)
        r = JSON.stringify(m)
        let rr = cres1
        assert.strict.deepStrictEqual(r, rr)
    })

    let cdata2 = `{ a: 123, b: 145.67, c: 'test中文1', d: true, e: function() {}, f: [11, 'xyz', false, new Uint8Array([166, 197, 215])], g: { ga: 223, gb: 245.67, gc: 'test中文2', gd: new Uint8Array([66, 97, 115]), }, h: Symbol('foo'), [Symbol('i-sym-key')]: 'i-sym-value' }, { force: true }`
    let cres2 = `[{"value":123,"key":"a","nk":[]},{"value":145.67,"key":"b","nk":[]},{"value":"test中文1","key":"c","nk":[]},{"value":true,"key":"d","nk":[]},{"key":"e","nk":[]},{"value":[11,"xyz",false,{"0":166,"1":197,"2":215}],"key":"f","nk":[]},{"value":11,"key":0,"nk":["f"]},{"value":"xyz","key":1,"nk":["f"]},{"value":false,"key":2,"nk":["f"]},{"value":{"0":166,"1":197,"2":215},"key":3,"nk":["f"]},{"value":{"ga":223,"gb":245.67,"gc":"test中文2","gd":{"0":66,"1":97,"2":115}},"key":"g","nk":[]},{"value":223,"key":"ga","nk":["g"]},{"value":245.67,"key":"gb","nk":["g"]},{"value":"test中文2","key":"gc","nk":["g"]},{"value":{"0":66,"1":97,"2":115},"key":"gd","nk":["g"]},{"key":"h","nk":[]},{"value":"i-sym-value","nk":[]},{"a":123,"b":145.67,"c":"test中文1","d":true,"f":[11,"xyz",false,{"0":166,"1":197,"2":215}],"g":{"ga":223,"gb":245.67,"gc":"test中文2","gd":{"0":66,"1":97,"2":115}}}]`
    it(`should return ${cres2} when input ${cdata2}`, function() {
        let m = []
        let r = treeObj(data, (value, key, nk) => {
            m.push({ value, key, nk })
            return value
        }, { force: true })
        m.push(r)
        r = JSON.stringify(m)
        let rr = cres2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = treeObj('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = treeObj([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = treeObj({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = treeObj(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input undefined`, function() {
        let r = treeObj(undefined)
        assert.strict.deepStrictEqual(r, undefined)
    })

    it(`should return undefined when input NaN`, function() {
        let r = treeObj(NaN)
        let rr = NaN
        assert.strict.deepStrictEqual(r, rr)
    })

})
