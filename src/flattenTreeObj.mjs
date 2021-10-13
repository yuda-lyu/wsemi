import get from 'lodash/get'
import size from 'lodash/size'
import treeObj from './treeObj.mjs'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isobj0 from './isobj0.mjs'


/**
 * 展平樹狀物件陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/flattenTreeObj.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Object} data 輸入樹狀物件或陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [bindKey='id'] 輸入節點物件識別用欄位字串，預設'id'
 * @param {String} [bindChildren='children'] 輸入節點物件內存放子節點欄位字串，預設'children'
 * @returns {Array} 回傳節點物件陣列
 * @example
 *
 * let data1 = { //obj
 *     id: 1,
 *     data: '1-abc',
 *     children: [
 *         {
 *             id: 2,
 *             data: '2-def',
 *         },
 *         {
 *             id: 3,
 *             data: '3-ghi',
 *             children: [
 *                 {
 *                     id: 4,
 *                     data: '4-jkl',
 *                 },
 *             ],
 *         },
 *         {
 *             id: 5,
 *             data: '5-mno',
 *         },
 *     ],
 * }
 * let r1 = flattenTreeObj(data1)
 * console.log(JSON.stringify(r1))
 * // => {"id":1,"data":"1-abc","children":[{"id":2,"data":"2-def"},{"id":3,"data":"3-ghi","children":[{"id":4,"data":"4-jkl"}]},{"id":5,"data":"5-mno"}],"level":0,"nk":[0]}
 *
 * let data2 = [ //arr
 *     {
 *         id: 1,
 *         text: '1x',
 *     },
 *     {
 *         id: 2,
 *         text: '2y',
 *         children: [
 *             {
 *                 id: 3,
 *                 text: '3z',
 *             },
 *         ],
 *     },
 *     {
 *         id: 4,
 *         text: 'empty',
 *     },
 * ]
 * let r2 = flattenTreeObj(data2)
 * console.log(JSON.stringify(r2))
 * // => [{"id":1,"text":"1x","level":0,"nk":[0]},{"id":2,"text":"2y","children":[{"id":3,"text":"3z"}],"level":0,"nk":[1]},{"id":3,"text":"3z","level":1,"nk":[1,"children",0]},{"id":4,"text":"empty","level":0,"nk":[2]}]
 *
 */
function flattenTreeObj(data, opt = {}) {

    //check
    if (isarr(data)) {
        if (data.length === 0) {
            return []
        }
    }
    else if (isobj(data)) {
        if (isobj0(data)) {
            return []
        }
    }
    else {
        return []
    }

    //bindKey
    let bindKey = get(opt, 'bindKey', null)
    if (!isestr(bindKey)) {
        bindKey = 'id'
    }

    //bindChildren
    let bindChildren = get(opt, 'bindChildren', null)
    if (!isestr(bindChildren)) {
        bindChildren = 'children'
    }

    //data
    let toArr = false
    if (isobj(data)) {
        toArr = true
        data = [data]
    }

    function getNk(nk) {
        //將nk內插入bindChildren, 因主節點為array, 各節點內的子節點也為array
        let r = [nk[0]]
        for (let i = 1; i < nk.length; i++) {
            let k = nk[i]
            r.push(bindChildren)
            r.push(k)
        }
        return r
    }

    //nodes
    let nodes = []
    treeObj(data, (value, key, nk) => {
        //console.log({ value, key, nk })

        //pk
        let pk = get(value, bindKey, null)

        //children
        let children = get(value, bindChildren, null)

        //push
        if (pk) {
            let nkt = getNk([...nk, key])
            nodes.push({
                ...value,
                level: (size(nkt) - 1) / 2,
                nk: nkt,
                // key,
            })
            if (children) {
                return children
            }
        }

    })

    //toArr
    if (toArr) {
        nodes = nodes[0]
    }

    return nodes
}


export default flattenTreeObj
