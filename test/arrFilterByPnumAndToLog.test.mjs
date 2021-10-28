import assert from 'assert'
import arrFilterByPnumAndToLog from '../src/arrFilterByPnumAndToLog.mjs'


describe(`arrFilterByPnumAndToLog`, function() {

    it(`should return [-0.6931471805599453, 0, 0.09531017980432493, 0.09531017980432493, 0.7884573603642703] when input ['-2.2', '-1.1', -1.1, -1, -0.5, 0, '0', 0.5, 1, 1.1, '1.1', '2.2']`, function() {
        let r = arrFilterByPnumAndToLog(['-2.2', '-1.1', -1.1, -1, -0.5, 0, '0', 0.5, 1, 1.1, '1.1', '2.2'])
        let rr = [-0.6931471805599453, 0, 0.09531017980432493, 0.09531017980432493, 0.7884573603642703]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['-2.2', '-1.1', -1.1, -1, -0.5, 0, '0']`, function() {
        let r = arrFilterByPnumAndToLog(['-2.2', '-1.1', -1.1, -1, -0.5, 0, '0'])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrFilterByPnumAndToLog('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrFilterByPnumAndToLog([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrFilterByPnumAndToLog({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrFilterByPnumAndToLog(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrFilterByPnumAndToLog(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
