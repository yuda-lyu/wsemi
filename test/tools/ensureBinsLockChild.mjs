import fs from 'fs'
import crypto from 'crypto'
import fsEnsureBins from '../../src/fsEnsureBins.mjs'


//子行程(fsEnsureBins之跨程序鎖測試, 規則帳本R-BIN-ENSURE-01規則19、20): 依設定檔呼叫fsEnsureBins, 每個onTrace事件以一行'EV <JSON>'印出(供父行程以事件同步, 不以延時),
//結束以一行'RESULT <JSON>'印出; 取得後立即讀檔核對SHA-256與大小(檔案組逐檔核對)
//用法: node ensureBinsLockChild.mjs <設定檔.json>; 設定檔為{ port, pkgRoot, manifest, opt, gateTrace, gateFs }: 清單內之https網址一律改指本機HTTP服務127.0.0.1:<port>(不連外網), opt併入fsEnsureBins之opt
//事件閘門(交錯之決定性構造, 不以延時): 到達閘門時印出'GATE <id>'後同步停住, 直到父行程建立標記檔<file>才續行(上限60秒, 只防懸置)
//  gateTrace: [{ id, type, file }], 收到該type之onTrace事件(印出EV之後)即停
//  gateFs: [{ id, op: 'mkdirSync'|'rmdirSync', path, when: 'before'|'after', file }], 以包裝之fs於該方法對該路徑(完全相同之絕對路徑)呼叫之前或之後停; 每個閘門只停一次
let cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
let sha = (b) => {
    return crypto.createHash('sha256').update(b).digest('hex')
}
//line, 同步寫出一行(閘門停住事件迴圈前須已送出; 並保持與EV行之順序)
let line = (s) => {
    fs.writeSync(1, `${s}\n`)
}
let block = (g) => {
    line(`GATE ${g.id}`)
    let ia = new Int32Array(new SharedArrayBuffer(4))
    let t0 = Date.now()
    while (!fs.existsSync(g.file) && Date.now() - t0 < 60000) {
        Atomics.wait(ia, 0, 0, 10)
    }
}
let fetch = (u, init) => {
    return globalThis.fetch(String(u).replace(/^https:\/\//, `http://127.0.0.1:${cfg.port}/`), init)
}
let gatesTrace = Array.isArray(cfg.gateTrace) ? cfg.gateTrace.map((g) => ({ ...g, done: false })) : []
let onTrace = (e) => {
    line(`EV ${JSON.stringify(e)}`)
    for (let g of gatesTrace) {
        if (!g.done && g.type === e.type) {
            g.done = true
            block(g)
        }
    }
}
let optFs = {}
if (Array.isArray(cfg.gateFs) && cfg.gateFs.length > 0) {
    let gates = cfg.gateFs.map((g) => ({ ...g, done: false }))
    let wrap = (op) => {
        return (p, ...a) => {
            let g = gates.find((v) => !v.done && v.op === op && String(p) === v.path)
            if (g && g.when === 'before') {
                g.done = true
                block(g)
            }
            let r = fs[op](p, ...a)
            if (g && g.when === 'after') {
                g.done = true
                block(g)
            }
            return r
        }
    }
    optFs = { fs: { ...fs, mkdirSync: wrap('mkdirSync'), rmdirSync: wrap('rmdirSync') } }
}
let check = (fp, x) => {
    let b = fs.readFileSync(fp)
    return sha(b) === x.sha256 && b.length === x.size
}
try {
    let r = await fsEnsureBins(cfg.manifest, { pkgRoot: cfg.pkgRoot, fetch, mirror: '', offline: false, env: {}, retryDelayMs: 10, ...cfg.opt, ...optFs, onTrace })
    let out = {}
    for (let f of cfg.manifest.files || []) {
        if (r[f.name] !== undefined) {
            out[f.name] = { fp: r[f.name], ok: check(r[f.name], f.extract ? f.extract : f) } //壓縮檔者比對解出之檔
        }
    }
    for (let b of cfg.manifest.bundles || []) {
        if (r[b.name] !== undefined) {
            let files = [...(b.files || []), ...(b.archives || []).flatMap((a) => a.extract.files)]
            out[b.name] = { fp: r[b.name], ok: files.every((f) => check(r.bundles[b.name].files[f.path], f)) }
        }
    }
    line(`RESULT ${JSON.stringify({ ok: true, out, leftovers: r.leftovers.length })}`)
}
catch (err) {
    line(`RESULT ${JSON.stringify({ ok: false, code: err.code, step: err.step, message: err.message })}`)
}
