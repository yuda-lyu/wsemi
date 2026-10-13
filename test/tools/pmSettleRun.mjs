//pmSettleRun.mjs: R-PM-SETTLE-01 各測試檔共用之子行程呼叫端, 執行test/tools/pmSettleRunner.mjs之指定案例並剖析其輸出
//  各測試檔一律import此函數, 不得在測試檔內另寫近似之run(); 子行程與結果行之處理委派runChildCase(各執行器共用)
import { fileURLToPath } from 'url'
import { runChildCase } from './runChildCase.mjs'


let runner = fileURLToPath(new URL('./pmSettleRunner.mjs', import.meta.url))


/**
 * 於獨立子行程執行pmSettleRunner.mjs之一個案例
 *
 * @param {String} caseName 案例名稱(pmSettleRunner.mjs內cases之鍵)
 * @param {String} [exitMode=''] 為'natural'時不強制結束子行程, 以逾8000ms被終止判定其未自然結束(計時器未釋放), 其餘模式逾15000ms被終止
 * @returns {Object} 回傳{ r, ms, status, signal }, r為子行程輸出之結果物件({ out, unhandled, uncaught }, natural模式無輸出時為null), ms為耗時, status為離開碼, signal為被終止之訊號
 */
function runPmSettle(caseName, exitMode) {
    let { r, ms, status, signal } = runChildCase(runner, caseName, { exitMode: exitMode || '' })
    return { r, ms, status, signal }
}


export { runPmSettle }
