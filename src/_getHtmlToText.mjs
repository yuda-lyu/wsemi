import * as ht from 'html-to-text'
import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import iseobj from './iseobj.mjs'
import waitFun from './waitFun.mjs'
// console.log('ht', ht)


async function getHtmlToText() {
    //nodejs須使用(* as ht)才能取得全部
    //因不打包, 瀏覽器端須先引用script再由window.ht取得

    if (Object.prototype.toString.call(ht) === '[object Module]') { //於nodejs會顯示module, 因不打包瀏覽器端會顯示object
        return ht
    }

    let g = globalThis
    // let g = getGlobal()

    let _g_ht_default = get(g, 'ht.default', null)

    let _g_ht = null
    await waitFun(() => {
        _g_ht = get(g, 'ht', null)
        return iseobj(_g_ht) //因html-to-text於瀏覽器端沒有umd版只有esm, 故使用import再掛入window為defer會有延遲載入問題, 得要偵測等待
    }, { timeInterval: 50 })

    let keyFun = 'htmlToText'

    if (iseobj(_g_ht_default) && isfun(_g_ht_default[keyFun])) {
        return _g_ht_default
    }

    if (iseobj(_g_ht) && isfun(_g_ht[keyFun])) {
        return _g_ht
    }

    console.log('ht', ht, 'g.ht', g.ht)
    throw new Error('invalid ht, g.ht, g.ht.default, use script for import')
}


export default getHtmlToText
