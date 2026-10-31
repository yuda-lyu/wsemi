//optValG4randDomKit.mjs: 第221項第二批g4rand組(DOM類)各函數之「opt類數值參數非預期之輸入改用預設」測試共用載具
//  依據: dspec〈輸入參數之檢測機制〉K3、K4、§7.1
//  本檔為第一級發布A之裁剪版: 只含domVirtualCreate(probeVirtualSize)、domFadeOut(probeFade)所需之探針; 非同步版defineOptParamAsync與domConvertToPic、domDrag、domShowImages之探針屬第二、三級, 不在本輪(日後完整版可直接覆蓋本檔)
//  各函數之探針(probe*): 以最小假DOM(test/tools/domFilesKit.mjs之mkBrowser、test/tools/fakeDom.mjs之mkFakeDom)驅動受測函數, 回傳其實際採用之值
//  探針皆以「受測函數f」為參數(不自行匯入src), 故同一探針可對HEAD副本與工作樹各跑一次
//  瀏覽器本身之語義(版面、事件派送順序)非本檔所能驗證, 只驗各函數對參數的檢測與取值
import { mkBrowser } from './domFilesKit.mjs'
import { mkFakeDom, clearFakeDom } from './fakeDom.mjs'


//probeVirtualSize, domVirtualCreate(fun, { [key]: v }): fun以同步回傳, 函數同步執行完畢; 回傳臨時元素之style[key](未設定回傳null)
function probeVirtualSize(f, key, v, o = {}) {
    let env = mkBrowser()
    let got = null
    try {
        let pm = f((ele) => {
            got = ele.style[key]
            return 1
        }, { [key]: v, ...o })
        pm.catch(() => {})
        return got === undefined ? null : got
    }
    finally {
        env.restore()
    }
}


//probeFade, domFadeOut(ele, { duration: v })(domFadeIn同形, 屬日後完整版): 暫換計時器, 手動執行延遲計時器與兩次更新週期, 回傳元素之opacity
//  第一次更新寫入初始透明度(fadeIn為0、fadeOut為1)後加減s=10/duration, 第二次更新寫入之值即初始值加減s(夾在0~1)
function probeFade(f, v, o = {}) {
    let env = mkFakeDom()
    let ele = new env.Ele('div')
    let timeouts = []
    let intervals = []
    let ost = globalThis.setTimeout
    let osi = globalThis.setInterval
    let oci = globalThis.clearInterval
    globalThis.setTimeout = (fn) => {
        timeouts.push(fn)
        return 1
    }
    globalThis.setInterval = (fn) => {
        intervals.push(fn)
        return 2
    }
    globalThis.clearInterval = () => {}
    try {
        f(ele, { duration: v, ...o })
        for (let t of timeouts.splice(0)) {
            t()
        }
        let iv = intervals[0]
        iv()
        iv()
        return ele.style.opacity
    }
    finally {
        globalThis.setTimeout = ost
        globalThis.setInterval = osi
        globalThis.clearInterval = oci
        clearFakeDom()
    }
}


export {
    probeVirtualSize,
    probeFade
}
