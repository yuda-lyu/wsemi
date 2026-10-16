//clearXssLenRunner.mjs: 於限額子行程執行 clearXSS 之極大length案例(R-OBJ-ITER-01), 修前之實作會迭代length次並逐一建立屬性而耗盡記憶體崩潰
//  約定同runChildCase: node [--expose-gc] [--max-old-space-size=N] clearXssLenRunner.mjs <caseName>, 結果以一行'@@R@@'開頭之JSON輸出至stdout
//  caseName: 'len:<數字>'(頂層物件{length,a})、'nest:<數字>'(巢狀於物件與陣列內之{length,a})、'keys:<數字>'(length極大且另有100個自有鍵)、
//  'tag:<數字>'(以Symbol.toStringTag偽稱Array之物件{length,a}: isarr為真而非真陣列, 不得依length迭代)
import clearXSS from '../../src/clearXSS.mjs'


let x = '<script>alert(1)</script>'
let fx = '&lt;script>alert(1)&lt;/script>'

//heapUsed與耗時, 先呼叫一次載入js-xss並gc, 使增量只反映該次clearXSS
function measure(inp) {
    clearXSS({ b: x })
    if (typeof global.gc === 'function') {
        global.gc()
    }
    let h0 = process.memoryUsage().heapUsed
    let t0 = process.hrtime.bigint()
    let r = clearXSS(inp)
    let ms = Number(process.hrtime.bigint() - t0) / 1e6
    let heapMB = (process.memoryUsage().heapUsed - h0) / 1048576
    return { r, ms, heapMB }
}

let caseName = process.argv[2] || ''
let [kind, sn] = caseName.split(':')
let len = Number(sn)
let inp
if (kind === 'len') {
    inp = { length: len, a: x }
}
else if (kind === 'tag') {
    inp = { [Symbol.toStringTag]: 'Array', length: len, a: x }
}
else if (kind === 'nest') {
    inp = { p: [{ q: { length: len, a: x } }], b: x }
}
else if (kind === 'keys') {
    inp = { length: len }
    for (let i = 0; i < 100; i++) {
        inp['k' + i] = x
    }
}
else {
    throw new Error('unknown case: ' + caseName)
}

let { r, ms, heapMB } = measure(inp)

let out = { kind, len, ms, heapMB, keys: Object.keys(r), hasIndexKeys: false, cleaned: false, lengthKept: false }
if (kind === 'len' || kind === 'tag') {
    out.cleaned = r.a === fx
    out.lengthKept = r.length === len
}
else if (kind === 'nest') {
    out.cleaned = r.b === fx && r.p[0].q.a === fx
    out.lengthKept = r.p[0].q.length === len
    out.keys = Object.keys(r.p[0].q)
}
else {
    out.cleaned = Object.keys(r).filter((k) => k !== 'length').every((k) => r[k] === fx)
    out.lengthKept = r.length === len
}
out.hasIndexKeys = out.keys.some((k) => /^\d+$/.test(k))
console.log('@@R@@' + JSON.stringify(out))
