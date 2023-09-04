import assert from 'assert'
import getTimeBetween from '../src/getTimeBetween.mjs'


describe(`getTimeBetween`, function() {

    it(`sould return ['2017', '2018', '2019'] when input '2017', '2019', 'years'`, function() {
        let r = getTimeBetween('2017', '2019', 'years')
        let rr = ['2017', '2018', '2019']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return ['2019-01', '2019-02', '2019-03'] when input '2019-01', '2019-03', 'months'`, function() {
        let r = getTimeBetween('2019-01', '2019-03', 'months')
        let rr = ['2019-01', '2019-02', '2019-03']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return ['2019-01-01', '2019-01-02', '2019-01-03'] when input '2019-01-01', '2019-01-03', 'days'`, function() {
        let r = getTimeBetween('2019-01-01', '2019-01-03', 'days')
        let rr = ['2019-01-01', '2019-01-02', '2019-01-03']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return ['2019-01-01', '2019-01-02', '2019-01-03'] when input '2019-01-01', '2019-01-03'`, function() {
        let r = getTimeBetween('2019-01-01', '2019-01-03')
        let rr = ['2019-01-01', '2019-01-02', '2019-01-03']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return ['2019-01-01T01', '2019-01-01T02', '2019-01-01T03'] when input '2019-01-01T01', '2019-01-01T03', 'hours'`, function() {
        let r = getTimeBetween('2019-01-01T01', '2019-01-01T03', 'hours')
        let rr = ['2019-01-01T01', '2019-01-01T02', '2019-01-01T03']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return ['2019-01-01T01:01', '2019-01-01T01:02', '2019-01-01T01:03'] when input '2019-01-01T01:01', '2019-01-01T01:03', 'minutes'`, function() {
        let r = getTimeBetween('2019-01-01T01:01', '2019-01-01T01:03', 'minutes')
        let rr = ['2019-01-01T01:01', '2019-01-01T01:02', '2019-01-01T01:03']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return ['2019-01-01T01:01:01', '2019-01-01T01:01:02', '2019-01-01T01:01:03'] when input '2019-01-01T01:01:01', '2019-01-01T01:01:03', 'seconds'`, function() {
        let r = getTimeBetween('2019-01-01T01:01:01', '2019-01-01T01:01:03', 'seconds')
        let rr = ['2019-01-01T01:01:01', '2019-01-01T01:01:02', '2019-01-01T01:01:03']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', '2019', ''`, function() {
        let r = getTimeBetween('2017', '2019', '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', '2019', []`, function() {
        let r = getTimeBetween('2017', '2019', [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', '2019', {}`, function() {
        let r = getTimeBetween('2017', '2019', {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', '2019', null`, function() {
        let r = getTimeBetween('2017', '2019', null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', '2019', undefined`, function() {
        let r = getTimeBetween('2017', '2019', undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', '', 'years'`, function() {
        let r = getTimeBetween('2017', '', 'years')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', [], 'years'`, function() {
        let r = getTimeBetween('2017', [], 'years')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', {}, 'years'`, function() {
        let r = getTimeBetween('2017', {}, 'years')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', null, 'years'`, function() {
        let r = getTimeBetween('2017', null, 'years')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', undefined, 'years'`, function() {
        let r = getTimeBetween('2017', undefined, 'years')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '', '2019', 'years'`, function() {
        let r = getTimeBetween('', '2019', 'years')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [], '2019', 'years'`, function() {
        let r = getTimeBetween([], '2019', 'years')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input {}, '2019', 'years'`, function() {
        let r = getTimeBetween({}, '2019', 'years')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input null, '2019', 'years'`, function() {
        let r = getTimeBetween(null, '2019', 'years')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input undefined, '2019', 'years'`, function() {
        let r = getTimeBetween(undefined, '2019', 'years')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', ''`, function() {
        let r = getTimeBetween('2017', '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', []`, function() {
        let r = getTimeBetween('2017', [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', {}`, function() {
        let r = getTimeBetween('2017', {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', null`, function() {
        let r = getTimeBetween('2017', null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input '2017', undefined`, function() {
        let r = getTimeBetween('2017', undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = getTimeBetween('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = getTimeBetween([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = getTimeBetween({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = getTimeBetween(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = getTimeBetween(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input NaN`, function() {
        let r = getTimeBetween(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
