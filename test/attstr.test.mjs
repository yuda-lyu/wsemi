import assert from 'assert'
import attstr from '../src/attstr.mjs'


describe(`attstr`, function() {

    it(`should return [ 'abc123' ] when input attstr().parse('abc123')`, function() {
        let r = attstr().parse('abc123')
        let rr = ['abc123']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 'abc123' ] when input attstr().parse('abc123;abc123')`, function() {
        let r = attstr().parse('abc123;abc123')
        let rr = ['abc123']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 'abc123', 'def456' ] when input attstr().parse('abc123;def456')`, function() {
        let r = attstr().parse('abc123;def456')
        let rr = ['abc123', 'def456']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ { item: 'abc@123', table: 'abc', id: '123' } ] when input attstr().parse('abc@123')`, function() {
        let r = attstr().parse('abc@123')
        let rr = [{ item: 'abc@123', table: 'abc', id: '123' }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ { item: 'abc@123', table: 'abc', id: '123' } ] when input attstr().parse('abc@123;abc@123')`, function() {
        let r = attstr().parse('abc@123;abc@123')
        let rr = [{ item: 'abc@123', table: 'abc', id: '123' }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ { item: 'abc@123', table: 'abc', id: '123' }, { item: 'def@456', table: 'def', id: '456' } ] when input attstr().parse('abc@123;def@456')`, function() {
        let r = attstr().parse('abc@123;def@456')
        let rr = [{ item: 'abc@123', table: 'abc', id: '123' }, { item: 'def@456', table: 'def', id: '456' }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input attstr().parse('')`, function() {
        let r = attstr().parse('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123' when input attstr().join(['abc123'])`, function() {
        let r = attstr().join(['abc123'])
        let rr = 'abc123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;def456' when input attstr().join(['abc123', 'def456'])`, function() {
        let r = attstr().join(['abc123', 'def456'])
        let rr = 'abc123;def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123' when input attstr().join(['abc@123'])`, function() {
        let r = attstr().join(['abc@123'])
        let rr = 'abc@123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456' when input attstr().join(['abc@123', 'def@456'])`, function() {
        let r = attstr().join(['abc@123', 'def@456'])
        let rr = 'abc@123;def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456' when input attstr().join([{ table: 'abc', id: '123' }, { table: 'def', id: '456' }])`, function() {
        let r = attstr().join([{ table: 'abc', id: '123' }, { table: 'def', id: '456' }])
        let rr = 'abc@123;def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input attstr().join([])`, function() {
        let r = attstr().join([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;def456' when input attstr().add('abc123', 'def456')`, function() {
        let r = attstr().add('abc123', 'def456')
        let rr = 'abc123;def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;def456;ghi789' when input attstr().add('abc123', 'def456;ghi789')`, function() {
        let r = attstr().add('abc123', 'def456;ghi789')
        let rr = 'abc123;def456;ghi789'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123' when input attstr().add('abc123', 'abc123')`, function() {
        let r = attstr().add('abc123', 'abc123')
        let rr = 'abc123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;def456' when input attstr().add('abc123', 'abc123;def456')`, function() {
        let r = attstr().add('abc123', 'abc123;def456')
        let rr = 'abc123;def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;ghi789;def456' when input attstr().add('abc123;ghi789', 'abc123;def456')`, function() {
        let r = attstr().add('abc123;ghi789', 'abc123;def456')
        let rr = 'abc123;ghi789;def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123' when input attstr().add('', 'abc123')`, function() {
        let r = attstr().add('', 'abc123')
        let rr = 'abc123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;def456' when input attstr().add('', 'abc123;def456')`, function() {
        let r = attstr().add('', 'abc123;def456')
        let rr = 'abc123;def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456' when input attstr().add('abc@123', 'def@456')`, function() {
        let r = attstr().add('abc@123', 'def@456')
        let rr = 'abc@123;def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456;ghi@789' when input attstr().add('abc@123', 'def@456;ghi@789')`, function() {
        let r = attstr().add('abc@123', 'def@456;ghi@789')
        let rr = 'abc@123;def@456;ghi@789'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456' when input attstr().add('abc@123', 'abc@123;def@456')`, function() {
        let r = attstr().add('abc@123', 'abc@123;def@456')
        let rr = 'abc@123;def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;ghi@789;def@456' when input attstr().add('abc@123;ghi@789', 'abc@123;def@456')`, function() {
        let r = attstr().add('abc@123;ghi@789', 'abc@123;def@456')
        let rr = 'abc@123;ghi@789;def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123' when input attstr().add('', 'ab@c123')`, function() {
        let r = attstr().add('', 'abc@123')
        let rr = 'abc@123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456' when input attstr().add('', 'abc@123;def@456')`, function() {
        let r = attstr().add('', 'abc@123;def@456')
        let rr = 'abc@123;def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input attstr().remove('abc123', 'abc123')`, function() {
        let r = attstr().remove('abc123', 'abc123')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'def456' when input attstr().remove('abc123;def456', 'abc123')`, function() {
        let r = attstr().remove('abc123;def456', 'abc123')
        let rr = 'def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123' when input attstr().remove('abc123', 'def456')`, function() {
        let r = attstr().remove('abc123', 'def456')
        let rr = 'abc123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123' when input attstr().remove('abc123', 'ghi789;jkl012')`, function() {
        let r = attstr().remove('abc123', 'ghi789;jkl012')
        let rr = 'abc123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input attstr().remove('abc123', 'abc123;jkl012')`, function() {
        let r = attstr().remove('abc123', 'abc123;jkl012')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123;def456' when input attstr().remove('abc123;def456', 'ghi789;jkl012')`, function() {
        let r = attstr().remove('abc123;def456', 'ghi789;jkl012')
        let rr = 'abc123;def456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc123' when input attstr().remove('abc123;def456', 'def456;jkl012')`, function() {
        let r = attstr().remove('abc123;def456', 'def456;jkl012')
        let rr = 'abc123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input attstr().remove('', 'ghi789')`, function() {
        let r = attstr().remove('', 'ghi789')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input attstr().remove('', 'ghi789;jkl012')`, function() {
        let r = attstr().remove('', 'ghi789;jkl012')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input attstr().remove('abc@123', 'abc@123')`, function() {
        let r = attstr().remove('abc@123', 'abc@123')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'def@456' when input attstr().remove('abc@123;def@456', 'abc@123')`, function() {
        let r = attstr().remove('abc@123;def@456', 'abc@123')
        let rr = 'def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123' when input attstr().remove('abc@123', 'def@456')`, function() {
        let r = attstr().remove('abc@123', 'def@456')
        let rr = 'abc@123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123' when input attstr().remove('abc@123', 'ghi@789;jkl@012')`, function() {
        let r = attstr().remove('abc@123', 'ghi@789;jkl@012')
        let rr = 'abc@123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input attstr().remove('abc@123', 'abc@123;jkl@012')`, function() {
        let r = attstr().remove('abc@123', 'abc@123;jkl@012')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123;def@456' when input attstr().remove('abc@123;def@456', 'ghi@789;jkl@012')`, function() {
        let r = attstr().remove('abc@123;def@456', 'ghi@789;jkl@012')
        let rr = 'abc@123;def@456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'abc@123' when input attstr().remove('abc@123;def@456', 'def@456;jkl@012')`, function() {
        let r = attstr().remove('abc@123;def@456', 'def@456;jkl@012')
        let rr = 'abc@123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input attstr().remove('', 'ghi@789')`, function() {
        let r = attstr().remove('', 'ghi@789')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input attstr().remove('', 'ghi@789;jkl@012')`, function() {
        let r = attstr().remove('', 'ghi@789;jkl@012')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [{ item: 'x1|abc@123|def@456', table: 'x1', id: ['abc@123', 'def@456'] }, { item: 'x2|ghi@789', table: 'x2', id: 'ghi@789' }] when input attstr({ dlmItem: ',', dlmSep: '|' }).parse('x1|abc@123|def@456,x2|ghi@789')`, function() {
        let r = attstr({ dlmItem: ',', dlmSep: '|' }).parse('x1|abc@123|def@456,x2|ghi@789')
        let rr = [{ item: 'x1|abc@123|def@456', table: 'x1', id: ['abc@123', 'def@456'] }, { item: 'x2|ghi@789', table: 'x2', id: 'ghi@789' }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [{ item: 'x1|abc@123|def@456', name: 'x1', emails: ['abc@123', 'def@456'] }, { item: 'x2|ghi@789', name: 'x2', emails: 'ghi@789' }] when input attstr({ dlmItem: ',', dlmSep: '|', keyTable: 'name', keyId: 'emails' }).parse('x1|abc@123|def@456,x2|ghi@789')`, function() {
        let r = attstr({ dlmItem: ',', dlmSep: '|', keyTable: 'name', keyId: 'emails' }).parse('x1|abc@123|def@456,x2|ghi@789')
        let rr = [{ item: 'x1|abc@123|def@456', name: 'x1', emails: ['abc@123', 'def@456'] }, { item: 'x2|ghi@789', name: 'x2', emails: 'ghi@789' }]
        assert.strict.deepStrictEqual(r, rr)
    })

})
