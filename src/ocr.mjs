import tesseract from 'tesseract.js'
import get from 'lodash/get'
import isestr from './isestr.mjs'
import getGlobal from './getGlobal.mjs'


function getTesseract() {
    let g = getGlobal()
    let x = tesseract || g.Tesseract
    return x
}


/**
 * 基於tesseract.js的文字辨識(OCR)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ocr.test.js Github}
 * @memberOf wsemi
 * @param {String} img 輸入圖片網址或base64格式(以data:開頭)字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.lang='eng'] 輸入辨識語系字串，可輸入'eng'、'chi_tra'、'chi_sim'等，多語系可用「+」合併，預設'eng+chi_tra+chi_sim'
 * @param {String} [opt.whitelist=undefined] 輸入白名單字串，可指定輸入只辨識之字元，預設undefined
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
 * let rEng = await ocr('data:image/png;base64,...')
 * console.log('ocr for eng:', p(rEng) === p(resEng))
 * // => ocr for eng: true
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
 * let rChiTra = await ocr('data:image/png;base64,...', { lang: 'chi_tra' })
 * console.log('ocr for chi_tra:', p(rChiTra) === p(resChiTra))
 * // => ocr for chi_tra: true
 *
 * console.log(resChiTra)
 * // => 齊宣王誤闖夜叉山，碰巧撞上了風姿綽約的寨主鍾無艷，二人一見鍾情。鍾情
 * // 於鍾無艷的狐狸精被拒愛，於是向無艷施「愛情咒」，使其臉上忽然多了塊大
 * // 痣，把齊宣王嚇得拔腿而逃，二人感情從此障礙重重。
 *
 * //辨識簡體中文
 * let rChiSim = await ocr('data:image/png;base64,...', { lang: 'chi_sim' })
 * console.log('ocr for chi_sim:', p(rChiSim) === p(resChiSim))
 * // => ocr for chi_sim: true
 *
 * console.log(resChiSim)
 * // => 狐狸精化身为美女夏迎春去勾引齐王，忽男忽女的她竟同时爱上齐王和无艳，
 * // 硬是周旋在二人之间。齐王被狐狸精的美色所诱，但无艳仍对齐王痴心一片，
 * // 甘为齐王南征北战，冲锋陷阵、出生入死。无艳在迎春多番打击下多次入冷
 * // 宫、坐天牢仍无怨无悔，对齐王矢志不渝。
 *
 */
async function ocr(img, opt = {}) {

    //check img, 雖然tesseract.js可使用多種img, 此處限定只能url或base64圖片
    // => On a browser, an image can be:
    // an img, video, or canvas element
    // a File object (from a file <input>)
    // a Blob object
    // a path or URL to an accessible image
    // a base64 encoded image fits data:image\/([a-zA-Z]*);base64,([^"]*) regexp
    // => In Node.js, an image can be
    // a path to a local image
    // a Buffer storing binary image
    // a base64 encoded image fits data:image\/([a-zA-Z]*);base64,([^"]*) regexp
    if (!isestr(img)) {
        return Promise.reject('img is not effective string')
    }

    //lang
    let lang = get(opt, 'lang')
    if (!isestr(lang)) {
        lang = 'eng'
    }

    //getTesseract
    let tsr = getTesseract()
    // console.log('tsr', tsr)

    //createWorker
    let worker = tsr.createWorker()

    //init
    await worker.load()
    await worker.loadLanguage(lang)
    await worker.initialize(lang)

    //whitelist
    let whitelist = get(opt, 'whitelist')
    if (isestr(whitelist)) {
        await worker.setParameters({
            tessedit_char_whitelist: whitelist,
        })
    }

    //recognize
    let r = await worker.recognize(img)
    let { data: { text } } = r
    // console.log(r)

    //terminate
    await worker.terminate()

    return text
}


export default ocr
