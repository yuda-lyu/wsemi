import fs from 'fs'
import assert from 'assert'
import strleft from '../src/strleft.mjs'
import getErrorMessage from '../src/getErrorMessage.mjs'


//buildCorpus, 全語料庫, 供「恆回字串」「恆不拋錯」「冪等」三條不變式共用
//  不變式測試之價值在於: 日後新增輸入只要加進本表, 三條不變式自動涵蓋, 不必逐條補測試
function buildCorpus() {

    let circObj = { a: 1 }
    circObj.self = circObj

    let circArr = [1]
    circArr.push(circArr)

    let circErr = new Error('circ err')
    circErr.self = circErr

    let msgGetterThrow = {}
    Object.defineProperty(msgGetterThrow, 'message', {
        get() {
            throw new Error('getter boom')
        },
        enumerable: true,
    })

    let errMsgGetterThrow = new Error('x')
    Object.defineProperty(errMsgGetterThrow, 'message', {
        get() {
            throw new Error('getter boom')
        },
    })

    let tagGetterThrow = {}
    Object.defineProperty(tagGetterThrow, Symbol.toStringTag, {
        get() {
            throw new Error('tag getter boom')
        },
    })

    let nonEnumMsg = {}
    Object.defineProperty(nonEnumMsg, 'message', {
        value: 'non-enum msg',
        enumerable: false,
    })

    let nonIdem = { name: 'E' }
    let nonIdemN = 0
    Object.defineProperty(nonIdem, 'message', {
        get() {
            nonIdemN += 1
            return 'g' + nonIdemN
        },
        enumerable: true,
    })

    let errMsgObj = new Error('x')
    errMsgObj.message = { a: 1 }

    //deepObj, 深度須遠超JSON.stringify之遞迴上限(實測5000起即拋RangeError)
    let deepObj = {}
    let deepCur = deepObj
    for (let i = 0; i < 10000; i++) {
        deepCur.n = {}
        deepCur = deepCur.n
    }

    let selfCause = new Error('self')
    selfCause.cause = selfCause

    let mutualA = new Error('A')
    let mutualB = new Error('B', { cause: mutualA })
    mutualA.cause = mutualB

    let aggSelf = new AggregateError([], 'aggself')
    aggSelf.errors = [aggSelf]

    let arrWithMsg = [1]
    arrWithMsg.message = 'm'

    let nullProto = Object.create(null)
    nullProto.message = 'null proto msg'

    let revoked = Proxy.revocable({ message: 'm' }, {})
    revoked.revoke()

    let proxyThrow = new Proxy({}, {
        get() {
            throw new Error('proxy boom')
        },
        has() {
            throw new Error('proxy has boom')
        },
    })

    return [
        ['Error', new Error('something wrong')],
        ['ErrorEmpty', new Error()],
        ['TypeError', new TypeError('wrong type')],
        ['DOMException', new DOMException('operation was aborted.', 'AbortError')],
        ['AggregateError', new AggregateError([new Error('e1'), new Error('e2')], 'outer')],
        ['ErrorWithCause', new Error('top', { cause: new Error('root cause') })],
        ['ErrorEmptyWithCause', new Error('', { cause: new Error('root only') })],
        ['ErrorCircularSelf', circErr],
        ['ErrorMessageObject', errMsgObj],
        ['ErrorMessageGetterThrow', errMsgGetterThrow],
        ['causeSelfRef', selfCause],
        ['causeMutualRef', mutualB],
        ['errorsSelfRef', aggSelf],
        ['string', 'abc'],
        ['stringEmpty', ''],
        ['boxedString', Object('boxed')],
        ['messageString', { message: 'm' }],
        ['messageEmpty', { message: '' }],
        ['messageObject', { message: { a: 1 } }],
        ['messageNull', { message: null }],
        ['messageUndefined', { message: undefined }],
        ['messageNumber', { message: 123 }],
        ['messageBoolean', { message: true }],
        ['messageBigInt', { message: 10n }],
        ['messageSymbol', { message: Symbol('sm') }],
        ['messageFunction', { message: function foo() {} }],
        ['messageArray', { message: ['a'] }],
        ['messageGetterThrow', msgGetterThrow],
        ['messageProto', Object.create({ message: 'proto msg' })],
        ['messageNonEnum', nonEnumMsg],
        ['nonIdempotentGetter', nonIdem],
        ['circularObject', circObj],
        ['circularArray', circArr],
        ['objectWithBigInt', { v: 10n }],
        ['toJSONThrow', {
            toJSON() {
                throw new Error('toJSON boom')
            },
        }],
        ['toJSONUndefined', {
            a: 1,
            toJSON() {
                return undefined
            },
        }],
        ['tagGetterThrow', tagGetterThrow],
        ['proxyThrow', proxyThrow],
        ['revokedProxy', revoked.proxy],
        ['deepNested', deepObj],
        ['nullProtoWithMessage', nullProto],
        ['nullProtoBare', Object.create(null)],
        ['tagFakeString', { [Symbol.toStringTag]: 'String', message: 'm' }],
        ['tagFakeArray', { [Symbol.toStringTag]: 'Array', message: 'm' }],
        ['tagFakeError', { [Symbol.toStringTag]: 'Error', message: 'm' }],
        ['hostEventLike', { [Symbol.toStringTag]: 'ErrorEvent', message: 'boom' }],
        ['plainObject', { a: 1 }],
        ['arrayWithMessage', arrWithMsg],
        ['array', ['a', 'b']],
        ['arrayEmpty', []],
        ['objectEmpty', {}],
        ['null', null],
        ['undefined', undefined],
        ['number', 123],
        ['zero', 0],
        ['nan', NaN],
        ['boolean', true],
        ['bigint', 10n],
        ['symbol', Symbol('s')],
        ['function', function foo() {}],
        ['map', new Map([['k', 'v']])],
        ['set', new Set([1])],
        ['date', new Date(0)],
        ['regexp', /ab/g],
        ['promise', Promise.resolve(1)],
        ['uint8array', new Uint8Array([1, 2, 3])],
        ['classInstance', new (class Foo {
            constructor() {
                this.name = 'Foo'
                this.message = 'cm'
            }
        })()],
    ]
}


