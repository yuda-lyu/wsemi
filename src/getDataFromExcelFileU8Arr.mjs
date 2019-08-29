import split from 'lodash/split'
import each from 'lodash/each'
import map from 'lodash/map'
import every from 'lodash/every'
import trim from 'lodash/trim'
import head from 'lodash/head'
import tail from 'lodash/tail'
import invokeMap from 'lodash/invokeMap'
import XLSX from 'xlsx'
import isbol from './isbol.mjs'


function to_ltdt(workbook) {
    //可改使用: sheet_to_row_object_array
    //https://juejin.im/post/5d0105c7e51d45105e0212a4

    function core(m) {
        let rs = []
        each(m.rows, function (c) {

            //b, 資料列各欄數據不能trim後為空白
            let b = every(c, function (v) {
                return trim(v) === ''
            })

            if (!b) {

                //o
                let o = {}
                each(m.keys, function (key, i) {
                    o[key] = c[i]
                })

                //push
                rs.push(o)

            }

        })
        return rs
    }

    let ars = to_array(workbook, true)

    //r
    let r = map(ars, function(ar) {
        return {
            sheetname: ar.sheetname,
            data: core(ar.data)
        }
    })

    return r
}


function to_array(workbook, useHead = false) {

    //check
    if (!isbol(useHead)) {
        useHead = false
    }

    function core(c) {

        //lines
        let lines = split(c, '\n')

        //因資料rows最後有換行符號，切分row最後為空
        lines.pop()

        //useHead
        let result = {}
        if (useHead) {

            //head依tab分隔符號切分
            let firstline = head(lines)
            let keys = split(firstline, '\t')

            //data依tab分隔符號切分
            let otherlines = tail(lines)
            let rows = invokeMap(otherlines, String.prototype.split, '\t')

            //result
            result = {
                keys: keys,
                rows: rows,
            }

        }
        else {

            //data依tab分隔符號切分
            let rows = invokeMap(lines, String.prototype.split, '\t')

            //result
            result = {
                keys: null,
                rows: rows,
            }

        }

        return result
    }

    //tabs
    let tabs = to_tab(workbook)

    //r
    let r = map(tabs, function(tab) {
        return {
            sheetname: tab.sheetname,
            data: core(tab.data)
        }
    })

    return r
}


function to_tab(workbook) {
    let result = []
    workbook.SheetNames.forEach(function (sheetname) {
        let tab = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetname], { FS: '\t' })
        if (tab.length > 0) {
            result.push({
                sheetname: sheetname,
                data: tab
            })
        }
    })
    return result
}


function to_csv(workbook) {
    let result = []
    workbook.SheetNames.forEach(function (sheetname) {
        let csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetname])
        if (csv.length > 0) {
            result.push({
                sheetname: sheetname,
                data: csv
            })
        }
    })
    return result
}


/**
 * 讀取xlsx檔，由input file的檔案讀取excel數據出來
 * 若fmt為csv格式，數據分欄符號為逗號，分行符號為[\n]
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDataFromExcelFileU8Arr.test.js Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入file資料，格式需為Uint8Array
 * @param {String} [fmt='ltdt'] 輸入數據回傳格式，可有'ltdt','csv','array'，預設為'ltdt'
 * @param {Boolean} [useHead=false] 輸入數據是否讀入首行head，需配合fmt='array'，預設為false
 * @returns {Array} 回傳數據陣列
 * @example
 * need test in browser
 */
function getDataFromExcelFileU8Arr(u8a, fmt = 'ltdt', useHead = false) {

    //workbook
    let workbook
    try {
        workbook = XLSX.read(u8a, { type: 'buffer' }) //Uint8Array
    }
    catch (e) {
        console.log('getDataFromExcelFileU8Arr: error: ', e)
        return null
    }

    //convert
    if (fmt === 'ltdt') {
        return to_ltdt(workbook)
    }
    else if (fmt === 'array') {
        return to_array(workbook, useHead)
    }
    else if (fmt === 'csv') {
        return to_csv(workbook)
    }

    return null
}


export default getDataFromExcelFileU8Arr
