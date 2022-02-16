import assert from 'assert'
import convertToTree from '../src/convertToTree.mjs'


describe(`convertToTree`, function() {

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

    let cr = `[{"id":"a","parentId":"","type":"node","text":1},{"id":"b","parentId":"","type":"node","text":12.3},{"id":"c","parentId":"","type":"node","text":"abc"},{"id":"d","parentId":"","type":"node","text":"45-de"},{"id":"x","parentId":"","type":"node","text":true},{"id":"y","parentId":"","type":"node","text":null},{"id":"z","parentId":"","type":"node"},{"id":"e","parentId":"","type":"array","numOfChilren":0},{"id":"f","parentId":"","type":"array","numOfChilren":8,"children":[{"id":"f-0","parentId":"f","type":"node","text":91},{"id":"f-1","parentId":"f","type":"node","text":912.3},{"id":"f-2","parentId":"f","type":"node","text":"abc"},{"id":"f-3","parentId":"f","type":"node","text":"945-de"},{"id":"f-4","parentId":"f","type":"node","text":true},{"id":"f-5","parentId":"f","type":"node","text":null},{"id":"f-6","parentId":"f","type":"node"},{"id":"f-7","parentId":"f","type":"array","numOfChilren":3,"children":[{"id":"f-7-0","parentId":"f-7","type":"node","text":5},{"id":"f-7-1","parentId":"f-7","type":"node","text":54.3},{"id":"f-7-2","parentId":"f-7","type":"node","text":"xyz"}]}]},{"id":"g","parentId":"","type":"object","numOfChilren":0},{"id":"h","parentId":"","type":"object","numOfChilren":9,"children":[{"id":"h-ga","parentId":"h","type":"node","text":81},{"id":"h-gb","parentId":"h","type":"node","text":812.3},{"id":"h-gc","parentId":"h","type":"node","text":"abc"},{"id":"h-gd","parentId":"h","type":"node","text":"845-de"},{"id":"h-ge","parentId":"h","type":"array","numOfChilren":7,"children":[{"id":"h-ge-0","parentId":"h-ge","type":"node","text":71},{"id":"h-ge-1","parentId":"h-ge","type":"node","text":712.3},{"id":"h-ge-2","parentId":"h-ge","type":"node","text":"abc"},{"id":"h-ge-3","parentId":"h-ge","type":"node","text":"745-de"},{"id":"h-ge-4","parentId":"h-ge","type":"node","text":true},{"id":"h-ge-5","parentId":"h-ge","type":"node","text":null},{"id":"h-ge-6","parentId":"h-ge","type":"node"}]},{"id":"h-gf","parentId":"h","type":"object","numOfChilren":7,"children":[{"id":"h-gf-gfa","parentId":"h-gf","type":"node","text":61},{"id":"h-gf-gfb","parentId":"h-gf","type":"node","text":612.3},{"id":"h-gf-gfc","parentId":"h-gf","type":"node","text":"abc"},{"id":"h-gf-gfd","parentId":"h-gf","type":"node","text":"645-de"},{"id":"h-gf-gfe","parentId":"h-gf","type":"node","text":true},{"id":"h-gf-gff","parentId":"h-gf","type":"node","text":null},{"id":"h-gf-gfg","parentId":"h-gf","type":"node"}]},{"id":"h-gx","parentId":"h","type":"node","text":true},{"id":"h-gy","parentId":"h","type":"node","text":null},{"id":"h-gz","parentId":"h","type":"node"}]},{"id":"i","parentId":"","type":"node"},{"id":"Symbol(i-sym-key-a)","parentId":"","type":"node","text":"i-sym-value"},{"id":"Symbol(i-sym-key-b)","parentId":"","type":"object","numOfChilren":7,"children":[{"id":"Symbol(i-sym-key-b)-symfa","parentId":"Symbol(i-sym-key-b)","type":"node","text":61},{"id":"Symbol(i-sym-key-b)-symfb","parentId":"Symbol(i-sym-key-b)","type":"node","text":612.3},{"id":"Symbol(i-sym-key-b)-symfc","parentId":"Symbol(i-sym-key-b)","type":"node","text":"abc"},{"id":"Symbol(i-sym-key-b)-symfd","parentId":"Symbol(i-sym-key-b)","type":"node","text":"645-de"},{"id":"Symbol(i-sym-key-b)-symfe","parentId":"Symbol(i-sym-key-b)","type":"node","text":true},{"id":"Symbol(i-sym-key-b)-symff","parentId":"Symbol(i-sym-key-b)","type":"node","text":null},{"id":"Symbol(i-sym-key-b)-symfg","parentId":"Symbol(i-sym-key-b)","type":"node"}]}]`

    it(`should return ${cr} when input ${JSON.stringify(obj)}`, function() {
        let r = convertToTree(obj)
        r = JSON.stringify(r)
        let rr = cr
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = convertToTree('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = convertToTree([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = convertToTree({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = convertToTree(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = convertToTree(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
