import { snapdom } from '@zumer/snapdom'
import get from 'lodash-es/get.js'
import isEle from './isEle.mjs'
import isbol from './isbol.mjs'
import domRemove from './domRemove.mjs'
import domPrepend from './domPrepend.mjs'
import optVal from './_optVal.mjs'


//scale: opt類參數, 有效數字且不小於1(isenum, min: 1), 非預期(含Infinity、'0x10'、包裝物件、非數字、小於1等超出範圍者)視為未給、改用預設1, 不報錯(K3超出範圍亦同; W-13, 使用者2026-11-16, 原小於1者reject)
let RULE_SCALE = { fn: 'domConvertToPic', name: 'opt.scale', kind: 'enum', chk: { min: 1 } }

//IMG_WAIT_MAX, 放入頁面後等待複本內<img>載入或失敗之上限毫秒(逾時不再等, 直接截圖, 不報錯)
let IMG_WAIT_MAX = 5000


//listAll, 取元素本身(標籤相符時)與其後代中符合選擇器者, 依文件順序; 原件與cloneNode(true)之複本結構相同, 故兩者之同索引元素互相對應
function listAll(ele, sel, tag) {
    let out = []
    if (String(get(ele, 'tagName', '')).toUpperCase() === tag) {
        out.push(ele)
    }
    if (typeof get(ele, 'querySelectorAll', null) === 'function') {
        let ns = ele.querySelectorAll(sel)
        for (let i = 0; i < ns.length; i++) {
            out.push(ns[i])
        }
    }
    return out
}


//copyCanvas, cloneNode不複製<canvas>之位圖(複本為空白位圖), 故將原件各<canvas>當下之內容畫入複本
//無法複製者(控制權已轉移至OffscreenCanvas、無法取得2D繪圖環境等)保留空白, 不中斷截圖; 跨源而被污染(tainted)之canvas可畫入複本但其內容無法被讀出, 截圖時該canvas為空白
function copyCanvas(eleSrc, eleDst) {
    let ss = listAll(eleSrc, 'canvas', 'CANVAS')
    let ds = listAll(eleDst, 'canvas', 'CANVAS')
    for (let i = 0; i < ss.length && i < ds.length; i++) {
        try {
            if (ss[i].width > 0 && ss[i].height > 0) {
                let cx = ds[i].getContext('2d')
                if (cx) {
                    cx.drawImage(ss[i], 0, 0)
                }
            }
        }
        catch (err) {}
    }
}


//copySelect, cloneNode不複製<select>之選取(以屬性selectedIndex、value或使用者操作所得者, 複本回到預設選取), 故將原件各單選<select>當下之選取複製至複本
//<input>與<textarea>之現值、核取狀態cloneNode已複製(HTML規格之複製步驟), 不在此處理; 複選(multiple)之選取snapdom不呈現於輸出, 不處理
function copySelect(eleSrc, eleDst) {
    let ss = listAll(eleSrc, 'select', 'SELECT')
    let ds = listAll(eleDst, 'select', 'SELECT')
    for (let i = 0; i < ss.length && i < ds.length; i++) {
        try {
            if (!ss[i].multiple) {
                ds[i].selectedIndex = ss[i].selectedIndex
            }
        }
        catch (err) {}
    }
}


//isolateRadio, 單選鈕(radio)依名稱成組(同一表單擁有者內, 無表單者為同一文件內): 複本放入頁面後, 無表單之同名radio會與頁面上之原件同組, 複本之已勾選鈕使原件之勾選被取消(呼叫後頁面上之單選狀態被改動);
//故將複本內有名稱之radio改為本次呼叫專用之名稱(複本內各鈕仍同組、勾選狀態不變, 外觀不受影響), 原件不受影響; 元素本身為radio時亦處理
let _radioSeq = 0
function isolateRadio(ele) {
    let rs = listAll(ele, 'input[type=radio]', 'INPUT')
    if (rs.length === 0) {
        return
    }
    _radioSeq++
    for (let r of rs) {
        try {
            if (r.type === 'radio' && r.name !== '') {
                r.name = `__domConvertToPic${_radioSeq}_${r.name}`
            }
        }
        catch (err) {}
    }
}


