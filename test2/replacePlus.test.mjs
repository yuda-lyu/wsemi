import assert from 'assert'
import replacePlus from '../src/replacePlus.mjs'


describe(`replacePlus`, function() {

    it(`should return '1.25abxyz結尾' when input '1.25abc中文結尾', 'c', '文', null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', 'c', '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '1.25abxyz結尾')
    })

    it(`should return 'xyz結尾' when input '1.25mn1.25abc中文結尾', '1', '文', null, 'xyz'`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', '1', '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, 'xyz結尾')
    })

    it(`should return '1.25mnxyz結尾' when input '1.25mn1.25abc中文結尾', '1', '文', 'mn', 'xyz'`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', '1', '文', 'm', 'xyz')
        assert.strict.deepStrictEqual(r, '1.25mnxyz結尾')
    })

    it(`should return '1.25abxyz結尾' when input '1.25abc中文結尾', 'c', '文', 'mn', 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', 'c', '文', 'mn', 'xyz')
        assert.strict.deepStrictEqual(r, '1.25abxyz結尾')
    })

    it(`should return '1.25mn1.25ab結尾' when input '1.25mn1.25abc中文結尾', 'c', '文', null, ''`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', null, '')
        assert.strict.deepStrictEqual(r, '1.25mn1.25ab結尾')
    })

    it(`should return '' when input '1.25mn1.25abc中文結尾', 'c', '文', null, []`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', null, [])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25mn1.25abc中文結尾', 'c', '文', null, {}`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', null, {})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25mn1.25abc中文結尾', 'c', '文', null,  null`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', null, null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25mn1.25abc中文結尾', 'c', '文', null,  undefined`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', null, undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '1.25mn1.25ab結尾' when input '1.25mn1.25abc中文結尾', 'c', '文', '', ''`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', '', '')
        assert.strict.deepStrictEqual(r, '1.25mn1.25ab結尾')
    })

    it(`should return '' when input '1.25mn1.25abc中文結尾', 'c', '文', '', []`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', '', [])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25mn1.25abc中文結尾', 'c', '文', '', {}`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', '', {})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25mn1.25abc中文結尾', 'c', '文', '',  null`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', '', null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25mn1.25abc中文結尾', 'c', '文', '',  undefined`, function() {
        let r = replacePlus('1.25mn1.25abc中文結尾', 'c', '文', '', undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc中文結尾', 'c', '', null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', 'c', '', null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc中文結尾', 'c', [], null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', 'c', [], null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc中文結尾', 'c', {}, null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', 'c', {}, null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc中文結尾', 'c', null, null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', 'c', null, null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc中文結尾', 'c', undefined, null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', 'c', undefined, null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '1.25abxyz結尾' when input '1.25abc中文結尾', '', '文', null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', '', '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '1.25abxyz結尾' when input '1.25abc中文結尾', [], '文', null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', [], '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '1.25abxyz結尾' when input '1.25abc中文結尾', {}, '文', null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', {}, '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '1.25abxyz結尾' when input '1.25abc中文結尾', null, '文', null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', null, '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '1.25abxyz結尾' when input '1.25abc中文結尾', undefined, '文', null, 'xyz'`, function() {
        let r = replacePlus('1.25abc中文結尾', undefined, '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '1.25abxyz結尾' when input '', 'c', '文', null, 'xyz'`, function() {
        let r = replacePlus('', 'c', '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '1.25abxyz結尾' when input [], 'c', '文', null, 'xyz'`, function() {
        let r = replacePlus([], 'c', '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '1.25abxyz結尾' when input {}, 'c', '文', null, 'xyz'`, function() {
        let r = replacePlus({}, 'c', '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '1.25abxyz結尾' when input null, 'c', '文', null, 'xyz'`, function() {
        let r = replacePlus(null, 'c', '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '1.25abxyz結尾' when input undefined, 'c', '文', null, 'xyz'`, function() {
        let r = replacePlus(undefined, 'c', '文', null, 'xyz')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = replacePlus('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = replacePlus([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = replacePlus({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = replacePlus(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = replacePlus(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = replacePlus(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

})
