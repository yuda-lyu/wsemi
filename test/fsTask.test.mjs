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

            fsDeleteFolder('./_tkfs')

            let fp = './_test_for_fsTask'
            fsDeleteFolder(fp)

            let ev = fsTask(fp, { timeInterval: 500 })
            ev.on('change', (msg) => {
                // console.log(msg.type, msg.fn)

                //content
                let c = ''
                try {
                    c = fs.readFileSync(msg.fp, 'utf8')
                }
                catch (err) {}

                if ((msg.type === 'add' || msg.type === 'diff') && (msg.fn === 'abc.txt')) {
                    // console.log(`task[${msg.fn}]`, `content[${c}]`, 'calculating')
                    ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'calculating' })
                    setTimeout(() => {
                        // console.log(`task[${msg.fn}]`, `content[${c}]`, 'finish')
                        ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'finish' })
                        msg.pm.resolve()
                    }, 2000)
                }
                else if (msg.type === 'del') {
                    // console.log(`task[${msg.fn}]`, 'remove result')
                    ms.push({ type: msg.type, fp: msg.fn, mode: 'remove-result' })
                    msg.pm.resolve()
                }
                else {
                    // console.log(`task[${msg.fn}]`, `content[${c}]`, 'skip')
                    ms.push({ type: msg.type, fp: msg.fn, content: c, mode: 'skip' })
                    msg.pm.resolve()
                }

            })

            setTimeout(() => {
                fsCreateFolder(fp)
            }, 1)

            setTimeout(() => {
                fs.writeFileSync(`${fp}/abc.txt`, 'abc', 'utf8')
            }, 3000)

            setTimeout(() => {
                fs.writeFileSync(`${fp}/abc.txt`, 'mnop', 'utf8')
                fs.writeFileSync(`${fp}/def.txt`, 'def', 'utf8')
            }, 6000)

            setTimeout(() => {
                fsDeleteFile(`${fp}/abc.txt`)
            }, 9000)

            setTimeout(() => {
                fsDeleteFolder(fp)
            }, 12000)

            setTimeout(() => {
                ev.clear()
                fsDeleteFolder('./_tkfs')
                // console.log('ms', ms)
                resolve(ms)
            }, 15000)

        })
    }
    // test()
    //     .catch(() => {})
    // add abc.txt
    // task[abc.txt] content[abc] calculating
    // task[abc.txt] content[abc] finish
    // diff abc.txt
    // task[abc.txt] content[mnop] calculating
    // task[abc.txt] content[mnop] finish
    // add def.txt
    // task[def.txt] content[def] skip
    // del abc.txt
    // task[abc.txt] remove result
    // del def.txt
    // task[def.txt] remove result
    let ms = [
        { type: 'add', fp: 'abc.txt', content: 'abc', mode: 'calculating' },
        { type: 'add', fp: 'abc.txt', content: 'abc', mode: 'finish' },
        { type: 'diff', fp: 'abc.txt', content: 'mnop', mode: 'calculating' },
        { type: 'diff', fp: 'abc.txt', content: 'mnop', mode: 'finish' },
        { type: 'add', fp: 'def.txt', content: 'def', mode: 'skip' },
        { type: 'del', fp: 'abc.txt', mode: 'remove-result' },
        { type: 'del', fp: 'def.txt', mode: 'remove-result' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = await test()
        let rr = ms
        console.log('ms r', r)
        console.log('ms rr', rr)
        assert.strict.deepStrictEqual(r, rr)
    })

})
