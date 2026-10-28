import fs from 'fs'
import crypto from 'crypto'
import fsEnsureBins from '../../src/fsEnsureBins.mjs'


//子行程: 以本機HTTP服務扮GitHub取得清單之檔, 取得後立即讀檔核對SHA-256(驗跨行程不讀到半檔), 結果以JSON印出
//用法: node ensureBinsChild.mjs <port> <pkgRoot> <manifest.json之路徑>
let [port, pkgRoot, fpManifest] = process.argv.slice(2)
let fetch = (u, init) => {
    return globalThis.fetch(String(u).replace(/^https:\/\//, `http://127.0.0.1:${port}/`), init)
}
let manifest = JSON.parse(fs.readFileSync(fpManifest, 'utf8'))
try {
    let r = await fsEnsureBins(manifest, { pkgRoot, fetch, mirror: '', offline: false, env: {} })
    let out = {}
    for (let f of manifest.files) {
        let b = fs.readFileSync(r[f.name])
        let x = f.extract ? f.extract : f //壓縮檔者比對解出之檔
        out[f.name] = { fp: r[f.name], ok: crypto.createHash('sha256').update(b).digest('hex') === x.sha256 && b.length === x.size }
    }
    console.log(JSON.stringify({ ok: true, out }))
}
catch (err) {
    console.log(JSON.stringify({ ok: false, code: err.code, message: err.message }))
}
