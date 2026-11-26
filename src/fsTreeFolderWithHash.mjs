import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import fsTreeFolderWithHashCore from './fsTreeFolderWithHashCore.mjs'
import fsErrMsg from './_fsErrMsg.mjs'
import mergeInject from './_mergeInject.mjs'
import chkFsLevelOpt from './_chkFsLevelOpt.mjs'


/**
 * 後端nodejs列舉指定資料夾下的全部檔案或資料夾，且計算各自HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsTreeFolderWithHash.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fd 輸入欲列舉的資料夾字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}；本參數原為levelLimit(列舉層數，預設1)，現改為設定物件，遷移期給了而非物件者(含舊寫法之數字如1、4294967295，以及陣列、函數、包裝物件)reject說明字串'invalid opt: must be an object'(不帶輸入值；fd無效者先報fd)，undefined、null視為未給，第3個引數有給(非undefined，如舊3參數形之opt)亦reject說明字串'invalid arguments: must be fd and opt only'
 * @param {Integer} [opt.levelLimit=null] 輸入列舉層數限制正整數，設定1為列舉資料夾下第一層的檔案或資料夾，須為有效整數且介於1至4294967295(iseint之use:'count'，可為字串型數字)才限定層數；未給或非預期之輸入(含null、0、負數、小數、超過4294967295、Infinity、'0x10'、包裝物件)視為未給而改用預設，即不限層數而窮舉全部層級，預設null
 * @param {String} [opt.type='md5'] 輸入計算HASH方法字串，預設'md5'；雜湊演算法屬安全相關opt，為opt類參數「非預期改用預設」之例外：未給(undefined、null)取預設，給了須為crypto.getHashes()之成員(原始字串，包裝物件、數字、空字串皆無效)，無效時reject說明字串'invalid opt.type: must be one of crypto.getHashes()'(不帶輸入值)，不改用預設、先於列舉與讀檔(資料夾無檔案時亦檢查)
 * @param {Boolean} [opt.forFile=true] 輸入是否針對檔案計算HASH值，預設true
 * @param {Boolean} [opt.forFolder=false] 輸入是否針對資料夾計算HASH值(資料夾之HASH值同fsGetFolderBasicHash)，預設false
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.levelLimit為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve回傳檔案或資料夾陣列且含HASH值，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)；路徑不是資料夾時reject說明字串'invalid fd: must be an existing folder'；Node原生錯誤(列舉、讀檔失敗等)之訊息帶出路徑，改為固定詞彙加錯誤碼'operation failed (code ENOENT)'；opt.path、opt.fs、opt.crypto給undefined視為未給而取Node內建
 * @example
 * //need test in nodejs
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsTreeFolderWithHash'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fp
 *
 *     fp = `${fdt}/t0.txt`
 *     fsWriteText(fp, 't0')
 *
 *     fp = `${fdt}/abc/t1.txt`
 *     fsWriteText(fp, 'abc-t1')
 *
 *     fp = `${fdt}/def/xyz/t2.txt`
 *     fsWriteText(fp, 'def-xyz-t2')
 *
 *     let clns = (vfps) => {
 *         vfps = _.map(vfps, (v) => {
 *             delete v.path
 *             return v
 *         })
 *         return vfps
 *     }
 *
 *     let vfps1 = await fsTreeFolderWithHash(fdt, { levelLimit: 1 })
 *     vfps1 = clns(vfps1)
 *     console.log('fsTreeFolderWithHash(1,file,md5)', vfps1)
 *     ms.push({ 'fsTreeFolderWithHash(1,file,md5)': vfps1 })
 *
 *     let vfps2 = await fsTreeFolderWithHash(fdt)
 *     vfps2 = clns(vfps2)
 *     console.log('fsTreeFolderWithHash(unset,file,md5)', vfps2)
 *     ms.push({ 'fsTreeFolderWithHash(unset,file,md5)': vfps2 })
 *
 *     let vfps3 = await fsTreeFolderWithHash(fdt, { levelLimit: 1, type: 'sha256' })
 *     vfps3 = clns(vfps3)
 *     console.log('fsTreeFolderWithHash(1,file,sha256)', vfps3)
 *     ms.push({ 'fsTreeFolderWithHash(1,file,sha256)': vfps3 })
 *
 *     let vfps4 = await fsTreeFolderWithHash(fdt, { forFile: true, forFolder: true })
 *     vfps4 = clns(vfps4)
 *     console.log('fsTreeFolderWithHash(unset,file+folder,md5)', vfps4)
 *     ms.push({ 'fsTreeFolderWithHash(unset,file+folder,md5)': vfps4 })
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
 * // fsTreeFolderWithHash(1,file,md5) [
 * //   { isFolder: true, level: 1, name: 'abc', hash: '' },
 * //   { isFolder: true, level: 1, name: 'def', hash: '' },
 * //   {
 * //     isFolder: false,
 * //     level: 1,
 * //     name: 't0.txt',
 * //     hash: '809d4580aaed41565abc38d58f77f840'
 * //   }
 * // ]
 * // fsTreeFolderWithHash(unset,file,md5) [
 * //   { isFolder: true, level: 1, name: 'abc', hash: '' },
 * //   {
 * //     isFolder: false,
 * //     level: 2,
 * //     name: 't1.txt',
 * //     hash: '45d11ad27b97bc3bb664260189ec0dcc'
 * //   },
 * //   { isFolder: true, level: 1, name: 'def', hash: '' },
 * //   { isFolder: true, level: 2, name: 'xyz', hash: '' },
 * //   {
 * //     isFolder: false,
 * //     level: 3,
 * //     name: 't2.txt',
 * //     hash: 'ac8cf7366d7adf0743d6561133d404b3'
 * //   },
 * //   {
 * //     isFolder: false,
 * //     level: 1,
 * //     name: 't0.txt',
 * //     hash: '809d4580aaed41565abc38d58f77f840'
 * //   }
 * // ]
 * // fsTreeFolderWithHash(1,file,sha256) [
 * //   { isFolder: true, level: 1, name: 'abc', hash: '' },
 * //   { isFolder: true, level: 1, name: 'def', hash: '' },
 * //   {
 * //     isFolder: false,
 * //     level: 1,
 * //     name: 't0.txt',
 * //     hash: '512f26ada3c3d634ac3c6b12b7b33cb50bb0963c3f6d9924241619c84ec78ff2'
 * //   }
 * // ]
 * // fsTreeFolderWithHash(unset,file+folder,md5) [
 * //   {
 * //     isFolder: true,
 * //     level: 1,
 * //     name: 'abc',
 * //     hash: '45d11ad27b97bc3bb664260189ec0dcc'
 * //   },
 * //   {
 * //     isFolder: false,
 * //     level: 2,
 * //     name: 't1.txt',
 * //     hash: '45d11ad27b97bc3bb664260189ec0dcc'
 * //   },
 * //   {
 * //     isFolder: true,
 * //     level: 1,
 * //     name: 'def',
 * //     hash: 'ac8cf7366d7adf0743d6561133d404b3'
 * //   },
 * //   {
 * //     isFolder: true,
 * //     level: 2,
 * //     name: 'xyz',
 * //     hash: 'ac8cf7366d7adf0743d6561133d404b3'
 * //   },
 * //   {
 * //     isFolder: false,
 * //     level: 3,
 * //     name: 't2.txt',
 * //     hash: 'ac8cf7366d7adf0743d6561133d404b3'
 * //   },
 * //   {
 * //     isFolder: false,
 * //     level: 1,
 * //     name: 't0.txt',
 * //     hash: '809d4580aaed41565abc38d58f77f840'
 * //   }
 * // ]
 * // ms [
 * //   {
 * //     "fsTreeFolderWithHash(1,file,md5)": [
 * //       {
 * //         "isFolder": true,
 * //         "level": 1,
 * //         "name": "abc",
 * //         "hash": ""
 * //       },
 * //       {
 * //         "isFolder": true,
 * //         "level": 1,
 * //         "name": "def",
 * //         "hash": ""
 * //       },
 * //       {
 * //         "isFolder": false,
 * //         "level": 1,
 * //         "name": "t0.txt",
 * //         "hash": "809d4580aaed41565abc38d58f77f840"
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "fsTreeFolderWithHash(unset,file,md5)": [
 * //       {
 * //         "isFolder": true,
 * //         "level": 1,
 * //         "name": "abc",
 * //         "hash": ""
 * //       },
 * //       {
 * //         "isFolder": false,
 * //         "level": 2,
 * //         "name": "t1.txt",
 * //         "hash": "45d11ad27b97bc3bb664260189ec0dcc"
 * //       },
 * //       {
 * //         "isFolder": true,
 * //         "level": 1,
 * //         "name": "def",
 * //         "hash": ""
 * //       },
 * //       {
 * //         "isFolder": true,
 * //         "level": 2,
 * //         "name": "xyz",
 * //         "hash": ""
 * //       },
 * //       {
 * //         "isFolder": false,
 * //         "level": 3,
 * //         "name": "t2.txt",
 * //         "hash": "ac8cf7366d7adf0743d6561133d404b3"
 * //       },
 * //       {
 * //         "isFolder": false,
 * //         "level": 1,
 * //         "name": "t0.txt",
 * //         "hash": "809d4580aaed41565abc38d58f77f840"
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "fsTreeFolderWithHash(1,file,sha256)": [
 * //       {
 * //         "isFolder": true,
 * //         "level": 1,
 * //         "name": "abc",
 * //         "hash": ""
 * //       },
 * //       {
 * //         "isFolder": true,
 * //         "level": 1,
 * //         "name": "def",
 * //         "hash": ""
 * //       },
 * //       {
 * //         "isFolder": false,
 * //         "level": 1,
 * //         "name": "t0.txt",
 * //         "hash": "512f26ada3c3d634ac3c6b12b7b33cb50bb0963c3f6d9924241619c84ec78ff2"
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "fsTreeFolderWithHash(unset,file+folder,md5)": [
 * //       {
 * //         "isFolder": true,
 * //         "level": 1,
 * //         "name": "abc",
 * //         "hash": "45d11ad27b97bc3bb664260189ec0dcc"
 * //       },
 * //       {
 * //         "isFolder": false,
 * //         "level": 2,
 * //         "name": "t1.txt",
 * //         "hash": "45d11ad27b97bc3bb664260189ec0dcc"
 * //       },
 * //       {
 * //         "isFolder": true,
 * //         "level": 1,
 * //         "name": "def",
 * //         "hash": "ac8cf7366d7adf0743d6561133d404b3"
 * //       },
 * //       {
 * //         "isFolder": true,
 * //         "level": 2,
 * //         "name": "xyz",
 * //         "hash": "ac8cf7366d7adf0743d6561133d404b3"
 * //       },
 * //       {
 * //         "isFolder": false,
 * //         "level": 3,
 * //         "name": "t2.txt",
 * //         "hash": "ac8cf7366d7adf0743d6561133d404b3"
 * //       },
 * //       {
 * //         "isFolder": false,
 * //         "level": 1,
 * //         "name": "t0.txt",
 * //         "hash": "809d4580aaed41565abc38d58f77f840"
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 */
function fsTreeFolderWithHash(fd, opt = {}) {
    try {

        //check, 第2參數非物件(舊寫法之levelLimit數字等)或第3個引數有給即reject說明字串(R-LEVEL-LIMIT-02), fd無效者先報fd
        let msgOpt = chkFsLevelOpt(fd, opt, arguments[2])
        if (msgOpt) {
            return Promise.reject(msgOpt)
        }

        return fsTreeFolderWithHashCore(fd, mergeInject({ path, fs, crypto }, opt)) //opt.path、opt.fs、opt.crypto給undefined視為未給取Node內建(V5)
    }
    catch (err) {
        return Promise.reject(fsErrMsg(err)) //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 本函數非async, 於try外即成同步拋錯; 拋出者為Node原生錯誤時改固定詞彙加錯誤碼(W-23)
    }
}


export default fsTreeFolderWithHash
