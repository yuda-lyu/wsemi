import assert from 'assert'
import timebetween from '../src/timebetween.mjs'


describe(`timebetween`, function() {

    it(`sould return ['2017', '2018', '2019'] when input '2017', '2019', 'years'`, function() {
        let r = timebetween('2017', '2019', 'years')
        let rr = ['2017', '2018', '2019']
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return ['2019/01', '2019/02', '2019/03'] when input '2019/01', '2019/03', 'months'`, function() {
        let r = timebetween('2019/01', '2019/03', 'months')
        let rr = ['2019/01', '2019/02', '2019/03']
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return ['2019/01/01', '2019/01/02', '2019/01/03'] when input '2019/01/01', '2019/01/03', 'days'`, function() {
        let r = timebetween('2019/01/01', '2019/01/03', 'days')
        let rr = ['2019/01/01', '2019/01/02', '2019/01/03']
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return ['2019/01/01', '2019/01/02', '2019/01/03'] when input '2019/01/01', '2019/01/03'`, function() {
        let r = timebetween('2019/01/01', '2019/01/03')
        let rr = ['2019/01/01', '2019/01/02', '2019/01/03']
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return ['2019/01/01 01', '2019/01/01 02', '2019/01/01 03'] when input '2019/01/01 01', '2019/01/01 03', 'hours'`, function() {
        let r = timebetween('2019/01/01 01', '2019/01/01 03', 'hours')
        let rr = ['2019/01/01 01', '2019/01/01 02', '2019/01/01 03']
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return ['2019/01/01 01:01', '2019/01/01 01:02', '2019/01/01 01:03'] when input '2019/01/01 01:01', '2019/01/01 01:03', 'minutes'`, function() {
        let r = timebetween('2019/01/01 01:01', '2019/01/01 01:03', 'minutes')
        let rr = ['2019/01/01 01:01', '2019/01/01 01:02', '2019/01/01 01:03']
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return ['2019/01/01 01:01:01', '2019/01/01 01:01:02', '2019/01/01 01:01:03'] when input '2019/01/01 01:01:01', '2019/01/01 01:01:03', 'seconds'`, function() {
        let r = timebetween('2019/01/01 01:01:01', '2019/01/01 01:01:03', 'seconds')
        let rr = ['2019/01/01 01:01:01', '2019/01/01 01:01:02', '2019/01/01 01:01:03']
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', '2019', ''`, function() {
        let r = timebetween('2017', '2019', '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', '2019', []`, function() {
        let r = timebetween('2017', '2019', [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', '2019', {}`, function() {
        let r = timebetween('2017', '2019', {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', '2019', null`, function() {
        let r = timebetween('2017', '2019', null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', '2019', undefined`, function() {
        let r = timebetween('2017', '2019', undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', '', 'years'`, function() {
        let r = timebetween('2017', '', 'years')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', [], 'years'`, function() {
        let r = timebetween('2017', [], 'years')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', {}, 'years'`, function() {
        let r = timebetween('2017', {}, 'years')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', null, 'years'`, function() {
        let r = timebetween('2017', null, 'years')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', undefined, 'years'`, function() {
        let r = timebetween('2017', undefined, 'years')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '', '2019', 'years'`, function() {
        let r = timebetween('', '2019', 'years')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input [], '2019', 'years'`, function() {
        let r = timebetween([], '2019', 'years')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input {}, '2019', 'years'`, function() {
        let r = timebetween({}, '2019', 'years')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input null, '2019', 'years'`, function() {
        let r = timebetween(null, '2019', 'years')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input undefined, '2019', 'years'`, function() {
        let r = timebetween(undefined, '2019', 'years')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', ''`, function() {
        let r = timebetween('2017', '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', []`, function() {
        let r = timebetween('2017', [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', {}`, function() {
        let r = timebetween('2017', {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', null`, function() {
        let r = timebetween('2017', null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input '2017', undefined`, function() {
        let r = timebetween('2017', undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = timebetween('')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = timebetween([])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = timebetween({})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = timebetween(null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = timebetween(undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

})
