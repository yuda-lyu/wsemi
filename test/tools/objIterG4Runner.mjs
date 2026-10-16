//objIterG4Runner.mjs: 於限額子行程執行 keysmat2ltdt、mat2ltdt、ltdtmerge、fsTaskCp 之極大length案例(R-OBJ-ITER-01), 修前之實作會依length迭代並逐一建立屬性而耗盡記憶體崩潰, 或對陣列設定length而拋RangeError
//  約定同runChildCase: node [--expose-gc] [--max-old-space-size=N] objIterG4Runner.mjs <caseName>, 結果以一行'@@R@@'開頭之JSON輸出至stdout
//  caseName: '<函數>:<變體>:<length值>', 例如 'ltdtmerge:dArrSObj:9007199254740991'
//    keysmat2ltdt:basic、mat2ltdt:basic: 欄名為'length'且各列該欄值為length
//    ltdtmerge:dArrSObj(目的端陣列、來源端{length})、dObjSArr(目的端{length}、來源端陣列)、dEmptyArrSObj(目的端空陣列)、
//      both(兩端皆物件)、top(最外層元素即帶length)、deep(巢狀於陣列與物件內)
//    fsTaskCp:basic: buildTar於fpHash.json含{length: N}時之change事件kpCmp(夾具於test/_tmp/fsTaskCpLen/child-N/, 由本檔自建自刪)
//  輸出: { fn, variant, len, ms, heapMB, out }, 同步案例以先暖機一次並gc後量耗時與heapUsed增量(不含序列化結果), fsTaskCp無ms與heapMB
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import keysmat2ltdt from '../../src/keysmat2ltdt.mjs'
import mat2ltdt from '../../src/mat2ltdt.mjs'
import ltdtmerge from '../../src/ltdtmerge.mjs'


let __dirname = dirname(fileURLToPath(import.meta.url))

//各案例之呼叫, n為length值
let calls = {
    'keysmat2ltdt:basic': (n) => keysmat2ltdt(['length', 'a'], [[n, 'x'], [n, 'y']]),
    'mat2ltdt:basic': (n) => mat2ltdt([['length', 'a'], [n, 'x'], [n, 'y']]),
    'ltdtmerge:dArrSObj': (n) => ltdtmerge([{ x: ['a', 'b'] }], [{ x: { length: n } }]),
    'ltdtmerge:dObjSArr': (n) => ltdtmerge([{ x: { length: n } }], [{ x: ['a'] }]),
    'ltdtmerge:dEmptyArrSObj': (n) => ltdtmerge([{ x: [] }], [{ x: { length: n } }]),
    'ltdtmerge:both': (n) => ltdtmerge([{ x: { length: n, a: 1 } }], [{ x: { length: n, b: 2 } }]),
    'ltdtmerge:top': (n) => ltdtmerge([{ length: n, a: 1 }], [{ length: n, b: 2 }]),
    'ltdtmerge:deep': (n) => ltdtmerge([{ p: [{ q: { length: n } }] }], [{ p: [{ q: ['z'] }] }]),
}

//安全移除夾具(Windows下chokidar剛關閉時可能短暫被占用, 故重試)
let removeFixture = async (dir, root) => {
    let rd = resolve(dir)
    if (!rd.startsWith(resolve(root) + '\\') && !rd.startsWith(resolve(root) + '/')) {
        throw new Error('fixture out of root: ' + rd)
    }
    for (let i = 0; i < 30; i++) {
        try {
            fs.rmSync(rd, { recursive: true, force: true })
        }
        catch (err) {}
        if (!fs.existsSync(rd)) {
            return true
        }
        await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return false
}

let emit = (o) => {
    return new Promise((resolve) => {
        process.stdout.write('@@R@@' + JSON.stringify(o) + '\n', () => resolve())
    })
}

let caseName = process.argv[2] || ''
let [fn, variant, sn] = caseName.split(':')
let len = Number(sn)
let key = `${fn}:${variant}`

if (key === 'fsTaskCp:basic') {

    let { default: fsTaskCp } = await import('../../src/fsTaskCp.mjs')
    let root = resolve(__dirname, '..', '_tmp', 'fsTaskCpLen')
    let dir = join(root, `child-${sn}`)
    fs.mkdirSync(join(dir, 'src'), { recursive: true })
    fs.mkdirSync(join(dir, 'tar'), { recursive: true })

    let ev = null
    let code = 0
    try {
        let otk = fsTaskCp(join(dir, 'src'), join(dir, 'tar'))
        let evS = otk.buildSrc()
        ev = otk.buildTar()
        let kpCmp = await new Promise((resolve, reject) => {
            let t = setTimeout(() => reject(new Error('timeout waiting change event')), 30000)
            ev.on('change', (msg) => {
                clearTimeout(t)
                resolve(JSON.parse(JSON.stringify(msg.kpCmp)))
            })
            evS.writeKp({ 'length': len, 'a.txt': 'h1' })
        })
        await emit({ fn, variant, len, out: kpCmp })
    }
    catch (err) {
        code = 2
        await emit({ fn, variant, len, error: String(err && err.message ? err.message : err) })
    }
    finally {
        if (ev !== null) {
            ev.clear()
        }
        await new Promise((resolve) => setTimeout(resolve, 300))
        await removeFixture(dir, root)
    }
    process.exit(code)

}
else if (typeof calls[key] === 'function') {

    let call = calls[key]

    //先呼叫一次並gc, 使增量只反映該次呼叫
    call(2)
    if (typeof global.gc === 'function') {
        global.gc()
    }
    let h0 = process.memoryUsage().heapUsed
    let t0 = process.hrtime.bigint()
    let out = call(len)
    let ms = Number(process.hrtime.bigint() - t0) / 1e6
    let heapMB = (process.memoryUsage().heapUsed - h0) / 1048576
    await emit({ fn, variant, len, ms, heapMB, out })
    process.exit(0)

}
else {
    throw new Error('unknown case: ' + caseName)
}
