//execProcess、execCli、execCliSession呼叫「呼叫端串流回調」之單一呼叫點, 內部共用不對外
//  文件契約: 回調內拋出之錯誤不會被攔截, 將成為未捕捉例外, 請於回調內自行處理
//  但回調位於本套件之事件監聽器內(data、close), 直接拋出會中斷監聽器之其餘工作: 累積輸出、逐行切分、收尾flush、settle與喚醒stop()
//  致輸出遺失、行延遲至逾時、stop()誤報未能結束、Promise永不落定
//  故於此承接後以queueMicrotask原樣重拋(仍為未捕捉例外, 錯誤值不變), 監聽器其餘工作照常完成
//  用微任務而非setTimeout: 微任務排在本次監聽器同步段之後、呼叫端之await續行之前(其settle於同一監聽器內稍後才排入), 無處理器時行程如修前般以該錯誤結束, 不會因呼叫端隨即process.exit而遺失


//callUser, 呼叫fn(...args), 拋錯時回傳false並排程重拋, 否則回傳true
function callUser(fn, ...args) {
    try {
        fn(...args)
        return true
    }
    catch (err) {
        queueMicrotask(() => {
            throw err
        })
        return false
    }
}


export default callUser
