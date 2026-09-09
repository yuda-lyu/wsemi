import assert from 'assert'
import stru8arr2obj from '../src/stru8arr2obj.mjs'


describe(`stru8arr2obj`, function() {
    let inp = {
        results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[BlazeForUint8Array]::0"}}',
        binarys: [new Uint8Array([66, 97, 115])]
    }
    let out = {
        a: 123,
        b: 45.67,
        c: 'l1-測試中文',
        d: {
            da: 123,
            db: 45.67,
            dc: 'l2-測試中文',
            dd: ['a', 'xyz', 321, 76.54],
            de: new Uint8Array([66, 97, 115]),
        }
    }
    let cout = `{ a: 123, b: 45.67, c: 'l1-測試中文', d: { da: 123, db: 45.67, dc: 'l2-測試中文', dd: ['a', 'xyz', 321, 76.54], de: new Uint8Array([66, 97, 115]), } }`
    let empty = {}
    let cempty = '{}'

    it(`should return ${cout} when input ${JSON.stringify(inp)}`, function() {
        let r = stru8arr2obj(inp)
        let rr = out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input ''`, function() {
        let r = stru8arr2obj('')
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input []`, function() {
        let r = stru8arr2obj([])
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input {}`, function() {
        let r = stru8arr2obj({})
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input null`, function() {
        let r = stru8arr2obj(null)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input undefined`, function() {
        let r = stru8arr2obj(undefined)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input NaN`, function() {
        let r = stru8arr2obj(NaN)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input results is not a valid json`, function() {
        let r = stru8arr2obj({ results: 'not-json', binarys: [] })
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 1, b: Uint8Array [ 66 ] } when input results with the new marker`, function() {
        let r = stru8arr2obj({ results: '{"a":1,"b":"[BlazeForUint8Array]::0"}', binarys: [new Uint8Array([66])] })
        let rr = { a: 1, b: new Uint8Array([66]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should NOT restore the legacy marker (kept as a plain string) when input results with the legacy marker`, function() {
        //舊版標記已不再支援還原, 舊版產出之封包其binary會留為標記字串
        let r = stru8arr2obj({ results: '{"a":1,"b":"[Uint8Array]::0"}', binarys: [new Uint8Array([66])] })
        let rr = { a: 1, b: '[Uint8Array]::0' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should keep an application string that merely contains the marker text (exact match only)`, function() {
        //標記須完整匹配整個字串值, 夾雜標記文字之應用字串不得被誤判為二進位參照
        let B = [new Uint8Array([66])]
        let r = stru8arr2obj({ results: '{"t":"note: [BlazeForUint8Array]::0 xxx"}', binarys: B })
        let rr = { t: 'note: [BlazeForUint8Array]::0 xxx' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should keep an application string that ends with the marker text`, function() {
        let B = [new Uint8Array([66])]
        let r = stru8arr2obj({ results: '{"t":"see [BlazeForUint8Array]::0"}', binarys: B })
        let rr = { t: 'see [BlazeForUint8Array]::0' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should keep array elements that merely contain the marker text (not turn them into null)`, function() {
        let B = [new Uint8Array([66])]
        let r = stru8arr2obj({ results: '{"arr":["a","x [BlazeForUint8Array]::0 y","c"]}', binarys: B })
        let rr = { arr: ['a', 'x [BlazeForUint8Array]::0 y', 'c'] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should keep a string whose marker suffix is not a pure integer`, function() {
        let B = [new Uint8Array([66])]
        let r = stru8arr2obj({ results: '{"t":"[BlazeForUint8Array]::0a"}', binarys: B })
        let rr = { t: '[BlazeForUint8Array]::0a' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should restore the binary when the whole string is exactly the marker and the index is in range`, function() {
        let B = [new Uint8Array([66])]
        let r = stru8arr2obj({ results: '{"t":"[BlazeForUint8Array]::0"}', binarys: B })
        let rr = { t: new Uint8Array([66]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should treat an out-of-range index as a broken packet (return {} instead of dropping the key)`, function() {
        //標記格式正確但索引不存在, 只可能為封包損毀或results與binarys不匹配, 不可靜默刪鍵
        let B = [new Uint8Array([66])]
        let r = stru8arr2obj({ results: '{"t":"[BlazeForUint8Array]::1","other":1}', binarys: B })
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: <out of range> } for an out-of-range index with returnWithStateAndMsg`, function() {
        let B = [new Uint8Array([66])]
        let r = stru8arr2obj({ results: '{"t":"[BlazeForUint8Array]::1"}', binarys: B }, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('binary index out of range[1]') >= 0, true, `msg 應標明越界索引, got ${r.msg}`)
    })

    it(`should treat a bare marker as a binary reference (application strings are escaped by the encoder instead)`, function() {
        //本函數層級中裸標記即定義為二進位參照; 應用字串與標記同形之情況由編碼端前置跳脫記號區分, 見下一條
        let B = [new Uint8Array([7])]
        let r = stru8arr2obj({ results: '{"t":"[BlazeForUint8Array]::0"}', binarys: B })
        let rr = { t: new Uint8Array([7]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should keep binarys untouched when they already are of the marker type`, function() {
        //直接呼叫obj2stru8arr者binarys內即為原物件, 已是該型別故不重建
        let u16 = new Uint16Array([300, 400])
        let ab = new Uint8Array([5, 6]).buffer
        let r = stru8arr2obj({ results: '{"a":"[BlazeForUint16Array]::0","b":"[BlazeForArrayBuffer]::1"}', binarys: [u16, ab] })
        let rr = { a: u16, b: ab }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should rebuild Uint16Array from raw bytes according to the marker type`, function() {
        //經obj2u8arr打包者binarys內為切出之原始位元組, 須依標記型別重建
        let r = stru8arr2obj({ results: '{"a":"[BlazeForUint16Array]::0"}', binarys: [new Uint8Array([44, 1, 144, 1])] })
        let rr = { a: new Uint16Array([300, 400]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should rebuild ArrayBuffer from raw bytes according to the marker type`, function() {
        let r = stru8arr2obj({ results: '{"a":"[BlazeForArrayBuffer]::0"}', binarys: [new Uint8Array([5, 6])] })
        let rr = { a: new Uint8Array([5, 6]).buffer }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should treat an odd byteLength as a broken packet when the marker says Uint16Array`, function() {
        let r = stru8arr2obj({ results: '{"a":"[BlazeForUint16Array]::0"}', binarys: [new Uint8Array([1, 2, 3])] }, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('is not even') >= 0, true, `msg 應標明位元組長度非偶數, got ${r.msg}`)
    })

    it(`should unescape an escaped marker back to the original application string`, function() {
        let B = [new Uint8Array([7])]
        let r = stru8arr2obj({ results: '{"t":"[BlazeForPreventEscape][BlazeForUint8Array]::0"}', binarys: B })
        let rr = { t: '[BlazeForUint8Array]::0' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should strip only one escape layer when the string is escaped twice`, function() {
        let B = [new Uint8Array([7])]
        let r = stru8arr2obj({ results: '{"t":"[BlazeForPreventEscape][BlazeForPreventEscape][BlazeForUint8Array]::0"}', binarys: B })
        let rr = { t: '[BlazeForPreventEscape][BlazeForUint8Array]::0' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should keep a lone escape tag untouched`, function() {
        let B = [new Uint8Array([7])]
        let r = stru8arr2obj({ results: '{"t":"[BlazeForPreventEscape]"}', binarys: B })
        let rr = { t: '[BlazeForPreventEscape]' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, 2, 3] when input results is an array`, function() {
        let r = stru8arr2obj({ results: '[1,2,3]', binarys: [] })
        let rr = [1, 2, 3]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: ${cout} } when input ${JSON.stringify(inp)} with returnWithStateAndMsg`, function() {
        let r = stru8arr2obj(inp, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: out }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data' } when input NaN with returnWithStateAndMsg`, function() {
        let r = stru8arr2obj(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not throw but return { state: 'error', msg: <Error> } when input data has a throwing getter`, function() {
        //取值之非預期錯誤須被攔截, 不得外拋至呼叫端
        let o = {
            get results() {
                throw new Error('boom-getter')
            },
            binarys: [],
        }
        let r = stru8arr2obj(o, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'Error: boom-getter' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid results' } when input results is empty with returnWithStateAndMsg`, function() {
        let r = stru8arr2obj({ results: '', binarys: [] }, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid results' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid binarys' } when input binarys is not an array with returnWithStateAndMsg`, function() {
        let r = stru8arr2obj({ results: '{"a":1}', binarys: 'x' }, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid binarys' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: <SyntaxError> } when input results is not a valid json with returnWithStateAndMsg`, function() {
        let r = stru8arr2obj({ results: 'not-json', binarys: [] }, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(Object.keys(r).sort(), ['msg', 'state'])
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('SyntaxError') === 0, true, `msg 應為解析錯誤, got ${r.msg}`)
    })

    it(`should return ${cout} when input ${JSON.stringify(inp)} with invalid returnWithStateAndMsg`, function() {
        let r = stru8arr2obj(inp, { returnWithStateAndMsg: 'yes' })
        let rr = out
        assert.strict.deepStrictEqual(r, rr)
    })

})
