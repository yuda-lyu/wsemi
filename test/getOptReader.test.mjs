import assert from 'assert'
import getOptReader from '../src/getOptReader.mjs'
import isbol from '../src/isbol.mjs'
import isnum from '../src/isnum.mjs'
import isfun from '../src/isfun.mjs'
import parseNumOpt from '../src/_numOpt.mjs'
import { hostileValues, withGetter } from './tools/hostileValues.mjs'


//第663項(排程第492項批11): 公開之opt讀取函數 getOptReader(tag, opt) (dspec〈輸入參數之檢測機制〉§7之opt解析, K3、V5、V11、K9)
//  收錄: 判準1(使用端w-gis、w-ftp、w-dwdata-ftp各自寫一份「讀取拋錯視為未給」之取鍵; w-dwdata-ftp之optReader含debug警告)、判準2(延伸_optVal之警告出口至非數字種類)、判準3(wsemi內opt鍵型別不符改預設者203處); 見sgud/rule/rulebook_judge_nothrow.md R-OPT-READER-01
//  需求(斷言註解以此編號對應):
//  R1 永不拋錯: opt為任意值(含已撤銷之Proxy)、鍵之存取器拋錯、check拋錯皆不拋錯, 讀取拋錯視為未給
//  R2 rd(key, def, check, desc, defDesc): undefined、null取def; check(v)為true才回原值(檢測之值即使用之值, 不轉換); 其餘取def
//  R3 每個鍵於每次rd只讀一次(V11); debug、funLog於建立時讀一次; funLog只於debug為true時讀
//  R4 debug為true(嚴格)時, 非預期輸入另輸出警告, 固定詞彙不含值(K9): '[<tag>] invalid opt.<key>: must be <desc>, using default <defDesc>'; 出口為funLog(msg, { fn, reason, key })或console.warn; 同一tag、同一key每個行程只警告一次
//  R5 rd.read(key): 安全讀取原值(不檢測、不警告)


let hv = hostileValues()
let SECRET = 'SECRET-opt-value-663'


//capture, 暫時攔截console.warn
let capture = (f) => {
    let saved = console.warn
    let out = []
    console.warn = (...a) => out.push(a)
    try {
        f()
    }
    finally {
        console.warn = saved
    }
    return out
}


