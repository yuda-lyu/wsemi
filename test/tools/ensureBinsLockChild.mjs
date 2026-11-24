import fs from 'fs'
import crypto from 'crypto'
import fsEnsureBins from '../../src/fsEnsureBins.mjs'


//子行程(fsEnsureBins之跨程序鎖測試, 規則帳本R-BIN-ENSURE-01規則19): 依設定檔呼叫fsEnsureBins, 每個onTrace事件以一行'EV <JSON>'印出(供父行程以事件同步, 不以延時),
//結束以一行'RESULT <JSON>'印出; 取得後立即讀檔核對SHA-256與大小(檔案組逐檔核對)
//用法: node ensureBinsLockChild.mjs <設定檔.json>; 設定檔為{ port, pkgRoot, manifest, opt }: 清單內之https網址一律改指本機HTTP服務127.0.0.1:<port>(不連外網), opt併入fsEnsureBins之opt
let cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
let sha = (b) => {
    return crypto.createHash('sha256').update(b).digest('hex')
}
let line = (s) => {
    process.stdout.write(`${s}\n`)
}
let fetch = (u, init) => {
    return globalThis.fetch(String(u).replace(/^https:\/\//, `http://127.0.0.1:${cfg.port}/`), init)
}
let onTrace = (e) => {
    line(`EV ${JSON.stringify(e)}`)
}
let check = (fp, x) => {
    let b = fs.readFileSync(fp)
    return sha(b) === x.sha256 && b.length === x.size
}
try {
    let r = await fsEnsureBins(cfg.manifest, { pkgRoot: cfg.pkgRoot, fetch, mirror: '', offline: false, env: {}, retryDelayMs: 10, ...cfg.opt, onTrace })
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
