import assert from 'assert'
import cdbl from '../src/cdbl.mjs'
import cint from '../src/cint.mjs'
import cstr from '../src/cstr.mjs'
import cbol from '../src/cbol.mjs'
import cfilesize from '../src/cfilesize.mjs'
import cfinancial from '../src/cfinancial.mjs'
import dig from '../src/dig.mjs'
import digExp from '../src/digExp.mjs'
import isUserPw from '../src/isUserPw.mjs'
import { hostileValues, withGetter } from './tools/hostileValues.mjs'


//第551項(排程第492項第10批): 轉型函數對惡意值不拋錯(dspec〈輸入參數之檢測機制〉§5.3 C1: 無法轉型者回預設值, 不拋錯; K3: opt給了而讀取拋錯視為未給)
//  惡意值全集: test/tools/hostileValues.mjs(19值: 已撤銷之Proxy、陷阱全拋錯之Proxy、讀取內部標籤或常讀鍵即拋錯之物件、元素存取即拋錯之陣列等)
//  原拋錯點: cstr經lodash isSymbol對已撤銷之Proxy拋錯; cint之opt讀取(get(opt, ...))對已撤銷之Proxy與鍵之存取器拋錯; isUserPw之opt讀取同
//  期望值皆手寫


let hv = hostileValues()


describe(`C1轉型函數: 惡意值作主參數 → 回預設值、不拋錯(hostileValues 19值逐格)`, function() {

    //[函數, 預設值]
    let fns = [
        ['cdbl', cdbl, 0],
        ['cint', cint, 0],
        ['cstr', cstr, ''],
        ['cbol', cbol, false],
    ]

    for (let [name, f, def] of fns) {
        for (let h of hv) {
            it(`${name}(${h.name}) 不拋錯並回傳預設值 ${JSON.stringify(def)}`, function() {
                let r
                assert.doesNotThrow(() => {
                    r = f(h.value)
                })
                assert.ok(r === def, `${name}(${h.name}) must be the default`)
            })
        }
    }

})


