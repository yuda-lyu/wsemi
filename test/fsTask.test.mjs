import fs from 'fs'
import assert from 'assert'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsTask from '../src/fsTask.mjs'


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

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
