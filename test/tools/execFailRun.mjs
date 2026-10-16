//execFailRun.mjs: R-EXEC-FAIL-01之6~14各測試檔共用之子行程呼叫端, 執行test/tools/execFailRunner.mjs之指定案例並剖析其輸出
//  各測試檔一律import此函數, 不得在測試檔內另寫近似之run(); 子行程與結果行之處理委派runChildCase(各執行器共用)
import { fileURLToPath } from 'url'
import { runChildCase } from './runChildCase.mjs'


let runner = fileURLToPath(new URL('./execFailRunner.mjs', import.meta.url))


/**
 * 於獨立子行程執行execFailRunner.mjs之一個案例
 *
 * @param {String} caseName 案例名稱(execFailRunner.mjs內cases之鍵)
 * @param {Object} [opt={}] 輸入設定物件, 傳給runChildCase
 * @param {String} [opt.exitMode=''] 輸入結束模式字串, 為'nohandler'時執行器不掛未捕捉例外記錄器(驗回調拋錯使行程以離開碼1結束並印出錯誤), 預設''
 * @param {Number} [opt.timeout=90000] 輸入子行程逾時毫秒數, 預設90000
 * @param {Boolean} [opt.allowNoResult=false] 輸入無結果行是否不視為錯誤布林值(nohandler模式之子行程崩潰時無結果行), 預設false
 * @returns {Object} 回傳{ r, ms, status, signal, stderr }, r為子行程輸出之結果物件({ out, unhandled, uncaught }, nohandler模式為{ out }, 無結果行時為null), ms為耗時, status為離開碼, signal為被終止之訊號, stderr為子行程之stderr字串
 */
function runExecFail(caseName, opt = {}) {
    let rc = runChildCase(runner, caseName, { timeout: 90000, ...opt })

    //夾具未能清除(執行器於finally刪除本案資料夾失敗)屬測試基礎設施問題, 直接擲出而不讓其殘留
    if (rc.r !== null && rc.r.cleanupError) {
        throw new Error(`${caseName}: 夾具未能清除: ${rc.r.cleanupError}`)
    }

    return rc
}


export { runExecFail }
