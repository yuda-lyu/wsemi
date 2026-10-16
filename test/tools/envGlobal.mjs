//以可還原之方式暫時改寫瀏覽器全域(location、navigator、document), 供環境判斷函數(R-ENV-01)之測試
//  value為undefined時移除該全域(使其成為未宣告之全域, 直接讀取為ReferenceError), 否則以可配置屬性定義為value
//  fn結束(含拋錯)後還原原屬性描述子: Node 21+內建navigator為globalThis上可配置之getter, 須原樣還原, 否則影響同一worker內之後續測試檔
//  fn須為同步函數(還原於fn返回時即進行)
function withGlobal(name, value, fn) {
    let desc = Object.getOwnPropertyDescriptor(globalThis, name)
    if (desc && !desc.configurable) {
        throw new Error(`globalThis.${name} is not configurable`)
    }
    try {
        delete globalThis[name]
        if (value !== undefined) {
            Object.defineProperty(globalThis, name, { value, configurable: true, writable: true, enumerable: true })
        }
        return fn()
    }
    finally {
        delete globalThis[name]
        if (desc) {
            Object.defineProperty(globalThis, name, desc)
        }
    }
}


export { withGlobal }
