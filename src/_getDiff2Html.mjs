import * as Diff2Html from 'diff2html'
import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import getGlobal from './getGlobal.mjs'
// console.log('Diff2Html', Diff2Html)


//getDiff2Html, 取得diff2html模組物件, mod供測試注入, 預設為import進來之namespace
function getDiff2Html(mod = Diff2Html) {
    //nodejs須使用(* as Diff2Html)才能取得全部
    //diff2html已打包進UMD, 瀏覽器端若另以script引入則由window.Diff2Html取得

    let keyFun = 'html'

    //直接探測import進來的Diff2Html是否具備html, 不靠Object.prototype.toString的'[object Module]'判斷
    //(打包後bundler interop產生的namespace為無Symbol.toStringTag的無原型純物件, toString回'[object Object]'會誤判為未載入, 使UMD版於nodejs與瀏覽器皆落到找全域而拋錯)
    //可涵蓋nodejs native ESM namespace, 以及bundler interop後html為複製getter或掛在default之情形, 作法同_getHtmlToText
    if (isfun(get(mod, keyFun))) {
        return mod
    }
    if (isfun(get(mod, ['default', keyFun]))) {
        return mod.default
    }

    let g = getGlobal()

    let _g_Diff2Html_default = get(g, 'Diff2Html.default', null)

    let _g_Diff2Html = get(g, 'Diff2Html', null)

    if (isfun(get(_g_Diff2Html_default, keyFun))) {
        return _g_Diff2Html_default
    }

    if (isfun(get(_g_Diff2Html, keyFun))) {
        return _g_Diff2Html
    }

    console.log('Diff2Html', mod, 'g.Diff2Html', get(g, 'Diff2Html'))
    throw new Error('invalid Diff2Html, g.Diff2Html, g.Diff2Html.default, use script for import')
}


export default getDiff2Html
