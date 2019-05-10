import genPm from './genPm.mjs'
import domTriggerEvent from './domTriggerEvent.mjs'


/**
 * 前端input檔案物件轉ArrayBuffer資料陣列
 *
 * @memberOf wsemi
 * @param {Object} file 輸入file物件
 * @returns {Promise} 回傳Promise，resolve回傳檔案的ArrayBuffer資料陣列
 */
function file2ab(file) {

    //df
    let df = genPm()

    //reader
    let reader = new FileReader()

    //onload
    reader.onload = function(event) {

        //ab
        let ab
        if (!event) {
            ab = reader.content //IE11
        }
        else {
            ab = event.target.result
        }

        //resolve
        df.resolve(ab)

    }

    //IE11 extend readAsBinaryString
    if (!FileReader.prototype.readAsBinaryString) {
        FileReader.prototype.readAsBinaryString = function(fileData) {
            let binary = ''
            let pt = this
            let reader = new FileReader()
            reader.onload = function() {
                let bytes = new Uint8Array(reader.result)
                let length = bytes.byteLength
                for (let i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i])
                }
                pt.content = binary
                domTriggerEvent(pt, 'onload')
            }
            reader.readAsArrayBuffer(fileData) //Uint8Array轉ArrayBuffer
        }
    }

    //readAsBinaryString
    reader.readAsBinaryString(file)

    return df
}


export default file2ab
