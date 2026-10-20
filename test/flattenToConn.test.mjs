import assert from 'assert'
import flattenToConn from '../src/flattenToConn.mjs'


describe(`flattenToConn 偽稱Array之物件視為物件(R-OBJ-ITER-01 候選10)`, function() {

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

    //flattenToConn以force走訪, 含Symbol鍵(treeObj取自有屬性名稱與自有Symbol), 偽標籤本身之Symbol鍵亦成一節點; 此處只比對字串鍵之節點
    let strNodes = (r) => r.filter((v) => !/Symbol\(/.test(String(v.id)))

    for (let writable of [true, false]) {
        let tag = writable ? 'writable' : 'non-writable'

        it(`should give the same nodes for a nested object faking Array (${tag} tag, length 2) as for the plain object with the same keys`, function() {
            let r = strNodes(flattenToConn({ child: mkFake(2, writable) }))
            let e = flattenToConn({ child: { a: 'kept', length: 2 } })
            assert.strict.deepStrictEqual(r, e)
            assert.strict.strictEqual(r[0].type, 'object')
            assert.strict.strictEqual(r[0].numOfChilren, 2)
            assert.strict.deepStrictEqual(r.map((v) => v.id), ['child', 'child-a', 'child-length'])
        })

        it(`should give the same nodes for a nested object faking Array (${tag} tag, length 0) as for the plain object with the same keys`, function() {
            let r = strNodes(flattenToConn({ child: mkFake(0, writable) }))
            let e = flattenToConn({ child: { a: 'kept', length: 0 } })
            assert.strict.deepStrictEqual(r, e)
            assert.strict.strictEqual(r[0].type, 'object')
        })

        it(`should give the same nodes for an object faking Array (${tag} tag, length 2) at the root as for the plain object with the same keys`, function() {
            let r = strNodes(flattenToConn(mkFake(2, writable)))
            let e = flattenToConn({ a: 'kept', length: 2 })
            assert.strict.deepStrictEqual(r, e)
            assert.strict.deepStrictEqual(r.map((v) => v.id), ['a', 'length'])
        })
    }

    for (let writable of [true, false]) {
        for (let len of [0, 2, 1000]) {
            it(`should count the string keys as the children of an object faking Array (${writable ? 'writable' : 'non-writable'} tag, length ${len}), not the length value`, function() {
                //R-OBJ-ITER-01: length為一般鍵, numOfChilren為自有鍵數(a與length共2), 與length之值無關
                let o = { a: 'kept', length: len }
                if (writable) {
                    o[Symbol.toStringTag] = 'Array'
                }
                else {
                    Object.defineProperty(o, Symbol.toStringTag, { value: 'Array' })
                }
                let r = flattenToConn({ child: o })
                assert.strict.strictEqual(r[0].id, 'child')
                assert.strict.strictEqual(r[0].type, 'object')
                assert.strict.strictEqual(r[0].numOfChilren, 2)
            })
        }
    }

    for (let tag of ['Foo', 'Object', 'Arguments']) {
        it(`should give array nodes for a real array with another Symbol.toStringTag (${tag}), like an ordinary array`, function() {
            let a = Object.defineProperty([1, 2], Symbol.toStringTag, { value: tag })
            let r = flattenToConn({ list: a })
            let e = flattenToConn({ list: [1, 2] })
            assert.strict.deepStrictEqual(r, e)
            assert.strict.strictEqual(r[0].type, 'array')
            assert.strict.deepStrictEqual(r.map((v) => v.id), ['list', 'list-0', 'list-1'])
        })
    }

    it(`should still give array nodes for real arrays`, function() {
        let r = flattenToConn({ list: [1, [2]] })
        assert.strict.strictEqual(r[0].type, 'array')
        assert.strict.strictEqual(r[0].numOfChilren, 2)
        assert.strict.strictEqual(r.find((v) => v.id === 'list-1').type, 'array')
    })

})

describe(`flattenToConn`, function() {

    let obj = {
        a: 1,
        b: 12.3,
        c: 'abc',
        d: '45-de',
        x: true,
        y: null,
        z: function() {},
        e: [],
        f: [
            91,
            912.3,
            'abc',
            '945-de',
            true,
            null,
            function() {},
            [
                5,
                54.3,
                'xyz',
            ]
        ],
        g: {},
        h: {
            ga: 81,
            gb: 812.3,
            gc: 'abc',
            gd: '845-de',
            ge: [
                71,
                712.3,
                'abc',
                '745-de',
                true,
                null,
                function() {},
            ],
            gf: {
                gfa: 61,
                gfb: 612.3,
                gfc: 'abc',
                gfd: '645-de',
                gfe: true,
                gff: null,
                gfg: function() {},
            },
            gx: true,
            gy: null,
            gz: function() {},
        },
        i: Symbol('foo'),
        [Symbol('i-sym-key-a')]: 'i-sym-value',
        [Symbol('i-sym-key-b')]: {
            symfa: 61,
            symfb: 612.3,
            symfc: 'abc',
            symfd: '645-de',
            symfe: true,
            symff: null,
            symfg: function() {},
        },
    }
    let crobj = `[{"id":"a","parentId":"","type":"node","key":"a","text":1},{"id":"b","parentId":"","type":"node","key":"b","text":12.3},{"id":"c","parentId":"","type":"node","key":"c","text":"abc"},{"id":"d","parentId":"","type":"node","key":"d","text":"45-de"},{"id":"x","parentId":"","type":"node","key":"x","text":true},{"id":"y","parentId":"","type":"node","key":"y","text":null},{"id":"z","parentId":"","type":"node","key":"z"},{"id":"e","parentId":"","type":"array","key":"e","numOfChilren":0},{"id":"f","parentId":"","type":"array","key":"f","numOfChilren":8},{"id":"f-0","parentId":"f","type":"node","key":0,"text":91},{"id":"f-1","parentId":"f","type":"node","key":1,"text":912.3},{"id":"f-2","parentId":"f","type":"node","key":2,"text":"abc"},{"id":"f-3","parentId":"f","type":"node","key":3,"text":"945-de"},{"id":"f-4","parentId":"f","type":"node","key":4,"text":true},{"id":"f-5","parentId":"f","type":"node","key":5,"text":null},{"id":"f-6","parentId":"f","type":"node","key":6},{"id":"f-7","parentId":"f","type":"array","key":7,"numOfChilren":3},{"id":"f-7-0","parentId":"f-7","type":"node","key":0,"text":5},{"id":"f-7-1","parentId":"f-7","type":"node","key":1,"text":54.3},{"id":"f-7-2","parentId":"f-7","type":"node","key":2,"text":"xyz"},{"id":"g","parentId":"","type":"object","key":"g","numOfChilren":0},{"id":"h","parentId":"","type":"object","key":"h","numOfChilren":9},{"id":"h-ga","parentId":"h","type":"node","key":"ga","text":81},{"id":"h-gb","parentId":"h","type":"node","key":"gb","text":812.3},{"id":"h-gc","parentId":"h","type":"node","key":"gc","text":"abc"},{"id":"h-gd","parentId":"h","type":"node","key":"gd","text":"845-de"},{"id":"h-ge","parentId":"h","type":"array","key":"ge","numOfChilren":7},{"id":"h-ge-0","parentId":"h-ge","type":"node","key":0,"text":71},{"id":"h-ge-1","parentId":"h-ge","type":"node","key":1,"text":712.3},{"id":"h-ge-2","parentId":"h-ge","type":"node","key":2,"text":"abc"},{"id":"h-ge-3","parentId":"h-ge","type":"node","key":3,"text":"745-de"},{"id":"h-ge-4","parentId":"h-ge","type":"node","key":4,"text":true},{"id":"h-ge-5","parentId":"h-ge","type":"node","key":5,"text":null},{"id":"h-ge-6","parentId":"h-ge","type":"node","key":6},{"id":"h-gf","parentId":"h","type":"object","key":"gf","numOfChilren":7},{"id":"h-gf-gfa","parentId":"h-gf","type":"node","key":"gfa","text":61},{"id":"h-gf-gfb","parentId":"h-gf","type":"node","key":"gfb","text":612.3},{"id":"h-gf-gfc","parentId":"h-gf","type":"node","key":"gfc","text":"abc"},{"id":"h-gf-gfd","parentId":"h-gf","type":"node","key":"gfd","text":"645-de"},{"id":"h-gf-gfe","parentId":"h-gf","type":"node","key":"gfe","text":true},{"id":"h-gf-gff","parentId":"h-gf","type":"node","key":"gff","text":null},{"id":"h-gf-gfg","parentId":"h-gf","type":"node","key":"gfg"},{"id":"h-gx","parentId":"h","type":"node","key":"gx","text":true},{"id":"h-gy","parentId":"h","type":"node","key":"gy","text":null},{"id":"h-gz","parentId":"h","type":"node","key":"gz"},{"id":"i","parentId":"","type":"node","key":"i"},{"id":"Symbol(i-sym-key-a)","parentId":"","type":"node","text":"i-sym-value"},{"id":"Symbol(i-sym-key-b)","parentId":"","type":"object","numOfChilren":7},{"id":"Symbol(i-sym-key-b)-symfa","parentId":"Symbol(i-sym-key-b)","type":"node","key":"symfa","text":61},{"id":"Symbol(i-sym-key-b)-symfb","parentId":"Symbol(i-sym-key-b)","type":"node","key":"symfb","text":612.3},{"id":"Symbol(i-sym-key-b)-symfc","parentId":"Symbol(i-sym-key-b)","type":"node","key":"symfc","text":"abc"},{"id":"Symbol(i-sym-key-b)-symfd","parentId":"Symbol(i-sym-key-b)","type":"node","key":"symfd","text":"645-de"},{"id":"Symbol(i-sym-key-b)-symfe","parentId":"Symbol(i-sym-key-b)","type":"node","key":"symfe","text":true},{"id":"Symbol(i-sym-key-b)-symff","parentId":"Symbol(i-sym-key-b)","type":"node","key":"symff","text":null},{"id":"Symbol(i-sym-key-b)-symfg","parentId":"Symbol(i-sym-key-b)","type":"node","key":"symfg"}]`

    it(`should return ${crobj} when input ${JSON.stringify(obj)}`, function() {
        let r = flattenToConn(obj)
        r = JSON.stringify(r)
        let rr = crobj
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr = [
        91,
        912.3,
        'abc',
        '945-de',
        true,
        null,
        function() {},
        [
            5,
            54.3,
            'xyz',
            {
                gf: {
                    gfa: 61,
                    gfb: 612.3,
                    gfc: 'abc',
                    gfd: '645-de',
                    gfe: true,
                    gff: null,
                    gfg: function() {},
                },
            },
        ],
        {
            h: {
                ga: 81,
                gb: 812.3,
                gc: 'abc',
                gd: '845-de',
                ge: [
                    71,
                    712.3,
                    'abc',
                    '745-de',
                    true,
                    null,
                    function() {},
                ],
                gx: true,
                gy: null,
                gz: function() {},
            },
            i: Symbol('foo'),
            [Symbol('i-sym-key-a')]: 'i-sym-value',
            [Symbol('i-sym-key-b')]: {
                symfa: 61,
                symfb: 612.3,
                symfc: 'abc',
                symfd: '645-de',
                symfe: true,
                symff: null,
                symfg: function() {},
            },
        },
    ]
    let crarr = `[{"id":"0","parentId":"","type":"node","key":0,"text":91},{"id":"1","parentId":"","type":"node","key":1,"text":912.3},{"id":"2","parentId":"","type":"node","key":2,"text":"abc"},{"id":"3","parentId":"","type":"node","key":3,"text":"945-de"},{"id":"4","parentId":"","type":"node","key":4,"text":true},{"id":"5","parentId":"","type":"node","key":5,"text":null},{"id":"6","parentId":"","type":"node","key":6},{"id":"7","parentId":"","type":"array","key":7,"numOfChilren":4},{"id":"7-0","parentId":"7","type":"node","key":0,"text":5},{"id":"7-1","parentId":"7","type":"node","key":1,"text":54.3},{"id":"7-2","parentId":"7","type":"node","key":2,"text":"xyz"},{"id":"7-3","parentId":"7","type":"object","key":3,"numOfChilren":1},{"id":"7-3-gf","parentId":"7-3","type":"object","key":"gf","numOfChilren":7},{"id":"7-3-gf-gfa","parentId":"7-3-gf","type":"node","key":"gfa","text":61},{"id":"7-3-gf-gfb","parentId":"7-3-gf","type":"node","key":"gfb","text":612.3},{"id":"7-3-gf-gfc","parentId":"7-3-gf","type":"node","key":"gfc","text":"abc"},{"id":"7-3-gf-gfd","parentId":"7-3-gf","type":"node","key":"gfd","text":"645-de"},{"id":"7-3-gf-gfe","parentId":"7-3-gf","type":"node","key":"gfe","text":true},{"id":"7-3-gf-gff","parentId":"7-3-gf","type":"node","key":"gff","text":null},{"id":"7-3-gf-gfg","parentId":"7-3-gf","type":"node","key":"gfg"},{"id":"8","parentId":"","type":"object","key":8,"numOfChilren":2},{"id":"8-h","parentId":"8","type":"object","key":"h","numOfChilren":8},{"id":"8-h-ga","parentId":"8-h","type":"node","key":"ga","text":81},{"id":"8-h-gb","parentId":"8-h","type":"node","key":"gb","text":812.3},{"id":"8-h-gc","parentId":"8-h","type":"node","key":"gc","text":"abc"},{"id":"8-h-gd","parentId":"8-h","type":"node","key":"gd","text":"845-de"},{"id":"8-h-ge","parentId":"8-h","type":"array","key":"ge","numOfChilren":7},{"id":"8-h-ge-0","parentId":"8-h-ge","type":"node","key":0,"text":71},{"id":"8-h-ge-1","parentId":"8-h-ge","type":"node","key":1,"text":712.3},{"id":"8-h-ge-2","parentId":"8-h-ge","type":"node","key":2,"text":"abc"},{"id":"8-h-ge-3","parentId":"8-h-ge","type":"node","key":3,"text":"745-de"},{"id":"8-h-ge-4","parentId":"8-h-ge","type":"node","key":4,"text":true},{"id":"8-h-ge-5","parentId":"8-h-ge","type":"node","key":5,"text":null},{"id":"8-h-ge-6","parentId":"8-h-ge","type":"node","key":6},{"id":"8-h-gx","parentId":"8-h","type":"node","key":"gx","text":true},{"id":"8-h-gy","parentId":"8-h","type":"node","key":"gy","text":null},{"id":"8-h-gz","parentId":"8-h","type":"node","key":"gz"},{"id":"8-i","parentId":"8","type":"node","key":"i"},{"id":"8-Symbol(i-sym-key-a)","parentId":"8","type":"node","text":"i-sym-value"},{"id":"8-Symbol(i-sym-key-b)","parentId":"8","type":"object","numOfChilren":7},{"id":"8-Symbol(i-sym-key-b)-symfa","parentId":"8-Symbol(i-sym-key-b)","type":"node","key":"symfa","text":61},{"id":"8-Symbol(i-sym-key-b)-symfb","parentId":"8-Symbol(i-sym-key-b)","type":"node","key":"symfb","text":612.3},{"id":"8-Symbol(i-sym-key-b)-symfc","parentId":"8-Symbol(i-sym-key-b)","type":"node","key":"symfc","text":"abc"},{"id":"8-Symbol(i-sym-key-b)-symfd","parentId":"8-Symbol(i-sym-key-b)","type":"node","key":"symfd","text":"645-de"},{"id":"8-Symbol(i-sym-key-b)-symfe","parentId":"8-Symbol(i-sym-key-b)","type":"node","key":"symfe","text":true},{"id":"8-Symbol(i-sym-key-b)-symff","parentId":"8-Symbol(i-sym-key-b)","type":"node","key":"symff","text":null},{"id":"8-Symbol(i-sym-key-b)-symfg","parentId":"8-Symbol(i-sym-key-b)","type":"node","key":"symfg"}]`

    it(`should return ${crarr} when input ${JSON.stringify(arr)}`, function() {
        let r = flattenToConn(arr)
        r = JSON.stringify(r)
        let rr = crarr
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = flattenToConn('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = flattenToConn([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = flattenToConn({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = flattenToConn(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = flattenToConn(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function() {
        let r = flattenToConn(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
