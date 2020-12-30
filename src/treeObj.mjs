import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import size from 'lodash/size'
import set from 'lodash/set'
import get from 'lodash/get'
import slice from 'lodash/slice'
import range from 'lodash/range'
import cloneDeep from 'lodash/cloneDeep'
import isarr from './isarr.mjs'
import isarr0 from './isarr0.mjs'
import isobj from './isobj.mjs'
import isobj0 from './isobj0.mjs'
import isab from './isab.mjs'
import isu8arr from './isu8arr.mjs'
import isu16arr from './isu16arr.mjs'
import isbol from './isbol.mjs'


function traverseObj(data, f) {
    let nowKey = []

    //check
    if (!isarr(data) && !isobj(data)) {
        data = f(data, null, [])
        return data
    }

    function getKeys(obj) {
        if (isarr(obj)) {
            //return keys(obj)
            return range(size(obj))
        }
        if (isobj(obj)) {
            let v1 = Object.getOwnPropertyNames(obj)
            // console.log('v1', v1)
            let v2 = Object.getOwnPropertySymbols(obj)
            // console.log('v2', v2)
            if (!isarr(v1)) {
                v1 = []
            }
            if (!isarr(v2)) {
                v2 = []
            }
            return [...v1, ...v2]
        }
        return obj
    }

    function traverse(vs, _k) {
        //console.log('vs', vs)
        if (isarr(vs)) {
            let ks = getKeys(vs)
            return ks.map((k) => {
                let v = vs[k]
                //console.log('map', v, k)
                let t = cloneDeep(nowKey)
                nowKey.push(k)
                v = f(v, k, t)
                v = traverse(v, k)
                nowKey.pop()
                return v
            })
        }
        else if (isobj(vs)) {
            let ks = getKeys(vs)
            let o = {}
            ks.map((k) => {
                let v = vs[k]
                //console.log('map', v, k)
                let t = cloneDeep(nowKey)
                nowKey.push(k)
                v = f(v, k, t)
                v = traverse(v, k)
                nowKey.pop()
                o[k] = v
            })
            return o
        }
        else {
            return vs //f(vs, _k, cloneDeep(slice(nowKey, 1)))
        }
    }

    return traverse(data, f)
}


function runObj(data, hookFun) {
    let p = {}
    let nowKey = ['pnode']

    //列舉pArray內元素
    function pArray({ value }) {
        let n = size(value)
        for (let k = 0; k < n; k++) {
            pSelf({
                key: k,
                value: value[k],
            })
        }
    }

    //列舉pObject內元素
    function pObject({ value }) {
        let kks = Object.keys(value)
        let n = kks.length
        for (let i = 0; i < n; i++) {
            let k = kks[i]
            pSelf({
                key: k,
                value: value[k],
            })
        }
    }

    //取得值的型別
    function getType(value) {
        if (isarr(value)) {
            return 'array'
        }
        else if (isobj(value)) {
            return 'object'
        }
        else if (isNumber(value) || isString(value) || isBoolean(value)) {
            return 'common'
        }
        else if (isab(value) || isu8arr(value) || isu16arr(value)) {
            return 'binary'
        }
        else {
            return 'special'
        }
    }

    //遞迴處理自己元素
    function pSelf({ key, value }) {

        //hookFun
        let nk = slice(nowKey, 1)
        value = hookFun(value, key, nk)

        //getType
        let t = getType(value)

        //deal
        if (t === 'array') {
            nowKey.push(key)
            pArray({ value })
            nowKey.pop()
        }
        else if (t === 'object') {
            nowKey.push(key)
            pObject({ value })
            nowKey.pop()
        }
        else if (t === 'common') {
            set(p, [...nowKey, key], value)
        }
        else if (t === 'binary') {
            set(p, [...nowKey, key], value)
        }
        else {
            //special
            set(p, [...nowKey, key], value)
        }

    }

    //top node
    if (isarr(data)) {
        if (isarr0(data)) {
            return data
        }
        pArray({
            value: data,
        })
    }
    else if (isobj(data)) {
        if (isobj0(data)) {
            return data
        }
        pObject({
            value: data,
        })
    }
    else {
        let value = data
        set(p, nowKey, value)
    }

    return p.pnode
}


/**
 * 遍歷物件並回傳複製物件，類似JSON.stringify，但不會序列化成為字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/treeObj.test.js Github}
 * @memberOf wsemi
 * @param {*} data 輸入任意資料
 * @param {Function} [hookFun=null] 輸入攔截處理函數，預設null
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.force=false] 輸入是否可遍歷Symbol鍵值功能布林值，給true時可處理key為Symbol之情形，預設false
 * @returns {*} 回傳複製後的任意資料
 * @example
 *
 * let data = {
 *     a: 123,
 *     b: 145.67,
 *     c: 'test中文1',
 *     d: true,
 *     e: function() {},
 *     f: [11, 'xyz', false, new Uint8Array([166, 197, 215])],
 *     g: {
 *         ga: 223,
 *         gb: 245.67,
 *         gc: 'test中文2',
 *         gd: new Uint8Array([66, 97, 115]),
 *     },
 * }
 * let r = treeObj(data, (value, key, nk) => {
 *     console.log('=>', value, key, nk)
 *     return value
 * })
 * console.log('r =>', r)
 * // => 123 a []
 * // => 145.67 b []
 * // => test中文1 c []
 * // => true d []
 * // => [Function: e] e []
 * // => [ 11, 'xyz', false, Uint8Array(3) [ 166, 197, 215 ] ] f []
 * // => 11 0 [ 'f' ]
 * // => xyz 1 [ 'f' ]
 * // => false 2 [ 'f' ]
 * // => Uint8Array(3) [ 166, 197, 215 ] 3 [ 'f' ]
 * // => {
 * //   ga: 223,
 * //   gb: 245.67,
 * //   gc: 'test中文2',
 * //   gd: Uint8Array(3) [ 66, 97, 115 ]
 * // } g []
 * // => 223 ga [ 'g' ]
 * // => 245.67 gb [ 'g' ]
 * // => test中文2 gc [ 'g' ]
 * // => Uint8Array(3) [ 66, 97, 115 ] gd [ 'g' ]
 * // r => {
 * //   a: 123,
 * //   b: 145.67,
 * //   c: 'test中文1',
 * //   d: true,
 * //   e: [Function: e],
 * //   f: [ 11, 'xyz', false, Uint8Array(3) [ 166, 197, 215 ] ],
 * //   g: {
 * //     ga: 223,
 * //     gb: 245.67,
 * //     gc: 'test中文2',
 * //     gd: Uint8Array(3) [ 66, 97, 115 ]
 * //   }
 * // }
 *
 */
function treeObj(data, hookFun = null, opt = {}) {

    //hookFun
    if (!isFunction(hookFun)) {
        hookFun = (value) => {
            return value
        }
    }

    //force
    let force = get(opt, 'force', false)
    if (!isbol(force)) {
        force = false
    }

    //call
    if (force) {
        return traverseObj(data, hookFun)
    }
    else {
        return runObj(data, hookFun)
    }

}


export default treeObj
