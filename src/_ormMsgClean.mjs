//w-orm系列錯誤訊息中鍵名之清除(cvOrmFind與chkOrmData共用, 單一出處), 規則見CLAUDE_rulebook.md R-FIND-01規則12與R-ORMSTR-01
//
//純JS: 不import任何模組、不用Node API; 內建(String之charCodeAt與slice、RegExp之exec)於模組載入時取得, 載入後被覆寫不影響清除


//內建函數(模組載入時取得)
let call = Function.prototype.call
let charCode = call.bind(String.prototype.charCodeAt)
let strSlice = call.bind(String.prototype.slice)
let reExec = call.bind(RegExp.prototype.exec) //以內建exec取比對結果, 不經RegExp.prototype.test所查找之實例exec

//訊息清除用: 控制字元(Cc,含C1)、格式字元(Cf,含雙向控制與零寬字元)、行與段分隔符(Zl、Zp)、私用區(Co)、孤立代理碼元(Cs,成對者為單一碼點不受影響)與方括號(使鍵名不致偽造路徑段)以?取代
let reBad = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Co}\p{Cs}[\]]/u


//ormMsgClean, 清除控制字元與孤立代理並限長, 供訊息使用(鍵名經此才進訊息)
//逐碼點以內建exec判定, 不用replace(其會查找RegExp.prototype之Symbol.replace與實例exec, 載入後被覆寫時可能無窮迴圈)
let ormMsgClean = (s, n) => {
    let t = s.length > n ? `${strSlice(s, 0, n)}...` : s
    let out = ''
    for (let i = 0; i < t.length; i++) {
        let ch = t[i]
        let cp = charCode(t, i)
        if (cp >= 0xD800 && cp <= 0xDBFF && i + 1 < t.length) {
            let lo = charCode(t, i + 1)
            if (lo >= 0xDC00 && lo <= 0xDFFF) {
                //成對代理(單一碼點)
                ch = ch + t[i + 1]
                i++
            }
        }
        out += reExec(reBad, ch) === null ? ch : '?'
    }
    return out
}


export default ormMsgClean
