import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import genPm from './genPm.mjs'
import isbol from './isbol.mjs'
import iseobj from './iseobj.mjs'
import optVal from './_optVal.mjs'
import domShowInputAndGetFiles from './domShowInputAndGetFiles.mjs'
import blobs2u8arrs from './blobs2u8arrs.mjs'


//sizeMbLimit: opt類參數, 有效數字(isenum, 不限範圍; 0與負數由domGetFiles改用預設), 非預期(含Infinity、'0x10'、包裝物件、非數字等)視為未給、改用預設1000, 不報錯(給Infinity不代表不限大小)
let RULE_SIZE_MB_LIMIT = { fn: 'domShowInputAndGetFilesU8Arrs', name: 'opt.sizeMbLimit', kind: 'enum' }


/**
 * 前端開啟上傳視窗並讀取各檔案Uint8Array資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domShowInputAndGetFilesU8Arrs.test.mjs Github}
 * @memberOf wsemi
  * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String|Array} [opt.kind='*'] 輸入檔案類型或種類字串或陣列，預設為全部'*'
 * @param {Boolean} [opt.multiple=false] 輸入是否可選多檔案，預設為false
 * @param {Boolean} [opt.entireHierarchy=false] 輸入是否遍歷資料夾內之資料夾與檔案，使用Chrome實驗性語法webkitdirectory，預設為false
 * @param {Number} [opt.sizeMbLimit=1000] 輸入檔案大小上線，單位mb，須為有效數字(可為數字字串)，0或負數視為未給，非預期之輸入(Infinity、'0x10'、包裝物件、非數字等)視為未給而改用預設，不報錯(給Infinity不代表不限大小，要放寬請給足夠大之有限數)，預設為1000mb(約1g)
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.sizeMbLimit為非預期之輸入而改用預設時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve回傳各檔案的Uint8Array資料陣列，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * domShowInputAndGetFilesU8Arrs()
 *     .then((res)=>{})
 *
 */
function domShowInputAndGetFilesU8Arrs(opt = {}) {

    //kind
    let kind = get(opt, 'kind', '*')

    //multiple
    let multiple = get(opt, 'multiple')
    if (!isbol(multiple)) {
        multiple = false
    }

    //entireHierarchy
    let entireHierarchy = get(opt, 'entireHierarchy')
    if (!isbol(entireHierarchy)) {
        entireHierarchy = false
    }

    //sizeMbLimit = 1000, 有效則取Number(v), 非預期(含Infinity、'0x10'、包裝物件)改用預設1000
    let sizeMbLimit = optVal(get(opt, 'sizeMbLimit', null), 1000, RULE_SIZE_MB_LIMIT, opt)

    //pm
    let pm = genPm()

    let resfiles = []
    domShowInputAndGetFiles({ kind, multiple, entireHierarchy, sizeMbLimit })
        .then(function(res) {

            //pmt
            let pmt = genPm()

            //errs
            let errs = get(res, 'errs', {})
            // console.log('errs', errs)

            //files
            let files = get(res, 'files', [])
            // console.log('files', files)

            //check
            if (iseobj(errs)) {
                pmt.reject(errs)
            }
            // else if (size(files) === 0) { //取消上傳為無檔案, 不視為錯誤
            //     pmt.reject('no file')
            // }
            else {
                pmt.resolve(files)
            }

            return pmt
        })
        .then(function(files) {

            //saveas
            each(files, function(file) {
                resfiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type
                })
            })

            return blobs2u8arrs(files)
        })
        .then(function(u8as) {

            //save Uint8Array
            each(u8as, function(u8a, k) {
                resfiles[k]['u8a'] = u8a
            })

            pm.resolve(resfiles)
        })
        .catch(function(msg) {
            pm.reject(msg)
        })

    return pm
}


export default domShowInputAndGetFilesU8Arrs
