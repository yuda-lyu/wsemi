import fs from 'fs'
import assert from 'assert'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fsTask from '../src/fsTask.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`fsTask 檔案來源之紀錄須為一般物件(R-OBJ-ITER-01 候選9)`, function() {

    //fpHash.json、fpResult.json 讀自檔案(可能被竄改或損毀), 須視為一般物件之字典: length 為一般鍵, 非一般物件者視為無紀錄
    let root = join(__dirname, '_tmp', 'fsTaskRecord')
    let wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    let item = (p) => [{ type: 'file', path: p }]

    //測試自建自刪(只刪本案資料夾, 不刪 test/_tmp 根目錄)
    after(function() {
        fs.rmSync(root, { recursive: true, force: true })
        assert.strict.strictEqual(fs.existsSync(root), false)
    })

    //mk, 建立案例資料夾: watch 為監看夾(可預放檔案), _tkfs 為儲存夾(可預寫紀錄檔原文)
    let mk = (name, { hash = null, result = null, files = {} } = {}) => {
        let base = join(root, name)
        fs.rmSync(base, { recursive: true, force: true })
        let fd = join(base, 'watch')
        let st = join(base, '_tkfs')
        fs.mkdirSync(fd, { recursive: true })
        fs.mkdirSync(st, { recursive: true })
        for (let [fn, c] of Object.entries(files)) {
            fs.writeFileSync(join(fd, fn), c, 'utf8')
        }
        if (hash !== null) {
            fs.writeFileSync(join(st, 'fpHash.json'), hash, 'utf8')
        }
        if (result !== null) {
            fs.writeFileSync(join(st, 'fpResult.json'), result, 'utf8')
        }
        return { fd, st }
    }

    //watch, 以 40 ms 輪詢 ms 毫秒, 收集 change 事件並立即 resolve 其 pm
    let watch = async (c, ms = 400) => {
        let events = []
        let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 40 })
        ev.on('change', (msg) => {
            events.push({ type: msg.type, fp: msg.fp, fn: msg.fn, hash: msg.hash })
            msg.pm.resolve()
        })
        try {
            await wait(ms)
        }
        finally {
            ev.clear()
        }
        return events
    }

    let readJson = (c, fn) => JSON.parse(fs.readFileSync(join(c.st, fn), 'utf8'))
    let sortBy = (arr) => [...arr].sort((a, b) => (a.fp < b.fp ? -1 : 1))

    it(`should treat a length key of fpHash.json as an ordinary path: one del event per recorded key and none repeated`, async function() {
        //修前: 整個字典依 length 當類陣列迭代, 每個輪詢週期重複派發 { type: 'del', fp: '0', fn: '0', hash: '' }
        let c = mk('hash-length', { hash: '{"length":1,"a":"h"}' })
        let events = await watch(c, 500)
        assert.strict.deepStrictEqual(sortBy(events), [
            { type: 'del', fp: 'a', fn: 'a', hash: 'h' },
            { type: 'del', fp: 'length', fn: 'length', hash: 1 },
        ])
        assert.strict.deepStrictEqual(readJson(c, 'fpHash.json'), {})
    })

    it(`should dispatch one del event for a recorded path and update the record (control without length)`, async function() {
        let c = mk('hash-control', { hash: '{"a":"h"}' })
        let events = await watch(c, 400)
        assert.strict.deepStrictEqual(events, [{ type: 'del', fp: 'a', fn: 'a', hash: 'h' }])
        assert.strict.deepStrictEqual(readJson(c, 'fpHash.json'), {})
    })

    it(`should dispatch add once for a watched file named length`, async function() {
        let c = mk('hash-file-length', { files: { length: 'abc' } })
        let events = await watch(c, 400)
        assert.strict.deepStrictEqual(events.map((v) => [v.type, v.fn]), [['add', 'length']])
        assert.strict.deepStrictEqual(Object.keys(readJson(c, 'fpHash.json')), [events[0].fp])
    })

    let notObjs = ['["a","b"]', '"abc"', '123', 'null', 'true', '{bad', '']
    for (let content of notObjs) {
        it(`should treat fpHash.json as no record when it is not a plain object (${JSON.stringify(content)}): no event for an empty folder`, async function() {
            let c = mk('hash-notobj', { hash: content })
            let events = await watch(c, 300)
            assert.strict.deepStrictEqual(events, [])
        })

        it(`should dispatch add once for a new file and record it when fpHash.json is not a plain object (${JSON.stringify(content)})`, async function() {
            let c = mk('hash-notobj-file', { hash: content, files: { 'f.txt': 'abc' } })
            let events = await watch(c, 400)
            assert.strict.deepStrictEqual(events.map((v) => [v.type, v.fn]), [['add', 'f.txt']])
            assert.strict.deepStrictEqual(Object.keys(readJson(c, 'fpHash.json')), [events[0].fp])
        })
    }

    it(`should keep other results and the length key when fpResult.json has a length key and a result is taken`, function() {
        //修前: each 依 length 當類陣列迭代, 其他結果全被清空, 檔案寫成 {}
        let c = mk('result-length', { result: JSON.stringify({ 'length': 0, 'a|h': item('x'), 'b|h': item('y') }) })
        let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 100000 })
        try {
            assert.strict.deepStrictEqual(ev.getAndEliminateResult('a', 'h'), item('x'))
        }
        finally {
            ev.clear()
        }
        assert.strict.deepStrictEqual(readJson(c, 'fpResult.json'), { 'length': 0, 'b|h': item('y') })
    })

    it(`should keep other results when a result is taken (control without length)`, function() {
        let c = mk('result-control', { result: JSON.stringify({ 'a|h': item('x'), 'b|h': item('y') }) })
        let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 100000 })
        try {
            assert.strict.deepStrictEqual(ev.getAndEliminateResult('a', 'h'), item('x'))
        }
        finally {
            ev.clear()
        }
        assert.strict.deepStrictEqual(readJson(c, 'fpResult.json'), { 'b|h': item('y') })
    })

    for (let content of notObjs) {
        it(`should treat fpResult.json as no record when it is not a plain object (${JSON.stringify(content)}): setResult does not throw and results can be taken`, function() {
            //修前: 字串/數字/null/布林使 setResult 拋 TypeError, 字串被展開寫成 {"0":"a",...}
            let c = mk('result-notobj', { result: content })
            let ev = fsTask(c.fd, { fdStorage: c.st, timeInterval: 100000 })
            try {
                assert.strict.deepStrictEqual(ev.getAndEliminateResult('x', 'y'), [])
                assert.strict.deepStrictEqual(readJson(c, 'fpResult.json'), {})
                ev.setResult('f', 'h', item('p'))
                assert.strict.deepStrictEqual(readJson(c, 'fpResult.json'), { 'f|h': item('p') })
                assert.strict.deepStrictEqual(ev.getAndEliminateResult('f', 'h'), item('p'))
                assert.strict.deepStrictEqual(readJson(c, 'fpResult.json'), {})
            }
            finally {
                ev.clear()
            }
        })
    }

})

