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
    let crobj = `[{"id":"root","parentId":"","type":"object","key":"root","numOfChilren":12,"children":[{"id":"root-a","parentId":"root","type":"node","key":"a","text":1},{"id":"root-b","parentId":"root","type":"node","key":"b","text":12.3},{"id":"root-c","parentId":"root","type":"node","key":"c","text":"abc"},{"id":"root-d","parentId":"root","type":"node","key":"d","text":"45-de"},{"id":"root-x","parentId":"root","type":"node","key":"x","text":true},{"id":"root-y","parentId":"root","type":"node","key":"y","text":null},{"id":"root-z","parentId":"root","type":"node","key":"z"},{"id":"root-e","parentId":"root","type":"array","key":"e","numOfChilren":0},{"id":"root-f","parentId":"root","type":"array","key":"f","numOfChilren":8,"children":[{"id":"root-f-0","parentId":"root-f","type":"node","key":0,"text":91},{"id":"root-f-1","parentId":"root-f","type":"node","key":1,"text":912.3},{"id":"root-f-2","parentId":"root-f","type":"node","key":2,"text":"abc"},{"id":"root-f-3","parentId":"root-f","type":"node","key":3,"text":"945-de"},{"id":"root-f-4","parentId":"root-f","type":"node","key":4,"text":true},{"id":"root-f-5","parentId":"root-f","type":"node","key":5,"text":null},{"id":"root-f-6","parentId":"root-f","type":"node","key":6},{"id":"root-f-7","parentId":"root-f","type":"array","key":7,"numOfChilren":3,"children":[{"id":"root-f-7-0","parentId":"root-f-7","type":"node","key":0,"text":5},{"id":"root-f-7-1","parentId":"root-f-7","type":"node","key":1,"text":54.3},{"id":"root-f-7-2","parentId":"root-f-7","type":"node","key":2,"text":"xyz"}]}]},{"id":"root-g","parentId":"root","type":"object","key":"g","numOfChilren":0},{"id":"root-h","parentId":"root","type":"object","key":"h","numOfChilren":9,"children":[{"id":"root-h-ga","parentId":"root-h","type":"node","key":"ga","text":81},{"id":"root-h-gb","parentId":"root-h","type":"node","key":"gb","text":812.3},{"id":"root-h-gc","parentId":"root-h","type":"node","key":"gc","text":"abc"},{"id":"root-h-gd","parentId":"root-h","type":"node","key":"gd","text":"845-de"},{"id":"root-h-ge","parentId":"root-h","type":"array","key":"ge","numOfChilren":7,"children":[{"id":"root-h-ge-0","parentId":"root-h-ge","type":"node","key":0,"text":71},{"id":"root-h-ge-1","parentId":"root-h-ge","type":"node","key":1,"text":712.3},{"id":"root-h-ge-2","parentId":"root-h-ge","type":"node","key":2,"text":"abc"},{"id":"root-h-ge-3","parentId":"root-h-ge","type":"node","key":3,"text":"745-de"},{"id":"root-h-ge-4","parentId":"root-h-ge","type":"node","key":4,"text":true},{"id":"root-h-ge-5","parentId":"root-h-ge","type":"node","key":5,"text":null},{"id":"root-h-ge-6","parentId":"root-h-ge","type":"node","key":6}]},{"id":"root-h-gf","parentId":"root-h","type":"object","key":"gf","numOfChilren":7,"children":[{"id":"root-h-gf-gfa","parentId":"root-h-gf","type":"node","key":"gfa","text":61},{"id":"root-h-gf-gfb","parentId":"root-h-gf","type":"node","key":"gfb","text":612.3},{"id":"root-h-gf-gfc","parentId":"root-h-gf","type":"node","key":"gfc","text":"abc"},{"id":"root-h-gf-gfd","parentId":"root-h-gf","type":"node","key":"gfd","text":"645-de"},{"id":"root-h-gf-gfe","parentId":"root-h-gf","type":"node","key":"gfe","text":true},{"id":"root-h-gf-gff","parentId":"root-h-gf","type":"node","key":"gff","text":null},{"id":"root-h-gf-gfg","parentId":"root-h-gf","type":"node","key":"gfg"}]},{"id":"root-h-gx","parentId":"root-h","type":"node","key":"gx","text":true},{"id":"root-h-gy","parentId":"root-h","type":"node","key":"gy","text":null},{"id":"root-h-gz","parentId":"root-h","type":"node","key":"gz"}]},{"id":"root-i","parentId":"root","type":"node","key":"i"},{"id":"root-Symbol(i-sym-key-a)","parentId":"root","type":"node","text":"i-sym-value"},{"id":"root-Symbol(i-sym-key-b)","parentId":"root","type":"object","numOfChilren":7,"children":[{"id":"root-Symbol(i-sym-key-b)-symfa","parentId":"root-Symbol(i-sym-key-b)","type":"node","key":"symfa","text":61},{"id":"root-Symbol(i-sym-key-b)-symfb","parentId":"root-Symbol(i-sym-key-b)","type":"node","key":"symfb","text":612.3},{"id":"root-Symbol(i-sym-key-b)-symfc","parentId":"root-Symbol(i-sym-key-b)","type":"node","key":"symfc","text":"abc"},{"id":"root-Symbol(i-sym-key-b)-symfd","parentId":"root-Symbol(i-sym-key-b)","type":"node","key":"symfd","text":"645-de"},{"id":"root-Symbol(i-sym-key-b)-symfe","parentId":"root-Symbol(i-sym-key-b)","type":"node","key":"symfe","text":true},{"id":"root-Symbol(i-sym-key-b)-symff","parentId":"root-Symbol(i-sym-key-b)","type":"node","key":"symff","text":null},{"id":"root-Symbol(i-sym-key-b)-symfg","parentId":"root-Symbol(i-sym-key-b)","type":"node","key":"symfg"}]}]}]`

    it(`should return ${crobj} when input ${JSON.stringify(obj)}`, function() {
        let r = convertToTree(obj)
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
    let crarr = `[{"id":"root","parentId":"","type":"array","key":"root","numOfChilren":9,"children":[{"id":"root-0","parentId":"root","type":"node","key":0,"text":91},{"id":"root-1","parentId":"root","type":"node","key":1,"text":912.3},{"id":"root-2","parentId":"root","type":"node","key":2,"text":"abc"},{"id":"root-3","parentId":"root","type":"node","key":3,"text":"945-de"},{"id":"root-4","parentId":"root","type":"node","key":4,"text":true},{"id":"root-5","parentId":"root","type":"node","key":5,"text":null},{"id":"root-6","parentId":"root","type":"node","key":6},{"id":"root-7","parentId":"root","type":"array","key":7,"numOfChilren":4,"children":[{"id":"root-7-0","parentId":"root-7","type":"node","key":0,"text":5},{"id":"root-7-1","parentId":"root-7","type":"node","key":1,"text":54.3},{"id":"root-7-2","parentId":"root-7","type":"node","key":2,"text":"xyz"},{"id":"root-7-3","parentId":"root-7","type":"object","key":3,"numOfChilren":1,"children":[{"id":"root-7-3-gf","parentId":"root-7-3","type":"object","key":"gf","numOfChilren":7,"children":[{"id":"root-7-3-gf-gfa","parentId":"root-7-3-gf","type":"node","key":"gfa","text":61},{"id":"root-7-3-gf-gfb","parentId":"root-7-3-gf","type":"node","key":"gfb","text":612.3},{"id":"root-7-3-gf-gfc","parentId":"root-7-3-gf","type":"node","key":"gfc","text":"abc"},{"id":"root-7-3-gf-gfd","parentId":"root-7-3-gf","type":"node","key":"gfd","text":"645-de"},{"id":"root-7-3-gf-gfe","parentId":"root-7-3-gf","type":"node","key":"gfe","text":true},{"id":"root-7-3-gf-gff","parentId":"root-7-3-gf","type":"node","key":"gff","text":null},{"id":"root-7-3-gf-gfg","parentId":"root-7-3-gf","type":"node","key":"gfg"}]}]}]},{"id":"root-8","parentId":"root","type":"object","key":8,"numOfChilren":2,"children":[{"id":"root-8-h","parentId":"root-8","type":"object","key":"h","numOfChilren":8,"children":[{"id":"root-8-h-ga","parentId":"root-8-h","type":"node","key":"ga","text":81},{"id":"root-8-h-gb","parentId":"root-8-h","type":"node","key":"gb","text":812.3},{"id":"root-8-h-gc","parentId":"root-8-h","type":"node","key":"gc","text":"abc"},{"id":"root-8-h-gd","parentId":"root-8-h","type":"node","key":"gd","text":"845-de"},{"id":"root-8-h-ge","parentId":"root-8-h","type":"array","key":"ge","numOfChilren":7,"children":[{"id":"root-8-h-ge-0","parentId":"root-8-h-ge","type":"node","key":0,"text":71},{"id":"root-8-h-ge-1","parentId":"root-8-h-ge","type":"node","key":1,"text":712.3},{"id":"root-8-h-ge-2","parentId":"root-8-h-ge","type":"node","key":2,"text":"abc"},{"id":"root-8-h-ge-3","parentId":"root-8-h-ge","type":"node","key":3,"text":"745-de"},{"id":"root-8-h-ge-4","parentId":"root-8-h-ge","type":"node","key":4,"text":true},{"id":"root-8-h-ge-5","parentId":"root-8-h-ge","type":"node","key":5,"text":null},{"id":"root-8-h-ge-6","parentId":"root-8-h-ge","type":"node","key":6}]},{"id":"root-8-h-gx","parentId":"root-8-h","type":"node","key":"gx","text":true},{"id":"root-8-h-gy","parentId":"root-8-h","type":"node","key":"gy","text":null},{"id":"root-8-h-gz","parentId":"root-8-h","type":"node","key":"gz"}]},{"id":"root-8-i","parentId":"root-8","type":"node","key":"i"},{"id":"root-8-Symbol(i-sym-key-a)","parentId":"root-8","type":"node","text":"i-sym-value"},{"id":"root-8-Symbol(i-sym-key-b)","parentId":"root-8","type":"object","numOfChilren":7,"children":[{"id":"root-8-Symbol(i-sym-key-b)-symfa","parentId":"root-8-Symbol(i-sym-key-b)","type":"node","key":"symfa","text":61},{"id":"root-8-Symbol(i-sym-key-b)-symfb","parentId":"root-8-Symbol(i-sym-key-b)","type":"node","key":"symfb","text":612.3},{"id":"root-8-Symbol(i-sym-key-b)-symfc","parentId":"root-8-Symbol(i-sym-key-b)","type":"node","key":"symfc","text":"abc"},{"id":"root-8-Symbol(i-sym-key-b)-symfd","parentId":"root-8-Symbol(i-sym-key-b)","type":"node","key":"symfd","text":"645-de"},{"id":"root-8-Symbol(i-sym-key-b)-symfe","parentId":"root-8-Symbol(i-sym-key-b)","type":"node","key":"symfe","text":true},{"id":"root-8-Symbol(i-sym-key-b)-symff","parentId":"root-8-Symbol(i-sym-key-b)","type":"node","key":"symff","text":null},{"id":"root-8-Symbol(i-sym-key-b)-symfg","parentId":"root-8-Symbol(i-sym-key-b)","type":"node","key":"symfg"}]}]}]}]`

    it(`should return ${crarr} when input ${JSON.stringify(arr)}`, function() {
        let r = convertToTree(arr)
        r = JSON.stringify(r)
        let rr = crarr
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${crobj} when input ${JSON.stringify(obj)}`, function() {
        let r = convertToTree(obj)
        r = JSON.stringify(r)
        let rr = crobj
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
