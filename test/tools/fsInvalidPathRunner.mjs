//fsInvalidPathRunner.mjs: 子行程執行器, 於夾具資料夾(cwd)內對fsPathSites.mjs之全部站點餵無效路徑與對照路徑, 回報各呼叫之結果與對夾具之副作用
//  用法: node fsInvalidPathRunner.mjs all (cwd須為專用夾具資料夾, 其內容會被清空後重建夾具), 結果為一行'@@R@@'開頭之JSON
//  不在mocha行程內呼叫, 因無效路徑(空字串等)可能被錯誤解成工作目錄而誤動工作目錄內之檔案, 子行程之cwd即夾具資料夾, 損害限於其內
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { bads, sites } from './fsPathSites.mjs'


let srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src')
let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

//reset, 清空cwd並重建夾具
let reset = () => {
    for (let n of fs.readdirSync('.')) {
        fs.rmSync(n, { recursive: true, force: true })
    }
    fs.writeFileSync('a.txt', 'abc')
    fs.writeFileSync('j.json', '{"a":1}')
    fs.mkdirSync('d/sub', { recursive: true })
    fs.writeFileSync('d/x.txt', 'x')
    fs.writeFileSync('d/sub/y.txt', 'y')
    fs.mkdirSync('tgt', { recursive: true })
}

//snap, 夾具之內容快照(含檔案大小)
let snap = () => {
    let r = []
    let walk = (p) => {
        for (let e of fs.readdirSync(p, { withFileTypes: true })) {
            let q = p === '.' ? e.name : p + '/' + e.name
            r.push((e.isDirectory() ? 'D ' : 'F ') + q + (e.isFile() ? ' ' + fs.statSync(q).size : ''))
            if (e.isDirectory()) {
                walk(q)
            }
        }
    }
    walk('.')
    return r.sort()
}

//ser, 結果序列化(Error→{ __error }, 函數→'<fn>', undefined→'__undef__', 監看物件→'<watcher>')
let ser = (v) => {
    if (v instanceof Error) {
        return { __error: v.message, name: v.name }
    }
    if (v && typeof v === 'object' && typeof v.clear === 'function' && typeof v.on === 'function') {
        return '<watcher>'
    }
    if (v && typeof v === 'object' && typeof v.pipe === 'function') {
        return '<stream>'
    }
    return JSON.parse(JSON.stringify(v === undefined ? '__undef__' : v, (k, x) => (typeof x === 'function' ? '<fn>' : x === undefined ? '__undef__' : x)))
}

//fillOpt, 站點引數內之{ fs: null }佔位物件換成真實之{ fs, path, crypto }
let fillOpt = (args) => args.map((a) => (a && typeof a === 'object' && !Array.isArray(a) && Object.keys(a).length === 1 && a.fs === null ? { fs, path, crypto } : a))

let mods = {}
let getMod = async (fn) => {
    if (!mods[fn]) {
        mods[fn] = (await import(pathToFileURL(path.join(srcDir, fn + '.mjs')).href)).default
    }
    return mods[fn]
}

//callOnce, 執行一次呼叫並回報{ type, val, fx }; 回傳之監看物件一律clear
let callOnce = async (s, args) => {
    reset()
    let before = snap()
    let rec = {}
    let mod = await getMod(s.fn)
    let timer
    try {
        let r = s.call ? s.call(mod, args) : mod(...args)
        if (r && typeof r.then === 'function') {
            try {
                let pmTimeout = new Promise((resolve, reject) => {
                    timer = setTimeout(() => {
                        reject(new Error('RUNNER_TIMEOUT'))
                    }, 8000)
                })
                let v = await Promise.race([r, pmTimeout])
                rec = { type: 'resolve', val: ser(v) }
            }
            catch (e) {
                rec = { type: 'reject', val: ser(e) }
            }
            finally {
                clearTimeout(timer)
            }
        }
        else {
            rec = { type: 'return', val: ser(r) }
            if (r && typeof r.clear === 'function') {
                try {
                    r.clear()
                }
                catch (e) {}
            }
            if (r && typeof r.destroy === 'function') {
                try {
                    r.destroy()
                }
                catch (e) {}
            }
        }
    }
    catch (e) {
        rec = { type: 'throw', val: ser(e) }
    }
    await sleep(20)
    let after = snap()
    let a = new Set(before)
    let b = new Set(after)
    let fx = [...after.filter((x) => !a.has(x)).map((x) => '+' + x), ...before.filter((x) => !b.has(x)).map((x) => '-' + x)]
    rec.fx = fx
    return rec
}

//only, 開發時以環境變數FS_PATH_ONLY(以逗號分隔之站點名稱)只跑部分站點(須搭配mocha之--fgrep只跑對應之案, 完整性之案會因站點未跑而紅)
let only = process.env.FS_PATH_ONLY ? process.env.FS_PATH_ONLY.split(',') : null

let out = []
for (let s of sites) {
    if (only && !only.includes(s.name)) {
        continue
    }
    for (let p of s.params) {
        for (let [bn, bv] of bads) {
            let rec = await callOnce(s, fillOpt(s.args(bv, p.i)))
            out.push({ site: s.name, param: p.name, bad: bn, ...rec })
        }
        //對照: 有效但不存在之路徑
        if (s.ctl !== null) {
            let rec = await callOnce(s, fillOpt(s.args(s.ctl, p.i)))
            out.push({ site: s.name, param: p.name, bad: '__ctl__', ...rec })
        }
    }
}
console.log('@@R@@' + JSON.stringify(out))
await sleep(50)
process.exit(0)
