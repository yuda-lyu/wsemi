import assert from 'assert'
import isEleExistByID from '../src/isEleExistByID.mjs'
import { withGlobal } from './tools/envGlobal.mjs'


describe(`isEleExistByID 非瀏覽器環境與判準(R-ENV-01)`, function() {

    //docStub, document替身: 只有id為'app'之元素存在
    let docStub = {
        getElementById: (id) => {
            return id === 'app' ? { id } : null
        },
    }

    it(`should return false without throwing when document is not defined and id is an effective string [R-ENV-01]`, function() {
        withGlobal('document', undefined, () => {
            assert.strict.deepStrictEqual(typeof document, 'undefined') //前置: document為未宣告之全域
            //R-ENV-01: 讀取瀏覽器全域前以typeof防護, 非目標環境回false不拋錯; JSDoc「非瀏覽器環境(無document)回傳false」
            let r = null
            assert.doesNotThrow(() => {
                r = isEleExistByID('app')
            })
            assert.strict.deepStrictEqual(r, false)
        })
    })

    it(`should return true when the element exists [R-ENV-01]`, function() {
        withGlobal('document', docStub, () => {
            //JSDoc: 前端判斷元素id是否存在; R-ENV-01: 防護不改判準
            assert.strict.deepStrictEqual(isEleExistByID('app'), true)
        })
    })

    it(`should return false when the element does not exist [R-ENV-01]`, function() {
        withGlobal('document', docStub, () => {
            //JSDoc: 前端判斷元素id是否存在; R-ENV-01: 防護不改判準
            assert.strict.deepStrictEqual(isEleExistByID('none'), false)
        })
    })

})
