//execProcessPortPids之真實測試用子行程: 在另一個行程內起TCP監聽或連線, 讓監聽者/連線之擁有者PID不是測試行程本身
//  listen: node portPidsChild.mjs listen '<JSON: [{ host, port?, ipv6Only? }, ...]>'  -> 就緒後輸出一行{ pid, listens: [{ host, port }] }, 失敗輸出{ pid, error }並以離開碼2結束
//  connect: node portPidsChild.mjs connect <host> <port>  -> 連上後輸出{ pid, localPort }; stdin收到一行'end'呼叫socket.end()(送FIN)、'destroy'呼叫socket.destroy(); socket之end/close事件輸出{ ev: 'end'|'close' }
//  兩種模式皆於stdin關閉(父行程結束或關閉管道)時結束; 皆以一行JSON通知, 父行程以事件(而非等待時間)同步
import net from 'net'
import readline from 'readline'


let say = (o) => {
    process.stdout.write(JSON.stringify(o) + '\n')
}

let mode = process.argv[2]

//stdin關閉即結束(父行程結束時管道亦關閉, 子行程不殘留)
process.stdin.on('end', () => {
    process.exit(0)
})
process.stdin.resume()

if (mode === 'listen') {
    let specs = JSON.parse(process.argv[3])
    let servers = []
    let listens = []
    try {
        for (let sp of specs) {
            let srv = net.createServer()
            await new Promise((resolve, reject) => {
                srv.once('error', reject)
                srv.listen({ host: sp.host, port: sp.port || 0, ipv6Only: sp.ipv6Only === true }, resolve)
            })
            servers.push(srv)
            listens.push({ host: sp.host, port: srv.address().port })
        }
        say({ pid: process.pid, listens })
    }
    catch (err) {
        say({ pid: process.pid, error: err && err.code ? err.code : String(err) })
        process.exit(2)
    }
}
else if (mode === 'connect') {
    let s = net.connect({ host: process.argv[3], port: Number(process.argv[4]), allowHalfOpen: true })
    s.on('error', (err) => {
        say({ pid: process.pid, error: err && err.code ? err.code : String(err) })
    })
    s.on('end', () => say({ ev: 'end' }))
    s.on('close', () => say({ ev: 'close' }))
    s.on('connect', () => say({ pid: process.pid, localPort: s.localPort }))
    let rl = readline.createInterface({ input: process.stdin })
    rl.on('line', (line) => {
        let cmd = line.trim()
        if (cmd === 'end') {
            s.end(() => say({ ev: 'finish' }))
        }
        else if (cmd === 'destroy') {
            s.destroy()
        }
    })
}
