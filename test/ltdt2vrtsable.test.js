import assert from 'assert'
import ltdt2vrtsable from '../src/ltdt2vrtsable.mjs'


describe(`ltdt2vrtsable`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        ltdt: [
            {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 34.56,
                    style: {}
                },
            }, {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 'xyz',
                    style: {}
                },
            }
        ],
        mgkeys: ['a'],
        out: [
            {
                'a': {
                    'rowspan': 2,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 34.56,
                    'style': {}
                }
            },
            {
                'a': {
                    'rowspan': null,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 'xyz',
                    'style': {}
                }
            }
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].mgkeys)}`, function() {
        k = 1
        let r = ltdt2vrtsable(o[k].ltdt, o[k].mgkeys)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 2
    o[k] = {
        ltdt: [
            {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 34.56,
                    style: {}
                },
            }, {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 'xyz',
                    style: {}
                },
            }
        ],
        mgkeys: [],
        out: [
            {
                'a': {
                    'rowspan': 1,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 34.56,
                    'style': {}
                }
            },
            {
                'a': {
                    'rowspan': 1,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 'xyz',
                    'style': {}
                }
            }
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].mgkeys)}`, function() {
        k = 2
        let r = ltdt2vrtsable(o[k].ltdt, o[k].mgkeys)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 3
    o[k] = {
        ltdt: [
            {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 34.56,
                    style: {}
                },
            }, {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 'xyz',
                    style: {}
                },
            }
        ],
        mgkeys: ['mn'],
        out: [
            {
                'a': {
                    'rowspan': 1,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 34.56,
                    'style': {}
                }
            },
            {
                'a': {
                    'rowspan': 1,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 'xyz',
                    'style': {}
                }
            }
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].mgkeys)}`, function() {
        k = 3
        let r = ltdt2vrtsable(o[k].ltdt, o[k].mgkeys)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 4
    o[k] = {
        ltdt: [],
        mgkeys: [],
        out: []
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].mgkeys)}`, function() {
        k = 4
        let r = ltdt2vrtsable(o[k].ltdt, o[k].mgkeys)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input [{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], ''`, function() {
        let r = ltdt2vrtsable([{ 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 34.56, 'style': {} } }, { 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 'xyz', 'style': {} } }], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    //前面已測
    // it(`sould return [] when input [{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], []`, function() {
    //     let r = ltdt2vrtsable([{ 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 34.56, 'style': {} } }, { 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 'xyz', 'style': {} } }], [])
    //     let rr = []
    //     assert.strict.deepEqual(r, rr)
    // })

    it(`sould return [] when input [{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], {}`, function() {
        let r = ltdt2vrtsable([{ 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 34.56, 'style': {} } }, { 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 'xyz', 'style': {} } }], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input [{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], null`, function() {
        let r = ltdt2vrtsable([{ 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 34.56, 'style': {} } }, { 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 'xyz', 'style': {} } }], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    //前面已測, mgkeys為undefined會自動給[]
    // it(`sould return [] when input [{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], undefined`, function() {
    //     let r = ltdt2vrtsable([{ 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 34.56, 'style': {} } }, { 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 'xyz', 'style': {} } }], undefined)
    //     let rr = []
    //     assert.strict.deepEqual(r, rr)
    // })

    it(`sould return [] when input ''`, function() {
        let r = ltdt2vrtsable('')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = ltdt2vrtsable([])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = ltdt2vrtsable({})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = ltdt2vrtsable(null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = ltdt2vrtsable(undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

})
