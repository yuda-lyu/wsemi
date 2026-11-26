import fs from 'fs'
import fsReadTextCore from './fsReadTextCore.mjs'
import diagIfAsked from './_diagIfAsked.mjs'


/**
 * 後端nodejs由檔案讀取JSON格式文字成為物件或陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsReadJson.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入JSON檔案名稱
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.logDetail=false] 輸入JSON解析失敗時是否輸出遮罩後之細節(原SyntaxError之位置與堆疊)布林值(經getDiag之出口)，須為true才生效，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入JSON解析失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi fsReadJson] can not parse json')，同getDiag，預設null
 * @returns {Object} 回傳結果物件，提供鍵success代表解析後之物件或陣列，提供鍵error代表錯誤訊息(讀檔之Error物件；JSON解析失敗為固定訊息'invalid json: must be a valid JSON text'之SyntaxError，不帶檔案內容片段)，路徑參數須為非空字串且不含NUL字元，無效時回傳error為說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsReadJson'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.json'
 *     let fp = `${fdt}/${fn}`
 *
 *     fsWriteText(fp, JSON.stringify({ str: '測試中文', val: 123.45, int: 5 }))
 *
 *     let r = fsReadJson(fp)
 *     console.log('fsReadJson', r)
 *     ms.push({ 'fsReadJson': JSON.stringify(r) })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsReadJson { success: { str: '測試中文', val: 123.45, int: 5 } }
 * // ms [ { fsReadJson: '{"success":{"str":"測試中文","val":123.45,"int":5}}' } ]
 *
 */
function fsReadJson(fp, opt = {}) {
    let errTemp = null

    //rj
    let rj = fsReadTextCore(fp, { fs })

    //check
    if (rj.error) {
        return rj
    }

    //j
    let j = rj.success

    //parse
    let r = null
    try {
        r = JSON.parse(j)
    }
    catch (err) {
        errTemp = new SyntaxError('invalid json: must be a valid JSON text') //JSON.parse之SyntaxError訊息帶有檔案內容片段(V20), 改為固定訊息
        diagIfAsked(opt, '[wsemi fsReadJson] can not parse json', err) //原SyntaxError(位置、堆疊)之細節經opt之診斷出口(預設靜默)
    }

    if (errTemp !== null) {
        return {
            error: errTemp,
        }
    }
    return {
        success: r,
    }
}


export default fsReadJson
