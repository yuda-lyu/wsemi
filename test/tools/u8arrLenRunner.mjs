//u8arrLenRunner.mjs: 於限額子行程執行 u8arr2obj 之偽造分塊資訊案例(R-OBJ-ITER-01規則6), 修前之實作會依分塊資訊{"length":N}迭代N次並逐次配置Uint8Array而耗盡記憶體崩潰
//  約定同runChildCase: node [--expose-gc] [--max-old-space-size=N] u8arrLenRunner.mjs <caseName>, 結果以一行'@@R@@'開頭之JSON輸出至stdout
//  caseName: 'len:<數字>'(標頭JSON為{"length":N}, 物件非陣列)、'item:<數字>'(標頭JSON為[N], 單一分塊長度逾封包)、'items:<數字>'(標頭JSON為[7,N,N], 累計總量逾封包)
//  封包資料區為7位元組之合法主區塊{"a":1}, 故標頭一旦被接受(修前)便會還原出{ a: 1 }
//  外審補測: 'zero:<N>'(標頭為[7,0*N], 主區塊後接N個零長度分塊, 無對應標記: 每項分塊配置一個Uint8Array)、
//  'abref:<KB>:<N>'(一個KB千位元組之分塊, 主區塊為N個同一ArrayBuffer標記"[BlazeForArrayBuffer]::0": 每次引用複製一份堆外ArrayBuffer, 量測extMB=arrayBuffers增量)
import u8arr2obj from '../../src/u8arr2obj.mjs'
import obj2u8arr from '../../src/obj2u8arr.mjs'


let enc = new TextEncoder()

//偽造封包: [8 bytes大端double=標頭長度][標頭JSON文字(UTF-8)][資料區], 不經src內之編碼函數
function build(headerText, dataText) {
    let hb = enc.encode(headerText)
    let db = typeof dataText === 'string' ? enc.encode(dataText) : dataText
    let r = new Uint8Array(8 + hb.length + db.length)
    new DataView(r.buffer).setFloat64(0, hb.length, false)
    r.set(hb, 8)
    r.set(db, 8 + hb.length)
    return r
}

//heapUsed與耗時, 先以合法封包與小標頭暖機並gc, 使增量只反映該次解碼
function measure(pkt) {
    u8arr2obj(obj2u8arr({ a: 1 }), { returnWithStateAndMsg: true })
    u8arr2obj(build('{"length":1}', '{"a":1}'), { returnWithStateAndMsg: true })
    if (typeof global.gc === 'function') {
        global.gc()
    }
    let h0 = process.memoryUsage().heapUsed
    let e0 = process.memoryUsage().arrayBuffers
    let t0 = process.hrtime.bigint()
    let rs = u8arr2obj(pkt, { returnWithStateAndMsg: true })
    let rp = u8arr2obj(pkt)
    let ms = Number(process.hrtime.bigint() - t0) / 1e6
    let heapMB = (process.memoryUsage().heapUsed - h0) / 1048576
    let extMB = (process.memoryUsage().arrayBuffers - e0) / 1048576
    return { rs, rp, ms, heapMB, extMB }
}

let caseName = process.argv[2] || ''
let [kind, sn, sn2] = caseName.split(':')
if (!/^\d+$/.test(sn || '')) {
    throw new Error('unknown case: ' + caseName)
}
let header
let pkt = null
if (kind === 'zero') {
    pkt = build('[7' + ',0'.repeat(Number(sn)) + ']', '{"a":1}')
}
else if (kind === 'abref') {
    if (!/^\d+$/.test(sn2 || '')) {
        throw new Error('unknown case: ' + caseName)
    }
    let main = '[' + Array.from({ length: Number(sn2) }, () => '"[BlazeForArrayBuffer]::0"').join(',') + ']'
    let bin = new Uint8Array(Number(sn) * 1024)
    let mainBytes = enc.encode(main)
    let data = new Uint8Array(mainBytes.length + bin.length)
    data.set(mainBytes, 0)
    data.set(bin, mainBytes.length)
    pkt = build(`[${mainBytes.length},${bin.length}]`, data)
}
else if (kind === 'len') {
    header = `{"length":${sn}}`
}
else if (kind === 'item') {
    header = `[${sn}]`
}
else if (kind === 'items') {
    header = `[7,${sn},${sn}]`
}
else {
    throw new Error('unknown case: ' + caseName)
}

let { rs, rp, ms, heapMB, extMB } = measure(pkt !== null ? pkt : build(header, '{"a":1}'))

let out = { kind, len: Number(sn), ms, heapMB, extMB, state: rs.state, msg: rs.msg, plainKeys: Object.keys(rp) }
console.log('@@R@@' + JSON.stringify(out))
