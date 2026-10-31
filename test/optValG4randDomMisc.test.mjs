import assert from 'assert'
import domVirtualCreate from '../src/domVirtualCreate.mjs'
import domFadeOut from '../src/domFadeOut.mjs'
import { VALID_STR } from './tools/enumInputs.mjs'
import { defineOptParam } from './tools/optValKit.mjs'
import { mkBrowser } from './tools/domFilesKit.mjs'
import { mkFakeDom, clearFakeDom } from './tools/fakeDom.mjs'
import { probeVirtualSize, probeFade } from './tools/optValG4randDomKit.mjs'


//第221項第二批 g4rand組DOM類(第一級發布A只納入domVirtualCreate、domFadeOut; domConvertToPic、domShowImages、domDrag、domFadeIn屬第二、三級, 其測試不在此)
//  皆為opt類(opt之鍵或程式碼有回退), 非預期之輸入(含超出範圍、Infinity、'0x10'、包裝物件等)視為未給、改用預設, 不報錯; opt有debug/funLog
//  瀏覽器本身之語義(版面、事件派送)非本檔所能驗證, 以假DOM驅動, 只驗各函數對參數的檢測與取值


let NEG_INVALID = [
    ['-1', -1],
    [`'-1'`, '-1'],
    ['-0.5', -0.5],
    [`'-.5'`, '-.5'],
]

//大於等於0之有效字串/數字(VALID_STR去掉負數)
let NONNEG_VALID = VALID_STR.filter(([, , n]) => n >= 0)


describe('optVal domVirtualCreate', function() {

    // opt.width、opt.height: opt類, 有效數字且大於等於0(isenum, use: 'nonnegative'), 非預期視為未給(null, 不設定該尺寸)
    for (let key of ['width', 'height']) {
        defineOptParam({
            fn: 'domVirtualCreate',
            name: `opt.${key}`,
            def: null,
            probe: (v, o) => probeVirtualSize(domVirtualCreate, key, v, o),
            valid: [
                ...NONNEG_VALID.map(([l, v, n]) => [l, v, `${n}px`]),
                ['0', 0, '0px'],
                [`'0'`, '0', '0px'],
                ['1.5', 1.5, '1.5px'],
                [`' 7 '`, ' 7 ', '7px'],
                [`'1e21'`, '1e21', '1e+21px'],
            ],
            extraInvalid: [
                ...NEG_INVALID,
                [`'50%' (string with unit: never applied, same as before)`, '50%'],
                [`' 50% '`, ' 50% '],
                [`'50px'`, '50px'],
                [`'auto'`, 'auto'],
            ],
        })
    }

    it('should set width and height independently, and an unexpected one is not set', function() {
        // 寬高各自檢測: 一者非預期不影響另一者
        let env = mkBrowser()
        try {
            let got = []
            let run = (opt) => {
                domVirtualCreate((ele) => {
                    got.push([ele.style.width === undefined ? null : ele.style.width, ele.style.height === undefined ? null : ele.style.height])
                    return 1
                }, opt).catch(() => {})
            }
            run({ width: 'abc', height: ' 20 ' })
            run({ width: 30, height: -1 })
            run({ width: Infinity, height: '0x10' })
            run({})
            run(null)
            assert.strict.deepStrictEqual(got, [[null, '20px'], ['30px', null], [null, null], [null, null], [null, null]])
        }
        finally {
            env.restore()
        }
    })

    it('should still resolve with the value returned by fun and remove the temporary element', async function() {
        // 其餘行為不變: resolve fun之回傳值、移除臨時元素
        let env = mkBrowser()
        try {
            let r = await domVirtualCreate(async () => 'b64', { width: '100', height: 'x' })
            assert.strict.deepStrictEqual(r, 'b64')
            assert.strict.deepStrictEqual(env.body.children.length, 0)
        }
        finally {
            env.restore()
        }
    })

})


//fade: 第一次更新寫入初始透明度後加減s=10/duration, 第二次更新寫入之值為初始值加減s(夾在0~1); duration為0時s=Infinity(瞬間完成)
for (let [name, fn, expOf] of [
    ['domFadeOut', domFadeOut, (d) => Math.max(1 - 10 / d, 0)],
]) {

    describe(`optVal ${name}`, function() {

        // opt.duration: opt類, 有效數字且大於等於0(isenum, use: 'nonnegative', 0為瞬間完成), 非預期(含負數)改用預設500 (使用者2026-10-31裁定: 非預期或負數用500)
        defineOptParam({
            fn: name,
            name: 'opt.duration',
            def: expOf(500),
            probe: (v, o) => probeFade(fn, v, o),
            valid: [
                ...NONNEG_VALID.map(([l, v, n]) => [l, v, expOf(n)]),
                ['0 (instant)', 0, expOf(0)],
                [`'0'`, '0', expOf(0)],
                ['10', 10, expOf(10)],
                ['100', 100, expOf(100)],
                ['2000.5', 2000.5, expOf(2000.5)],
                [`' 250 '`, ' 250 ', expOf(250)],
            ],
            extraInvalid: NEG_INVALID,
        })

        it('should use 500 (not 0 or 1000) for non-numeric and negative durations, and keep a valid 0 as instant', function() {
            // 現況: 非數字(如'abc')為0(瞬間)、負數為1000; 新: 非預期與負數一律用預設500; 0仍為有效(瞬間完成)
            assert.strict.deepStrictEqual(probeFade(fn, 'abc'), expOf(500))
            assert.strict.deepStrictEqual(probeFade(fn, -5), expOf(500))
            assert.strict.deepStrictEqual(probeFade(fn, 0), 0)
        })

        it('should not read delay as duration and ignore a non-object opt', function() {
            // 其他選項(delay)不在本批, 不受duration影響; opt非物件時用預設
            assert.strict.deepStrictEqual(probeFade(fn, undefined, { delay: 100 }), expOf(500))
            assert.strict.deepStrictEqual(probeFade(fn, 250, { delay: 'x' }), expOf(250))
            assert.doesNotThrow(() => {
                let env = mkFakeDom()
                let ost = globalThis.setTimeout
                globalThis.setTimeout = () => 1
                try {
                    fn(new env.Ele('div'), null)
                    fn(new env.Ele('div'), 'abc')
                }
                finally {
                    globalThis.setTimeout = ost
                    clearFakeDom()
                }
            })
        })

    })

}
