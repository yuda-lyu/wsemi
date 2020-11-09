import get from 'lodash/get'
import each from 'lodash/each'
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'
import omit from 'lodash/omit'
import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import iser from './iser.mjs'


/**
 * 組合項目物件陣列成為樹狀物件
 *
 * @param {Array} items 輸入項目物件陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [bindKey='id'] 輸入項目物件識別用欄位字串，預設'id'
 * @param {String} [bindParent='parentId'] 輸入項目物件內存放父節點欄位字串，預設'parentId'
 * @param {String} [bindChildren='children'] 輸入產生樹狀物件時，各節點內存放子節點欄位字串，預設'children'
 * @returns {Array} 回傳物件陣列
 * @example
 *
 * let data = [
 *     {
 *         id: 1,
 *         text: '1-a',
 *     },
 *     {
 *         id: 2,
 *         text: '2-b',
 *     },
 *     {
 *         id: 3,
 *         text: '3-c',
 *         parentId: 2,
 *     },
 *     {
 *         id: 4,
 *         text: '4-d',
 *         parentId: 2,
 *     },
 *     {
 *         id: 5,
 *         text: '5-e',
 *         parentId: 3,
 *     },
 *     {
 *         id: 6,
 *         text: 'empty',
 *     },
 * ]
 * let r = composeTreeObj(data)
 * let cr = JSON.stringify(r)
 * console.log(cr)
 * // => [{"id":1,"text":"1-a"},{"id":2,"text":"2-b","children":[{"id":3,"text":"3-c","parentId":2,"children":[{"id":5,"text":"5-e","parentId":3}]},{"id":4,"text":"4-d","parentId":2}]},{"id":6,"text":"empty"}]
 *
 */
function composeTreeObj(items, opt = {}) {
    let privateLevel = '__level__'

    //check
    if (!isearr(items)) {
        return []
    }

    //bindKey
    let bindKey = get(opt, 'bindKey', null)
    if (!isestr(bindKey)) {
        bindKey = 'id'
    }

    //bindParent
    let bindParent = get(opt, 'bindParent', null)
    if (!isestr(bindParent)) {
        bindParent = 'parentId'
    }

    //bindChildren
    let bindChildren = get(opt, 'bindChildren', null)
    if (!isestr(bindChildren)) {
        bindChildren = 'children'
    }

    function addNodeLevel(items) {
        let r = []

        //cloneDeep
        items = cloneDeep(items)

        function addNodeForTop() {
            let _items = []

            each(items, (v, k) => {
                if (iser(v[bindParent])) {
                    //若不存在bindParent就代表頂層, 加入至r
                    r.push({
                        [privateLevel]: 0,
                        ...v,
                    })
                }
                else {
                    //非頂層項目物件, 加入至_items
                    _items.push(v)
                }
            })

            //re-save
            items = _items

        }

        function addNodeInParent(p) {
            let _items = []

            each(items, (v, k) => {
                if (v[bindParent] === p[bindKey]) {
                    //若非頂層項目物件v的bindParent, 等於所傳入的父層物件p的bindKey, 就代表找到從屬, 加入至r
                    r.push({
                        [privateLevel]: p[privateLevel] + 1,
                        ...v,
                    })
                }
                else {
                    //非頂層項目物件v非隸屬於父層物件p, 加入至_items
                    _items.push(v)
                }
            })

            //re-save
            items = _items

        }

        //addNodeForTop
        addNodeForTop()

        //check
        if (r.length === 0) {
            return r
        }

        //建立非頂層節點關聯
        let i = -1
        while (true) {
            i += 1

            //p
            let p = r[i]

            //addNodeInParent
            addNodeInParent(p)

            //check, 若已無非頂層物件則跳出
            if (items.length === 0) {
                break
            }

        }

        return r
    }

    function buildTree(items) {
        let r = []

        function findParent(v) {
            for (let i = 0; i < items.length; i++) {
                let p = items[i]
                if (v[bindParent] === p[bindKey]) {
                    return p
                }
            }
            return null
        }

        function omitLevel(v) {
            return omit(v, privateLevel)
        }

        //填入子節點至keyChildren欄位
        let kp = {}
        each(items, (v, k) => { //r為依照層級高低循序建立
            if (v[privateLevel] === 0) {
                r.push(omitLevel(v))
                kp[v[bindKey]] = [k] //頂層節點之指標k為keys內容
                // console.log(k, 'r', cloneDeep(r))
            }
            else {
                // console.log(k, 'v', cloneDeep(v))
                let p = findParent(v)
                // console.log(k, 'p', cloneDeep(p))
                let keys = kp[p[bindKey]]
                keys = [...keys, bindChildren]
                // console.log(k, 'keys', cloneDeep(keys))
                let cs = get(r, keys, [])
                // console.log(k, 'cs1', cloneDeep(cs))
                cs.push(omitLevel(v))
                kp[v[bindKey]] = [...keys, cs.length - 1]
                // console.log(k, 'cs2', cloneDeep(cs))
                set(r, keys, cs)
                // console.log(k, 'r', cloneDeep(r))
            }
        })

        return r
    }

    //cloneDeep
    items = cloneDeep(items)

    //addNodeLevel
    items = addNodeLevel(items)

    //buildTree
    let r = buildTree(items)

    return r
}


export default composeTreeObj