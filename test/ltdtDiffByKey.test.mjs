import assert from 'assert'
import ltdtDiffByKey from '../src/ltdtDiffByKey.mjs'


describe(`ltdtDiffByKey`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        old: { id: 'pk', a: 'abc', b: 123 },
        new: { id: 'pk', a: 'abc', b: 123 },
        ret: {
            infor: { pk: 'same' },
            del: [],
            same: [{ id: 'pk', a: 'abc', b: 123 }],
            diff: [],
            add: [],
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'id'`, function() {
        k = 1
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        old: { id: 'pk', a: 'abc', b: 123 },
        new: { id: 'pk', a: 'abc', b: 123 },
        ret: { infor: {}, del: [], same: [], diff: [], add: [] }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'temp'`, function() {
        k = 2
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'temp')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        old: { id: 'pk', a: 'abc', b: 123 },
        new: { id: 'pk', a: 'abc', b: 456 },
        ret: {
            infor: { pk: 'diff' },
            del: [],
            same: [],
            diff: [{ id: 'pk', a: 'abc', b: 456 }],
            add: [],
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'id'`, function() {
        k = 3
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    o[k] = {
        old: { id: 'pk', a: 'abc', b: 123 },
        new: { id: 'pk1', a: 'abc', b: 456 },
        ret: {
            infor: { pk: 'del', pk1: 'add' },
            del: [{ id: 'pk', a: 'abc', b: 123 }],
            same: [],
            diff: [],
            add: [{ id: 'pk1', a: 'abc', b: 456 }],
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'id'`, function() {
        k = 4
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 5
    o[k] = {
        old: { id: 'pk', a: 'abc', b: 123 },
        new: [{ id: 'pk', a: 'abc', b: 123 }, { id: 'pk1', a: 'abc', b: 123 }],
        ret: {
            infor: { pk: 'same', pk1: 'add' },
            del: [],
            same: [{ id: 'pk', a: 'abc', b: 123 }],
            diff: [],
            add: [{ id: 'pk1', a: 'abc', b: 123 }],
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'id'`, function() {
        k = 5
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 6
    o[k] = {
        old: [{ id: 'pk', a: 'abc', b: 123 }, { id: 'pk2', a: 'abc', b: 123 }],
        new: [{ id: 'pk', a: 'abc', b: 123 }, { id: 'pk1', a: 'abc', b: 123 }],
        ret: {
            infor: { pk: 'same', pk1: 'add', pk2: 'del' },
            del: [{ id: 'pk2', a: 'abc', b: 123 }],
            same: [{ id: 'pk', a: 'abc', b: 123 }],
            diff: [],
            add: [{ id: 'pk1', a: 'abc', b: 123 }],
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'id'`, function() {
        k = 6
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 7
    o[k] = {
        old: [{ id: 'pk', a: 'abc', b: 123 }, { id: 'pk2', a: 'abc', b: 123 }],
        new: [{ id: 'pk', a: 'abc', b: 456 }, { id: 'pk1', a: 'abc', b: 123 }],
        ret: {
            infor: { pk: 'diff', pk1: 'add', pk2: 'del' },
            del: [{ id: 'pk2', a: 'abc', b: 123 }],
            same: [],
            diff: [{ id: 'pk', a: 'abc', b: 456 }],
            add: [{ id: 'pk1', a: 'abc', b: 123 }],
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'id'`, function() {
        k = 7
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 8
    o[k] = {
        old: [{ x: 'xa', y: 'y1' }],
        new: [{ x: 'xa', y: 'y1' }],
        ret: {
            infor: { xa: 'same' },
            del: [],
            same: [{ x: 'xa', y: 'y1' }],
            diff: [],
            add: []
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'x'`, function() {
        k = 8
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'x')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 9
    o[k] = {
        old: [{ x: 'xa', y: 'y1' }],
        new: [],
        ret: {
            infor: { xa: 'del' },
            del: [{ x: 'xa', y: 'y1' }],
            same: [],
            diff: [],
            add: []
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'x'`, function() {
        k = 9
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'x')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 10
    o[k] = {
        old: [],
        new: [{ x: 'xa', y: 'y1' }],
        ret: {
            infor: { xa: 'add' },
            del: [],
            same: [],
            diff: [],
            add: [{ x: 'xa', y: 'y1' }]
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'x'`, function() {
        k = 10
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'x')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 11
    o[k] = {
        old: [{ z: 'zz' }, { x: 'xa', y: 'y1' }],
        new: [{ z: 'zz' }],
        ret: {
            infor: { xa: 'del' },
            del: [{ x: 'xa', y: 'y1' }],
            same: [],
            diff: [],
            add: []
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'x'`, function() {
        k = 11
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'x')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 12
    o[k] = {
        old: [{ z: 'zz' }],
        new: [{ z: 'zz' }, { x: 'xa', y: 'y1' }],
        ret: {
            infor: { xa: 'add' },
            del: [],
            same: [],
            diff: [],
            add: [{ x: 'xa', y: 'y1' }]
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'x'`, function() {
        k = 12
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'x')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 13
    o[k] = {
        old: [{ x: 'xa', y: 'y1' }, { x: 'xb', y: 'y2' }],
        new: [{ x: 'xa', z: 'z3' }],
        ret: {
            infor: { xa: 'diff', xb: 'del' },
            del: [{ x: 'xb', y: 'y2' }],
            same: [],
            diff: [{ x: 'xa', z: 'z3' }],
            add: []
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'x'`, function() {
        k = 13
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'x')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 14
    o[k] = {
        old: [{ id: 'id-1', a: 'a1' }, { id: 'id-2', a: 'a2' }, { id: 'id-3', a: 'a3' }],
        new: [{ id: 'id-1', z: 'z3' }, { id: 'id-3', a: 'a3' }, { id: 'id-4', a: 'a4' }],
        ret: {
            infor: { 'id-1': 'diff', 'id-2': 'del', 'id-3': 'same', 'id-4': 'add' },
            del: [{ id: 'id-2', a: 'a2' }],
            same: [{ id: 'id-3', a: 'a3' }],
            diff: [{ id: 'id-1', z: 'z3' }],
            add: [{ id: 'id-4', a: 'a4' }]
        }
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'id'`, function() {
        k = 14
        let r = ltdtDiffByKey(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return {} when input ''`, function() {
        let r = ltdtDiffByKey('')
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input []`, function() {
        let r = ltdtDiffByKey([])
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = ltdtDiffByKey({})
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input null`, function() {
        let r = ltdtDiffByKey(null)
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input undefined`, function() {
        let r = ltdtDiffByKey(undefined)
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input NaN`, function() {
        let r = ltdtDiffByKey(NaN)
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input '', 'id'`, function() {
        let r = ltdtDiffByKey('', 'id')
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input [], 'id'`, function() {
        let r = ltdtDiffByKey([], 'id')
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}, 'id'`, function() {
        let r = ltdtDiffByKey({}, 'id')
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input null, 'id'`, function() {
        let r = ltdtDiffByKey(null, 'id')
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input undefined, 'id'`, function() {
        let r = ltdtDiffByKey(undefined, 'id')
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return {} when input '', ''`, function() {
        let r = ltdtDiffByKey('', '')
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return {} when input '', []`, function() {
        let r = ltdtDiffByKey('', [])
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return {} when input '', {}`, function() {
        let r = ltdtDiffByKey('', {})
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return {} when input '', null`, function() {
        let r = ltdtDiffByKey('', null)
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input '', undefined`, function() {
        let r = ltdtDiffByKey('', undefined)
        let rr = { infor: {}, del: [], same: [], diff: [], add: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

})
