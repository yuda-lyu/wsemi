import assert from 'assert'
import flattenTree from '../src/flattenTree.mjs'


describe(`flattenTree 偽稱Array之根節點視為物件(R-OBJ-ITER-01 候選10)`, function() {

    //以Symbol.toStringTag偽稱'Array'之根節點(isarr為真而非真陣列): 結果須同無標籤之相同鍵物件(標籤不可寫者不展開進節點)
    let mkFake = (writable, len = 2) => {
        let o = { id: 1, length: len, children: [{ id: 2, data: 'x' }] }
        if (writable) {
            o[Symbol.toStringTag] = 'Array'
        }
        else {
            Object.defineProperty(o, Symbol.toStringTag, { value: 'Array' })
        }
        return o
    }

    for (let writable of [true, false]) {
        let tag = writable ? 'writable' : 'non-writable'
        for (let len of [2, 0]) {
            it(`should flatten a root object faking Array (${tag} tag, length ${len}) like the plain object with the same keys`, function() {
                //根為物件時回傳根節點本身(含level與nk); length為0時不得被當成空陣列而回傳[]
                let pick = (n) => ({ id: n.id, length: n.length, level: n.level, nk: n.nk, children: n.children })
                let r = flattenTree(mkFake(writable, len))
                let e = flattenTree({ id: 1, length: len, children: [{ id: 2, data: 'x' }] })
                assert.strict.deepStrictEqual(pick(r), pick(e))
                assert.strict.deepStrictEqual(pick(e), { id: 1, length: len, level: 0, nk: [0], children: [{ id: 2, data: 'x' }] })
            })
        }
    }

    for (let tag of ['Foo', 'Object']) {
        it(`should flatten a real array root with another Symbol.toStringTag (${tag}) like an ordinary array`, function() {
            let a = Object.defineProperty([{ id: 1, children: [{ id: 2 }] }], Symbol.toStringTag, { value: tag })
            assert.strict.deepStrictEqual(flattenTree(a).map((v) => v.id), [1, 2])
        })
    }

    it(`should return [] for an object faking Array without own string keys, like an empty object`, function() {
        assert.strict.deepStrictEqual(flattenTree({ [Symbol.toStringTag]: 'Array' }), [])
        assert.strict.deepStrictEqual(flattenTree(Object.defineProperty({}, Symbol.toStringTag, { value: 'Array' })), [])
        assert.strict.deepStrictEqual(flattenTree({}), [])
    })

    it(`should still flatten a real array root and return [] for empty array and empty object`, function() {
        assert.strict.deepStrictEqual(flattenTree([{ id: 1, children: [{ id: 2 }] }]).map((v) => v.id), [1, 2])
        assert.strict.deepStrictEqual(flattenTree([]), [])
        assert.strict.deepStrictEqual(flattenTree({}), [])
    })

})

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
