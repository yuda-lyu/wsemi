//本檔為內部使用之常數, 不由index匯出


/**
 * 計時器(setTimeout、setInterval)之延遲毫秒上限
 *
 * 值為 2^31 - 1 = 2147483647 毫秒, 約 24.8 天。
 *
 *
 * 【為何需要此上限 —— nodejs與瀏覽器之行為不同, 且皆為靜默失效】
 *
 * 兩環境對超界值之處理機制不同, 實測(nodejs v24 / chromium)如下:
 *
 *   輸入ms          nodejs                    chromium
 *   -------------- ------------------------- -----------------------------------
 *   2147483647     正常排程                    正常排程
 *   2^31           立即觸發(1ms)+警告          立即觸發(ToInt32為-2147483648)
 *   2^32 - 5000    立即觸發(1ms)+警告          立即觸發(ToInt32為-5000)
 *   2^32 + 5000    立即觸發(1ms)+警告          【約5秒後觸發】(ToInt32為5000)
 *   2^32 + 100     立即觸發(1ms)+警告          【約100ms後觸發】(ToInt32為100)
 *   Infinity       立即觸發(1ms)+警告          立即觸發(ToInt32為0)
 *   NaN            立即觸發(1ms)+警告          立即觸發(ToInt32為0)
 *   -1             立即觸發(1ms)+警告          立即觸發
 *
 * nodejs為自家實作: 超過 2^31-1 一律夾為 1ms, 並以 process.on('warning') 發出
 * TimeoutOverflowWarning(NaN為TimeoutNaNWarning、負數為TimeoutNegativeWarning), 不拋錯。
 *
 * 瀏覽器則依 WebIDL 之 long 型別轉換(即 ToInt32), 對超界值做 modulo 2^32 之【環繞】而非夾制,
 * 且【完全沒有警告】。故 2^32 + 5000 於瀏覽器不是立即觸發, 而是 5 秒後觸發 ——
 * 表面上看起來正常運作, 只是時間完全錯了(49.7天變成5秒), 比nodejs之立即觸發更難察覺。
 * 環繞亦非單調: 輸入越大不代表延遲越長, 無法由行為反推輸入。
 *
 * wsemi為同構套件(前後端皆用), 故不可依賴runtime之行為, 必須於進入setTimeout之前自行夾制。
 * 夾制後兩環境行為一致(皆為正常排程至上限), 環境差異消失。
 *
 *
 * 【為何是夾制而非退回預設值或拋錯】
 *
 * 呼叫端給出超大值時, 其意圖顯然是「很久」或「幾乎不觸發」, 夾至 24.8 天最接近該意圖;
 * 退回預設值(如50ms)會變成高頻輪詢, 與意圖完全相反且更危險; 拋錯則對既有呼叫端為破壞性變更。
 *
 *
 * 【與安全整數界線之區別 —— 兩者須分開檢核】
 *
 * ispint(v, { useLimitSafe: true }) 擋的是「非安全整數」(Infinity、1e300、超出
 * Number.MAX_SAFE_INTEGER 者), 但 2^31 本身【是】合法的安全整數, 只是超過計時器之32位元上限。
 * 故型別與安全整數之檢核【擋不住】本上限, 兩層界線必須各自處理:
 *   第一層 ispint / isp0int 等: 擋型別錯誤與非安全整數
 *   第二層 本常數之夾制:       擋超過計時器上限者
 *
 *
 * 【用法】
 *
 *   import cst from './_const.mjs'
 *   timeAlive = Math.min(timeAlive, cst.TIMER_TIME_MAX) //須用min, 用max會把正常值放大為上限
 *
 * @type {Integer}
 */
let TIMER_TIME_MAX = 2147483647


let cst = {
    TIMER_TIME_MAX,
}


export default cst
