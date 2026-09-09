import assert from 'assert'
import b642u8arr from '../src/b642u8arr.mjs'
import u8arr2b64 from '../src/u8arr2b64.mjs'


describe(`b642u8arr`, function() {

    it(`should return new Uint8Array([1, 2.3, '45', 'abc']) when input 'AQItAA=='`, function() {
        let u8a = new Uint8Array([1, 2.3, '45', 'abc'])
        let r = b642u8arr('AQItAA==')
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input '1.25'`, function() {
        //'.'不在base64字母表內故整串判為無效; 原碼把'.'當0位元而解出[212,13,185]之垃圾位元組, 與本it之標題不符
        let r = b642u8arr('1.25')
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input 2.25`, function() {
        let r = b642u8arr(2.25)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input ''`, function() {
        let r = b642u8arr('')
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input []`, function() {
        let r = b642u8arr([])
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input {}`, function() {
        let r = b642u8arr({})
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input null`, function() {
        let r = b642u8arr(null)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input undefined`, function() {
        let r = b642u8arr(undefined)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input NaN`, function() {
        let r = b642u8arr(NaN)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    //以下為對齊RFC 4648與TC39 proposal-arraybuffer-base64(Uint8Array.fromBase64之預設loose模式)之行為
    //期望值取自core-js之規範實作實測, 見tmp/zz_chk_b64spec.mjs

    it(`should ignore ascii whitespace anywhere in the input`, function() {
        //空白須先剝除再解碼; 原碼把空白之charCode查表得undefined並當成0位元, 使折行base64解出錯誤資料
        let rr = new Uint8Array([66, 97, 115])
        for (let s of ['Qm Fz', ' QmFz ', 'QmFz\n', 'Qm\nFz', 'Q\tmFz', 'Qm\fFz', 'Qm\rFz']) {
            assert.strict.deepStrictEqual(b642u8arr(s), rr, `輸入 ${JSON.stringify(s)} 應忽略空白`)
        }
    })

    it(`should decode line-wrapped base64 correctly`, function() {
        //MIME/PEM折行之base64, 原碼會解出多餘位元組
        let u8a = new Uint8Array(60)
        for (let i = 0; i < 60; i++) {
            u8a[i] = i
        }
        let b64 = u8arr2b64(u8a)
        let wrapped = b64.replace(/(.{20})/g, '$1\n')
        assert.strict.deepStrictEqual(b642u8arr(wrapped), u8a)
    })

    it(`should return an empty Uint8Array for input containing characters outside the base64 alphabet`, function() {
        //RFC 4648 §3.3: 含字母表外之字元MUST reject; 原碼把非法字元當0位元而靜默產出垃圾
        let rr = new Uint8Array()
        for (let s of ['!!!!', '@@@@', 'not-base64!!', '中文字', 'QmFz!!!!', '-_8']) {
            assert.strict.deepStrictEqual(b642u8arr(s), rr, `輸入 ${JSON.stringify(s)} 應判為無效`)
        }
    })

    it(`should accept and reject lengths and paddings per the spec (loose last chunk)`, function() {
        //pad為0時長度模4不可為1; pad為1時須模4為3; pad為2時須模4為2
        let oks = [
            ['', []],
            ['QQ', [65]],
            ['QUI', [65, 66]],
            ['QmFz', [66, 97, 115]],
            ['QmFzQQ', [66, 97, 115, 65]],
            ['QmFzQUI', [66, 97, 115, 65, 66]],
            ['QQ==', [65]],
            ['QUI=', [65, 66]],
            ['QQ = =', [65]],
        ]
        for (let [s, v] of oks) {
            assert.strict.deepStrictEqual(b642u8arr(s), new Uint8Array(v), `輸入 ${JSON.stringify(s)} 應可解碼`)
        }
        let bads = ['Q', 'QmFzQ', 'Q=', 'Q==', 'QQ=', 'QUI==', 'QmFz=', 'QmFz==', '=', '===', 'QQ==BB', 'QQ=Q']
        for (let s of bads) {
            assert.strict.deepStrictEqual(b642u8arr(s), new Uint8Array(), `輸入 ${JSON.stringify(s)} 應判為無效`)
        }
    })

    it(`should return { state: 'error' } with a reason for invalid base64 with returnWithStateAndMsg`, function() {
        let r1 = b642u8arr('!!!!', { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r1.state, 'error')
        assert.strict.deepStrictEqual(r1.msg.indexOf('invalid b64') === 0, true, `msg 應標明無效base64, got ${r1.msg}`)
        let r2 = b642u8arr('QmFzQ', { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r2.state, 'error')
    })

    it(`[oracle] should agree with core-js Uint8Array.fromBase64 on accept/reject and bytes`, async function() {
        //core-js為TC39提案之規範實作, 於此作為對拍用; 取不到時略過, 不使測試相依於傳遞相依套件
        let fromBase64 = null
        try {
            await import('core-js/proposals/array-buffer-base64.js')
            fromBase64 = Uint8Array.fromBase64
        }
        catch (err) {
            this.skip()
        }
        if (typeof fromBase64 !== 'function') {
            this.skip()
        }
        let ss = [
            '', 'Q', 'QQ', 'QUI', 'QmFz', 'QmFzQ', 'QmFzQQ', 'QmFzQUI',
            'Q=', 'Q==', 'QQ=', 'QQ==', 'QUI=', 'QUI==', 'QmFz=', 'QmFz==',
            '=', '===', 'QQ==BB', 'QQ=Q', '!!!!', 'not-base64!!', '-_8', '中文字',
            'Qm Fz', ' QmFz ', 'QmFz\n', 'Qm\nFz', 'QmFz\r\nQmFz', 'Q\tmFz', 'QQ = =', '\n\n',
        ]
        for (let s of ss) {
            let exp = null
            try {
                exp = Array.from(fromBase64(s))
            }
            catch (err) {
                exp = null //規範判為無效
            }
            let r = b642u8arr(s, { returnWithStateAndMsg: true })
            if (exp === null) {
                assert.strict.deepStrictEqual(r.state, 'error', `輸入 ${JSON.stringify(s)} 規範判無效, 本函數應同`)
            }
            else {
                assert.strict.deepStrictEqual(r.state, 'success', `輸入 ${JSON.stringify(s)} 規範判有效, 本函數應同`)
                assert.strict.deepStrictEqual(Array.from(r.msg), exp, `輸入 ${JSON.stringify(s)} 之位元組應與規範相同`)
            }
        }
    })

    it(`should return { state: 'success', msg } when input 'QmFz' with returnWithStateAndMsg`, function() {
        let r = b642u8arr('QmFz', { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: new Uint8Array([66, 97, 115]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid b64' } when input NaN with returnWithStateAndMsg`, function() {
        let r = b642u8arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid b64' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = b642u8arr('QmFz', { returnWithStateAndMsg: 'yes' })
        let rr = new Uint8Array([66, 97, 115])
        assert.strict.deepStrictEqual(r, rr)
    })

})
