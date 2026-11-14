import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import set from 'lodash-es/set.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import omit from 'lodash-es/omit.js'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import iseobj from './iseobj.mjs'
import isbol from './isbol.mjs'


/**
 * 組合關聯陣列成為樹狀陣列
 *
 * 規則(使用者2026-11-14裁定)：id與parentId只取項目之自有可列舉欄位，只有undefined、null、''視為無值(0為有效值)；id以嚴格相等比對(1與'1'不同)；
 * parentId無值者為頂層；孤兒(parentId指向不存在之id)、循環(含指向自己)者放到頂層並保留原parentId，其子節點照常掛在其下，循環者以該循環中最先出現之項目為頂層而斷開；頂層依項目原順序排列；
 * id須唯一，重複時子節點掛在最後一個同id之節點下；缺id(無值)者只能為葉節點；項目已有children(或opt.bindChildren所指欄位)時，子節點合併於其後(該欄位須為陣列，非陣列時拋出原生TypeError，同修前)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/composeToTree.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} items 輸入關聯陣列，非陣列或空陣列回傳空陣列[]；元素須為有效物件(至少一個自有可列舉鍵)，任一元素非物件或為空物件時拋出Error並指出第幾個(如'invalid items[0]: must be a non-empty object')
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.bindKey='id'] 輸入項目物件識別用欄位字串，預設'id'
 * @param {String} [opt.bindParent='parentId'] 輸入項目物件內存放父節點欄位字串，預設'parentId'
 * @param {String} [opt.bindChildren='children'] 輸入產生樹狀物件時，各節點內存放子節點欄位字串，預設'children'
 * @param {Boolean} [opt.saveExtProps=false] 輸入是否儲存項目物件從屬資訊布林值，預設false
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
 * //id為0為有效值
 * console.log(JSON.stringify(composeToTree([{ id: 0, text: 'zero' }, { id: 1, parentId: 0, text: 'c' }])))
 * // => [{"id":0,"text":"zero","children":[{"id":1,"parentId":0,"text":"c"}]}]
 *
 * //孤兒(parentId指向不存在之id)放到頂層並保留原parentId, 其子節點照常掛在其下
 * console.log(JSON.stringify(composeToTree([{ id: 1 }, { id: 2, parentId: 99 }, { id: 3, parentId: 2 }, { id: 4 }])))
 * // => [{"id":1},{"id":2,"parentId":99,"children":[{"id":3,"parentId":2}]},{"id":4}]
 *
 * //循環以最先出現者為頂層而斷開, 指向自己者放到頂層
 * console.log(JSON.stringify(composeToTree([{ id: 9, parentId: 1 }, { id: 1, parentId: 2 }, { id: 2, parentId: 1 }, { id: 3, parentId: 3 }])))
 * // => [{"id":1,"parentId":2,"children":[{"id":9,"parentId":1},{"id":2,"parentId":1}]},{"id":3,"parentId":3}]
 *
 * //id嚴格比對(1與'1'不同)
 * console.log(JSON.stringify(composeToTree([{ id: 1 }, { id: '1' }, { id: 3, parentId: 1 }])))
 * // => [{"id":1,"children":[{"id":3,"parentId":1}]},{"id":"1"}]
 *
 * //id重複時子節點掛在最後一個
 * console.log(JSON.stringify(composeToTree([{ id: 1, a: 'first' }, { id: 1, a: 'last' }, { id: 2, parentId: 1 }])))
 * // => [{"id":1,"a":"first"},{"id":1,"a":"last","children":[{"id":2,"parentId":1}]}]
 *
 * //輸入已有children時合併
 * console.log(JSON.stringify(composeToTree([{ id: 1, children: [{ x: 1 }] }, { id: 2, parentId: 1 }])))
 * // => [{"id":1,"children":[{"x":1},{"id":2,"parentId":1}]}]
 *
 * //元素非物件或為空物件時拋錯
 * try {
 *     composeToTree([{ id: 1 }, null])
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid items[1]: must be a non-empty object
 *
 */
