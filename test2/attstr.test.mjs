import assert from 'assert'
import at from '../src/attstr.mjs'


describe(`attstr`, function() {

    it(`should return [ 'abc123' ] when input at.parse('abc123')`, function() {
        let r = at.parse('abc123')
        let rr = ['abc123']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 'abc123' ] when input at.parse('abc123;abc123')`, function() {
        let r = at.parse('abc123;abc123')
        let rr = ['abc123']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 'abc123', 'def456' ] when input at.parse('abc123;def456')`, function() {
        let r = at.parse('abc123;def456')
        let rr = ['abc123', 'def456']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ { item: 'abc@123', table: 'abc', id: '123' } ] when input at.parse('abc@123')`, function() {
        let r = at.parse('abc@123')
        let rr = [{ item: 'abc@123', table: 'abc', id: '123' }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ { item: 'abc@123', table: 'abc', id: '123' } ] when input at.parse('abc@123;abc@123')`, function() {
        let r = at.parse('abc@123;abc@123')
        let rr = [{ item: 'abc@123', table: 'abc', id: '123' }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ { item: 'abc@123', table: 'abc', id: '123' }, { item: 'def@456', table: 'def', id: '456' } ] when input at.parse('abc@123;def@456')`, function() {
        let r = at.parse('abc@123;def@456')
        let rr = [{ item: 'abc@123', table: 'abc', id: '123' }, { item: 'def@456', table: 'def', id: '456' }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input at.parse('')`, function() {
        let r = at.parse('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;def456' when input at.add('abc123', 'def456')`, function() {
        let r = at.add('abc123', 'def456')
        let rr = 'abc123;def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;def456;ghi789' when input at.add('abc123', 'def456;ghi789')`, function() {
        let r = at.add('abc123', 'def456;ghi789')
        let rr = 'abc123;def456;ghi789'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123' when input at.add('abc123', 'abc123')`, function() {
        let r = at.add('abc123', 'abc123')
        let rr = 'abc123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;def456' when input at.add('abc123', 'abc123;def456')`, function() {
        let r = at.add('abc123', 'abc123;def456')
        let rr = 'abc123;def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123' when input at.add('', 'abc123')`, function() {
        let r = at.add('', 'abc123')
        let rr = 'abc123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;def456' when input at.add('', 'abc123;def456')`, function() {
        let r = at.add('', 'abc123;def456')
        let rr = 'abc123;def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456' when input at.add('abc@123', 'def@456')`, function() {
        let r = at.add('abc@123', 'def@456')
        let rr = 'abc@123;def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456;ghi@789' when input at.add('abc@123', 'def@456;ghi@789')`, function() {
        let r = at.add('abc@123', 'def@456;ghi@789')
        let rr = 'abc@123;def@456;ghi@789'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456' when input at.add('abc@123', 'abc@123;def@456')`, function() {
        let r = at.add('abc@123', 'abc@123;def@456')
        let rr = 'abc@123;def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123' when input at.add('', 'abc123')`, function() {
        let r = at.add('', 'abc123')
        let rr = 'abc@123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456' when input at.add('', 'abc123;def@456')`, function() {
        let r = at.add('', 'abc123;def@456')
        let rr = 'abc@123;def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input at.remove('abc123', 'abc123')`, function() {
        let r = at.remove('abc123', 'abc123')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'def456' when input at.remove('abc123;def456', 'abc123')`, function() {
        let r = at.remove('abc123;def456', 'abc123')
        let rr = 'def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123' when input at.remove('abc123', 'def456')`, function() {
        let r = at.remove('abc123', 'def456')
        let rr = 'abc123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;def456' when input at.remove('abc123;def456', 'ghi789;jkl012')`, function() {
        let r = at.remove('abc123;def456', 'ghi789;jkl012')
        let rr = 'abc123;def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input at.remove('', 'ghi789')`, function() {
        let r = at.remove('', 'ghi789')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input at.remove('', 'ghi789;jkl012')`, function() {
        let r = at.remove('', 'ghi789;jkl012')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input at.remove('abc@123', 'abc@123')`, function() {
        let r = at.remove('abc@123', 'abc@123')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'def@456' when input at.remove('abc@123;def@456', 'abc@123')`, function() {
        let r = at.remove('abc@123;def@456', 'abc@123')
        let rr = 'def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123' when input at.remove('abc@123', 'def@456')`, function() {
        let r = at.remove('abc@123', 'def@456')
        let rr = 'abc@123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123' when input at.remove('abc@123;def@456', 'def@456;jkl@012')`, function() {
        let r = at.remove('abc@123;def@456', 'def@456;jkl@012')
        let rr = 'abc@123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456' when input at.remove('abc@123;def@456', 'ghi@789;jkl@012')`, function() {
        let r = at.remove('abc@123;def@456', 'ghi@789;jkl@012')
        let rr = 'abc@123;def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input at.remove('', 'ghi@789')`, function() {
        let r = at.remove('', 'ghi@789')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input at.remove('', 'ghi@789;jkl@012')`, function() {
        let r = at.remove('', 'ghi@789;jkl@012')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
