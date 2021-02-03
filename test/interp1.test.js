import assert from 'assert'
import interp1 from '../src/interp1.mjs'


describe(`interp1`, function() {

    let ps = [
        { x: 1, y: 0.2 },
        { x: 3, y: 1.2 },
        { x: 4, y: 2 },
    ]

    let optStairs = {
        mode: 'stairs',
    }

    let optStairsWithLimit = {
        mode: 'stairs',
        xMin: 0,
        xMax: 4.5,
    }

    let optStairsWithKey = {
        keyX: 'a',
        keyY: 'b',
    }

    let psKey = [
        { a: 1, b: 0.2 },
        { a: 3, b: 1.2 },
        { a: 4, b: 2 },
    ]

    it(`should return { 'err': 'out of x-range', 'msg': 'x[0] less than lower limit[1]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } } when input ps, 0`, function() {
        let r = interp1(ps, 0)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'x[0] less than lower limit[1]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return 0.2 when input ps, 1`, function() {
        let r = interp1(ps, 1)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 0.7 when input ps, 2`, function() {
        let r = interp1(ps, 2)
        assert.strict.deepStrictEqual(r, 0.7)
    })

    it(`should return 1 when input ps, 2.6`, function() {
        let r = interp1(ps, 2.6)
        assert.strict.deepStrictEqual(r, 1)
    })

    it(`should return 1.2 when input ps, 3`, function() {
        let r = interp1(ps, 3)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 1.6 when input ps, 3.5`, function() {
        let r = interp1(ps, 3.5)
        assert.strict.deepStrictEqual(r, 1.6)
    })

    it(`should return 2 when input ps, 4`, function() {
        let r = interp1(ps, 4)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'x[5] greater than upper limit[4]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 5, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } } when input ps, 5`, function() {
        let r = interp1(ps, 5)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'x[5] greater than upper limit[4]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 5, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'x[-1] less than lower limit[1]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': -1, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } } when input ps, -1, optStairs`, function() {
        let r = interp1(ps, -1, optStairs)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'x[-1] less than lower limit[1]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': -1, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'x[0.51] less than lower limit[1]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0.51, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } } when input ps, 0.51, optStairs`, function() {
        let r = interp1(ps, 0.51, optStairs)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'x[0.51] less than lower limit[1]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0.51, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return 0.2 when input ps, 1, optStairs`, function() {
        let r = interp1(ps, 1, optStairs)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 0.2 when input ps, 1.9, optStairs`, function() {
        let r = interp1(ps, 1.9, optStairs)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 0.2 when input ps, 2, optStairs`, function() {
        let r = interp1(ps, 2, optStairs)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 1.2 when input ps, 2.1, optStairs`, function() {
        let r = interp1(ps, 2.1, optStairs)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 1.2 when input ps, 2.5, optStairs`, function() {
        let r = interp1(ps, 2.5, optStairs)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 1.2 when input ps, 3, optStairs`, function() {
        let r = interp1(ps, 3, optStairs)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 1.2 when input ps, 3.49, optStairs`, function() {
        let r = interp1(ps, 3.49, optStairs)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 1.2 when input ps, 3.5, optStairs`, function() {
        let r = interp1(ps, 3.5, optStairs)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 2 when input ps, 3.51, optStairs`, function() {
        let r = interp1(ps, 3.51, optStairs)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return 2 when input ps, 4, optStairs`, function() {
        let r = interp1(ps, 4, optStairs)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'x[4.5] greater than upper limit[4]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 4.5, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } } when input ps, 4.5, optStairs`, function() {
        let r = interp1(ps, 4.5, optStairs)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'x[4.5] greater than upper limit[4]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 4.5, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'x[-1] less than lower limit[0]', 'data': { 'ps': [{ 'x': 0, 'y': 0.2 }, { 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }, { 'x': 4.5, 'y': 2 }], 'x': -1, 'trend': 'order list', 'xmin': 0, 'xmax': 4.5 } } when input ps, -1, optStairsWithLimit`, function() {
        let r = interp1(ps, -1, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'x[-1] less than lower limit[0]', 'data': { 'ps': [{ 'x': 0, 'y': 0.2 }, { 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }, { 'x': 4.5, 'y': 2 }], 'x': -1, 'trend': 'order list', 'xmin': 0, 'xmax': 4.5 } })
    })

    it(`should return 0.2 when input ps, 0, optStairsWithLimit`, function() {
        let r = interp1(ps, 0, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 0.2 when input ps, 0.49, optStairsWithLimit`, function() {
        let r = interp1(ps, 0.49, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 0.2 when input ps, 0.5, optStairsWithLimit`, function() {
        let r = interp1(ps, 0.5, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 0.2 when input ps, 0.51, optStairsWithLimit`, function() {
        let r = interp1(ps, 0.51, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 0.2 when input ps, 1, optStairsWithLimit`, function() {
        let r = interp1(ps, 1, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 0.2 when input ps, 1.9, optStairsWithLimit`, function() {
        let r = interp1(ps, 1.9, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 0.2 when input ps, 2, optStairsWithLimit`, function() {
        let r = interp1(ps, 2, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 1.2 when input ps, 2.1, optStairsWithLimit`, function() {
        let r = interp1(ps, 2.1, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 1.2 when input ps, 2.5, optStairsWithLimit`, function() {
        let r = interp1(ps, 2.5, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 1.2 when input ps, 3, optStairsWithLimit`, function() {
        let r = interp1(ps, 3, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 1.2 when input ps, 3.49, optStairsWithLimit`, function() {
        let r = interp1(ps, 3.49, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 1.2 when input ps, 3.5, optStairsWithLimit`, function() {
        let r = interp1(ps, 3.5, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 2 when input ps, 3.51, optStairsWithLimit`, function() {
        let r = interp1(ps, 3.51, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return 2 when input ps, 4, optStairsWithLimit`, function() {
        let r = interp1(ps, 4, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return 2 when input ps, 4.49, optStairsWithLimit`, function() {
        let r = interp1(ps, 4.49, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return 2 when input ps, 4.5, optStairsWithLimit`, function() {
        let r = interp1(ps, 4.5, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'x[4.51] greater than upper limit[4.5]', 'data': { 'ps': [{ 'x': 0, 'y': 0.2 }, { 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }, { 'x': 4.5, 'y': 2 }], 'x': 4.51, 'trend': 'order list', 'xmin': 0, 'xmax': 4.5 } } when input ps, 4.51, optStairsWithLimit`, function() {
        let r = interp1(ps, 4.51, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'x[4.51] greater than upper limit[4.5]', 'data': { 'ps': [{ 'x': 0, 'y': 0.2 }, { 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }, { 'x': 4.5, 'y': 2 }], 'x': 4.51, 'trend': 'order list', 'xmin': 0, 'xmax': 4.5 } })
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'x[0] less than lower limit[1]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } } when input psKey, 0, optStairsWithKey`, function() {
        let r = interp1(psKey, 0, optStairsWithKey)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'x[0] less than lower limit[1]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return 0.2 when input psKey, 1, optStairsWithKey`, function() {
        let r = interp1(psKey, 1, optStairsWithKey)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 0.7 when input psKey, 2, optStairsWithKey`, function() {
        let r = interp1(psKey, 2, optStairsWithKey)
        assert.strict.deepStrictEqual(r, 0.7)
    })

    it(`should return 1 when input psKey, 2.6, optStairsWithKey`, function() {
        let r = interp1(psKey, 2.6, optStairsWithKey)
        assert.strict.deepStrictEqual(r, 1)
    })

    it(`should return 1.2 when input psKey, 3, optStairsWithKey`, function() {
        let r = interp1(psKey, 3, optStairsWithKey)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 1.6 when input psKey, 3.5, optStairsWithKey`, function() {
        let r = interp1(psKey, 3.5, optStairsWithKey)
        assert.strict.deepStrictEqual(r, 1.6)
    })

    it(`should return 2 when input psKey, 4, optStairsWithKey`, function() {
        let r = interp1(psKey, 4, optStairsWithKey)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'x[5] greater than upper limit[4]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 5, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } } when input psKey, 5, optStairsWithKey`, function() {
        let r = interp1(psKey, 5, optStairsWithKey)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'x[5] greater than upper limit[4]', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 5, 'trend': 'order list', 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return { 'err': 'ps is not array' } when input '1.25'`, function() {
        let r = interp1('1.25')
        assert.strict.deepStrictEqual(r, { 'err': 'ps is not array' })
    })

    it(`should return { 'err': 'ps is not array' } when input 2.25`, function() {
        let r = interp1(2.25)
        assert.strict.deepStrictEqual(r, { 'err': 'ps is not array' })
    })

    it(`should return { 'err': 'ps is not array' } when input ''`, function() {
        let r = interp1('')
        assert.strict.deepStrictEqual(r, { 'err': 'ps is not array' })
    })

    it(`should return { 'err': 'ps is not array' } when input []`, function() {
        let r = interp1([])
        assert.strict.deepStrictEqual(r, { 'err': 'ps is not array' })
    })

    it(`should return { 'err': 'ps is not array' } when input {}`, function() {
        let r = interp1({})
        assert.strict.deepStrictEqual(r, { 'err': 'ps is not array' })
    })

    it(`should return { 'err': 'ps is not array' } when input null`, function() {
        let r = interp1(null)
        assert.strict.deepStrictEqual(r, { 'err': 'ps is not array' })
    })

    it(`should return { 'err': 'ps is not array' } when input undefined`, function() {
        let r = interp1(undefined)
        assert.strict.deepStrictEqual(r, { 'err': 'ps is not array' })
    })

})