describe(`getOptReader`, function() {

    beforeEach(function() {
        parseNumOpt.resetWarned()
    })

    afterEach(function() {
        parseNumOpt.resetWarned()
    })

    describe(`R1 永不拋錯`, function() {

        for (let h of hv) {
            it(`opt為 ${h.name}: 不拋錯, 各鍵視為未給(取預設), debug為false`, function() {
                let rd = null
                assert.doesNotThrow(() => {
                    rd = getOptReader('t', h.value)
                })
                let r = null
                assert.doesNotThrow(() => {
                    r = [rd('k663', 5, isnum, 'a number', '5'), rd.read('k663'), rd.debug, rd.funLog] //惡意值夾具之目標物件含鍵a(可讀), 故用夾具中不存在之鍵k663
                })
                assert.ok(r[0] === 5 && r[1] === undefined && r[2] === false && r[3] === null, `reader for ${h.name}`)
            })
        }

        it(`opt為非物件(undefined、null、數字、字串、布林)與函數: 不拋錯; 函數視為物件可讀其屬性`, function() {
            for (let v of [undefined, null, 5, 'abc', true, Symbol('s'), 10n]) {
                let rd = getOptReader('t', v)
                assert.strict.deepStrictEqual([rd('a', 'd', (x) => typeof x === 'string', 'a string', `'d'`), rd.read('length'), rd.debug], ['d', undefined, false])
            }
            let f = () => {}
            f.a = 'fromFunction'
            assert.strict.deepStrictEqual(getOptReader('t', f).read('a'), 'fromFunction')
        })

        it(`鍵之存取器拋錯視為未給(取預設), 其餘鍵照常; debug之存取器拋錯視為false; funLog之存取器拋錯視為null`, function() {
            let rd = getOptReader('t', withGetter({ b: 7 }, 'a'))
            assert.strict.deepStrictEqual([rd('a', 1, isnum, 'a number', '1'), rd('b', 1, isnum, 'a number', '1'), rd.read('a'), rd.read('b')], [1, 7, undefined, 7])
            let rd2 = getOptReader('t', withGetter({ a: 7 }, 'debug'))
            assert.strict.deepStrictEqual([rd2.debug, rd2('a', 1, isnum, 'a number', '1')], [false, 7])
            let rd3 = getOptReader('t', withGetter({ debug: true }, 'funLog'))
            assert.strict.deepStrictEqual([rd3.debug, rd3.funLog], [true, null])
        })

        it(`check拋錯、check回傳非true、check非函數(程式誤用)皆視為非預期(取預設)`, function() {
            let rd = getOptReader('t', { a: 3 })
            assert.strict.deepStrictEqual(rd('a', 'd', () => {
                throw new Error(SECRET)
            }, 'x', `'d'`), 'd')
            assert.strict.deepStrictEqual(rd('a', 'd', () => 1, 'x', `'d'`), 'd') //須恰為true
            assert.strict.deepStrictEqual(rd('a', 'd', undefined, 'x', `'d'`), 'd')
            assert.strict.deepStrictEqual(rd('a', 'd', 'notfun', 'x', `'d'`), 'd')
        })

        it(`警告字樣之淨化: tag、key、desc內之C0與C1控制字元、零寬與方向控制字元、孤立代理碼元換成?; 截斷不留孤立代理碼元; tag與key含分隔字元不使去重碰撞`, function() {
            let out = []
            let funLog = (m, info) => out.push([m, info])
            let tag = `a\u{85}b\u{2028}c\u{202e}d\u{200b}e\u{9f}f\u{7f}g\u{0}h`
            getOptReader(tag, { debug: true, funLog, k: 'x' })('k', 1, isnum, 'a\u{2029}number', '1')
            assert.strict.deepStrictEqual(out[0][0], '[a?b?c?d?e?f?g?h] invalid opt.k: must be a?number, using default 1')
            assert.strict.deepStrictEqual(out[0][1], { fn: 'a?b?c?d?e?f?g?h', reason: 'invalid', key: 'k' })
            //截斷於代理對之中間(第64字元為高代理, 其低代理被截掉): 不留孤立代理碼元
            let out2 = []
            let tag2 = 'x'.repeat(63) + '\u{1f600}'
            getOptReader(tag2, { debug: true, funLog: (m) => out2.push(m), k: 'x' })('k', 1, isnum, 'a number', '1')
            assert.strict.deepStrictEqual(out2, [`[${'x'.repeat(63)}?] invalid opt.k: must be a number, using default 1`])
            //去重id: tag為'a|b'、key為'c'與tag為'a'、key為'b|c'為不同項
            let out3 = []
            let fl = (m) => out3.push(m)
            getOptReader('a|b', { debug: true, funLog: fl, c: 'x' })('c', 1, isnum, 'a number', '1')
            getOptReader('a', { 'debug': true, 'funLog': fl, 'b|c': 'x' })('b|c', 1, isnum, 'a number', '1')
            assert.strict.deepStrictEqual(out3.length, 2)
        })

        it(`tag非有效字串(空字串、非字串)時label前綴改用'opt'; 過長之tag只取前64字元`, function() {
            let out = []
            let funLog = (m) => out.push(m)
            for (let tg of ['', 5, null, undefined, {}]) {
                getOptReader(tg, { debug: true, funLog, a: 'x' })('a', 1, isnum, 'a number', '1')
                parseNumOpt.resetWarned()
            }
            assert.strict.deepStrictEqual(out, new Array(5).fill('[opt] invalid opt.a: must be a number, using default 1'))
            let long = 'x'.repeat(100)
            let out2 = []
            getOptReader(long, { debug: true, funLog: (m) => out2.push(m), a: 'x' })('a', 1, isnum, 'a number', '1')
            assert.strict.deepStrictEqual(out2, [`[${'x'.repeat(64)}] invalid opt.a: must be a number, using default 1`])
        })

    })

    describe(`R2 取值與預設`, function() {

        it(`undefined、null取預設; 有效值原樣回傳(不轉換: 字串'5'經isnum仍為字串'5'); 無效取預設`, function() {
            let rd = getOptReader('t', { u: undefined, n: null, ok: 5, str: '5', bad: 'abc', f: false, z: 0, e: '' })
            assert.strict.deepStrictEqual(rd('u', 1, isnum, 'a number', '1'), 1)
            assert.strict.deepStrictEqual(rd('n', 1, isnum, 'a number', '1'), 1)
            assert.strict.deepStrictEqual(rd('miss', 1, isnum, 'a number', '1'), 1)
            assert.strict.deepStrictEqual(rd('ok', 1, isnum, 'a number', '1'), 5)
            assert.strict.deepStrictEqual(rd('str', 1, isnum, 'a number', '1'), '5')
            assert.strict.deepStrictEqual(rd('bad', 1, isnum, 'a number', '1'), 1)
            //null為未給: 即使check全收(含null), 仍取預設且不警告(K3: opt與各鍵為undefined或null時取預設)
            let out = capture(() => {
                let rd2 = getOptReader('t', { debug: true, n: null })
                assert.strict.deepStrictEqual(rd2('n', 1, () => true, 'anything', '1'), 1)
                assert.strict.deepStrictEqual(rd2('n', 1, isnum, 'a number', '1'), 1)
            })
            assert.strict.deepStrictEqual(out, [])
            //假值: false、0、''為給了之值, 經check判定(isbol收false、isnum收0), 不被當未給
            assert.strict.deepStrictEqual([rd('f', true, isbol, 'a boolean', 'true'), rd('z', 9, isnum, 'a number', '9'), rd('e', 'd', (x) => typeof x === 'string', 'a string', `'d'`)], [false, 0, ''])
            assert.strict.deepStrictEqual([rd('f', 1, isnum, 'a number', '1'), rd('z', 'd', isbol, 'a boolean', `'d'`)], [1, 'd'])
        })

        it(`每個鍵於每次讀取只讀一次(V11); debug、funLog於建立時讀一次, funLog僅debug為true時才讀`, function() {
            let reads = { a: 0, debug: 0, funLog: 0 }
            let mk = (o) => {
                let t = { ...o }
                for (let k of Object.keys(reads)) {
                    let v = t[k]
                    Object.defineProperty(t, k, {
                        enumerable: true,
                        get() {
                            reads[k] += 1
                            return v
                        },
                    })
                }
                return t
            }
            let rd = getOptReader('t', mk({ a: 3 }))
            rd('a', 1, isnum, 'a number', '1')
            assert.strict.deepStrictEqual(reads, { a: 1, debug: 1, funLog: 0 })
            rd.read('a')
            assert.strict.deepStrictEqual(reads, { a: 2, debug: 1, funLog: 0 })
            reads = { a: 0, debug: 0, funLog: 0 }
            let rd2 = getOptReader('t', mk({ a: 'x', debug: true, funLog: () => {} }))
            rd2('a', 1, isnum, 'a number', '1')
            assert.strict.deepStrictEqual(reads, { a: 1, debug: 1, funLog: 1 })
        })

    })

    describe(`R4 debug警告`, function() {

        it(`debug為false(含未給、'true'、1、包裝物件)時非預期輸入靜默改用預設, 不警告`, function() {
            for (let dbg of [undefined, false, 'true', 1, 'yes', new Boolean(true)]) { // eslint-disable-line no-new-wrappers
                let out = capture(() => {
                    let rd = getOptReader('t', { debug: dbg, a: 'x' })
                    assert.strict.deepStrictEqual(rd('a', 1, isnum, 'a number', '1'), 1)
                })
                assert.strict.deepStrictEqual(out, [])
            }
        })

        it(`debug為true: 非預期輸入警告(console.warn), 訊息為固定詞彙且不含輸入值; 同一tag同一key只警告一次(跨建立之reader)`, function() {
            let out = capture(() => {
                let rd = getOptReader('w-demo fn1', { debug: true, a: SECRET })
                assert.strict.deepStrictEqual(rd('a', 1, isnum, 'a number', '1'), 1)
                assert.strict.deepStrictEqual(rd('a', 1, isnum, 'a number', '1'), 1)
                let rd2 = getOptReader('w-demo fn1', { debug: true, a: SECRET })
                rd2('a', 1, isnum, 'a number', '1')
            })
            assert.strict.deepStrictEqual(out, [['[w-demo fn1] invalid opt.a: must be a number, using default 1']])
            assert.ok(!JSON.stringify(out).includes(SECRET), 'the message must not echo the value')
        })

        it(`不同tag、不同key各警告一次; 有效值與未給不警告`, function() {
            let out = capture(() => {
                getOptReader('t1', { debug: true, a: 'x', b: 'y', c: 3 })
                let rd1 = getOptReader('t1', { debug: true, a: 'x', b: 'y', c: 3 })
                rd1('a', 1, isnum, 'a number', '1')
                rd1('b', 1, isnum, 'a number', '1')
                rd1('c', 1, isnum, 'a number', '1')
                rd1('none', 1, isnum, 'a number', '1')
                getOptReader('t2', { debug: true, a: 'x' })('a', 1, isnum, 'a number', '1')
            })
            assert.strict.deepStrictEqual(out.map((a) => a[0]), [
                '[t1] invalid opt.a: must be a number, using default 1',
                '[t1] invalid opt.b: must be a number, using default 1',
                '[t2] invalid opt.a: must be a number, using default 1',
            ])
        })

        it(`funLog為函數時警告只交給它(msg, { fn, reason, key }), 不寫console; funLog非函數時改用console.warn; funLog之同步拋錯與回傳rejection皆忽略`, async function() {
            let got = []
            let out = capture(() => {
                getOptReader('t', { debug: true, funLog: (msg, info) => got.push([msg, info]), a: 'x' })('a', 1, isnum, 'a number', '1')
            })
            assert.strict.deepStrictEqual(out, [])
            assert.strict.deepStrictEqual(got, [['[t] invalid opt.a: must be a number, using default 1', { fn: 't', reason: 'invalid', key: 'a' }]])

            let out2 = capture(() => {
                getOptReader('t2', { debug: true, funLog: 'notfun', a: 'x' })('a', 1, isnum, 'a number', '1')
            })
            assert.strict.deepStrictEqual(out2.length, 1)

            let unhandled = []
            let on = (v) => unhandled.push(v)
            process.on('unhandledRejection', on)
            try {
                let funThrow = () => {
                    throw new Error(SECRET)
                }
                let funReject = () => Promise.reject(new Error(SECRET))
                getOptReader('t3', { debug: true, funLog: funThrow, a: 'x' })('a', 1, isnum, 'a number', '1')
                getOptReader('t4', { debug: true, funLog: funReject, a: 'x' })('a', 1, isnum, 'a number', '1')
                await new Promise((resolve) => setImmediate(resolve))
                await new Promise((resolve) => setImmediate(resolve))
            }
            finally {
                process.off('unhandledRejection', on)
            }
            assert.strict.deepStrictEqual(unhandled, [])
        })

        it(`desc、defDesc非字串時改用固定詞彙; 訊息只含tag、key、desc、defDesc`, function() {
            let out = capture(() => {
                getOptReader('t', { debug: true, a: 'x' })('a', 1, isnum, undefined, undefined)
            })
            assert.strict.deepStrictEqual(out.map((a) => a[0]), ['[t] invalid opt.a: must be a valid value, using default the default'])
        })

    })

    describe(`R5 rd.read`, function() {

        it(`rd.read回傳原值(不檢測、不警告、不改用預設), 未給為undefined, 讀取拋錯為undefined`, function() {
            let out = capture(() => {
                let rd = getOptReader('t', { debug: true, a: SECRET, n: null, o: { x: 1 } })
                assert.strict.deepStrictEqual([rd.read('a'), rd.read('n'), rd.read('o'), rd.read('none')], [SECRET, null, { x: 1 }, undefined])
            })
            assert.strict.deepStrictEqual(out, [])
        })

    })

    describe(`公開性與重設`, function() {

        it(`getOptReader為函數, 具resetWarned(供測試重設已警告之紀錄)`, function() {
            assert.ok(isfun(getOptReader) && isfun(getOptReader.resetWarned))
            let out = capture(() => {
                getOptReader('t', { debug: true, a: 'x' })('a', 1, isnum, 'a number', '1')
                getOptReader.resetWarned()
                getOptReader('t', { debug: true, a: 'x' })('a', 1, isnum, 'a number', '1')
            })
            assert.strict.deepStrictEqual(out.length, 2)
        })

    })

})
