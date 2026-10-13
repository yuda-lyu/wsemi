//spawnEmfileRunner.mjs: 於獨立子行程以替身重現node之EMFILE/ENFILE分支後呼叫指定函數, 印出結局與未捕捉例外(JSON一行)
//  替身依node lib/internal/child_process.js之ChildProcess.prototype.spawn: 對EMFILE、ENFILE設spawnfile與spawnargs後, 以nextTick觸發onexit(錯誤碼), 不建立stdin/stdout/stderr即return
//  須於子行程執行, 因改的是ChildProcess.prototype, 不可污染mocha之worker
//用法: node test/tools/spawnEmfileRunner.mjs <模組資料夾絕對路徑> <execProcess|execCli|execCliSession|execCliJsonRpc> [opt之JSON]
import util from 'util'
import cp from 'child_process'
import path from 'path'
import { pathToFileURL } from 'url'


let [fdImpl, fn, sopt] = process.argv.slice(2)
let opt = sopt ? JSON.parse(sopt) : {}
let SA = 'SECRET_ARG_7d1f' //機密標記, 置於args
let out = { settle: null, value: null, uncaught: [] }

process.on('uncaughtException', (e) => {
    out.uncaught.push(String(e && e.message))
})

//UV_EMFILE, 以系統錯誤對照表反查
let UV_EMFILE = [...util.getSystemErrorMap()].find(([k, v]) => v[0] === 'EMFILE')[0]
cp.ChildProcess.prototype.spawn = function(options) {
    this.spawnfile = options.file
    this.spawnargs = options.args
    process.nextTick(() => {
        this._handle.onexit(UV_EMFILE)
    })
    return UV_EMFILE
}

let mod = (await import(pathToFileURL(path.join(fdImpl, `${fn}.mjs`)).href)).default
let args = ['-e', '1', SA]
try {
    let r = null
    if (fn === 'execCliSession') {
        let s = mod(process.execPath, args, opt)
        r = await s.stop()
    }
    else if (fn === 'execCliJsonRpc') {
        r = await mod(process.execPath, args, [{ method: 'x' }], opt)
    }
    else {
        r = await mod(process.execPath, args, opt)
    }
    out.settle = 'resolve'
    out.value = r
}
catch (err) {
    out.settle = 'reject'
    out.value = (typeof err === 'string') ? err : `<${err && err.constructor && err.constructor.name}> ${err && err.message}`
}
await new Promise((resolve) => setTimeout(resolve, 300)) //等候延後之未捕捉例外(nextTick之'error'事件)
out.hasSecret = JSON.stringify(out).includes(SA)
console.log(JSON.stringify(out))
process.exit(0)
