import assert from 'assert'
import crypto from 'crypto'
import str2sha from '../src/str2sha.mjs'


describe(`str2sha`, function() {

    //ns, 可用之n與其對應之node內建crypto演算法名稱
    let ns = [
        [1, 'sha1'],
        [224, 'sha224'],
        [256, 'sha256'],
        [384, 'sha384'],
        [512, 'sha512'],
    ]

    //各n對SHA標準規定之輸出位元數, SHA-1之1為版本號故輸出為160位元
    let bits = {
        1: 160,
        224: 224,
        256: 256,
        384: 384,
        512: 512,
    }

    it(`sould return the same hex digest as node crypto for each available n`, function() {
        //以node內建crypto(獨立實作)為真值來源, 斷言本函數輸出符合SHA標準而非僅符合crypto-js現狀
        for (let [n, alg] of ns) {
            let r = str2sha('test中文', n)
            let rr = crypto.createHash(alg).update('test中文', 'utf8').digest('hex')
            assert.strict.deepStrictEqual(r, rr)
        }
    })

    it(`sould return the same base64 digest as node crypto for each available n`, function() {
        for (let [n, alg] of ns) {
            let r = str2sha('test中文', n, true)
            let rr = crypto.createHash(alg).update('test中文', 'utf8').digest('base64')
            assert.strict.deepStrictEqual(r, rr)
        }
    })

    it(`sould return hex digest with length matching the bits defined by SHA standard`, function() {
        //hex字元數為位元數除4, SHA-1為160位元故40字元
        for (let [n] of ns) {
            let r = str2sha('test中文', n)
            assert.strict.deepStrictEqual(r.length, bits[n] / 4)
        }
    })

    it(`sould return 'ecabf586cef0d3b11c56549433ad50b81110a836' when input 'test中文', 1`, function() {
        let r = str2sha('test中文', 1)
        let rr = 'ecabf586cef0d3b11c56549433ad50b81110a836'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'c9b3eebeae6fe7e42cd9680475787a77e234bce0abb8d599d995b2a6' when input 'test中文', 224`, function() {
        let r = str2sha('test中文', 224)
        let rr = 'c9b3eebeae6fe7e42cd9680475787a77e234bce0abb8d599d995b2a6'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '8af7c7959618cc0900be74a52eee44aca05aeb72525864dc7ae25d31761beb65' when input 'test中文', 256`, function() {
        let r = str2sha('test中文', 256)
        let rr = '8af7c7959618cc0900be74a52eee44aca05aeb72525864dc7ae25d31761beb65'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '219ece10ffe81c179511d4ffa43a0c75bbee737acdd18ee11839a1def78a4e10c94186ef8483fce85d0589bcbddf632e' when input 'test中文', 384`, function() {
        let r = str2sha('test中文', 384)
        let rr = '219ece10ffe81c179511d4ffa43a0c75bbee737acdd18ee11839a1def78a4e10c94186ef8483fce85d0589bcbddf632e'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30' when input 'test中文', 512`, function() {
        let r = str2sha('test中文', 512)
        let rr = 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'ivfHlZYYzAkAvnSlLu5ErKBa63JSWGTceuJdMXYb62U=' when input 'test中文', 256, true`, function() {
        let r = str2sha('test中文', 256, true)
        let rr = 'ivfHlZYYzAkAvnSlLu5ErKBa63JSWGTceuJdMXYb62U='
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould accept numeric string as n`, function() {
        let r = str2sha('test中文', '512')
        let rr = str2sha('test中文', 512)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould throw 'invalid n[n]' when n is a positive integer not available`, function() {
        //160為SHA-1之實際輸出位元數但非其演算法名稱, 不可用
        assert.throws(() => str2sha('test中文', 160), /^Error: invalid n\[160\]$/)
        //128為MD5輸出位元數, 非SHA系列
        assert.throws(() => str2sha('test中文', 128), /^Error: invalid n\[128\]$/)
        //3為SHA-3之版本號, 因與SHA-2位數重疊產生歧義故不納入
        assert.throws(() => str2sha('test中文', 3), /^Error: invalid n\[3\]$/)
        //2為SHA-2之版本號, 非單一演算法
        assert.throws(() => str2sha('test中文', 2), /^Error: invalid n\[2\]$/)
    })

    it(`sould throw 'n is not a positive integer' when n is not a positive integer`, function() {
        assert.throws(() => str2sha('test中文', 0), /^Error: n is not a positive integer$/)
        assert.throws(() => str2sha('test中文', -512), /^Error: n is not a positive integer$/)
        assert.throws(() => str2sha('test中文', 511.5), /^Error: n is not a positive integer$/)
        assert.throws(() => str2sha('test中文', 512.4), /^Error: n is not a positive integer$/)
    })

    it(`sould throw 'n is not a positive integer' when n is an invalid type`, function() {
        assert.throws(() => str2sha('test中文', 'abc'), /^Error: n is not a positive integer$/)
        assert.throws(() => str2sha('test中文', ''), /^Error: n is not a positive integer$/)
        assert.throws(() => str2sha('test中文', []), /^Error: n is not a positive integer$/)
        assert.throws(() => str2sha('test中文', {}), /^Error: n is not a positive integer$/)
        assert.throws(() => str2sha('test中文', null), /^Error: n is not a positive integer$/)
        assert.throws(() => str2sha('test中文', undefined), /^Error: n is not a positive integer$/)
        assert.throws(() => str2sha('test中文', NaN), /^Error: n is not a positive integer$/)
    })

    it(`sould throw 'n is not a positive integer' when n is not given`, function() {
        assert.throws(() => str2sha('test中文'), /^Error: n is not a positive integer$/)
    })

    it(`sould not be fooled by keys inherited from Object.prototype as n`, function() {
        //haskey內部為key in obj而含原型鏈, 'toString'等鍵會誤判為存在,
        //故ispint檢核須置於haskey之前; 以錯誤訊息斷言確實由ispint先攔下, 藉此鎖住兩檢核之先後次序
        assert.throws(() => str2sha('test中文', 'toString'), /^Error: n is not a positive integer$/)
        assert.throws(() => str2sha('test中文', 'constructor'), /^Error: n is not a positive integer$/)
        assert.throws(() => str2sha('test中文', 'valueOf'), /^Error: n is not a positive integer$/)
    })

    it(`sould fallback base64 to false when base64 is an invalid type`, function() {
        //base64非布林值時回退為false, 即輸出hex
        let rr = 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
        assert.strict.deepStrictEqual(str2sha('test中文', 512, ''), rr)
        assert.strict.deepStrictEqual(str2sha('test中文', 512, []), rr)
        assert.strict.deepStrictEqual(str2sha('test中文', 512, {}), rr)
        assert.strict.deepStrictEqual(str2sha('test中文', 512, null), rr)
        assert.strict.deepStrictEqual(str2sha('test中文', 512, 1), rr)
    })

    it(`sould use hex when base64 is undefined`, function() {
        let r = str2sha('test中文', 512, undefined)
        let rr = 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when str is an invalid type`, function() {
        assert.strict.deepStrictEqual(str2sha('', 512), '')
        assert.strict.deepStrictEqual(str2sha([], 512), '')
        assert.strict.deepStrictEqual(str2sha({}, 512), '')
        assert.strict.deepStrictEqual(str2sha(null, 512), '')
        assert.strict.deepStrictEqual(str2sha(undefined, 512), '')
        assert.strict.deepStrictEqual(str2sha(NaN, 512), '')
        assert.strict.deepStrictEqual(str2sha(123, 512), '')
    })

    it(`sould short-circuit on invalid str before validating n`, function() {
        //str之檢核置於n之前, 故str無效時直接回空字串而不會擲出n之錯誤
        //此為檢核次序造成之行為, 明確鎖住以免日後調換次序而無聲改變對外語意
        assert.strict.deepStrictEqual(str2sha('', 160), '')
    })

    it(`sould still validate n when base64 is invalid`, function() {
        //base64之檢核置於n之後, 故base64無效不會遮蔽n之錯誤
        assert.throws(() => str2sha('test中文', 160, 'notbool'), /^Error: invalid n\[160\]$/)
    })

    it(`sould produce different digests for different n`, function() {
        let rs = ns.map(([n]) => str2sha('test中文', n))
        let rsUniq = [...new Set(rs)]
        assert.strict.deepStrictEqual(rsUniq.length, ns.length)
    })

})
