import isestr from './isestr.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import isWindow from './isWindow.mjs'
import downloadFileFromBlob from './downloadFileFromBlob.mjs'


/**
 * 前端下載text資料成為utf-8(含BOM)檔案
 *
 * 會觸發瀏覽器下載(改動畫面)，必須參數無效即同步拋Error(固定訊息、不含輸入值、先於建立Blob與觸發下載；與downloadFileFromB64、downloadFileFromBlob、downloadFileFromU8Arr同一通道)：fileName非非空字串為'invalid fileName: must be a non-empty string'，ccont非字串(空字串合法)為'invalid ccont: must be a string'；檢測順序為fileName、ccont，且先於環境檢查；withBOM為帶預設值之位置參數(視同opt鍵)，非布林視為未給而改用預設true、照常下載(原為放棄下載)；非瀏覽器環境(無window)有效輸入時不動作、不拋錯(輸出'no window'，維持原行為)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadFileFromText.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fileName 輸入檔名字串，須為非空字串
 * @param {String} ccont 輸入內容字串，須為字串，可為空字串
 * @param {Boolean} [withBOM=true] 輸入是否添加BOM，須為布林值，非布林視為未給，預設true
 * @throws {Error} fileName非非空字串或ccont非字串，見上
 * @example
 * need test in browser
 *
 * let ctxt = 'abc\r\nde測試'
 * downloadFileFromText('data.txt',ctxt,false)
 *
 * let ccsv = 'a,b,c\r\nd,e,測試'
 * downloadFileFromText('data.csv',ccsv,true)
 *
 */
function downloadFileFromText(fileName, ccont, withBOM = true) {

    //check, 會觸發下載, 輸入無效即拋錯且先於任何動作(同downloadFileFromBlob)
    if (!isestr(fileName)) {
        throw new Error('invalid fileName: must be a non-empty string')
    }
    if (!isstr(ccont)) { //可允許空字串
        throw new Error('invalid ccont: must be a string')
    }

    //withBOM, 帶預設值之位置參數視同opt鍵(K2/K3): 非布林視為未給, 改用預設true
    if (!isbol(withBOM)) {
        withBOM = true
    }

    //check
    if (!isWindow()) {
        console.log('no window')
        return
    }

    //blob
    let blob
    if (withBOM) {
        blob = new Blob(['\ufeff', ccont]) //ccont為utf8格式, 另添加BOM
    }
    else {
        blob = new Blob([ccont])
    }

    //downloadFileFromBlob
    downloadFileFromBlob(fileName, blob)

}


export default downloadFileFromText
