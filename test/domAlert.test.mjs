/* eslint-disable no-new-wrappers -- 測試刻意以包裝物件驗證非預期之輸入 */
import assert from 'assert'
import { mock } from 'node:test'
import { mkBrowserFake, clearBrowserFake, track, flush } from './tools/browserFakeKit.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉§11 Q1-g〈domAlert〔使用者2026-11-12定:「domAlert D1~D7依你建議」〕〉
//  D1 msg無效不顯示、回已完成之Promise; D2 opt非物件視為{}; D3 time須為有限且非負之數字否則預設4000; D4 按✕亦resolve(先resolve再移除);
//  D5 數值類opt逐一檢查、無效用該欄預設; D5b paddingStyle(及closeIconShift)部分給鍵其餘保留預設; D6 行為不改(HTML插入); D7 ✕以addEventListener綁定、移除行內事件與全域ttWAlert*
//以最小假window/document(test/tools/browserFakeKit.mjs)觀察元素、樣式字串與事件; 計時以假時鐘(mock.timers之setInterval、setTimeout、Date), 以「推進虛擬時間後Promise是否已完成」判定, 不以真實延時
//domAlert有模組層之佇列與計時器, 每案以查詢字串載入新的模組實例(互不影響); 外觀、版面與淡入淡出之實際呈現另以真Chromium實測


let nLoad = 0
async function load() {
    nLoad++
    return (await import(`../src/domAlert.mjs?ws430=${nLoad}`)).default
}


//styleTexts, 彈窗內全部樣式字串(元素之style屬性, 及innerHTML內之style="..."), 去多餘空白; 與DOM建構方式無關
function styleTexts(root) {
    let out = []
    let walk = (e) => {
        let s = e.getAttribute('style')
        if (s !== null) {
            out.push(s)
        }
        for (let m of String(e.innerHTML).matchAll(/style="([^"]*)"/g)) {
            out.push(m[1])
        }
        for (let c of e.children) {
            walk(c)
        }
    }
    walk(root)
    return out.map((s) => s.replace(/\s+/g, ' ').trim())
}


//allHtml, 彈窗內全部innerHTML字串
function allHtml(root) {
    let out = String(root.innerHTML)
    for (let c of root.children) {
        out += allHtml(c)
    }
    return out
}


//findCancel, 關閉按鈕(id為alt-開頭且非彈窗本身之元素)
function findCancel(panel) {
    return panel.find((e) => typeof e.id === 'string' && e.id.startsWith('alt-') && e.id !== panel.id)
}


