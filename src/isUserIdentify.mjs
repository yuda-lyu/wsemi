import join from 'lodash/join'
import genPm from './genPm.mjs'
import cstr from './cstr.mjs'


/**
 * 判斷是否為有效中華民國身份證
 *
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Promise} 回傳Promise，resolve為空代表有效，reject為錯誤訊息
 */
export default function isUserIdentify(v) {

    let df = genPm()

    v = cstr(v)
    let err = []

    //身分證字號長度
    if (v.length !== 10) {
        err.push('身份證字號長度非10位')
    }

    //身分證字號格式，用正則表示式比對第一個字母是否為英文字母
    if (isNaN(v.substr(1, 9)) || (!/^[A-Z]$/.test(v.substr(0, 1)))) {
        err.push('身份證格式錯誤')
    }

    //按照轉換後權數的大小進行排序
    let idHeader = 'ABCDEFGHJKLMNPQRSTUVXYWZIO'

    //身分證字號轉換
    v = (idHeader.indexOf(v.substring(0, 1)) + 10) + '' + v.substr(1, 9)

    //開始進行身分證數字的相乘與累加，依照順序乘上1987654321
    let s = parseInt(v.substr(0, 1)) +
        parseInt(v.substr(1, 1)) * 9 +
        parseInt(v.substr(2, 1)) * 8 +
        parseInt(v.substr(3, 1)) * 7 +
        parseInt(v.substr(4, 1)) * 6 +
        parseInt(v.substr(5, 1)) * 5 +
        parseInt(v.substr(6, 1)) * 4 +
        parseInt(v.substr(7, 1)) * 3 +
        parseInt(v.substr(8, 1)) * 2 +
        parseInt(v.substr(9, 1))

    //檢查碼
    let checkNum = parseInt(v.substr(10, 1))

    //模數-總和/模數(10)之餘數若等於第九碼的檢查碼則驗證成功, 若餘數為0檢查碼就是0
    if ((s % 10) === 0 || (10 - s % 10) === checkNum) {
        //有效
    }
    else {
        err.push('非有效身份證')
    }

    if (err.length > 0) {
        df.reject(join(err, '，'))
    }
    else {
        df.resolve()
    }

    return df
}
