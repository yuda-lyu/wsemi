import assert from 'assert'
import flattenTree from '../src/flattenTree.mjs'


describe(`flattenTree`, function() {

    let obj = {
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
    let crobj = `{"id":1,"data":"1-abc","children":[{"id":2,"data":"2-def"},{"id":3,"data":"3-ghi","children":[{"id":4,"data":"4-jkl"}]},{"id":5,"data":"5-mno"}],"level":0,"nk":[0]}`

    it(`should return ${crobj} when input ${JSON.stringify(obj)}`, function() {
        let r = flattenTree(obj)
        r = JSON.stringify(r)
        let rr = crobj
        assert.strict.deepStrictEqual(r, rr)
    })

    let arr = [
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
    let crarr = `[{"id":1,"text":"1x","level":0,"nk":[0]},{"id":2,"text":"2y","children":[{"id":3,"text":"3z"}],"level":0,"nk":[1]},{"id":3,"text":"3z","level":1,"nk":[1,"children",0]},{"id":4,"text":"empty","level":0,"nk":[2]}]`

    it(`should return ${crarr} when input ${JSON.stringify(arr)}`, function() {
        let r = flattenTree(arr)
        r = JSON.stringify(r)
        let rr = crarr
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = flattenTree('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = flattenTree([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = flattenTree({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = flattenTree(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = flattenTree(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function() {
        let r = flattenTree(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
