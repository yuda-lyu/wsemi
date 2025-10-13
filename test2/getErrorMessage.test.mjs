import fs from 'fs'
import assert from 'assert'
import strleft from '../src/strleft.mjs'
import getErrorMessage from '../src/getErrorMessage.mjs'


describe(`getErrorMessage`, function() {

    it(`should return 'something wrong' when throw new Error('something wrong')`, async() => {
        let r
        try {
            throw new Error('something wrong')
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'something wrong'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return '' when throw new Error()`, async() => {
        let r
        try {
            throw new Error()
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        // => ''
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'wrong type' when throw new TypeError('wrong type')`, async() => {
        let r
        try {
            throw new TypeError('wrong type')
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'wrong type'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'range bad' when throw new RangeError('range bad')`, async() => {
        let r
        try {
            throw new RangeError('range bad')
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'range bad'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'ref bad' when throw new ReferenceError('ref bad')`, async() => {
        let r
        try {
            throw new ReferenceError('ref bad')
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'ref bad'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'syntax bad' when throw new SyntaxError('syntax bad')`, async() => {
        let r
        try {
            throw new SyntaxError('syntax bad')
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'syntax bad'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'uri bad' when throw new URIError('uri bad')`, async() => {
        let r
        try {
            throw new URIError('uri bad')
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'uri bad'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'outer' when throw new AggregateError([new Error('e1'), 'e2'], 'outer')`, async() => {
        let r
        try {
            throw new AggregateError([new Error('e1'), 'e2'], 'outer')
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'outer'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'top' when throw new Error('top', { cause: new Error('root cause') })`, async() => {
        let r
        try {
            throw new Error('top', { cause: new Error('root cause') })
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'top'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'operation was aborted.' when throw new DOMException('operation was aborted.', 'AbortError')`, async() => {
        let r
        try {
            throw new DOMException('operation was aborted.', 'AbortError')
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'operation was aborted.'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'bbb' when throw fs.readFileSync('definitely_not_exists_1234567890.txt')`, async() => {
        let r
        try {
            throw fs.readFileSync('definitely_not_exists_1234567890.txt')
        }
        catch (err) {
            r = getErrorMessage(err)
            r = strleft(r, 39)
        }
        let rr = 'ENOENT: no such file or directory, open'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'promise reject' when Promise.reject('promise reject') in async functoin`, async() => {
        let r
        let test1 = async() => {
            return Promise.reject('promise reject')
        }
        try {
            await test1()
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'promise reject'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'something wrong' when throw new Error('something wrong') in async functoin`, async() => {
        let r
        let test2 = async() => {
            throw new Error('something wrong')
        }
        try {
            await test2()
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'something wrong'
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return '' when throw new Error() in async functoin`, async() => {
        let r
        let test3 = async() => {
            throw new Error()
        }
        try {
            await test3()
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })


    it(`should return 'wrong type' when throw new TypeError('wrong type') in async functoin`, async() => {
        let r
        let test4 = async() => {
            throw new TypeError('wrong type')
        }
        try {
            await test4()
        }
        catch (err) {
            r = getErrorMessage(err)
        }
        let rr = 'wrong type'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'test中文' when input 'test中文'`, async() => {
        let r = getErrorMessage('test中文')
        let rr = 'test中文'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '12.34' when input 12.34`, function() {
        let r = getErrorMessage(12.34)
        let rr = '12.34'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[1,"3","abc"]' when input [1, '3', 'abc']`, function() {
        let r = getErrorMessage([1, '3', 'abc'])
        let rr = '[1,"3","abc"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc"}' when input { a: 12.34, b: 'abc' }`, function() {
        let r = getErrorMessage({ a: 12.34, b: 'abc' })
        let rr = '{"a":12.34,"b":"abc"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = getErrorMessage({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = getErrorMessage('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[]' when input []`, function() {
        let r = getErrorMessage([])
        let rr = '[]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{}' when input {}`, function() {
        let r = getErrorMessage({})
        let rr = '{}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = getErrorMessage(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = getErrorMessage(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = getErrorMessage(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
