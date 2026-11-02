//intInputHangG6Runner.mjs: 第221項第二批第2輪(ws272b)之「修前會不終止（或耗盡記憶體）」案例之子行程執行器
//  修前: 長度、個數、範圍上限為Infinity（或超大值）者被當作有效值, 迴圈近乎無限（genID、rang）或建立巨大範圍（randomIntsNdpRange、pseudoRandomIntsNdpRange）而不終止或耗盡記憶體;
//  修後: 一律視為非預期而改用預設（見sgud/rule/rulebook_optval.md R-OPT-VAL-01）, 立即完成
//  須於獨立子行程執行並加逾時與記憶體上限（--max-old-space-size）, 不在mocha行程內跑（修前原碼會使mocha行程卡死或耗盡記憶體）
//  被測實作固定為本檔往上兩層之src/（由本檔位置推得）
//  結果以一行'@@R@@'開頭之JSON（{ out }）輸出至stdout, 之後process.exit(0)
//用法: node test/tools/intInputHangG6Runner.mjs <caseName>
//測試端: import { runIntInputHangG6 } from './tools/intInputHangG6Runner.mjs'（本檔被匯入時不執行案例, 只在作為主程式執行時執行）
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import genID from '../../src/genID.mjs'
import rang from '../../src/rang.mjs'
import randomIntsNdpRange from '../../src/randomIntsNdpRange.mjs'
import pseudoRandomIntsNdpRange from '../../src/pseudoRandomIntsNdpRange.mjs'
import bufWrite from '../../src/bufWrite.mjs'
import repObj from '../../src/repObj.mjs'
import { runChildCase } from './runChildCase.mjs'


let fpSelf = fileURLToPath(import.meta.url)

//個數類(iseint, use: 'count')之超大或非有效值: 修前ispint通過後cint, 迴圈近乎無限
const HUGE_COUNT = [
    Infinity,
    'Infinity',
    '1e400',
    Number.MAX_SAFE_INTEGER,
    '9007199254740991',
    2 ** 53,
    4294967296,
    '4294967296',
    1e21,
    '1e21',
    '9007199254740993',
]

//範圍上限類(iseint, use: 'safe')之非有效值（MAX_SAFE_INTEGER本身有效故不列）: 修前isint通過後cint, 建立巨大範圍
const HUGE_VEND = [
    Infinity,
    'Infinity',
    '1e400',
    2 ** 53,
    '9007199254740993',
    1e21,
    '1e21',
]


let cases = {

    //genID: len為Infinity或超大值, 修前迴圈近乎無限, 修後用預設32
    'genID-huge': () => {
        return { lens: HUGE_COUNT.map((v) => genID(v).length) }
    },

    //rang: num為Infinity或超大值, 修前迴圈近乎無限, 修後用預設2
    'rang-num-huge': () => {
        return { rs: HUGE_COUNT.map((v) => rang(0, 10, v)) }
    },

    //randomIntsNdpRange: vend為Infinity或超大值, 修前建立巨大範圍, 修後用預設100（n預設1, 故回傳1個位於[0,100]之整數）
    'randomIntsNdpRange-vend-huge': () => {
        return { rs: HUGE_VEND.map((v) => randomIntsNdpRange(0, v)) }
    },

    //pseudoRandomIntsNdpRange: vend為Infinity或超大值, 修前迴圈近乎無限, 修後用預設100（n預設1, 故回傳1個位於[0,100]之索引）
    'pseudoRandomIntsNdpRange-vend-huge': () => {
        return { rs: HUGE_VEND.map((v) => pseudoRandomIntsNdpRange(0, v)) }
    },

    //repObj: n為4294967296（個數上限+1）或其字串, 修前ispint通過後lodash times配置巨大陣列而耗盡記憶體崩潰, 修後throw固定訊息
    'repObj-n-over-max': () => {
        let out = []
        for (let v of [4294967296, '4294967296']) {
            try {
                repObj({ a: 1 }, v)
                out.push('NOTHROW')
            }
            catch (err) {
                out.push(err.message)
            }
        }
        return { out }
    },

    //rang(ws272c): 兩端有效但間隔溢位為Infinity、num為個數上限4294967295, 修前逐次push近乎43億個Infinity（耗盡記憶體）, 修後於累加前即回[]
    'rang-overflow-huge-num': () => {
        return { rs: [rang(-Number.MAX_VALUE, Number.MAX_VALUE, 4294967295), rang(-1e308, 1e308, 4294967295), rang('-1.7976931348623157e308', '1.7976931348623157e308', '4294967295')] }
    },

    //bufWrite: mLen或nBytes為Infinity或超大值, 修前位移迴圈(for (; mLen >= 8; … mLen -= 8)與for (; eLen > 0; …))不終止, 修後回傳null且不寫入
    'bufWrite-mLen-nBytes-huge': () => {
        let out = []
        for (let v of HUGE_COUNT) {
            let b1 = Buffer.alloc(16, 0xaa)
            let b2 = Buffer.alloc(16, 0xaa)
            let r1 = bufWrite(1.5, b1, 0, true, v, 8)
            let r2 = bufWrite(1.5, b2, 0, true, 52, v)
            out.push([r1, r2, b1.toString('hex') === 'aa'.repeat(16), b2.toString('hex') === 'aa'.repeat(16)])
        }
        return { out }
    },

}


/**
 * 於獨立子行程執行本檔之一個案例並剖析其輸出
 *
 * @param {String} caseName 輸入案例名稱字串（本檔cases之鍵）
 * @param {Object} [opt={}] 輸入設定物件
 * @param {Number} [opt.timeout=12000] 輸入子行程逾時毫秒數
 * @returns {Object} 回傳案例回傳之物件（逾時、記憶體不足或崩潰時拋出可判讀之錯誤, 修前不終止之案例即於此紅燈）
 */
function runIntInputHangG6(caseName, opt = {}) {
    let rc = runChildCase(fpSelf, caseName, { timeout: 12000, execArgv: ['--max-old-space-size=256'], ...opt })
    return rc.r.out
}


function main() {
    let name = process.argv[2]
    if (!Object.prototype.hasOwnProperty.call(cases, name)) {
        console.log('@@R@@' + JSON.stringify({ out: { runnerError: `unknown case ${name}` } }))
        process.exit(0)
    }
    let out = cases[name]()
    console.log('@@R@@' + JSON.stringify({ out }))
    process.exit(0)
}


//僅作為主程式執行時才跑案例
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
    main()
}


export { HUGE_COUNT, HUGE_VEND, runIntInputHangG6 }
