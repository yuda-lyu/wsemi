import assert from 'assert'
import arrdiff from '../src/arrdiff.mjs'


describe(`arrdiff`, function() {
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
        let r = arrdiff(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepEqual(r, rr)
    })

    k = 2
    o[k] = {
        old: { id: 'pk', a: 'abc', b: 123 },
        new: { id: 'pk', a: 'abc', b: 123 },
        ret: {}
    }
    it(`should return ${JSON.stringify(o[k].ret)} when input ${JSON.stringify(o[k].old)}, ${JSON.stringify(o[k].new)}, 'temp'`, function() {
        k = 2
        let r = arrdiff(o[k].old, o[k].new, 'temp')
        let rr = o[k].ret
        assert.strict.deepEqual(r, rr)
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
        let r = arrdiff(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepEqual(r, rr)
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
        let r = arrdiff(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepEqual(r, rr)
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
        let r = arrdiff(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepEqual(r, rr)
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
        let r = arrdiff(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepEqual(r, rr)
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
        let r = arrdiff(o[k].old, o[k].new, 'id')
        let rr = o[k].ret
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input ''`, function() {
        let r = arrdiff('')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input []`, function() {
        let r = arrdiff([])
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = arrdiff({})
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input null`, function() {
        let r = arrdiff(null)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input undefined`, function() {
        let r = arrdiff(undefined)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input '', 'id'`, function() {
        let r = arrdiff('', 'id')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input [], 'id'`, function() {
        let r = arrdiff([], 'id')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input {}, 'id'`, function() {
        let r = arrdiff({}, 'id')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input null, 'id'`, function() {
        let r = arrdiff(null, 'id')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input undefined, 'id'`, function() {
        let r = arrdiff(undefined, 'id')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })


    it(`should return {} when input '', ''`, function() {
        let r = arrdiff('', '')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })


    it(`should return {} when input '', []`, function() {
        let r = arrdiff('', [])
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })


    it(`should return {} when input '', {}`, function() {
        let r = arrdiff('', {})
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })


    it(`should return {} when input '', null`, function() {
        let r = arrdiff('', null)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input '', undefined`, function() {
        let r = arrdiff('', undefined)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

})
