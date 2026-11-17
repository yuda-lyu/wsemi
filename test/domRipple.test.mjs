import assert from 'assert'
import { mock } from 'node:test'
import domRipple from '../src/domRipple.mjs'
import { NOT_ELE, mkQueryEnv } from './tools/domArgKit.mjs'


//ws492e: N-A(主控定): domRipple之event為必須參數, 原無檢測且ele.style已被改寫後才讀event.clientX拋原生TypeError(違反V17), clientX/clientY非數字時寫入'NaNpx'; 改為event須為物件且clientX、clientY為有效數字(isenum＋cdbl), 否則以固定訊息(V19)拋錯、先於任何DOM變動(會改畫面者拋錯, W-17通則); ele非元素維持不動作(2026-11-02先不動)
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17通則、V17、V19、V20、K4
//  DOM測試作法: 以最小假DOM(mkQueryEnv)驅動, 計時以node:test之mock.timers; 真實外觀(ripple之動畫與位置)屬瀏覽器語義, 另以真瀏覽器實測
describe(`domRipple`, function() {

    let MSG = 'invalid event: must be an event object with valid clientX and clientY'
    let env = null
    let ele = null

    beforeEach(function() {
        env = mkQueryEnv()
        env.document.createElement = (tag) => {
            let e = new env.Ele(tag)
            env.created.push(e)
            return e
        }
        ele = env.mk('button')
        ele.rect = { left: 10, top: 20, width: 100, height: 40 }
        ele.clientWidth = 100
        ele.clientHeight = 40
        mock.timers.enable({ apis: ['setTimeout'], now: 0 })
    })

    afterEach(function() {
        mock.timers.reset()
        env.restore()
    })

    //BAD, 無效之event
    let BAD_EVENT = [
        ['undefined', undefined],
        ['null', null],
        ['5', 5],
        [`'click'`, 'click'],
        ['true', true],
        ['{}', {}],
        ['[]', []],
        ['{ clientX: 1 }', { clientX: 1 }],
        ['{ clientY: 1 }', { clientY: 1 }],
        ['{ clientX: NaN, clientY: 1 }', { clientX: NaN, clientY: 1 }],
        ['{ clientX: 1, clientY: NaN }', { clientX: 1, clientY: NaN }],
        ['{ clientX: Infinity, clientY: 1 }', { clientX: Infinity, clientY: 1 }],
        ['{ clientX: 1, clientY: -Infinity }', { clientX: 1, clientY: -Infinity }],
        ['{ clientX: null, clientY: 1 }', { clientX: null, clientY: 1 }],
        ['{ clientX: true, clientY: 1 }', { clientX: true, clientY: 1 }],
        [`{ clientX: '0x10', clientY: 1 }`, { clientX: '0x10', clientY: 1 }],
        [`{ clientX: 1, clientY: 'abc' }`, { clientX: 1, clientY: 'abc' }],
        [`{ clientX: '', clientY: 1 }`, { clientX: '', clientY: 1 }],
        ['{ clientX: [1], clientY: 1 }', { clientX: [1], clientY: 1 }],
        ['{ clientX: new Number(1), clientY: 1 }', { clientX: new Number(1), clientY: 1 }], // eslint-disable-line no-new-wrappers
        ['function', () => {}],
    ]

    //spec: event無效拋Error(固定訊息, V19), 先於任何DOM變動: 不改寫ele.style、不建立ripple元素、不排計時器
    for (let [label, v] of BAD_EVENT) {
        it(`should throw the fixed message before touching the DOM when event is ${label}`, function() {
            env.resetOps()
            assert.throws(() => domRipple(ele, v), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, MSG)
                return true
            })
            assert.strict.deepStrictEqual(ele.style, {})
            assert.strict.deepStrictEqual(ele.children.length, 0)
            assert.strict.deepStrictEqual(env.created.length, 0)
            assert.strict.deepStrictEqual(env.ops.length, 0)
        })
    }

    //spec(V20): 訊息不回顯輸入值
    it(`should not echo the input value in the error message`, function() {
        assert.throws(() => domRipple(ele, { clientX: 'SECRET-x-9f3a', clientY: 1 }), (err) => !err.message.includes('SECRET'))
    })

    //spec: ele非元素維持不動作(不拋錯), 且優先於event之檢測(兩者皆無效時不拋錯)
    for (let [label, v] of NOT_ELE) {
        it(`should do nothing and not throw when ele is ${label}, even when event is invalid`, function() {
            let r = '(not set)'
            assert.doesNotThrow(() => {
                r = domRipple(v, null)
            })
            assert.strict.deepStrictEqual(r, undefined)
            assert.doesNotThrow(() => domRipple(v, { clientX: 1, clientY: 1 }))
            assert.strict.deepStrictEqual(env.created.length, 0)
        })
    }

    //spec: 有效輸入改ele之position與overflow, 建立ripple元素, 位置為座標減外框之左上角
    it(`should set position and overflow, then append a ripple at the click position relative to the element`, function() {
        let r = domRipple(ele, { clientX: 15, clientY: 30 })
        assert.strict.deepStrictEqual(r, undefined)
        assert.strict.deepStrictEqual(ele.style.position, 'relative')
        assert.strict.deepStrictEqual(ele.style.overflow, 'hidden')
        assert.strict.deepStrictEqual(ele.children.length, 1)
        let rp = ele.children[0]
        assert.strict.deepStrictEqual(rp.style.left, '5px')
        assert.strict.deepStrictEqual(rp.style.top, '10px')
        assert.strict.deepStrictEqual(rp.style.width, '200px') //max(100, 40) * 2
        assert.strict.deepStrictEqual(rp.style.transition, 'all 1s linear')
        assert.strict.deepStrictEqual(rp.style.background, 'rgba(255, 255, 255, 0.5)')
    })

    //spec(K4): 數字字串通過檢測後以數字使用, 不寫入'NaNpx'; 0與負數為有效座標
    it(`should use numeric strings as numbers and never write NaNpx`, function() {
        domRipple(ele, { clientX: '15', clientY: ' 30 ' })
        let rp = ele.children[0]
        assert.strict.deepStrictEqual([rp.style.left, rp.style.top], ['5px', '10px'])
        domRipple(ele, { clientX: 0, clientY: -5 })
        let rp2 = ele.children[1]
        assert.strict.deepStrictEqual([rp2.style.left, rp2.style.top], ['-10px', '-25px'])
    })

    //spec: clientX與clientY依序各讀一次, 檢測之值即使用之值
    it(`should read clientX and clientY once each and use the checked values`, function() {
        let reads = { x: 0, y: 0 }
        let ev = {}
        Object.defineProperty(ev, 'clientX', {
            get() {
                reads.x++
                return reads.x === 1 ? 15 : NaN
            },
        })
        Object.defineProperty(ev, 'clientY', {
            get() {
                reads.y++
                return reads.y === 1 ? 30 : NaN
            },
        })
        domRipple(ele, ev)
        assert.strict.deepStrictEqual(reads, { x: 1, y: 1 })
        assert.strict.deepStrictEqual([ele.children[0].style.left, ele.children[0].style.top], ['5px', '10px'])
    })

    //spec: clientX無效時不讀clientY(短路); 讀取拋錯之存取器視為無效而拋固定訊息
    it(`should not read clientY when clientX is invalid, and treat a throwing getter as invalid`, function() {
        let n = 0
        let ev = { clientX: NaN }
        Object.defineProperty(ev, 'clientY', {
            get() {
                n++
                return 1
            },
        })
        assert.throws(() => domRipple(ele, ev), { message: MSG })
        assert.strict.deepStrictEqual(n, 0)
        let ev2 = { clientY: 1 }
        Object.defineProperty(ev2, 'clientX', {
            get() {
                throw new Error('getter-boom')
            },
        })
        assert.throws(() => domRipple(ele, ev2), { message: MSG })
        assert.strict.deepStrictEqual(ele.style, {})
    })

    //spec: ripple於timeDuration後移除(既有行為不變)
    it(`should remove the ripple after opt.timeDuration`, function() {
        domRipple(ele, { clientX: 15, clientY: 30 }, { timeDuration: 500 })
        assert.strict.deepStrictEqual(ele.children.length, 1)
        mock.timers.tick(499)
        assert.strict.deepStrictEqual(ele.children.length, 1)
        mock.timers.tick(1)
        assert.strict.deepStrictEqual(ele.children.length, 0)
    })

})
