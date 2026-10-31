//optValG4randHugeNRunner.mjs: 隨機系函數對「超大值」之子行程執行器
//  超大n若被當作有效個數會近乎無限迴圈(現況Infinity即然); 不重複整數(Ndp)系之超大vend若被當作有效值會建立巨大範圍而卡死或耗盡記憶體;
//  故於子行程執行並由呼叫端逾時終止判定; 被測實作固定為本檔往上兩層之src/
//  用法: node test/tools/optValG4randHugeNRunner.mjs <函數名> <n|vend>
//    n: 以超大n呼叫產生n個之函數, 結果{ lens }為各回傳陣列長度(全部應為1, 即視為未給用預設1)
//    vend: 以vstart=Number.MAX_SAFE_INTEGER與超大vend呼叫Ndp函數, 結果{ msgs }為各錯誤訊息(全部應為vend用預設100之vstart>vend錯誤)
//  結果以一行'@@R@@'開頭之JSON輸出至stdout, 由test/tools/runChildCase.mjs剖析
import path from 'path'
import { pathToFileURL, fileURLToPath } from 'url'


let dirSrc = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src')

//超出範圍或非有效值之超大輸入(對iseint之use: 'count'與use: 'safe'皆為非預期)
const HUGE = [
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

//vend模式: 對use: 'safe'為非預期者(Number.MAX_SAFE_INTEGER本身有效, 不在此列)
const HUGE_VEND = [
    Infinity,
    'Infinity',
    '1e400',
    2 ** 53,
    '9007199254740993',
    1e21,
    '1e21',
]

let name = process.argv[2]
let mode = process.argv[3] || 'n'
let mod = await import(pathToFileURL(path.join(dirSrc, `${name}.mjs`)).href)
let f = mod.default
let out = null
if (mode === 'n') {
    let isReal = name === 'randomsRange' || name === 'pseudoRandomsRange'
    let lens = []
    for (let n of HUGE) {
        let r = isReal ? f(0, 1, n) : f(0, 100, n)
        lens.push(r.length)
    }
    out = { lens }
}
else {
    let msgs = []
    for (let v of HUGE_VEND) {
        try {
            f(Number.MAX_SAFE_INTEGER, v)
            msgs.push('NOTHROW')
        }
        catch (err) {
            msgs.push(err.message)
        }
    }
    out = { msgs }
}
console.log('@@R@@' + JSON.stringify(out))
