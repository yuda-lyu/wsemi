import isestr from './isestr.mjs'
import htmlDecode from './htmlDecode.mjs'
import fxss from './_filterXSS.mjs'


//reTagName, 由原始標籤片段取名稱, 名稱後須接HTML空白、斜線、大於或結尾
//js-xss取標籤名至第一個空白為止, <svg/onload=...>之名稱為整串而不在白名單, 瀏覽器則視斜線為屬性分隔而執行, 故由原始片段重取
//可排除'孔深 < 500 m'之空名稱、'5<6>4'之數字開頭、'<o:p>'之冒號名稱與註解'<!--', 且未閉合之'<script'不會被截成scrip
let reTagName = /^<\/?([a-z][a-z0-9-]*)(?=[\t\n\f\r />]|$)/i

//reEventName, 事件屬性名稱, on接英文字母
let reEventName = /^on[a-z]+$/i

//reScheme, 須回報之網址協定
let reScheme = /^(javascript|vbscript|data):/


//getScheme, 依瀏覽器解析網址之方式正規化屬性值後取協定, 非回報對象者回傳空字串
function getScheme(value) {

    //依HTML5規則解碼字元參照(屬性值模式), 涵蓋具名(如&Tab;、&colon;)與數值(可無分號)
    let u = htmlDecode(value, { isAttributeValue: true })

    //瀏覽器解析網址時會刪除tab與換行
    u = u.replace(/[\t\n\r]/g, '')

    //瀏覽器解析網址時會刪除開頭之控制字元與空白(字碼0~32)
    let i = 0
    while (i < u.length && u.charCodeAt(i) <= 32) {
        i++
    }
    u = u.slice(i).toLowerCase()

    let m = reScheme.exec(u)
    return m ? m[1] : ''
}


/**
 * 偵測字串內之xss攻擊語法，回傳clearXSS會轉義或刪除之可疑項目，供提示用，不改寫資料
 *
 * Depend on: {@link https://jsxss.com/zh/index.html https://jsxss.com/zh/index.html}
 *
 * 與clearXSS共用同一份js-xss設定(白名單、網址判定、白名單外之style屬性保留)，判定規則：
 *
 * 1. 標籤(type為'tag')：白名單外之標籤，名稱由原始標籤片段取得且其後須接空白、斜線、大於或結尾，故含'<svg/onload=...>'，不含'孔深 < 500 m'、'5<6>4'、'<o:p>'
 *
 * 2. 屬性(type為'attr')：白名單內標籤被刪除之事件屬性，名稱為on接英文字母且有值，故不含'a<b and once>c'之once
 *
 * 3. 網址(type為'url')：白名單內標籤之href或src被擋下，且依HTML5規則解碼字元參照、刪除tab與換行、刪除開頭控制字元與空白後，協定為javascript、vbscript或data，相對網址被擋不計
 *
 * 4. 註解：js-xss先刪註解再解析，與瀏覽器之註解規則不同(如'--!>'亦結束註解)，有註解時另保留註解再解析一次取聯集，註解本身不計
 *
 * 5. 重複項目合併為1筆，依出現順序排列
 *
 * 限制：style屬性比照clearXSS保留不檢查；非HTML之純文字(如'javascript:alert(1)')不偵測，網址欄位須另檢查協定
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/detectXSS.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入字串
 * @returns {Array} 回傳偵測項目陣列，無則回傳空陣列，非字串或空字串回傳空陣列，項目為{ type: 'tag', tag }、{ type: 'attr', tag, name }或{ type: 'url', tag, name, scheme }
 * @example
 *
 * console.log(detectXSS('<img src=x onerror=alert(1)><script>alert(1)</script>'))
 * // => [ { type: 'attr', tag: 'img', name: 'onerror' }, { type: 'tag', tag: 'script' } ]
 *
 * console.log(detectXSS('<svg/onload=alert(1)>'))
 * // => [ { type: 'tag', tag: 'svg' } ]
 *
 * console.log(detectXSS('<a href="jav&#x09;ascript:alert(1)">點我</a>'))
 * // => [ { type: 'url', tag: 'a', name: 'href', scheme: 'javascript' } ]
 *
 * console.log(detectXSS('<!-- --!><script>alert(1)</script>-->'))
 * // => [ { type: 'tag', tag: 'script' } ]
 *
 * console.log(detectXSS('&lt;b&gt; 為粗體標籤'))
 * // => []
 *
 * console.log(detectXSS('孔深 < 500 m 且 > 10 m'))
 * // => []
 *
 * console.log(detectXSS('a<b and once>c'))
 * // => []
 *
 * console.log(detectXSS('<div style="text-align:center;">圖1 名稱</div>'))
 * // => []
 *
 * console.log(detectXSS('<img src="pics/a.png" alt="圖">'))
 * // => []
 *
 */
