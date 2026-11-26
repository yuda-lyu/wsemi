import get from 'lodash-es/get.js'


//本檔為內部使用, 不由index匯出: 以cloneNode(true)複製元素並放入頁面者(domConvertToPic之截圖複本、domDragPreview之拖曳預覽)之複本補正, 單一出處(排程第647項自domConvertToPic抽出, R-DOMPIC-01)
//  cloneNode不複製<canvas>之位圖與<select>之選取(複本為空白位圖、回到預設選取); <input>與<textarea>之現值、核取狀態cloneNode已複製(HTML規格之複製步驟)


//listAll, 取元素本身(標籤相符時)與其後代中符合選擇器者, 依文件順序; 原件與cloneNode(true)之複本結構相同, 故兩者之同索引元素互相對應
function listAll(ele, sel, tag) {
    let out = []
    if (String(get(ele, 'tagName', '')).toUpperCase() === tag) {
        out.push(ele)
    }
    if (typeof get(ele, 'querySelectorAll', null) === 'function') {
        let ns = ele.querySelectorAll(sel)
        for (let i = 0; i < ns.length; i++) {
            out.push(ns[i])
        }
    }
    return out
}


//copyCanvas, cloneNode不複製<canvas>之位圖(複本為空白位圖), 故將原件各<canvas>當下之內容畫入複本
//無法複製者(控制權已轉移至OffscreenCanvas、無法取得2D繪圖環境等)保留空白, 不中斷呼叫端; 跨源而被污染(tainted)之canvas可畫入複本但其內容無法被讀出, 截圖時該canvas為空白
function copyCanvas(eleSrc, eleDst) {
    let ss = listAll(eleSrc, 'canvas', 'CANVAS')
    let ds = listAll(eleDst, 'canvas', 'CANVAS')
    for (let i = 0; i < ss.length && i < ds.length; i++) {
        try {
            if (ss[i].width > 0 && ss[i].height > 0) {
                let cx = ds[i].getContext('2d')
                if (cx) {
                    cx.drawImage(ss[i], 0, 0)
                }
            }
        }
        catch (err) {}
    }
}


//copySelect, cloneNode不複製<select>之選取(以屬性selectedIndex、value或使用者操作所得者, 複本回到預設選取), 故將原件各單選<select>當下之選取複製至複本
//<input>與<textarea>之現值、核取狀態cloneNode已複製(HTML規格之複製步驟), 不在此處理; 複選(multiple)之選取snapdom不呈現於輸出, 不處理
function copySelect(eleSrc, eleDst) {
    let ss = listAll(eleSrc, 'select', 'SELECT')
    let ds = listAll(eleDst, 'select', 'SELECT')
    for (let i = 0; i < ss.length && i < ds.length; i++) {
        try {
            if (!ss[i].multiple) {
                ds[i].selectedIndex = ss[i].selectedIndex
            }
        }
        catch (err) {}
    }
}


//isolateRadio, 單選鈕(radio)依名稱成組(同一表單擁有者內, 無表單者為同一文件內): 複本放入頁面後, 無表單之同名radio會與頁面上之原件同組, 複本之已勾選鈕使原件之勾選被取消(呼叫後頁面上之單選狀態被改動);
//故將複本內有名稱之radio改為本次呼叫專用之名稱(prefix＋序號＋原名; 複本內各鈕仍同組、勾選狀態不變, 外觀不受影響), 原件不受影響; 元素本身為radio時亦處理
let _radioSeq = 0
function isolateRadio(ele, prefix) {
    let rs = listAll(ele, 'input[type=radio]', 'INPUT')
    if (rs.length === 0) {
        return
    }
    _radioSeq++
    for (let r of rs) {
        try {
            if (r.type === 'radio' && r.name !== '') {
                r.name = `${prefix}${_radioSeq}_${r.name}`
            }
        }
        catch (err) {}
    }
}


export { listAll, copyCanvas, copySelect, isolateRadio }
