import get from 'lodash-es/get.js'
import toResultError from './_toResultError.mjs'


/**
 * 後端nodejs由檔案讀取utf-8文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsReadTextCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案名稱
 * @returns {Object} 回傳結果物件，提供鍵success代表檔案內容utf-8字串，提供鍵error代表錯誤訊息(讀檔之Error物件，注入之fs拋出非Error之值時為其字串)
 * @example
 * need test in nodejs.
 *
 * //see fsReadText
 *
 */
function fsReadTextCore(fp, opt = {}) {
    let bErr = false //是否出錯以布林旗標判定, 不以errTemp是否為null判定(注入之fs可拋出null)
    let errTemp = null

    //readFileSync
    let j = ''
    try {

        //fs, 讀取opt置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 於try外即成同步拋錯
        let fs = get(opt, 'fs')

        j = fs.readFileSync(fp, 'utf8')
    }
    catch (err) {
        // console.log(err)
        bErr = true
        errTemp = err
    }

    if (bErr) {
        return {
            error: toResultError(errTemp), //Error或非空字串原樣, 其餘(null、undefined等)轉字串, 恆為truthy
        }
    }
    return {
        success: j,
    }
}


export default fsReadTextCore
