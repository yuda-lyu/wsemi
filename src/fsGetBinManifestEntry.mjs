import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import errToStr from './_errToStr.mjs'
import { isBinName, isBinRel, binUrlProblem } from './_binRules.mjs'


/**
 * 後端nodejs依實檔產生外部執行檔清單之一項{ name, path或url, sha256, size }, 供各套件之toolg/genBinManifest.mjs產生bin/manifest.json(清單不手寫sha256與大小)
 *
 * 清單之格式與用法見fsEnsureBins(規格: 外部執行檔之存放下載校驗與離線, 規則帳本R-BIN-ENSURE-01)。name、path與url須合fsEnsureBins之規則(與其共用同一規則: url須為GitHub版本標籤之資產網址https://github.com/<owner>/<repo>/releases/download/<tag>/<檔>或ref為40碼提交之GitHub原始檔網址, 不得帶帳密、查詢字串、片段、埠號, 規格M2、F15), path與url不可同給, 不合者reject。檔案組(fsEnsureBins之bundles)之組內各檔以opt.path給組內相對路徑(取其path、sha256、size), 壓縮檔之成員亦同(先解出至暫存夾再對各成員呼叫本函數)。sha256為小寫64碼, size為位元組數; 計算對象為檔案之原始位元組, 自有檔須與GitHub上之內容(git blob)相同, 文字檔請以.gitattributes設為binary(不轉換換行)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetBinManifestEntry.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String|null} [opt.name] 輸入清單項之name，預設為fp之檔名; 給null時清單項不含name(檔案組之組內檔與壓縮檔之成員只需path, 其檔名可含空白, 如chrome之'First Run')
 * @param {String} [opt.path] 輸入清單項之path(repo內之相對路徑, 以/分隔)，給了才放入
 * @param {String} [opt.url] 輸入清單項之url(廠商檔之下載網址)，給了才放入
 * @returns {Promise} 回傳Promise，resolve回傳清單項物件{ name, path, url, sha256, size }(path、url給了才有, opt.name為null時無name)，reject回傳錯誤訊息字串
 * @example
 * //need test in nodejs
 *
 * import fs from 'fs'
 *
 * let test = async () => {
 *     let ms = []
 *
 *     let fdt = './_test_fsGetBinManifestEntry'
 *     fsCreateFolder(fdt) //創建任務資料夾
 *
 *     fs.writeFileSync(`${fdt}/tool.exe`, 'MZ-tool')
 *
 *     let r1 = await fsGetBinManifestEntry(`${fdt}/tool.exe`, { path: 'bin/tool.exe' })
 *     console.log('r1', r1)
 *     ms.push(r1)
 *
 *     let r2 = await fsGetBinManifestEntry(`${fdt}/tool.exe`)
 *     console.log('r2', r2)
 *     ms.push(r2)
 *
 *     await fsGetBinManifestEntry(`${fdt}/none.exe`)
 *         .catch((err) => {
 *             ms.push({ err: typeof err })
 *         })
 *
 *     fsDeleteFolder(fdt) //最終階段清除任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // r1 {
 * //   name: 'tool.exe',
 * //   path: 'bin/tool.exe',
 * //   sha256: '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913',
 * //   size: 7
 * // }
 * // r2 {
 * //   name: 'tool.exe',
 * //   sha256: '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913',
 * //   size: 7
 * // }
 * // ms [
 * //   {
 * //     name: 'tool.exe',
 * //     path: 'bin/tool.exe',
 * //     sha256: '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913',
 * //     size: 7
 * //   },
 * //   {
 * //     name: 'tool.exe',
 * //     sha256: '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913',
 * //     size: 7
 * //   },
 * //   { err: 'string' }
 * // ]
 *
 */
async function fsGetBinManifestEntry(fp, opt = {}) {
    let r = null
    try {
        let name = get(opt, 'name')
        let p = get(opt, 'path')
        let u = get(opt, 'url')
        if (!isestr(fp)) {
            throw new Error(`fp is not an effective string`)
        }
        if (name !== undefined && name !== null && (typeof name !== 'string' || name === '')) {
            throw new Error(`opt.name must be a non-empty primitive string or null when given`)
        }
        for (let [k, v] of [['path', p], ['url', u]]) {
            if (v !== undefined && (typeof v !== 'string' || v === '')) {
                throw new Error(`opt.${k} must be a non-empty primitive string when given`)
            }
        }
        if (p !== undefined && u !== undefined) {
            throw new Error(`opt.path and opt.url can not be given together (an entry has exactly one source)`)
        }
        if (u !== undefined && binUrlProblem(u) !== '') {
            throw new Error(`opt.url[${u}] is not a url that fsEnsureBins accepts: ${binUrlProblem(u)}`)
        }
        if (p !== undefined && !isBinRel(p)) {
            throw new Error(`opt.path[${p}] is not a relative path that fsEnsureBins accepts (/ separators, letters, digits, spaces and ._+-)`)
        }
        if (!fs.statSync(fp).isFile()) {
            throw new Error(`fp[${fp}] is not a file`)
        }
        r = {}
        if (name !== null) {
            r.name = name !== undefined ? name : path.basename(fp)
            if (!isBinName(r.name)) {
                throw new Error(`name[${r.name}] is not a file name that fsEnsureBins accepts (letters, digits and ._+-, not a reserved device name), give opt.name`)
            }
        }
        if (p !== undefined) {
            r.path = p
        }
        if (u !== undefined) {
            r.url = u
        }
    }
    catch (err) {
        return Promise.reject(errToStr(err))
    }
    let h = crypto.createHash('sha256')
    let size = 0
    let rs = null
    try {
        rs = fs.createReadStream(fp)
        for await (let chunk of rs) {
            size += chunk.length
            h.update(chunk)
        }
    }
    catch (err) {
        return Promise.reject(errToStr(err))
    }
    finally {
        if (rs !== null) {
            rs.destroy()
        }
    }
    r.sha256 = h.digest('hex')
    r.size = size
    return r
}


export default fsGetBinManifestEntry
