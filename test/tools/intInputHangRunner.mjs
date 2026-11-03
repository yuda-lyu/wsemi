//intInputHangRunner.mjs: 整數輸入使迴圈不終止(或配置無限)之案例(sepInt、arrSep、bufRead、getFileBasicHash、getFileXxHash、getFileHash)之子行程執行器
//  修前: n、numCount、numGroup、bufRead之nBytes與mLen為Infinity或超過個數上限時迴圈不終止(或陣列無限成長至記憶體耗盡), opt.chunkSize為0或負數時切片不前進而迴圈不終止;
//  須於獨立子行程執行並加逾時, 不在mocha行程內跑(修前原碼會使mocha行程卡死)
//  被測實作固定為本檔往上兩層之src/(由本檔位置推得)
//  結果以一行'@@R@@'開頭之JSON({ out })輸出至stdout; out為案例回傳之物件
//用法: node test/tools/intInputHangRunner.mjs <caseName>
//測試端: import { runIntInputHang } from './tools/intInputHangRunner.mjs'(本檔被匯入時不執行案例, 只在作為主程式執行時執行)
import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'
import sepInt from '../../src/sepInt.mjs'
import arrSep from '../../src/arrSep.mjs'
import bufRead from '../../src/bufRead.mjs'
import getFileBasicHash from '../../src/getFileBasicHash.mjs'
import getFileXxHash from '../../src/getFileXxHash.mjs'
import getFileHash from '../../src/getFileHash.mjs'
import { runChildCase } from './runChildCase.mjs'


let fpSelf = fileURLToPath(import.meta.url)


//以內文'xyz'之Blob計算雜湊, 預設切片與指定chunkSize各算一次, 回傳兩者(修前0與負數之chunkSize不終止, 修後與預設相同)
let hashPair = async (fn, opt) => {
    let mk = () => new Blob([Buffer.from('xyz')])
    return {
        ref: await fn(mk(), { ...opt, chunkSize: undefined }),
        got: await fn(mk(), opt),
    }
}

//NaN與Infinity經JSON.stringify會變成null而與失敗通道null混淆, 非有限數字改記為字串
let serNum = (v) => (typeof v === 'number' && !Number.isFinite(v) ? String(v) : v)

//拋錯轉為可序列化之結果
let tryThrow = (f) => {
    try {
        return { ret: f() }
    }
    catch (err) {
        return { throwMsg: String(err && err.message) }
    }
}

let arr8 = [1, 2, 3, 4, 5, 6, 7, 8]
let b8 = new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0])


