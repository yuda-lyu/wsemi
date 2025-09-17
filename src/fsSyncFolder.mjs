import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import fsSyncFolderCore from './fsSyncFolderCore.mjs'


/**
 * 後端nodejs針對新舊資料夾進行差異同步
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsSyncFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fdSrc 輸入來源資料夾字串
 * @param {String} fdTar 輸入目標資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'
 * @returns {Promise} 回傳Promise，resolve代表同步成功，reject代表回傳錯誤訊息
 * @example
 * //need test in nodejs
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsSyncFolder'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fdSrc = `${fdt}/src`
 *     let fdTar = `${fdt}/tar`
 *
 *     let fp
 *     let stage
 *     let b
 *
 *     if (true) {
 *
 *         fp = `${fdTar}/t0.txt`
 *         fsWriteText(fp, 't0')
 *
 *         fp = `${fdTar}/abc/t1.txt`
 *         fsWriteText(fp, 'abc-t1')
 *
 *         fp = `${fdTar}/abc/t2.txt`
 *         fsWriteText(fp, 'abc-t2')
 *
 *         fp = `${fdTar}/def/xyz/t3.txt`
 *         fsWriteText(fp, 'def-xyz-t3')
 *
 *     }
 *
 *     if (true) {
 *
 *         //檔案內容變更
 *         fp = `${fdSrc}/t0.txt`
 *         fsWriteText(fp, 't0-mod')
 *
 *         //未變更
 *         fp = `${fdSrc}/abc/t1.txt`
 *         fsWriteText(fp, 'abc-t1')
 *
 *         //檔案新增
 *         fp = `${fdSrc}/abc/t1-add.txt`
 *         fsWriteText(fp, 'abc-t1-add')
 *
 *         //檔案刪除
 *         // fp = `${fdSrc}/abc/t2.txt`
 *         // fsWriteText(fp, 'abc-t2')
 *
 *         //資料夾刪除, 檔案刪除
 *         // fp = `${fdSrc}/def/xyz/t3.txt`
 *         // fsWriteText(fp, 'def-xyz-t3')
 *
 *         //資料夾新增, 檔案新增
 *         fp = `${fdSrc}/def/xyz-add/t3.txt`
 *         fsWriteText(fp, 'def-xyz-add-t3')
 *
 *     }
 *
 *     stage = 'before'
 *
 *     fp = `${fdTar}/t0.txt`
 *     b = fsIsFile(fp)
 *     console.log(stage, fp, 'fsIsFile', b)
 *     ms.push({ stage, fp, fsIsFile: b })
 *
 *     fp = `${fdTar}/abc`
 *     b = fsIsFolder(fp)
 *     console.log(stage, fp, 'fsIsFolder', b)
 *     ms.push({ stage, fp, fsIsFolder: b })
 *
 *     fp = `${fdTar}/abc/t1.txt`
 *     b = fsIsFile(fp)
 *     console.log(stage, fp, 'fsIsFile', b)
 *     ms.push({ stage, fp, fsIsFile: b })
 *
 *     fp = `${fdTar}/abc/t2.txt`
 *     b = fsIsFile(fp)
 *     console.log(stage, fp, 'fsIsFile', b)
 *     ms.push({ stage, fp, fsIsFile: b })
 *
 *     fp = `${fdTar}/def`
 *     b = fsIsFolder(fp)
 *     console.log(stage, fp, 'fsIsFolder', b)
 *     ms.push({ stage, fp, fsIsFolder: b })
 *
 *     fp = `${fdTar}/def/xyz`
 *     b = fsIsFolder(fp)
 *     console.log(stage, fp, 'fsIsFolder', b)
 *     ms.push({ stage, fp, fsIsFolder: b })
 *
 *     fp = `${fdTar}/def/xyz/t3.txt`
 *     b = fsIsFile(fp)
 *     console.log(stage, fp, 'fsIsFile', b)
 *     ms.push({ stage, fp, fsIsFile: b })
 *
 *     await fsSyncFolder(fdSrc, fdTar)
 *
 *     stage = 'after'
 *
 *     fp = `${fdTar}/t0.txt`
 *     b = fsIsFile(fp)
 *     console.log(stage, fp, 'fsIsFile', b)
 *     ms.push({ stage, fp, fsIsFile: b })
 *
 *     fp = `${fdTar}/abc`
 *     b = fsIsFolder(fp)
 *     console.log(stage, fp, 'fsIsFolder', b)
 *     ms.push({ stage, fp, fsIsFolder: b })
 *
 *     fp = `${fdTar}/abc/t1.txt`
 *     b = fsIsFile(fp)
 *     console.log(stage, fp, 'fsIsFile', b)
 *     ms.push({ stage, fp, fsIsFile: b })
 *
 *     fp = `${fdTar}/abc/t1-add.txt`
 *     b = fsIsFile(fp)
 *     console.log(stage, fp, 'fsIsFile', b)
 *     ms.push({ stage, fp, fsIsFile: b })
 *
 *     fp = `${fdTar}/abc/t2.txt`
 *     b = fsIsFile(fp)
 *     console.log(stage, fp, 'fsIsFile', b) //b=false
 *     ms.push({ stage, fp, fsIsFile: b })
 *
 *     fp = `${fdTar}/def`
 *     b = fsIsFolder(fp)
 *     console.log(stage, fp, 'fsIsFolder', b)
 *     ms.push({ stage, fp, fsIsFolder: b })
 *
 *     fp = `${fdTar}/def/xyz`
 *     b = fsIsFolder(fp)
 *     console.log(stage, fp, 'fsIsFolder', b)
 *     ms.push({ stage, fp, fsIsFolder: b }) //b=false
 *
 *     fp = `${fdTar}/def/xyz-add`
 *     b = fsIsFolder(fp)
 *     console.log(stage, fp, 'fsIsFolder', b)
 *     ms.push({ stage, fp, fsIsFolder: b })
 *
 *     fp = `${fdTar}/def/xyz/t3.txt`
 *     b = fsIsFile(fp)
 *     console.log(stage, fp, 'fsIsFile', b) //b=false
 *     ms.push({ stage, fp, fsIsFile: b })
 *
 *     fp = `${fdTar}/def/xyz-add/t3.txt`
 *     b = fsIsFile(fp)
 *     console.log(stage, fp, 'fsIsFile', b)
 *     ms.push({ stage, fp, fsIsFile: b })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', JSON.stringify(ms, null, 2))
 *     return ms
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // before ./_test_fsSyncFolder/tar/t0.txt fsIsFile true
 * // before ./_test_fsSyncFolder/tar/abc fsIsFolder true
 * // before ./_test_fsSyncFolder/tar/abc/t1.txt fsIsFile true
 * // before ./_test_fsSyncFolder/tar/abc/t2.txt fsIsFile true
 * // before ./_test_fsSyncFolder/tar/def fsIsFolder true
 * // before ./_test_fsSyncFolder/tar/def/xyz fsIsFolder true
 * // before ./_test_fsSyncFolder/tar/def/xyz/t3.txt fsIsFile true
 * // after ./_test_fsSyncFolder/tar/t0.txt fsIsFile true
 * // after ./_test_fsSyncFolder/tar/abc fsIsFolder true
 * // after ./_test_fsSyncFolder/tar/abc/t1.txt fsIsFile true
 * // after ./_test_fsSyncFolder/tar/abc/t1-add.txt fsIsFile true
 * // after ./_test_fsSyncFolder/tar/abc/t2.txt fsIsFile false
 * // after ./_test_fsSyncFolder/tar/def fsIsFolder true
 * // after ./_test_fsSyncFolder/tar/def/xyz fsIsFolder false
 * // after ./_test_fsSyncFolder/tar/def/xyz-add fsIsFolder true
 * // after ./_test_fsSyncFolder/tar/def/xyz/t3.txt fsIsFile false
 * // after ./_test_fsSyncFolder/tar/def/xyz-add/t3.txt fsIsFile true
 * // ms [
 * //   {
 * //     "stage": "before",
 * //     "fp": "./_test_fsSyncFolder/tar/t0.txt",
 * //     "fsIsFile": true
 * //   },
 * //   {
 * //     "stage": "before",
 * //     "fp": "./_test_fsSyncFolder/tar/abc",
 * //     "fsIsFolder": true
 * //   },
 * //   {
 * //     "stage": "before",
 * //     "fp": "./_test_fsSyncFolder/tar/abc/t1.txt",
 * //     "fsIsFile": true
 * //   },
 * //   {
 * //     "stage": "before",
 * //     "fp": "./_test_fsSyncFolder/tar/abc/t2.txt",
 * //     "fsIsFile": true
 * //   },
 * //   {
 * //     "stage": "before",
 * //     "fp": "./_test_fsSyncFolder/tar/def",
 * //     "fsIsFolder": true
 * //   },
 * //   {
 * //     "stage": "before",
 * //     "fp": "./_test_fsSyncFolder/tar/def/xyz",
 * //     "fsIsFolder": true
 * //   },
 * //   {
 * //     "stage": "before",
 * //     "fp": "./_test_fsSyncFolder/tar/def/xyz/t3.txt",
 * //     "fsIsFile": true
 * //   },
 * //   {
 * //     "stage": "after",
 * //     "fp": "./_test_fsSyncFolder/tar/t0.txt",
 * //     "fsIsFile": true
 * //   },
 * //   {
 * //     "stage": "after",
 * //     "fp": "./_test_fsSyncFolder/tar/abc",
 * //     "fsIsFolder": true
 * //   },
 * //   {
 * //     "stage": "after",
 * //     "fp": "./_test_fsSyncFolder/tar/abc/t1.txt",
 * //     "fsIsFile": true
 * //   },
 * //   {
 * //     "stage": "after",
 * //     "fp": "./_test_fsSyncFolder/tar/abc/t1-add.txt",
 * //     "fsIsFile": true
 * //   },
 * //   {
 * //     "stage": "after",
 * //     "fp": "./_test_fsSyncFolder/tar/abc/t2.txt",
 * //     "fsIsFile": false
 * //   },
 * //   {
 * //     "stage": "after",
 * //     "fp": "./_test_fsSyncFolder/tar/def",
 * //     "fsIsFolder": true
 * //   },
 * //   {
 * //     "stage": "after",
 * //     "fp": "./_test_fsSyncFolder/tar/def/xyz",
 * //     "fsIsFolder": false
 * //   },
 * //   {
 * //     "stage": "after",
 * //     "fp": "./_test_fsSyncFolder/tar/def/xyz-add",
 * //     "fsIsFolder": true
 * //   },
 * //   {
 * //     "stage": "after",
 * //     "fp": "./_test_fsSyncFolder/tar/def/xyz/t3.txt",
 * //     "fsIsFile": false
 * //   },
 * //   {
 * //     "stage": "after",
 * //     "fp": "./_test_fsSyncFolder/tar/def/xyz-add/t3.txt",
 * //     "fsIsFile": true
 * //   }
 * // ]
 *
 */
function fsSyncFolder(fdSrc, fdTar, opt = {}) {
    return fsSyncFolderCore(fdSrc, fdTar, { path, fs, crypto, ...opt })
}


export default fsSyncFolder
