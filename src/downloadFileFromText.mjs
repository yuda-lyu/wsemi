import isestr from './isestr.mjs'
import isstr from './isstr.mjs'
import downloadFileFromBlob from './downloadFileFromBlob.mjs'


/**
 * 前端下載text資料成為utf-8(含BOM)檔案
 *
 * @export
 * @param {String} cfn 輸入檔名字串
 * @param {String} ccont 輸入內容字串
 */
export default function downloadFileFromText(cfn, ccont) {

    //check
    if (!isestr(cfn)) {
        console.warn('no filename')
        return
    }
    if (!isstr(ccont)) { //可允許空字串
        console.warn('no content')
        return
    }

    //blob
    let blob = new Blob(['\ufeff', ccont]) //轉utf8 with BOM

    //downloadFileFromBlob
    downloadFileFromBlob(cfn, blob)

}
