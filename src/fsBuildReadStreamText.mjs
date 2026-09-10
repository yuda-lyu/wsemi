import fs from 'fs'
import readline from 'readline' //已是nodejs內建函數, rollup為舊版無法偵測故會提示
import fsIsFile from './fsIsFile.mjs'
import evem from './evem.mjs'
import _evemEmit from './_evemEmit.mjs'


/**
 * 使用stream從檔案讀utf8文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsBuildReadStreamText.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入讀取檔案路徑字串
 * @returns {EventEmitter} 回傳EventEmitter，可監聽create、line、close、error事件，line事件接收讀入各列字串，create於回傳後延後派發故可被監聽。底層stream出錯(如開檔時檔案已消失、無讀取權限)以error事件回報{ fun: 'stream', msg }且隨後仍派發close。事件物件為原生EventEmitter(eventemitter3)。本模組於派發處以try攔截監聽器之同步拋錯，故其不會使行程崩潰，會改以error事件回報{ fun: 'listener', name, msg, args }，無error監聽者則console.error；惟依EventEmitter規範，同一次派發中先拋錯之監聽器會中止該次派發，其後之監聽器不再被呼叫。async監聽器之reject不被攔截(規範上emit不觀察監聽器回傳值)，須由監聽器自行處理，否則為unhandledRejection，監聽error時請先以fun欄位分流
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
 *
 *     ev.on('create', () => {
 *         console.log('create')
 *         ms.push({ 'create': '' })
 *     })
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
 * // create
 * // line abc
 * // line 測試中文
 * // line def123xyz
 * // close
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
    let ev = evem() //line/close事件於readline與stream回呼內派發, 監聽器出錯不得殺行程, 由evem預設政策重發error事件

    //stream
    let stream = fs.createReadStream(fp, { encoding: 'utf8' })

    //stream error, 底層stream之error(如open時檔案已消失ENOENT、無權限EACCES)無人監聽會殺行程, readline亦不轉發, 故轉為ev之error事件; stream出錯後會自行destroy並派發close
    stream.on('error', (err) => {
        _evemEmit(ev, 'error', [{ fun: 'stream', msg: err }], { tag: 'fsBuildReadStreamText' })
    })

    //create, 須延後至呼叫端取得ev並註冊監聽器後才派發(同步emit時呼叫端尚未取得ev, 永遠監聽不到); nextTick早於任何I/O回呼, 而stream之open與read皆為非同步I/O, 故create必先於error、line與close
    process.nextTick(() => {
        _evemEmit(ev, 'create', [], { tag: 'fsBuildReadStreamText' })
    })

    //rl
    let rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity, //支援\r\n或\n
    })

    //rl line
    rl.on('line', (line) => {
        // console.log(`line`,line)
        _evemEmit(ev, 'line', [line], { tag: 'fsBuildReadStreamText' })
    })

    //rl error, 新版nodejs(實測v24)之readline會將input之error再於Interface上emit('error'), 無監聽者同樣殺行程; 同一錯誤已由stream.on('error')轉發, 此處僅吸收避免重複派發
    rl.on('error', () => {})

    // //rl close
    // rl.on('close', () => {
    //     // console.log('close')
    // })

    //stream close
    stream.on('close', () => {
        //stream close事件才代表檔案可刪除
        _evemEmit(ev, 'close', [], { tag: 'fsBuildReadStreamText' })
    })

    // //stream end
    // stream.on('end', () => {
    //     //stream end事件只是讀寫結束, 不代表檔案可刪除
    // })

    return ev
}


export default fsBuildReadStreamText
