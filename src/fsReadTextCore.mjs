import get from 'lodash-es/get.js'


/**
 * 後端nodejs由檔案讀取utf-8文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsReadTextCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案名稱
 * @returns {Object} 回傳結果物件，提供鍵success代表檔案內容utf-8字串，提供鍵error代表錯誤訊息(讀檔之Error物件)
 * @example
 * need test in nodejs.
 *
 * //see fsReadText
 *
 */
function fsReadTextCore(fp, opt = {}) {
    let errTemp = null

    //fs
    let fs = get(opt, 'fs')

    //readFileSync
    let j = ''
    try {
        j = fs.readFileSync(fp, 'utf8')
    }
    catch (err) {
        // console.log(err)
        errTemp = err
    }

    if (errTemp !== null) {
        return {
            error: errTemp,
        }
    }
    return {
        success: j,
    }
}


export default fsReadTextCore
