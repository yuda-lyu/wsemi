import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import ocr from './ocr.mjs'


/**
 * 基於tesseract.js的文字辨識(OCR)，採用動態加載技術，注意瀏覽器版精度較差
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ocrDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {String} img 輸入圖片網址或base64格式(以data:開頭)字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.lang='eng'] 輸入辨識語系字串，可輸入'eng'、'chi_tra'、'chi_sim'等，多語系可用「+」合併，預設'eng+chi_tra+chi_sim'
 * @param {String} [opt.whitelist=undefined] 輸入白名單字串，可指定輸入只辨識之字元，預設undefined
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Object} 回傳辨識結果物件
 * @example
 *
 * let resEng = `
 * Mild Splendour of the various-vested Night!
 * Mother of wildly-working visions! haill
 * I watch thy gliding, while with watery light
 * Thy weak eye glimmers through a fleecy veil;
 * And when thou lovest thy pale orb to shroud
 * Behind the gather’d blackness lost on high;
 * And when thou dartest from the wind-rent cloud
 * Thy placid lightning o’er the awaken’d sky.
 * `
 *
 * let resChiTra = `
 * 齊宣王誤闖夜叉山，碰巧撞上了風姿綽約的寨主鍾無艷，二人一見鍾情。鍾情
 * 於鍾無艷的狐狸精被拒愛，於是向無艷施「愛情咒」，使其臉上忽然多了塊大
 * 痣，把齊宣王嚇得拔腿而逃，二人感情從此障礙重重。
 * `
 *
 * let resChiSim = `
 * 狐狸精化身为美女夏迎春去勾引齐王，忽男忽女的她竟同时爱上齐王和无艳，
 * 硬是周旋在二人之间。齐王被狐狸精的美色所诱，但无艳仍对齐王痴心一片，
 * 甘为齐王南征北战，冲锋陷阵、出生入死。无艳在迎春多番打击下多次入冷
 * 宫、坐天牢仍无怨无悔，对齐王矢志不渝。
 * `
 *
 * //辨識英文
 * let rEng = await ocrDyn('data:image/png;base64,...')
 * console.log('ocrDyn for eng:', p(rEng) === p(resEng))
 * // => ocrDyn for eng: true
 *
 * console.log(resEng)
 * // => Mild Splendour of the various-vested Night!
 * // Mother of wildly-working visions! haill
 * // I watch thy gliding, while with watery light
 * // Thy weak eye glimmers through a fleecy veil;
 * // And when thou lovest thy pale orb to shroud
 * // Behind the gather’d blackness lost on high;
 * // And when thou dartest from the wind-rent cloud
 * // Thy placid lightning o’er the awaken’d sky.
 *
 * //辨識繁體中文
 * let rChiTra = await ocrDyn('data:image/png;base64,...', { lang: 'chi_tra' })
 * console.log('ocrDyn for chi_tra:', p(rChiTra) === p(resChiTra))
 * // => ocrDyn for chi_tra: true
 *
 * console.log(resChiTra)
 * // => 齊宣王誤闖夜叉山，碰巧撞上了風姿綽約的寨主鍾無艷，二人一見鍾情。鍾情
 * // 於鍾無艷的狐狸精被拒愛，於是向無艷施「愛情咒」，使其臉上忽然多了塊大
 * // 痣，把齊宣王嚇得拔腿而逃，二人感情從此障礙重重。
 *
 * //辨識簡體中文
 * let rChiSim = await ocrDyn('data:image/png;base64,...', { lang: 'chi_sim' })
 * console.log('ocrDyn for chi_sim:', p(rChiSim) === p(resChiSim))
 * // => ocrDyn for chi_sim: true
 *
 * console.log(resChiSim)
 * // => 狐狸精化身为美女夏迎春去勾引齐王，忽男忽女的她竟同时爱上齐王和无艳，
 * // 硬是周旋在二人之间。齐王被狐狸精的美色所诱，但无艳仍对齐王痴心一片，
 * // 甘为齐王南征北战，冲锋陷阵、出生入死。无艳在迎春多番打击下多次入冷
 * // 宫、坐天牢仍无怨无悔，对齐王矢志不渝。
 *
 */
async function ocrDyn(img, opt = {}, pathItems) {

    //pathItems
    //若更新, 記得example與readme也要更新
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js',
        ]
    }

    //importResources
    await importResources(pathItems)

    //ocr
    let r = await ocr(img, opt)

    return r
}


export default ocrDyn
