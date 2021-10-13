import assert from 'assert'
import flattenTreeObj from '../src/flattenTreeObj.mjs'


describe(`flattenTreeObj`, function() {

    let data1 = {
        id: 1,
        data: '1-abc',
        children: [
            {
                id: 2,
                data: '2-def',
            },
            {
                id: 3,
                data: '3-ghi',
                children: [
                    {
                        id: 4,
                        data: '4-jkl',
                    },
                ],
            },
            {
                id: 5,
                data: '5-mno',
            },
        ],
    }
    let cinp1 = JSON.stringify(data1)
    let cout1 = `{"id":1,"data":"1-abc","children":[{"id":2,"data":"2-def"},{"id":3,"data":"3-ghi","children":[{"id":4,"data":"4-jkl"}]},{"id":5,"data":"5-mno"}],"level":0,"nk":[0]}`

    it(`should return ${cout1} when input ${cinp1}`, function() {
        let r = flattenTreeObj(data1)
        r = JSON.stringify(r)
        let rr = cout1
        assert.strict.deepStrictEqual(r, rr)
    })

    let data2 = [
        {
            id: 1,
            text: '1x',
        },
        {
            id: 2,
            text: '2y',
            children: [
                {
                    id: 3,
                    text: '3z',
                },
            ],
        },
        {
            id: 4,
            text: 'empty',
        },
    ]
    let cinp2 = JSON.stringify(data2)
    let cout2 = `[{"id":1,"text":"1x","level":0,"nk":[0]},{"id":2,"text":"2y","children":[{"id":3,"text":"3z"}],"level":0,"nk":[1]},{"id":3,"text":"3z","level":1,"nk":[1,"children",0]},{"id":4,"text":"empty","level":0,"nk":[2]}]`

    it(`should return ${cout2} when input ${cinp2}`, function() {
        let r = flattenTreeObj(data2)
        r = JSON.stringify(r)
        let rr = cout2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = flattenTreeObj('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = flattenTreeObj([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = flattenTreeObj({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = flattenTreeObj(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = flattenTreeObj(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
