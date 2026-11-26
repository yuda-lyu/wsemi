import assert from 'assert'
import obj2str from '../src/obj2str.mjs'
import str2obj from '../src/str2obj.mjs'
import { thrower, thrownCases } from './tools/codecThrown.mjs'
import { showDeep } from './tools/caseKit.mjs'
import { realErrorCases, nestedErrorCase, errorProtoToStringCases, nameThrowsErrorCase } from './tools/realErrorCases.mjs'


describe(`obj2str`, function() {

    let o = {
        a: 'abc',
        b: 12.3,
        u8a: new Uint8Array([66, 97, 115]),
        u16a: new Uint16Array([11, 79, 6]),
    }
    let co1 = '{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":{"0":11,"1":79,"2":6}}'
    let co2 = '{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":"[Uint16Array]::CwBPAAYA"}'

    it(`should return ${co1} when input ${JSON.stringify(o)}`, function() {
        let r = obj2str(o)
        let rr = co1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${co2} when input ${JSON.stringify(o)}, ['Uint8Array', 'Uint16Array']`, function() {
        let r = obj2str(o, ['Uint8Array', 'Uint16Array'])
        let rr = co2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback ext to 'Uint8Array' when ext is an invalid type`, function() {
        //ext非字串亦非陣列時回退為預設之'Uint8Array', 結果須等同未給ext
        for (let v of [null, undefined, 12.34, {}, true, NaN]) {
            let r = obj2str(o, v)
            assert.strict.deepStrictEqual(r, co1)
        }
    })

    it(`should treat string ext the same as single-element array ext`, function() {
        //回退值與isstr分支轉出之型別須一致, 皆為陣列, 故二者結果須相同
        assert.strict.deepStrictEqual(obj2str(o, 'Uint8Array'), obj2str(o, ['Uint8Array']))
        assert.strict.deepStrictEqual(obj2str(o, 'Uint16Array'), obj2str(o, ['Uint16Array']))
    })

    it(`should round-trip with str2obj under invalid ext`, function() {
        //obj2str與str2obj須成對使用相同ext, 兩端對無效ext之回退一致才能正確往返
        let c = obj2str(o, null)
        let r = str2obj(c, null)
        assert.strict.deepStrictEqual(r.u8a, o.u8a)
    })

    it(`should return '[1,"3","abc"]' when input [1, '3', 'abc']`, function() {
        let r = obj2str([1, '3', 'abc'])
        let rr = '[1,"3","abc"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[1,"",null,null,[],{},"3","abc"]' when input [1, '', null, undefined, [], {}, '3', 'abc']`, function() {
        let r = obj2str([1, '', null, undefined, [], {}, '3', 'abc'])
        let rr = '[1,"",null,null,[],{},"3","abc"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc"}' when input { a: 12.34, b: 'abc' }`, function() {
        let r = obj2str({ a: 12.34, b: 'abc' })
        let rr = '{"a":12.34,"b":"abc"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = obj2str({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123' when input 123`, function() {
        let r = obj2str(123)
        let rr = '123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123.456' when input 123.456`, function() {
        let r = obj2str(123.456)
        let rr = '123.456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '"123"' when input '123'`, function() {
        let r = obj2str('123')
        let rr = '"123"'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '"123.456"' when input '123.456'`, function() {
        let r = obj2str('123.456')
        let rr = '"123.456"'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '""' when input ''`, function() {
        let r = obj2str('')
        let rr = '""'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[]' when input []`, function() {
        let r = obj2str([])
        let rr = '[]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{}' when input {}`, function() {
        let r = obj2str({})
        let rr = '{}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'null' when input null`, function() {
        let r = obj2str(null)
        let rr = 'null'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = obj2str(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = obj2str(NaN)
        let rr = 'null' //NaN為Number, 故JSON.stringify轉為null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should escape an application string that is exactly the marker`, function() {
        //應用字串與標記同形時須前置跳脫記號, 否則str2obj會把它還原成二進位
        let r = obj2str({ t: '[Uint8Array]::QmFz' })
        let rr = '{"t":"[BlazeForPreventEscape][Uint8Array]::QmFz"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should escape a string that looks like the Uint16Array marker even when ext is Uint8Array only`, function() {
        //跳脫不依ext分流, 否則以不同ext編碼/解碼時會不對稱
        let r = obj2str({ t: '[Uint16Array]::CwBPAAYA' })
        let rr = '{"t":"[BlazeForPreventEscape][Uint16Array]::CwBPAAYA"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should NOT escape a string that merely starts with the marker but has an invalid base64 tail`, function() {
        let r = obj2str({ t: '[Uint8Array]::not-base64!!' })
        let rr = '{"t":"[Uint8Array]::not-base64!!"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input { a: 1 } with returnWithStateAndMsg`, function() {
        //opt為第3參數, 因第2參數ext為既有參數
        let r = obj2str({ a: 1 }, 'Uint8Array', { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: '{"a":1}' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data: must not be undefined' } when input undefined with returnWithStateAndMsg`, function() {
        let r = obj2str(undefined, 'Uint8Array', { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data: must not be undefined' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data: must be serializable to JSON' } when input an object with BigInt with returnWithStateAndMsg`, function() {
        //原碼catch吞掉序列化錯誤而回'', 與「本就轉出空字串」無從分辨; 第559項④: msg為V19固定詞彙, 不含原生訊息(V20)
        let r = obj2str({ id: 1n }, 'Uint8Array', { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'invalid data: must be serializable to JSON' })
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = obj2str({ a: 1 }, 'Uint8Array', { returnWithStateAndMsg: 'yes' })
        let rr = '{"a":1}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should round-trip application strings that collide with the marker`, function() {
        let o2 = {
            t1: '[Uint8Array]::QmFz',
            t2: '[Uint16Array]::CwBPAAYA',
            t3: '[Uint8Array]::not-base64!!',
            t4: 'note: [Uint8Array]::QmFz',
            t5: '[BlazeForPreventEscape][Uint8Array]::QmFz',
            t6: '[BlazeForPreventEscape]',
            u8a: new Uint8Array([66, 97, 115]),
        }
        let r = str2obj(obj2str(o2, ['Uint8Array', 'Uint16Array']), ['Uint8Array', 'Uint16Array'])
        let rr = o2
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`obj2str 呼叫端拋出任意值(R-CODEC-ERR-01之2)`, function() {

    for (let c of thrownCases) {
        it(`should not throw but return { state: 'error', msg: 'invalid data: must be serializable to JSON' } (not the thrown text '${c.msg}') when toJSON throws ${c.name} with returnWithStateAndMsg [R-CODEC-ERR-01之2, 第559項④]`, function() {
            let data = { a: { toJSON: thrower(c.mk()) } }
            let r = null
            assert.doesNotThrow(() => {
                r = obj2str(data, 'Uint8Array', { returnWithStateAndMsg: true })
            })
            assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: 'invalid data: must be serializable to JSON' })
        })
    }

    for (let c of thrownCases) {
        it(`should not throw but return '' when toJSON throws ${c.name} without opt [R-CODEC-ERR-01之2]`, function() {
            let data = { a: { toJSON: thrower(c.mk()) } }
            let r = null
            assert.doesNotThrow(() => {
                r = obj2str(data)
            })
            assert.strict.deepStrictEqual(showDeep(r), '')
        })
    }

    //第559項④: 循環參照之原生訊息帶構造器名與屬性名, 改為固定訊息; 原生細節經opt.funLog之診斷出口(預設靜默)
    it(`should not leak the constructor name and the property name of a circular structure in msg, and hand the detail only to opt.funLog [第559項④]`, function() {
        let SECRET = function Sec3tCtor() {}
        let o = new SECRET()
        o.sec3tProp = o
        let r = obj2str(o, 'Uint8Array', { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'invalid data: must be serializable to JSON' })
        assert.strict.deepStrictEqual(JSON.stringify(r).includes('Sec3t'), false)
        let calls = []
        let r2 = obj2str(o, 'Uint8Array', { returnWithStateAndMsg: true, funLog: (label, safe, detail) => calls.push([label, safe, detail]) })
        assert.strict.deepStrictEqual(r2, r)
        assert.strict.deepStrictEqual(calls.length, 1)
        assert.strict.deepStrictEqual([calls[0][0], calls[0][1]], ['[wsemi obj2str] can not serialize', { errType: 'TypeError' }])
    })

})


describe(`obj2str Error轉換(R-CODEC-ERR-01之1a)`, function() {

    //值軸與obj2stru8arr之「Error轉換(R-CODEC-ERR-01之1)」共用: 真Error 7形轉'名稱: 訊息', 非Error 6形保留欄位
    for (let c of realErrorCases) {
        it(`should serialize ${c.name} as ${c.rr} [R-CODEC-ERR-01之1a]`, function() {
            //R-CODEC-ERR-01 規則1a: obj2str之replacer同規則1轉真Error為'名稱: 訊息'; 規則1: 其餘物件照一般物件序列化, 保留可列舉自有欄位
            let r = obj2str({ v: c.mk() })
            assert.strict.deepStrictEqual(r, `{"v":${c.rr}}`)
        })
    }

    it(`should convert real Errors at any depth while keeping sibling data objects intact [R-CODEC-ERR-01之1a]`, function() {
        //R-CODEC-ERR-01 規則1a: 同規則1, 任意深度之真Error皆轉字串, 其旁之一般資料物件保留欄位
        assert.strict.deepStrictEqual(obj2str(nestedErrorCase.mk()), nestedErrorCase.rr)
    })

    it(`should serialize a top-level Error as '"Error: boom"' [R-CODEC-ERR-01之1a]`, function() {
        //R-CODEC-ERR-01 規則1a: data本身為真Error亦轉'名稱: 訊息'
        assert.strict.deepStrictEqual(obj2str(new Error('boom')), '"Error: boom"')
    })

    it(`should restore { err: 'Error: boom', msg: 'x' } by str2obj(obj2str({ err: new Error('boom'), msg: 'x' })) [R-CODEC-ERR-01之1a]`, function() {
        //R-CODEC-ERR-01 規則1a: 經obj2str序列化之真Error, 解碼端得'名稱: 訊息'字串
        let r = str2obj(obj2str({ err: new Error('boom'), msg: 'x' }))
        assert.strict.deepStrictEqual(r, { err: 'Error: boom', msg: 'x' })
    })

    it(`should keep binary conversion of sibling Uint8Array and Uint16Array when data contains a real Error [R-CODEC-ERR-01之1a]`, function() {
        //R-CODEC-ERR-01 規則1a: 真Error轉字串; obj2str既有契約: Uint8Array與Uint16Array依ext轉為標記字串
        let r = obj2str({ err: new TypeError('t'), u8a: new Uint8Array([66, 97, 115]), u16a: new Uint16Array([11, 79, 6]) }, ['Uint8Array', 'Uint16Array'])
        let rr = '{"err":"TypeError: t","u8a":"[Uint8Array]::QmFz","u16a":"[Uint16Array]::CwBPAAYA"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should escape the string of a real Error whose toString equals the marker, so that str2obj restores it as that string [R-CODEC-ERR-01之1a]`, function() {
        //R-CODEC-ERR-01 規則1: 真Error呼叫其toString; obj2str既有契約: 應用字串與標記同形時前置跳脫記號, str2obj還原為原字串而非二進位
        class MarkerError extends Error {
            toString() {
                return '[Uint8Array]::QmFz'
            }
        }
        let r = str2obj(obj2str({ e: new MarkerError('x') }))
        assert.strict.deepStrictEqual(r, { e: '[Uint8Array]::QmFz' })
    })

    //toString恰為Object預設者或無可呼叫之toString者之真Error(值軸見tools/realErrorCases.mjs, 與obj2stru8arr共用)
    for (let c of errorProtoToStringCases) {
        it(`should succeed and serialize ${c.name} as ${c.rr} [R-CODEC-ERR-01之1a]`, function() {
            //R-CODEC-ERR-01 規則1a: obj2str之replacer同規則1; 規則1: toString恰為Object預設者或無可呼叫之toString者(如以null為原型)以Error.prototype.toString之語意得'名稱: 訊息', 序列化成功而非整筆失敗
            let r = obj2str({ v: c.mk() }, 'Uint8Array', { returnWithStateAndMsg: true })
            assert.strict.deepStrictEqual(showDeep(r), { state: 'success', msg: `{"v":${c.rr}}` })
        })
    }

    it(`should restore { err: 'Error: boom', msg: 'x' } by str2obj(obj2str(...)) when err is an Error without prototype [R-CODEC-ERR-01之1a]`, function() {
        //R-CODEC-ERR-01 規則1a、規則1: 以null為原型之真Error以Error.prototype.toString之語意得'名稱: 訊息', 解碼端得該字串
        let r = str2obj(obj2str({ err: Object.setPrototypeOf(new Error('boom'), null), msg: 'x' }))
        assert.strict.deepStrictEqual(r, { err: 'Error: boom', msg: 'x' })
    })

    it(`should not throw but return { state: 'error', msg: 'invalid data: must be serializable to JSON' } (not '${nameThrowsErrorCase.msg}') when reading name of an Error without prototype throws [R-CODEC-ERR-01之1a, 第559項④]`, function() {
        //R-CODEC-ERR-01 規則1: Error.prototype.toString讀name/message拋錯時依codec之catch回報; 規則2: catch不外拋; 第559項④: msg為固定詞彙, 不含呼叫端所拋出之文字
        let r = null
        assert.doesNotThrow(() => {
            r = obj2str({ v: nameThrowsErrorCase.mk() }, 'Uint8Array', { returnWithStateAndMsg: true })
        })
        assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: 'invalid data: must be serializable to JSON' })
    })

})