function detectXSS(str) {

    //check
    if (!isestr(str)) {
        return []
    }

    //filterXSS, opt, 與clearXSS共用設定
    let filterXSS = fxss.getFilterXSS()
    let opt = fxss.getOpt(filterXSS)

    //共用設定之原處理, 未給者為js-xss預設
    let baseOnIgnoreTag = opt.onIgnoreTag || filterXSS.onIgnoreTag
    let baseOnIgnoreTagAttr = opt.onIgnoreTagAttr || filterXSS.onIgnoreTagAttr
    let baseSafeAttrValue = opt.safeAttrValue || filterXSS.safeAttrValue

    //rs, add, 重複項目合併為1筆
    let rs = []
    let ks = {}
    let add = (o) => {
        let k = JSON.stringify(o)
        if (ks[k] === true) {
            return
        }
        ks[k] = true
        rs.push(o)
    }

    //scan
    let scan = (allowCommentTag) => {
        filterXSS(str, {
            ...opt,
            allowCommentTag,
            onIgnoreTag: function(tag, html, info) {
                //白名單外之標籤, 共用設定未另行處理者(回傳undefined或null即由js-xss轉義)才計
                let r = baseOnIgnoreTag(tag, html, info)
                if (r === undefined || r === null) {
                    let m = reTagName.exec(html)
                    if (m) {
                        add({ type: 'tag', tag: m[1].toLowerCase() })
                    }
                }
                return r
            },
            onIgnoreTagAttr: function(tag, name, value, isWhiteAttr) {
                //白名單內標籤被刪除之屬性, 只計有值之事件屬性
                //一般屬性被刪不計(如'a<b 且 c>d'被解析為<b>帶屬性c), style由共用設定保留亦不計
                let r = baseOnIgnoreTagAttr(tag, name, value, isWhiteAttr)
                if ((r === undefined || r === null) && reEventName.test(name) && value.trim() !== '') {
                    add({ type: 'attr', tag, name })
                }
                return r
            },
            safeAttrValue: function(tag, name, value, cssFilter) {
                //href或src被擋下(回傳空值即只留屬性名)且協定須回報者才計, 相對網址(如'pics/a.png')被擋不計
                let r = baseSafeAttrValue(tag, name, value, cssFilter)
                if (!r && (name === 'href' || name === 'src')) {
                    let scheme = getScheme(value)
                    if (scheme !== '') {
                        add({ type: 'url', tag, name, scheme })
                    }
                }
                return r
            },
        })
    }

    //比照clearXSS先刪註解再解析
    scan(false)

    //js-xss只認'-->'結束註解, 瀏覽器另認'--!>', 先刪註解會連瀏覽器會執行之內容一併刪除, 故有註解時另保留註解再解析一次取聯集
    //只保留註解解析又會被註解內之引號吞掉後文(如'<!-- a="x --><script>'), 故兩次都要
    if (str.indexOf('<!--') >= 0) {
        scan(true)
    }

    return rs
}


export default detectXSS