function composeToTree(items, opt = {}) {
    let privateLevel = '$level'
    let privateParents = '$parents'

    //check, 參數層: 非陣列或空陣列回傳[]
    if (!isarr(items) || items.length === 0) {
        return []
    }

    //check, 元素層: 每個元素須為有效物件(非空物件, 至少一個自有可列舉鍵), 否則拋錯並指出第幾個(使用者2026-11-14, 第430項第二批: 原[{}]、[null]經isearr當空陣列而回傳[])
    for (let i = 0; i < items.length; i++) {
        if (!iseobj(items[i])) {
            throw new Error(`invalid items[${i}]: must be a non-empty object`)
        }
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

    //hasVal, id與parentId只有undefined、null、''視為無值, 0等其他值皆為有效值(使用者2026-11-14, 第430項第二批: 原parentId以iser判定、比對以真值判定, id為0之子節點被丟棄)
    let hasVal = (x) => {
        return x !== undefined && x !== null && x !== ''
    }

    //getOwn, 只取自有可列舉欄位之值(不取繼承之欄位, 不以lodash get解析路徑)
    let getOwn = (o, k) => {
        return Object.prototype.propertyIsEnumerable.call(o, k) ? o[k] : undefined
    }

    function addNodeLevel(items) {
        let r = []

        //cloneDeep
        items = cloneDeep(items)

        //ids, 有值之id(嚴格比對; Map以SameValueZero, NaN另於findIds排除以符合===)
        let ids = new Map()
        each(items, (v, k) => {
            let id = getOwn(v, bindKey)
            if (hasVal(id)) {
                if (!ids.has(id)) {
                    ids.set(id, [])
                }
                ids.get(id).push(k)
            }
        })
        let findIds = (pid) => {
            if (!hasVal(pid) || Number.isNaN(pid)) {
                return []
            }
            return ids.get(pid) || []
        }

        //isRoot, 頂層: parentId無值, 或孤兒(parentId指向不存在之id); 循環者與指向自己者其後以先出現者為頂層而斷開
        let n = items.length
        let isRoot = new Array(n).fill(false)
        let attached = new Array(n).fill(false)
        each(items, (v, k) => {
            let pid = getOwn(v, bindParent)
            if (!hasVal(pid) || findIds(pid).length === 0) {
                isRoot[k] = true
            }
        })

        //children, 各項目之子項目(依原順序), 供可達性計算
        let children = new Array(n)
        for (let k = 0; k < n; k++) {
            children[k] = []
        }
        each(items, (v, k) => {
            if (isRoot[k]) {
                return
            }
            for (let pk of findIds(getOwn(v, bindParent))) {
                children[pk].push(k)
            }
        })

        //attach, 由k起標記可達之項目
        let attach = (k0) => {
            let st = [k0]
            attached[k0] = true
            while (st.length > 0) {
                let k = st.pop()
                for (let ck of children[k]) {
                    if (!attached[ck] && !isRoot[ck]) {
                        attached[ck] = true
                        st.push(ck)
                    }
                }
            }
        }
        for (let k = 0; k < n; k++) {
            if (isRoot[k]) {
                attach(k)
            }
        }

        //循環(含指向自己): 未可達者沿父項目走到重複出現, 取該循環中最先出現之項目為頂層而斷開, 再標記其可達者, 直到全部可達
        for (let k = 0; k < n; k++) {
            if (attached[k]) {
                continue
            }
            let pos = new Map()
            let path = []
            let cur = k
            let head = -1
            while (head < 0) {
                if (pos.has(cur)) {
                    head = Math.min(...path.slice(pos.get(cur))) //循環之成員中最先出現者
                    break
                }
                pos.set(cur, path.length)
                path.push(cur)
                let pks = findIds(getOwn(items[cur], bindParent)).filter((pk) => !attached[pk])
                if (pks.length === 0) {
                    head = cur //理論上不會發生(父項目已可達則本項目亦已可達), 防護用: 以cur為頂層
                    break
                }
                cur = pks[0]
            }
            isRoot[head] = true
            attach(head)
        }

        function addNodeForTop() {
            let _items = []

            each(items, (v, k) => {
                if (isRoot[k]) {
                    //頂層(parentId無值、孤兒、循環之斷開點), 加入至r; 孤兒與循環者保留原parentId
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
                let vbp = getOwn(v, bindParent)
                let pbk = getOwn(p, bindKey)
                if (hasVal(vbp) && hasVal(pbk) && (vbp === pbk)) {
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
            let pid = getOwn(v, bindParent)
            for (let i = 0; i < items.length; i++) {
                let p = items[i]
                if (hasVal(pid) && pid === getOwn(p, bindKey)) { //嚴格比對, 只取自有欄位
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
        let kp = new Map() //id -> 取節點之路徑, 以id值嚴格區分(1與'1'不同); id重複時後者覆蓋, 子節點掛在最後一個
        each(items, (v, k) => { //r為依照層級高低循序建立
            if (v[privateLevel] === 0) {

                //omitProps
                let omv = omitProps(v)

                //push
                r.push(omv)

                //save kp
                kp.set(getOwn(v, bindKey), [k]) //頂層節點之指標k為keys內容(頂層節點皆排於最前, k即其於r之索引)
                // console.log(k, 'r', cloneDeep(r))

            }
            else {
                // console.log(k, 'v', cloneDeep(v))

                //findParent, 非頂層節點必有父節點(孤兒與循環者已置頂, 原「找不到父節點」之console.log為走不到之程式碼, 已移除)
                let p = findParent(v)
                // console.log(k, 'p', cloneDeep(p))

                //keys
                let keys = kp.get(getOwn(p, bindKey))
                keys = [...keys, bindChildren]
                // console.log(k, 'keys', cloneDeep(keys))

                let cs = get(r, keys, [])
                // console.log(k, 'cs1', cloneDeep(cs))

                //omitProps
                let omv = omitProps(v)

                //push
                cs.push(omv)

                //save kp
                kp.set(getOwn(v, bindKey), [...keys, cs.length - 1])
                // console.log(k, 'cs2', cloneDeep(cs))

                //set
                set(r, keys, cs)
                // console.log(k, 'r', cloneDeep(r))

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
