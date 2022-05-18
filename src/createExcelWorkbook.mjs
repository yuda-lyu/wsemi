

/**
 * 創建Excel的Workbook物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/createExcelWorkbook.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳Excel的Workbook物件
 * @example
 *
 * let wb = createExcelWorkbook()
 * console.log(wb)
 * // => Workbook { SheetNames: [], Sheets: {} }
 *
 */
function createExcelWorkbook() {

    //Workbook
    function Workbook() {
        if (!(this instanceof Workbook)) return new Workbook()
        this.SheetNames = []
        this.Sheets = {}
    }

    //wb
    let wb = new Workbook()

    return wb
}


export default createExcelWorkbook
