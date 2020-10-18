import assert from 'assert'
import strFindSimilar from '../src/strFindSimilar.mjs'


describe(`strFindSimilar`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        in1: 'The Woodman(樵夫) set to work at once, and so...',
        in2: ['Wodooman(樵夫)', 'manWood(樵夫)', 'Wood樵man(夫)', 'Woodman(樵夫)'],
        out: { 'ratings': [{ 'target': 'Wodooman(樵夫)', 'rating': 0.375 }, { 'target': 'manWood(樵夫)', 'rating': 0.3404255319148936 }, { 'target': 'Wood樵man(夫)', 'rating': 0.2978723404255319 }, { 'target': 'Woodman(樵夫)', 'rating': 0.425531914893617 }], 'bestMatch': { 'target': 'Woodman(樵夫)', 'rating': 0.425531914893617 }, 'bestMatchIndex': 3 }
    }
    it(`sould return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        k = 1
        let r = strFindSimilar(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        in1: 'The Woodman(樵夫) set to work at once, and so...',
        in2: ['Wodooman(樵夫)', 'manWood(樵夫)', 123, 'Woodman(樵夫)'],
        out: { 'ratings': [{ 'target': 'Wodooman(樵夫)', 'rating': 0.375 }, { 'target': 'manWood(樵夫)', 'rating': 0.3404255319148936 }, { 'target': '123', 'rating': 0 }, { 'target': 'Woodman(樵夫)', 'rating': 0.425531914893617 }], 'bestMatch': { 'target': 'Woodman(樵夫)', 'rating': 0.425531914893617 }, 'bestMatchIndex': 3 }
    }
    it(`sould return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in1)}, ${JSON.stringify(o[k].in2)}`, function() {
        k = 2
        let r = strFindSimilar(o[k].in1, o[k].in2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', ''`, function() {
        let r = strFindSimilar('test中文', '')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', []`, function() {
        let r = strFindSimilar('test中文', [])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}`, function() {
        let r = strFindSimilar('test中文', {})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null`, function() {
        let r = strFindSimilar('test中文', null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '5393554e94bf0eb6436f240a4fd71282' when input 'test中文', undefined`, function() {
        let r = strFindSimilar('test中文', undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = strFindSimilar('')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = strFindSimilar([])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strFindSimilar({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strFindSimilar(null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strFindSimilar(undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

})
