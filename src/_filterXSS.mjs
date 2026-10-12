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


//reTagStart, 會開始標籤之<: 依HTML規格(Tag open state), <後接英文字母、斜線、驚嘆號或問號才進入標籤、結束標籤、註解等狀態, 其餘之<為一般文字
//結尾之<亦轉義: 其後字元由組裝處決定, 如兩欄相鄰組進畫面時, 前一欄結尾之<會與後一欄開頭之字母拼成標籤
//js-xss會分段呼叫escapeHtml, 段尾之<亦視為結尾而轉義, 只多轉義不影響安全(如'a << b'為'a &lt;< b')
let reTagStart = /<(?=[A-Za-z!/?]|$)/g


//escapeHtml, 取代js-xss預設之escapeHtml(<與>全部轉義), 只轉義會開始標籤之<, 令數學式、箭頭、markdown引用等之<與>維持原樣
//js-xss以此處理標籤外之文字與白名單外之標籤; >於標籤外恆為一般文字故不轉義; 白名單內標籤之屬性值由js-xss之escapeAttrValue另行轉義<>"而不經此函數
//輸出僅供HTML內文使用, 放入屬性值或註解內並不安全(引號、空白與'-->'皆未轉義)
function escapeHtml(html) {
    return html.replace(reTagStart, '&lt;')
}


//getOpt, 取得clearXSS與detectXSS共用之js-xss設定(單一出處), 白名單、網址判定與白名單外標籤之處理皆用js-xss預設, 另保留白名單外之style屬性(值跳脫<>"), 文字之轉義改用escapeHtml
function getOpt(filterXSS) {
    return {
        escapeHtml,
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
