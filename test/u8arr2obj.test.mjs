import assert from 'assert'
import u8arr2obj from '../src/u8arr2obj.mjs'
import obj2u8arr from '../src/obj2u8arr.mjs'


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

    it(`should return { state: 'error', msg: <SyntaxError> } when input a corrupted packet with returnWithStateAndMsg`, function() {
        let r = u8arr2obj(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]), { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(Object.keys(r).sort(), ['msg', 'state'])
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('SyntaxError') === 0, true, `msg 應為解析錯誤, got ${r.msg}`)
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
