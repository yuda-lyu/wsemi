import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import isestr from './isestr.mjs'
import errToStr from './_errToStr.mjs'


/**
 * 後端nodejs計算檔案HASH值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsGetFileBasicHashCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.type='sha512'] 輸入計算HASH方法字串，預設'sha512'
 * @returns {Promise} 回傳Promise，resolve回傳檔案HASH值，reject回傳錯誤訊息字串
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

        //type
        let type = get(opt, 'type', '')
        if (!isestr(type)) {
            type = 'sha512'
        }

        //check
        if (!fsIsFileCore(fp, { fs })) {
            pm.reject(`fp[${fp}] is not a file`)
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
                pm.reject(errToStr(err))
                try {
                    input.destroy()
                }
                catch (e) {}
            }
        })

        //error
        input.on('error', (err) => {
            pm.reject(errToStr(err)) //注入之fs所產stream可以非Error之值結束, 不可直接err.toString()(監聽器內再拋即成未捕捉例外且pm永不settle)
        })

    }
    catch (err) {
        pm.reject(errToStr(err)) //注入之crypto、fs可拋出任意值
    }

    return pm
}


export default fsGetFileBasicHashCore
