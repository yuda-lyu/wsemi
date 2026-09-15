import isestr from './isestr.mjs'


//reEmail, email格式正則
//  local part(@之前): RFC 5322之dot-atom, 字元集為atext(英數與 !#$%&'*+/=?^_`{|}~- ), 點只能當分隔, 不得開頭、結尾或連續; 不支援引號形式與Unicode
//  domain(@之後): 一層以上之主機名標籤(英數與中間連字號, 不得以連字號開頭或結尾, 至多63碼)加頂級網域; 頂級網域為2碼以上純字母, 或xn--開頭之國際化網域punycode形式(如.台灣為xn--kpry57d), 大小寫不拘; 不支援IP位址與無頂級網域者(如localhost)
//  各量詞之間皆有必要之分隔符(點或@), 無歧義切法, 對任意長度之非法輸入皆線性時間; 舊寫法之分隔符可省略, 30碼非法輸入即回溯數秒
let reEmail = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+(?:[A-Za-z]{2,63}|[Xx][Nn]--[A-Za-z0-9-]{0,58}[A-Za-z0-9])$/


/**
 * 判斷是否為email格式
 *
 * 採ASCII寬鬆判定：@之前為RFC 5322之dot-atom(英數與 !#$%&'*+/=?^_`{|}~- ，點只能當分隔)，@之後為一層以上之主機名標籤加頂級網域，頂級網域為2碼以上純字母或xn--開頭之punycode形式，全長至多254碼、@之前至多64碼(RFC 5321)。不支援引號形式之local part、Unicode位址(須先轉punycode)、IP位址與無頂級網域者
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isEmail.test.mjs Github}
 * @memberOf wsemi
 * @param {String} email 輸入email字串
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isEmail('abc@mail.com'))
 * // => true
 *
 * console.log(isEmail('abc+tag@mail.info'))
 * // => true
 *
 * console.log(isEmail('abc@a.b'))
 * // => false
 *
 * console.log(isEmail('a..b@mail.com'))
 * // => false
 *
 */
function isEmail(email) {

    //check
    if (!isestr(email)) {
        return false
    }

    //check length, RFC 5321: 位址全長至多254, local part至多64
    if (email.length > 254) {
        return false
    }
    let i = email.indexOf('@')
    if (i > 64) {
        return false
    }

    return reEmail.test(email)
}


export default isEmail
