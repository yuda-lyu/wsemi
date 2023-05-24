import Fuse from 'fuse.js'
import get from 'lodash/get'
import join from 'lodash/join'
import map from 'lodash/map'
import mean from 'lodash/mean'
import every from 'lodash/every'
import iser from './iser.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import isearr from './isearr.mjs'
import cstr from './cstr.mjs'
import binstr from './binstr.mjs'
import sep from './sep.mjs'
import getGlobal from './getGlobal.mjs'


function getFuse() {
    let g = getGlobal()
    let x = Fuse || g.Fuse
    return x
}


/**
 * 以空白分切strkey做為關鍵字，查詢字串陣列ar是否含有相似關鍵字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strFindFuzz.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|String} arr 輸入資料，若輸入陣列則自動join成字串
 * @param {String|Number} strkey 查找ar內是否含有關鍵字，多關鍵字係以空白區分
 * @param {Boolean} [bscore=false] 是否回傳分數，當設定為true時回傳值為百分比數值，設定為false時回傳值為布林值(預設)
 * @returns {Boolean|Number} 輸出資料，回傳值為分數或是否
 * @example
 *
 * console.log(strFindFuzz('Wodooman(樵夫)', 'Wodooman(樵夫)', true))
 * // => 100
 *
 * //第2參數會被空白切分成多關鍵字
 * console.log(strFindFuzz('Wodooman(樵夫)', 'The Woodman(樵夫) set to work at once, and so...', true))
 * // => 31.831649831649834
 *
 * console.log(strFindFuzz('The Woodman(樵夫) set to work at once, and so...', 'Wodooman(樵夫)', true))
 * // => 40.845872267054474
 *
 * console.log(strFindFuzz(['abc', 'def123', '中文測試'], 'ef', true))
 * // => 100
 *
 * console.log(strFindFuzz(['abc', 'def123', '中文測試'], 'efgg', true))
 * // => 46
 *
 * console.log(strFindFuzz(['abc', 'def123', '中文測試'], 'ef'))
 * // => true
 *
 */
function strFindFuzz(arr, strkey, bscore = false) {

    //自動將陣列轉字串
    let c = ''
    if (isestr(arr) || isnum(arr)) {
        c = cstr(arr)
    }
    else if (isearr(arr)) {
        c = join(arr, '')
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

    //Fus
    let Fus = getFuse()
    // console.log('fuse', fuse)

    //findKey
    let findKey = (src, tar) => {

        //options
        let options = {
            includeScore: true
        }

        //build
        let fuse = new Fus([src], options)
        // console.log('fuse', fuse)

        //search
        let r = fuse.search(tar)
        r = get(r, 0)
        // console.log('r', r)

        //score
        let score = get(r, 'score', 1) //完全一致為0
        score = 1 - score
        score *= 100

        return score
    }


    //全部關鍵字查詢所得分數
    let bs = map(keys, function(key) {
        // console.log(c, key)
        let score = findKey(c, key)
        // console.log('score=', score, `key='${key}'`, `c='${c}'`)
        return score
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


export default strFindFuzz
