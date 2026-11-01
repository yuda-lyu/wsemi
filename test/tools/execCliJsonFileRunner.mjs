//execCliJsonFileRunner.mjs: execCliJsonFile.test.mjs之子行程執行器(onProgress拋錯會成為未捕捉例外, 不可在mocha行程內驗)
//  node <runner> <caseName>, 結果以一行'@@R@@'開頭之JSON輸出至stdout; 夾具資料夾由環境變數WSEMI41_FIXTURE_DIR給定(測試檔建立與刪除)
//  案例: progressThrowsOut(僅stdout側之行使回調拋錯)、progressThrowsErr(僅stderr側)
import { join } from 'path'
import execCliJsonFile from '../../src/execCliJsonFile.mjs'


let caseName = process.argv[2]
let fd = process.env.WSEMI41_FIXTURE_DIR

let out = (o) => {
    process.stdout.write('@@R@@' + JSON.stringify(o) + '\n')
}

let uncaught = []
process.on('uncaughtException', (err) => {
    uncaught.push(String(err && err.message))
})

if (caseName === 'progressThrowsOut' || caseName === 'progressThrowsErr') {
    let throwOnErr = caseName === 'progressThrowsErr'
    let lines = { out: [], err: [] }
    let result = await execCliJsonFile({
        script: join(fd, 'progress.mjs'),
        outputPath: join(fd, 'o-runner.json'),
        exe: process.execPath,
        onProgress: (line, isErr) => {
            lines[isErr ? 'err' : 'out'].push(line)
            if (isErr === throwOnErr) {
                throw new Error('cb-boom')
            }
        },
    })
    await new Promise((resolve) => setImmediate(resolve)) //讓微任務重拋之例外送達
    out({ result, out: lines.out, err: lines.err, uncaught })
}
else {
    throw new Error(`unknown case: ${caseName}`)
}
process.exit(0)
