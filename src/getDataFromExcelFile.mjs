import split from 'lodash/split'
import each from 'lodash/each'
import every from 'lodash/every'
import trim from 'lodash/trim'
import head from 'lodash/head'
import tail from 'lodash/tail'
import invokeMap from 'lodash/invokeMap'
import XLSX from 'XLSX'


function to_ltdt(workbook) {
    let ar = to_array(workbook)
    let result = []
    each(ar.data, function (r) {

        //b, 資料列各欄數據不能trim後為空白
        let b = every(r, function (v) {
            return trim(v) === ''
        })

        if (!b) {

            //o
            let o = {}
            each(ar.keys, function (key, i) {
                o[key] = r[i]
            })

            //push
            result.push(o)

        }

    })
    return result
}


function to_array(workbook) {
    let otab = to_tab(workbook)
    let fst
    for (let k in otab) {
        fst = otab[k] //取第一表內資料出來
        break
    }
    let lines = split(fst, '\n')

    //因資料rows最後有換行符號，切分row最後為空
    lines.pop()

    //head依tab分隔符號切分
    let firstline = head(lines)
    let keys = split(firstline, '\t')

    //data依tab分隔符號切分
    let otherlines = tail(lines)
    let data = invokeMap(otherlines, String.prototype.split, '\t')

    let result = {
        keys: keys,
        data: data,
    }
    return result
}


function to_tab(workbook) {
    let result = {}
    workbook.SheetNames.forEach(function (sheetName) {
        let csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName], { FS: '\t' })
        if (csv.length > 0) {
            result[sheetName] = csv
        }
    })
    return result
}


function to_csv(workbook) {
    let result = {}
    workbook.SheetNames.forEach(function (sheetName) {
        let csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName])
        if (csv.length > 0) {
            result[sheetName] = csv
        }
    })
    return result
}


/**
 * 讀取xlsx檔，由input file的檔案讀取excel數據出來
 * 若fmt為csv格式，數據分欄符號為逗號，分行符號為[\n]
 *
 * @export
 * @param {Uint8Array} u8a 輸入file資料，格式需為Uint8Array
 * @param {String} [fmt='ltdt'] 輸入數據回傳格式，可有'ltdt','csv','array'，預設為'ltdt'
 * @returns {Array} 回傳數據陣列
 */
export default function getDataFromExcelFile(u8a, fmt = 'ltdt') {

    //workbook
    let workbook = XLSX.read(u8a, { type: 'buffer' }) //Uint8Array

    //convert
    if (fmt === 'ltdt') {
        return to_ltdt(workbook)
    }
    else if (fmt === 'array') {
        return to_array(workbook)
    }
    else if (fmt === 'csv') {
        return to_csv(workbook)
    }

    return null
}

