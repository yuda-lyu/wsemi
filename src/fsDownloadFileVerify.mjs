import fs from 'fs'
import crypto from 'crypto'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import fsDownloadFileVerifyCore from './fsDownloadFileVerifyCore.mjs'


/**
 * 後端nodejs下載網址成為檔案並驗證完整性(SHA-256與大小)
 *
 * 用於下載執行檔或二進位資產: 內容先串流寫入同資料夾之暫存檔`<fpOut之絕對路徑>.<pid>.<亂數>.part`(以排他方式同步建立, 不覆寫亦不刪除既有同名檔), 同時計算SHA-256與大小(驗證fetch解碼content-encoding後之內容, fetch不支援之編碼則為原始內容), 與期望值相符且重讀暫存檔仍相符才更名為fpOut(覆蓋舊檔)。任何失敗路徑皆不在fpOut留下未驗證或不完整之檔, 舊檔原樣保留; 每次嘗試後清除本次建立之暫存檔, 刪不掉時如實回報(不稱已清除)。
 *
 * fpOut於呼叫當下即依當時之工作路徑解析為絕對路徑(其所在資料夾不存在時先建立; Windows之磁碟相對路徑如'C:a.bin'依該磁碟之目前資料夾), 之後之檔案操作皆用該絕對路徑; 回傳之fp為呼叫端所給之字串。fpOut之檔名不得為空、'.'或'..'(E_ARG), Windows下檔名內不得有冒號(替代資料流, 或只有磁碟代號而無檔名, E_ARG); Windows以/與\為路徑分隔符, 其他系統只有/(反斜線為合法之檔名字元); 暫存檔名為正式檔名加上約30字元之後綴, 檔名逼近系統上限時建立暫存檔失敗(E_FS)。
 *
 * 期望值expected為物件{ sha256, size }(sha256為64碼十六進位、大小寫不拘, size為位元組數、選填, undefined或null視為未給), 或為函數(可為async), 於每次嘗試前呼叫並回傳該物件(供每次重取清單之用法), 函數收到{ attempt, signal }, signal於整體時間用盡時中止; 函數拋錯時錯誤代碼為E_EXPECTED, 所拋錯誤帶retryable為true者重試, 否則不重試。
 *
 * 給size時: 回應之content-length(未經內容編碼與分塊傳輸者)與size不符即不下載, 內容超過size即中止, 正常結束而短少亦失敗(E_SIZE_MISMATCH); 傳輸中斷造成之短少為E_NETWORK。
 *
 * 可重試之錯誤: 連線錯誤(E_NETWORK)、HTTP 5xx、408、429(E_HTTP)、停滯(E_TIMEOUT)、雜湊或大小不符(E_HASH_MISMATCH、E_SIZE_MISMATCH, opt.retryOnMismatch為false時不重試); 不可重試: 其他HTTP狀態、參數錯誤(E_ARG, 使用全域fetch時網址須為可解析之http或https)、磁碟錯誤(E_FS)、更名失敗(E_RENAME)、整體時間用盡(E_TIMEOUT_TOTAL)。第n次重試前等待retryDelayMs*n毫秒, 等待會超過整體時間上限時即停止。整體時間上限以單調時計(performance.now)計算, 約束取期望值、網路、寫入暫存檔與重讀核對階段(各等待點皆以此為上限, 不依賴fetch或串流是否響應中止); 驗證通過後之更名與清理不計入: 其退避另加至多約3秒, 更名失敗時比對fpOut內容之讀取每次至多stallMs。
 *
 * 更名失敗(EPERM、EBUSY、EACCES, Windows下常為防毒掃描占用)時最多共嘗試5次; 更名失敗但fpOut已是期望內容(他方已完成)視為成功。
 *
 * 同程序內對同一fpOut(以其絕對路徑判定, Windows不分大小寫)、同一網址、同一期望值(物件比對sha256與size, 函數比對是否同一函數)、同一所傳入之模組(opt.fs等)與opt.fetch、同樣之maxAttempts、retryOnMismatch與useSkipIfMatch之併發呼叫共用同一次下載, 共用者收到同一個結果物件或錯誤物件(其中fp為最先呼叫者所給之字串), 等待以各自之totalMs為上限(逾時者E_TIMEOUT_TOTAL, step為'share', 共用之下載續行且其後仍可能更新fpOut); 其餘選項(stallMs、retryDelayMs、onRetry)依最先呼叫者。不符上述條件者各自下載, 同一fpOut之期望值不同時以最後完成更名者為最終內容。opt.useShare為false時各自下載。
 *
 * 網址與請求: 未給opt.fetch而使用全域fetch時, 網址須為可解析之http或https且不得帶帳密(user:password@, E_ARG), 需要認證時請傳入自訂之opt.fetch; 錯誤訊息與錯誤物件之url會遮蔽網址內之帳密。傳入之opt.fetch須回傳本體(body)為WHATWG ReadableStream之Response(如undici之fetch), 回傳Node之Readable本體者不支援(E_ARG, step為download, 不重試); opt.fetch給了卻不是函數者為E_ARG(只有undefined或null才使用全域fetch)。傳入之函數(期望值函數、fetch、onRetry)皆不帶接收者呼叫(this為undefined)。共用之下載以最先呼叫者之totalMs計時, totalMs較長之後到者亦收到該次下載因其totalMs用盡之失敗。本體寫完後等待暫存檔寫入串流關閉至多5秒(同時輪詢串流之closed屬性), 失敗清理時不重複等待; 該等待不受totalMs約束。本函數只複製opt自身可列舉之屬性(不含原型鏈上者)。
 *
 * 參數之包裝物件(new String、new Number、new Boolean)一律先解包為原始值再檢查與使用(不呼叫其可被覆寫之方法), 檢查之值即使用之值。size為非負安全整數, 或十進位整數字串(前後空白可); 小數、指數、十六進位、帶正負號、超過安全整數之字串為E_ARG。本函數自建之錯誤以身分判定(傳入元件所拋值即使帶同名code, 亦不視為本函數之錯誤)。錯誤訊息內任何出現處之網址帳密(含底層錯誤文字帶回者)皆遮蔽, 但cause仍為原始錯誤物件。
 *
 * 下載執行檔或二進位資產一律經本函數驗證(規則帳本R-DL-VERIFY-01); 不需驗證之一般下載用fsDownloadFile。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDownloadFileVerify.test.mjs Github}
 * @memberOf wsemi
 * @param {String} urlIn 輸入下載網址字串
 * @param {String} fpOut 輸入儲存檔案路徑字串, 所在資料夾不存在時自動建立
 * @param {Object|Function} expected 輸入期望值物件{ sha256, size }, 或回傳該物件之函數(可為async, 每次嘗試前呼叫, 收到{ attempt, signal })
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} [opt.fs=fs] 輸入fs，供測試傳入，須有mkdirSync、realpathSync、openSync、closeSync、createWriteStream、createReadStream、renameSync、unlinkSync、statSync，預設為nodejs之fs
 * @param {Function} [opt.fetch=null] 輸入fetch函數，未給時於每次請求時取用全域fetch，預設null
 * @param {Integer} [opt.maxAttempts=3] 輸入最多嘗試次數，正整數(可為數字字串)，無效時使用預設值，預設3
 * @param {Number} [opt.retryDelayMs=1000] 輸入重試間隔基數毫秒，第n次重試前等待retryDelayMs*n，亦為更名與刪除暫存檔重試間隔之基數(上限200)，非負數，無效時使用預設值，預設1000
 * @param {Number} [opt.stallMs=30000] 輸入連續沒收到資料(含等待回應標頭)視為停滯之毫秒數，正數，無效時使用預設值，預設30000
 * @param {Number} [opt.totalMs=600000] 輸入整體時間上限毫秒數，正數，無效時使用預設值，超過計時器上限(2147483647)時夾至上限，預設600000
 * @param {Boolean} [opt.retryOnMismatch=true] 輸入雜湊或大小不符時是否重試，預設true
 * @param {Boolean} [opt.useShare=true] 輸入同程序內併發呼叫是否共用同一次下載，預設true
 * @param {Boolean} [opt.useSkipIfMatch=false] 輸入每次嘗試取得期望值後，fpOut已是期望內容時是否不下載直接成功(回傳downloaded為false)，既有檔無法讀取視為不符，預設false
 * @param {Function} [opt.onRetry=null] 輸入重試前之通知函數，收到{ attempt, maxAttempts, delayMs, error }，其拋錯或回傳之rejection皆忽略，預設null
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷，與給使用者之進度通知opt.onRetry是兩回事(互不影響)；n為由1起算之嘗試序號(共用等待者與參數通過後之準備失敗為0)；type為'attempt'時為第n次嘗試開始(含n、max為maxAttempts)，'skip'時為opt.useSkipIfMatch成立而fpOut已是期望內容故不下載(含n、size)，'request'時為即將送出請求且整體時限計時器與停滯計時器已設定(含n、stallMs、remainMs為整體時限剩餘毫秒數)，'touch'時為停滯計時器剛重設(自此起連續stallMs沒有資料即停滯；含n、from為'request'|'headers'|'data'、ms為stallMs)，'headers'時為回應標頭已到(含n、ok、status為數字或null)，'data'時為本體又收到一塊資料(含n、bytes為本次嘗試累計位元組數；其後隨即重設停滯計時器)，'temp'時為暫存檔建立(act為'create')或清除(act為'remove'；含n、act、ok為是否成功)，'verify'時為校驗結果(phase為'stream'代表本體讀完之大小與SHA-256比對、'disk'代表重讀暫存檔核對；含n、phase、size、sizeOk、hashOk，皆為布林或數字，不含雜湊內容)，'rename'時為第i次更名嘗試(含n、i、ok)，'timeout'時為時限計時器觸發(kind為'stall'代表停滯、'total'代表整體時限；where為'request'代表請求階段之計時器、'expected'代表取期望值階段、'read'代表重讀檔案比對階段、'share'代表共用等待者逾時、'budget'代表檢查時整體時限已用盡；含n、kind、where、ms)，'abort'時為請求之中止實際執行(why為中止原因代碼'E_TIMEOUT'|'E_TIMEOUT_TOTAL'、'fallback'代表一端先出錯後5秒仍未落定而放手、'close'代表本次嘗試結束時釋放未讀完之本體與連線；含n、why)，'retry'時為第n次嘗試失敗而即將等待ms毫秒後重試(含n、ms；與opt.onRetry同一時點但不論有無給onRetry皆通知)，'stop'時為不再重試(why為'fatal'代表不可重試之錯誤、'max'代表次數用盡、'budget'代表等待會超過整體時限；含n、why、code為該錯誤代碼)，'share'時為同程序共用之登記(act為'own'代表本次為進行中之工作、'join'代表加入進行中之同一工作、'off'代表opt.useShare為false而各自下載；含act)，'settle'時為本次呼叫即將resolve(ok為true)或reject(含ok、code為錯誤代碼或null、attempts)；入口之參數錯誤(E_ARG)不通知任何事件；事件皆於resolve或reject之前通知；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響下載，本函數以展開opt原樣轉傳給fsDownloadFileVerifyCore，預設null
 * @returns {Promise} 回傳Promise，resolve回傳結果物件{ fp, sha256, size, attempts, downloaded, leftovers }，sha256為小寫，leftovers為先前嘗試刪不掉之暫存檔陣列[{ fp, error }]；reject回傳Error物件，其code為'E_ARG'、'E_EXPECTED'、'E_HTTP'、'E_NETWORK'、'E_TIMEOUT'、'E_TIMEOUT_TOTAL'、'E_SIZE_MISMATCH'、'E_HASH_MISMATCH'、'E_FS'、'E_RENAME'之一，另帶step('argument'、'prepare'、'expected'、'request'、'download'、'verify'、'rename'、'share')、attempts(已嘗試次數，參數錯誤、建立資料夾錯誤與共用等待逾時為0)；E_ARG以外另帶url、fp、expected(最後使用之期望值)、actual(已計算之實際值或null)、leftovers、cleanupError(有刪不掉之暫存檔時為第一個之錯誤)、status(HTTP錯誤時)、cause，message含失敗步驟、預期與實際(雜湊截短為16碼)、建議與刪不掉之暫存檔；E_ARG(入口之參數錯誤)只另帶cause(有時); 下載途中之E_ARG(回應本體不是WHATWG ReadableStream)與其他代碼同帶上述欄位
 * @example
 * //need test in nodejs
 *
 * import fs from 'fs'
 * import http from 'http'
 * import crypto from 'crypto'
 *
 * let test = async () => {
 *     let ms = []
 *
 *     let fdt = './_test_fsDownloadFileVerify'
 *     fsCreateFolder(fdt) //創建任務資料夾
 *
 *     //本機HTTP服務, 提供一個檔案
 *     let body = Buffer.from('abc中文')
 *     let server = http.createServer((req, res) => {
 *         res.writeHead(200, { 'content-length': String(body.length) })
 *         res.end(body)
 *     })
 *     await new Promise((resolve) => {
 *         server.listen(8802, '127.0.0.1', resolve)
 *     })
 *     let urlIn = 'http://127.0.0.1:8802/a.bin'
 *     let sha256 = crypto.createHash('sha256').update(body).digest('hex')
 *
 *     //期望值相符, 下載後更名為正式檔名
 *     let r1 = await fsDownloadFileVerify(urlIn, `${fdt}/a.bin`, { sha256, size: body.length })
 *     console.log('r1', r1)
 *     ms.push({ fp: r1.fp, sha256: r1.sha256, size: r1.size, attempts: r1.attempts, downloaded: r1.downloaded, content: fs.readFileSync(r1.fp, 'utf8') })
 *
 *     //期望值不符(且不重試), 正式檔名不會出現
 *     await fsDownloadFileVerify(urlIn, `${fdt}/b.bin`, { sha256: '0'.repeat(64) }, { retryOnMismatch: false })
 *         .catch((err) => {
 *             console.log('err', err.message)
 *             ms.push({ code: err.code, step: err.step, attempts: err.attempts, exists: fs.existsSync(`${fdt}/b.bin`) })
 *         })
 *
 *     //期望值由函數取得(每次嘗試前呼叫, 例如每次重取清單)
 *     let r3 = await fsDownloadFileVerify(urlIn, `${fdt}/c.bin`, async ({ attempt }) => {
 *         return { sha256: sha256.toUpperCase(), size: String(body.length) }
 *     })
 *     console.log('r3', r3)
 *     ms.push({ sha256: r3.sha256, attempts: r3.attempts })
 *
 *     await new Promise((resolve) => {
 *         server.close(resolve)
 *     })
 *     fsDeleteFolder(fdt) //最終階段清除任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // r1 {
 * //   fp: './_test_fsDownloadFileVerify/a.bin',
 * //   sha256: 'ac462cf17176818361b7ec29c9c399b71ce29c6708580b1851e602341630f137',
 * //   size: 9,
 * //   attempts: 1,
 * //   downloaded: true,
 * //   leftovers: []
 * // }
 * // err failed to download url[http://127.0.0.1:8802/a.bin] to file[./_test_fsDownloadFileVerify/b.bin] (code E_HASH_MISMATCH, step verify, attempt 1 of 3): sha256 mismatch: expected 0000000000000000... (size not given), received ac462cf171768183... (9 bytes)
 * // hint: the file on the server is not the expected one; a cache may serve an older or newer file for a few minutes after an update, or the content was altered in transit; retry later, check the expected value, proxy and antivirus
 * // note: file[./_test_fsDownloadFileVerify/b.bin] was not modified by this call
 * // r3 {
 * //   fp: './_test_fsDownloadFileVerify/c.bin',
 * //   sha256: 'ac462cf17176818361b7ec29c9c399b71ce29c6708580b1851e602341630f137',
 * //   size: 9,
 * //   attempts: 1,
 * //   downloaded: true,
 * //   leftovers: []
 * // }
 * // ms [
 * //   {
 * //     fp: './_test_fsDownloadFileVerify/a.bin',
 * //     sha256: 'ac462cf17176818361b7ec29c9c399b71ce29c6708580b1851e602341630f137',
 * //     size: 9,
 * //     attempts: 1,
 * //     downloaded: true,
 * //     content: 'abc中文'
 * //   },
 * //   {
 * //     code: 'E_HASH_MISMATCH',
 * //     step: 'verify',
 * //     attempts: 1,
 * //     exists: false
 * //   },
 * //   {
 * //     sha256: 'ac462cf17176818361b7ec29c9c399b71ce29c6708580b1851e602341630f137',
 * //     attempts: 1
 * //   }
 * // ]
 *
 */
async function fsDownloadFileVerify(urlIn, fpOut, expected, opt = {}) {
    let optIn = null
    try {
        optIn = { fs, crypto, Readable, pipeline, ...opt }
    }
    catch (err) {
        //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 交Core由讀取opt失敗之同一出口reject(E_ARG)
        optIn = {
            get fs() {
                throw err
            },
        }
    }
    return fsDownloadFileVerifyCore(urlIn, fpOut, expected, optIn)
}


export default fsDownloadFileVerify
