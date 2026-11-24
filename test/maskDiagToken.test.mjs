import fs from 'fs'
import assert from 'assert'
import maskDiagToken from '../src/maskDiagToken.mjs'
import maskDiagCtrl from '../src/maskDiagCtrl.mjs'


//maskDiagToken為權杖之遮罩, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01規則17(排程第610項③: 使用端四份自寫之同一契約M, 收為單一實作, 輸出須與四份逐字相同)
//規格句(JSDoc): T1 k=min(4, floor(n/8)), k為0回'(len=n)', 否則'頭k...尾k(len=n)'; T2 undefined、null、''回''; T3 陣列逐項(同長、空洞保留、至多8層); T4 其他非字串回'(typeof)';
//T5 露出之頭尾字元之控制字元、格式字元與行/段分隔符換成?(同maskDiagCtrl); T6 不執行使用端程式、永不拋錯


describe(`maskDiagToken`, function() {

    it(`should be exported from the package index`, function() {
        let c = fs.readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8')
        assert.strict.deepStrictEqual(c.includes(`export { default as maskDiagToken } from './maskDiagToken.mjs'`), true)
    })

    //使用端四份之共同測資(四份測試檔自稱同一組), 逐字相同
    it(`T1-T5: should match the shared contract table of the four existing implementations verbatim`, function() {
        let rows = [
            ['', ''],
            ['abc', '(len=3)'],
            ['abcdefg', '(len=7)'],
            ['abcdefgh', 'a...h(len=8)'],
            ['token-for-app', 't...p(len=13)'],
            ['abcdefghijklmnop', 'ab...op(len=16)'],
            ['0199a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b', '0199...4a5b(len=36)'],
            [['abcdefghijklmnop', 'x'], ['ab...op(len=16)', '(len=1)']],
            [{ a: 'SECRET' }, '(object)'],
            [12345, '(number)'],
            ['\nbcdefghijklmno\r', '?b...o?(len=16)'],
            [undefined, ''],
            [null, ''],
            [true, '(boolean)'],
        ]
        for (let [v, want] of rows) {
            assert.strict.deepStrictEqual(maskDiagToken(v), want, JSON.stringify(v))
        }
    })

    //使用端各份之額外測資(邊界、型別、巢狀、控制字元); 四份對C1與U+206A~206F之處置互相矛盾, 見下一案
    it(`T1-T5: should match the extra boundary, type and nesting rows of the existing implementations`, function() {
        let x = (n) => 'x'.repeat(n)
        let rows = [
            ['a', '(len=1)'],
            ['abcdefghijklmno', 'a...o(len=15)'],
            [`ABC${x(25)}XYZ`, 'ABC...XYZ(len=31)'],
            [`ABCD${x(24)}WXYZ`, 'ABCD...WXYZ(len=32)'],
            [`ABCD${x(92)}WXYZ`, 'ABCD...WXYZ(len=100)'],
            ['SYNTH-MASK-SECRET-0123456789', 'SYN...789(len=28)'],
            [() => 1, '(function)'],
            [Symbol('s'), '(symbol)'],
            [10n, '(bigint)'],
            [new Error('SECRET'), '(object)'],
            [[['abcdefgh'], null, 7], [['a...h(len=8)'], '', '(number)']],
            [`\u0000\u001f${x(12)}\u007f\u0009`, '??...??(len=16)'],
            [`ab${'\n'.repeat(12)}yz`, 'ab...yz(len=16)'],
            [[], []],
            [[12345, { a: 'SECRET' }, null], ['(number)', '(object)', '']],
            ['0123456789abcdef0123456789abcdef0123', '0123...0123(len=36)'],
            [x(100), 'xxxx...xxxx(len=100)'],
            ['\u007f\u0000cdefghijklmn\u0000\u007f', '??...??(len=16)'],
            [{ token: 'SECRET-IN-OBJECT' }, '(object)'],
            [[{ a: 'SECRET' }, null, 'abcdefgh'], ['(object)', '', 'a...h(len=8)']],
        ]
        for (let [v, want] of rows) {
            let r = maskDiagToken(v)
            assert.strict.deepStrictEqual(r, want, String(typeof v === 'symbol' ? 'symbol' : JSON.stringify(v, (k, y) => (typeof y === 'bigint' ? 'bigint' : y))))
            assert.strict.deepStrictEqual(JSON.stringify(r === undefined ? '' : r).includes('SECRET'), false)
        }
    })

    //T5: 控制字元等之替換同maskDiagCtrl(Cc、Cf、Zl、Zp). 現行四份互相矛盾: 一份保留C1(U+0080)、一份換C1與雙向控制但保留U+206A, 另兩份只換C0與DEL;
    //wsemi依單一規則(與getDiagShape之鍵名、maskDiagCtrl相同), 下列為與各份不同之處之鎖定(待主控裁示, 見sgud/state)
    it(`T5: should replace C0, DEL, C1, bidi controls, other format characters and line/paragraph separators in the exposed characters (single rule shared with maskDiagCtrl)`, function() {
        let mk = (c) => `${c}abc${'x'.repeat(24)}def${c}` //n=32, k=4
        for (let cp of [0x00, 0x07, 0x1f, 0x7f, 0x80, 0x85, 0x9f, 0xad, 0x200b, 0x200f, 0x2028, 0x2029, 0x202a, 0x202e, 0x2066, 0x2067, 0x2069, 0x206a, 0x206f, 0xfeff]) {
            let c = String.fromCodePoint(cp)
            assert.strict.deepStrictEqual(maskDiagToken(mk(c)), '?abc...def?(len=32)', cp.toString(16))
        }
        for (let cp of [0x20, 0x7e, 0xa0, 0x2027, 0x202f, 0x2065, 0x4e2d]) {
            let c = String.fromCodePoint(cp)
            assert.strict.deepStrictEqual(maskDiagToken(mk(c)), `${c}abc...def${c}(len=32)`, cp.toString(16))
        }
        assert.strict.deepStrictEqual(maskDiagToken('\u0080bcdefgh'), '?...h(len=8)')
        //頭尾字元之替換即maskDiagCtrl
        let t = '\u202e\u0001ab\u2066cdefghijklmnopqrstuvwxyz\u00ad\u2028'
        let k = Math.min(4, Math.floor(t.length / 8))
        assert.strict.deepStrictEqual([t.length, k], [31, 3])
        assert.strict.deepStrictEqual(maskDiagToken(t), `${maskDiagCtrl(t.slice(0, k))}...${maskDiagCtrl(t.slice(-k))}(len=${t.length})`)
    })

    it(`T1: should count UTF-16 code units (n is length) and keep a split surrogate as is`, function() {
        let t = '😀😀😀😀😀😀😀😀' //16碼元, k=2
        assert.strict.deepStrictEqual(maskDiagToken(t), '😀...😀(len=16)')
        let t2 = 'a😀bcdefgh' //10碼元(😀為2碼元), k=1: 頭'a', 尾'h'
        assert.strict.deepStrictEqual(maskDiagToken(t2), 'a...h(len=10)')
        let t3 = '😀bcdefgh😀' //11碼元, k=1: 頭為高位碼元, 尾為低位碼元(同四份: 依碼元切)
        assert.strict.deepStrictEqual(t3.length, 11)
        assert.strict.deepStrictEqual(maskDiagToken(t3), '\ud83d...\ude00(len=11)')
    })

    it(`T3/T6: arrays keep their length and holes, accessor items are not read, nesting deeper than 8 levels is '(object)', Proxy arrays are not iterated`, function() {
        let a = ['abcdefgh', , 'x'] // eslint-disable-line no-sparse-arrays
        let r = maskDiagToken(a)
        assert.strict.deepStrictEqual([r.length, 1 in r, r[0], r[2]], [3, false, 'a...h(len=8)', '(len=1)'])
        let n = 0
        let acc = ['abcdefgh']
        Object.defineProperty(acc, 1, {
            get: () => {
                n++; return 'SECRET-123456'
            },
            enumerable: true
        })
        assert.strict.deepStrictEqual([maskDiagToken(acc), n], [['a...h(len=8)', '(unreadable)'], 0])
        let deep = 'abcdefgh'
        for (let i = 0; i < 12; i++) {
            deep = [deep]
        }
        let d = maskDiagToken(deep)
        let lv = 0
        while (Array.isArray(d)) {
            d = d[0]
            lv++
        }
        assert.strict.deepStrictEqual([lv, d], [8, '(object)'])
        let traps = 0
        let px = new Proxy(['abcdefgh'], {
            get: () => {
                traps++; return 'SECRET'
            },
            ownKeys: () => {
                traps++; return []
            }
        })
        assert.strict.deepStrictEqual([maskDiagToken(px), traps], ['(object)', 0])
        let big = []
        big.length = 4294967295
        big[5] = 'abcdefgh'
        let rb = maskDiagToken(big)
        assert.strict.deepStrictEqual([rb.length, rb[5]], [4294967295, 'a...h(len=8)'])
    })

    it(`T4/T6: wrapper strings and objects with toString are '(object)' without running user code; revoked Proxy does not throw`, function() {
        let n = 0
        let o = {
            toString: () => {
                n++; return 'SECRET'
            },
            valueOf: () => {
                n++; return 'SECRET'
            }
        }
        let { proxy, revoke } = Proxy.revocable([], {})
        revoke()
        assert.strict.deepStrictEqual([maskDiagToken(new String('abcdefghijklmnop')), maskDiagToken(o), n], ['(object)', '(object)', 0]) // eslint-disable-line no-new-wrappers
        assert.strict.deepStrictEqual(typeof maskDiagToken(proxy), 'string')
    })

})
