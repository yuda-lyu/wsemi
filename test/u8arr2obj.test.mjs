import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import u8arr2obj from '../src/u8arr2obj.mjs'
import obj2u8arr from '../src/obj2u8arr.mjs'
import errToStr from '../src/_errToStr.mjs'
import isbol from '../src/isbol.mjs'
import isu8arr from '../src/isu8arr.mjs'
import getBufferSize from '../src/getBufferSize.mjs'
import bufReadDbl from '../src/bufReadDbl.mjs'
import u8arr2str from '../src/u8arr2str.mjs'
import stru8arr2obj from '../src/stru8arr2obj.mjs'
import { showDeep } from './tools/caseKit.mjs'
import { runChildCase } from './tools/runChildCase.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`u8arr2obj`, function() {
    let u8a = new Uint8Array([
        64, 24, 0, 0, 0, 0, 0, 0, 91, 54, 54, 44,
        51, 93, 123, 34, 97, 34, 58, 91, 49, 50, 51, 44,
        52, 53, 46, 54, 55, 44, 34, 116, 101, 115, 116, 228,
        184, 173, 230, 150, 135, 34, 93, 44, 34, 98, 34, 58,
        123, 34, 99, 34, 58, 34, 91, 66, 108, 97, 122, 101,
        70, 111, 114, 85, 105, 110, 116, 56, 65, 114, 114, 97,
        121, 93, 58, 58, 48, 34, 125, 125, 66, 97, 115
    ])
    let cu8a = `new Uint8Array([ 64, 24, 0, 0, 0, 0, 0, 0, 91, 54, 54, 44, 51, 93, 123, 34, 97, 34, 58, 91, 49, 50, 51, 44, 52, 53, 46, 54, 55, 44, 34, 116, 101, 115, 116, 228, 184, 173, 230, 150, 135, 34, 93, 44, 34, 98, 34, 58, 123, 34, 99, 34, 58, 34, 91, 66, 108, 97, 122, 101, 70, 111, 114, 85, 105, 110, 116, 56, 65, 114, 114, 97, 121, 93, 58, 58, 48, 34, 125, 125, 66, 97, 115 ])`
    let data = {
        a: [123, 45.67, 'test中文'],
        b: {
            c: new Uint8Array([66, 97, 115]),
        },
    }
    let cdata = `{ a: [123, 45.67, 'test中文'], b: { c: new Uint8Array([66, 97, 115]) } }`

    it(`should return ${cdata} when input ${cu8a}`, function() {
        let r = u8arr2obj(u8a)
        let rr = data
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input ''`, function() {
        let r = u8arr2obj('')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input []`, function() {
        let r = u8arr2obj([])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = u8arr2obj({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input null`, function() {
        let r = u8arr2obj(null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input undefined`, function() {
        let r = u8arr2obj(undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input NaN`, function() {
        let r = u8arr2obj(NaN)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input a corrupted packet`, function() {
        //封包損毀(分塊資訊區無法解析), 由外層catch攔下
        let r = u8arr2obj(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]))
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input a truncated packet`, function() {
        let r = u8arr2obj(u8a.slice(0, 10))
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should round-trip application strings that merely contain the marker text`, function() {
        //端到端: 應用資料含標記文字者, 編碼再解碼須原樣一致
        let o = {
            t1: 'note: [BlazeForUint8Array]::0 xxx',
            t2: 'see [BlazeForUint8Array]::0',
            t3: '[BlazeForUint8Array]::0a',
            arr: ['a', 'x [BlazeForUint8Array]::0 y', 'c'],
            bin: new Uint8Array([65, 66]),
        }
        let r = u8arr2obj(obj2u8arr(o))
        let rr = o
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should round-trip application strings that are exactly the marker (encoder escaping)`, function() {
        //端到端: 應用字串與標記同形者, 經編碼端跳脫後須原樣解回, 不得被換成旁邊的binary
        let o = {
            t1: '[BlazeForUint8Array]::0',
            t2: '[BlazeForUint8Array]::1',
            t3: '[BlazeForArrayBuffer]::0',
            t4: '[BlazeForPreventEscape][BlazeForUint8Array]::0',
            t5: '[BlazeForPreventEscape]',
            a: new Uint8Array([7]),
            b: new Uint8Array([8]),
        }
        let r = u8arr2obj(obj2u8arr(o))
        let rr = o
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should round-trip an array containing a string that is exactly the marker`, function() {
        let o = ['[BlazeForUint8Array]::0', new Uint8Array([5]), 'z']
        let r = u8arr2obj(obj2u8arr(o))
        let rr = o
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should round-trip an application string containing the marker text when there is no binary at all`, function() {
        let o = { t: 'note: [BlazeForUint8Array]::0 xxx' }
        let r = u8arr2obj(obj2u8arr(o))
        let rr = o
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should round-trip single-element arrays whose only element is an empty value`, function() {
        //同一筆資料不得因陣列長度不同而可編/不可編
        for (let o of [[''], [null], [0], [false], ['', 'a'], [null, 1]]) {
            let r = u8arr2obj(obj2u8arr(o))
            assert.strict.deepStrictEqual(r, o, `${JSON.stringify(o)} 應原樣往返`)
        }
    })

    it(`should round-trip Uint16Array with its original type and values (element > 255 must not be truncated)`, function() {
        //原以new Uint8Array(u16a)逐元素打包, 300會被截為44且尾端補零; 改為逐位元組打包後由標記型別還原
        let o = { v: new Uint16Array([2, 300, 65535]) }
        let r = u8arr2obj(obj2u8arr(o))
        let rr = o
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should round-trip ArrayBuffer with its original type`, function() {
        let o = { v: new Uint8Array([9, 8, 7]).buffer }
        let r = u8arr2obj(obj2u8arr(o))
        let rr = o
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should round-trip a mix of Uint8Array, Uint16Array and ArrayBuffer`, function() {
        let o = {
            a: new Uint8Array([1, 2]),
            b: new Uint16Array([300, 400]),
            c: new Uint8Array([5]).buffer,
            d: 'x',
        }
        let r = u8arr2obj(obj2u8arr(o))
        let rr = o
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should round-trip zero-length Uint16Array and ArrayBuffer`, function() {
        let o = { a: new Uint16Array(0), b: new ArrayBuffer(0), c: new Uint8Array(0) }
        let r = u8arr2obj(obj2u8arr(o))
        let rr = o
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should round-trip a zero-length binary (block length must be 0, not null)`, function() {
        let o = { a: new Uint8Array(0), b: new Uint8Array([9]) }
        let r = u8arr2obj(obj2u8arr(o))
        let rr = o
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, 2, 3] when input a packet encoded from an array`, function() {
        //陣列亦為obj2u8arr之支援輸入, 須能原樣round-trip
        let r = u8arr2obj(obj2u8arr([1, 2, 3]))
        let rr = [1, 2, 3]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ['a', Uint8Array [ 66 ], { b: 1 }] when input a packet encoded from an array with binary`, function() {
        let o = ['a', new Uint8Array([66]), { b: 1 }]
        let r = u8arr2obj(obj2u8arr(o))
        let rr = o
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: ${cdata} } when input ${cu8a} with returnWithStateAndMsg`, function() {
        let r = u8arr2obj(u8a, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: data }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid u8a' } when input NaN with returnWithStateAndMsg`, function() {
        let r = u8arr2obj(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid u8a' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not throw but return { state: 'error', msg: <TypeError> } when input a detached Uint8Array`, function() {
        //解碼本體之非預期錯誤須被攔截, 不得外拋至呼叫端
        let bad = new Uint8Array([1, 2, 3])
        structuredClone(bad.buffer, { transfer: [bad.buffer] }) //使buffer分離
        let r = u8arr2obj(bad, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('TypeError') === 0, true, `msg 應為型別錯誤, got ${r.msg}`)
    })

    it(`should return { state: 'error', msg: <SyntaxError> } when input a packet whose header block is not valid JSON with returnWithStateAndMsg`, function() {
        //標頭長度為合法之3, 其後3位元組'abc'不是合法JSON(分塊資訊須為JSON陣列)
        let bad = new Uint8Array([0x40, 0x08, 0, 0, 0, 0, 0, 0, 97, 98, 99])
        let r = u8arr2obj(bad, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(Object.keys(r).sort(), ['msg', 'state'])
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('SyntaxError') === 0, true, `msg 應為解析錯誤, got ${r.msg}`)
    })

    it(`should return { state: 'error', msg: 'invalid pks, head length …' } when the head length is not a non-negative integer with returnWithStateAndMsg (R-OBJ-ITER-01 規則6)`, function() {
        //標頭前8位元組以大端double讀取: [1..8]為極小非整數, 修前由JSON.parse失敗(SyntaxError)擋下, 現於分割前即拒收
        let r = u8arr2obj(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]), { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'invalid pks, head length must be a non-negative integer not exceeding the packet' })
    })

    it(`should return { state: 'error', msg: 'stru8arr2obj: <SyntaxError>' } when the inner stru8arr2obj fails with returnWithStateAndMsg`, function() {
        //內部呼叫之錯誤須前置來源函數名, 供辨識是哪一步出錯
        let bad = obj2u8arr({ a: 1 })
        bad[bad.length - 1] = 123 //破壞results尾端使其非合法JSON, 但分塊結構仍完好
        let r = u8arr2obj(bad, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('stru8arr2obj: ') === 0, true, `msg 應標明來源函數, got ${r.msg}`)
    })

    it(`should return ${cdata} when input ${cu8a} with invalid returnWithStateAndMsg`, function() {
        let r = u8arr2obj(u8a, { returnWithStateAndMsg: 'yes' })
        let rr = data
        assert.strict.deepStrictEqual(r, rr)
    })

})

describe(`u8arr2obj 非Error拋出值(R-CODEC-ERR-01之2)`, function() {

    //偽造標籤為Uint8Array之Proxy, 讀slice、subarray、buffer時拋出null: try內讀呼叫端之資料可拋出任意值, catch不可再拋(修前catch內err.toString()對null拋TypeError而外拋)
    let mk = () => {
        return new Proxy(new Uint8Array(16), {
            get(t, k) {
                if (k === Symbol.toStringTag) {
                    return 'Uint8Array'
                }
                if (k === 'slice' || k === 'subarray' || k === 'buffer') {
                    throw null // eslint-disable-line no-throw-literal
                }
                let v = Reflect.get(t, k)
                return typeof v === 'function' ? v.bind(t) : v
            },
        })
    }

    it(`讀取呼叫端之資料拋出null時, returnWithStateAndMsg回傳{ state: 'error', msg: 'null' }而不外拋 [R-CODEC-ERR-01之2]`, function() {
        let r = null
        let threw = null
        try {
            r = u8arr2obj(mk(), { returnWithStateAndMsg: true })
        }
        catch (err) {
            threw = String(err && err.message)
        }
        assert.strict.deepStrictEqual(showDeep({ r, threw }), { r: { state: 'error', msg: 'null' }, threw: null })
    })

    it(`讀取呼叫端之資料拋出null時, 預設模式回傳失敗之預設值而不外拋 [R-CODEC-ERR-01之2]`, function() {
        let r = null
        let threw = null
        try {
            r = u8arr2obj(mk())
        }
        catch (err) {
            threw = String(err && err.message)
        }
        assert.strict.deepStrictEqual(showDeep({ r, threw }), { r: {}, threw: null })
    })

})

describe(`u8arr2obj 標頭長度lenHead須為非負整數且不逾封包(R-OBJ-ITER-01 規則6)`, function() {

    //標頭前8位元組為大端double: 分塊資訊區之位元組數; 來自封包(不可信), 小數與負數經slice被靜默截斷或自尾端算而得同一分割(非正規編碼), 須拒收
    let INV = 'invalid pks, head length must be a non-negative integer not exceeding the packet'
    let packet = obj2u8arr({ a: 1, b: new Uint8Array([7, 8, 9]) })
    let good = new DataView(packet.buffer, packet.byteOffset, 8).getFloat64(0, false)
    let others = packet.length - 8
    let withHead = (v) => {
        let q = packet.slice()
        new DataView(q.buffer, q.byteOffset, 8).setFloat64(0, v, false)
        return q
    }

    it(`should decode the canonical packet (precondition: the head length is a positive integer inside the packet)`, function() {
        assert.ok(Number.isInteger(good) && good > 0 && good < others, `good=${good} others=${others}`)
        let r = u8arr2obj(packet, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'success')
        assert.strict.deepStrictEqual(r.msg.a, 1)
        assert.strict.deepStrictEqual([...r.msg.b], [7, 8, 9])
    })

    let rejects = [
        ['a fraction (head length + 0.5)', good + 0.5],
        ['a fraction (head length + 0.99)', good + 0.99],
        ['a negative number counted from the end that would give the same split', -(others - good)],
        ['-1', -1],
        ['NaN', NaN],
        ['Infinity', Infinity],
        ['-Infinity', -Infinity],
        ['a number above the packet size (size + 1)', others + 1],
        ['2^53', 2 ** 53],
        ['1e308', 1e308],
    ]
    for (let [name, v] of rejects) {
        it(`should reject ${name} before splitting the packet: strict mode gives { state: 'error', msg: INV }, loose mode gives {}`, function() {
            assert.strict.deepStrictEqual(u8arr2obj(withHead(v), { returnWithStateAndMsg: true }), { state: 'error', msg: INV })
            assert.strict.deepStrictEqual(u8arr2obj(withHead(v)), {})
        })
    }

    //整數且不逾封包者通過標頭檢查, 後續由JSON解析或分塊資訊檢查失敗(不是INV)
    let passesHeadCheck = [
        ['0', 0],
        ['-0', -0],
        ['head length - 1', good - 1],
        ['head length + 1', good + 1],
        ['the packet size (all is header)', others],
    ]
    for (let [name, v] of passesHeadCheck) {
        it(`should pass the head length check for ${name} and fail later as a corrupted packet, not by the head length rule`, function() {
            let r = u8arr2obj(withHead(v), { returnWithStateAndMsg: true })
            assert.strict.deepStrictEqual(r.state, 'error')
            assert.ok(r.msg !== INV, `msg=${r.msg}`)
        })
    }

    for (let n of [0, 1, 3, 7]) {
        it(`should reject a packet shorter than the 8-byte head (${n} bytes) by the head length rule`, function() {
            let r = u8arr2obj(new Uint8Array(n).fill(1), { returnWithStateAndMsg: true })
            assert.strict.deepStrictEqual(r, { state: 'error', msg: INV })
        })
    }

    it(`should reject an invalid head length before slicing the head block (only the head and the rest are sliced)`, function() {
        //來自封包之長度須先驗證才可用於切分; 以計次之Uint8Array子類別確認拒收時只切了標頭8位元組與其餘兩次
        let n = 0
        class CountU8 extends Uint8Array {
            slice(...a) {
                n++
                return new CountU8(super.slice(...a))
            }
        }
        let u = new CountU8(withHead(good + 0.5))
        n = 0
        assert.strict.deepStrictEqual(u8arr2obj(u, { returnWithStateAndMsg: true }), { state: 'error', msg: INV })
        assert.strict.strictEqual(n, 2)
        n = 0
        let ok = u8arr2obj(new CountU8(packet), { returnWithStateAndMsg: true })
        assert.strict.strictEqual(ok.state, 'success')
        assert.ok(n >= 4, `n=${n}`)
    })

    it(`should decode the same packet when the head length is an exact integer written in the other valid ways (handmade packet with head length 3)`, function() {
        let enc = new TextEncoder()
        let body = enc.encode('[7]{"a":1}')
        let q = new Uint8Array(8 + body.length)
        q.set(body, 8)
        new DataView(q.buffer, 0, 8).setFloat64(0, 3, false)
        assert.strict.deepStrictEqual(u8arr2obj(q, { returnWithStateAndMsg: true }), { state: 'success', msg: { a: 1 } })
        new DataView(q.buffer, 0, 8).setFloat64(0, 3.9, false)
        assert.strict.deepStrictEqual(u8arr2obj(q, { returnWithStateAndMsg: true }), { state: 'error', msg: INV })
        new DataView(q.buffer, 0, 8).setFloat64(0, -7, false)
        assert.strict.deepStrictEqual(u8arr2obj(q, { returnWithStateAndMsg: true }), { state: 'error', msg: INV })
    })

})

describe(`u8arr2obj 使用端物件之迭代(R-OBJ-ITER-01)`, function() {

    //封包來自網路/檔案, 標頭內之分塊資訊不可信(規則6): 須為真陣列、各項為非負有限整數、總量不逾封包資料區, 否則失敗回報, 不依其內容迭代或配置記憶體
    //行程內案例的分塊資訊只用小值(N<=1000); 極大值一律走限額子行程(tools/u8arrLenRunner.mjs)

    let enc = new TextEncoder()
    let R = '{"a":1}' //合法主區塊(7位元組), 解出{ a: 1 }
    let NOTARR = 'invalid pks, not an array'
    let BADITEM = 'invalid pks, every item must be a non-negative finite integer'
    let TOTAL = 'invalid pks, total length exceeds the packet'
    let MANY = 'invalid pks, too many chunks for the main block'
    let MAX = Number.MAX_SAFE_INTEGER

    //偽造封包建構器(獨立於src內之編碼函數): [8 bytes大端double=標頭長度][標頭JSON文字(UTF-8)][資料區bytes]
    let buildPacket = (headerText, data = R) => {
        let hb = enc.encode(headerText)
        let db = typeof data === 'string' ? enc.encode(data) : data
        let r = new Uint8Array(8 + hb.length + db.length)
        new DataView(r.buffer).setFloat64(0, hb.length, false)
        r.set(hb, 8)
        r.set(db, 8 + hb.length)
        return r
    }

    let concat = (a, b) => {
        let r = new Uint8Array(a.length + b.length)
        r.set(a, 0)
        r.set(b, a.length)
        return r
    }

    //修前之演算法(原樣複製): sliceU8arr以lodash each迭代且不驗證分塊資訊, 供差分
    let legacySliceU8arr = (u8a, inds) => {
        let i = 0
        let j = 0
        let r = []
        each(inds, (ind) => {
            j = i + ind
            let t = u8a.slice(i, j)
            i = j
            r.push(t)
        })
        return r
    }
    let legacyU8arr2obj = (u8a, opt = {}) => {
        let data = {}
        let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
        if (!isbol(returnWithStateAndMsg)) {
            returnWithStateAndMsg = false
        }
        let retError = (msg) => {
            if (returnWithStateAndMsg) {
                return {
                    state: 'error',
                    msg,
                }
            }
            else {
                return {}
            }
        }
        if (!isu8arr(u8a)) {
            return retError('invalid u8a')
        }
        try {
            let ibHead = 8
            let bHead = u8a.slice(0, ibHead)
            let bOthers = u8a.slice(ibHead, getBufferSize(u8a))
            let lenHead = bufReadDbl(bHead)
            let bvPks = bOthers.slice(0, lenHead)
            let bbPks = bOthers.slice(lenHead, getBufferSize(bOthers))
            let rcvPks = u8arr2str(bvPks, { returnWithStateAndMsg: true })
            if (rcvPks.state === 'error') {
                return retError(`u8arr2str: ${rcvPks.msg}`)
            }
            let cvPks = rcvPks.msg
            let vPks = JSON.parse(cvPks)
            let bPks = legacySliceU8arr(bbPks, vPks)
            let bMain = bPks.shift()
            let rresults = u8arr2str(bMain, { returnWithStateAndMsg: true })
            if (rresults.state === 'error') {
                return retError(`u8arr2str: ${rresults.msg}`)
            }
            let results = rresults.msg
            let binarys = bPks
            let r = stru8arr2obj({ results, binarys }, { returnWithStateAndMsg: true })
            if (r.state === 'error') {
                return retError(`stru8arr2obj: ${r.msg}`)
            }
            data = r.msg
        }
        catch (err) {
            return retError(errToStr(err))
        }
        if (returnWithStateAndMsg) {
            return {
                state: 'success',
                msg: data,
            }
        }
        else {
            return data
        }
    }

    //計Uint8Array.prototype.slice的呼叫次數(於Uint8Array.prototype設自有屬性, 結束刪除還原)
    let countSlice = (fn) => {
        let n = 0
        let orig = Uint8Array.prototype.slice
        Uint8Array.prototype.slice = function(...args) { // eslint-disable-line no-extend-native
            n++
            return orig.apply(this, args)
        }
        try {
            let r = fn()
            return { n, r }
        }
        finally {
            delete Uint8Array.prototype.slice
        }
    }

    //預設模式與returnWithStateAndMsg模式皆須與修前演算法相同
    let sameAsLegacy = (pkt, label) => {
        for (let m of [false, true]) {
            assert.strict.deepStrictEqual(u8arr2obj(pkt, { returnWithStateAndMsg: m }), legacyU8arr2obj(pkt, { returnWithStateAndMsg: m }), label)
        }
    }

    //預設模式回{}, returnWithStateAndMsg模式回{ state: 'error', msg }
    let failsWith = (pkt, msg, label) => {
        assert.strict.deepStrictEqual(u8arr2obj(pkt), {}, `${label} 預設模式`)
        assert.strict.deepStrictEqual(u8arr2obj(pkt, { returnWithStateAndMsg: true }), { state: 'error', msg }, `${label} returnWithStateAndMsg模式`)
    }

    //種子固定之亂數(mulberry32)
    let mkRnd = (a) => {
        return () => {
            a |= 0
            a = (a + 0x6D2B79F5) | 0
            let t = Math.imul(a ^ (a >>> 15), 1 | a)
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296
        }
    }

    describe(`建構器與修前演算法複本之自證(行為鎖定)`, function() {

        it(`should build the same bytes as obj2u8arr for { a: 1 } and decode it`, function() {
            //偽造封包建構器與編碼端逐位元組相同, 才能代表「合法封包只差標頭」
            assert.strict.deepStrictEqual(buildPacket('[7]'), obj2u8arr({ a: 1 }))
            assert.strict.deepStrictEqual(u8arr2obj(buildPacket('[7]')), { a: 1 })
            assert.strict.deepStrictEqual(u8arr2obj(buildPacket('[7]'), { returnWithStateAndMsg: true }), { state: 'success', msg: { a: 1 } })
        })

        it(`should make the legacy copy decode the same as the library on legit packets`, function() {
            let o = { a: [1, 'x', new Uint8Array([1, 2])], b: { c: new Uint8Array(0), d: new Uint16Array([300]) }, e: new Uint8Array([9]).buffer }
            assert.strict.deepStrictEqual(legacyU8arr2obj(obj2u8arr(o)), o)
            assert.strict.deepStrictEqual(u8arr2obj(obj2u8arr(o)), o)
        })

    })

    describe(`偽造分塊資訊: 失敗回報(預設{}, returnWithStateAndMsg為error與原因)`, function() {

        //[名稱, 標頭JSON文字, 資料區, 期望msg]; 資料區多為合法主區塊, 修前被接受者(標頭之項被slice靜默換算)結果為{ a: 1 }
        let cases = [
            //非真陣列: 帶length鍵之物件、其他物件、字串、數字、null、布林
            ['物件length為0', '{"length":0}', R, NOTARR],
            ['物件length為1', '{"length":1}', R, NOTARR],
            ['物件length為2', '{"length":2}', R, NOTARR],
            ['物件length為50', '{"length":50}', R, NOTARR],
            ['物件length為-0', '{"length":-0}', R, NOTARR],
            ['物件length為小數', '{"length":1.5}', R, NOTARR],
            ['物件length與數字鍵並存', '{"length":1,"0":7}', R, NOTARR],
            ['物件只有數字鍵(修前以值迭代而接受)', '{"0":7}', R, NOTARR],
            ['物件有一般鍵(修前以值迭代而接受)', '{"a":7}', R, NOTARR],
            ['空物件', '{}', R, NOTARR],
            ['字串x', '"x"', R, NOTARR],
            ['字串7(修前以字元迭代而接受)', '"7"', R, NOTARR],
            ['數字5', '5', R, NOTARR],
            ['數字7', '7', R, NOTARR],
            ['null', 'null', R, NOTARR],
            ['true', 'true', R, NOTARR],
            ['false', 'false', R, NOTARR],
            //項非非負有限整數
            ['小數7.5(修前slice截為7而接受)', '[7.5]', R, BADITEM],
            ['小數1.5', '[1.5]', R, BADITEM],
            ['負數-1(修前slice(0,-1)而接受)', '[-1]', R + 'X', BADITEM],
            ['負小數-0.5', '[-0.5]', R, BADITEM],
            ['1e999經JSON.parse為Infinity(修前slice(0,Infinity)而接受)', '[1e999]', R, BADITEM],
            ['-1e999為-Infinity', '[-1e999]', R, BADITEM],
            ['數字字串"7"(修前字串相加而接受)', '["7"]', R, BADITEM],
            ['null項', '[null]', R, BADITEM],
            ['true項', '[true]', R, BADITEM],
            ['巢狀陣列項', '[[7]]', R, BADITEM],
            ['物件項', '[{"length":7}]', R, BADITEM],
            ['第2項為負(修前接受)', '[7,-1]', R, BADITEM],
            ['第2項為小數(修前接受)', '[7,1.5]', R, BADITEM],
            ['項不合法且總量亦逾: 以項不合法為先', '[999,-1]', R, BADITEM],
            ['項不合法在前且總量亦逾', '[-1,999]', R, BADITEM],
            //總量逾封包資料區
            ['單項比資料區多1', '[8]', R, TOTAL],
            ['單項逾資料區(修前slice夾住而接受)', '[999]', R, TOTAL],
            ['累計逾資料區(修前接受)', '[7,1]', R, TOTAL],
            ['每項皆不逾但累計逾', '[4,4]', R, TOTAL],
            ['前項合法後項逾(修前接受)', '[7,4]', R, TOTAL],
            ['零長度分塊後仍逾', '[0,0,0,8]', R, TOTAL],
            ['MAX_SAFE_INTEGER單項(修前接受)', `[${MAX}]`, R, TOTAL],
            ['2^53單項', '[9007199254740992]', R, TOTAL],
            ['1e300單項', '[1e300]', R, TOTAL],
            ['兩個MAX_SAFE_INTEGER', `[${MAX},${MAX}]`, R, TOTAL],
            ['合法項後接兩個MAX_SAFE_INTEGER', `[7,${MAX},${MAX}]`, R, TOTAL],
            ['資料區為空而標頭要1位元組', '[1]', '', TOTAL],
        ]

        for (let [name, header, data, msg] of cases) {
            it(`should fail with "${msg}" when pks is ${name}: ${header}`, function() {
                failsWith(buildPacket(header, data), msg, header)
            })
        }

        it(`should keep failing with the unchanged error of the empty pks []`, function() {
            //[]為真陣列且各項(無)合法、總量0不逾, 通過驗證; 無主區塊故由後續步驟回報(現狀, 行為鎖定)
            failsWith(buildPacket('[]'), 'u8arr2str: invalid u8a', '[]')
            sameAsLegacy(buildPacket('[]'), '[]')
        })

    })

    describe(`偽造分塊資訊{"length":N}: 不依N次迭代、不配置分塊(以Uint8Array.prototype.slice呼叫次數驗)`, function() {

        it(`should call slice exactly as many times as the empty pks [] does (packet head only) for any length N`, function() {
            //基準: 標頭為[]時只剩封包本身切頭尾之呼叫; 修前{"length":N}為基準加N(N=2得6次、N=50得54次)
            let base = countSlice(() => u8arr2obj(buildPacket('[]'))).n
            assert.ok(base >= 1 && base < 10, `base=${base}`)
            for (let N of [0, 1, 2, 50, 1000]) {
                let c = countSlice(() => u8arr2obj(buildPacket(`{"length":${N}}`)))
                assert.strict.deepStrictEqual(c.r, {}, `N=${N}`)
                assert.strict.strictEqual(c.n, base, `N=${N}: slice calls`)
            }
            assert.strict.strictEqual(Object.prototype.hasOwnProperty.call(Uint8Array.prototype, 'slice'), false, 'slice wrapper restored')
        })

        it(`should call slice only once more per chunk for a legit pks, so the count follows the real chunk number`, function() {
            //合法標頭: 呼叫次數 = 基準 + 分塊數, 證明計數法可辨識「依內容迭代」
            let base = countSlice(() => u8arr2obj(buildPacket('[]'))).n
            let data = { a: new Uint8Array([1]), b: new Uint8Array([2]) } //主區塊+2個二進位分塊=3個分塊
            let c = countSlice(() => u8arr2obj(obj2u8arr(data)))
            assert.strict.deepStrictEqual(c.r, data)
            assert.strict.strictEqual(c.n, base + 3)
        })

        it(`should return state error with "not an array" for every N, never an object of N empty chunks`, function() {
            for (let N of [0, 1, 2, 50, 1000]) {
                failsWith(buildPacket(`{"length":${N}}`), NOTARR, `N=${N}`)
            }
        })

    })

    describe(`修前靜默接受之標頭(legacy對照): 證明上列失敗案例為行為變更而非原本就失敗`, function() {

        let accepted = [
            ['[7.5]', R],
            ['[-1]', R + 'X'],
            ['[1e999]', R],
            ['["7"]', R],
            ['[999]', R],
            ['[7,4]', R],
            ['[7,-1]', R],
            ['[7,1.5]', R],
            [`[${MAX}]`, R],
            ['[1e300]', R],
            ['{"0":7}', R],
            ['{"a":7}', R],
            ['"7"', R],
        ]
        for (let [header, data] of accepted) {
            it(`should show the legacy decoding of ${header} yields { a: 1 }`, function() {
                assert.strict.deepStrictEqual(legacyU8arr2obj(buildPacket(header, data)), { a: 1 })
            })
        }

    })

    describe(`合法標頭之邊界: 與修前演算法相同(行為鎖定)`, function() {

        //[標頭, 資料區, 期望解出{ a: 1 }與否]; 皆為真陣列、各項非負有限整數、總量不逾資料區
        let legit = [
            ['[7]', R, true],
            ['[7.0]', R, true],
            ['[7e0]', R, true],
            ['[ 7 ]', R, true],
            ['[7]', R + 'XYZ', true], //資料區尾端多餘位元組
            ['[3]', R, false],
            ['[0]', R, false],
            ['[-0]', R, false],
            ['[]', R, false],
        ]
        for (let [header, data, ok] of legit) {
            it(`should equal the legacy result when pks is ${header} and the data area is ${JSON.stringify(data)}`, function() {
                let pkt = buildPacket(header, data)
                sameAsLegacy(pkt, header)
                if (ok) {
                    assert.strict.deepStrictEqual(u8arr2obj(pkt), { a: 1 })
                }
                else {
                    assert.strict.deepStrictEqual(u8arr2obj(pkt), {})
                }
            })
        }

        //外審補修(分塊數量須與主區塊可容納之標記數相符): 修前被接受或以他種原因失敗之手工標頭, 現一律因分塊數量逾主區塊所能容納而失敗(obj2u8arr產出之封包每個分塊在主區塊內皆有至少25位元組之標記)
        let tightened = [
            ['[7,0]', R],
            ['[7,0,0]', R],
            ['[7,3]', R + 'XYZ'],
            ['[0,7]', R],
            ['[-0,7]', R],
        ]
        for (let [header, data] of tightened) {
            it(`should fail with too many chunks when pks is ${header} (chunks without a marker in the main block)`, function() {
                failsWith(buildPacket(header, data), MANY, header)
            })
        }

        it(`should restore a binary chunk placed by pks [len(main), len(bin)] with the exact fit`, function() {
            //總量恰等於資料區(不可誤用>=): 主區塊+二進位塊
            let main = '{"k":"[BlazeForUint8Array]::0"}'
            let pkt = buildPacket(`[${main.length},3]`, concat(enc.encode(main), new Uint8Array([4, 5, 6])))
            assert.strict.deepStrictEqual(u8arr2obj(pkt), { k: new Uint8Array([4, 5, 6]) })
            sameAsLegacy(pkt, 'exact fit')
        })

    })

    describe(`obj2u8arr往返與修前演算法: 300棵隨機樹(含空Uint8Array、零長度分塊、多個二進位塊、巢狀)`, function() {

        let rnd = mkRnd(20261017)
        let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
        let bytes = (n) => Uint8Array.from({ length: n }, () => Math.floor(rnd() * 256))
        let leaves = [
            () => 'plain', () => '', () => '中文', () => '[BlazeForUint8Array]::0', () => '[BlazeForPreventEscape]',
            () => 1, () => 0, () => -5, () => 1.5, () => true, () => false, () => null,
            () => bytes(Math.floor(rnd() * 6)),
            () => bytes(0),
            () => bytes(0),
            () => new Uint16Array(Array.from({ length: Math.floor(rnd() * 4) }, () => Math.floor(rnd() * 65536))),
            () => bytes(Math.floor(rnd() * 5)).buffer,
        ]
        let keyNames = ['a', 'b', 'c', '0', '1', 'x y', '中文', 'length']
        let gen = (depth) => {
            let t = rnd()
            if (depth <= 0 || t < 0.4) {
                return pick(leaves)()
            }
            if (t < 0.7) {
                return Array.from({ length: Math.floor(rnd() * 4) }, () => gen(depth - 1))
            }
            let o = {}
            let n = Math.floor(rnd() * 4)
            for (let i = 0; i < n; i++) {
                o[pick(keyNames)] = gen(depth - 1)
            }
            return o
        }
        let genTop = () => {
            let n = 1 + Math.floor(rnd() * 4)
            if (rnd() < 0.5) {
                return Array.from({ length: n }, () => gen(3))
            }
            let o = {}
            for (let i = 0; i < n; i++) {
                o[pick(keyNames)] = gen(3)
            }
            return o
        }
        let trees = Array.from({ length: 300 }, () => genTop())

        it(`should restore every tree to itself`, function() {
            let bad = []
            for (let i = 0; i < trees.length; i++) {
                let pkt = obj2u8arr(trees[i])
                try {
                    assert.ok(pkt.length > 8, 'packet encoded')
                    assert.strict.deepStrictEqual(u8arr2obj(pkt), trees[i])
                    assert.strict.deepStrictEqual(u8arr2obj(pkt, { returnWithStateAndMsg: true }), { state: 'success', msg: trees[i] })
                }
                catch (err) {
                    bad.push(i)
                }
            }
            assert.strict.deepStrictEqual(bad, [])
        })

        it(`should equal the legacy algorithm on every tree (both modes)`, function() {
            let bad = []
            for (let i = 0; i < trees.length; i++) {
                try {
                    sameAsLegacy(obj2u8arr(trees[i]), `tree ${i}`)
                }
                catch (err) {
                    bad.push(i)
                }
            }
            assert.strict.deepStrictEqual(bad, [])
        })

        it(`should cover empty binaries, multiple binaries and zero-length chunks in the sample`, function() {
            //樣本非空洞: 數出含零長度分塊(標頭含0)與多個二進位塊(標頭項數>=3)之封包數
            let zero = 0
            let multi = 0
            for (let t of trees) {
                let pkt = obj2u8arr(t)
                let lenHead = new DataView(pkt.buffer, pkt.byteOffset, 8).getFloat64(0, false)
                let pks = JSON.parse(new TextDecoder().decode(pkt.slice(8, 8 + lenHead)))
                if (pks.slice(1).includes(0)) {
                    zero++
                }
                if (pks.length >= 3) {
                    multi++
                }
            }
            assert.ok(zero >= 20, `zero=${zero}`)
            assert.ok(multi >= 40, `multi=${multi}`)
        })

    })

    describe(`隨機標頭與資料區: 合法者與修前演算法相同, 不合法者回報原因`, function() {

        it(`should classify 800 random headers: legit equals the legacy result, a bad item or an over-long total is reported`, function() {
            let rnd = mkRnd(20261018)
            let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
            let mains = ['{"a":1}', '[1,2]', '{"k":"[BlazeForUint8Array]::0"}', '"s"']
            let cnt = { legitOk: 0, legitFail: 0, badItem: 0, total: 0, many: 0 }
            let bad = []
            for (let i = 0; i < 800; i++) {
                let M = enc.encode(pick(mains))
                let nb = Math.floor(rnd() * 7)
                let B = Uint8Array.from({ length: nb }, () => Math.floor(rnd() * 256))
                let data = concat(M, B)
                let items = [rnd() < 0.7 ? M.length : Math.floor(rnd() * 9)]
                let n = Math.floor(rnd() * 4)
                for (let k = 0; k < n; k++) {
                    items.push(pick([0, 1, 2, 3, nb, 100]))
                }
                for (let k = 0; k < items.length; k++) {
                    if (rnd() < 0.12) {
                        items[k] = pick([-1, 1.5, '2', null, true])
                    }
                }
                let pkt = buildPacket(JSON.stringify(items), data)

                //獨立期望: 項非「數字且有限且為整數且>=0」→項不合法; 否則累計>資料區長度→總量逾; 否則與修前相同
                let badItem = items.some((v) => !(typeof v === 'number' && Number.isFinite(v) && Math.floor(v) === v && v >= 0))
                let sum = badItem ? 0 : items.reduce((a, b) => a + b, 0)
                try {
                    if (badItem) {
                        cnt.badItem++
                        failsWith(pkt, BADITEM, JSON.stringify(items))
                    }
                    else if (sum > data.length) {
                        cnt.total++
                        failsWith(pkt, TOTAL, JSON.stringify(items))
                    }
                    else if (items.length > 1 && (items.length - 1) * 25 > items[0]) {
                        //分塊數量(扣除主區塊)乘25逾主區塊長度: 分塊在主區塊內無足夠之標記
                        cnt.many++
                        failsWith(pkt, MANY, JSON.stringify(items))
                    }
                    else {
                        sameAsLegacy(pkt, JSON.stringify(items))
                        if (legacyU8arr2obj(pkt, { returnWithStateAndMsg: true }).state === 'success') {
                            cnt.legitOk++
                        }
                        else {
                            cnt.legitFail++
                        }
                    }
                }
                catch (err) {
                    bad.push({ i, items: JSON.stringify(items) })
                }
            }
            assert.strict.deepStrictEqual(bad.slice(0, 5), [], `不符者共${bad.length}筆`)
            //三類皆有足量樣本, 非空洞
            assert.ok(cnt.legitOk >= 30, JSON.stringify(cnt))
            assert.ok(cnt.legitFail >= 30, JSON.stringify(cnt))
            assert.ok(cnt.badItem >= 30, JSON.stringify(cnt))
            assert.ok(cnt.total >= 30, JSON.stringify(cnt))
            assert.ok(cnt.many >= 30, JSON.stringify(cnt))
        })

    })

    describe(`封包截短與尾端多餘位元組`, function() {

        let o = { s: 'abc', b: new Uint8Array([1, 2, 3, 4]) } //最後一塊為非空二進位塊

        it(`should fail for every strict prefix of a legit packet and succeed for the full one`, function() {
            let pkt = obj2u8arr(o)
            assert.strict.deepStrictEqual(u8arr2obj(pkt), o)
            let ok = []
            for (let L = 0; L < pkt.length; L++) {
                let r = u8arr2obj(pkt.slice(0, L), { returnWithStateAndMsg: true })
                if (r.state !== 'error') {
                    ok.push(L)
                }
            }
            assert.strict.deepStrictEqual(ok, [], '被截短之封包不得還原出(含截斷之)資料')
        })

        it(`should report the total length error when the last binary chunk is cut`, function() {
            //標頭完好但最後一塊少1位元組: 修前slice夾住而還原出被截斷之Uint8Array [1,2,3]
            let pkt = obj2u8arr(o)
            failsWith(pkt.slice(0, pkt.length - 1), TOTAL, 'cut 1 byte')
            failsWith(pkt.slice(0, pkt.length - 4), TOTAL, 'cut 4 bytes')
        })

        it(`should still restore a packet followed by extra trailing bytes`, function() {
            let pkt = concat(obj2u8arr(o), new Uint8Array([9, 9, 9]))
            assert.strict.deepStrictEqual(u8arr2obj(pkt), o)
            sameAsLegacy(pkt, 'trailing')
        })

    })

    describe(`極大分塊資訊於限額子行程: 時間與記憶體與N無關`, function() {

        let runner = join(__dirname, 'tools', 'u8arrLenRunner.mjs')
        //limit 64MB: 修前之實作對 N>=5e6 即耗盡堆積而崩潰(離開碼134)或長時間迴圈
        let cases = [
            ['len', MAX, NOTARR],
            ['len', 4294967295, NOTARR],
            ['len', 100000000, NOTARR],
            ['len', 4294967296, NOTARR],
            ['len', 5000000, NOTARR],
            ['item', MAX, TOTAL],
            ['item', 4294967296, TOTAL],
            ['items', MAX, TOTAL],
        ]
        for (let [kind, N, msg] of cases) {
            it(`should fail ${kind}:${N} with "${msg}" within 1000 ms and 4 MB of heap`, function() {
                this.timeout(120000)
                let rc = runChildCase(runner, `${kind}:${N}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 30000 })
                assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                assert.ok(rc.r !== null, 'no result line')
                let r = rc.r
                assert.strict.deepStrictEqual({ state: r.state, msg: r.msg, plainKeys: r.plainKeys }, { state: 'error', msg, plainKeys: [] })
                assert.ok(r.ms < 1000, `ms=${r.ms}`)
                assert.ok(r.heapMB < 4, `heapMB=${r.heapMB}`)
            })
        }

    })

})


describe(`u8arr2obj 封包資源耗用: 二進位索引重複引用與分塊數量(R-OBJ-ITER-01規則6 外審補測)`, function() {

    let enc = new TextEncoder()
    let REF = 'stru8arr2obj: Error: binary index referenced more than once[0]'
    let MANY = 'invalid pks, too many chunks for the main block'

    //偽造封包建構器(獨立於src內之編碼函數): [8 bytes大端double=標頭長度][標頭JSON文字][資料區bytes]
    let build = (headerText, dataBytes) => {
        let hb = enc.encode(headerText)
        let r = new Uint8Array(8 + hb.length + dataBytes.length)
        new DataView(r.buffer).setFloat64(0, hb.length, false)
        r.set(hb, 8)
        r.set(dataBytes, 8 + hb.length)
        return r
    }
    let concat = (a, b) => {
        let r = new Uint8Array(a.length + b.length)
        r.set(a, 0)
        r.set(b, a.length)
        return r
    }
    //一個二進位分塊、主區塊為給定文字之封包
    let withBin = (mainText, bin) => {
        let mb = enc.encode(mainText)
        return build(`[${mb.length},${bin.length}]`, concat(mb, bin))
    }
    let rsm = { returnWithStateAndMsg: true }

    describe(`合法封包(行為鎖定): obj2u8arr往返`, function() {

        it(`should round-trip the same typed array or buffer appearing many times (each occurrence has its own chunk)`, function() {
            let u = new Uint8Array([1, 2, 3])
            let ab = new Uint8Array([4, 5]).buffer
            let u16 = new Uint16Array([7, 8])
            let data = { a: u, b: u, c: [u, ab, ab], d: u16, e: u16, f: new Uint8Array(0) }
            let r = u8arr2obj(obj2u8arr(data), rsm)
            assert.strict.strictEqual(r.state, 'success')
            assert.strict.deepStrictEqual(r.msg, data)
        })

        it(`should accept the exact boundary: one marker of 25 bytes in the main block for one chunk`, function() {
            let pkt = withBin('"[BlazeForUint8Array]::0"', new Uint8Array([4, 5, 6]))
            assert.strict.deepStrictEqual(u8arr2obj(pkt, rsm), { state: 'success', msg: new Uint8Array([4, 5, 6]) })
        })

        it(`should round-trip 300 random objects with many binaries (every chunk has a marker of at least 25 bytes)`, function() {
            let seed = 20261017
            let rnd = () => {
                seed = (seed * 1103515245 + 12345) % 2147483648
                return seed / 2147483648
            }
            for (let i = 0; i < 300; i++) {
                let n = Math.floor(rnd() * 8)
                let data = { s: 'x'.repeat(Math.floor(rnd() * 5)) }
                for (let j = 0; j < n; j++) {
                    let t = Math.floor(rnd() * 3)
                    let len = Math.floor(rnd() * 6)
                    let bytes = Array.from({ length: len }, () => Math.floor(rnd() * 256))
                    data['k' + j] = t === 0 ? new Uint8Array(bytes) : (t === 1 ? new Uint16Array(bytes.slice(0, len)) : new Uint8Array(bytes).buffer)
                }
                let r = u8arr2obj(obj2u8arr(data), rsm)
                assert.strict.strictEqual(r.state, 'success', `case ${i}: ${r.msg}`)
                assert.strict.deepStrictEqual(r.msg, data)
            }
        })

    })

    describe(`異常封包: 同一二進位索引被引用多次(每次引用複製一份, 配置量=引用次數×分塊大小)`, function() {

        for (let type of ['Uint8Array', 'ArrayBuffer']) {
            it(`should fail when the ${type} marker of chunk 0 appears twice`, function() {
                let m = `"[BlazeFor${type}]::0"`
                let pkt = withBin(`[${m},${m}]`, new Uint8Array([1, 2]))
                assert.strict.deepStrictEqual(u8arr2obj(pkt), {})
                assert.strict.deepStrictEqual(u8arr2obj(pkt, rsm), { state: 'error', msg: REF })
            })
        }

    })

    describe(`異常封包: 分塊數量逾主區塊可容納之標記數(每個分塊在主區塊內至少有一個25位元組之標記)`, function() {

        it(`should fail with too many chunks: [7,0] and [7,0,0] have chunks without markers`, function() {
            for (let h of ['[7,0]', '[7,0,0]']) {
                let pkt = build(h, enc.encode('{"a":1}'))
                assert.strict.deepStrictEqual(u8arr2obj(pkt, rsm), { state: 'error', msg: MANY }, h)
                assert.strict.deepStrictEqual(u8arr2obj(pkt), {}, h)
            }
        })

        it(`should fail with too many chunks: a non-empty chunk without a marker`, function() {
            let pkt = build('[7,3]', enc.encode('{"a":1}XYZ'))
            assert.strict.deepStrictEqual(u8arr2obj(pkt, rsm), { state: 'error', msg: MANY })
        })

        it(`should fail with too many chunks: 2 chunks but the main block is 26 bytes (needs 50)`, function() {
            let main = '"[BlazeForUint8Array]::0" '
            let mb = enc.encode(main)
            let pkt = build(`[${mb.length},1,1]`, concat(mb, new Uint8Array([1, 2])))
            assert.strict.deepStrictEqual(u8arr2obj(pkt, rsm), { state: 'error', msg: MANY })
        })

    })

    describe(`子行程(--expose-gc --max-old-space-size=64): 零長度分塊與重複引用不放大配置`, function() {

        let runner = join(__dirname, 'tools', 'u8arrLenRunner.mjs')
        let cases = [
            //zero: 標頭JSON為70萬項之陣列, JSON.parse本身約配置5.4 MB(與封包大小成正比, 約4倍), 故堆積門檻放寬為16 MB; 修前每項再配置一個Uint8Array而崩潰(exit 134)
            ['zero:700000', MANY, 16],
            ['abref:64:512', REF, 4],
        ]
        for (let [name, msg, maxHeap] of cases) {
            it(`should fail fast with the reason and allocate (almost) nothing: ${name}`, function() {
                let rc = runChildCase(runner, name, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 30000 })
                assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                assert.ok(rc.r !== null, 'no result line')
                let r = rc.r
                assert.strict.deepStrictEqual({ state: r.state, msg: r.msg, plainKeys: r.plainKeys }, { state: 'error', msg, plainKeys: [] })
                assert.ok(r.ms < 1000, `ms=${r.ms}`)
                assert.ok(r.heapMB < maxHeap, `heapMB=${r.heapMB}`)
                assert.ok(r.extMB < 4, `extMB=${r.extMB}`)
            })
        }

    })

})
