import assert from 'assert'
import isEmail from '../src/isEmail.mjs'


describe(`isEmail`, function() {

    it(`should return true when input 'abc@mail.com'`, function() {
        let r = isEmail('abc@mail.com')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 'abc'`, function() {
        let r = isEmail('abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc#'`, function() {
        let r = isEmail('abc#')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc@'`, function() {
        let r = isEmail('abc@')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc@a'`, function() {
        let r = isEmail('abc@a')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc@a.b'`, function() {
        let r = isEmail('abc@a.b')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc@com'`, function() {
        let r = isEmail('abc@com')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc@a.b.t'`, function() {
        let r = isEmail('abc@a.b.t')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 'abc@a.com'`, function() {
        let r = isEmail('abc@a.com')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 'a bc@a.com'`, function() {
        let r = isEmail('a bc@a.com')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 'a.bc@a.com'`, function() {
        let r = isEmail('a.bc@a.com')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a_bc@a.com'`, function() {
        let r = isEmail('a_bc@a.com')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '2019-01-01'`, function() {
        let r = isEmail('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isEmail('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isEmail('2019-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isEmail('2019-21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isEmail(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 0`, function() {
        let r = isEmail(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isEmail(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input -125`, function() {
        let r = isEmail(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isEmail(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isEmail(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '0'`, function() {
        let r = isEmail('0')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isEmail('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '-125'`, function() {
        let r = isEmail('-125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isEmail('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isEmail('-1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isEmail('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isEmail('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isEmail('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isEmail('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isEmail(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isEmail([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isEmail([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isEmail([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isEmail([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isEmail(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isEmail({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isEmail({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isEmail({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isEmail(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isEmail(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isEmail(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

    //--- local part ---

    it(`should return true for plus addressing`, function() {
        assert.strict.deepStrictEqual(isEmail('abc+tag@mail.com'), true)
        assert.strict.deepStrictEqual(isEmail('ager+huang@agentmail.to'), true)
    })

    it(`should return true for every RFC 5322 atext special character in the local part`, function() {
        assert.strict.deepStrictEqual(isEmail('a!#$%&\'*+/=?^_`{|}~-@a.com'), true)
        assert.strict.deepStrictEqual(isEmail(`o'brien@a.com`), true)
        assert.strict.deepStrictEqual(isEmail('-abc@a.com'), true)
    })

    it(`should return true for dot separated local part`, function() {
        assert.strict.deepStrictEqual(isEmail('a.b.c@a.com'), true)
    })

    it(`should return false for leading, trailing or consecutive dots in the local part`, function() {
        assert.strict.deepStrictEqual(isEmail('.abc@a.com'), false)
        assert.strict.deepStrictEqual(isEmail('abc.@a.com'), false)
        assert.strict.deepStrictEqual(isEmail('a..b@a.com'), false)
    })

    it(`should return false for whitespace anywhere`, function() {
        assert.strict.deepStrictEqual(isEmail('ab c@a.com'), false)
        assert.strict.deepStrictEqual(isEmail(' abc@a.com'), false)
        assert.strict.deepStrictEqual(isEmail('abc@a.com '), false)
        assert.strict.deepStrictEqual(isEmail('abc@a.com\n'), false)
    })

    it(`should return false for a quoted local part, which is not supported`, function() {
        assert.strict.deepStrictEqual(isEmail('"john doe"@a.com'), false)
    })

    it(`should return false for unicode in the local part or the domain, which is not supported`, function() {
        assert.strict.deepStrictEqual(isEmail('使用者@a.com'), false)
        assert.strict.deepStrictEqual(isEmail('abc@例子.台灣'), false)
    })

    it(`should return true for a 64 character local part and false for 65`, function() {
        assert.strict.deepStrictEqual(isEmail('a'.repeat(64) + '@a.com'), true)
        assert.strict.deepStrictEqual(isEmail('a'.repeat(65) + '@a.com'), false)
    })

    //--- @ ---

    it(`should return false for zero or two @`, function() {
        assert.strict.deepStrictEqual(isEmail('abc.a.com'), false)
        assert.strict.deepStrictEqual(isEmail('abc@@a.com'), false)
        assert.strict.deepStrictEqual(isEmail('ab@c@a.com'), false)
    })

    //--- domain ---

    it(`should return true for multi level domains and hyphens inside labels`, function() {
        assert.strict.deepStrictEqual(isEmail('abc@example.co.uk'), true)
        assert.strict.deepStrictEqual(isEmail('abc@sub-domain.example.com'), true)
        assert.strict.deepStrictEqual(isEmail('abc@123.com'), true)
        assert.strict.deepStrictEqual(isEmail('abc@a1.b2.com'), true)
    })

    it(`should return false for labels starting or ending with a hyphen`, function() {
        assert.strict.deepStrictEqual(isEmail('abc@-a.com'), false)
        assert.strict.deepStrictEqual(isEmail('abc@a-.com'), false)
    })

    it(`should return false for an underscore in the domain`, function() {
        assert.strict.deepStrictEqual(isEmail('abc@a_b.com'), false)
    })

    it(`should return false for empty labels`, function() {
        assert.strict.deepStrictEqual(isEmail('abc@a..com'), false)
        assert.strict.deepStrictEqual(isEmail('abc@.a.com'), false)
        assert.strict.deepStrictEqual(isEmail('abc@a.com.'), false)
    })

    it(`should return false for a domain without a top level domain`, function() {
        assert.strict.deepStrictEqual(isEmail('abc@localhost'), false)
        assert.strict.deepStrictEqual(isEmail('a@b'), false)
    })

    it(`should return false for an ip literal, which is not supported`, function() {
        assert.strict.deepStrictEqual(isEmail('abc@[192.168.0.1]'), false)
    })

    it(`should return true for a 63 character label and false for 64`, function() {
        assert.strict.deepStrictEqual(isEmail('a@' + 'a'.repeat(63) + '.com'), true)
        assert.strict.deepStrictEqual(isEmail('a@' + 'a'.repeat(64) + '.com'), false)
    })

    //--- top level domain ---

    it(`should return true for top level domains longer than 3 characters`, function() {
        assert.strict.deepStrictEqual(isEmail('abc@mail.info'), true)
        assert.strict.deepStrictEqual(isEmail('user@company.tech'), true)
        assert.strict.deepStrictEqual(isEmail('user@mail.email'), true)
        assert.strict.deepStrictEqual(isEmail('user@x.taipei'), true)
    })

    it(`should return false for a one character or numeric top level domain`, function() {
        assert.strict.deepStrictEqual(isEmail('abc@a.x'), false)
        assert.strict.deepStrictEqual(isEmail('abc@a.123'), false)
    })

    it(`should return true for a punycode top level domain in either case`, function() {
        assert.strict.deepStrictEqual(isEmail('abc@a.xn--kpry57d'), true) //.台灣
        assert.strict.deepStrictEqual(isEmail('abc@a.XN--KPRY57D'), true)
        assert.strict.deepStrictEqual(isEmail('abc@a.xn--bcher-kva'), true)
    })

    it(`should return false for a malformed punycode top level domain`, function() {
        assert.strict.deepStrictEqual(isEmail('abc@a.xn--'), false)
        assert.strict.deepStrictEqual(isEmail('abc@a.xn--a-'), false)
        assert.strict.deepStrictEqual(isEmail('abc@a.xn-kpry57d'), false)
    })

    it(`should be case insensitive`, function() {
        assert.strict.deepStrictEqual(isEmail('ABC@A.COM'), true)
        assert.strict.deepStrictEqual(isEmail('Abc@Mail.Com'), true)
    })

    //--- length ---

    it(`should return true for a 254 character address and false for 255`, function() {
        let head = 'a'.repeat(64) + '@' + ('b'.repeat(63) + '.').repeat(2)
        let ok = head + 'c'.repeat(57) + '.com'
        let bad = head + 'c'.repeat(58) + '.com'
        assert.strict.deepStrictEqual([ok.length, bad.length], [254, 255])
        assert.strict.deepStrictEqual(isEmail(ok), true)
        assert.strict.deepStrictEqual(isEmail(bad), false)
    })

    //--- performance ---

    it(`should reject long invalid input in linear time instead of backtracking`, function() {
        //舊正則對 'abc@' 加 30 個字母需回溯 4 秒以上, 60 個字母則永遠算不完
        let t0 = Date.now()
        let r1 = isEmail('abc@' + 'x'.repeat(60))
        let r2 = isEmail('a'.repeat(200) + '!')
        let r3 = isEmail('a@' + 'a.'.repeat(120) + '1')
        let r4 = isEmail('abc@' + 'x'.repeat(100000) + '.com')
        let dt = Date.now() - t0
        assert.strict.deepStrictEqual([r1, r2, r3, r4], [false, false, false, false])
        assert.strict.deepStrictEqual(dt < 200, true, `dt=${dt}`)
    })

})
