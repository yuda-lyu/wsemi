import assert from 'assert'
import domTriggerEvent from '../src/domTriggerEvent.mjs'
import { NOT_ELE, NOT_ESTR, mkQueryEnv } from './tools/domArgKit.mjs'


//ws492e: W-17(使用者2026-11-16「甲」): 會觸發事件者比照domAppend, 輸入無效即以固定訊息(V19)拋錯、先於任何動作; eventName須為非空字串(原生會把undefined轉成'undefined'照常派發)
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17、V19(invalid <名稱>: must be <種類描述>)、V20(不回顯輸入值)、V17(無殘留)
//  DOM測試作法: 以最小假DOM(mkQueryEnv)驅動, 並提供假MouseEvent(記錄type與init)與假window、元素之dispatchEvent(記錄派發之事件)
describe(`domTriggerEvent`, function() {

    let env = null
    let made = null
    let dispatched = null
    let rawMouse
    let hadMouse = false

    beforeEach(function() {
        env = mkQueryEnv()
        made = []
        dispatched = []
        hadMouse = Object.prototype.hasOwnProperty.call(globalThis, 'MouseEvent')
        rawMouse = globalThis.MouseEvent
        globalThis.MouseEvent = class MouseEvent {
            constructor(type, init) {
                this.type = type
                this.init = init
                made.push(this)
            }
        }
        env.Ele.prototype.dispatchEvent = function(ev) {
            dispatched.push({ ele: this, ev })
            return true
        }
    })

    afterEach(function() {
        delete env.Ele.prototype.dispatchEvent
        if (hadMouse) {
            globalThis.MouseEvent = rawMouse
        }
        else {
            delete globalThis.MouseEvent
        }
        env.restore()
    })

    //spec: ele非元素拋Error('invalid ele: must be an element'), 不建立事件、不派發
    for (let [label, v] of NOT_ELE) {
        it(`should throw invalid ele when ele is ${label}, creating and dispatching nothing`, function() {
            assert.throws(() => domTriggerEvent(v, 'click'), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid ele: must be an element')
                return true
            })
            assert.strict.deepStrictEqual(made.length, 0)
            assert.strict.deepStrictEqual(dispatched.length, 0)
        })
    }

    //spec: eventName非非空原始字串拋Error('invalid eventName: must be a non-empty string'), 不建立事件、不派發
    for (let [label, v] of NOT_ESTR) {
        it(`should throw invalid eventName when eventName is ${label}, creating and dispatching nothing`, function() {
            let ele = env.mk('button')
            assert.throws(() => domTriggerEvent(ele, v), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, 'invalid eventName: must be a non-empty string')
                return true
            })
            assert.strict.deepStrictEqual(made.length, 0)
            assert.strict.deepStrictEqual(dispatched.length, 0)
        })
    }

    //spec: 兩者皆無效時先報ele(檢測順序固定)
    it(`should report ele first when both ele and eventName are invalid`, function() {
        assert.throws(() => domTriggerEvent(null, null), { message: 'invalid ele: must be an element' })
        assert.throws(() => domTriggerEvent(), { message: 'invalid ele: must be an element' })
    })

    //spec(V20): 訊息不回顯輸入值
    it(`should not echo the input values in the error message`, function() {
        let ele = env.mk('button')
        assert.throws(() => domTriggerEvent('SECRET-ele-9f3a', 'click'), (err) => !err.message.includes('SECRET'))
        assert.throws(() => domTriggerEvent(ele, { x: 'SECRET-name-9f3a' }), (err) => !err.message.includes('SECRET'))
    })

    //spec: 有效輸入以MouseEvent(bubbles、cancelable為true)派發一次於ele, 回傳undefined
    it(`should dispatch one bubbling cancelable MouseEvent of the given name on the element and return undefined`, function() {
        let ele = env.mk('button')
        let r = domTriggerEvent(ele, 'click')
        assert.strict.deepStrictEqual(r, undefined)
        assert.strict.deepStrictEqual(made.length, 1)
        assert.strict.deepStrictEqual(made[0].type, 'click')
        assert.strict.deepStrictEqual(made[0].init.bubbles, true)
        assert.strict.deepStrictEqual(made[0].init.cancelable, true)
        assert.strict.deepStrictEqual(dispatched.length, 1)
        assert.strict.deepStrictEqual(dispatched[0].ele, ele)
        assert.strict.deepStrictEqual(dispatched[0].ev, made[0])
    })

    it(`should accept any non-empty event name`, function() {
        let ele = env.mk('div')
        for (let name of ['mousedown', 'mouseup', 'dblclick', 'custom-name', ' ']) {
            domTriggerEvent(ele, name)
        }
        assert.strict.deepStrictEqual(dispatched.map((d) => d.ev.type), ['mousedown', 'mouseup', 'dblclick', 'custom-name', ' '])
    })

})
