import assert from 'assert'
import domScrollIntoView from '../src/domScrollIntoView.mjs'
import { NOT_ELE, mkQueryEnv } from './tools/domArgKit.mjs'


//ws492e: W-05(主控定): domScrollIntoView之opt逐鍵檢測(behavior、block、inline), 不直通未知鍵; 非預期視為未給(K3): behavior改用預設'smooth', block與inline不傳(由瀏覽器用其預設)
//  規格: dspec〈輸入參數之檢測機制〉K3、V8(本層有自用預設之鍵歸本層檢測)、V11(讀取拋錯視為無效)、§3.4 S3(列舉字串)
//  原狀: 展開時opt.behavior為undefined會覆蓋預設'smooth'(原生視為缺省而瞬間捲動), null或非法列舉字串時原生拋TypeError
//  測試作法: 以最小假DOM之元素(mkQueryEnv)記錄scrollIntoView之引數; 真實捲動與原生之列舉轉換(TypeError)屬瀏覽器語義, 另以真瀏覽器實測
describe(`domScrollIntoView`, function() {

    let env = null
    let calls = null
    let ele = null

    beforeEach(function() {
        env = mkQueryEnv()
        calls = []
        ele = env.mk('div')
        ele.scrollIntoView = function(o) {
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
                r = domScrollIntoView(v, { block: 'center' })
            })
            assert.strict.deepStrictEqual(r, undefined)
            assert.strict.deepStrictEqual(calls.length, 0)
        })
    }

    //spec: 預設以{behavior:'smooth'}呼叫一次scrollIntoView(this為ele)
    it(`should call scrollIntoView once with { behavior: 'smooth' } by default`, function() {
        domScrollIntoView(ele)
        domScrollIntoView(ele, {})
        assert.strict.deepStrictEqual(calls.length, 2)
        assert.strict.deepStrictEqual(calls[0].self, ele)
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
        assert.strict.deepStrictEqual(calls[1].o, { behavior: 'smooth' })
    })

    //spec: behavior為原生值域之成員照用
    for (let b of ['auto', 'instant', 'smooth']) {
        it(`should pass behavior ${b}`, function() {
            domScrollIntoView(ele, { behavior: b })
            assert.strict.deepStrictEqual(calls[0].o, { behavior: b })
        })
    }

    //spec(K3): behavior非預期改用預設'smooth'(含undefined: 原會覆蓋預設而得undefined)
    let BAD = [
        ['undefined', undefined],
        ['null', null],
        [`''`, ''],
        ['0', 0],
        ['5', 5],
        ['true', true],
        ['{}', {}],
        ['[]', []],
        [`['smooth']`, ['smooth']],
        ['function', () => 'smooth'],
        ['Symbol', Symbol('smooth')],
        [`'SMOOTH'`, 'SMOOTH'],
        [`' smooth'`, ' smooth'],
        [`'fast'`, 'fast'],
        [`'toString'`, 'toString'],
        [`'__proto__'`, '__proto__'],
        ['new String', new String('smooth')], // eslint-disable-line no-new-wrappers
    ]
    for (let [label, v] of BAD) {
        it(`should use the default behavior smooth when behavior is ${label}`, function() {
            domScrollIntoView(ele, { behavior: v })
            assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
            assert.strict.deepStrictEqual(Object.prototype.hasOwnProperty.call(calls[0].o, 'behavior'), true)
        })
    }

    //spec: block、inline為原生值域之成員照用
    for (let a of ['start', 'center', 'end', 'nearest']) {
        it(`should pass block ${a} and inline ${a}`, function() {
            domScrollIntoView(ele, { block: a, inline: a })
            assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth', block: a, inline: a })
        })
    }

    //spec(K3): block、inline非預期視為未給(鍵不傳給原生API, 由瀏覽器用其預設)
    for (let [label, v] of BAD) {
        if (v === 'smooth' || (v instanceof String && String(v) === 'smooth')) {
            continue
        }
        it(`should not pass block and inline when they are ${label}`, function() {
            domScrollIntoView(ele, { block: v, inline: v })
            assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
            assert.strict.deepStrictEqual(Object.keys(calls[0].o), ['behavior'])
        })
    }

    it(`should check block and inline independently`, function() {
        domScrollIntoView(ele, { block: 'center', inline: 'bogus' })
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth', block: 'center' })
        domScrollIntoView(ele, { block: 'bogus', inline: 'end' })
        assert.strict.deepStrictEqual(calls[1].o, { behavior: 'smooth', inline: 'end' })
    })

    //spec: 未知鍵不直通給原生API
    it(`should not forward unknown keys`, function() {
        domScrollIntoView(ele, { foo: 1, left: 10, top: 20, preventScroll: true, behavior: 'auto' })
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'auto' })
        assert.strict.deepStrictEqual(Object.keys(calls[0].o), ['behavior'])
    })

    //spec: opt非一般物件視為{}
    for (let [label, v] of [['null', null], [`'x'`, 'x'], ['5', 5], ['[]', []], ['true', true], ['function', () => {}]]) {
        it(`should treat opt ${label} as {}`, function() {
            domScrollIntoView(ele, v)
            assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
        })
    }

    //spec(V11): 讀取拋錯之getter視為未給
    it(`should treat a key whose getter throws as not given`, function() {
        let opt = {}
        for (let k of ['behavior', 'block', 'inline']) {
            Object.defineProperty(opt, k, {
                enumerable: true,
                get() {
                    throw new Error('getter-boom')
                },
            })
        }
        domScrollIntoView(ele, opt)
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
    })

    //spec(K4): 每個鍵只讀一次, 檢測之值即使用之值(第一次有效、其後無效之存取器以第一次為準)
    it(`should read each key only once and use the checked value`, function() {
        let reads = { behavior: 0, block: 0, inline: 0 }
        let first = { behavior: 'instant', block: 'end', inline: 'center' }
        let opt = {}
        for (let k of Object.keys(reads)) {
            Object.defineProperty(opt, k, {
                enumerable: true,
                get() {
                    reads[k]++
                    return reads[k] === 1 ? first[k] : 'bogus'
                },
            })
        }
        domScrollIntoView(ele, opt)
        assert.strict.deepStrictEqual(reads, { behavior: 1, block: 1, inline: 1 })
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'instant', block: 'end', inline: 'center' })
    })

    //spec(V11): opt為已撤銷之Proxy(判型即拋錯)視為{}, 不外拋(內部獨立複審#2)
    it(`should treat a revoked Proxy opt as {}`, function() {
        let { proxy, revoke } = Proxy.revocable({}, {})
        revoke()
        assert.doesNotThrow(() => domScrollIntoView(ele, proxy))
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
    })

    //spec: opt須為一般物件: 帶屬性之陣列與函數雖可讀得behavior、block等鍵, 仍視為{}(變異M74: 拿掉判型則讀得其屬性)
    it(`should treat an array or a function carrying the keys as {} (not a plain object)`, function() {
        let a = []
        a.behavior = 'instant'
        a.block = 'end'
        let f = () => {}
        f.behavior = 'auto'
        f.inline = 'center'
        domScrollIntoView(ele, a)
        domScrollIntoView(ele, f)
        assert.strict.deepStrictEqual(calls[0].o, { behavior: 'smooth' })
        assert.strict.deepStrictEqual(calls[1].o, { behavior: 'smooth' })
    })

    //spec: 不改寫呼叫端之opt
    it(`should not modify the caller's opt`, function() {
        let opt = { behavior: 'bogus', block: 'center', foo: 1 }
        domScrollIntoView(ele, opt)
        assert.strict.deepStrictEqual(opt, { behavior: 'bogus', block: 'center', foo: 1 })
    })

})
