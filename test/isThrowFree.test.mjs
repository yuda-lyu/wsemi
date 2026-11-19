import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { hostileValues, revoked } from './tools/hostileValues.mjs'


//判斷函數不應拋錯(使用者2026-11-16 W-20/W-21 之批6裁定③; dspec〈輸入參數之檢測機制〉§5.3 C2: 判斷類函數回布林、永不拋錯)
//逐函數表: src內全部is*.mjs(以readdir取全集, 新增之is*函數自動入表) × 惡意輸入集(hostileValues: 已撤銷之Proxy、陷阱全拋錯之Proxy、讀取內部標籤或常讀鍵即拋錯之物件、元素存取即拋錯之陣列)
//  期望: 對任何值皆不拋錯且回傳布林值false(isernot為其反面true); 僅下列三個函數屬設計上之例外(非判斷函數, 以拋錯或reject回報不合格):
//    isUserPw: 驗證函數, 輸入無效即同步拋出'密碼非有效字串'(既有契約)
//    isUserName、isUserIdentify: 驗證函數, 回傳Promise, 輸入無效即reject
let srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')

let names = fs.readdirSync(srcDir)
    .filter((f) => /^is[A-Za-z0-9]*\.mjs$/.test(f))
    .map((f) => f.replace(/\.mjs$/, ''))

let validators = new Set(['isUserPw', 'isUserName', 'isUserIdentify'])

//opt為第2參數之判斷函數(其opt讀取亦不得拋錯, K3: opt之非預期輸入視為未給)
let optFns = ['isint', 'ispint', 'isp0int', 'isDate', 'isenum', 'iseint']