//loadImgNow, 複本內之延遲載入(loading="lazy")之<img>改為即時載入: 複本置於頁面頂端, 其內遠離視窗者不會觸發延遲載入, 否則只能等到waitImg逾時
function loadImgNow(ele) {
    let imgs = listAll(ele, 'img', 'IMG')
    for (let img of imgs) {
        try {
            if (img.loading === 'lazy') {
                img.loading = 'eager'
            }
        }
        catch (err) {}
    }
}


//waitImg, 等待複本內尚未完成之<img>載入或失敗(複本放入頁面後會重新載入, 完成前之版面與完成後不同, 如載入失敗之圖由width/height屬性之盒變為替代文字盒); 逾ms不再等; 無須等待者即刻完成, 不建立計時器; 永不reject
function waitImg(ele, ms) {
    let imgs = listAll(ele, 'img', 'IMG').filter((img) => img.complete === false)
    if (imgs.length === 0) {
        return Promise.resolve()
    }
    return new Promise((resolve) => {
        let left = imgs.length
        let offs = []
        let timer = null
        let finish = () => {
            clearTimeout(timer)
            for (let off of offs) {
                off()
            }
            resolve()
        }
        for (let img of imgs) {
            let settled = false
            let h = () => {
                if (settled) {
                    return
                }
                settled = true
                left--
                if (left <= 0) {
                    finish()
                }
            }
            img.addEventListener('load', h)
            img.addEventListener('error', h)
            offs.push(() => {
                img.removeEventListener('load', h)
                img.removeEventListener('error', h)
            })
        }
        timer = setTimeout(finish, ms)
    })
}


/**
 * 前端針對DOM元素轉圖片
 *
 * 作法: 將ele以cloneNode(true)複製後以絕對定位(不透明度0、z-index為-1)放入body最前, 再交snapdom截圖, 複本不受原本長寬限制故可截完整畫面; 截圖完成後移除本函數放入之節點(截圖失敗時亦移除)。輸出尺寸為複本之版面尺寸, 元素之外距(margin)亦計入。
 *
 * 複本之處理: cloneNode不複製canvas之位圖與單選select之選取, 本函數於複製後補回——各canvas於呼叫當下之內容畫入複本(跨源圖片使canvas被污染而內容無法讀出者, 輸出中該canvas區域為空白並由snapdom於四周畫灰框, 不reject; 控制權已轉移至OffscreenCanvas等無法複製者亦為空白、不reject), 各單選select之選取複製至複本(複選select之選取snapdom不呈現於輸出, 不處理); input與textarea之現值、核取與單選鈕之狀態cloneNode已複製(複本內有名稱之單選鈕改用本次呼叫專用之名稱, 免放入頁面後與同名之原件同組而取消原件之勾選, 原件之狀態不被改動)。複本內之img放入頁面後會重新載入, 載入完成(含失敗)前之版面與完成後不同(如載入失敗之img由width與height屬性之盒變為替代文字盒), 故先等複本之img皆載入或失敗再截圖, 等待至多5秒(逾時不再等、不報錯), loading為lazy者改為即時載入以免遠離視窗者空等至逾時。
 *
 * 限制: 元素內之捲動位置(scrollTop、scrollLeft)不帶入複本, 輸出為未捲動之內容; 其餘以snapdom之能力為準(如跨網域之iframe為占位)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domConvertToPic.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.scale=1] 輸入縮放比例數字，須為不小於1之有效數字(可為數字字串)，非預期之輸入(小於1、Infinity、'0x10'、包裝物件、非數字等)視為未給而改用預設1，不報錯、不reject，預設1
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.scale為非預期之輸入(含小於1)而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @param {Boolean} [opt.toBase64=true] 輸入是否回傳圖片之data URL字串布林值，給true回傳字串(png與jpeg為base64編碼，svg為utf-8之URL編碼)，給false回傳img元素(HTMLImageElement)，預設true
 * @param {String} [opt.picType='image/png'] 輸入輸出圖片格式字串，可選'image/png'、'image/jpeg'(亦可給'image/jpg')與'svg'，png與svg保留透明背景，jpeg之透明處填白色，給其他值則使用'image/png'，預設'image/png'
 * @returns {Promise} 回傳Promise，resolve回傳產出圖片，toBase64為true時為data URL字串，否則為img元素，reject為失敗訊息字串(含輸入非元素之'invalid ele: must be an element'與取不到body元素之'can not find body element'，此時不截圖、不留DOM殘留)，截圖失敗時reject為snapdom拋出之錯誤(Error物件，同樣不留DOM殘留)
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * domConvertToPic(ele, { scale: 3 })
 *     .then((b64)=>{
 *         // => data:image/png;base64,iVBORw0KGgoAAAANSU...
 *     })
 *
 */
