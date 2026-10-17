//cvOrmFindRunner.mjs: 於限額子行程執行 cvOrmFind 之極大輸入案例(R-FIND-01), 實作若依輸入宣稱之大小配置記憶體或迭代, 會耗盡記憶體或無法結束
//  約定同runChildCase: node [--expose-gc] [--max-old-space-size=N] cvOrmFindRunner.mjs <caseName>, 結果以一行'@@R@@'開頭之JSON輸出至stdout
//  caseName: '<kind>:<數字>'
//    dag:N      共享參照指數展開(深度N之{$and:[x,x]}), 應於節點預算內拒收
//    deep:N     深度N(極深)之$and鏈, 應於深度上限拒收且不因遞迴而堆疊溢位
//    inlen:N    $in為length讀得N之Proxy陣列, 應於長度上限拒收而不配置不迭代
//    sparse:N   $in為new Array(N)之稀疏陣列, 同上
//    andlen:N   $and為length讀得N之Proxy陣列
//    keys:N     頂層物件含N個自有鍵, N超過節點上限時應直接拒收
//    lenkey:N   {length:N,a:1}: length為一般欄名, 不得依length迭代, 應接受且複本保留length值
//    str:N      欄值為長度N之字串, 字串長度不另限, 應接受
//    many:N     N個欄位等值, N為節點上限內之最大值時應接受
//    taproto:N  原型改為null之N位元組Uint8Array, 應於列舉自有索引鍵之前拒收(列舉會依元素數配置鍵而耗盡記憶體)
import cvOrmFind from '../../src/cvOrmFind.mjs'


let caseName = process.argv[2] || ''
let [kind, sn] = caseName.split(':')
let n = Number(sn)

let inp
if (kind === 'dag') {
    let x = { g: 'A' }
    for (let i = 0; i < n; i++) {
        x = { $and: [x, x] }
    }
    inp = x
}
else if (kind === 'deep') {
    let o = { g: 'A' }
    for (let i = 0; i < n; i++) {
        o = { $and: [o] }
    }
    inp = o
}
else if (kind === 'inlen' || kind === 'andlen') {
    let op = kind === 'inlen' ? '$in' : '$and'
    let arr = new Proxy([], {
        get(t, k, r) {
            return k === 'length' ? n : Reflect.get(t, k, r)
        }
    })
    inp = kind === 'inlen' ? { name: { [op]: arr } } : { [op]: arr }
}
else if (kind === 'sparse') {
    inp = { name: { $in: new Array(n) } }
}
else if (kind === 'keys') {
    inp = {}
    for (let i = 0; i < n; i++) {
        inp['f' + i] = i
    }
}
else if (kind === 'lenkey') {
    inp = { length: n, a: 1 }
}
else if (kind === 'str') {
    inp = { name: 'x'.repeat(n) }
}
else if (kind === 'taproto') {
    inp = Object.setPrototypeOf(new Uint8Array(n), null)
}
else if (kind === 'many') {
    inp = {}
    for (let i = 0; i < n; i++) {
        inp['f' + i] = i
    }
}
else {
    throw new Error('unknown case: ' + caseName)
}

if (typeof global.gc === 'function') {
    global.gc()
}
let h0 = process.memoryUsage().heapUsed
let t0 = process.hrtime.bigint()
let out = { kind, n, ok: false, err: '', keys: [], lengthKept: false }
try {
    let r = cvOrmFind(inp)
    out.ok = true
    out.keys = Object.keys(r).length <= 10 ? Object.keys(r) : [`<${Object.keys(r).length} keys>`]
    out.lengthKept = r.length === n
}
catch (err) {
    out.err = String(err && err.message)
}
out.ms = Number(process.hrtime.bigint() - t0) / 1e6
out.heapMB = (process.memoryUsage().heapUsed - h0) / 1048576
console.log('@@R@@' + JSON.stringify(out))
