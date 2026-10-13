//runChildCase.mjs: 以子行程執行「案例執行器」之單一案例並剖析其結果行, 各子行程執行器(pmSettleRunner、execFailRunner等)共用
//  執行器之約定: node <runner> <caseName> [exitMode], 結果以一行'@@R@@'開頭之JSON輸出至stdout
import { spawnSync } from 'child_process'


/**
 * 於獨立子行程執行指定執行器之一個案例
 *
 * @param {String} runner 輸入執行器檔案之絕對路徑字串
 * @param {String} caseName 輸入案例名稱字串
 * @param {Object} [opt={}] 輸入設定物件
 * @param {String} [opt.exitMode=''] 輸入結束模式字串, 為'natural'時不強制結束子行程而以逾時被終止判定其未自然結束(計時器未釋放), 此時無結果行不視為錯誤
 * @param {Number} [opt.timeout=15000] 輸入子行程逾時毫秒數, natural模式預設8000
 * @param {Object} [opt.env=undefined] 輸入子行程之環境變數物件, 預設undefined代表沿用本進程
 * @param {Boolean} [opt.allowNoResult=false] 輸入無結果行是否不視為錯誤布林值(驗子行程崩潰之離開碼與stderr時用), natural模式恆不視為錯誤
 * @returns {Object} 回傳{ r, ms, status, signal, stderr }, r為子行程輸出之結果物件(無則null), ms為耗時, status為離開碼, signal為被終止之訊號
 */
function runChildCase(runner, caseName, opt = {}) {
    let exitMode = opt.exitMode || ''
    let timeout = opt.timeout || (exitMode === 'natural' ? 8000 : 15000)
    let t0 = Date.now()
    let cp = spawnSync(process.execPath, [runner, caseName, exitMode], { encoding: 'utf8', timeout, env: opt.env })
    let ms = Date.now() - t0
    let line = (cp.stdout || '').split(/\r?\n/).find((l) => l.startsWith('@@R@@'))
    let r = line ? JSON.parse(line.slice(5)) : null

    //非natural模式須有結果行, 否則子行程已崩潰或被逾時終止, 直接拋出可判讀之錯誤(而非讓斷言於r為null時拋TypeError)
    if (r === null && exitMode !== 'natural' && opt.allowNoResult !== true) {
        throw new Error(`${caseName}: 子行程無結果行, status=${cp.status}, signal=${cp.signal}, stderr=${String(cp.stderr || '').slice(0, 300)}`)
    }

    return { r, ms, status: cp.status, signal: cp.signal, stderr: cp.stderr || '' }
}


export { runChildCase }
