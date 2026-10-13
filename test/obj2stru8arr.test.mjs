import assert from 'assert'
import vm from 'vm'
import obj2stru8arr from '../src/obj2stru8arr.mjs'
import obj2u8arr from '../src/obj2u8arr.mjs'
import u8arr2obj from '../src/u8arr2obj.mjs'
import { thrower, thrownCases } from './tools/codecThrown.mjs'
import { showDeep } from './tools/caseKit.mjs'


describe(`obj2stru8arr`, function() {
    let inp = {
        a: 123,
        b: 45.67,
        c: 'l1-測試中文',
        d: {
            da: 123,
            db: 45.67,
            dc: 'l2-測試中文',
            dd: ['a', 'xyz', 321, 76.54],
            de: new Uint8Array([66, 97, 115]),
        },
    }
    let out = {
        results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[BlazeForUint8Array]::0"}}',
        binarys: [new Uint8Array([66, 97, 115])]
    }
    let cout = `{ results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[BlazeForUint8Array]::0"}}', binarys: [ Uint8Array [ 66, 97, 115 ] ] }`
    let empty = {
        results: '',
        binarys: []
    }
    let cempty = `{ results: '{}', binarys: [] }`

    it(`should return ${cout} when input ${JSON.stringify(inp)}`, function() {
        let r = obj2stru8arr(inp)
        let rr = out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input ''`, function() {
        let r = obj2stru8arr('')
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input []`, function() {
        let r = obj2stru8arr([])
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input {}`, function() {
        let r = obj2stru8arr({})
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input null`, function() {
        let r = obj2stru8arr(null)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input undefined`, function() {
        let r = obj2stru8arr(undefined)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input NaN`, function() {
        let r = obj2stru8arr(NaN)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input an object with BigInt`, function() {
        let r = obj2stru8arr({ id: 1n, name: 'x' })
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input a circular object`, function() {
        let o = { x: 1 }
        o.self = o
        let r = obj2stru8arr(o)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: ${cout} } when input ${JSON.stringify(inp)} with returnWithStateAndMsg`, function() {
        let r = obj2stru8arr(inp, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: out }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data, data is not an object or array' } when input NaN with returnWithStateAndMsg`, function() {
        let r = obj2stru8arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data, data is not an object or array' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data, data is an empty object or empty array' } when input {} with returnWithStateAndMsg`, function() {
        let r = obj2stru8arr({}, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data, data is an empty object or empty array' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data, data is an empty object or empty array' } when input [] with returnWithStateAndMsg`, function() {
        let r = obj2stru8arr([], { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data, data is an empty object or empty array' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { results: '[1,2,3]', binarys: [] } when input [1, 2, 3]`, function() {
        //陣列亦為支援之輸入型別(obj2u8arr之契約為物件或陣列, 解碼端stru8arr2obj原就能還原陣列)
        let r = obj2stru8arr([1, 2, 3])
        let rr = { results: '[1,2,3]', binarys: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should escape an application string that is exactly the marker`, function() {
        //應用字串與標記同形時須前置跳脫記號, 否則解碼端無從區分
        let r = obj2stru8arr({ t: '[BlazeForUint8Array]::0', bin: new Uint8Array([7]) })
        let rr = {
            results: '{"t":"[BlazeForPreventEscape][BlazeForUint8Array]::0","bin":"[BlazeForUint8Array]::0"}',
            binarys: [new Uint8Array([7])],
        }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should escape an application string that already looks escaped (escaping is repeatable)`, function() {
        let r = obj2stru8arr({ t: '[BlazeForPreventEscape][BlazeForUint8Array]::0' })
        let rr = {
            results: '{"t":"[BlazeForPreventEscape][BlazeForPreventEscape][BlazeForUint8Array]::0"}',
            binarys: [],
        }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should NOT escape an application string that merely contains the marker text`, function() {
        let r = obj2stru8arr({ t: 'note: [BlazeForUint8Array]::0 xxx' })
        let rr = {
            results: '{"t":"note: [BlazeForUint8Array]::0 xxx"}',
            binarys: [],
        }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should NOT escape a lone escape tag`, function() {
        let r = obj2stru8arr({ t: '[BlazeForPreventEscape]' })
        let rr = {
            results: '{"t":"[BlazeForPreventEscape]"}',
            binarys: [],
        }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { results: '["a","[BlazeForUint8Array]::0"]', binarys: [ Uint8Array [ 66 ] ] } when input ['a', new Uint8Array([66])]`, function() {
        let r = obj2stru8arr(['a', new Uint8Array([66])])
        let rr = { results: '["a","[BlazeForUint8Array]::0"]', binarys: [new Uint8Array([66])] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not throw but return { state: 'error', msg: <Error> } when input data has a throwing getter`, function() {
        //序列化之非預期錯誤須被攔截, 不得外拋至呼叫端
        let o = {
            get a() {
                throw new Error('boom-getter')
            },
        }
        let r = obj2stru8arr(o, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'Error: boom-getter' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: <TypeError> } when input an object with BigInt with returnWithStateAndMsg`, function() {
        let r = obj2stru8arr({ id: 1n, name: 'x' }, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(Object.keys(r).sort(), ['msg', 'state'])
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('TypeError') === 0, true, `msg 應為序列化錯誤, got ${r.msg}`)
    })

    it(`should return ${cout} when input ${JSON.stringify(inp)} with invalid returnWithStateAndMsg`, function() {
        let r = obj2stru8arr(inp, { returnWithStateAndMsg: 'yes' })
        let rr = out
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`obj2stru8arr Error轉換(R-CODEC-ERR-01之1)`, function() {

    //rt, 往返: 以obj2u8arr編碼{ v }, 再以u8arr2obj解回, 回傳解回值v之JSON字串; 編碼或解碼失敗即斷言失敗
    let rt = (v) => {
        let r1 = obj2u8arr({ v }, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r1.state, 'success', `obj2u8arr 應成功, got ${r1.state}`)
        let r2 = u8arr2obj(r1.msg, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r2.state, 'success', `u8arr2obj 應成功, got ${r2.state}: ${r2.msg}`)
        return JSON.stringify(r2.msg.v)
    }

    //HttpError, 繼承Error並加掛欄位之自訂錯誤類別
    class HttpError extends Error {
        constructor(m) {
            super(m)
            this.name = 'HttpError'
            this.status = 503
        }
    }

    //AppError, 未繼承Error但恰帶字串name與message之錯誤類別, 為一般物件
    class AppError {
        constructor() {
            this.name = 'AppError'
            this.message = 'quota exceeded'
            this.code = 429
        }
    }

    //AppErrorWithToString, 同AppError且另定義toString
    class AppErrorWithToString {
        constructor() {
            this.name = 'AppError'
            this.message = 'quota exceeded'
            this.code = 429
        }

        toString() {
            return `${this.name}: ${this.message}`
        }
    }

    //ChatMessage, 恰帶字串name與message之一般資料類別
    class ChatMessage {
        constructor() {
            this.name = 'Alice'
            this.message = 'hi'
            this.ts = 1
            this.room = 'r1'
        }
    }

    //cases, 逐值斷言, rr為解回值之JSON字串
    //  前7列為真Error(含子類別、DOMException、以Error.prototype為原型者、Error之Proxy、跨realm之Error), 轉為'名稱: 訊息'字串, 修正前後相同, 屬對照
    //  後6列為一般物件, 照一般物件序列化並保留全部可列舉欄位(含恰帶字串name與message之類別實例、跨realm之非Error類別實例、偽造Symbol.toStringTag者), 修正前會被壓成字串而遺失欄位
    let cases = [
        { name: 'Error', mk: () => new Error('m'), rr: '"Error: m"' },
        { name: 'TypeError', mk: () => new TypeError('t'), rr: '"TypeError: t"' },
        { name: 'a custom error class extending Error with extra fields (HttpError)', mk: () => new HttpError('down'), rr: '"HttpError: down"' },
        { name: 'DOMException', mk: () => new DOMException('dom msg', 'AbortError'), rr: '"AbortError: dom msg"' },
        {
            name: 'an object created from Error.prototype',
            mk: () => {
                let e = Object.create(Error.prototype)
                e.message = 'oc'
                return e
            },
            rr: '"Error: oc"',
        },
        { name: 'a Proxy of Error', mk: () => new Proxy(new Error('p'), {}), rr: '"Error: p"' },
        { name: 'an Error from another realm (vm context)', mk: () => vm.runInContext('new Error("fx")', vm.createContext({})), rr: '"Error: fx"' },
        { name: 'a non-Error class with string name and message (AppError)', mk: () => new AppError(), rr: '{"name":"AppError","message":"quota exceeded","code":429}' },
        { name: 'a non-Error class with string name and message and its own toString (AppError)', mk: () => new AppErrorWithToString(), rr: '{"name":"AppError","message":"quota exceeded","code":429}' },
        { name: 'a data class with string name and message (ChatMessage)', mk: () => new ChatMessage(), rr: '{"name":"Alice","message":"hi","ts":1,"room":"r1"}' },
        {
            name: 'a non-Error class instance from another realm (vm context)',
            mk: () => vm.runInContext(`class AppError { constructor() { this.name = 'AppError'; this.message = 'm'; this.code = 1 } }; new AppError()`, vm.createContext({})),
            rr: '{"name":"AppError","message":"m","code":1}',
        },
        { name: 'a plain object with string name and message', mk: () => ({ name: 'AppError', message: 'quota exceeded', code: 429 }), rr: '{"name":"AppError","message":"quota exceeded","code":429}' },
        { name: 'a plain object spoofing Symbol.toStringTag as Error', mk: () => ({ message: 'spoof', [Symbol.toStringTag]: 'Error' }), rr: '{"message":"spoof"}' },
    ]

    for (let c of cases) {
        it(`should decode ${c.name} as ${c.rr} after obj2u8arr and u8arr2obj [R-CODEC-ERR-01之1]`, function() {
            assert.strict.deepStrictEqual(rt(c.mk()), c.rr)
        })
    }

    it(`should convert real Errors at any depth while keeping sibling data objects intact [R-CODEC-ERR-01之1]`, function() {
        let v = { list: [new Error('e1'), new ChatMessage(), { inner: new TypeError('e2') }] }
        let rr = '{"list":["Error: e1",{"name":"Alice","message":"hi","ts":1,"room":"r1"},{"inner":"TypeError: e2"}]}'
        assert.strict.deepStrictEqual(rt(v), rr)
    })

})


describe(`obj2stru8arr 呼叫端拋出任意值(R-CODEC-ERR-01之2)`, function() {

    for (let c of thrownCases) {
        it(`should not throw but return { state: 'error', msg: '${c.msg}' } when toJSON throws ${c.name} with returnWithStateAndMsg [R-CODEC-ERR-01之2]`, function() {
            let data = { a: { toJSON: thrower(c.mk()) } }
            let r = null
            assert.doesNotThrow(() => {
                r = obj2stru8arr(data, { returnWithStateAndMsg: true })
            })
            assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: c.msg })
        })
    }

    for (let c of thrownCases) {
        it(`should not throw but return { results: '', binarys: [] } when toJSON throws ${c.name} without opt [R-CODEC-ERR-01之2]`, function() {
            let data = { a: { toJSON: thrower(c.mk()) } }
            let r = null
            assert.doesNotThrow(() => {
                r = obj2stru8arr(data)
            })
            assert.strict.deepStrictEqual(showDeep(r), { results: '', binarys: [] })
        })
    }

    it(`should keep the TypeError msg of BigInt serialization (same before and after the fix) [R-CODEC-ERR-01之2]`, function() {
        let r = obj2stru8arr({ id: 1n }, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.startsWith('TypeError: Do not know how to serialize a BigInt'), true, `msg 應為 BigInt 序列化錯誤, got ${r.msg}`)
    })

})