describe(`domAlert`, function() {

    let env = null
    let act = null //存活之setInterval
    let si = null
    let ci = null

    beforeEach(function() {
        env = mkBrowserFake()
        mock.timers.enable({ apis: ['setInterval', 'setTimeout', 'Date'], now: 0 })
        si = globalThis.setInterval
        ci = globalThis.clearInterval
        act = new Set()
        globalThis.setInterval = (fn, ms) => {
            let id = si(fn, ms)
            act.add(id)
            return id
        }
        globalThis.clearInterval = (id) => {
            act.delete(id)
            return ci(id)
        }
    })

    afterEach(function() {
        globalThis.setInterval = si
        globalThis.clearInterval = ci
        mock.timers.reset()
        clearBrowserFake()
        env = null
    })

    //正常用法: 時間到resolve並移除, 計時器停止(行為不改)
    it(`should show a panel, resolve after opt.time(1000ms) and remove the panel, then stop the interval [正常用法]`, async function() {
        let domAlert = await load()
        let st = track(domAlert('msg', { time: 1000 }))
        let n0 = env.body.children.length
        mock.timers.tick(950)
        await flush()
        let v1 = st.v
        mock.timers.tick(150)
        await flush()
        assert.strict.deepStrictEqual([n0, v1, st.v, env.body.children.length, act.size], [1, 'pending', 'resolved', 0, 0])
    })

    //D1 msg非非空字串: 不顯示、回已完成之Promise(修前: 回undefined)
    it(`should not show and return a resolved Promise when msg is not a non-empty string [D1]`, async function() {
        let domAlert = await load()
        //包裝字串(規格§3.4 S1)與不可讀之Proxy、拋錯之存取器亦無效, 仍回已完成之Promise而不拋錯(外審terra 3、4)
        let pr = Proxy.revocable({}, {})
        pr.revoke()
        let throwingTag = {
            get [Symbol.toStringTag]() {
                throw new Error('SENSITIVE')
            },
        }
        let vs = [undefined, null, '', 123, {}, [], new String(''), new String('x'), pr.proxy, throwingTag]
        let sts = vs.map((v) => track(domAlert(v)))
        await flush()
        assert.strict.deepStrictEqual([sts.map((s) => s.v), env.body.children.length, act.size], [vs.map(() => 'resolved'), 0, 0])
    })

    //D2 opt非物件視為{}(修前: opt=null拋TypeError)
    it(`should treat non-object opt(null, string, number, array) as {} [D2]`, async function() {
        let domAlert = await load()
        let out = []
        for (let o of [null, 'abc', 123, [], true]) {
            let r = null
            try {
                r = track(domAlert('msg', o)).v
            }
            catch (err) {
                r = 'throw'
            }
            out.push(r)
        }
        let sts = styleTexts(env.body.children[0] || env.body)
        assert.strict.deepStrictEqual([out, env.body.children.length, sts.includes('position:relative; padding:14px 26px 14px 14px;')], [['pending', 'pending', 'pending', 'pending', 'pending'], 5, true])
        mock.timers.tick(5000)
    })

    //D2、V11: opt為不可讀之Proxy視為{}; opt之鍵讀取拋錯視為未給而用該欄預設(外審terra 4)
    it(`should treat an unreadable opt(revoked Proxy) as {} and a throwing getter of a key as not given [D2, V11]`, async function() {
        let domAlert = await load()
        let pr = Proxy.revocable({}, {})
        pr.revoke()
        let r1 = 'pending'
        try {
            r1 = track(domAlert('a', pr.proxy)).v
        }
        catch (err) {
            r1 = 'throw'
        }
        let opt = {
            get time() {
                throw new Error('SENSITIVE')
            },
            get borderWidth() {
                throw new Error('SENSITIVE')
            },
            get position() {
                throw new Error('SENSITIVE')
            },
        }
        let st = 'pending'
        try {
            st = track(domAlert('b', opt))
        }
        catch (err) {
            st = { v: 'throw' }
        }
        let p2 = env.body.children[1]
        let s = p2 ? styleTexts(p2)[0] : ''
        mock.timers.tick(3950)
        await flush()
        let v1 = st.v
        mock.timers.tick(200)
        await flush()
        assert.strict.deepStrictEqual([r1, s.includes('border:1px solid'), p2 ? p2.style.right : null, v1, st.v], ['pending', true, '16px', 'pending', 'resolved'])
    })

    //D2: 帶自訂Symbol.toStringTag之一般物件仍為設定物件(同修前; 外審terra複核N4), 陣列視為{}
    it(`should treat a plain object with a custom Symbol.toStringTag as opt, and an array as {} [D2, 外審terra複核N4]`, async function() {
        let domAlert = await load()
        domAlert('a', { [Symbol.toStringTag]: 'MyOptions', position: 'bottom-left' })
        let arr = []
        arr.position = 'bottom-left'
        domAlert('b', arr)
        let [p1, p2] = env.body.children
        assert.strict.deepStrictEqual([p1.style.left, p1.style.bottom, p2.style.right, p2.style.top], ['16px', '16px', '16px', '16px'])
        mock.timers.tick(5000)
    })

    //V11: 數值類opt之debug於全部鍵讀完後才讀一次(外審terra第5條: debug之存取器不得影響其後鍵之讀取)
    it(`should read opt.debug at most once and only after all numeric opts are read [V11, 外審terra 5]`, async function() {
        let parseNumOpt = (await import('../src/_numOpt.mjs')).default
        parseNumOpt.resetWarned()
        let domAlert = await load()
        let order = []
        let ms = []
        let opt = {
            get time() {
                order.push('time')
                return 'bad'
            },
            get borderWidth() {
                order.push('borderWidth')
                return this._bw
            },
            _bw: 2,
            get debug() {
                order.push('debug')
                this._bw = 99 //若早於borderWidth讀取即會改變其值
                return true
            },
            funLog: (m) => ms.push(m),
        }
        domAlert('a', opt)
        let s = styleTexts(env.body.children[0])[0]
        assert.strict.deepStrictEqual([order.filter((k) => k === 'debug').length, order.indexOf('debug') > order.indexOf('borderWidth'), s.includes('border:2px solid'), ms.filter((m) => m.startsWith('[wsemi domAlert] invalid opt.time')).length], [1, true, true, 1])
        parseNumOpt.resetWarned()
        mock.timers.tick(5000)
    })

    it(`should not read opt.debug when all numeric opts are valid [V11]`, async function() {
        let domAlert = await load()
        let n = 0
        domAlert('a', {
            time: 1000,
            borderWidth: 2,
            get debug() {
                n++
                return true
            },
        })
        assert.strict.deepStrictEqual(n, 0)
        mock.timers.tick(5000)
    })

    //D3 time非有限或為負: 用預設4000(修前: NaN、Infinity永不自動關閉、全域計時器空轉)
    it(`should use default 4000ms when opt.time is NaN, Infinity, -Infinity, negative, non-numeric or a wrapper object [D3]`, async function() {
        let vs = [NaN, Infinity, -Infinity, -1, 'abc', {}, new Number(100), '0x10']
        let out = []
        for (let v of vs) {
            let domAlert = await load()
            let st = track(domAlert('msg', { time: v }))
            mock.timers.tick(3950)
            await flush()
            let v1 = st.v
            mock.timers.tick(200)
            await flush()
            out.push([v1, st.v, act.size])
        }
        assert.strict.deepStrictEqual(out, vs.map(() => ['pending', 'resolved', 0]))
    })

    //D3 time為數字字串(有效數字, 同R-OPT-VAL-01之K4: 數值輸入支援字串型數字): 採用其值(修前: 非number型別一律4000)
    it(`should accept a numeric string opt.time('100') as 100ms [D3, K4]`, async function() {
        let domAlert = await load()
        let st = track(domAlert('msg', { time: '100' }))
        mock.timers.tick(200)
        await flush()
        assert.strict.deepStrictEqual([st.v, act.size], ['resolved', 0])
    })

    //D3 time為0: 有效(非負), 於下一次偵測即關閉(行為不改)
    it(`should accept opt.time 0 and close at the next detection [D3 非負]`, async function() {
        let domAlert = await load()
        let st = track(domAlert('msg', { time: 0 }))
        mock.timers.tick(100)
        await flush()
        assert.strict.deepStrictEqual(st.v, 'resolved')
    })

    //D4 按✕關閉: 先resolve再移除(修前: Promise永不完成); 以事件同步(click後只執行微任務, 不推進時間)
    it(`should resolve the returned Promise when the close button(✕) is clicked, then remove the panel [D4]`, async function() {
        let domAlert = await load()
        let st = track(domAlert('msg', { time: 4000 }))
        let st2 = track(domAlert('msg2', { time: 4000 }))
        let panel = env.body.children[0]
        let btn = findCancel(panel)
        assert.ok(btn, 'close button element exists')
        btn.click()
        let connected = panel.isConnected
        await flush()
        //只關閉被按之彈窗, 另一則不受影響
        assert.strict.deepStrictEqual([st.v, connected, st2.v, env.body.children.length], ['resolved', false, 'pending', 1])
        mock.timers.tick(5000)
        await flush()
        assert.strict.deepStrictEqual([st2.v, env.body.children.length, act.size], ['resolved', 0, 0])
    })

    it(`should resolve before removing the panel when the close button is clicked [D4 先resolve再移除]`, async function() {
        let domAlert = await load()
        let p = domAlert('msg', { time: 4000 })
        let panel = env.body.children[0]
        let order = []
        let r0 = p.resolve
        p.resolve = (...args) => {
            order.push(['resolve', panel.isConnected])
            return r0(...args)
        }
        findCancel(panel).click()
        order.push(['after', panel.isConnected])
        assert.strict.deepStrictEqual(order, [['resolve', true], ['after', false]])
    })

    it(`should ignore later timeout after the close button closed it(no error, resolved once) [D4]`, async function() {
        let domAlert = await load()
        let p = domAlert('msg', { time: 1000 })
        let n = 0
        p.then(() => {
            n++
        })
        findCancel(env.body.children[0]).click()
        mock.timers.tick(3000)
        await flush()
        assert.strict.deepStrictEqual([n, env.body.children.length, act.size], [1, 0, 0])
    })

    //預設樣式(行為不改)
    it(`should render default styles unchanged [D5 預設, 外觀不變]`, async function() {
        let domAlert = await load()
        domAlert('msg')
        let sts = styleTexts(env.body.children[0])
        let e = [
            'display:inline-block; color:#000; background:#fff; border:1px solid #ebeef5; border-radius:8px; box-shadow:0 2px 12px 0 rgba(0,0,0,.1);',
            'position:relative; padding:14px 26px 14px 14px;',
            'display:flex; align-items:center;',
            'margin-right:10px;',
            'display:flex;',
            'position:absolute; top:10px; right:10px;',
            'display:flex; cursor:pointer; opacity:0;',
        ]
        assert.strict.deepStrictEqual(e.filter((s) => !sts.includes(s)), [])
        mock.timers.tick(5000)
    })

    //D5 數值類opt逐一檢查, 無效用該欄預設(修前: 原樣寫入樣式如'xpx'、'[object Object]px')
    it(`should use default 1 for invalid opt.borderWidth and default 8 for invalid opt.borderRadius [D5]`, async function() {
        let vs = ['x', {}, NaN, Infinity, -1, '0x10', new Number(2), [], true]
        let out = []
        for (let v of vs) {
            let domAlert = await load()
            domAlert('msg', { borderWidth: v, borderRadius: v })
            let s = styleTexts(env.body.children[env.body.children.length - 1])[0]
            out.push([s.includes('border:1px solid #ebeef5;'), s.includes('border-radius:8px;')])
            mock.timers.tick(5000)
        }
        assert.strict.deepStrictEqual(out, vs.map(() => [true, true]))
    })

    it(`should accept valid numbers(including 0 and numeric strings) for opt.borderWidth and opt.borderRadius [D5 有效值]`, async function() {
        let domAlert = await load()
        domAlert('msg', { borderWidth: 15, borderRadius: 0 })
        domAlert('msg', { borderWidth: '2', borderRadius: '3.5' })
        let s1 = styleTexts(env.body.children[0])[0]
        let s2 = styleTexts(env.body.children[1])[0]
        assert.strict.deepStrictEqual([s1.includes('border:15px solid'), s1.includes('border-radius:0px;'), s2.includes('border:2px solid'), s2.includes('border-radius:3.5px;')], [true, true, true, true])
        mock.timers.tick(5000)
    })

    it(`should use each key's default for invalid keys of opt.paddingStyle, and defaults for non-object opt.paddingStyle [D5]`, async function() {
        let cs = [
            [{ top: 'abc', left: {} }, 'padding:14px 26px 14px 14px;'],
            [{ top: NaN, right: Infinity, bottom: -1, left: '0x10' }, 'padding:14px 26px 14px 14px;'],
            ['abc', 'padding:14px 26px 14px 14px;'],
            [123, 'padding:14px 26px 14px 14px;'],
            [{ top: '3', right: 0 }, 'padding:3px 0px 14px 14px;'],
        ]
        let out = []
        for (let [v] of cs) {
            let domAlert = await load()
            domAlert('msg', { paddingStyle: v })
            out.push(styleTexts(env.body.children[env.body.children.length - 1])[1])
            mock.timers.tick(5000)
        }
        assert.strict.deepStrictEqual(out, cs.map(([, e]) => `position:relative; ${e}`))
    })

    //D5b paddingStyle部分給鍵其餘保留預設(修前: 其餘變0)
    it(`should keep defaults for keys not given in opt.paddingStyle [D5b]`, async function() {
        let domAlert = await load()
        domAlert('msg', { paddingStyle: { top: 5 } })
        domAlert('msg', { paddingStyle: { right: 2, left: 7 } })
        let a = styleTexts(env.body.children[0])[1]
        let b = styleTexts(env.body.children[1])[1]
        assert.strict.deepStrictEqual([a, b], ['position:relative; padding:5px 26px 14px 14px;', 'position:relative; padding:14px 2px 14px 7px;'])
        mock.timers.tick(5000)
    })

    //D5 closeIconShift各鍵逐一檢查(可為負), D5b部分給鍵其餘保留預設; 同軸已給有效值者不套另一端之預設(保留置於左下等之用法)
    it(`should check each key of opt.closeIconShift and keep defaults(top:10, right:10) for keys not given, except the opposite key on the same axis [D5, D5b]`, async function() {
        let cs = [
            [{ top: 5 }, 'position:absolute; top:5px; right:10px;'],
            [{ right: 20 }, 'position:absolute; top:10px; right:20px;'],
            [{ top: '5px', right: NaN }, 'position:absolute; top:10px; right:10px;'],
            [{ top: Infinity, right: {} }, 'position:absolute; top:10px; right:10px;'],
            [{ bottom: 5, left: 6 }, 'position:absolute; bottom:5px; left:6px;'],
            [{ bottom: 5 }, 'position:absolute; right:10px; bottom:5px;'],
            [{ top: -3, right: '-4' }, 'position:absolute; top:-3px; right:-4px;'],
            [{}, 'position:absolute; top:10px; right:10px;'],
            ['abc', 'position:absolute; top:10px; right:10px;'],
            [null, 'position:absolute; top:10px; right:10px;'],
            [{ top: 'x', bottom: 5 }, 'position:absolute; right:10px; bottom:5px;'], //無效之top視為未給, 有效之bottom使top不套預設(外審terra 18)
            [{ top: 1, bottom: 2, left: 3, right: 4 }, 'position:absolute; top:1px; right:4px; bottom:2px; left:3px;'], //兩端皆有效者皆設
            [{ left: 6 }, 'position:absolute; top:10px; left:6px;'],
        ]
        let out = []
        for (let [v] of cs) {
            let domAlert = await load()
            domAlert('msg', { closeIconShift: v })
            let sts = styleTexts(env.body.children[env.body.children.length - 1])
            out.push(sts.find((s) => s.startsWith('position:absolute;')))
            mock.timers.tick(5000)
        }
        assert.strict.deepStrictEqual(out, cs.map(([, e]) => e))
    })

    //D6 行為不改: msg與icon以HTML插入
    it(`should insert msg and opt.icon as HTML unchanged [D6 行為不改]`, async function() {
        let domAlert = await load()
        domAlert('<b>bold</b>', { icon: '<i>ic</i>' })
        let h = allHtml(env.body.children[0])
        assert.strict.deepStrictEqual([h.includes('<div><b>bold</b></div>'), h.includes('<i>ic</i>')], [true, true])
        mock.timers.tick(5000)
    })

    //D7 移除掛於全域之ttWAlert*與行內事件屬性(修前: 載入即掛於全域, ✕與移入移出以onclick/onmouseenter/onmouseleave呼叫)
    it(`should not define global ttWAlertCancel/ttWAlertFadeIn/ttWAlertFadeOut [D7]`, async function() {
        //保存既有之全域描述符(同行程他檔可能載入修前版), 測完還原(外審terra 12)
        let ks = ['ttWAlertCancel', 'ttWAlertFadeIn', 'ttWAlertFadeOut']
        let ds = ks.map((k) => Object.getOwnPropertyDescriptor(globalThis, k))
        try {
            for (let k of ks) {
                delete globalThis[k]
                delete env.window[k]
            }
            let domAlert = await load()
            domAlert('msg')
            assert.strict.deepStrictEqual(ks.filter((k) => k in globalThis || k in env.window), [])
            mock.timers.tick(5000)
        }
        finally {
            ks.forEach((k, i) => {
                delete globalThis[k]
                if (ds[i] !== undefined) {
                    Object.defineProperty(globalThis, k, ds[i])
                }
            })
        }
    })

    it(`should not use inline event handler attributes(onclick, onmouseenter, onmouseleave) [D7]`, async function() {
        let domAlert = await load()
        domAlert('msg')
        let panel = env.body.children[0]
        let attrs = []
        let walk = (e) => {
            for (let k of e.attrs.keys()) {
                attrs.push(k)
            }
            for (let c of e.children) {
                walk(c)
            }
        }
        walk(panel)
        assert.strict.deepStrictEqual([attrs.filter((k) => /^on/i.test(k)), /\son[a-z]+\s*=/i.test(allHtml(panel))], [[], false])
        mock.timers.tick(5000)
    })

    it(`should bind the close button with addEventListener('click') and fade it in/out on mouseenter/mouseleave of the box [D7, 淡入淡出不變]`, async function() {
        let domAlert = await load()
        domAlert('msg', { time: 4000 })
        let panel = env.body.children[0]
        let btn = findCancel(panel)
        assert.ok(btn, 'close button element exists')
        let box = panel.children[0]
        let ns = [btn.nListeners('click'), box.nListeners('mouseenter'), box.nListeners('mouseleave')]
        //淡入淡出於事件當下才建立計時器(setTimeout再setInterval), 假時鐘以小步推進使其依序觸發
        let advance = (ms) => {
            for (let t = 0; t < ms; t += 10) {
                mock.timers.tick(10)
            }
        }
        box.dispatch('mouseenter')
        advance(700)
        let o1 = btn.style.opacity
        box.dispatch('mouseleave')
        advance(700)
        let o2 = btn.style.opacity
        assert.strict.deepStrictEqual([ns, o1, o2], [[1, 1, 1], 1, 0])
        mock.timers.tick(5000)
    })

    //多則排列不變: 同位置依開始時間由上而下間距16px; 關閉其一後其餘上移
    it(`should stack panels at the same position and move up the rest after one is closed by the close button [多則排列不變, D4]`, async function() {
        let domAlert = await load()
        domAlert('a', { time: 4000 })
        mock.timers.tick(10)
        domAlert('b', { time: 4000 })
        let [p1, p2] = env.body.children
        let t0 = [p1.style.top, p2.style.top, p1.style.right, p2.style.right]
        findCancel(p1).click()
        let t1 = [env.body.children.length, p2.style.top]
        assert.strict.deepStrictEqual([t0, t1], [['16px', '72px', '16px', '16px'], [1, '16px']])
        mock.timers.tick(5000)
    })

    it(`should place panels by opt.position(bottom-left) unchanged [位置不變]`, async function() {
        let domAlert = await load()
        domAlert('a', { position: 'bottom-left' })
        let p = env.body.children[0]
        assert.strict.deepStrictEqual([p.style.bottom, p.style.left, p.style.position, p.style.zIndex], ['16px', '16px', 'fixed', 200000])
        mock.timers.tick(5000)
    })

    //opt.debug: 非預期之數值類opt改用預設時警告, 固定詞彙不含值(R-OPT-VAL-01規則5)
    it(`should warn via opt.funLog without the input value when a numeric opt is invalid and opt.debug is true [R-OPT-VAL-01 debug]`, async function() {
        let parseNumOpt = (await import('../src/_numOpt.mjs')).default
        parseNumOpt.resetWarned()
        let domAlert = await load()
        let ms = []
        domAlert('msg', { time: 'SECRET-T', borderWidth: 'SECRET-B', debug: true, funLog: (m) => ms.push(m) })
        domAlert('msg', { time: 'abc' }) //未給debug不警告
        assert.strict.deepStrictEqual([
            ms.filter((m) => m.startsWith('[wsemi domAlert] invalid opt.time: must be')).length,
            ms.filter((m) => m.startsWith('[wsemi domAlert] invalid opt.borderWidth: must be')).length,
            ms.length,
            ms.some((m) => m.includes('SECRET')),
        ], [1, 1, 2, false])
        parseNumOpt.resetWarned()
        mock.timers.tick(5000)
    })

})
