import * as ht from 'html-to-text'
import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import iseobj from './iseobj.mjs'
import waitFun from './waitFun.mjs'
// console.log('ht', ht)


async function getHtmlToText() {
    //nodejs須使用(* as ht)才能取得全部
    //因不打包, 瀏覽器端須先引用script再由window.ht取得

    let keyFun = 'htmlToText'

    //直接探測import進來的ht是否具備htmlToText, 不靠Object.prototype.toString的'[object Module]'判斷
    //(打包後bundler interop產生的namespace為無Symbol.toStringTag的純物件, toString回'[object Object]'會誤判)
    //可涵蓋nodejs native ESM namespace, 以及bundler interop後htmlToText為複製getter或掛在default之情形
    if (isfun(get(ht, keyFun))) {
        return ht
    }
    if (isfun(get(ht, ['default', keyFun]))) {
        return ht.default
    }

    let g = globalThis
    // let g = getGlobal()

    //fallback: 因html-to-text於瀏覽器端沒有umd版只有esm, 故使用import再掛入window為defer會有延遲載入問題, 得要偵測等待
    let _g_ht = null
    await waitFun(() => {
        _g_ht = get(g, 'ht', null)
        return iseobj(_g_ht)
    }, { attemptNum: 4000, timeInterval: 50 })

    if (isfun(get(_g_ht, keyFun))) {
        return _g_ht
    }
    if (isfun(get(_g_ht, ['default', keyFun]))) {
        return _g_ht.default
    }

    console.log('ht', ht, 'g.ht', g.ht)
    throw new Error('invalid ht, g.ht, g.ht.default, use script for import')
}


export default getHtmlToText
