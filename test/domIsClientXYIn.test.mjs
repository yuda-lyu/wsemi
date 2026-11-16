import assert from 'assert'
import domIsClientXYIn from '../src/domIsClientXYIn.mjs'
import { NOT_ELE, mkEditDom } from './tools/domEditKit.mjs'


//ws492a: 對外入口之數值參數(clientX、clientY)改以isenum判定, 通過即cdbl轉型後使用; 無效回false(原回undefined並console.log印出值)
//  規格: dspec〈輸入參數之檢測機制〉K3、K7(數字類一律收數字字串)、K9/V20(不回顯輸入值)、§5.1(判斷類回布林, P1成功與失敗之回傳型別一致)、§11 Q3-c(判定通過即轉型); 回布林者無效回false比照domIsFocused
//  DOM測試作法: 以最小假DOM(test/tools/fakeDom.mjs經domEditKit.mjs補語義)驅動, 外框以Ele之rect指定; 真實getBoundingClientRect之語義屬瀏覽器, 非本檔所能驗證, 須於瀏覽器實測
//  注意: 判定為true/false之比較(>=、<=)對數字字串本就會強制轉為數值, 故「轉型(cdbl)」本身於本函數無可觀察差異(等價變異), 其值為使檢測之值即使用之值; 可觀察者為檢測(isenum)與回傳值
describe(`domIsClientXYIn`, function() {

    let env = null

    //外框: left=10, top=20, right=110, bottom=60
    let mkBox = () => new env.Ele('div', { rect: { left: 10, top: 20, right: 110, bottom: 60 } })

    //capture, 擷取fn執行期間之console.log呼叫
    let capture = (fn) => {
        let logs = []
        let raw = console.log
        console.log = (...a) => logs.push(a)
        let r
        try {
            r = fn()
        }
        finally {
            console.log = raw
        }
        return { r, logs }
    }

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

    //spec: 有效數字且位於元素外框內(含邊界)回true, 否則false
    it(`should return true for a point inside the box including the edges, false outside`, function() {
        let ele = mkBox()
        assert.strict.deepStrictEqual(domIsClientXYIn(50, 40, ele), true)
        assert.strict.deepStrictEqual(domIsClientXYIn(10, 20, ele), true)
        assert.strict.deepStrictEqual(domIsClientXYIn(110, 60, ele), true)
        assert.strict.deepStrictEqual(domIsClientXYIn(110, 20, ele), true)
        assert.strict.deepStrictEqual(domIsClientXYIn(9.99, 40, ele), false)
        assert.strict.deepStrictEqual(domIsClientXYIn(110.01, 40, ele), false)
        assert.strict.deepStrictEqual(domIsClientXYIn(50, 19.99, ele), false)
        assert.strict.deepStrictEqual(domIsClientXYIn(50, 60.01, ele), false)
        assert.strict.deepStrictEqual(domIsClientXYIn(-5, -5, ele), false)
    })

    //spec: K7數字類收數字字串, 結果與同值數字相同(含頭尾空白、正負號、小數點、科學記號)
    it(`should give the same result for numeric strings as for the numbers`, function() {
        let ele = mkBox()
        let pairs = [
            ['50', 40],
            [' 50 ', 40],
            ['+50', '+40'],
            ['5e1', '4e1'],
            ['50.0', '40.00'],
            [50, '40'],
            ['50', 40.5],
            ['10', '20'],
            ['110', '60'],
            ['9.99', 40],
            ['110.01', 40],
            [50, '19.99'],
            [50, ' 60.01 '],
            ['-5', '-5'],
            ['.5e2', '.4e2'],
        ]
        for (let [x, y] of pairs) {
            let rs = domIsClientXYIn(x, y, ele)
            let rn = domIsClientXYIn(Number(String(x).trim()), Number(String(y).trim()), ele)
            assert.strict.deepStrictEqual(rs, rn, `${JSON.stringify([x, y])}`)
            assert.strict.deepStrictEqual(typeof rs, 'boolean')
        }
        assert.strict.deepStrictEqual(domIsClientXYIn('50', '40', ele), true)
        assert.strict.deepStrictEqual(domIsClientXYIn('9.99', '40', ele), false)
    })

    //spec: clientX非有效數字回嚴格false(原回undefined), 不呼叫console.log(原印出值)
    for (let [label, v] of INVALID_NUM) {
        it(`should return exactly false without console.log when clientX is ${label}`, function() {
            let { r, logs } = capture(() => domIsClientXYIn(v, 40, mkBox()))
            assert.strict.deepStrictEqual(r, false)
            assert.strict.deepStrictEqual(typeof r, 'boolean')
            assert.strict.deepStrictEqual(logs.length, 0)
        })
    }

    //spec: clientY非有效數字同上
    for (let [label, v] of INVALID_NUM) {
        it(`should return exactly false without console.log when clientY is ${label}`, function() {
            let { r, logs } = capture(() => domIsClientXYIn(50, v, mkBox()))
            assert.strict.deepStrictEqual(r, false)
            assert.strict.deepStrictEqual(typeof r, 'boolean')
            assert.strict.deepStrictEqual(logs.length, 0)
        })
    }

    //spec: ele非元素回嚴格false(原回undefined並console.log), 訊息不帶值
    for (let [label, v] of NOT_ELE) {
        it(`should return exactly false without console.log when ele is ${label}`, function() {
            let { r, logs } = capture(() => domIsClientXYIn(50, 40, v))
            assert.strict.deepStrictEqual(r, false)
            assert.strict.deepStrictEqual(typeof r, 'boolean')
            assert.strict.deepStrictEqual(logs.length, 0)
        })
    }

    it(`should return exactly false without console.log when called without arguments or with everything invalid`, function() {
        let a = capture(() => domIsClientXYIn())
        assert.strict.deepStrictEqual(a.r, false)
        assert.strict.deepStrictEqual(a.logs.length, 0)
        let b = capture(() => domIsClientXYIn(NaN, 'abc', null))
        assert.strict.deepStrictEqual(b.r, false)
        assert.strict.deepStrictEqual(b.logs.length, 0)
    })

    //spec: 無效值不得在if中被當成有命中(原undefined為假值而false亦為假值, 此案鎖定回傳為嚴格布林供呼叫端以!取反)
    it(`should let the caller negate the result of invalid input (!false is true) without a falsy-undefined path`, function() {
        let ele = mkBox()
        assert.strict.deepStrictEqual(!domIsClientXYIn('abc', 40, ele), true)
        assert.strict.deepStrictEqual(domIsClientXYIn('abc', 40, ele) === undefined, false)
    })

    //spec: 無效輸入先於任何對元素之存取(不呼叫getBoundingClientRect)
    it(`should not touch the element when clientX or clientY is invalid`, function() {
        let n = 0
        let ele = mkBox()
        ele.getBoundingClientRect = function() {
            n++
            return { left: 10, top: 20, right: 110, bottom: 60 }
        }
        domIsClientXYIn(NaN, 40, ele)
        domIsClientXYIn(50, Infinity, ele)
        domIsClientXYIn('0x10', 40, ele)
        assert.strict.deepStrictEqual(n, 0)
        assert.strict.deepStrictEqual(domIsClientXYIn(50, 40, ele), true)
        assert.strict.deepStrictEqual(n, 1)
    })

    //spec: 判斷類對被檢測值不呼叫其方法(包裝物件不解包), 帶會拋錯之valueOf/toString之物件回false而不拋錯; clientX、clientY各自單獨為此物件(另一軸有效)分開驗, 不讓前一軸之無效遮住後一軸之檢測路徑
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
        let r = null
        assert.doesNotThrow(() => {
            r = domIsClientXYIn(mkEvil(c), 40, mkBox())
        })
        assert.strict.deepStrictEqual(r, false)
        assert.strict.deepStrictEqual(c.n, 0)
    })

    it(`should not call methods of an invalid clientY (valid clientX) and should not throw`, function() {
        let c = { n: 0 }
        let r = null
        assert.doesNotThrow(() => {
            r = domIsClientXYIn(50, mkEvil(c), mkBox())
        })
        assert.strict.deepStrictEqual(r, false)
        assert.strict.deepStrictEqual(c.n, 0)
    })

    //spec: K4檢測之值即使用之值: 數字字串轉為數字後才與外框比較(數值比較, 非字串之字典序比較)
    //  注意: 原生DOMRect之欄位為數字, 數字字串對數字之比較本即強制為數值, 轉型無可觀察差異; 此案以自建之外框(欄位為數字字串, 非原生DOMRect)使「未轉型之字串對字串比較」成字典序而可觀察, 僅用以證明本函數於比較前已轉型
    it(`should compare the converted numbers (not strings) with the rect (rect fields given as numeric strings by a non-native stub)`, function() {
        let ele = new env.Ele('div', { rect: { left: '0', top: '0', right: '10', bottom: '10' } })
        //字串之字典序: '9' <= '10' 為 false; 轉型後 9 <= '10' 為數值比較 true
        assert.strict.deepStrictEqual(domIsClientXYIn('9', '5', ele), true)
        assert.strict.deepStrictEqual(domIsClientXYIn(9, 5, ele), true)
        assert.strict.deepStrictEqual(domIsClientXYIn('5', '9', ele), true)
        assert.strict.deepStrictEqual(domIsClientXYIn('10', '10', ele), true)
        assert.strict.deepStrictEqual(domIsClientXYIn('11', '5', ele), false)
    })

    //spec: 回傳型別恆為布林(P1): 元素之getBoundingClientRect拋錯時亦回false(原回undefined), 其console.log(err)為輸出錯誤物件非輸入值, 本輪不動
    it(`should return exactly false when getBoundingClientRect of a valid element throws`, function() {
        let ele = mkBox()
        ele.getBoundingClientRect = function() {
            throw new Error('rect boom')
        }
        let { r } = capture(() => domIsClientXYIn(50, 40, ele))
        assert.strict.deepStrictEqual(r, false)
        assert.strict.deepStrictEqual(typeof r, 'boolean')
    })

    //spec: 有效輸入之路徑不呼叫console.log
    it(`should not call console.log for valid input`, function() {
        let ele = mkBox()
        let { r, logs } = capture(() => [domIsClientXYIn(50, 40, ele), domIsClientXYIn('50', '40', ele), domIsClientXYIn(0, 0, ele)])
        assert.strict.deepStrictEqual(r, [true, true, false])
        assert.strict.deepStrictEqual(logs.length, 0)
    })

})
