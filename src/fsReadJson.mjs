import fs from 'fs'
import fsReadTextCore from './fsReadTextCore.mjs'


/**
 * 後端nodejs由檔案讀取JSON格式文字成為物件或陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsReadJson.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入JSON檔案名稱
 * @returns {Object|Array} 回傳物件或陣列
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
function fsReadJson(fp) {
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
        // console.log(err)
        errTemp = err
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
