import assert from 'assert'
import domGetBoudRectRefSelf from '../src/domGetBoudRectRefSelf.mjs'
import { NOT_ELE, mkEditDom } from './tools/domEditKit.mjs'


//ws492a: 對外入口之數值參數(p.clientX、p.clientY)改以isenum判定, 通過即cdbl轉型後使用; 無效仍回null(既有通道)
//  規格: dspec〈輸入參數之檢測機制〉K3、K4(檢測之值即使用之值)、K7(數字類一律收數字字串)、§11 Q3-c(判定通過即轉型)
//  DOM測試作法: 以最小假DOM(test/tools/fakeDom.mjs經domEditKit.mjs補語義)驅動, 外框以Ele之rect指定; 真實getBoundingClientRect之語義屬瀏覽器, 非本檔所能驗證, 須於瀏覽器實測
//  注意: 減法(p.clientX - rt.left)對數字字串本就會強制轉為數值, 故「轉型(cdbl)」本身於本函數無可觀察差異(等價變異); 可觀察者為檢測(isenum)、回傳值與「只讀取一次」
describe(`domGetBoudRectRefSelf`, function() {

    let env = null

    //外框: left=10, top=20, 寬100高40(offsetWidth/offsetHeight預設值)
    let mkBox = () => new env.Ele('div', { rect: { left: 10, top: 20, width: 100, height: 40 } })

    //非有效數字(isenum為false)之各型值; [標籤, 值]
    let INVALID_NUM = [
        ['undefined', undefined],
        ['null', null],
        ['NaN', NaN],
        ['Infinity', Infinity],
        ['-Infinity', -Infinity],
        [`'Infinity'`, 'Infinity'],
        [`'0x10'`, '0x10'],
        [`'0b11'`, '0b11'],
        [`'abc'`, 'abc'],
        [`'12abc'`, '12abc'],
        [`''`, ''],
        [`'  '`, '  '],
        [`'1e400'`, '1e400'],
        [`'1e-400'`, '1e-400'], //下溢為0而尾數含非零數字, isenum拒收(cdbl會得0, 故不可省略前置檢測)
        [`'-1e-400'`, '-1e-400'],
        ['true', true],
        ['false', false],
        ['new Number(50)', new Number(50)], // eslint-disable-line no-new-wrappers
        [`new String('50')`, new String('50')], // eslint-disable-line no-new-wrappers
        ['{}', {}],
        ['[]', []],
        ['[50]', [50]],
        ['function', () => 50],
        ['BigInt', 50n],
        ['Symbol', Symbol('x')],
    ]

    beforeEach(function() {
        env = mkEditDom()
    })

    afterEach(function() {
        env.restore()
    })

    //spec: 有效數字回元素內相對座標x、y與元素寬高w、h
    it(`should return the position relative to the element and its size for valid numbers`, function() {
        let r = domGetBoudRectRefSelf({ clientX: 30, clientY: 50 }, mkBox())
        assert.strict.deepStrictEqual(r, { x: 20, y: 30, w: 100, h: 40 })
        let r2 = domGetBoudRectRefSelf({ clientX: 5, clientY: 0 }, mkBox())
        assert.strict.deepStrictEqual(r2, { x: -5, y: -20, w: 100, h: 40 })
    })

    //spec: K7數字類收數字字串, 結果與同值數字相同且x、y為數字型別
    it(`should give the same result for numeric strings as for the numbers, with x and y as numbers`, function() {
        let ele = mkBox()
        let pairs = [
            ['30', 50],
            [' 30 ', '50'],
            ['+30', '+50'],
            ['3e1', '5e1'],
            ['30.0', '50.00'],
            ['12.3', '4.56'],
            ['-5', '-5'],
            ['.5e2', '.4e2'],
            [30, '50'],
        ]
        for (let [x, y] of pairs) {
            let rs = domGetBoudRectRefSelf({ clientX: x, clientY: y }, ele)
            let rn = domGetBoudRectRefSelf({ clientX: Number(String(x).trim()), clientY: Number(String(y).trim()) }, ele)
            assert.strict.deepStrictEqual(rs, rn, `${JSON.stringify([x, y])}`)
            assert.strict.deepStrictEqual(typeof rs.x, 'number')
            assert.strict.deepStrictEqual(typeof rs.y, 'number')
        }
        assert.strict.deepStrictEqual(domGetBoudRectRefSelf({ clientX: '30', clientY: '50' }, ele), { x: 20, y: 30, w: 100, h: 40 })
    })

    //spec: p.clientX非有效數字回null(原NaN、Infinity、包裝物件被收下, 數字字串被拒)
    for (let [label, v] of INVALID_NUM) {
        it(`should return null when p.clientX is ${label}`, function() {
            assert.strict.deepStrictEqual(domGetBoudRectRefSelf({ clientX: v, clientY: 50 }, mkBox()), null)
        })
    }

    //spec: p.clientY非有效數字回null
    for (let [label, v] of INVALID_NUM) {
        it(`should return null when p.clientY is ${label}`, function() {
            assert.strict.deepStrictEqual(domGetBoudRectRefSelf({ clientX: 30, clientY: v }, mkBox()), null)
        })
    }

    //spec: clientX/clientY缺漏(鍵不存在)回null
    it(`should return null when clientX or clientY is missing`, function() {
        assert.strict.deepStrictEqual(domGetBoudRectRefSelf({ clientY: 50 }, mkBox()), null)
        assert.strict.deepStrictEqual(domGetBoudRectRefSelf({ clientX: 30 }, mkBox()), null)
    })

    //spec: p非有效物件回null(既有通道, 守門)
    it(`should return null when p is not a non-empty object`, function() {
        for (let v of [undefined, null, '', 'abc', 0, 1, NaN, true, {}, [], () => 1]) {
            assert.strict.deepStrictEqual(domGetBoudRectRefSelf(v, mkBox()), null)
        }
    })

    //spec: p須為一般物件(JSDoc所載): 事件物件本身(toString標籤非[object Object])即使帶有效座標亦回null; 同值之一般物件回結果(以Node之Event為事件物件之替身, 非瀏覽器MouseEvent, 後者須於瀏覽器實測)
    it(`should return null for an event object itself even when it carries valid coordinates, while a plain object with the same values works`, function() {
        let ev = Object.assign(new Event('mousemove'), { clientX: 30, clientY: 50 })
        assert.strict.deepStrictEqual(Object.prototype.toString.call(ev), '[object Event]')
        assert.strict.deepStrictEqual(domGetBoudRectRefSelf(ev, mkBox()), null)
        assert.strict.deepStrictEqual(domGetBoudRectRefSelf({ clientX: ev.clientX, clientY: ev.clientY }, mkBox()), { x: 20, y: 30, w: 100, h: 40 })
    })

    //spec: ele非元素回null(既有通道, 守門)
    for (let [label, v] of NOT_ELE) {
        it(`should return null when ele is ${label}`, function() {
            assert.strict.deepStrictEqual(domGetBoudRectRefSelf({ clientX: 30, clientY: 50 }, v), null)
        })
    }

    //spec: 元素之getBoundingClientRect拋錯回null(既有通道, 守門)
    it(`should return null when getBoundingClientRect of a valid element throws`, function() {
        let ele = mkBox()
        ele.getBoundingClientRect = function() {
            throw new Error('rect boom')
        }
        assert.strict.deepStrictEqual(domGetBoudRectRefSelf({ clientX: 30, clientY: 50 }, ele), null)
    })

    //spec: K4檢測之值即使用之值: p.clientX/clientY只讀取一次, 之後之讀取不影響結果(第一次為有效值, 其後為NaN)
    it(`should read p.clientX and p.clientY only once so that the checked value is the used value`, function() {
        let nx = 0
        let ny = 0
        let p = {
            get clientX() {
                nx++
                return nx === 1 ? '30' : NaN
            },
            get clientY() {
                ny++
                return ny === 1 ? ' 50 ' : NaN
            },
        }
        let r = domGetBoudRectRefSelf(p, mkBox())
        assert.strict.deepStrictEqual(r, { x: 20, y: 30, w: 100, h: 40 })
        assert.strict.deepStrictEqual(nx, 1)
        assert.strict.deepStrictEqual(ny, 1)
    })

    //spec: 檢測順序先clientX後clientY(同修改前之短路): clientX無效即回null且不讀clientY(其存取器拋錯或計數皆不得被觸發)
    it(`should not read p.clientY when p.clientX is invalid (a throwing or counting getter of clientY must stay untouched)`, function() {
        let ny = 0
        let p = {
            clientX: 'abc',
            get clientY() {
                ny++
                throw new Error('clientY read')
            },
        }
        let r
        assert.doesNotThrow(() => {
            r = domGetBoudRectRefSelf(p, mkBox())
        })
        assert.strict.deepStrictEqual(r, null)
        assert.strict.deepStrictEqual(ny, 0)
    })

    //spec: 判斷類對被檢測值不呼叫其方法, 帶會拋錯之valueOf/toString之物件回null而不拋錯; clientX、clientY各自單獨為此物件(另一軸有效)分開驗, 不讓前一軸之無效遮住後一軸之檢測路徑
    let mkEvil = (counter) => ({
        valueOf() {
            counter.n++
            throw new Error('valueOf called')
        },
        toString() {
            counter.n++
            throw new Error('toString called')
        },
    })

    it(`should not call methods of an invalid clientX (valid clientY) and should not throw`, function() {
        let c = { n: 0 }
        let r
        assert.doesNotThrow(() => {
            r = domGetBoudRectRefSelf({ clientX: mkEvil(c), clientY: 50 }, mkBox())
        })
        assert.strict.deepStrictEqual(r, null)
        assert.strict.deepStrictEqual(c.n, 0)
    })

    it(`should not call methods of an invalid clientY (valid clientX) and should not throw`, function() {
        let c = { n: 0 }
        let r
        assert.doesNotThrow(() => {
            r = domGetBoudRectRefSelf({ clientX: 30, clientY: mkEvil(c) }, mkBox())
        })
        assert.strict.deepStrictEqual(r, null)
        assert.strict.deepStrictEqual(c.n, 0)
    })

    //spec: 無效輸入先於任何對元素之存取(不呼叫getBoundingClientRect)
    it(`should not touch the element when clientX or clientY is invalid`, function() {
        let n = 0
        let ele = mkBox()
        ele.getBoundingClientRect = function() {
            n++
            return { left: 10, top: 20 }
        }
        domGetBoudRectRefSelf({ clientX: NaN, clientY: 50 }, ele)
        domGetBoudRectRefSelf({ clientX: 30, clientY: '0x10' }, ele)
        assert.strict.deepStrictEqual(n, 0)
        domGetBoudRectRefSelf({ clientX: 30, clientY: 50 }, ele)
        assert.strict.deepStrictEqual(n, 1)
    })

})