describe(`判斷函數不應拋錯: src內全部is*函數 × 惡意輸入(W-20/W-21 批6裁定③)`, function() {

    it(`函數全集涵蓋預期之判斷函數(isstr、isnum、isobj、isarr、isfun、isDate等), 且至少40個`, function() {
        assert.strict.ok(names.length >= 40, `names=${names.length}`)
        for (let n of ['isstr', 'isestr', 'isbol', 'isnum', 'isint', 'isobj', 'isarr', 'iseobj', 'isearr', 'isfun', 'isDate', 'isnull', 'isundefined', 'iser', 'isernot', 'isnan', 'isab', 'isbigint', 'isblob', 'isfile', 'isu8arr', 'isu16arr', 'isEle', 'isErr', 'isenum', 'iseint']) {
            assert.strict.ok(names.includes(n), n)
        }
    })

    for (let n of names) {

        it(`${n}(惡意值) 不拋錯`, async function() {
            let mod = await import(pathToFileURL(path.join(srcDir, `${n}.mjs`)).href)
            let f = mod.default

            for (let h of hostileValues()) {
                if (validators.has(n)) {
                    //驗證函數: isUserPw依既有契約同步拋固定訊息; isUserName、isUserIdentify回傳Promise(reject), 不同步拋錯
                    if (n === 'isUserPw') {
                        assert.strict.throws(() => f(h.value), /密碼非有效字串/, h.name)
                    }
                    else {
                        let pm = f(h.value)
                        assert.strict.ok(pm && typeof pm.then === 'function', h.name)
                        await assert.strict.rejects(pm, undefined, h.name)
                    }
                    continue
                }
                let r
                assert.strict.doesNotThrow(() => {
                    r = f(h.value)
                }, h.name)
                if (n === 'isProxy') {
                    //isProxy判斷是否為Proxy(以util.types內部槽, 不觸發陷阱), 已撤銷之Proxy與陷阱全拋錯之Proxy本就是Proxy而為true, 其餘為false
                    assert.strict.deepStrictEqual([h.name, r], [h.name, /proxy/.test(h.name)])
                }
                else if (h.unjudgeable) {
                    //型別本身無法判定(內部標籤讀取拋錯): 不屬任何判斷之型別, 恆為false(isernot為iser之反面)
                    assert.strict.deepStrictEqual([h.name, r], [h.name, n === 'isernot'])
                }
                else {
                    //型別可判定, 僅其後之存取拋錯: 恆為布林(結果依型別而定, 見下方各函數之具體案)
                    assert.strict.deepStrictEqual([h.name, typeof r], [h.name, 'boolean'])
                }
            }
        })

    }

    it(`型別可判定而其後存取拋錯者: 依型別判定, 無法繼續判定之內容檢查回false(isobj、isarr為true; iseobj、isobj0、isearr、isarr0、isarr1之內容檢查拋錯者為false)`, async function() {
        let get = async (n) => (await import(pathToFileURL(path.join(srcDir, `${n}.mjs`)).href)).default
        let [isobj, isarr, iseobj, isobj0, isearr, isarr0, isarr1, iser] = await Promise.all(['isobj', 'isarr', 'iseobj', 'isobj0', 'isearr', 'isarr0', 'isarr1', 'iser'].map(get))
        let hv = Object.fromEntries(hostileValues().map((h) => [h.name, h.value]))

        //讀取length、constructor等鍵拋錯之一般物件仍是物件: isobj為true, 有自有可列舉鍵故iseobj為true、isobj0為false
        for (let k of ['length-getter-throws', 'constructor-getter-throws', 'then-getter-throws', 'nodeType-getter-throws', 'valueOf-getter-throws']) {
            assert.strict.deepStrictEqual([k, isobj(hv[k]), iseobj(hv[k]), isobj0(hv[k]), isarr(hv[k])], [k, true, true, false, false])
        }

        //列舉鍵(ownKeys、getPrototypeOf)或取自有描述子拋錯之物件Proxy: 仍為物件(isobj為true), 內容檢查無法完成故iseobj、isobj0皆回false
        for (let k of ['object-proxy-ownKeys-throws', 'object-proxy-getPrototypeOf-throws']) {
            assert.strict.deepStrictEqual([k, isobj(hv[k]), iseobj(hv[k]), isobj0(hv[k])], [k, true, false, false])
        }
        assert.strict.deepStrictEqual(['object-proxy-getOwnPropertyDescriptor-throws', iseobj(hv['object-proxy-getOwnPropertyDescriptor-throws'])], ['object-proxy-getOwnPropertyDescriptor-throws', false])

        //元素或長度讀取拋錯之陣列: 仍為陣列(isarr為true), 內容檢查無法完成故isearr、isarr0、isarr1皆回false
        for (let k of ['array-first-element-getter-throws', 'array-proxy-first-element-get-throws']) {
            assert.strict.deepStrictEqual([k, isarr(hv[k]), isearr(hv[k]), iser(hv[k])], [k, true, false, false])
        }
        assert.strict.deepStrictEqual(['array-proxy-length-get-throws', isarr(hv['array-proxy-length-get-throws']), isearr(hv['array-proxy-length-get-throws']), isarr0(hv['array-proxy-length-get-throws']), isarr1(hv['array-proxy-length-get-throws'])], ['array-proxy-length-get-throws', true, false, false, false])
    })

    for (let n of optFns) {

        it(`${n}(有效值, 惡意opt) 不拋錯且與未給opt同結果(opt非預期輸入視為未給)`, async function() {
            let mod = await import(pathToFileURL(path.join(srcDir, `${n}.mjs`)).href)
            let f = mod.default
            for (let h of hostileValues()) {
                for (let v of ['5', 5, '2019-01-01']) {
                    let want = f(v)
                    let r
                    assert.strict.doesNotThrow(() => {
                        r = f(v, h.value)
                    }, `${n}:${h.name}`)
                    assert.strict.deepStrictEqual([h.name, v, r], [h.name, v, want])
                }
            }
        })

    }

    it(`其他判斷入口(非is*命名): haskey(has陷阱拋錯之Proxy)、isNarrow(元素讀取clientWidth拋錯)、domIsRendered(讀取nodeType等拋錯)不拋錯, 回false`, async function() {
        let get = async (n) => (await import(pathToFileURL(path.join(srcDir, `${n}.mjs`)).href)).default
        let [haskey, isNarrow, domIsRendered] = await Promise.all(['haskey', 'isNarrow', 'domIsRendered'].map(get))
        let hasThrows = new Proxy({ a: 1 }, {
            has() {
                throw new Error('boom')
            },
        })
        //對照: 正常之物件仍為true
        assert.strict.deepStrictEqual([haskey({ a: 1 }, 'a'), haskey({ a: 1 }, 'b'), haskey(hasThrows, 'a')], [true, false, false])
        for (let h of hostileValues()) {
            let r
            assert.doesNotThrow(() => {
                r = [haskey(h.value, 'a'), domIsRendered(h.value)]
            }, h.name)
            //domIsRendered: 非元素一律false; haskey: 型別無法判定者false, 型別可判定者依key in obj(布林)
            assert.strict.deepStrictEqual([h.name, r[1], typeof r[0], h.unjudgeable ? r[0] : false], [h.name, false, 'boolean', false])
        }
        //isNarrow: 於(假)瀏覽器環境, 元素讀取clientWidth拋錯者視為取不到寬度(只依視窗寬度判定)
        let { withGlobal } = await import('./tools/envGlobal.mjs')
        withGlobal('window', { innerWidth: 2000, document: {} }, () => {
            assert.strict.deepStrictEqual(isNarrow({ clientWidth: 500 }), true) //對照: 元素寬度窄
            assert.strict.deepStrictEqual(isNarrow({ clientWidth: 2000 }), false)
            for (let h of hostileValues()) {
                let r
                assert.doesNotThrow(() => {
                    r = isNarrow(h.value)
                }, h.name)
                assert.strict.deepStrictEqual([h.name, typeof r], [h.name, 'boolean'])
            }
        })
        withGlobal('window', { innerWidth: 500, document: {} }, () => {
            assert.strict.deepStrictEqual(isNarrow(revoked({})), true) //視窗窄即true, 元素不可讀不影響
        })
    })

    it(`已撤銷之Proxy(物件、函數、陣列)對isstr、isnum、isobj、isarr、isfun皆回false(typeof與內部標籤皆不拋錯)`, async function() {
        let fns = await Promise.all(['isstr', 'isnum', 'isobj', 'isarr', 'isfun', 'isnbr', 'isbol'].map(async (n) => (await import(pathToFileURL(path.join(srcDir, `${n}.mjs`)).href)).default))
        for (let target of [{}, function() {}, []]) {
            let p = revoked(target)
            for (let f of fns) {
                assert.strict.deepStrictEqual(f(p), false)
            }
        }
    })

})