async function domConvertToPic(ele, opt = {}) {

    //check
    if (!isEle(ele)) {
        return Promise.reject('invalid ele: must be an element')
    }

    //scale, 有效且不小於1則取Number(v), 非預期(含Infinity、'0x10'、包裝物件、小於1)一律改用預設1(K3超出範圍亦同, W-13)
    let scale = optVal(get(opt, 'scale', null), 1, RULE_SCALE, opt)

    //picType
    let picType = get(opt, 'picType', null)
    if (picType !== 'image/jpg' && picType !== 'image/jpeg' && picType !== 'image/png' && picType !== 'svg') {
        picType = 'image/png'
    }

    //toBase64
    let toBase64 = get(opt, 'toBase64', null)
    if (!isbol(toBase64)) {
        toBase64 = true
    }

    //body, 取不到body時reject(值為字串, 同上述各檢測), 須先於任何DOM作業
    let body = document.querySelector('body')
    if (!isEle(body)) {
        return Promise.reject('can not find body element')
    }

    //cloneNode
    let elePic = ele.cloneNode(true)

    //cloneNode不複製<canvas>之位圖與<select>之選取, 須補回(<input>與<textarea>之現值、核取狀態cloneNode已複製); 複本之radio改用專用名稱, 免放入頁面後取消同名原件之勾選
    copyCanvas(ele, elePic)
    copySelect(ele, elePic)
    isolateRadio(elePic)
    loadImgNow(elePic)

    //注意：放置ele的區塊用絕對定位顯示, 用z-index=-1避免遮蔽原畫面, 原本為預設的長寬限制會自動取消, 故可截圖為完整畫面
    //例如原本為受body寬度而出現橫向捲軸的div, 會因為複製並以position=absolute呈現時, 寬度自然會展開為原始寬度, 即可完整截圖, 高度也是

    //eleIn
    let eleIn = document.createElement('div')
    eleIn.style.position = 'absolute'
    eleIn.style.top = 0
    eleIn.style.left = 0
    // eleIn.style.width = `${ele.offsetWidth}px`
    // eleIn.style.height = `${ele.offsetHeight}px`
    eleIn.style.zIndex = -1
    eleIn.appendChild(elePic)

    //eleOut
    let eleOut = document.createElement('div')
    eleOut.style.opacity = 0
    eleOut.style.position = 'relative'
    eleOut.appendChild(eleIn)

    //domPrepend, 塞入至body內最前
    domPrepend(body, eleOut)

    //pic
    let optCv = {
        scale, //anti-aliasing
        quality: 1, //for jpg
        cache: 'disabled', //禁用快取
    }
    let pic
    try {

        //複本之<img>放入頁面後重新載入, 完成(載入或失敗)前之版面與完成後不同, 截圖時機若落在其間則輸出尺寸不穩, 故等其完成(上限IMG_WAIT_MAX)
        await waitImg(elePic, IMG_WAIT_MAX)

        if (picType === 'image/jpg' || picType === 'image/jpeg') {
            pic = await snapdom.toJpg(eleIn, optCv)
        }
        else if (picType === 'image/png') {
            pic = await snapdom.toPng(eleIn, optCv)
        }
        else if (picType === 'svg') {
            pic = await snapdom.toSvg(eleIn, optCv)
        }

    }
    finally {

        //remove, 成功或失敗皆移除本函數放入之節點
        //div.remove() //IE11不支援element.remove()
        domRemove(eleOut)

    }

    if (toBase64) {
        pic = get(pic, 'src', '')
    }

    return pic
}


export default domConvertToPic
