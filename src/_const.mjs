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
 * wsemi為同構套件(前後端皆用), 故不可依賴runtime之行為, 必須於進入setTimeout之前自行檢核。
 *
 *
 * 【如何處置超界值 —— 檢核而非夾制】
 *
 * 計時毫秒屬輸入參數之檢測(主控dspec〈輸入參數之檢測機制〉§7.1、K3), 現行處置為:
 *   1. 判斷: 以isenum(v, { use: 'timer' })(可帶小數)或iseint(v, { use: 'timer' })(須為整數)判定,
 *      兩者之計時範圍(0 ~ TIMER_TIME_MAX)取自本常數, 集中於_numRange.mjs, 各函數不自寫數字;
 *      超過上限、Infinity、NaN、負數、'0x10'、包裝物件等皆判定為非有效之計時毫秒。
 *   2. opt類參數(有預設者, 含JSDoc標[參數=預設]之位置參數): 非預期之輸入(含超界)視為未給, 改用預設,
 *      不再夾至上限(經_optVal.mjs統一處理, opt.debug為true時輸出警告); 例: delay、debounce、waitFun、cache系、fsTask、domDetect。
 *   3. 必須參數(無預設者): 超界與其他非預期之輸入同樣報錯, 不夾至上限; 例: pmTimeout。
 *   舊制「超大值之意圖為很久, 夾至上限最接近其意圖, 退回預設值反而變成高頻輪詢」已隨第221項改為上述處置
 *   (超大值改用預設; 欲「很久」者由呼叫端給上限內之有限值, 或該參數本身以null等明確值表示不限時, 如execProcess.timeout)。
 *
 * 仍使用Math.min夾至本上限者(皆非opt類參數之檢測):
 *   - 內部計算得之等待時間(如fsDownloadFileVerifyCore依整體時限剩餘時間排定之等待, 其輸入已通過檢測), 為避免計算結果超界;
 *   - execCli、execCliSession之timeoutMs等: 屬第三級(須先改下游), 尚待下游先行補檢測後再依上述處置改寫, 現況仍夾至上限。
 *
 *
 * 【與安全整數界線之區別 —— 兩者須分開檢核】
 *
 * iseint(v) 預設use為'safe', 擋的是「非安全整數」(Infinity、1e300、超出
 * Number.MAX_SAFE_INTEGER 者), 但 2^31 本身【是】合法的安全整數, 只是超過計時器之32位元上限。
 * 故判定計時毫秒須明給 use: 'timer', 只做安全整數之檢核【擋不住】本上限:
 *   第一層 iseint/isenum 預設(safe): 擋型別錯誤與非安全整數
 *   第二層 use: 'timer':             擋超過計時器上限者
 *
 *
 * 【用法】
 *
 *   判定輸入參數:   iseint(ms, { use: 'timer', min: 1 })  //取自_numRange.mjs, 不直接讀本常數
 *   夾制內部計算值: import cst from './_const.mjs'
 *                   wait = Math.min(wait, cst.TIMER_TIME_MAX) //須用min, 用max會把正常值放大為上限
 *
 * @type {Integer}
 */
let TIMER_TIME_MAX = 2147483647


let cst = {
    TIMER_TIME_MAX,
}


export default cst