let cases = {

    //sepInt: n為Infinity、超過個數上限(2^32)、非安全整數、v為Infinity, 皆throw(ws286b起; 原回[])
    'sepInt-n-inf': () => tryThrow(() => sepInt(10, Infinity)),
    'sepInt-n-neginf': () => tryThrow(() => sepInt(10, -Infinity)),
    'sepInt-n-str-inf': () => tryThrow(() => sepInt(10, 'Infinity')),
    'sepInt-n-2p32': () => tryThrow(() => sepInt(10, 2 ** 32)),
    'sepInt-n-maxsafe': () => tryThrow(() => sepInt(10, Number.MAX_SAFE_INTEGER)),
    'sepInt-n-1e21': () => tryThrow(() => sepInt(10, 1e21)),
    'sepInt-n-str-1e21': () => tryThrow(() => sepInt(10, '1e21')),

    //arrSep: 整數寫法與numCount、numGroup為Infinity、超過個數上限(ws286e起整數寫法無效亦throw; 原回[])
    'arrSep-num-inf': () => tryThrow(() => arrSep(arr8, Infinity)),
    'arrSep-num-str-inf': () => tryThrow(() => arrSep(arr8, 'Infinity')),
    'arrSep-num-2p32': () => tryThrow(() => arrSep(arr8, 2 ** 32)),
    'arrSep-numCount-inf': () => tryThrow(() => arrSep(arr8, { numCount: Infinity })),
    'arrSep-numCount-2p32': () => tryThrow(() => arrSep(arr8, { numCount: 2 ** 32 })),
    'arrSep-numCount-maxsafe': () => tryThrow(() => arrSep(arr8, { numCount: Number.MAX_SAFE_INTEGER })),
    'arrSep-numGroup-inf': () => tryThrow(() => arrSep(arr8, { numGroup: Infinity })),
    'arrSep-numGroup-maxsafe': () => tryThrow(() => arrSep(arr8, { numGroup: Number.MAX_SAFE_INTEGER })),
    'arrSep-numGroup-2p32': () => tryThrow(() => arrSep(arr8, { numGroup: 2 ** 32 })),

    //numCount無效而numGroup有效: 忽略無效鍵改用numGroup(修前numCount為Infinity不終止)
    'arrSep-numCount-inf-numGroup-3': () => tryThrow(() => arrSep(arr8, { numCount: Infinity, numGroup: 3 })),

    //bufRead: nBytes、mLen為Infinity或超過個數上限(修前位元組迴圈之nBits永不小於等於0, 不終止)
    'bufRead-nBytes-inf': () => ({ ret: serNum(bufRead(b8, 0, true, 52, Infinity)) }),
    'bufRead-mLen-inf': () => ({ ret: serNum(bufRead(b8, 0, true, Infinity, 8)) }),
    'bufRead-nBytes-maxsafe': () => ({ ret: serNum(bufRead(b8, 0, true, 52, Number.MAX_SAFE_INTEGER)) }),
    'bufRead-mLen-maxsafe': () => ({ ret: serNum(bufRead(b8, 0, true, Number.MAX_SAFE_INTEGER, 8)) }),
    'bufRead-nBytes-2p32m1': () => ({ ret: serNum(bufRead(b8, 0, true, 52, 4294967295)) }), //有效個數之上限, 但超出buffer長度
    'bufRead-nBytes-str-inf': () => ({ ret: serNum(bufRead(b8, 0, true, 52, 'Infinity')) }),
    'bufRead-mLen-str-inf': () => ({ ret: serNum(bufRead(b8, 0, true, 'Infinity', 8)) }),

    //getFileBasicHash、getFileXxHash、getFileHash: chunkSize為0、負數(修前切片不前進, 不終止)
    'bfh-chunk-0': () => hashPair(getFileBasicHash, { type: 'sha256', chunkSize: 0 }),
    'bfh-chunk-neg1': () => hashPair(getFileBasicHash, { type: 'sha256', chunkSize: -1 }),
    'bfh-chunk-str0': () => hashPair(getFileBasicHash, { type: 'sha256', chunkSize: '0' }),
    'xxh-chunk-0': () => hashPair(getFileXxHash, { chunkSize: 0 }),
    'xxh-chunk-neg1': () => hashPair(getFileXxHash, { chunkSize: -1 }),
    'xxh-chunk-str0': () => hashPair(getFileXxHash, { chunkSize: '0' }),
    'gfh-sha256-chunk-0': () => hashPair(getFileHash, { type: 'sha256', chunkSize: 0 }),
    'gfh-xxhash64-chunk-0': () => hashPair(getFileHash, { type: 'xxhash64', chunkSize: 0 }),
}


/**
 * 於獨立子行程執行本檔之一個案例並剖析其輸出
 *
 * @param {String} caseName 輸入案例名稱字串(本檔cases之鍵)
 * @param {Object} [opt={}] 輸入設定物件
 * @param {Number} [opt.timeout=8000] 輸入子行程逾時毫秒數, 預設8000
 * @returns {Object} 回傳案例回傳之物件(逾時或崩潰時拋出可判讀之錯誤, 修前不終止之案例即於此紅燈)
 */
function runIntInputHang(caseName, opt = {}) {

    //堆積上限64mb: 修前之無限配置(陣列無限成長)於數秒內即記憶體耗盡而終止, 不吃滿機器記憶體
    let rc = runChildCase(fpSelf, caseName, { execArgv: ['--max-old-space-size=64'], timeout: 8000, ...opt })
    return rc.r.out
}


async function main() {
    let name = process.argv[2]
    if (!Object.prototype.hasOwnProperty.call(cases, name)) {
        console.log('@@R@@' + JSON.stringify({ out: { runnerError: `unknown case ${name}` } }))
        return
    }
    let out = await cases[name]()
    console.log('@@R@@' + JSON.stringify({ out }))
}


//僅作為主程式執行時才跑案例
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
    main()
}


export { runIntInputHang }
