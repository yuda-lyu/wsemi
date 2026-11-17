import map from 'lodash-es/map.js'
import isarr from './isarr.mjs'
import isfile from './isfile.mjs'
import genPm from './genPm.mjs'
import blobs2b64s from './blobs2b64s.mjs'
import ltdtmerge from './ltdtmerge.mjs'


/**
 * 前端input檔案物件陣列轉資料物件陣列，各檔案將轉為Base64字串
 *
 * 失敗一律以固定字串reject(不同步throw、不含輸入值、不外洩原生錯誤)：files非陣列為'invalid files: must be an array of File'，陣列內有非File元素(含Blob、null、undefined、空洞)為'invalid files[i]: must be a File'(i為第一個無效元素之索引)，讀取或轉換失敗為'can not convert files to base64'；空陣列為合法輸入，resolve空陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/files2data.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} files 輸入File陣列，元素須為File(Blob無name，不收)
 * @returns {Promise} 回傳Promise，resolve回傳File的資料物件陣列，各檔案將轉為Base64字串，各項含name、size、type、b64；reject回傳固定字串，見上述
 * @example
 * need test in browser
 *
 */
function files2data(files) {
    //若輸入Blob陣列, 不會有name, 故只能輸入File陣列

    //check, 非陣列時lodash之map會得[], 最終靜默resolve [], 使無效輸入被當成功; 訊息須指明本函數之參數名而非下游之bbs
    if (!isarr(files)) {
        return Promise.reject('invalid files: must be an array of File')
    }

    //check, 元素須為File, 先於讀取(原file.name對null同步拋原生TypeError, 對Blob靜默得undefined); 每個元素只讀一次, 檢測之值即使用之值
    let list = []
    for (let i = 0; i < files.length; i++) {
        let file = files[i]
        if (!isfile(file)) {
            return Promise.reject(`invalid files[${i}]: must be a File`)
        }
        list.push(file)
    }

    //pm
    let pm = genPm()

    //fs
    let fs = map(list, function(file) {
        return {
            name: file.name,
            size: file.size,
            type: file.type
        }
    })

    //blobs2b64s
    blobs2b64s(list)
        .then(function(b64s) {

            //bs
            let bs = map(b64s, function(v) {
                return { b64: v }
            })

            //ltdtmerge
            let rs = ltdtmerge(fs, bs)

            //resolve
            pm.resolve(rs)

        })
        .catch(function() {
            //原碼無此catch, blobs2b64s一旦reject則pm永不settle, 呼叫端await會永久掛住, 且該rejection無人接; 原生錯誤不外洩, 改固定字串
            pm.reject('can not convert files to base64')
        })

    return pm
}


export default files2data
