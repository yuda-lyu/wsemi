import join from 'lodash/join'
import map from 'lodash/map'
import mean from 'lodash/mean'
import every from 'lodash/every'
import fuzzball from 'fuzzball'
import iser from './iser.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import isearr from './isearr.mjs'
import cstr from './cstr.mjs'
import binstr from './binstr.mjs'
import sep from './sep.mjs'


/**
 * 以空白分切strkey做為關鍵字，查詢字串陣列ar是否含有相似關鍵字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fuzzfind.test.js Github}
 * @memberOf wsemi
 * @param {Array|String} ar 輸入資料
 * @param {String} strkey 查找ar內是否含有關鍵字，多關鍵字以空白區分
 * @param {Boolean} [bscore=false] 是否回傳分數，true:回傳值為分數，false:回傳值為是否(預設)
 * @returns {Boolean|Number} 輸出資料，回傳值為分數或是否
 * @example
 *
 */
function fuzzfind(ar, strkey, bscore = false) {

    //自動將陣列轉字串
    let c = ''
    if (isestr(ar) || isnum(ar)) {
        c = cstr(ar)
    }
    else if (isearr(ar)) {
        c = join(ar, '')
    }
    else {
        if (bscore) {
            return 0
        }
        else {
            return false
        }
    }

    //check
    if (strkey === '') {
        if (bscore) {
            return 100
        }
        else {
            return true
        }
    }
    else if (iser(strkey)) {
        if (bscore) {
            return 0
        }
        else {
            return false
        }
    }

    //若有存在完整符合
    if (binstr(c, strkey)) {
        if (bscore) {
            return 100
        }
        else {
            return true
        }
    }

    //keys
    let keys = sep(strkey, ' ')

    //全部關鍵字查詢所得分數
    let bs = map(keys, function(key) {
        return fuzzball.partial_ratio(c, key)
    })

    //bscore
    if (bscore) {
        //回傳平均分數, 為查找多關鍵字之整體符合分數

        return mean(bs)
    }
    else {
        //回傳是否

        //預設門檻
        let n = 80

        //是否全部大於預設門檻
        return every(bs, function(s) {
            return s >= n
        })
    }
}


export default fuzzfind