describe(`fsTask`, function() {

    let test = async () => {
        return new Promise((resolve, reject) => {
            let ms = []

            let fpc = './_tkfs'
            fsDeleteFolder(fpc) //預先清除fsTask持久化數據資料夾

            let fpt = './_test_fsTask'
            fsDeleteFolder(fpt) //預先清除任務資料夾

            let fpr = './_test_fsTask_result'
            fsCreateFolder(fpr) //創建結果資料夾

            let ev = fsTask(fpt, { timeInterval: 500 })
            ev.on('change', (msg) => {
                // console.log(msg.type, msg.fn)

                //content
                let c = ''
                try {
                    c = fs.readFileSync(msg.fp, 'utf8')
                }
                catch (err) {}

                if (msg.fn === 'abc.txt') {
                    //僅針對abc.txt任務

                    if (msg.type === 'add' || msg.type === 'diff') {
                        //針對新增或變更任務

                        // console.log(`task[${msg.fn}]`, `content[${c}]`, 'calculating')
                        ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'calculating' })

                        //模擬計算延遲
                        setTimeout(() => {

                            //模擬計算完儲存結果
                            fs.writeFileSync(`${fpr}/res1.json`, 'res1', 'utf8')
                            fs.writeFileSync(`${fpr}/res2.json`, 'res2', 'utf8')

                            //使用setResult紀錄完成分析後之關聯結果檔
                            ev.setResult(msg.fp, msg.hash, [
                                {
                                    type: 'file',
                                    path: `${fpr}/res1.json`,
                                },
                                {
                                    type: 'file',
                                    path: `${fpr}/res2.json`,
                                },
                            ])

                            // console.log(`task[${msg.fn}]`, `content[${c}]`, 'save-result')
                            ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'save-result' })

                            msg.pm.resolve()
                        }, 2000)

                    }
                    else { //msg.type === 'del'
                        //針對任務刪除

                        // console.log(`task[${msg.fn}]`, 'remove-task')
                        ms.push({ type: msg.type, fp: msg.fn, mode: 'remove-task' })

                        //刪除任務時, 自動刪除關聯結果檔
                        let rrs = ev.getAndEliminateResult(msg.fp, msg.hash)
                        // console.log('rrs', rrs)
                        for (let k = 0; k < rrs.length; k++) {
                            fsDeleteFile(rrs[k].path)
                        }

                        // console.log(`task[${msg.fn}]`, 'remove-result')
                        ms.push({ type: msg.type, fp: msg.fn, mode: 'remove-result' })

                        msg.pm.resolve()
                    }

                }
                else {
                    //針對其他任務

                    // console.log(`task[${msg.fn}]`, `content[${c}]`, 'skip')
                    ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'skip' })
                    msg.pm.resolve()
                }

            })

            setTimeout(() => {
                fsCreateFolder(fpt)
            }, 1)

            setTimeout(() => {
                fs.writeFileSync(`${fpt}/abc.txt`, 'abc', 'utf8')
            }, 3000)

            setTimeout(() => {
                fs.writeFileSync(`${fpt}/abc.txt`, 'mnop', 'utf8')
                fs.writeFileSync(`${fpt}/def.txt`, 'def', 'utf8')
            }, 6000)

            setTimeout(() => {
                fsDeleteFile(`${fpt}/abc.txt`)
            }, 9000)

            setTimeout(() => {
                fsDeleteFolder(fpt) //最終階段清除任務資料夾
            }, 12000)

            setTimeout(() => {
                ev.clear() //結束後中止ev
                fsDeleteFolder(fpc) //結束後清除fsTask持久化數據資料夾
                fsDeleteFolder(fpr) //結束後清除結果資料夾
                // console.log('ms', ms)
                resolve(ms)
            }, 15000)

        })
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // add abc.txt
    // task[abc.txt] content[abc] calculating
    // task[abc.txt] content[abc] save-result
    // add def.txt
    // task[def.txt] content[def] skip
    // diff abc.txt
    // task[abc.txt] content[mnop] calculating
    // task[abc.txt] content[mnop] save-result
    // del abc.txt
    // task[abc.txt] remove-task
    // task[abc.txt] remove-result
    // del def.txt
    // task[def.txt] content[] skip
    let ms = [
        { type: 'add', fp: 'abc.txt', content: 'abc', mode: 'calculating' },
        { type: 'add', fp: 'abc.txt', content: 'abc', mode: 'save-result' },
        { type: 'add', fp: 'def.txt', content: 'def', mode: 'skip' },
        { type: 'diff', fp: 'abc.txt', content: 'mnop', mode: 'calculating' },
        { type: 'diff', fp: 'abc.txt', content: 'mnop', mode: 'save-result' },
        { type: 'del', fp: 'abc.txt', mode: 'remove-task' },
        { type: 'del', fp: 'abc.txt', mode: 'remove-result' },
        { type: 'del', fp: 'def.txt', content: '', mode: 'skip' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
