import tesseract from 'tesseract.js' //要能於nodejs下運行, 故不使用瀏覽器動態加載
import get from 'lodash/get'
import isestr from './isestr.mjs'
import getGlobal from './getGlobal.mjs'


function getTesseract() {
    let g = getGlobal()
    let x = tesseract || g.Tesseract
    return x
}


/**
 * 基於tesseract.js的文字辨識(OCR)，注意瀏覽器版精度較差
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ocr.test.mjs Github}
 * @memberOf wsemi
 * @param {String} img 輸入圖片網址或base64格式(以data:開頭)字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.lang='eng'] 輸入辨識語系字串，可輸入'eng'、'chi_tra'、'chi_sim'等，多語系可用「+」合併，預設'eng+chi_tra+chi_sim'
 * @param {String} [opt.whitelist=undefined] 輸入白名單字串，可指定輸入只辨識之字元，預設undefined
 * @returns {Object} 回傳辨識結果物件
 * @example
 *
 * function getImg() {
 *     function getEng() {
 *         return 'data:image/png;base64,...'
 *     }
 *     function getTra() {
 *         return 'data:image/png;base64,...'
 *     }
 *     function getSim() {
 *         return 'data:image/png;base64,...'
 *     }
 *
 *     let resEng = `
 * Mild Splendour of the various-vested Night!
 * Mother of wildly-working visions! haill
 * I watch thy gliding, while with watery light
 * Thy weak eye glimmers through a fleecy veil;
 * And when thou lovest thy pale orb to shroud
 * Behind the gather’'d blackness lost on high;
 * And when thou dartest from the wind-rent cloud
 * Thy placid lightning o’er the awakend sky.
 * `
 *
 *     let resChiTra = `
 * 齎 家 王 說 闊 夜 又 山 ‧ 碰 巧 撞 上 了 風 妻 綽 約 的 寨 主 鍾 無 艷 ， 一 人 一 見 鍾 情 。 鍾 情
 * 於 鍾 無 艷 的 狐 狸 精 被 拒 愛 ， 於 是 向 無 艷 施 『 愛 情 咒 」， 使 其 臉 上 忽 然 多 了 塊 大
 * 痧 ‧ 把 齊 宣 王 嚇 得 採 腿 而 逃 ‧ 二 人 媒 情 從 此 障 礙 重 重 。
 * `
 *
 *     let resChiSim = `
 * 狐 狸 精 化 身 为 美 女 夏 迎 春 去 勾 引 齐 王 , 忽 男 忽 女 的 她 竟 同 时 爱 上 齐 王 和 无 艳 ,
 * 硬 是 周 旋 在 二 人 之 间 。 齐 王 被 狐 狸 精 的 美 色 所 诱 , 但 无 艳 仍 对 齐 王 痴 心 一 片 ,
 * 甘 为 齐 王 南 征 北 战 , 冲 锋 陷 阵 、 出 生 入 死 。 无 艳 在 迎 春 多 畴 打 击 下 多 次 入 冷
 * 宫 、 坐 天 牢 仍 无 怨 无 悔 , 对 齐 王 矢 志 不 渝 。
 * `
 *
 *     return {
 *         eng: getEng(),
 *         tra: getTra(),
 *         sim: getSim(),
 *         resEng,
 *         resChiTra,
 *         resChiSim,
 *     }
 * }
 *
 * function replace(c, t, r) {
 *     let o = new RegExp(t, 'g')
 *     let rr = String(c).replace(o, r)
 *     return rr
 * }
 *
 * function p(c) {
 *     c = replace(c, ' ', '')
 *     c = replace(c, '\r', '')
 *     c = replace(c, '\n', '')
 *     return c
 * }
 *
 * async function core() {
 *
 *     //kpImg
 *     let kpImg = getImg()
 *
 *     let rEng = await ocr(kpImg.eng)
 *     console.log(rEng)
 *     console.log('ocr for eng:', p(rEng) === p(kpImg.resEng))
 *     // => Mild Splendour of the various-vested Night!
 *     // Mother of wildly-working visions! haill
 *     // I watch thy gliding, while with watery light
 *     // Thy weak eye glimmers through a fleecy veil;
 *     // And when thou lovest thy pale orb to shroud
 *     // Behind the gather’'d blackness lost on high;
 *     // And when thou dartest from the wind-rent cloud
 *     // Thy placid lightning o’er the awakend sky.
 *     //
 *     // => ocr for chi_tra: true
 *
 *     let rChiTra = await ocr(kpImg.tra, { lang: 'chi_tra' })
 *     console.log(rChiTra)
 *     console.log('ocr for chi_tra:', p(rChiTra) === p(kpImg.resChiTra))
 *     // => 齎 家 王 說 闊 夜 又 山 ‧ 碰 巧 撞 上 了 風 妻 綽 約 的 寨 主 鍾 無 艷 ， 一 人 一 見 鍾 情 。 鍾 情
 *     // 於 鍾 無 艷 的 狐 狸 精 被 拒 愛 ， 於 是 向 無 艷 施 『 愛 情 咒 」， 使 其 臉 上 忽 然 多 了 塊 大
 *     // 痧 ‧ 把 齊 宣 王 嚇 得 採 腿 而 逃 ‧ 二 人 媒 情 從 此 障 礙 重 重 。
 *     //
 *     // => ocr for chi_tra: true
 *
 *     let rChiSim = await ocr(kpImg.sim, { lang: 'chi_sim' })
 *     console.log(rChiSim)
 *     console.log('ocr for chi_sim:', p(rChiSim) === p(kpImg.resChiSim))
 *     // => 狐 狸 精 化 身 为 美 女 夏 迎 春 去 勾 引 齐 王 , 忽 男 忽 女 的 她 竟 同 时 爱 上 齐 王 和 无 艳 ,
 *     // 硬 是 周 旋 在 二 人 之 间 。 齐 王 被 狐 狸 精 的 美 色 所 诱 , 但 无 艳 仍 对 齐 王 痴 心 一 片 ,
 *     // 甘 为 齐 王 南 征 北 战 , 冲 锋 陷 阵 、 出 生 入 死 。 无 艳 在 迎 春 多 畴 打 击 下 多 次 入 冷
 *     // 宫 、 坐 天 牢 仍 无 怨 无 悔 , 对 齐 王 矢 志 不 渝 。
 *     //
 *     // => ocr for chi_sim: true
 *
 * }
 * core()
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
    // console.log('worker', worker)

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
