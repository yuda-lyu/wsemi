import assert from 'assert'
import arrLookupByMaxmin from '../src/arrLookupByMaxmin.mjs'


describe(`arrLookupByMaxmin`, function() {

    let arr1 = [
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
    // console.log(arrLookupByMaxmin(arr1, mm1))
    let r1 = [
        {
            'name': 'a',
            'value': 1.1,
            'items': [
                {
                    'min': 0,
                    'max': 2
                }
            ]
        },
        {
            'name': 'b',
            'value': 2.2,
            'items': [
                {
                    'min': 2,
                    'max': 5
                }
            ]
        },
        {
            'name': 'c',
            'value': 3.3,
            'items': [
                {
                    'min': 2,
                    'max': 5
                }
            ]
        },
        {
            'name': 'd',
            'value': 4.4,
            'items': [
                {
                    'min': 2,
                    'max': 5
                }
            ]
        },
        {
            'name': 'e',
            'value': 5.5
        },
        {
            'name': 'f',
            'value': 6.6
        }
    ]
    it(`should return ${JSON.stringify(r1)} when input ${JSON.stringify(arr1)}, ${JSON.stringify(mm1)}`, function() {
        let r = arrLookupByMaxmin(arr1, mm1)
        let rr = r1
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr2 = [
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
    let mm2 = [
        {
            rmin: 0,
            rmax: 2,
        },
        {
            rmin: 2,
            rmax: 5,
        },
    ]
    // console.log(arrLookupByMaxmin(arr2, mm2, { keyMin: 'rmin', keyMax: 'rmax' }))
    let r2 = [
        {
            'name': 'a',
            'value': 1.1,
            'items': [
                {
                    'rmin': 0,
                    'rmax': 2
                }
            ]
        },
        {
            'name': 'b',
            'value': 2.2,
            'items': [
                {
                    'rmin': 2,
                    'rmax': 5
                }
            ]
        },
        {
            'name': 'c',
            'value': 3.3,
            'items': [
                {
                    'rmin': 2,
                    'rmax': 5
                }
            ]
        },
        {
            'name': 'd',
            'value': 4.4,
            'items': [
                {
                    'rmin': 2,
                    'rmax': 5
                }
            ]
        },
        {
            'name': 'e',
            'value': 5.5
        },
        {
            'name': 'f',
            'value': 6.6
        }
    ]
    it(`should return ${JSON.stringify(r2)} when input ${JSON.stringify(arr2)}, ${JSON.stringify(mm2)}, { keyMin: 'rmin', keyMax: 'rmax' }`, function() {
        let r = arrLookupByMaxmin(arr2, mm2, { keyMin: 'rmin', keyMax: 'rmax' })
        let rr = r2
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr3 = [
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
    let mm3 = [
        {
            min: 0,
            max: 2,
        },
        {
            min: 2,
            max: 5,
        },
    ]
    // console.log(arrLookupByMaxmin(arr3, mm3, { keyValue: 'data' }))
    let r3 = [
        {
            'name': 'a',
            'data': 1.1,
            'items': [
                {
                    'min': 0,
                    'max': 2
                }
            ]
        },
        {
            'name': 'b',
            'data': 2.2,
            'items': [
                {
                    'min': 2,
                    'max': 5
                }
            ]
        },
        {
            'name': 'c',
            'data': 3.3,
            'items': [
                {
                    'min': 2,
                    'max': 5
                }
            ]
        },
        {
            'name': 'd',
            'data': 4.4,
            'items': [
                {
                    'min': 2,
                    'max': 5
                }
            ]
        },
        {
            'name': 'e',
            'data': 5.5
        },
        {
            'name': 'f',
            'data': 6.6
        }
    ]
    it(`should return ${JSON.stringify(r3)} when input ${JSON.stringify(arr3)}, ${JSON.stringify(mm3)}, { keyValue: 'data' }`, function() {
        let r = arrLookupByMaxmin(arr3, mm3, { keyValue: 'data' })
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
    // console.log(arrLookupByMaxmin(arr4, mm4, { keyItems: 'res' }))
    let r4 = [
        {
            'name': 'a',
            'value': 1.1,
            'res': [
                {
                    'min': 0,
                    'max': 2
                }
            ]
        },
        {
            'name': 'b',
            'value': 2.2,
            'res': [
                {
                    'min': 2,
                    'max': 5
                }
            ]
        },
        {
            'name': 'c',
            'value': 3.3,
            'res': [
                {
                    'min': 2,
                    'max': 5
                }
            ]
        },
        {
            'name': 'd',
            'value': 4.4,
            'res': [
                {
                    'min': 2,
                    'max': 5
                }
            ]
        },
        {
            'name': 'e',
            'value': 5.5
        },
        {
            'name': 'f',
            'value': 6.6
        }
    ]
    it(`should return ${JSON.stringify(r4)} when input ${JSON.stringify(arr4)}, ${JSON.stringify(mm4)}, { keyItems: 'res' }`, function() {
        let r = arrLookupByMaxmin(arr4, mm4, { keyItems: 'res' })
        let rr = r4
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr5 = [
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
    let mm5 = [
        {
            name: 'x1',
            min: 0,
            max: 2,
        },
        {
            name: 'x2',
            min: 2,
            max: 5,
        },
    ]
    console.log(arrLookupByMaxmin(arr5, mm5, {
        keyItems: 'res',
        beforeAddResult: (m) => {
            return m.name
        }
    }))
    let r5 = [
        {
            'name': 'a',
            'value': 1.1,
            'res': [
                'x1'
            ]
        },
        {
            'name': 'b',
            'value': 2.2,
            'res': [
                'x2'
            ]
        },
        {
            'name': 'c',
            'value': 3.3,
            'res': [
                'x2'
            ]
        },
        {
            'name': 'd',
            'value': 4.4,
            'res': [
                'x2'
            ]
        },
        {
            'name': 'e',
            'value': 5.5
        },
        {
            'name': 'f',
            'value': 6.6
        }
    ]
    it(`should return ${JSON.stringify(r5)} when input ${JSON.stringify(arr5)}, ${JSON.stringify(mm5)}, { keyItems: 'res', beforeAddResult: (m) => { return m.name } }`, function() {
        let r = arrLookupByMaxmin(arr5, mm5, {
            keyItems: 'res',
            beforeAddResult: (m) => {
                return m.name
            }
        })
        let rr = r5
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr6 = [
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
    let mm6 = [
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
    // console.log(arrLookupByMaxmin(arr6, mm6))
    let r6 = [
        {
            'name': 'a',
            'value': 1.1
        },
        {
            'name': 'b',
            'value': 2.2,
            'items': [
                {
                    'min': 1.1,
                    'minType': '>',
                    'max': 2.2,
                    'maxType': '<='
                },
                {
                    'min': 2.2,
                    'minType': '>=',
                    'max': 5.5,
                    'maxType': '<'
                }
            ]
        },
        {
            'name': 'c',
            'value': 3.3,
            'items': [
                {
                    'min': 2.2,
                    'minType': '>=',
                    'max': 5.5,
                    'maxType': '<'
                }
            ]
        },
        {
            'name': 'd',
            'value': 4.4,
            'items': [
                {
                    'min': 2.2,
                    'minType': '>=',
                    'max': 5.5,
                    'maxType': '<'
                }
            ]
        },
        {
            'name': 'e',
            'value': 5.5
        },
        {
            'name': 'f',
            'value': 6.6
        }
    ]
    it(`should return ${JSON.stringify(r6)} when input ${JSON.stringify(arr6)}, ${JSON.stringify(mm6)}`, function() {
        let r = arrLookupByMaxmin(arr6, mm6)
        let rr = r6
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ${JSON.stringify(arr1)}, ''`, function() {
        let r = arrLookupByMaxmin(arr1, '')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr1)}, []`, function() {
        let r = arrLookupByMaxmin(arr1, [])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr1)}, {}`, function() {
        let r = arrLookupByMaxmin(arr1, {})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr1)}, null`, function() {
        let r = arrLookupByMaxmin(arr1, null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr1)}, undefined`, function() {
        let r = arrLookupByMaxmin(arr1, undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ''`, function() {
        let r = arrLookupByMaxmin('')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input []`, function() {
        let r = arrLookupByMaxmin([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input {}`, function() {
        let r = arrLookupByMaxmin({})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input null`, function() {
        let r = arrLookupByMaxmin(null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input undefined`, function() {
        let r = arrLookupByMaxmin(undefined)
        assert.strict.deepStrictEqual(r, [])
    })

})
