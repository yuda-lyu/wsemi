import assert from 'assert'
import domCancelEvent from '../src/domCancelEvent.mjs'
import { mkEvent } from './tools/domArgKit.mjs'


//ws492e: W-17(使用者2026-11-16「甲」): domCancelEvent回布林(是否成功取消), 不以訊息字串作回傳值(P5)
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17、P1(輸出型別恆定)、P5(訊息不當資料)
//  測試作法: 以帶呼叫記錄之假事件驅動; IE分支以覆蓋全域navigator模擬(Node之navigator為全域存取器, 以defineProperty覆蓋並還原); 瀏覽器之passive監聽器語義非本檔所能驗證, 另以真瀏覽器實測
describe(`domCancelEvent`, function() {

    //spec: 可取消之事件呼叫stopPropagation與preventDefault(依序), 回true
    it(`should call stopPropagation then preventDefault for a cancelable event and return true`, function() {
        let ev = mkEvent()
        let r = domCancelEvent(ev)
        assert.strict.deepStrictEqual(r, true)
        assert.strict.deepStrictEqual(ev.calls, ['stopPropagation', 'preventDefault'])
    })

    //spec: 不可取消之事件不動作, 回false(原回字串'event is not cancelable')
    it(`should return false and call nothing for a non-cancelable event`, function() {
        let ev = mkEvent({ cancelable: false })
        let r = domCancelEvent(ev)
        assert.strict.deepStrictEqual(r, false)
        assert.strict.deepStrictEqual(ev.calls, [])
    })

    //spec: 無效事件(假值、非物件、無cancelable)回false(原回字串'invalid event'), 不拋錯
    let BAD = [
        ['undefined', undefined],
        ['null', null],
        ['0', 0],
        [`''`, ''],
        ['false', false],
        ['NaN', NaN],
        [`'abc'`, 'abc'],
        ['5', 5],
        ['true', true],
        ['{}', {}],
        ['[]', []],
        ['{ cancelable: false }', { cancelable: false }],
        ['{ cancelable: 0 }', { cancelable: 0, stopPropagation() {}, preventDefault() {} }],
    ]
    for (let [label, v] of BAD) {
        it(`should return false (a boolean, not a message string) when e is ${label}`, function() {
            let r = '(not set)'
            assert.doesNotThrow(() => {
                r = domCancelEvent(v)
            })
            assert.strict.deepStrictEqual(r, false)
        })
    }

    //spec: 可取消標記為真但缺方法, 呼叫過程拋錯(有些情形preventDefault是passive無法呼叫)接住回false, 不外拋
    it(`should return false when a cancelable object has no stopPropagation or preventDefault`, function() {
        assert.strict.deepStrictEqual(domCancelEvent({ cancelable: true }), false)
        assert.strict.deepStrictEqual(domCancelEvent({ cancelable: true, stopPropagation() {} }), false)
    })

    it(`should return false without throwing when preventDefault throws, after stopPropagation was called`, function() {
        let ev = mkEvent({ throwOn: 'preventDefault' })
        let r = null
        assert.doesNotThrow(() => {
            r = domCancelEvent(ev)
        })
        assert.strict.deepStrictEqual(r, false)
        assert.strict.deepStrictEqual(ev.calls, ['stopPropagation', 'preventDefault'])
    })

    it(`should return false without throwing when stopPropagation throws, and not call preventDefault`, function() {
        let ev = mkEvent({ throwOn: 'stopPropagation' })
        assert.strict.deepStrictEqual(domCancelEvent(ev), false)
        assert.strict.deepStrictEqual(ev.calls, ['stopPropagation'])
    })

    //spec: 讀取事件屬性拋錯(拋錯之getter、已撤銷之Proxy)視為無法取消, 回false
    it(`should return false when reading e.cancelable throws`, function() {
        let ev = {}
        Object.defineProperty(ev, 'cancelable', {
            get() {
                throw new Error('getter-boom')
            },
        })
        assert.strict.deepStrictEqual(domCancelEvent(ev), false)
        let { proxy, revoke } = Proxy.revocable({}, {})
        revoke()
        assert.strict.deepStrictEqual(domCancelEvent(proxy), false)
    })

    //spec: IE11以設cancelBubble取代stopPropagation, 仍呼叫preventDefault並回true
    it(`should set cancelBubble instead of calling stopPropagation in IE11 and return true`, function() {
        let desc = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
        Object.defineProperty(globalThis, 'navigator', {
            configurable: true,
            value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko' },
        })
        try {
            let ev = mkEvent()
            let r = domCancelEvent(ev)
            assert.strict.deepStrictEqual(r, true)
            assert.strict.deepStrictEqual(ev.cancelBubble, true)
            assert.strict.deepStrictEqual(ev.calls, ['preventDefault'])
        }
        finally {
            if (desc) {
                Object.defineProperty(globalThis, 'navigator', desc)
            }
            else {
                delete globalThis.navigator
            }
        }
    })

    //spec(JSDoc): cancelable以真值判定(非嚴格等於true, 同修改前), 真值之非布林亦視為可取消
    it(`should treat a truthy non-boolean cancelable as cancelable (same as before)`, function() {
        let ev = mkEvent()
        ev.cancelable = 1
        assert.strict.deepStrictEqual(domCancelEvent(ev), true)
        assert.strict.deepStrictEqual(ev.calls, ['stopPropagation', 'preventDefault'])
    })

    //spec: 回傳值恆為布林
    it(`should always return a boolean`, function() {
        for (let v of [undefined, null, 5, 'x', {}, mkEvent(), mkEvent({ cancelable: false }), mkEvent({ throwOn: 'preventDefault' })]) {
            assert.strict.deepStrictEqual(typeof domCancelEvent(v), 'boolean')
        }
    })

})