describe(`cint: opt為惡意值或其鍵讀取即拋錯 → 視為未給(K3), 不拋錯`, function() {

    for (let h of hv) {
        it(`cint('5.4', ${h.name}) 回傳5(opt視為未給)`, function() {
            let r
            assert.doesNotThrow(() => {
                r = cint('5.4', h.value)
            })
            assert.ok(r === 5, `cint with opt ${h.name}`)
        })
    }

    it(`opt之useClampSafe、useLimitSafe、returnWithStateAndMsg各鍵之讀取拋錯時該鍵視為未給, 其餘鍵照常生效`, function() {
        let keys = ['useClampSafe', 'useLimitSafe', 'returnWithStateAndMsg']
        for (let k of keys) {
            let others = Object.fromEntries(keys.filter((x) => x !== k).map((x) => [x, true]))
            let opt = withGetter({ ...others }, k)
            let r
            assert.doesNotThrow(() => {
                r = cint('5.4', opt)
            })
            //鍵k視為未給(false), 其餘為true: returnWithStateAndMsg讀取拋錯時回傳純值5; 其他鍵不影響5之結果
            if (k === 'returnWithStateAndMsg') {
                assert.ok(r === 5, k)
            }
            else {
                assert.strict.deepStrictEqual(r, { state: 'success', msg: 5 }, k)
            }
        }
    })

    it(`useLimitSafe之讀取拋錯視為未給: 超出安全整數時不拋錯(原為opt讀取拋錯而外拋)`, function() {
        let opt = withGetter({}, 'useLimitSafe')
        assert.doesNotThrow(() => cint(1e300, opt))
        let r = cint(1e300, { useLimitSafe: true, returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual([r.state, r.msg], ['error', 'invalid v: must be a safe integer']) //對照: 正常之useLimitSafe仍生效, 訊息不帶值
    })

    it(`其餘既有行為不變: useLimitSafe為true且無returnWithStateAndMsg時仍拋出(設定之契約, 非惡意值)`, function() {
        assert.throws(() => cint(1e300, { useLimitSafe: true }), /invalid v: must be a safe integer/)
        assert.strict.deepStrictEqual(cint(1e300, { useClampSafe: true }), Number.MAX_SAFE_INTEGER)
    })

})


describe(`cstr: BigInt與Symbol之處理(判型改用typeof, 包裝物件照舊拆包)`, function() {

    it(`原始BigInt、Symbol、字串、數字照常轉字串`, function() {
        assert.strict.deepStrictEqual([cstr(123n), cstr(Symbol('a')), cstr('x'), cstr(2.5)], ['123', 'Symbol(a)', 'x', '2.5'])
    })

    it(`包裝物件照舊拆包: Object(1n)、Object(Symbol('b'))、new String、new Number(轉型函數照舊轉換)`, function() {
        assert.strict.deepStrictEqual(cstr(Object(1n)), '1')
        assert.strict.deepStrictEqual(cstr(Object(Symbol('b'))), 'Symbol(b)')
        assert.strict.deepStrictEqual([cstr(new String('s')), cstr(new Number(7))], ['s', '7']) // eslint-disable-line no-new-wrappers
    })

    it(`偽造Symbol.toStringTag為BigInt或Symbol之一般物件不是包裝物件: 回傳預設值''`, function() {
        assert.strict.deepStrictEqual(cstr({ [Symbol.toStringTag]: 'BigInt' }), '')
        assert.strict.deepStrictEqual(cstr({ [Symbol.toStringTag]: 'Symbol' }), '')
        assert.strict.deepStrictEqual(cstr({ [Symbol.toStringTag]: 'String', toString: () => 'x' }), '')
    })

    it(`已撤銷之Proxy與陷阱全拋錯之Proxy回傳''(原經lodash isSymbol拋TypeError)`, function() {
        for (let h of hv.filter((x) => /proxy/.test(x.name))) {
            assert.strict.deepStrictEqual(cstr(h.value), '', h.name)
        }
    })

})


describe(`isUserPw: opt為惡意值或其鍵讀取即拋錯 → 視為未給(K3), 不拋錯`, function() {

    let PW = 'Abcdef12!' //預設政策: 長度8~30、含字母大小寫數字與特殊符號

    it(`對照: 預設政策下 '${PW}' 通過、過短者依既有契約拋固定訊息`, function() {
        assert.strict.deepStrictEqual(isUserPw(PW), true)
        assert.throws(() => isUserPw('a'), /密碼/)
        assert.throws(() => isUserPw(null), /密碼非有效字串/)
    })

    for (let h of hv) {
        it(`isUserPw(pw, ${h.name}) 與無opt之結果相同(true)`, function() {
            let r
            assert.doesNotThrow(() => {
                r = isUserPw(PW, h.value)
            })
            assert.strict.deepStrictEqual(r, true)
        })
    }

    let keys = ['useKeyForError', 'useOnlyOneError', 'numLenMin', 'numLenMax', 'noSpace', 'onlyAscii', 'requireLetter', 'requireUppercase', 'requireLowercase', 'requireDigit', 'requireSpecial', 'forbiddenChars', 'commonPasswordBlacklist', 'account', 'noConsecutiveCharsFromAccount', 'consecutiveCharsMinMatch']
    for (let k of keys) {
        it(`opt.${k}之讀取拋錯視為未給(同無opt): 不拋錯, 結果true`, function() {
            let opt = withGetter({}, k)
            let r
            assert.doesNotThrow(() => {
                r = isUserPw(PW, opt)
            })
            assert.strict.deepStrictEqual(r, true)
        })
    }

    it(`opt.debug、opt.funLog經快照之惰性存取器仍生效: 非預期之numLenMin於debug為true時警告一次(固定詞彙, 不含值); debug之讀取拋錯視為未給(不警告、不拋錯); 業務鍵全有效時不讀debug`, function() {
        let warns = []
        let funLog = (msg, info) => warns.push([msg, info])
        assert.strict.deepStrictEqual(isUserPw(PW, { numLenMin: 'x-secret', debug: true, funLog }), true)
        assert.strict.deepStrictEqual(warns.length, 1)
        assert.strict.deepStrictEqual(JSON.stringify(warns).includes('x-secret'), false)
        assert.strict.deepStrictEqual([warns[0][1].fn, warns[0][1].key], ['isUserPw', 'opt.numLenMin'])
        //debug之getter拋錯: 視為未給, 不警告、不拋錯
        let warns2 = []
        let opt = withGetter({ numLenMin: 'x', funLog: (m) => warns2.push(m) }, 'debug')
        assert.doesNotThrow(() => isUserPw(PW, opt))
        assert.strict.deepStrictEqual(warns2, [])
        //業務鍵全有效(或未給)時不讀debug
        let reads = 0
        let opt3 = { numLenMin: 8 }
        Object.defineProperty(opt3, 'debug', {
            enumerable: true,
            get() {
                reads += 1
                return true
            },
        })
        assert.strict.deepStrictEqual(isUserPw(PW, opt3), true)
        assert.strict.deepStrictEqual(reads, 0)
    })

    it(`有效之opt仍生效(惰性讀取debug不變): numLenMin為20時 '${PW}' 不通過; 非預期之numLenMin改用預設(K3)`, function() {
        assert.throws(() => isUserPw(PW, { numLenMin: 20 }), /密碼/)
        assert.strict.deepStrictEqual(isUserPw(PW, { numLenMin: 'x' }), true)
    })

})


describe(`其他轉型與格式化函數同形盤點: 惡意值作任一位置之引數皆不拋錯(hostileValues逐格)`, function() {

    //盤點(tmp探測): 下列函數於修前即不拋錯, 鎖定之; 其餘轉型類(編碼、時間字串等)之opt讀取同形缺陷見報告〈同形盤點〉
    let fns = [['cdbl', cdbl], ['cint', cint], ['cstr', cstr], ['cbol', cbol], ['cfilesize', cfilesize], ['cfinancial', cfinancial], ['dig', dig], ['digExp', digExp]]

    for (let [name, f] of fns) {
        it(`${name}: 惡意值於第1、2、3引數(搭配有效之其餘引數)皆不拋錯`, function() {
            for (let h of hv) {
                for (let pos of [0, 1, 2]) {
                    let a1 = ['12.5', 2, {}]
                    let a2 = [12.5, 'abc', 'abc']
                    for (let args of [a1, a2]) {
                        args = args.slice()
                        args[pos] = h.value
                        assert.doesNotThrow(() => {
                            f(...args)
                        }, `${name} ${h.name}@${pos}`)
                    }
                }
            }
        })
    }

})
