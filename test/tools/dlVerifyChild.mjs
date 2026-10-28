//fsDownloadFileVerify之子行程案例: 於獨立行程內起本機HTTP服務並呼叫一次, 結束後印出結果; 供測試驗證「呼叫結束後無殘留計時器而使行程不結束」
//用法: node test/tools/dlVerifyChild.mjs <mode> <port> <fp>
//  mode: s404(回404), bad(內容與期望不符且不重試), ok(成功), cut(送出部分本體後斷線: 來源端先出錯, 只試1次)
import http from 'http'
import crypto from 'crypto'
import fsDownloadFileVerify from '../../src/fsDownloadFileVerify.mjs'


let mode = process.argv[2]
let port = Number(process.argv[3])
let fp = process.argv[4]
let body = Buffer.from('child body')
let sha256 = crypto.createHash('sha256').update(body).digest('hex')

let server = http.createServer((req, res) => {
    if (mode === 's404') {
        res.writeHead(404, { 'content-type': 'text/plain' })
        res.end('not found')
        return
    }
    if (mode === 'cut') {
        res.writeHead(200, { 'content-length': String(body.length) })
        res.write(body.subarray(0, 3))
        setTimeout(() => {
            res.socket.destroy()
        }, 20)
        return
    }
    let b = mode === 'bad' ? Buffer.from('child bodx') : body
    res.writeHead(200, { 'content-length': String(b.length) })
    res.end(b)
})
await new Promise((resolve) => {
    server.listen(port, '127.0.0.1', resolve)
})
let t = Date.now()
let r = await fsDownloadFileVerify(`http://127.0.0.1:${port}/x.bin`, fp, { sha256, size: body.length }, { retryOnMismatch: false, maxAttempts: mode === 'cut' ? 1 : 3 })
    .then((res) => {
        return 'resolved'
    }, (err) => {
        return err.code
    })
let ms = Date.now() - t
await new Promise((resolve) => {
    server.close(resolve)
})
console.log(JSON.stringify({ r, ms }))
