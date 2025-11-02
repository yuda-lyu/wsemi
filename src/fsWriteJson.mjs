import fs from 'fs'
import get from 'lodash-es/get.js'
import isobj from './isobj.mjs'
import isarr from './isarr.mjs'
import isbol from './isbol.mjs'
import fsWriteTextCore from './fsWriteTextCore.mjs'


/**
 * 後端nodejs將物件或陣列轉成JSON格式文字再儲存至檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWriteJson.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案名稱
 * @param {Object|Array} inp 輸入物件或陣列數據
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsWriteJson'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let inp = { str: '測試中文', val: 123.45, int: 5 }
 *
 *     let fn1 = 't1.json'
 *     let fp1 = `${fdt}/${fn1}`
 *
 *     let r1 = fsWriteJson(fp1, inp)
 *     console.log('fsWriteJson', r1)
 *     ms.push({ 'fsWriteJson': r1 })
 *
 *     let c1 = fs.readFileSync(fp1, 'utf8')
 *     console.log('readFileSync', c1)
 *     ms.push({ 'readFileSync': c1 })
 *
 *     let fn2 = 't2.json'
 *     let fp2 = `${fdt}/${fn2}`
 *
 *     let r2 = fsWriteJson(fp2, inp, { useFormat: true })
 *     console.log('fsWriteJson', r2)
 *     ms.push({ 'fsWriteJson': r2 })
 *
 *     let c2 = fs.readFileSync(fp2, 'utf8')
 *     console.log('readFileSync', c2)
 *     ms.push({ 'readFileSync': c2 })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsWriteJson { success: './_test_fsWriteJson/t1.json' }
 * // readFileSync {"str":"測試中文","val":123.45,"int":5}
 * // fsWriteJson { success: './_test_fsWriteJson/t2.json' }
 * // readFileSync {
 * //   "str": "測試中文",
 * //   "val": 123.45,
 * //   "int": 5
 * // }
 * // ms [
 * //   { fsWriteJson: { success: './_test_fsWriteJson/t1.json' } },
 * //   { readFileSync: '{"str":"測試中文","val":123.45,"int":5}' },
 * //   { fsWriteJson: { success: './_test_fsWriteJson/t2.json' } },
 * //   {
 * //     readFileSync: '{\n  "str": "測試中文",\n  "val": 123.45,\n  "int": 5\n}'
 * //   }
 * // ]
 *
 */
function fsWriteJson(fp, inp, opt = {}) {
    let errTemp = null

    //check
    if (!isobj(inp) && !isarr(inp)) {
        return {
            error: `inp is not an object or array`,
        }
    }

    //useFormat
    let useFormat = get(opt, 'useFormat', null)
    if (!isbol(useFormat)) {
        useFormat = false
    }

    let j = ''
    try {
        if (useFormat) {
            j = JSON.stringify(inp, null, 2)
        }
        else {
            j = JSON.stringify(inp)
        }
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

    //r
    let r = fsWriteTextCore(fp, j, { fs })

    return r
}


export default fsWriteJson


