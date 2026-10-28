import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { spawn } from 'child_process'
import fsEnsureBinsCore from './fsEnsureBinsCore.mjs'


/**
 * 後端nodejs依清單取得外部執行檔(快取、鏡像、GitHub)並以清單之SHA-256與大小校驗, 回傳各檔之絕對路徑
 *
 * 規格: 外部執行檔之存放下載校驗與離線(制式規格, opensrcOper之dspec), 本函數為其§6之共用實作(規則帳本R-BIN-ENSURE-01)。含外部執行檔之套件只做三件事: ①提供清單(bin/manifest.json, 由toolg/genBinManifest.mjs以fsGetBinManifestEntry依實檔產生); ②呼叫本函數取得路徑後啟動; ③匯出ensureBins()(轉呼叫本函數)。不得另寫下載、快取、鏡像、校驗。首次使用時才下載(不在postinstall下載)。
 *
 * 清單manifest(schema 1)為物件或JSON檔路徑(相對路徑以opt.pkgRoot為基準): { schema: 1, pkg, mode: 'pinned'|'floating', repo: '<owner>/<repo>', commit(40碼小寫十六進位, 釘選模式有path之檔時必填), manifestPath(主幹模式之清單於repo內之路徑, 預設'bin/manifest.json'), files: [...], note, version }。files之每項: name(檔名, 英數與._+-, 不分大小寫不得重複), 來源為path(repo內之相對路徑, 自有檔, 網址為https://raw.githubusercontent.com/<repo>/<commit或master>/<path>)、url(廠商檔, 須https、不得帶帳密、不得為releases/latest)或parts(分割壓縮檔, 每項{ path或url, sha256, size, name(選填, 預設為path或url之最後一段) }, 須另給assembled: { type: 'zip', sha256, size }為組合後之校驗值), sha256(64碼十六進位)與size(位元組數)為該來源檔之校驗值(parts者不給), extract: { type: 'zip', member(壓縮檔內之相對路徑), sha256, size }為解出之檔之校驗值, note(選填)。不認得之欄位、型別不符、名稱或路徑不合白名單皆為E_MANIFEST。
 *
 * 取得順序: ①快取: 位置為<快取>/<sha256>/<name>(內容定址, sha256為最終檔之值, 壓縮檔者為extract之值), 快取資料夾為opt.cacheDir, 否則環境變數W_BIN_CACHE時為<W_BIN_CACHE>/<pkg>, 否則<opt.pkgRoot>/bin-cache; 命中亦校驗大小與SHA-256, 本行程內已校驗且檔案識別(裝置、inode、大小、修改與變更時間)未變者不重複雜湊, 不符者刪除(識別未變才刪)後重新取得。②鏡像: opt.mirror, 否則環境變數W_BIN_MIRROR, 為本地資料夾或http(s)基底網址, 結構為<鏡像>/<pkg>/<sha256>/<name>; 壓縮檔者先找解出之最終檔, 再找壓縮檔(<name>為其path或url之最後一段)或各分割檔; 鏡像之檔不符清單即拒用(不留檔)並續找下一來源。③GitHub或廠商網址(離線時不連)。任何來源皆經fsDownloadFileVerify之暫存檔、校驗、原子更名寫入, 不讀到半檔。
 *
 * 離線: opt.offline, 否則環境變數W_BIN_OFFLINE為1或true時, 只用快取與鏡像, 缺檔時reject E_OFFLINE_MISSING, 訊息列出每個缺檔之名稱、sha256、大小、應放之快取與鏡像完整路徑、來源網址與準備方法(連網機器設W_BIN_CACHE為一資料夾後呼叫ensureBins(), 再把該資料夾帶入設為W_BIN_MIRROR), 錯誤物件之missing為[{ name, sha256, size, cachePath, mirrorPath, url, member, archive, parts, reasons }]。
 *
 * 主幹模式(mode為floating): 先取主幹清單(opt.floatingManifestUrl, 否則https://raw.githubusercontent.com/<repo>/master/<manifestPath>, 上限1MB, 時限同opt.stallMs), 同樣檢核schema且須為同一pkg與repo; 成功時其副本存於<快取>/manifest-last.json(紀錄, 不作為校驗依據); 失敗(含離線、無效)時用傳入之基準清單。主幹清單之信任錨為GitHub主幹(規格M5), 故opt.floatingManifestUrl只能是https://raw.githubusercontent.com/<repo>/之下(同一repo, 可改分支或路徑, 否則E_ARG), 套件之ensureBins不應轉傳使用者之值。
 *
 * 壓縮檔: 於快取夾內本次專用之暫存夾(.work-<pid>-<亂數>)取得壓縮檔(或各分割檔各自校驗後依序組合並校驗assembled), 以tar解出成員(Windows為<SystemRoot>\System32\tar.exe即bsdtar, 其他系統為bsdtar或tar, 須支援zip, 參數皆為暫存夾內之相對路徑, 成員前加--), 解出之檔須為一般檔案且符合extract之大小與SHA-256, 才原子移入快取; 暫存夾於結束時刪除, 刪不掉者(含下載核心刪不掉之暫存檔、主幹清單副本之暫存檔)列於結果之leftovers(不可列舉之屬性; 失敗時為錯誤物件之leftovers; 共用同一次取得者皆得到)。解壓時限同opt.totalMs, 逾時終止後等其結束至多5秒, 仍未結束則保留暫存夾並列入leftovers。解壓失敗為E_EXTRACT。
 *
 * 清單與選項之字串一律須為原始字串(包裝物件new String與new Boolean不接受), 檢查之值即使用之值。離線時http(s)鏡像之重導不追隨(視為拒用)。
 *
 * 併發: 同程序內同一最終檔且來源設定相同之併發呼叫共用同一次取得(其onProgress只通知最先呼叫者); 跨程序以暫存檔與原子更名保證不讀到半檔, 更名失敗而最終檔已是期望內容視為成功。各檔依清單順序逐一取得。
 *
 * 錯誤: reject帶code之Error: 'E_ARG'(參數)、'E_MANIFEST'(清單, 帶field)、'E_OFFLINE_MISSING'(離線缺檔, 帶missing)、'E_EXTRACT'(解壓)、'E_RENAME'(移入快取), 以及fsDownloadFileVerify之code('E_HTTP'、'E_NETWORK'、'E_TIMEOUT'、'E_TIMEOUT_TOTAL'、'E_SIZE_MISMATCH'、'E_HASH_MISMATCH'、'E_FS'等, 訊息前綴fsEnsureBins[<pkg>] file[<name>] from <github|url>); 皆帶step, 屬某檔者另帶pkg與bin(檔名)。訊息與欄位內之網址帳密一律遮蔽(鏡像網址帶帳密者須傳入opt.fetch處理認證, 否則E_ARG)。
 *
 * 環境變數(本函數統一讀取process.env): W_BIN_CACHE(共用快取資料夾)、W_BIN_MIRROR(鏡像)、W_BIN_OFFLINE(1或true為離線)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsEnsureBins.test.mjs Github}
 * @memberOf wsemi
 * @param {Object|String} manifest 輸入清單物件(schema 1), 或其JSON檔路徑(相對路徑以opt.pkgRoot為基準)
 * @param {Object} opt 輸入設定物件
 * @param {String} opt.pkgRoot 輸入套件根目錄, 必填
 * @param {String|Array} [opt.names=null] 輸入只取部分檔之名稱或其陣列, 預設null為全部
 * @param {String} [opt.cacheDir=''] 輸入快取資料夾(其下為<sha256>/<name>), 優先於W_BIN_CACHE, ''為預設位置, 預設''
 * @param {String} [opt.mirror=undefined] 輸入鏡像(本地資料夾或http(s)基底網址), 給了即優先於W_BIN_MIRROR(空字串為不使用鏡像)
 * @param {Boolean} [opt.offline=undefined] 輸入是否離線, 給了即優先於W_BIN_OFFLINE
 * @param {Function} [opt.fetch=null] 輸入fetch函數(測試注入或處理認證), 未給時用全域fetch
 * @param {Function} [opt.onProgress=null] 輸入進度通知函數, 收到{ pkg, step('manifest'、'cache'、'mirror'、'download'、'extract'、'ready'、'cleanup'), name, ... }, 其拋錯皆忽略
 * @param {String} [opt.floatingManifestUrl=null] 輸入主幹模式之清單網址, 須在https://raw.githubusercontent.com/<repo>/之下, 預設由清單之repo與manifestPath組成
 * @param {Integer} [opt.maxAttempts=3] 輸入下載之最多嘗試次數(交fsDownloadFileVerify)
 * @param {Number} [opt.retryDelayMs=1000] 輸入下載之重試間隔基數毫秒(交fsDownloadFileVerify)
 * @param {Number} [opt.stallMs=30000] 輸入下載之停滯毫秒數(交fsDownloadFileVerify)
 * @param {Number} [opt.totalMs=600000] 輸入每個檔下載之整體時間上限毫秒數(交fsDownloadFileVerify)
 * @returns {Promise} 回傳Promise, resolve回傳物件{ [name]: 絕對路徑 }(另有不可列舉之leftovers: 刪不掉之暫存夾[{ name, fp, error }]), reject回傳帶code之Error
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
 *     let fdt = './_test_fsEnsureBins'
 *     fsCreateFolder(fdt) //創建任務資料夾(作為套件根目錄)
 *
 *     //本機HTTP服務扮GitHub, 提供repo內之bin/tool.exe
 *     let body = Buffer.from('MZ-tool')
 *     let hits = 0
 *     let server = http.createServer((req, res) => {
 *         hits++
 *         res.writeHead(200, { 'content-length': String(body.length) })
 *         res.end(body)
 *     })
 *     await new Promise((resolve) => {
 *         server.listen(8812, '127.0.0.1', resolve)
 *     })
 *     let fetch = (url, init) => {
 *         return globalThis.fetch(url.replace('https://raw.githubusercontent.com', 'http://127.0.0.1:8812'), init)
 *     }
 *
 *     //清單(實務上為bin/manifest.json)
 *     let manifest = {
 *         schema: 1,
 *         pkg: 'w-example',
 *         mode: 'pinned',
 *         repo: 'yuda-lyu/w-example',
 *         commit: '0123456789abcdef0123456789abcdef01234567',
 *         files: [
 *             { name: 'tool.exe', path: 'bin/tool.exe', sha256: crypto.createHash('sha256').update(body).digest('hex'), size: body.length },
 *         ],
 *     }
 *
 *     //首次: 下載、校驗後放入快取<pkgRoot>/bin-cache/<sha256>/tool.exe
 *     let r1 = await fsEnsureBins(manifest, { pkgRoot: fdt, fetch, mirror: '', offline: false })
 *     ms.push({ name: Object.keys(r1)[0], inCache: r1['tool.exe'].includes('bin-cache'), content: fs.readFileSync(r1['tool.exe'], 'utf8'), hits })
 *
 *     //第二次: 快取命中(校驗), 不連網
 *     let r2 = await fsEnsureBins(manifest, { pkgRoot: fdt, fetch, mirror: '', offline: false })
 *     ms.push({ same: r2['tool.exe'] === r1['tool.exe'], hits })
 *
 *     //離線且快取另放他處(無檔): E_OFFLINE_MISSING, 訊息含檔名、sha256、應放之路徑
 *     await fsEnsureBins(manifest, { pkgRoot: fdt, cacheDir: `${fdt}/other`, mirror: '', offline: true })
 *         .catch((err) => {
 *             console.log(err.message)
 *             ms.push({ code: err.code, name: err.missing[0].name, size: err.missing[0].size })
 *         })
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
 * // fsEnsureBins[w-example]: offline (W_BIN_OFFLINE or opt.offline), 1 external executable file(s) are not in the cache or the mirror:
 * // - tool.exe: sha256 40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913, 7 bytes
 * // ...
 * // ms [
 * //   { name: 'tool.exe', inCache: true, content: 'MZ-tool', hits: 1 },
 * //   { same: true, hits: 1 },
 * //   { code: 'E_OFFLINE_MISSING', name: 'tool.exe', size: 7 }
 * // ]
 *
 */
async function fsEnsureBins(manifest, opt = {}) {
    let optIn = null
    try {
        optIn = { fs, path, crypto, Readable, pipeline, spawn, env: process.env, ...opt }
    }
    catch (err) {
        //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 交Core由讀取opt失敗之同一出口reject(E_ARG)
        optIn = {
            get fs() {
                throw err
            },
        }
    }
    return fsEnsureBinsCore(manifest, optIn)
}


export default fsEnsureBins
