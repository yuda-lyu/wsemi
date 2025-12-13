import * as Diff from 'diff'
import get from 'lodash-es/get.js'
import iseobj from './iseobj.mjs'
import isfun from './isfun.mjs'
import getGlobal from './getGlobal.mjs'
// console.log('Diff', Diff)


function getDiff() {
    //nodejs須使用(* as Diff)才能取得全部
    //因不打包, 瀏覽器端須先引用script再由window.Diff取得

    if (Object.prototype.toString.call(Diff) === '[object Module]') { //於nodejs會顯示module, 因不打包瀏覽器端會顯示object
        return Diff
    }

    let g = getGlobal()

    let _g_Diff_default = get(g, 'Diff.default', null)

    let _g_Diff = get(g, 'Diff', null)

    let keyFun = 'diffLines'

    if (iseobj(_g_Diff_default) && isfun(_g_Diff_default[keyFun])) {
        return _g_Diff_default
    }

    if (iseobj(_g_Diff) && isfun(_g_Diff[keyFun])) {
        return _g_Diff
    }

    console.log('Diff', Diff, 'g.Diff', g.Diff)
    throw new Error('invalid Diff, g.Diff, g.Diff.default, use script for import')
}


export default getDiff
