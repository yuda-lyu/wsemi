import assert from 'assert'
import composeTreeObj from '../src/composeTreeObj.mjs'


describe(`composeTreeObj`, function() {

    let data1 = [
        {
            id: 1,
            text: '1-a',
        },
        {
            id: 2,
            text: '2-b',
        },
        {
            id: 3,
            text: '3-c',
            parentId: 2,
        },
        {
            id: 4,
            text: '4-d',
            parentId: 2,
        },
        {
            id: 5,
            text: '5-e',
            parentId: 3,
        },
        {
            id: 6,
            text: 'empty',
        },
    ]
    let cinp1 = JSON.stringify(data1)
    let cout1 = `[{"id":1,"text":"1-a"},{"id":2,"text":"2-b","children":[{"id":3,"text":"3-c","parentId":2,"children":[{"id":5,"text":"5-e","parentId":3}]},{"id":4,"text":"4-d","parentId":2}]},{"id":6,"text":"empty"}]`

    it(`should return ${cout1} when input ${cinp1}`, function() {
        let r = composeTreeObj(data1)
        r = JSON.stringify(r)
        let rr = cout1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = composeTreeObj('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = composeTreeObj([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = composeTreeObj({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = composeTreeObj(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = composeTreeObj(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
