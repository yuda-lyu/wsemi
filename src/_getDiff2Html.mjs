import * as Diff2Html from 'diff2html'
import get from 'lodash-es/get.js'
import iseobj from './iseobj.mjs'
import isfun from './isfun.mjs'
import getGlobal from './getGlobal.mjs'
// console.log('Diff2Html', Diff2Html)


function getDiff2Html() {
    //nodejs須使用(* as Diff2Html)才能取得全部
    //因不打包, 瀏覽器端須先引用script再由window.Diff2Html取得

    if (Object.prototype.toString.call(Diff2Html) === '[object Module]') { //於nodejs會顯示module, 因不打包瀏覽器端會顯示object
        return Diff2Html
    }

    let g = getGlobal()

    let _g_Diff2Html_default = get(g, 'Diff2Html.default', null)

    let _g_Diff2Html = get(g, 'Diff2Html', null)

    let keyFun = 'html'

    if (iseobj(_g_Diff2Html_default) && isfun(_g_Diff2Html_default[keyFun])) {
        return _g_Diff2Html_default
    }

    if (iseobj(_g_Diff2Html) && isfun(_g_Diff2Html[keyFun])) {
        return _g_Diff2Html
    }

    console.log('Diff2Html', Diff2Html, 'g.Diff2Html', g.Diff2Html)
    throw new Error('invalid Diff2Html, g.Diff2Html, g.Diff2Html.default, use script for import')
}


export default getDiff2Html
