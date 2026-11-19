import assert from 'assert'
import interp1 from '../src/interp1.mjs'
import { thrownCases } from './tools/codecThrown.mjs'
import { showDeep } from './tools/caseKit.mjs'


describe(`interp1`, function() {

    let ps = [
        { x: 1, y: 0.2 },
        { x: 3, y: 1.2 },
        { x: 4, y: 2 },
    ]

    let psInv = [
        { x: 4, y: 2 },
        { x: 3, y: 1.2 },
        { x: 1, y: 0.2 },
    ]

    let psKey = [
        { a: 1, b: 0.2 },
        { a: 3, b: 1.2 },
        { a: 4, b: 2 },
    ]

    let psErr = [
        { x: 'a', y: 0.2 },
        { x: 'mnop', y: 1.2 },
        { x: 'xyz', y: 2 },
    ]

    let psEmpty = [
    ]

    let psEffOne = [
        { x: 1, y: 0.2 },
        { x: 'mnop', y: 1.2 },
        { x: 'xyz', y: 2 },
    ]

    let px = [0, 1, 2, 2.6, 3, 3.5, 4, 5]

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

    it(`should return { 'err': 'invalid ps: must contain at least 1 point with a valid x and y', 'ps': [{ 'x': 'a', 'y': 0.2 }, { 'x': 'mnop', 'y': 1.2 }, { 'x': 'xyz', 'y': 2 }], 'psEff': [] } when input psErr, 0`, function() {
        let r = interp1(psErr, 0)
        assert.strict.deepStrictEqual(r, { 'err': 'invalid ps: must contain at least 1 point with a valid x and y', 'ps': [{ 'x': 'a', 'y': 0.2 }, { 'x': 'mnop', 'y': 1.2 }, { 'x': 'xyz', 'y': 2 }], 'psEff': [] })
    })

    it(`should return { 'err': 'invalid ps: must contain at least 1 point with a valid x and y', 'ps': [], 'psEff': [] } when input psEmpty, 0`, function() {
        let r = interp1(psEmpty, 0)
        assert.strict.deepStrictEqual(r, { 'err': 'invalid ps: must contain at least 1 point with a valid x and y', 'ps': [], 'psEff': [] })
    })

    it(`should return { 'err': 'invalid ps: must have at least 2 points', 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 'mnop', 'y': 1.2 }, { 'x': 'xyz', 'y': 2 }], 'psEff': [{ 'x': 1, 'y': 0.2 }] } when input psEffOne, 0`, function() {
        let r = interp1(psEffOne, 0)
        assert.strict.deepStrictEqual(r, { 'err': 'invalid ps: must have at least 2 points', 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 'mnop', 'y': 1.2 }, { 'x': 'xyz', 'y': 2 }], 'psEff': [{ 'x': 1, 'y': 0.2 }] })
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0, 'xmin': 1, 'xmax': 4 } } when input ps, 0`, function() {
        let r = interp1(ps, 0)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0, 'xmin': 1, 'xmax': 4 } })
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

    it(`should return { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 5, 'xmin': 1, 'xmax': 4 } } when input ps, 5`, function() {
        let r = interp1(ps, 5)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 5, 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0, 'xmin': 1, 'xmax': 4 } } when input psInv, 0`, function() {
        let r = interp1(psInv, 0)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0, 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return 0.2 when input psInv, 1`, function() {
        let r = interp1(psInv, 1)
        assert.strict.deepStrictEqual(r, 0.2)
    })

    it(`should return 0.7 when input psInv, 2`, function() {
        let r = interp1(psInv, 2)
        assert.strict.deepStrictEqual(r, 0.7)
    })

    it(`should return 1 when input psInv, 2.6`, function() {
        let r = interp1(psInv, 2.6)
        assert.strict.deepStrictEqual(r, 1)
    })

    it(`should return 1.2 when input psInv, 3`, function() {
        let r = interp1(psInv, 3)
        assert.strict.deepStrictEqual(r, 1.2)
    })

    it(`should return 1.6 when input psInv, 3.5`, function() {
        let r = interp1(psInv, 3.5)
        assert.strict.deepStrictEqual(r, 1.6)
    })

    it(`should return 2 when input psInv, 4`, function() {
        let r = interp1(psInv, 4)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 5, 'xmin': 1, 'xmax': 4 } } when input psInv, 5`, function() {
        let r = interp1(psInv, 5)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 5, 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': -1, 'xmin': 1, 'xmax': 4 } } when input ps, -1, optStairs`, function() {
        let r = interp1(ps, -1, optStairs)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': -1, 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0.51, 'xmin': 1, 'xmax': 4 } } when input ps, 0.51, optStairs`, function() {
        let r = interp1(ps, 0.51, optStairs)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0.51, 'xmin': 1, 'xmax': 4 } })
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

    it(`should return { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 4.5, 'xmin': 1, 'xmax': 4 } } when input ps, 4.5, optStairs`, function() {
        let r = interp1(ps, 4.5, optStairs)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 4.5, 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 0, 'y': 0.2 }, { 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }, { 'x': 4.5, 'y': 2 }], 'x': -1, 'xmin': 0, 'xmax': 4.5 } } when input ps, -1, optStairsWithLimit`, function() {
        let r = interp1(ps, -1, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 0, 'y': 0.2 }, { 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }, { 'x': 4.5, 'y': 2 }], 'x': -1, 'xmin': 0, 'xmax': 4.5 } })
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

    it(`should return { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 0, 'y': 0.2 }, { 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }, { 'x': 4.5, 'y': 2 }], 'x': 4.51, 'xmin': 0, 'xmax': 4.5 } } when input ps, 4.51, optStairsWithLimit`, function() {
        let r = interp1(ps, 4.51, optStairsWithLimit)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 0, 'y': 0.2 }, { 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }, { 'x': 4.5, 'y': 2 }], 'x': 4.51, 'xmin': 0, 'xmax': 4.5 } })
    })

    it(`should return { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0, 'xmin': 1, 'xmax': 4 } } when input psKey, 0, optStairsWithKey`, function() {
        let r = interp1(psKey, 0, optStairsWithKey)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0, 'xmin': 1, 'xmax': 4 } })
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

    it(`should return { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 5, 'xmin': 1, 'xmax': 4 } } when input psKey, 5, optStairsWithKey`, function() {
        let r = interp1(psKey, 5, optStairsWithKey)
        assert.strict.deepStrictEqual(r, { 'err': 'out of x-range', 'msg': 'invalid px: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 5, 'xmin': 1, 'xmax': 4 } })
    })

    it(`should return [{"err":"out of x-range","msg":"invalid px[0]: must be within the x range of ps","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":0,"xmin":1,"xmax":4}},0.2,0.7,1,1.2,1.6,2,{"err":"out of x-range","msg":"invalid px[7]: must be within the x range of ps","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":5,"xmin":1,"xmax":4}}] when input ps, px`, function() {
        let r = interp1(ps, px)
        assert.strict.deepStrictEqual(r, [{ 'err': 'out of x-range', 'msg': 'invalid px[0]: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 0, 'xmin': 1, 'xmax': 4 } }, 0.2, 0.7, 1, 1.2, 1.6, 2, { 'err': 'out of x-range', 'msg': 'invalid px[7]: must be within the x range of ps', 'data': { 'ps': [{ 'x': 1, 'y': 0.2 }, { 'x': 3, 'y': 1.2 }, { 'x': 4, 'y': 2 }], 'x': 5, 'xmin': 1, 'xmax': 4 } }])
    })

    it(`should return { 'err': 'invalid ps: must be an array' } when input '1.25'`, function() {
        let r = interp1('1.25')
        assert.strict.deepStrictEqual(r, { 'err': 'invalid ps: must be an array' })
    })

    it(`should return { 'err': 'invalid ps: must be an array' } when input 2.25`, function() {
        let r = interp1(2.25)
        assert.strict.deepStrictEqual(r, { 'err': 'invalid ps: must be an array' })
    })

    it(`should return { 'err': 'invalid ps: must be an array' } when input ''`, function() {
        let r = interp1('')
        assert.strict.deepStrictEqual(r, { 'err': 'invalid ps: must be an array' })
    })

    it(`should return { 'err': 'invalid px: must be a valid number or an array' } when input []`, function() {
        let r = interp1([])
        assert.strict.deepStrictEqual(r, { 'err': 'invalid px: must be a valid number or an array' })
    })

    it(`should return { 'err': 'invalid ps: must be an array' } when input {}`, function() {
        let r = interp1({})
        assert.strict.deepStrictEqual(r, { 'err': 'invalid ps: must be an array' })
    })

    it(`should return { 'err': 'invalid ps: must be an array' } when input null`, function() {
        let r = interp1(null)
        assert.strict.deepStrictEqual(r, { 'err': 'invalid ps: must be an array' })
    })

    it(`should return { 'err': 'invalid ps: must be an array' } when input undefined`, function() {
        let r = interp1(undefined)
        assert.strict.deepStrictEqual(r, { 'err': 'invalid ps: must be an array' })
    })

    it(`should return { 'err': 'invalid ps: must be an array' } when input NaN`, function() {
        let r = interp1(NaN)
        assert.strict.deepStrictEqual(r, { 'err': 'invalid ps: must be an array' })
    })

})


describe(`interp1 非Error拋出值(R-CODEC-ERR-01之2)`, function() {

    let ps = [
        { x: 1, y: 0.2 },
        { x: 3, y: 1.2 },
        { x: 4, y: 2 },
    ]

    //僅stairs模式於try內才讀呼叫端之opt.xMin與opt.xMax(其餘opt欄位於try外讀取), 故以此二欄位之讀取拋出作為站點(getter與Proxy陷阱各一種讀取方式)
    //thrownCases(test/tools/codecThrown.mjs)為呼叫端可拋出之各種值, msg為_errToStr應得之字串; 修正前catch內err.toString()遇其任一皆再拋TypeError, 使interp1同步外拋至呼叫端

    for (let c of thrownCases) {
        it(`should not throw but return { err: '${c.msg}' } when the getter of opt.xMin throws ${c.name} [R-CODEC-ERR-01之2]`, function() {
            let r = null
            assert.doesNotThrow(() => {
                r = interp1(ps, 2, {
                    mode: 'stairs',
                    get xMin() {
                        throw c.mk()
                    },
                })
            })
            assert.strict.deepStrictEqual(showDeep(r), { err: c.msg })
        })
    }

    for (let c of thrownCases) {
        it(`should not throw but return { err: '${c.msg}' } when the get trap of a Proxy opt throws ${c.name} on reading xMax [R-CODEC-ERR-01之2]`, function() {
            let opt = new Proxy({ mode: 'stairs' }, {
                get(target, key) {
                    if (key === 'xMax') {
                        throw c.mk()
                    }
                    return target[key]
                },
            })
            let r = null
            assert.doesNotThrow(() => {
                r = interp1(ps, 2, opt)
            })
            assert.strict.deepStrictEqual(showDeep(r), { err: c.msg })
        })
    }

    it(`should catch per interpolation point and return [{ err: 'unknown error' }, { err: 'unknown error' }] when px is an array and the getter of opt.xMin throws an object without prototype [R-CODEC-ERR-01之2]`, function() {
        let r = null
        assert.doesNotThrow(() => {
            r = interp1(ps, [2, 3], {
                mode: 'stairs',
                get xMin() {
                    throw Object.create(null)
                },
            })
        })
        assert.strict.deepStrictEqual(showDeep(r), [{ err: 'unknown error' }, { err: 'unknown error' }])
    })

    it(`(守門) should return { err: 'Error: boom' } (same as err.toString()) when the getter of opt.xMin throws an Error [R-CODEC-ERR-01之2]`, function() {
        let r = interp1(ps, 2, {
            mode: 'stairs',
            get xMin() {
                throw new Error('boom')
            },
        })
        assert.strict.deepStrictEqual(showDeep(r), { err: 'Error: boom' })
    })

})


//ws492a: interp1之stairs模式opt.xMin、opt.xMax(對外opt之數值)改以isenum判定, 通過即cdbl轉型後使用; 無效視為未給(結果同不給); 範圍錯誤訊息不帶值
//  規格: dspec〈輸入參數之檢測機制〉K3(opt給了而非預期視為未給)、K4(檢測之值即使用之值)、K7(數字類一律收數字字串)、V20(訊息不帶值, 比較類寫出規則)、§11 Q3-c(判定通過即轉型)
describe(`interp1 stairs opt.xMin與opt.xMax之有效數字判定與轉型(ws492a)`, function() {

    let ps = [
        { x: 1, y: 0.2 },
        { x: 3, y: 1.2 },
        { x: 4, y: 2 },
    ]

    let psInv = [
        { x: 4, y: 2 },
        { x: 3, y: 1.2 },
        { x: 1, y: 0.2 },
    ]

    let px = [-1, 0, 0.3, 0.49, 0.5, 0.51, 0.74, 0.76, 1, 1.9, 2, 2.1, 3, 3.5, 3.51, 4, 4.49, 4.5, 4.51, 6, 9.9, 10, 10.1]

    //非有效數字(isenum為false)之各型值; [標籤, 值]
    let INVALID_NUM = [
        ['undefined', undefined],
        ['null', null],
        ['NaN', NaN],
        ['Infinity', Infinity],
        ['-Infinity', -Infinity],
        [`'Infinity'`, 'Infinity'],
        [`'0x10'`, '0x10'],
        [`'0b11'`, '0b11'],
        [`'abc'`, 'abc'],
        [`'12abc'`, '12abc'],
        [`''`, ''],
        [`'  '`, '  '],
        [`'1e400'`, '1e400'],
        ['true', true],
        ['false', false],
        [`'1e-400'`, '1e-400'], //下溢為0而尾數含非零數字, isenum拒收(cdbl會得0, 故不可省略前置檢測)
        [`'-1e-400'`, '-1e-400'],
        ['new Number(0)', new Number(0)], // eslint-disable-line no-new-wrappers
        [`new String('0')`, new String('0')], // eslint-disable-line no-new-wrappers
        ['{}', {}],
        ['[]', []],
        ['[0]', [0]],
        ['function', () => 0],
        ['BigInt', 0n],
        ['Symbol', Symbol('x')],
    ]

    //spec: 數字字串之opt.xMin/xMax可用且結果與同值數字完全相同(含各px之{ err }與其data內擴充後之ps, 其x須為數字)
    it(`should give the same results for numeric-string xMin and xMax as for the numbers (including px results and err data)`, function() {
        let cases = [
            [0.5, 4.5],
            [-1, 10],
            [0, 4.5],
            [1, 4],
            [0.5, 4],
            [1, 4.5],
            [-1, 4],
        ]
        let forms = [
            (v) => String(v),
            (v) => ` ${v} `,
            (v) => (v >= 0 ? `+${v}` : String(v)),
            (v) => Number(v).toExponential(),
        ]
        for (let [a, b] of cases) {
            let rn = interp1(ps, px, { mode: 'stairs', xMin: a, xMax: b })
            for (let f of forms) {
                let rs = interp1(ps, px, { mode: 'stairs', xMin: f(a), xMax: f(b) })
                assert.strict.deepStrictEqual(rs, rn, `xMin=${f(a)} xMax=${f(b)}`)
                let ri = interp1(psInv, px, { mode: 'stairs', xMin: f(a), xMax: f(b) })
                assert.strict.deepStrictEqual(ri, interp1(psInv, px, { mode: 'stairs', xMin: a, xMax: b }), `inv xMin=${f(a)} xMax=${f(b)}`)
            }
        }
    })

    //spec: K4檢測之值即使用之值: 擴充後之端點x為數字(修前為字串, (p0.x + p1.x) / 2成字串串接而得錯誤區間)
    it(`should use the converted number for the extended end points (x of the added point is a number, not a string)`, function() {
        let r = interp1(ps, -1, { mode: 'stairs', xMin: '0.5', xMax: '4.5' })
        assert.strict.deepStrictEqual(r.err, 'out of x-range')
        assert.strict.deepStrictEqual(r.data.xmin, 0.5)
        assert.strict.deepStrictEqual(typeof r.data.xmin, 'number')
        assert.strict.deepStrictEqual(r.data.ps[0], { x: 0.5, y: 0.2 })
        assert.strict.deepStrictEqual(typeof r.data.ps[0].x, 'number')
        let r2 = interp1(ps, 10, { mode: 'stairs', xMin: '0.5', xMax: '4.5' })
        assert.strict.deepStrictEqual(r2.data.xmax, 4.5)
        assert.strict.deepStrictEqual(r2.data.ps[r2.data.ps.length - 1], { x: 4.5, y: 2 })
        assert.strict.deepStrictEqual(typeof r2.data.ps[r2.data.ps.length - 1].x, 'number')
        //數值正確: 0.5與1之中點0.75為起點, 故0.74落於擴充點(y=0.2)、0.76落於原第一點(y=0.2)
        assert.strict.deepStrictEqual(interp1(ps, 0.74, { mode: 'stairs', xMin: '0.5' }), 0.2)
        assert.strict.deepStrictEqual(interp1(ps, 4.25, { mode: 'stairs', xMax: '4.5' }), 2)
    })

    //spec: 文件範例(optX)之數字字串版結果相同
    it(`should keep the documented stairs-with-x-limit results when xMin and xMax are given as numeric strings`, function() {
        let optN = { mode: 'stairs', xMin: 0, xMax: 4.5 }
        let optS = { mode: 'stairs', xMin: '0', xMax: '4.5' }
        for (let x of [0, 0.49, 0.5, 0.51, 1, 1.9, 2, 2.1, 2.5, 3, 3.49, 3.5, 3.51, 4, 4.49, 4.5, 4.51, -1]) {
            assert.strict.deepStrictEqual(interp1(ps, x, optS), interp1(ps, x, optN), `x=${x}`)
        }
        assert.strict.deepStrictEqual(interp1(ps, 0, optS), 0.2)
        assert.strict.deepStrictEqual(interp1(ps, 4.5, optS), 2)
    })

    //spec: K3 opt.xMin非有效數字視為未給(結果同不給xMin)
    for (let [label, v] of INVALID_NUM) {
        it(`should treat opt.xMin ${label} as not given (same results as without xMin)`, function() {
            for (let psNow of [ps, psInv]) {
                let rBase = interp1(psNow, px, { mode: 'stairs' })
                let r = interp1(psNow, px, { mode: 'stairs', xMin: v })
                assert.strict.deepStrictEqual(r, rBase)
                //與另一端併用: 另一端有效時照用
                let rBase2 = interp1(psNow, px, { mode: 'stairs', xMax: 4.5 })
                let r2 = interp1(psNow, px, { mode: 'stairs', xMin: v, xMax: 4.5 })
                assert.strict.deepStrictEqual(r2, rBase2)
            }
        })
    }

    //spec: K3 opt.xMax非有效數字視為未給(結果同不給xMax)
    for (let [label, v] of INVALID_NUM) {
        it(`should treat opt.xMax ${label} as not given (same results as without xMax)`, function() {
            for (let psNow of [ps, psInv]) {
                let rBase = interp1(psNow, px, { mode: 'stairs' })
                let r = interp1(psNow, px, { mode: 'stairs', xMax: v })
                assert.strict.deepStrictEqual(r, rBase)
                let rBase2 = interp1(psNow, px, { mode: 'stairs', xMin: 0 })
                let r2 = interp1(psNow, px, { mode: 'stairs', xMin: 0, xMax: v })
                assert.strict.deepStrictEqual(r2, rBase2)
            }
        })
    }

    //spec: 範圍錯誤之訊息依V20不帶值, 寫出規則; 回傳形狀{ err }不變
    it(`should return { err: 'invalid opt.xMin: must be <= the smallest x of ps' } without the values when opt.xMin is greater than the smallest x`, function() {
        let msg = 'invalid opt.xMin: must be <= the smallest x of ps'
        assert.strict.deepStrictEqual(interp1(ps, 2, { mode: 'stairs', xMin: 2 }), { err: msg })
        assert.strict.deepStrictEqual(interp1(ps, 2, { mode: 'stairs', xMin: '2' }), { err: msg })
        assert.strict.deepStrictEqual(interp1(ps, 2, { mode: 'stairs', xMin: ' 1.0000001 ' }), { err: msg })
        assert.strict.deepStrictEqual(interp1(psInv, 2, { mode: 'stairs', xMin: 2 }), { err: msg })
        //px為陣列時各元素原位皆為{ err }
        assert.strict.deepStrictEqual(interp1(ps, [1, 2, 3], { mode: 'stairs', xMin: '1234.5' }), [{ err: msg }, { err: msg }, { err: msg }])
        //邊界: xMin等於最小x不報錯(不擴充)
        assert.strict.deepStrictEqual(interp1(ps, 2, { mode: 'stairs', xMin: 1 }), 0.2)
        assert.strict.deepStrictEqual(interp1(ps, 2, { mode: 'stairs', xMin: '1' }), 0.2)
    })

    it(`should return { err: 'invalid opt.xMax: must be >= the largest x of ps' } without the values when opt.xMax is less than the largest x`, function() {
        let msg = 'invalid opt.xMax: must be >= the largest x of ps'
        assert.strict.deepStrictEqual(interp1(ps, 2, { mode: 'stairs', xMax: 3 }), { err: msg })
        assert.strict.deepStrictEqual(interp1(ps, 2, { mode: 'stairs', xMax: '3' }), { err: msg })
        assert.strict.deepStrictEqual(interp1(ps, 2, { mode: 'stairs', xMax: ' 3.9999999 ' }), { err: msg })
        assert.strict.deepStrictEqual(interp1(psInv, 2, { mode: 'stairs', xMax: 3 }), { err: msg })
        assert.strict.deepStrictEqual(interp1(ps, [1, 2, 3], { mode: 'stairs', xMax: '-1234.5' }), [{ err: msg }, { err: msg }, { err: msg }])
        //邊界: xMax等於最大x不報錯(不擴充)
        assert.strict.deepStrictEqual(interp1(ps, 2, { mode: 'stairs', xMax: 4 }), 0.2)
        assert.strict.deepStrictEqual(interp1(ps, 2, { mode: 'stairs', xMax: '4' }), 0.2)
    })

    it(`should not contain any number of the input in the range error messages (V20)`, function() {
        let a = interp1(ps, 2, { mode: 'stairs', xMin: 987654.25 })
        let b = interp1(ps, 2, { mode: 'stairs', xMax: -987654.25 })
        for (let r of [a, b]) {
            assert.strict.deepStrictEqual(Object.keys(r), ['err'])
            assert.strict.deepStrictEqual(/\d/.test(r.err), false)
        }
    })

    //spec: 自訂鍵名(keyX/keyY)之階梯模式與數字字串xMin/xMax併用, 結果與數字相同, 並以獨立期望值驗(非僅與數字選項互比)
    //  ps之x為1、3、4(y為0.2、1.2、2); xMin=0、xMax=4.5時各階為[0,2](0.2)、(2,3.5](1.2)、(3.5,4.5](2)(同文件範例optX)
    it(`should use numeric-string xMin and xMax in stairs mode with custom keyX and keyY, with independent expected values`, function() {
        let psKey = [
            { a: 1, b: 0.2 },
            { a: 3, b: 1.2 },
            { a: 4, b: 2 },
        ]
        let optS = { mode: 'stairs', keyX: 'a', keyY: 'b', xMin: '0', xMax: ' 4.5 ' }
        let optN = { mode: 'stairs', keyX: 'a', keyY: 'b', xMin: 0, xMax: 4.5 }
        let pxs = [0, 2, 2.1, 3.5, 3.51, 4.5]
        assert.strict.deepStrictEqual(interp1(psKey, pxs, optS), [0.2, 0.2, 1.2, 1.2, 2, 2])
        assert.strict.deepStrictEqual(interp1(psKey, pxs, optS), interp1(psKey, pxs, optN))
        assert.strict.deepStrictEqual(interp1(psKey, -1, optS).err, 'out of x-range')
        assert.strict.deepStrictEqual(interp1(psKey, 4.6, optS).err, 'out of x-range')
        //未給xMin/xMax時以自身之範圍為界
        assert.strict.deepStrictEqual(interp1(psKey, 0, { mode: 'stairs', keyX: 'a', keyY: 'b' }).err, 'out of x-range')
    })

    //spec: 非stairs模式不使用xMin/xMax(守門, 不受本輪影響)
    it(`should ignore opt.xMin and opt.xMax in linear and blocks modes`, function() {
        for (let mode of ['linear', 'blocks']) {
            let rBase = interp1(ps, px, { mode })
            assert.strict.deepStrictEqual(interp1(ps, px, { mode, xMin: '0', xMax: '10' }), rBase, mode)
            assert.strict.deepStrictEqual(interp1(ps, px, { mode, xMin: 0, xMax: 10 }), rBase, mode)
        }
    })

    //spec: 數字xMin/xMax既有結果不變(守門): 文件範例optX之數字結果
    it(`should keep the results for numeric xMin and xMax`, function() {
        let opt = { mode: 'stairs', xMin: 0, xMax: 4.5 }
        assert.strict.deepStrictEqual(interp1(ps, 0, opt), 0.2)
        assert.strict.deepStrictEqual(interp1(ps, 2.1, opt), 1.2)
        assert.strict.deepStrictEqual(interp1(ps, 3.51, opt), 2)
        assert.strict.deepStrictEqual(interp1(ps, 4.5, opt), 2)
        assert.strict.deepStrictEqual(interp1(ps, 4.51, opt).err, 'out of x-range')
        assert.strict.deepStrictEqual(interp1(ps, -1, opt).err, 'out of x-range')
    })

})
