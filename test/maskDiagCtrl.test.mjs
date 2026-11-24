import fs from 'fs'
import assert from 'assert'
import maskDiagCtrl from '../src/maskDiagCtrl.mjs'
import getDiagShape from '../src/getDiagShape.mjs'


//maskDiagCtrl為控制字元之替換, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01規則16(排程第610項②: getDiagShape內之私有版本改為共用之匯出函數)
//規格句(JSDoc): C1 Unicode類別Cc、Cf、Zl、Zp之每個字元(碼位)換成一個?; C2 其他字元(含一般空白、非ASCII文字、未指派碼位、單獨之代理碼元)不變、不截長度;
//C3 與getDiagShape之鍵名為同一規則; C4 包裝字串以原始值處理, 非字串原樣回傳(不執行toString), 永不拋錯


describe(`maskDiagCtrl`, function() {

    it(`should be exported from the package index`, function() {
        let c = fs.readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8')
        assert.strict.deepStrictEqual(c.includes(`export { default as maskDiagCtrl } from './maskDiagCtrl.mjs'`), true)
    })

    it(`C1: should replace every Cc, Cf, Zl and Zp character, including boundaries and astral format characters`, function() {
        let cps = [0x00, 0x09, 0x0a, 0x0d, 0x1b, 0x1f, 0x7f, 0x80, 0x85, 0x9f, 0xad, 0x061c, 0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0x2028, 0x2029, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2060, 0x2066, 0x2067, 0x2068, 0x2069, 0x206a, 0x206f, 0xfeff, 0xfff9, 0x110bd, 0xe0001, 0xe007f]
        for (let cp of cps) {
            let c = String.fromCodePoint(cp)
            assert.strict.deepStrictEqual(maskDiagCtrl(`a${c}b`), 'a?b', cp.toString(16))
        }
    })

    it(`C2: should keep spaces, printable text, unassigned code points and lone surrogates; never truncate`, function() {
        let cps = [0x20, 0x7e, 0xa0, 0x2000, 0x2027, 0x202f, 0x2065, 0x3000, 0x4e2d, 0x1f600, 0xe000]
        for (let cp of cps) {
            let c = String.fromCodePoint(cp)
            assert.strict.deepStrictEqual(maskDiagCtrl(`a${c}b`), `a${c}b`, cp.toString(16))
        }
        assert.strict.deepStrictEqual(maskDiagCtrl('x\ud800y\udc00'), 'x\ud800y\udc00')
        let long = 'ab\u0000'.repeat(100000)
        assert.strict.deepStrictEqual(maskDiagCtrl(long), 'ab?'.repeat(100000))
        assert.strict.deepStrictEqual(maskDiagCtrl('a\r\nb\u0000c\u007fd'), 'a??b?c?d')
        assert.strict.deepStrictEqual(maskDiagCtrl(''), '')
    })

    it(`C3: should be the same rule as getDiagShape key names for every character in BMP samples and astral samples`, function() {
        for (let cp = 0; cp < 0x3000; cp++) {
            if (cp >= 0xd800 && cp <= 0xdfff) {
                continue
            }
            let k = `k${String.fromCodePoint(cp)}`
            assert.strict.deepStrictEqual(getDiagShape({ [k]: 1 }), `(keys: ${maskDiagCtrl(k)})`, cp.toString(16))
        }
        for (let cp of [0xfeff, 0xfff9, 0x110bd, 0xe0001, 0x1f600]) {
            let k = `k${String.fromCodePoint(cp)}`
            assert.strict.deepStrictEqual(getDiagShape({ [k]: 1 }), `(keys: ${maskDiagCtrl(k)})`, cp.toString(16))
        }
    })

    it(`C4: should unbox wrapper strings, return non-strings as is without running user code, and not throw`, function() {
        let n = 0
        let o = {
            toString: () => {
                n++; return 'a\nb'
            }
        }
        let { proxy, revoke } = Proxy.revocable({}, {})
        revoke()
        let px = new Proxy({}, {
            get: () => {
                n++; return () => 'x'
            }
        })
        assert.strict.deepStrictEqual(maskDiagCtrl(new String('a\nb')), 'a?b') // eslint-disable-line no-new-wrappers
        for (let v of [undefined, null, 5, true, 3n, o, px, proxy]) {
            assert.strict.deepStrictEqual(maskDiagCtrl(v), v)
        }
        let sym = Symbol('a\nb')
        assert.strict.deepStrictEqual(maskDiagCtrl(sym), sym)
        assert.strict.deepStrictEqual(n, 0)
    })

})
