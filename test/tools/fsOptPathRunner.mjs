//fsOptPathRunner.mjs: fsLevelLimitOptPath.test.mjs之子行程執行器, 驗路徑型opt鍵(fsSrlog.fdLog、fsTask.fdStorage、fsEvem.fd)給非預期之輸入時改用預設資料夾(相對於工作目錄)
//  node <runner> <caseName>; 測試檔以夾具資料夾為子行程之cwd; 每個值於cwd下自建之子資料夾內(chdir)執行, 結果列該子資料夾內產生之項目名稱
//  案例: srlog(預設./syslog)、evem(預設./_evps)、task(預設./_tkfs)
/* eslint-disable no-new-wrappers */ //本執行器刻意以包裝物件(new String)作為無效輸入
import fs from 'fs'
import fsSrlog from '../../src/fsSrlog.mjs'
import fsEvem from '../../src/fsEvem.mjs'
import fsTask from '../../src/fsTask.mjs'


let caseName = process.argv[2]

//非預期之輸入(非字串、空字串、含NUL、包裝String、Buffer、未給與null)
let bads = () => {
    return [
        ['nul', 'a\0b'],
        ['nulOnly', '\0'],
        ['empty', ''],
        ['num', 5],
        ['zero', 0],
        ['obj', {}],
        ['arr', ['x']],
        ['true', true],
        ['strobj', new String('x')],
        ['buffer', Buffer.from('x')],
        ['badTag', {
            get [Symbol.toStringTag]() {
                throw new Error('bad tag') //型別標籤之getter拋錯: 不得使isestr等型別判定拋錯而蓋過預設
            }
        }],
        ['null', null],
        ['undef', undefined],
    ]
}

let r = {}
for (let [k, v] of bads()) {
    let base = `w_${k}`
    fs.mkdirSync(base)
    process.chdir(base)
    let item = { threw: '', items: [] }
    try {
        if (caseName === 'srlog') {
            fsSrlog({ fdLog: v })
        }
        else if (caseName === 'evem') {
            let ev = fsEvem({ fd: v })
            item.items = fs.readdirSync('.').sort() //clear會刪除事件資料夾, 先取其產生之項目
            ev.clear()
        }
        else if (caseName === 'task') {
            fs.mkdirSync('watch')
            let ev = fsTask('watch', { fdStorage: v, timeInterval: 100000 })
            ev.clear()
        }
        else {
            throw new Error(`unknown case: ${caseName}`)
        }
    }
    catch (err) {
        item.threw = String(err && err.message).slice(0, 80)
    }
    if (caseName !== 'evem' || item.threw !== '') {
        item.items = fs.readdirSync('.').sort()
    }
    process.chdir('..')
    r[k] = item
}
process.stdout.write('@@R@@' + JSON.stringify(r) + '\n')
process.exit(0)
