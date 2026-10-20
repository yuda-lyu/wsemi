//w-orm系列錯誤訊息中路徑之尾端截斷(cvOrmFind與chkOrmData共用, 單一出處), 規則見CLAUDE_rulebook.md R-ORMSTR-01規則16
//
//純JS: 不import任何模組、不用Node API; 內建(String之charCodeAt與slice)於模組載入時取得, 載入後被覆寫不影響截斷


//內建函數(模組載入時取得)
let call = Function.prototype.call
let charCode = call.bind(String.prototype.charCodeAt)
let strSlice = call.bind(String.prototype.slice)

let MAX_PATH = 120
let TAIL = 100


//ormPathCut, 路徑逾120碼元者截為...加末100碼元, 否則原樣回傳
//切點(第長度-100碼元)為成對代理之低位時往後移一碼元(尾端99碼元), 使截斷不留孤立低位代理, 訊息本身維持良構
let ormPathCut = (s) => {
    if (s.length <= MAX_PATH) {
        return s
    }
    let from = s.length - TAIL
    let c = charCode(s, from)
    if (c >= 0xDC00 && c <= 0xDFFF) {
        from++
    }
    return `...${strSlice(s, from)}`
}


export default ormPathCut
