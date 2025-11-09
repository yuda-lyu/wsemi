import fs from 'fs'
import readline from 'readline' //已是nodejs內建函數, rollup為舊版無法偵測故會提示
import fsIsFile from './fsIsFile.mjs'
import evem from './evem.mjs'


/**
 * 使用stream從檔案讀utf8文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsBuildReadStreamText.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入讀取檔案路徑字串
 * @returns {EventEmitter} 回傳EventEmitter，可監聽create、line、close事件，line事件接收讀入各列字串
 * @example
 * need test in nodejs.
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsBuildReadStreamText'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fp = `${fdt}/${fn}`
 *
 *     fs.writeFileSync(fp, `abc
 * 測試中文
 * def123xyz
 * `, 'utf8')
 *
 *     let ev = fsBuildReadStreamText(fp)
 *     ms.push({ 'create': '' })
 *
 *     ev.on('line', (line) => {
 *         console.log('line', line)
 *         ms.push({ line })
 *     })
 *
 *     let pm = genPm()
 *     ev.on('close', () => {
 *         console.log('close')
 *         pm.resolve()
 *         ms.push({ 'close': '' })
 *     })
 *     await pm
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test()
 * // ms [
 * //   { create: '' },
 * //   { line: 'abc' },
 * //   { line: '測試中文' },
 * //   { line: 'def123xyz' },
 * //   { close: '' }
 * // ]
 *
 */
function fsBuildReadStreamText(fp) {

    //check
    if (!fsIsFile(fp)) {
        throw new Error(`fp is not a file`)
    }

    //ev
    let ev = evem()

    //stream
    let stream = fs.createReadStream(fp, { encoding: 'utf8' })
    ev.emit('create')

    //rl
    let rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity, //支援\r\n或\n
    })

    //rl line
    rl.on('line', (line) => {
        // console.log(`line`,line)
        ev.emit('line', line)
    })

    // //rl close
    // rl.on('close', () => {
    //     // console.log('close')
    // })

    //stream close
    stream.on('close', () => {
        //stream close事件才代表檔案可刪除
        ev.emit('close')
    })

    // //stream end
    // stream.on('end', () => {
    //     //stream end事件只是讀寫結束, 不代表檔案可刪除
    // })

    return ev
}


export default fsBuildReadStreamText
