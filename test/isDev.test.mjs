import assert from 'assert'
import isDev from '../src/isDev.mjs'
import { withGlobal } from './tools/envGlobal.mjs'


describe(`isDev 非瀏覽器環境與判準(R-ENV-01)`, function() {

    it(`should return false without throwing when location is not defined [R-ENV-01]`, function() {
        withGlobal('location', undefined, () => {
            assert.strict.deepStrictEqual(typeof location, 'undefined') //前置: location為未宣告之全域
            //R-ENV-01: 讀取瀏覽器全域前以typeof防護, 非目標環境回false不拋錯; JSDoc「非瀏覽器環境(無location)回傳false」
            let r = null
            assert.doesNotThrow(() => {
                r = isDev()
            })
            assert.strict.deepStrictEqual(r, false)
        })
    })

    it(`should return true when location.href contains localhost [R-ENV-01]`, function() {
        withGlobal('location', { href: 'http://localhost:8080/app' }, () => {
            //R-ENV-01: 判準不變, location.href含localhost為開發
            assert.strict.deepStrictEqual(isDev(), true)
        })
    })

    it(`should return false when location.href is 'http://127.0.0.1/' [R-ENV-01]`, function() {
        withGlobal('location', { href: 'http://127.0.0.1/' }, () => {
            //R-ENV-01: 判準不變, 只以location.href是否含localhost判定(下游e2e依賴此判準)
            assert.strict.deepStrictEqual(isDev(), false)
        })
    })

})
