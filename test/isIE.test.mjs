import assert from 'assert'
import isIE from '../src/isIE.mjs'
import { withGlobal } from './tools/envGlobal.mjs'


describe(`isIE 非瀏覽器環境與判準(R-ENV-01)`, function() {

    let uaIE11 = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko'
    let uaChrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

    it(`should return false without throwing when navigator is not defined [R-ENV-01]`, function() {
        //Node 21+內建navigator, 以withGlobal暫時移除並於結束後還原, 模擬無navigator之環境(Node 21以前)
        withGlobal('navigator', undefined, () => {
            assert.strict.deepStrictEqual(typeof navigator, 'undefined') //前置: navigator為未宣告之全域
            //R-ENV-01: 讀取瀏覽器全域前以typeof防護, 非目標環境回false不拋錯; JSDoc「非瀏覽器環境(無navigator)回傳false」
            let r = null
            assert.doesNotThrow(() => {
                r = isIE()
            })
            assert.strict.deepStrictEqual(r, false)
        })
    })

    it(`should return false without throwing when navigator has no string userAgent [R-ENV-01]`, function() {
        withGlobal('navigator', {}, () => {
            //R-ENV-01: 環境判斷函數於非目標環境回false、不拋錯(有navigator而無字串userAgent者非瀏覽器)
            let r = null
            assert.doesNotThrow(() => {
                r = isIE()
            })
            assert.strict.deepStrictEqual(r, false)
        })
    })

    it(`should return true when navigator.userAgent is IE11 [R-ENV-01]`, function() {
        withGlobal('navigator', { userAgent: uaIE11 }, () => {
            //JSDoc: 前端判斷瀏覽器是否為IE; R-ENV-01: 防護不改判準
            assert.strict.deepStrictEqual(isIE(), true)
        })
    })

    it(`should return false when navigator.userAgent is Chrome [R-ENV-01]`, function() {
        withGlobal('navigator', { userAgent: uaChrome }, () => {
            //JSDoc: 前端判斷瀏覽器是否為IE; R-ENV-01: 防護不改判準
            assert.strict.deepStrictEqual(isIE(), false)
        })
    })

})
