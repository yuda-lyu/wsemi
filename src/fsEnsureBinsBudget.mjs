import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { spawn } from 'child_process'
import { fsEnsureBinsBudgetCore } from './fsEnsureBinsCore.mjs'
import mergeInject from './_mergeInject.mjs'


/**
 * 後端nodejs依清單與選項回傳fsEnsureBins一次取得之預算毫秒數(同步), 供使用端設定首次取得之時限(如mocha之before以this.timeout(本函數之值)), 不連網、不建資料夾、不讀快取
 *
 * 預算即fsEnsureBins跨程序鎖之持有與等候上限之同一算式(單一來源, 規則帳本R-BIN-ENSURE-01規則19、20): 所選各取得單位(單一檔、檔案組)之預算之和; 每單位為「可能之下載次數×T＋解壓批數×(T＋5000)＋min(T, 60000)」, T為opt.totalMs之有效值(非預期之輸入改用預設600000, 同fsEnsureBins), 下載次數: 單一直接檔1次、壓縮檔為各來源檔(壓縮檔1個或分割檔數)各1次, 使用鏡像(opt.mirror或W_BIN_MIRROR)者每個來源另加1次(先試鏡像), 壓縮檔另加鏡像之最終檔1次, 檔案組另加鏡像之組資料夾逐檔各1次; 解壓批數: 單一檔1批, 檔案組每個壓縮檔依成員參數總長分批(與fsEnsureBins之tar分批相同)。opt.maxAttempts不相乘(下載之整體上限opt.totalMs已含各次嘗試與重試間隔)。主幹模式(mode為floating)且非離線者另加取主幹清單之上限opt.stallMs; 主幹清單之項目於執行時才知, 預算依傳入之基準清單計算, 取得之檔不符而重取主幹清單時最壞約再加一倍。
 *
 * 他程序正在取得同一單位時, fsEnsureBins先等候其完成(上限即本預算)再重新檢查快取, 持有者失敗時才自行取得, 故並行之首次取得最壞約為本預算之兩倍。
 *
 * 清單與選項之格式與檢核同fsEnsureBins(manifest為清單物件或JSON檔路徑, opt.pkgRoot必填, opt.names選取部分檔), 無效時同步拋出同樣之帶code之Error('E_ARG'、'E_MANIFEST', 訊息同fsEnsureBins); 環境變數(W_BIN_MIRROR、W_BIN_OFFLINE)由process.env讀取, 可以opt.env取代。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsEnsureBinsBudget.test.mjs Github}
 * @memberOf wsemi
 * @param {Object|String} manifest 輸入清單物件(schema 1), 或其JSON檔路徑(相對路徑以opt.pkgRoot為基準), 同fsEnsureBins
 * @param {Object} opt 輸入設定物件, 同fsEnsureBins(本函數只用pkgRoot、names、mirror、offline、env、totalMs、stallMs與檢核所需之注入模組)
 * @param {String} opt.pkgRoot 輸入套件根目錄, 必填
 * @param {String|Array} [opt.names=null] 輸入只計部分檔之名稱或其陣列, 預設null為全部, 空陣列回傳0
 * @param {String} [opt.mirror=undefined] 輸入鏡像, 給了即優先於W_BIN_MIRROR(空字串為不使用鏡像), 使用鏡像者每個來源另加1次
 * @param {Boolean} [opt.offline=undefined] 輸入是否離線, 給了即優先於W_BIN_OFFLINE, 離線者不加取主幹清單之上限
 * @param {Number} [opt.totalMs=600000] 輸入每個檔下載之整體時間上限毫秒數, 規則同fsEnsureBins
 * @param {Number} [opt.stallMs=30000] 輸入停滯毫秒數(主幹模式取主幹清單之上限), 規則同fsEnsureBins
 * @returns {Number} 回傳預算毫秒數(非負整數或含小數之數字, opt.totalMs帶小數時)
 * @example
 * //need test in nodejs
 *
 * let manifest = {
 *     schema: 1,
 *     pkg: 'w-example',
 *     mode: 'pinned',
 *     repo: 'yuda-lyu/w-example',
 *     commit: '0123456789abcdef0123456789abcdef01234567',
 *     files: [
 *         { name: 'tool.exe', path: 'bin/tool.exe', sha256: '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913', size: 7 },
 *         { name: 'k6.exe', url: 'https://github.com/grafana/k6/releases/download/v1.0.0/k6-v1.zip', sha256: '0000000000000000000000000000000000000000000000000000000000000000', size: 100, extract: { type: 'zip', member: 'k6-v1/k6.exe', sha256: '1111111111111111111111111111111111111111111111111111111111111111', size: 50 } },
 *     ],
 * }
 *
 * //tool.exe: 1×T+min(T,60000)=2000; k6.exe: 1×T+1×(T+5000)+min(T,60000)=8000
 * console.log(fsEnsureBinsBudget(manifest, { pkgRoot: '.', mirror: '', offline: false, totalMs: 1000 }))
 * // => 10000
 *
 * //使用鏡像: tool.exe 2×T+min(T,60000)=3000; k6.exe (1+2)×T+(T+5000)+min(T,60000)=10000
 * console.log(fsEnsureBinsBudget(manifest, { pkgRoot: '.', mirror: './mirror', offline: false, totalMs: 1000 }))
 * // => 13000
 *
 * //只計部分檔, 預設totalMs(600000)
 * console.log(fsEnsureBinsBudget(manifest, { pkgRoot: '.', names: 'tool.exe', mirror: '', offline: false }))
 * // => 660000
 *
 */
function fsEnsureBinsBudget(manifest, opt = {}) {
    let optIn = null
    try {
        optIn = mergeInject({ fs, path, crypto, Readable, pipeline, spawn, env: process.env }, opt) //同fsEnsureBins: 注入鍵給undefined視為未給取Node內建
    }
    catch (err) {
        //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 交Core由讀取opt失敗之同一出口拋出E_ARG
        optIn = {
            get fs() {
                throw err
            },
        }
    }
    return fsEnsureBinsBudgetCore(manifest, optIn)
}


export default fsEnsureBinsBudget
