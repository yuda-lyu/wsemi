import assert from 'assert'
import arrGroupByMaxmin from '../src/arrGroupByMaxmin.mjs'


describe(`arrGroupByMaxmin`, function() {

    let arr1 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
    let mm1 = [
        {
            min: 0,
            max: 2,
        },
        {
            min: 2,
            max: 5,
        },
    ]
    // console.log(arrGroupByMaxmin(arr1, mm1))
    let r1 = [
        { min: 0, max: 2, items: [1.1] },
        { min: 2, max: 5, items: [2.2, 3.3, 4.4] }
    ]
    it(`should return ${JSON.stringify(r1)} when input ${JSON.stringify(arr1)}, ${JSON.stringify(mm1)}`, function() {
        let r = arrGroupByMaxmin(arr1, mm1)
        let rr = r1
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr2 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
    let mm2 = [
        {
            min: 0,
            max: 2,
        },
        {
            min: 2.5,
            max: 5,
        },
    ]
    // console.log(arrGroupByMaxmin(arr2, mm2))
    let r2 = [
        { min: 0, max: 2, items: [1.1] },
        { min: 2.5, max: 5, items: [3.3, 4.4] }
    ]
    it(`should return ${JSON.stringify(r2)} when input ${JSON.stringify(arr2)}, ${JSON.stringify(mm2)}`, function() {
        let r = arrGroupByMaxmin(arr2, mm2)
        let rr = r2
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr3 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
    let mm3 = [
        {
            min: -1e20,
            max: 2,
        },
        {
            min: 2.5,
            max: 5,
        },
        {
            min: 6,
            max: 1e20,
        },
    ]
    // console.log(arrGroupByMaxmin(arr3, mm3))
    let r3 = [
        { min: -100000000000000000000, max: 2, items: [1.1] },
        { min: 2.5, max: 5, items: [3.3, 4.4] },
        { min: 6, max: 100000000000000000000, items: [6.6] }
    ]
    it(`should return ${JSON.stringify(r3)} when input ${JSON.stringify(arr3)}, ${JSON.stringify(mm3)}`, function() {
        let r = arrGroupByMaxmin(arr3, mm3)
        let rr = r3
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr4 = [
        {
            name: 'a',
            value: 1.1,
        },
        {
            name: 'b',
            value: 2.2,
        },
        {
            name: 'c',
            value: 3.3,
        },
        {
            name: 'd',
            value: 4.4,
        },
        {
            name: 'e',
            value: 5.5,
        },
        {
            name: 'f',
            value: 6.6,
        },
    ]
    let mm4 = [
        {
            min: 0,
            max: 2,
        },
        {
            min: 2,
            max: 5,
        },
    ]
    // console.log(JSON.stringify(arrGroupByMaxmin(arr4, mm4), null, 2))
    let r4 = [
        {
            'min': 0,
            'max': 2,
            'items': [
                {
                    'name': 'a',
                    'value': 1.1
                }
            ]
        },
        {
            'min': 2,
            'max': 5,
            'items': [
                {
                    'name': 'b',
                    'value': 2.2
                },
                {
                    'name': 'c',
                    'value': 3.3
                },
                {
                    'name': 'd',
                    'value': 4.4
                }
            ]
        }
    ]
    it(`should return ${JSON.stringify(r4)} when input ${JSON.stringify(arr4)}, ${JSON.stringify(mm4)}`, function() {
        let r = arrGroupByMaxmin(arr4, mm4)
        let rr = r4
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr5 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
    let mm5 = [
        {
            rmin: 0,
            rmax: 2,
        },
        {
            rmin: 2,
            rmax: 5,
        },
    ]
    // console.log(arrGroupByMaxmin(arr5, mm5, { keyMin: 'rmin', keyMax: 'rmax' }))
    let r5 = [
        { rmin: 0, rmax: 2, items: [1.1] },
        { rmin: 2, rmax: 5, items: [2.2, 3.3, 4.4] }
    ]
    it(`should return ${JSON.stringify(r5)} when input ${JSON.stringify(arr5)}, ${JSON.stringify(mm5)}, { keyMin: 'rmin', keyMax: 'rmax' }`, function() {
        let r = arrGroupByMaxmin(arr5, mm5, { keyMin: 'rmin', keyMax: 'rmax' })
        let rr = r5
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr6 = [
        {
            name: 'a',
            data: 1.1,
        },
        {
            name: 'b',
            data: 2.2,
        },
        {
            name: 'c',
            data: 3.3,
        },
        {
            name: 'd',
            data: 4.4,
        },
        {
            name: 'e',
            data: 5.5,
        },
        {
            name: 'f',
            data: 6.6,
        },
    ]
    let mm6 = [
        {
            min: 0,
            max: 2,
        },
        {
            min: 2,
            max: 5,
        },
    ]
    // console.log(JSON.stringify(arrGroupByMaxmin(arr6, mm6, { keyValue: 'data' }), null, 2))
    let r6 = [
        {
            'min': 0,
            'max': 2,
            'items': [
                {
                    'name': 'a',
                    'data': 1.1
                }
            ]
        },
        {
            'min': 2,
            'max': 5,
            'items': [
                {
                    'name': 'b',
                    'data': 2.2
                },
                {
                    'name': 'c',
                    'data': 3.3
                },
                {
                    'name': 'd',
                    'data': 4.4
                }
            ]
        }
    ]
    it(`should return ${JSON.stringify(r6)} when input ${JSON.stringify(arr6)}, ${JSON.stringify(mm6)}, { keyValue: 'data' }`, function() {
        let r = arrGroupByMaxmin(arr6, mm6, { keyValue: 'data' })
        let rr = r6
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr7 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
    let mm7 = [
        {
            min: 0,
            max: 2,
        },
        {
            min: 2,
            max: 5,
        },
    ]
    // console.log(arrGroupByMaxmin(arr7, mm7, { keyItems: 'result' }))
    let r7 = [
        { min: 0, max: 2, result: [1.1] },
        { min: 2, max: 5, result: [2.2, 3.3, 4.4] }
    ]
    it(`should return ${JSON.stringify(r7)} when input ${JSON.stringify(arr7)}, ${JSON.stringify(mm7)}, { keyItems: 'result' }`, function() {
        let r = arrGroupByMaxmin(arr7, mm7, { keyItems: 'result' })
        let rr = r7
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr8 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
    let mm8 = [
        {
            min: 1.1,
            minType: '>',
            max: 2.2,
            maxType: '<=',
        },
        {
            min: 2.2,
            minType: '>=',
            max: 5.5,
            maxType: '<',
        },
    ]
    // console.log(arrGroupByMaxmin(arr8, mm8))
    let r8 = [
        {
            min: 1.1,
            minType: '>',
            max: 2.2,
            maxType: '<=',
            items: [2.2]
        },
        {
            min: 2.2,
            minType: '>=',
            max: 5.5,
            maxType: '<',
            items: [2.2, 3.3, 4.4]
        }
    ]
    it(`should return ${JSON.stringify(r8)} when input ${JSON.stringify(arr8)}, ${JSON.stringify(mm8)}`, function() {
        let r = arrGroupByMaxmin(arr8, mm8)
        let rr = r8
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ${JSON.stringify(arr1)}, ''`, function() {
        let r = arrGroupByMaxmin(arr1, '')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr1)}, []`, function() {
        let r = arrGroupByMaxmin(arr1, [])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr1)}, {}`, function() {
        let r = arrGroupByMaxmin(arr1, {})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr1)}, null`, function() {
        let r = arrGroupByMaxmin(arr1, null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr1)}, undefined`, function() {
        let r = arrGroupByMaxmin(arr1, undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ''`, function() {
        let r = arrGroupByMaxmin('')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input []`, function() {
        let r = arrGroupByMaxmin([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input {}`, function() {
        let r = arrGroupByMaxmin({})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input null`, function() {
        let r = arrGroupByMaxmin(null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input undefined`, function() {
        let r = arrGroupByMaxmin(undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input NaN`, function() {
        let r = arrGroupByMaxmin(NaN)
        assert.strict.deepStrictEqual(r, [])
    })

})
