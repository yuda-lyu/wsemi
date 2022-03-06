import get from 'lodash/get'
import each from 'lodash/each'
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'
import omit from 'lodash/omit'
import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import isbol from './isbol.mjs'
import iser from './iser.mjs'


/**
 * 組合關聯陣列成為樹狀陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/composeToTree.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} items 輸入關聯陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [bindKey='id'] 輸入項目物件識別用欄位字串，預設'id'
 * @param {String} [bindParent='parentId'] 輸入項目物件內存放父節點欄位字串，預設'parentId'
 * @param {String} [bindChildren='children'] 輸入產生樹狀物件時，各節點內存放子節點欄位字串，預設'children'
 * @param {Boolean} [saveExtProps=false] 輸入是否儲存項目物件從屬資訊布林值，預設false
 * @returns {Array} 回傳樹狀陣列
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
 * let r = composeToTree(data)
 * let cr = JSON.stringify(r)
 * console.log(cr)
 * // => [
 * //   {
 * //     "id": 1,
 * //     "text": "1-a"
 * //   },
 * //   {
 * //     "id": 2,
 * //     "text": "2-b",
 * //     "children": [
 * //       {
 * //         "id": 3,
 * //         "text": "3-c",
 * //         "parentId": 2,
 * //         "children": [
 * //           {
 * //             "id": 5,
 * //             "text": "5-e",
 * //             "parentId": 3
 * //           }
 * //         ]
 * //       },
 * //       {
 * //         "id": 4,
 * //         "text": "4-d",
 * //         "parentId": 2
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "id": 6,
 * //     "text": "empty"
 * //   }
 * // ]
 *
 */
function composeToTree(items, opt = {}) {
    let privateLevel = '$level'
    let privateParents = '$parents'

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

    //saveExtProps
    let saveExtProps = get(opt, 'saveExtProps', null)
    if (!isbol(saveExtProps)) {
        saveExtProps = false
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
                        [privateParents]: [],
                        ...v,
                    })
                }
                else {
                    //非頂層項目物件, 加入至_items
                    _items.push(v)
                }
            })
            // console.log('_items a', _items)
            // console.log('r a', r)

            //re-save
            items = _items

        }

        function addNodeInParent(p) {
            let _items = []

            each(items, (v, k) => {
                let vbp = get(v, bindParent)
                let pbk = get(p, bindKey)
                if (vbp && pbk && (vbp === pbk)) {
                    //若非頂層項目物件v的bindParent, 等於所傳入的父層物件p的bindKey, 就代表找到從屬, 加入至r

                    //parentIDs
                    let parentIDs = get(p, privateParents, [])
                    parentIDs = cloneDeep(parentIDs)
                    parentIDs.push(p[bindKey])

                    //push
                    r.push({
                        [privateLevel]: p[privateLevel] + 1, //level加1
                        [privateParents]: parentIDs, //儲存父層節點的bindKey
                        ...v,
                    })

                }
                else {
                    //非頂層項目物件v非隸屬於父層物件p, 加入至_items
                    _items.push(v)
                }
            })
            // console.log('_items b', _items)
            // console.log('r b', r)

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

            //check, 存取超過陣列長度
            if (i > r.length - 1) {
                break
            }

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

        function omitProps(v) {
            if (saveExtProps) {
                return v
            }
            return omit(v, [privateLevel, privateParents])
        }

        //填入子節點至keyChildren欄位
        let kp = {}
        each(items, (v, k) => { //r為依照層級高低循序建立
            if (v[privateLevel] === 0) {

                //omitProps
                let omv = omitProps(v)

                //push
                r.push(omv)

                //save kp
                kp[v[bindKey]] = [k] //頂層節點之指標k為keys內容
                // console.log(k, 'r', cloneDeep(r))

            }
            else {
                // console.log(k, 'v', cloneDeep(v))

                //findParent
                let p = findParent(v)
                // console.log(k, 'p', cloneDeep(p))

                //check, 找得到父層節點才處理
                if (p !== null) {

                    //keys
                    let keys = kp[p[bindKey]]
                    keys = [...keys, bindChildren]
                    // console.log(k, 'keys', cloneDeep(keys))

                    let cs = get(r, keys, [])
                    // console.log(k, 'cs1', cloneDeep(cs))

                    //omitProps
                    let omv = omitProps(v)

                    //push
                    cs.push(omv)

                    //save kp
                    kp[v[bindKey]] = [...keys, cs.length - 1]
                    // console.log(k, 'cs2', cloneDeep(cs))

                    //set
                    set(r, keys, cs)
                    // console.log(k, 'r', cloneDeep(r))

                }
                else {
                    console.log(`can not find parent for ${get(v, bindParent)}`)
                }

            }
        })

        return r
    }

    //addNodeLevel
    items = addNodeLevel(items)

    //buildTree
    let r = buildTree(items)

    return r
}


export default composeToTree
