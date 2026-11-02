import isobj from './isobj.mjs'
import isarr from './isarr.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import cstr from './cstr.mjs'
import replace from './replace.mjs'


/**
 * 取代字串，由c內出現之key會被物件o的key所對應value進行取代（key與value皆為普通文字，不作正規表示式，value內之$&等亦不特殊解讀），依o之自有可列舉字串鍵順序逐一取代
 *
 * c與o皆為必須參數：c非字串throw Error('invalid c: must be a string')，o非一般物件(含陣列、null)throw Error('invalid o: must be a plain object')，訊息不帶輸入值，先檢c再檢o；c為''回傳''，但o仍須為一般物件
 * o為空物件則回傳c，空字串之key略過
 * value之轉換：字串原樣；數字、BigInt、Symbol依cstr轉字串；布林轉為'true'或'false'；物件與陣列轉為JSON字串；null、undefined及其他型別(函式、Date、Map、NaN等)轉為空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/replaceObj.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被取代的字串，必須參數，非字串throw Error，''回傳''
 * @param {Object} o 輸入用來取代的key,value物件，必須參數，非一般物件throw Error，空物件回傳c
 * @returns {String} 回傳取代後字串
 * @example
 *
 * console.log(replaceObj('1.25abc中文', { '5a': '0', '中': '英' }))
 * // => '1.20bc英文'
 *
 * console.log(replaceObj('a-b', { a: 1 }))
 * // => '1-b'
 *
 * console.log(replaceObj('a-b', { a: true }))
 * // => 'true-b'
 *
 * console.log(replaceObj('a-b', { a: { k: 1 } }))
 * // => '{"k":1}-b'
 *
 * console.log(replaceObj('a-b', { a: null }))
 * // => '-b'
 *
 * console.log(replaceObj('abc', {}))
 * // => 'abc'
 *
 * console.log(replaceObj('a-b', { a: '$&$&' }))
 * // => '$&$&-b'
 *
 * try {
 *     replaceObj('a-b', null)
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid o: must be a plain object
 *
 */
function replaceObj(c, o) {

    //check, c與o為必須參數, 非預期throw(訊息不帶值)
    if (!isstr(c)) {
        throw new Error('invalid c: must be a string')
    }
    if (!isobj(o)) {
        throw new Error('invalid o: must be a plain object')
    }
    if (c === '') {
        return ''
    }

    //自動轉換, 物件以自有可列舉字串鍵迭代, length與其他鍵同為一般鍵(R-OBJ-ITER-01: lodash each對具非負整數length之物件改走索引, length極大時為CPU無限迴圈)
    //每個值只讀取一次, 轉換後之值即取代時使用之值; 空字串之key略過
    //取代值為普通文字: replaceAll之取代字串會解讀$&、$'、$`、$$, 故先將$逸出為$$
    let kvs = []
    for (let k of Object.keys(o)) {
        if (k === '') {
            continue
        }
        let v = o[k]
        if (isobj(v) || isarr(v)) {
            v = JSON.stringify(v)
        }
        else if (isbol(v)) {
            v = String(v) //cstr不收布林(回'')
        }
        else {
            v = cstr(v)
        }
        if (!isstr(v)) { //toJSON回undefined等
            v = ''
        }
        kvs.push([k, v.replaceAll('$', '$$$$')])
    }

    //replace
    for (let [k, v] of kvs) {
        c = replace(c, k, v)
    }

    return c
}


export default replaceObj
