import assert from 'assert'
import composeTreeObjByArr from '../src/composeTreeObjByArr.mjs'


describe(`composeTreeObjByArr`, function() {

    let data = [
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
    let cinp = JSON.stringify(data)

    let cout1 = `[{"id":1,"text":"1-a"},{"id":2,"text":"2-b","children":[{"id":3,"text":"3-c","parentId":2,"children":[{"id":5,"text":"5-e","parentId":3}]},{"id":4,"text":"4-d","parentId":2}]},{"id":6,"text":"empty"}]`
    it(`should return ${cout1} when input ${cinp}`, function() {
        let r = composeTreeObjByArr(data)
        r = JSON.stringify(r)
        let rr = cout1
        assert.strict.deepStrictEqual(r, rr)
    })

    let cout2 = `[{"$level":0,"$parents":[],"id":1,"text":"1-a"},{"$level":0,"$parents":[],"id":2,"text":"2-b","children":[{"$level":1,"$parents":[2],"id":3,"text":"3-c","parentId":2,"children":[{"$level":2,"$parents":[2,3],"id":5,"text":"5-e","parentId":3}]},{"$level":1,"$parents":[2],"id":4,"text":"4-d","parentId":2}]},{"$level":0,"$parents":[],"id":6,"text":"empty"}]`
    it(`should return ${cout2} when input ${cinp}, { saveExtProps: true }`, function() {
        let r = composeTreeObjByArr(data, { saveExtProps: true })
        r = JSON.stringify(r)
        let rr = cout2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = composeTreeObjByArr('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = composeTreeObjByArr([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = composeTreeObjByArr({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = composeTreeObjByArr(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = composeTreeObjByArr(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
