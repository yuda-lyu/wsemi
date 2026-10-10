import assert from 'assert'
import str2u8arr from '../src/str2u8arr.mjs'
import u8arr2str from '../src/u8arr2str.mjs'


describe(`u8arr2str`, function() {

    it(`should return 'test中文' when input new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135])`, function() {
        let r = u8arr2str(new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135]))
        let rr = 'test中文'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input '1.25'`, function() {
        let r = u8arr2str('1.25')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input 2.25`, function() {
        let r = u8arr2str(2.25)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = u8arr2str('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = u8arr2str([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = u8arr2str({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = u8arr2str(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = u8arr2str(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = u8arr2str(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: 'test中文' } when input utf8 Uint8Array with returnWithStateAndMsg`, function() {
        let r = u8arr2str(new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135]), { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: 'test中文' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid u8a' } when input NaN with returnWithStateAndMsg`, function() {
        let r = u8arr2str(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid u8a' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'test中文' when input utf8 Uint8Array with invalid returnWithStateAndMsg`, function() {
        let r = u8arr2str(new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135]), { returnWithStateAndMsg: 'yes' })
        let rr = 'test中文'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should decode UTF-8 bytes, including 4-byte characters and NUL, and keep a leading BOM`, function() {
        //以原生TextDecoder解碼; 開頭之BOM保留為U+FEFF, 與str2u8arr往返一致
        assert.strict.deepStrictEqual(u8arr2str(new Uint8Array([0xF0, 0x9F, 0x98, 0x80])), '😀')
        assert.strict.deepStrictEqual(u8arr2str(new Uint8Array([0xEF, 0xBB, 0xBF, 0x61])), '\uFEFFa')
        assert.strict.deepStrictEqual(u8arr2str(new Uint8Array([0x61, 0x00, 0x62])), 'a\u0000b')
        assert.strict.deepStrictEqual(u8arr2str(new Uint8Array([]), { returnWithStateAndMsg: true }), { state: 'success', msg: '' })
    })

    it(`should fail for invalid UTF-8 instead of succeeding with '' or replacing with U+FFFD`, function() {
        //原經b642str時未取其狀態, 解碼錯誤被吞掉而回{ state: 'success', msg: '' }
        let cases = [
            [0x61, 0xFF, 0x62], //非法位元組
            [0x61, 0xE4, 0xB8], //截斷之多位元組
            [0xC0, 0x80], //過長編碼
            [0xED, 0xA0, 0x80], //代理碼位
            [0x80, 0x61], //孤立延續位元組
            [0xF4, 0x90, 0x80, 0x80], //超出U+10FFFF
        ]
        for (let arr of cases) {
            let u8a = new Uint8Array(arr)
            assert.strict.deepStrictEqual(u8arr2str(u8a), '', JSON.stringify(arr))
            let r = u8arr2str(u8a, { returnWithStateAndMsg: true })
            assert.strict.deepStrictEqual([r.state, typeof r.msg === 'string' && r.msg.length > 0], ['error', true], JSON.stringify(arr))
        }
    })

    it(`should decode only the view of a subarray, and accept Buffer`, function() {
        assert.strict.deepStrictEqual(u8arr2str(new Uint8Array([0x61, 0x62, 0x63, 0x64]).subarray(1, 3)), 'bc')
        assert.strict.deepStrictEqual(u8arr2str(Buffer.from('test中文', 'utf8')), 'test中文')
    })

    it(`should round trip random well-formed strings with str2u8arr and equal Node's UTF-8 encoding and decoding`, function() {
        //隨機字串含ASCII、2位元組、3位元組字元與代理對(4位元組字元), 以Buffer之UTF-8編解碼為對照; 固定種子以利重現
        let seed = 20261010
        let rnd = () => {
            seed = (seed * 1103515245 + 12345) % 2147483648
            return seed / 2147483648
        }
        let ranges = [[0x20, 0x7E], [0x80, 0x7FF], [0x800, 0xD7FF], [0xE000, 0xFFFF], [0x10000, 0x10FFFF]]
        for (let k = 0; k < 300; k++) {
            let n = 1 + Math.floor(rnd() * 40)
            let s = ''
            for (let i = 0; i < n; i++) {
                let [a, b] = ranges[Math.floor(rnd() * ranges.length)]
                s += String.fromCodePoint(a + Math.floor(rnd() * (b - a + 1)))
            }
            let u8a = str2u8arr(s)
            assert.strict.deepStrictEqual(u8a, new Uint8Array(Buffer.from(s, 'utf8')), JSON.stringify(s))
            assert.strict.deepStrictEqual(u8arr2str(u8a), s, JSON.stringify(s))
        }
    })

})
