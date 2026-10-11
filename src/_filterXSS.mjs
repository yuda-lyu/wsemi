import xss from 'xss'
import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import getGlobal from './getGlobal.mjs'


//getFilterXSS, 取得js-xss之filterXSS函數, mod供測試注入, 預設為import進來之xss
function getFilterXSS(mod = xss) {
    //xss於UMD為external, 打包後對應全域filterXSS且於wsemi載入當下即取值(見toolg/gDistRollup.mjs)
    //若xss於wsemi之後才載入(如clearXSSDyn、detectXSSDyn以importResources動態載入), import進來者為undefined, 須於執行時再找全域
    //js-xss瀏覽器版掛於window.filterXSS(見xss/lib/index.js), 舊版只找g.xss, 致動態載入後仍取不到而拋錯, 故先找g.filterXSS, g.xss僅保留相容

    if (isfun(mod)) {
        return mod
    }

    let g = getGlobal()

    let _g_filterXSS = get(g, 'filterXSS', null)
    if (isfun(_g_filterXSS)) {
        return _g_filterXSS
    }

    let _g_xss = get(g, 'xss', null)
    if (isfun(_g_xss)) {
        return _g_xss
    }

    throw new Error('invalid filterXSS, g.filterXSS, use script for import')
}


//getOpt, 取得clearXSS與detectXSS共用之js-xss設定(單一出處), 白名單、網址判定與白名單外標籤之處理皆用js-xss預設, 只另保留白名單外之style屬性(值跳脫<>")
function getOpt(filterXSS) {
    return {
        onIgnoreTagAttr: function(tag, name, value, isWhiteAttr) {
            if (name === 'style') {
                return name + '="' + filterXSS.escapeAttrValue(value) + '"'
            }
        },
    }
}


let fxss = {
    getFilterXSS,
    getOpt,
}


export default fxss
