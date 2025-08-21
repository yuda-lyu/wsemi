import fs from 'fs'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsDeleteFile from './src/fsDeleteFile.mjs'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import fsTaskCp from './src/fsTaskCp.mjs'


let test = async () => {
    return new Promise((resolve, reject) => {
        let msSrc = []
        let msTar = []

        let fp = './_taskcp'
        fsDeleteFolder(fp) //預先清除fsTaskCp持久化數據資料夾

        let fpc = './_taskcpSrc'
        fsDeleteFolder(fpc) //預先清除fsTaskCp持久化數據資料夾

        let fpt = './_taskcpTar'
        fsDeleteFolder(fpt) //預先清除fsTaskCp持久化數據資料夾

        let otk = fsTaskCp(fpc, fpt)

        let otkSrc = otk.buildSrc()
        otkSrc.on('set', (msg) => {
            // console.log('otkSrc set', msg)
            console.log(`src send task...`, msg)
            msSrc.push({ type: 'src-send', msg: JSON.stringify(msg) })
        })
        otkSrc.on('remove', (msg) => {
            // console.log('otkSrc remove', msg)
            console.log(`src send task...`, msg)
            msSrc.push({ type: 'src-send', msg: JSON.stringify(msg) })
        })

        let otkTar = otk.buildTar()
        otkTar.on('change', (msg) => {
            // console.log('otkTar change', msg)

            //接收任務
            console.log(`tar recv task...`, msg.kpCmp)
            msTar.push({ type: 'tar-recv', msg: JSON.stringify(msg.kpCmp) })

            setTimeout(() => {
                console.log(`tar deal task done`)
                msTar.push({ type: 'tar-done', msg: JSON.stringify(msg.kpCmp) })
                msg.pm.resolve()
            }, 1000)

        })

        setTimeout(() => {
            fsCreateFolder(fp)
        }, 1)

        setTimeout(() => {
            fs.writeFileSync(`${fp}/abc.txt`, 'abc', 'utf8')
            otkSrc.set('abc.txt', 'hash_a1')
        }, 3000)

        setTimeout(() => {
            fs.writeFileSync(`${fp}/abc.txt`, 'mnop', 'utf8')
            otkSrc.set('abc.txt', 'hash_a2')
            fs.writeFileSync(`${fp}/def.txt`, 'def', 'utf8')
            otkSrc.set('def.txt', 'hash_b1')
        }, 6000)

        setTimeout(() => {
            fsDeleteFile(`${fp}/abc.txt`)
            otkSrc.remove('abc.txt')
        }, 9000)

        setTimeout(() => {
            otkTar.clear()
        }, 12000)

        setTimeout(() => {
            fsDeleteFolder(fp)
            fsDeleteFolder(fpc)
            fsDeleteFolder(fpt)
            let ms = {
                msSrc,
                msTar,
            }
            console.log('ms', ms)
            resolve(ms)
        }, 15000)

    })
}
await test()
    .catch((err) => {
        console.log(err)
    })
// src send task... { type: 'set', fp: 'abc.txt', hash: 'hash_a1' }
// tar recv task... {
//   del: [],
//   add: [ { fp: 'abc.txt', hash: 'hash_a1' } ],
//   same: [],
//   diff: []
// }
// tar deal task done
// src send task... { type: 'set', fp: 'abc.txt', hash: 'hash_a2' }
// src send task... { type: 'set', fp: 'def.txt', hash: 'hash_b1' }
// tar recv task... {
//   del: [],
//   add: [ { fp: 'def.txt', hash: 'hash_b1' } ],
//   same: [],
//   diff: [ { fp: 'abc.txt', hash: 'hash_a2' } ]
// }
// src send task... { type: 'remove', fp: 'abc.txt' }
// tar deal task done
// tar recv task... {
//   del: [ { fp: 'abc.txt', hash: 'hash_a2' } ],
//   add: [],
//   same: [ { fp: 'def.txt', hash: 'hash_b1' } ],
//   diff: []
// }
// tar deal task done
// ms {
//   msSrc: [
//     {
//       type: 'src-send',
//       msg: '{"type":"set","fp":"abc.txt","hash":"hash_a1"}'
//     },
//     {
//       type: 'src-send',
//       msg: '{"type":"set","fp":"abc.txt","hash":"hash_a2"}'
//     },
//     {
//       type: 'src-send',
//       msg: '{"type":"set","fp":"def.txt","hash":"hash_b1"}'
//     },
//     { type: 'src-send', msg: '{"type":"remove","fp":"abc.txt"}' }
//   ],
//   msTar: [
//     {
//       type: 'tar-recv',
//       msg: '{"del":[],"add":[{"fp":"abc.txt","hash":"hash_a1"}],"same":[],"diff":[]}'
//     },
//     {
//       type: 'tar-done',
//       msg: '{"del":[],"add":[{"fp":"abc.txt","hash":"hash_a1"}],"same":[],"diff":[]}'
//     },
//     {
//       type: 'tar-recv',
//       msg: '{"del":[],"add":[{"fp":"def.txt","hash":"hash_b1"}],"same":[],"diff":[{"fp":"abc.txt","hash":"hash_a2"}]}'
//     },
//     {
//       type: 'tar-done',
//       msg: '{"del":[],"add":[{"fp":"def.txt","hash":"hash_b1"}],"same":[],"diff":[{"fp":"abc.txt","hash":"hash_a2"}]}'
//     },
//     {
//       type: 'tar-recv',
//       msg: '{"del":[{"fp":"abc.txt","hash":"hash_a2"}],"add":[],"same":[{"fp":"def.txt","hash":"hash_b1"}],"diff":[]}'
//     },
//     {
//       type: 'tar-done',
//       msg: '{"del":[{"fp":"abc.txt","hash":"hash_a2"}],"add":[],"same":[{"fp":"def.txt","hash":"hash_b1"}],"diff":[]}'
//     }
//   ]
// }

//node g.mjs
