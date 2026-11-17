import assert from 'assert'
import domScrollTo from '../src/domScrollTo.mjs'
import { NOT_ELE, mkQueryEnv } from './tools/domArgKit.mjs'


//ws492e: W-05(主控定): domScrollTo之opt逐鍵檢測(behavior、left、top), 不直通未知鍵; behavior非預期改用預設'smooth'(K3), left與top須為有效數字(isenum＋cdbl), 非預期視為未給(該軸不傳, 原生會把NaN等轉成0)
//  規格: dspec〈輸入參數之檢測機制〉K3、K4、V8、V11、Q3-c(數值檢測通過即轉型)
//  測試作法: 以最小假DOM之元素(mkQueryEnv)記錄scrollTo之引數; 真實捲動屬瀏覽器語義, 另以真瀏覽器實測
describe(`domScrollTo`, function() {

    let env = null
    let calls = null
    let ele = null

    beforeEach(function() {
        env = mkQueryEnv()
        calls = []
        ele = env.mk('div')
        ele.scrollTo = function(o) {
            calls.push({ self: this, o })
        }
    })

    afterEach(function() {
        env.restore()
    })

    //spec: ele非元素不動作(不拋錯)
    for (let [label, v] of NOT_ELE) {
        it(`should do nothing and return undefined when ele is ${label}`, function() {
            let r = '(not set)'
            assert.doesNotThrow(() => {
                r = domScrollTo(v, { left: 0, top: 100 })
            })
            assert.strict.deepStrictEqual(r, undefined)
            assert.strict.deepStrictEqual(calls.length, 0)
        })
    }

    //spec: 預設{behavior:'smooth'}, left與top未給不傳
    it(`should call scrollTo once with { behavior: 'smooth' } when nothing else is given`, function() {
        domScrollTo(ele)
        assert.strict.deepStrictEqual(calls.length, 1)
        assert.strict.deepStrictEqual(calls[0].self, ele)
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
    })

    it(`should pass left and top as numbers (0 and negative numbers are valid)`, function() {
        domScrollTo(ele, { left: 0, top: 100 })
        domScrollTo(ele, { left: -5.5, top: 0 })
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth', left: 0, top: 100 })
        assert.strict.deepStrictEqual(calls[1].o, { behavior: 'smooth', left: -5.5, top: 0 })
    })

    //spec(K4): 數字字串通過檢測後以數字(cdbl)交給原生API
    it(`should convert numeric strings to numbers`, function() {
        domScrollTo(ele, { left: ' 12.5 ', top: '-3', behavior: 'instant' })
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'instant', left: 12.5, top: -3 })
        assert.strict.deepStrictEqual(typeof calls[0].o.left, 'number')
        assert.strict.deepStrictEqual(typeof calls[0].o.top, 'number')
    })

    //spec(K3): left、top非預期視為未給(該軸不傳)
    let BADNUM = [
        ['undefined', undefined],
        ['null', null],
        [`''`, ''],
        ['true', true],
        ['false', false],
        ['NaN', NaN],
        ['Infinity', Infinity],
        ['-Infinity', -Infinity],
        [`'Infinity'`, 'Infinity'],
        [`'0x10'`, '0x10'],
        [`'abc'`, 'abc'],
        ['{}', {}],
        ['[]', []],
        ['[5]', [5]],
        ['function', () => 5],
        ['Symbol', Symbol('x')],
        ['new Number(5)', new Number(5)], // eslint-disable-line no-new-wrappers
    ]
    for (let [label, v] of BADNUM) {
        it(`should not pass left and top when they are ${label}`, function() {
            domScrollTo(ele, { left: v, top: v })
            assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
            assert.strict.deepStrictEqual(Object.keys(calls[0].o), ['behavior'])
        })
    }

    it(`should check left and top independently`, function() {
        domScrollTo(ele, { left: NaN, top: 40 })
        domScrollTo(ele, { left: 30, top: 'x' })
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth', top: 40 })
        assert.strict.deepStrictEqual(calls[1].o, { behavior: 'smooth', left: 30 })
    })

    //spec: behavior為原生值域之成員照用; 非預期改用預設'smooth'
    for (let b of ['auto', 'instant', 'smooth']) {
        it(`should pass behavior ${b}`, function() {
            domScrollTo(ele, { behavior: b })
            assert.strict.deepStrictEqual(calls[0].o, { behavior: b })
        })
    }
    for (let [label, v] of [['undefined', undefined], ['null', null], [`''`, ''], ['5', 5], ['true', true], ['{}', {}], [`'SMOOTH'`, 'SMOOTH'], [`'fast'`, 'fast'], [`'toString'`, 'toString'], ['new String', new String('auto')]]) { // eslint-disable-line no-new-wrappers
        it(`should use the default behavior smooth when behavior is ${label}`, function() {
            domScrollTo(ele, { behavior: v })
            assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
        })
    }

    //spec: 未知鍵不直通
    it(`should not forward unknown keys`, function() {
        domScrollTo(ele, { foo: 1, block: 'center', inline: 'end', left: 1 })
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth', left: 1 })
    })

    //spec: opt非一般物件視為{}
    for (let [label, v] of [['null', null], [`'x'`, 'x'], ['5', 5], ['[]', []], ['true', true]]) {
        it(`should treat opt ${label} as {}`, function() {
            domScrollTo(ele, v)
            assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
        })
    }

    //spec(V11): 讀取拋錯之getter視為未給
    it(`should treat a key whose getter throws as not given`, function() {
        let opt = {}
        for (let k of ['behavior', 'left', 'top']) {
            Object.defineProperty(opt, k, {
                enumerable: true,
                get() {
                    throw new Error('getter-boom')
                },
            })
        }
        domScrollTo(ele, opt)
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
    })

    //spec(K4): 每個鍵(behavior、left、top)只讀一次, 檢測之值即使用之值(第一次有效、其後無效之存取器以第一次為準)
    it(`should read each key only once and use the checked value`, function() {
        let reads = { behavior: 0, left: 0, top: 0 }
        let first = { behavior: 'instant', left: 7, top: 9 }
        let second = { behavior: 'bogus', left: NaN, top: NaN }
        let opt = {}
        for (let k of Object.keys(reads)) {
            Object.defineProperty(opt, k, {
                enumerable: true,
                get() {
                    reads[k]++
                    return reads[k] === 1 ? first[k] : second[k]
                },
            })
        }
        domScrollTo(ele, opt)
        assert.strict.deepStrictEqual(reads, { behavior: 1, left: 1, top: 1 })
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'instant', left: 7, top: 9 })
    })

    //spec(V11): opt為已撤銷之Proxy(判型即拋錯)視為{}, 不外拋(內部獨立複審#2)
    it(`should treat a revoked Proxy opt as {}`, function() {
        let { proxy, revoke } = Proxy.revocable({}, {})
        revoke()
        assert.doesNotThrow(() => domScrollTo(ele, proxy))
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
    })

    //spec: opt須為一般物件: 帶屬性之陣列與函數雖可讀得behavior、left等鍵, 仍視為{}
    it(`should treat an array or a function carrying the keys as {} (not a plain object)`, function() {
        let a = []
        a.behavior = 'instant'
        a.left = 5
        let f = () => {}
        f.top = 7
        domScrollTo(ele, a)
        domScrollTo(ele, f)
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
        assert.strict.deepStrictEqual(calls[1].o, { behavior: 'smooth' })
    })

})
