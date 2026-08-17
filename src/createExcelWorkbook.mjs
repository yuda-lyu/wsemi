/**
 * 產生Excel的Workbook空物件
 *
 * Workbook物件格式為{ sheets: [] }，各分頁為{ name, rows }物件，可交由addExcelWorksheetFromData添加分頁、getExcelU8ArrFromWorkbook輸出檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/createExcelWorkbook.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳Excel的Workbook物件
 * @example
 *
 * let wb = createExcelWorkbook()
 * console.log(wb)
 * // => { sheets: [] }
 *
 */
function createExcelWorkbook() {

    //wb
    let wb = {
        sheets: [],
    }

    return wb
}


export default createExcelWorkbook
