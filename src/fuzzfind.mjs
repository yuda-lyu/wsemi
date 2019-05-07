import join from 'lodash/join'
import map from 'lodash/map'
import mean from 'lodash/mean'
import every from 'lodash/every'
import fuzzball from 'fuzzball'
import iser from './iser.mjs'
import isarr from './isarr.mjs'
import binstr from './binstr.mjs'
import sep from './sep.mjs'


/**
 * 以空白分切strkey做為關鍵字，查詢字串陣列ar是否含有相似關鍵字
 *
 * @export
 * @param {Array|String} ar 輸入資料
 * @param {String} strkey 查找ar內是否含有關鍵字
 * @param {Boolean} [bscore=false] 是否回傳分數，true:回傳值為分數，false:回傳值為是否(預設)
 * @returns {Boolean|Number} 輸出資料，回傳值為分數或是否
 */
export default function fuzzfind(ar, strkey, bscore = false) {

    //check
    if (iser(strkey)) {
        if (bscore) {
            return 100
        }
        else {
            return true
        }
    }

    //自動將陣列轉字串
    if (isarr(ar)) {
        ar = join(ar, '')
    }

    //若有存在完整符合
    if (binstr(ar, strkey)) {
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
        return fuzzball.partial_ratio(ar, key)
    })

    //bscore
    if (bscore) {
        //回傳分數

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
