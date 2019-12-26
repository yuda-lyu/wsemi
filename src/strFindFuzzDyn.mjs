import genPm from './genPm.mjs'
import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import strFindFuzz from './strFindFuzz.mjs'


/**
 * 前端以空白分切strkey做為關鍵字，查詢字串陣列ar是否含有相似關鍵字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strFindFuzzDyn.test.js Github}
 * @memberOf wsemi
 * @param {Array|String} ar 輸入資料，若輸入陣列則自動join成字串
 * @param {String|Number} strkey 查找ar內是否含有關鍵字，多關鍵字係以空白區分
 * @param {Boolean} [bscore=false] 是否回傳分數，當設定為true時回傳值為分數，設定為false時回傳值為是否(預設)
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳為分數或是否，reject回傳錯誤訊息
 * @example
 * strFindFuzzDyn('Wodooman(樵夫)', 'The Woodman(樵夫) set to work at once, and so...', true)
 *     .then(function(r) {
 *         console.log(r)
 *         // => 41.333333333333336, 第2參數會被空白切分成多關鍵字
 *     })
 *
 * strFindFuzzDyn('The Woodman(樵夫) set to work at once, and so...', 'Wodooman(樵夫)', true)
 *     .then(function(r) {
 *         console.log(r)
 *         // => 82
 *     })
 *
 * strFindFuzzDyn(['abc', 'def123', '中文測試'], 'ef', true)
 *     .then(function(r) {
 *         console.log(r)
 *         // => 100
 *     })
 *
 * strFindFuzzDyn(['abc', 'def123', '中文測試'], 'efgg', true)
 *     .then(function(r) {
 *         console.log(r)
 *         // => 50
 *     })
 *
 * strFindFuzzDyn(['abc', 'def123', '中文測試'], 'ef')
 *     .then(function(r) {
 *         console.log(r)
 *         // => true
 *     })
 */
function strFindFuzzDyn(ar, strkey, bscore = false, pathItems) {

    //pm
    let pm = genPm()

    //pathItems
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/npm/fuzzball@1.3.0/dist/fuzzball.umd.min.js',
        ]
    }

    //importResources
    importResources(pathItems)
        .then((res) => {
            //console.log('strFindFuzzDyn res', res)

            //strFindFuzz
            let r = strFindFuzz(ar, strkey, bscore)

            //resolve
            pm.resolve(r)

        })

    return pm
}


export default strFindFuzzDyn