//corpus, 只建置一次供三條不變式共用
//  各項輸入皆為唯讀使用, 惟nonIdempotentGetter之getter每讀一次即變值, 該項於冪等測試中排除
let corpus = buildCorpus()


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


    it(`should return 'ENOENT: no such file or directory, open' when throw fs.readFileSync('definitely_not_exists_1234567890.txt')`, async() => {
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

    //以下為擴充測試
    //  分三層: (1)不變式, 對全語料庫斷言「恆回字串」與「恆不拋錯」, 新增輸入自動納入
    //          (2)語意斷言, 逐格釘住各類惡性輸入之預期輸出
    //          (3)opt與穩定性

    it(`should always return a string for every input in corpus`, function() {
        let cs = corpus
        let bad = []
        for (let [name, v] of cs) {
            let r
            try {
                r = getErrorMessage(v)
            }
            catch (err) {
                bad.push(`${name}: THROW ${err.message}`)
                continue
            }
            if (typeof r !== 'string') {
                bad.push(`${name}: ${(r === null) ? 'null' : typeof r}`)
            }
        }
        assert.strict.deepStrictEqual(bad, [])
    })

    it(`should never throw for every input in corpus`, function() {
        let cs = corpus
        let bad = []
        for (let [name, v] of cs) {
            try {
                getErrorMessage(v)
            }
            catch (err) {
                bad.push(`${name}: ${err.message}`)
            }
        }
        assert.strict.deepStrictEqual(bad, [])
    })

    it(`should return '{"a":1}' when input an object whose message is an object`, function() {
        let r = getErrorMessage({ message: { a: 1 } })
        let rr = '{"a":1}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'null' when input { message: null }`, function() {
        let r = getErrorMessage({ message: null })
        let rr = 'null'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123' when input { message: 123 }`, function() {
        let r = getErrorMessage({ message: 123 })
        let rr = '123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'true' when input { message: true }`, function() {
        let r = getErrorMessage({ message: true })
        let rr = 'true'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '10' when input { message: 10n }`, function() {
        let r = getErrorMessage({ message: 10n })
        let rr = '10'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'Symbol(sm)' when input { message: Symbol('sm') }`, function() {
        let r = getErrorMessage({ message: Symbol('sm') })
        let rr = 'Symbol(sm)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '["a"]' when input { message: ['a'] }`, function() {
        let r = getErrorMessage({ message: ['a'] })
        let rr = '["a"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{}' when input { message: undefined }`, function() {
        let r = getErrorMessage({ message: undefined })
        let rr = '{}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'boxed' when input a boxed String object`, function() {
        let r = getErrorMessage(Object('boxed'))
        let rr = 'boxed'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":1}' when input an Error whose message is an object`, function() {
        let err = new Error('x')
        err.message = { a: 1 }
        let r = getErrorMessage(err)
        let rr = '{"a":1}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":1,"self":"[Circular]"}' when input a circular object`, function() {
        let o = { a: 1 }
        o.self = o
        let r = getErrorMessage(o)
        let rr = '{"a":1,"self":"[Circular]"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[1,"[Circular]"]' when input a circular array`, function() {
        let a = [1]
        a.push(a)
        let r = getErrorMessage(a)
        let rr = '[1,"[Circular]"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"v":"10"}' when input an object containing BigInt`, function() {
        let r = getErrorMessage({ v: 10n })
        let rr = '{"v":"10"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return a string when input an object whose toJSON throws`, function() {
        let o = {
            toJSON() {
                throw new Error('toJSON boom')
            },
        }
        let r = getErrorMessage(o)
        assert.strict.deepStrictEqual(typeof r, 'string')
    })

    it(`should return a string when input an object whose toJSON returns undefined`, function() {
        let o = {
            a: 1,
            toJSON() {
                return undefined
            },
        }
        let r = getErrorMessage(o)
        assert.strict.deepStrictEqual(typeof r, 'string')
    })

    it(`should return a string when input an object whose message getter throws`, function() {
        let o = {}
        Object.defineProperty(o, 'message', {
            get() {
                throw new Error('getter boom')
            },
            enumerable: true,
        })
        let r = getErrorMessage(o)
        assert.strict.deepStrictEqual(typeof r, 'string')
    })

    it(`should return a string when input an Error whose message getter throws`, function() {
        let err = new Error('x')
        Object.defineProperty(err, 'message', {
            get() {
                throw new Error('getter boom')
            },
        })
        let r = getErrorMessage(err)
        assert.strict.deepStrictEqual(typeof r, 'string')
    })

    it(`should return a string when input an object whose Symbol.toStringTag getter throws`, function() {
        let o = {}
        Object.defineProperty(o, Symbol.toStringTag, {
            get() {
                throw new Error('tag getter boom')
            },
        })
        let r = getErrorMessage(o)
        assert.strict.deepStrictEqual(typeof r, 'string')
    })

    it(`should return a string when input a Proxy whose get and has traps throw`, function() {
        let p = new Proxy({}, {
            get() {
                throw new Error('proxy boom')
            },
            has() {
                throw new Error('proxy has boom')
            },
        })
        let r = getErrorMessage(p)
        assert.strict.deepStrictEqual(typeof r, 'string')
    })

    it(`should return a string when input a revoked Proxy`, function() {
        let rv = Proxy.revocable({ message: 'm' }, {})
        rv.revoke()
        let r = getErrorMessage(rv.proxy)
        assert.strict.deepStrictEqual(typeof r, 'string')
    })

    it(`should return a string when input a deeply nested object`, function() {
        let o = {}
        let cur = o
        for (let i = 0; i < 20000; i++) {
            cur.n = {}
            cur = cur.n
        }
        let r = getErrorMessage(o)
        assert.strict.deepStrictEqual(typeof r, 'string')
        assert.strict.deepStrictEqual(r.length > 0, true)
    })

    it(`should return 'm' when input an object whose Symbol.toStringTag is faked as 'String'`, function() {
        let r = getErrorMessage({ [Symbol.toStringTag]: 'String', message: 'm' })
        let rr = 'm'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'm' when input an object whose Symbol.toStringTag is faked as 'Array'`, function() {
        let r = getErrorMessage({ [Symbol.toStringTag]: 'Array', message: 'm' })
        let rr = 'm'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'm' when input an object whose Symbol.toStringTag is faked as 'Error'`, function() {
        let r = getErrorMessage({ [Symbol.toStringTag]: 'Error', message: 'm' })
        let rr = 'm'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'boom' when input a host-event-like object carrying message`, function() {
        let r = getErrorMessage({ [Symbol.toStringTag]: 'ErrorEvent', message: 'boom' })
        let rr = 'boom'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'true' when input true`, function() {
        let r = getErrorMessage(true)
        let rr = 'true'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '/ab/g' when input /ab/g`, function() {
        let r = getErrorMessage(/ab/g)
        let rr = '/ab/g'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '1970-01-01T00:00:00.000Z' when input new Date(0)`, function() {
        let r = getErrorMessage(new Date(0))
        let rr = '1970-01-01T00:00:00.000Z'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[object Map]' when input new Map()`, function() {
        let r = getErrorMessage(new Map([['k', 'v']]))
        let rr = '[object Map]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'Symbol(s)' when input Symbol('s')`, function() {
        let r = getErrorMessage(Symbol('s'))
        let rr = 'Symbol(s)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'proto msg' when message comes from prototype chain`, function() {
        let r = getErrorMessage(Object.create({ message: 'proto msg' }))
        let rr = 'proto msg'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'root only' when input new Error('', { cause }) for message is empty`, function() {
        let r = getErrorMessage(new Error('', { cause: new Error('root only') }))
        let rr = 'root only'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'top' when input new Error('top', { cause }) by default`, function() {
        let r = getErrorMessage(new Error('top', { cause: new Error('root cause') }))
        let rr = 'top'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'top <- root cause' when opt.useCause=true`, function() {
        let r = getErrorMessage(new Error('top', { cause: new Error('root cause') }), { useCause: true })
        let rr = 'top <- root cause'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'fetch failed <- bad port' when opt.useCause=true for a fetch-like error`, function() {
        let r = getErrorMessage(new TypeError('fetch failed', { cause: new Error('bad port') }), { useCause: true })
        let rr = 'fetch failed <- bad port'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not loop forever when opt.useCause=true and cause refers to itself`, function() {
        let err = new Error('self')
        err.cause = err
        let r = getErrorMessage(err, { useCause: true })
        let rr = 'self'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not loop forever when opt.useCause=true and causes refer to each other`, function() {
        let a = new Error('A')
        let b = new Error('B', { cause: a })
        a.cause = b
        let r = getErrorMessage(b, { useCause: true })
        let rr = 'B <- A'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'outer' when input AggregateError by default`, function() {
        let r = getErrorMessage(new AggregateError([new Error('e1'), new Error('e2')], 'outer'))
        let rr = 'outer'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'outer [e1; e2]' when opt.useAggregate=true`, function() {
        let r = getErrorMessage(new AggregateError([new Error('e1'), new Error('e2')], 'outer'), { useAggregate: true })
        let rr = 'outer [e1; e2]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not loop forever when opt.useAggregate=true and errors contains itself`, function() {
        let agg = new AggregateError([], 'aggself')
        agg.errors = [agg]
        let r = getErrorMessage(agg, { useAggregate: true })
        assert.strict.deepStrictEqual(typeof r, 'string')
    })

    it(`should fallback to false when opt.useCause is not a boolean`, function() {
        let r = getErrorMessage(new Error('top', { cause: new Error('root cause') }), { useCause: 'true' })
        let rr = 'top'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'top' when opt is null`, function() {
        let r = getErrorMessage(new Error('top', { cause: new Error('root cause') }), null)
        let rr = 'top'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should limit cause chain depth by opt.levelCauseMax`, function() {
        let err = new Error('L0')
        let cur = err
        for (let i = 1; i <= 20; i++) {
            let nx = new Error('L' + i)
            cur.cause = nx
            cur = nx
        }
        let r = getErrorMessage(err, { useCause: true, levelCauseMax: 3 })
        let rr = 'L0 <- L1 <- L2 <- L3'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should limit json nesting depth by opt.levelJsonMax`, function() {
        let o = { n: { n: { n: { n: 'deep' } } } }
        let r = getErrorMessage(o, { levelJsonMax: 2 })
        let rr = '{"n":{"n":"[Deep]"}}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should accept a numeric string for opt.levelCauseMax`, function() {
        let err = new Error('L0')
        let cur = err
        for (let i = 1; i <= 20; i++) {
            let nx = new Error('L' + i)
            cur.cause = nx
            cur = nx
        }
        let r = getErrorMessage(err, { useCause: true, levelCauseMax: '3' })
        let rr = 'L0 <- L1 <- L2 <- L3'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to default when opt.levelCauseMax is Infinity`, function() {
        let err = new Error('L0')
        let cur = err
        for (let i = 1; i <= 20; i++) {
            let nx = new Error('L' + i)
            cur.cause = nx
            cur = nx
        }
        let r = getErrorMessage(err, { useCause: true, levelCauseMax: Infinity })
        let rr = 'L0 <- L1 <- L2 <- L3 <- L4 <- L5 <- L6 <- L7 <- L8'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to default when opt.lengthMessageMax is out of safe integer range`, function() {
        let s = 'a'.repeat(100)
        let r = getErrorMessage(new Error(s), { lengthMessageMax: Number.MAX_SAFE_INTEGER + 1 })
        assert.strict.deepStrictEqual(r.length, 100)
    })

    it(`should fallback to default when opt.levelCauseMax is not a positive integer`, function() {
        let err = new Error('L0', { cause: new Error('L1') })
        let r = getErrorMessage(err, { useCause: true, levelCauseMax: 0 })
        let rr = 'L0 <- L1'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to default when opt.levelJsonMax is not a positive integer`, function() {
        let r = getErrorMessage({ a: 1 }, { levelJsonMax: 'x' })
        let rr = '{"a":1}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not truncate by default`, function() {
        let s = 'a'.repeat(5000)
        let r = getErrorMessage(new Error(s))
        assert.strict.deepStrictEqual(r.length, 5000)
    })

    it(`should truncate to opt.lengthMessageMax and append '...'`, function() {
        let s = 'abcdefghijklmnopqrstuvwxyz'
        let r = getErrorMessage(new Error(s), { lengthMessageMax: 10 })
        let rr = 'abcdefg...'
        assert.strict.deepStrictEqual(r, rr)
        assert.strict.deepStrictEqual(r.length, 10)
    })

    it(`should truncate without marker when opt.lengthMessageMax is not greater than 3`, function() {
        let r = getErrorMessage(new Error('abcdefg'), { lengthMessageMax: 2 })
        let rr = 'ab'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not truncate when message is shorter than opt.lengthMessageMax`, function() {
        let r = getErrorMessage(new Error('abc'), { lengthMessageMax: 10 })
        let rr = 'abc'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not truncate when opt.lengthMessageMax is not a positive integer`, function() {
        let s = 'a'.repeat(100)
        let r = getErrorMessage(new Error(s), { lengthMessageMax: -1 })
        assert.strict.deepStrictEqual(r.length, 100)
    })

    it(`should truncate a serialized object result by opt.lengthMessageMax`, function() {
        let r = getErrorMessage({ a: 'a'.repeat(100) }, { lengthMessageMax: 12 })
        let rr = '{"a":"aaa...'
        assert.strict.deepStrictEqual(r, rr)
        assert.strict.deepStrictEqual(r.length, 12)
    })

    //本條釘住契約邊界: 不拋錯之保證涵蓋任意err, 但不涵蓋opt
    //  opt為呼叫端自備之設定物件, 其讀取比照本套件慣例不另包try, 與其餘用get(opt,...)之函數一致
    //  若日後改為包try, 本條會失敗而促使撰寫者確認該項變更係屬有意
    it(`should propagate the error when an option getter throws, as opt is not covered by the no-throw guarantee`, function() {
        let opt = {}
        Object.defineProperty(opt, 'useCause', {
            get() {
                throw new Error('opt boom')
            },
            enumerable: true,
        })
        let r = () => {
            return getErrorMessage(new Error('something wrong'), opt)
        }
        assert.throws(r, /opt boom/)
    })

    it(`should read message getter exactly once`, function() {
        let n = 0
        let o = { name: 'E' }
        Object.defineProperty(o, 'message', {
            get() {
                n += 1
                return 'g'
            },
            enumerable: true,
        })
        getErrorMessage(o)
        assert.strict.deepStrictEqual(n, 1)
    })

    it(`should return the same result when called twice for every input in corpus`, function() {
        let cs = corpus
        let bad = []
        for (let [name, v] of cs) {
            if (name === 'nonIdempotentGetter') {
                continue //輸入本身每讀一次就變值, 任何實作皆不可能穩定
            }
            let a = getErrorMessage(v)
            let b = getErrorMessage(v)
            if (a !== b) {
                bad.push(`${name}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`)
            }
        }
        assert.strict.deepStrictEqual(bad, [])
    })

})
