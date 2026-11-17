import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import fsErrMsg from './_fsErrMsg.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'
import chkHashType from './_chkHashType.mjs'


/**
 * 後端nodejs計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileBasicHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} opt.fs 輸入fs物件，Core不自行匯入fs須由呼叫端注入，須提供statSync、lstatSync(讀取串流之createReadStream於用到時才檢查)；缺漏(未給、null、非物件、缺少必要方法)為相依無效，reject說明字串'invalid opt.fs: must be an object providing statSync, lstatSync'(不帶輸入值)
 * @param {Object} opt.crypto 輸入crypto物件，須提供createHash；缺漏同opt.fs，reject說明字串'invalid opt.crypto: must be an object providing createHash'
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法字串，預設'sha512'；雜湊演算法屬安全相關opt，為opt類參數「非預期改用預設」之例外：未給(undefined、null)取預設，給了須為crypto.getHashes()之成員(原始字串，包裝物件、數字、空字串皆無效)，無效時reject說明字串'invalid opt.type: must be one of crypto.getHashes()'(不帶輸入值)，不改用預設、先於讀檔(入口檢查)
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject回傳錯誤訊息字串，路徑參數須為非空字串且不含NUL字元，無效時reject說明字串(如'invalid <參數名>: must be a non-empty string'，不帶輸入值，與路徑不存在分開)；路徑不是檔案時reject說明字串'invalid fp: must be an existing file'；Node原生錯誤(讀檔失敗等)之訊息帶出路徑，改為固定詞彙加錯誤碼'operation failed (code ENOENT)'
 * @example
 * need test in nodejs.
 *
 * //see fsGetFileBasicHash
 *
 */
function fsGetFileBasicHashCore(fp, opt = {}) {

    //pm
    let pm = genPm()

    //stream無法被try catch, 此處是攔截stream以外錯誤; 讀取opt與前置檢查亦置於try內(opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 注入之fs之lstatSync可拋出任意值, 本函數非async, 於try外拋出即成同步拋錯)
    try {

        //fs, crypto
        let fs = get(opt, 'fs')
        let crypto = get(opt, 'crypto')

        //type, 未給(undefined、null)取預設, 給了須通過檢核(安全相關opt, 無效即拒絕不改用預設, 見下)
        let type = get(opt, 'type')

        //check, 路徑須為非空字串(無效與不存在分開判定, 不走到fs, 不回顯輸入值; R-FS-INVALID-PATH-01)
        let msgFp = chkFsPath(fp, 'fp')
        if (msgFp) {
            pm.reject(msgFp)
            return pm
        }

        //check, 注入之fs、crypto缺漏為相依無效(R-FS-DEPS-01), 先於任何判斷, 以說明字串reject(不帶輸入值)
        let msgDeps = chkFsDeps({ fs, crypto }, { fs: ['statSync', 'lstatSync'], crypto: ['createHash'] })
        if (msgDeps) {
            pm.reject(msgDeps)
            return pm
        }

        //check, 雜湊演算法(安全相關opt, W-08): 給了而無效即拒絕, 先於讀檔; 允許集合為注入之crypto.getHashes()
        let msgType = chkHashType(type, { crypto })
        if (msgType) {
            pm.reject(msgType)
            return pm
        }
        if (type === undefined || type === null) {
            type = 'sha512'
        }

        //check
        if (!fsIsFileCore(fp, { fs })) {
            pm.reject('invalid fp: must be an existing file')
            return pm
        }

        //createHash
        let hash = crypto.createHash(type)

        //createReadStream
        let input = fs.createReadStream(fp)

        //readable, 監聽器內之read、update、digest(注入之fs、crypto)可拋出任意值, 未保護即成未捕捉例外且pm不settle(或於後續readable以出錯後之雜湊resolve), 故包try並銷毀串流
        input.on('readable', () => {
            try {
                let data = input.read()
                if (data) {
                    hash.update(data)
                }
                else {
                    pm.resolve(hash.digest('hex'))
                }
            }
            catch (err) {
                pm.reject(fsErrMsg(err))
                try {
                    input.destroy()
                }
                catch (e) {}
            }
        })

        //error
        input.on('error', (err) => {
            pm.reject(fsErrMsg(err)) //注入之fs所產stream可以非Error之值結束, 不可直接err.toString()(監聽器內再拋即成未捕捉例外且pm永不settle); 原生錯誤改固定詞彙加錯誤碼(不帶路徑)
        })

    }
    catch (err) {
        pm.reject(fsErrMsg(err)) //注入之crypto、fs可拋出任意值
    }

    return pm
}


export default fsGetFileBasicHashCore
