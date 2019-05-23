import assert from 'assert'
import clearXSS from '../src/clearXSS.mjs'


describe(`clearXSS`, function() {
    let k
    let x = {}
    let fx = {}

    k = 1
    x[k] = `><script>alert('XSS')</script>`
    fx[k] = `&gt;&lt;script&gt;alert('XSS')&lt;/script&gt;`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 1
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 2
    x[k] = `='><script>alert('XSS')</script>`
    fx[k] = `='&gt;&lt;script&gt;alert('XSS')&lt;/script&gt;`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 2
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 3
    x[k] = `"><script>alert('XSS')</script>`
    fx[k] = `"&gt;&lt;script&gt;alert('XSS')&lt;/script&gt;`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 3
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 4
    x[k] = `<script>alert('XSS')</script>`
    fx[k] = `&lt;script&gt;alert('XSS')&lt;/script&gt;`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 4
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 5
    x[k] = `<script>alert (vulnerable)</script>`
    fx[k] = `&lt;script&gt;alert (vulnerable)&lt;/script&gt;`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 5
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 6
    x[k] = `%3Cscript%3Ealert('XSS')%3C/script%3E`
    fx[k] = `%3Cscript%3Ealert('XSS')%3C/script%3E`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 6
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 7
    x[k] = `<script>alert('XSS')</script>`
    fx[k] = `&lt;script&gt;alert('XSS')&lt;/script&gt;`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 7
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 8
    x[k] = `<img src="javascript:alert('XSS')">`
    fx[k] = `<img src>`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 8
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 9
    x[k] = `<img src="http://888.888.com/999.png" onerror="alert('XSS')">`
    fx[k] = `<img src="http://888.888.com/999.png">`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 9
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 10
    x[k] = `<div style="height:expression(alert('XSS'),1)"></div>`
    fx[k] = `<div style="height:expression(alert('XSS'),1)"></div>`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 10
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 11
    x[k] = 123
    fx[k] = 123
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 11
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 12
    x[k] = 12.34
    fx[k] = 12.34
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 12
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 13
    x[k] = '12.34'
    fx[k] = '12.34'
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 13
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 14
    x[k] = '12.34abc'
    fx[k] = '12.34abc'
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 14
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 15
    x[k] = `[123,'12.34',abc',345xyz','',[],{},null,undefined]`
    fx[k] = `[123,'12.34',abc',345xyz','',[],{},null,undefined]`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 15
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    k = 16
    x[k] = `{a:123,b:'345xyz'}`
    fx[k] = `{a:123,b:'345xyz'}`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 16
        let r = clearXSS(x[k])
        assert.strict.deepEqual(r, fx[k])
    })

    it(`should return '' when input ''`, function() {
        let r = clearXSS('')
        assert.strict.deepEqual(r, '')
    })

    it(`should return [] when input []`, function() {
        let r = clearXSS([])
        assert.strict.deepEqual(r, [])
    })

    it(`should return {} when input {}`, function() {
        let r = clearXSS({})
        assert.strict.deepEqual(r, {})
    })

    it(`should return null when input null`, function() {
        let r = clearXSS(null)
        assert.strict.deepEqual(r, null)
    })

    it(`should return undefined when input undefined`, function() {
        let r = clearXSS(undefined)
        assert.strict.deepEqual(r, undefined)
    })

})
