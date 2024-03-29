// import trim from 'lodash-es/trim.js'
import uniq from 'lodash-es/uniq.js'
import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import each from 'lodash-es/each.js'
import filter from 'lodash-es/filter.js'
import join from 'lodash-es/join.js'
import split from 'lodash-es/split.js'
import drop from 'lodash-es/drop.js'
// import sep from './sep.mjs'
import isbol from './isbol.mjs'
import isarr from './isarr.mjs'
import isearr from './isearr.mjs'
import isstr from './isstr.mjs'
import isestr from './isestr.mjs'
import arrHas from './arrHas.mjs'
import haskey from './haskey.mjs'


/**
 * 屬性字串處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/attstr.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳attstr物件，提供parse、join、remove、add共4種處理函數
 * @example
 *
 * let c
 * let c1
 * let c2
 * let r
 *
 * let at = attstr({ uniqItems: true })
 *
 * //parse
 * console.log('parse')
 *
 * c = 'abc123'
 * r = at.parse(c)
 * console.log(r)
 * // => [ 'abc123' ]
 *
 * c = 'abc123;abc123'
 * r = at.parse(c)
 * console.log(r)
 * // => [ 'abc123' ]
 *
 * c = 'abc123;def456'
 * r = at.parse(c)
 * console.log(r)
 * // => [ 'abc123', 'def456' ]
 *
 * c = 'abc@123'
 * r = at.parse(c)
 * console.log(r)
 * // => [ { item: 'abc@123', table: 'abc', id: '123' } ]
 *
 * c = 'abc@123;abc@123'
 * r = at.parse(c)
 * console.log(r)
 * // => [ { item: 'abc@123', table: 'abc', id: '123' } ]
 *
 * c = 'abc@123;def@456'
 * r = at.parse(c)
 * console.log(r)
 * // => [
 * //   { item: 'abc@123', table: 'abc', id: '123' },
 * //   { item: 'def@456', table: 'def', id: '456' }
 * // ]
 *
 * c = ''
 * r = at.parse(c)
 * console.log(r)
 * // => []
 *
 * //join
 * console.log('join')
 *
 * c = ['abc123']
 * r = at.join(c)
 * console.log(r)
 * // => 'abc123'
 *
 * c = ['abc123', 'def456']
 * r = at.join(c)
 * console.log(r)
 * // => 'abc123;def456'
 *
 * c = ['abc@123']
 * r = at.join(c)
 * console.log(r)
 * // => 'abc@123'
 *
 * c = ['abc@123', 'def@456']
 * r = at.join(c)
 * console.log(r)
 * // => 'abc@123;def@456'
 *
 * c = [{ table: 'abc', id: '123' }, { table: 'def', id: '456' }]
 * r = at.join(c)
 * console.log(r)
 * // => 'abc@123;def@456'
 *
 * c = []
 * r = at.join(c)
 * console.log(r)
 * // => ''
 *
 * //add
 * console.log('add')
 *
 * c1 = 'abc123'
 * c2 = 'def456'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc123;def456
 *
 * c1 = 'abc123'
 * c2 = 'def456;ghi789'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc123;def456;ghi789
 *
 * c1 = 'abc123'
 * c2 = 'abc123'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc123
 *
 * c1 = 'abc123'
 * c2 = 'abc123;def456'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc123;def456
 *
 * c1 = 'abc123;ghi789'
 * c2 = 'abc123;def456'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc123;ghi789;def456
 *
 * c1 = ''
 * c2 = 'abc123'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc123
 *
 * c1 = ''
 * c2 = 'abc123;def456'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc123;def456
 *
 * c1 = 'abc@123'
 * c2 = 'def@456'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc@123;def@456
 *
 * c1 = 'abc@123'
 * c2 = 'def@456;ghi@789'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc@123;def@456;ghi@789
 *
 * c1 = 'abc@123;ghi@789'
 * c2 = 'abc@123;def@456'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc@123;ghi@789;def@456
 *
 * c1 = ''
 * c2 = 'abc@123'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc@123
 *
 * c1 = ''
 * c2 = 'abc@123;def@456'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc@123;def@456
 *
 * //remove
 * console.log('remove')
 *
 * c1 = 'abc123'
 * c2 = 'abc123'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => ''
 *
 * c1 = 'abc123;def456'
 * c2 = 'abc123'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => def456
 *
 * c1 = 'abc123'
 * c2 = 'def456'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => abc123
 *
 * c1 = 'abc123'
 * c2 = 'ghi789;jkl012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => abc123
 *
 * c1 = 'abc123'
 * c2 = 'abc123;jkl012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => ''
 *
 * c1 = 'abc123;def456'
 * c2 = 'ghi789;jkl012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => abc123;def456
 *
 * c1 = 'abc123;def456'
 * c2 = 'def456;jkl012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => abc123
 *
 * c1 = ''
 * c2 = 'ghi789'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => ''
 *
 * c1 = ''
 * c2 = 'ghi789;jkl012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => ''
 *
 * c1 = 'abc@123'
 * c2 = 'abc@123'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => ''
 *
 * c1 = 'abc@123;def@456'
 * c2 = 'abc@123'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => def@456
 *
 * c1 = 'abc@123'
 * c2 = 'def@456'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => abc@123
 *
 * c1 = 'abc@123'
 * c2 = 'ghi@789;jkl@012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => abc@123
 *
 * c1 = 'abc@123'
 * c2 = 'abc@123;jkl@012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => ''
 *
 * c1 = 'abc@123;def@456'
 * c2 = 'ghi@789;jkl@012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => abc@123;def@456
 *
 * c1 = 'abc@123;def@456'
 * c2 = 'def@456;jkl@012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => abc@123
 *
 * c1 = ''
 * c2 = 'ghi@789'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => ''
 *
 * c1 = ''
 * c2 = 'ghi@789;jkl@012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => ''
 *
 * let at2 = attstr({ uniqItems: true, dlmItem: ',', dlmSep: '|' })
 *
 * c = 'x1|abc@123|def@456,x2|ghi@789'
 * r = at2.parse(c)
 * console.log(r)
 * // => [
 * //   { item: 'x1|abc@123|def@456', table: 'x1', id: ['abc@123','def@456'] },
 * //   { item: 'x2|ghi@789', table: 'x2', id: 'ghi@789' }
 * // ]
 *
 * let at3 = attstr({ uniqItems: true, dlmItem: ',', dlmSep: '|', keyTable: 'name', keyId: 'emails' })
 *
 * c = 'x1|abc@123|def@456,x2|ghi@789'
 * r = at3.parse(c)
 * console.log(r)
 * // => [
 * //   { item: 'x1|abc@123|def@456', name: 'x1', emails: ['abc@123','def@456'] },
 * //   { item: 'x2|ghi@789', name: 'x2', emails: 'ghi@789' }
 * // ]
 *
 * let at4 = attstr({ uniqItems: false })
 *
 * c = ['abc@123', 'abc@123', 'def@456']
 * r = at4.join(c)
 * console.log(r)
 * // => 'abc@123;abc@123;def@456'
 *
 * c = [{ table: 'abc', id: '123' }, { table: 'def', id: '456' }, { table: 'def', id: '456' }]
 * r = at4.join(c)
 * console.log(r)
 * // => 'abc@123;def@456;def@456'
 *
 *
 * c1 = 'abc123;ghi789'
 * c2 = 'abc123;def456'
 * r = at4.add(c1, c2)
 * console.log(r)
 * // => abc123;ghi789;abc123;def456
 *
 * c1 = 'abc@123;ghi@789'
 * c2 = 'abc@123;def@456'
 * r = at4.add(c1, c2)
 * console.log(r)
 * // => abc@123;ghi@789;abc@123;def@456
 *
 */
function attstr(opt = {}) {
    let dlmItem = ';'
    let dlmSep = '@'
    let keyTable = 'table'
    let keyId = 'id'


    //uniqItems
    let uniqItems = get(opt, 'uniqItems')
    if (!isbol(uniqItems)) {
        uniqItems = false
    }

    //dlmItem
    let _dlmItem = get(opt, 'dlmItem', '')
    if (isestr(_dlmItem)) {
        dlmItem = _dlmItem
    }


    //dlmSep
    let _dlmSep = get(opt, 'dlmSep', '')
    if (isestr(_dlmSep)) {
        dlmSep = _dlmSep
    }


    //keyTable
    let _keyTable = get(opt, 'keyTable', '')
    if (isestr(_keyTable)) {
        keyTable = _keyTable
    }


    //keyId
    let _keyId = get(opt, 'keyId', '')
    if (isestr(_keyId)) {
        keyId = _keyId
    }


    function sepItems(composItems) {

        //check
        if (!isestr(composItems)) {
            return []
        }

        //arrItems
        let arrItems = split(composItems, dlmItem) //須用split否則用sep會無法處理空資料問題

        //uniq
        if (uniqItems) {
            arrItems = uniq(arrItems)
        }

        return arrItems
    }


    function joinItems(arrItems) {

        //check
        if (!isearr(arrItems)) {
            return ''
        }

        //uniq
        if (uniqItems) {
            arrItems = uniq(arrItems)
        }

        //str
        let str = join(arrItems, dlmItem)

        return str
    }


    function atItemsMergeS1(its) {

        //filter
        its = filter(its, isestr)

        //uniq
        if (uniqItems) {
            its = uniq(its)
        }

        return joinItems(its)
    }


    function atItemsMergeS2(its) {

        //itsTemp
        let itsTemp = []
        each(its, (v) => {
            let table = get(v, keyTable, '')
            // console.log('table', table)
            let id = get(v, keyId, '')
            // console.log('id', id)
            if (!isestr(table)) {
                // console.log(`atItemsMergeS2: invalid keyTable[${keyTable}] in its`, v, its)
            }
            if (isstr(id)) {
                if (id === '') {
                    // console.log(`atItemsMergeS2: invalid keyId[${keyId}] in its`, v, its)
                }
            }
            else if (isarr(id)) {
                if (size(id) === 0) {
                    // console.log(`atItemsMergeS2: invalid keyId[${keyId}] in its`, v, its)
                }
            }
            else {
                // console.log(`atItemsMergeS2: keyId[${keyId}] is not a string or an array in its`, v, its)
                id = ''
            }
            if (isstr(id)) {
                itsTemp.push(`${table}${dlmSep}${id}`)
            }
            else if (isarr(id)) {
                let ids = join(id, dlmSep)
                itsTemp.push(`${table}${dlmSep}${ids}`)
            }
        })

        //itsTemp
        its = joinItems(itsTemp)

        return its
    }


    function atJoin(its, opt = {}) {

        //check
        if (!isearr(its)) {
            return ''
        }

        //mode
        let mode = get(opt, 'mode')
        if (mode !== '1p' && mode !== '2p') {
            mode = 'auto'
        }

        if (mode === '1p') {
            return atItemsMergeS1(its)
        }
        else if (mode === '2p') {
            return atItemsMergeS2(its)
        }

        //it0
        let it0 = get(its, 0)

        //bti
        let bti = haskey(it0, keyTable) && haskey(it0, keyId)
        // console.log('bti', bti)

        //mode='2p'
        if (bti) {
            return atItemsMergeS2(its)
        }

        //default
        return atItemsMergeS1(its)
    }


    function atParseS1(composItems) {

        //check
        if (!isestr(composItems)) {
            return []
        }

        //arrItems
        let arrItems = sepItems(composItems)

        //ids
        let ids = filter(arrItems, isestr)

        return ids
    }


    function atParseS2(composItems) {

        //check
        if (!isestr(composItems)) {
            return []
        }

        //arrItems
        let arrItems = sepItems(composItems)

        //ids
        let ids = []
        each(arrItems, (v) => {
            let s = split(v, dlmSep) //須用split否則用sep會無法處理空資料問題
            // console.log(`size(s)`, size(s))
            let table = get(s, 0, '')
            // table = trim(table) //不使用trim避免空白被刪除
            let id = get(s, 1, '')
            // id = trim(id) //不使用trim避免空白被刪除
            if (table === '') {
                // console.log(`atParseS2: invalid keyTable[${keyTable}] in composItems`, v, composItems)
            }
            else if (id === '') {
                // console.log(`atParseS2: invalid keyId[${keyId}] in composItems`, v, composItems)
            }
            if (size(s) >= 3) {
                //有2個以上id
                s = drop(s)
                id = s //改儲存為陣列
            }
            ids.push({
                item: v,
                [keyTable]: table,
                [keyId]: id,
            })
        })

        return ids
    }


    function atParse(composItems, opt = {}) {

        //check
        if (!isestr(composItems)) {
            return []
        }

        //mode
        let mode = get(opt, 'mode')
        if (mode !== '1p' && mode !== '2p') {
            mode = 'auto'
        }

        if (mode === '1p') {
            return atParseS1(composItems)
        }
        else if (mode === '2p') {
            return atParseS2(composItems)
        }

        //bc
        let bc = composItems.indexOf(dlmSep) >= 0

        //mode='2p'
        if (bc) {
            return atParseS2(composItems)
        }

        //default
        return atParseS1(composItems)
    }


    function atAddS1(composItems1, composItems2) {

        //atParseS1
        let itp1 = atParseS1(composItems1)
        let itp2 = atParseS1(composItems2)

        //its
        let its = [...itp1, ...itp2]

        //check
        if (size(its) === 0) {
            return ''
        }

        return atItemsMergeS1(its)
    }


    function atAddS2(composItems1, composItems2) {

        //atParseS2
        let itp1 = atParseS2(composItems1)
        let itp2 = atParseS2(composItems2)

        //its
        let its = [...itp1, ...itp2]

        //check
        if (size(its) === 0) {
            return ''
        }

        return atItemsMergeS2(its)
    }


    function atAdd(composItems1, composItems2, opt = {}) {

        //mode
        let mode = get(opt, 'mode')
        if (mode !== '1p' && mode !== '2p') {
            mode = 'auto'
        }

        if (mode === '1p') {
            return atAddS1(composItems1, composItems2)
        }
        else if (mode === '2p') {
            return atAddS2(composItems1, composItems2)
        }

        //bc1, bc2
        let bc1 = composItems1.indexOf(dlmSep) >= 0
        let bc2 = composItems2.indexOf(dlmSep) >= 0

        //mode='2p'
        if (bc1 || bc2) {
            return atAddS2(composItems1, composItems2)
        }

        //default
        return atAddS1(composItems1, composItems2)
    }


    function atRemoveS1(composItems1, composItems2) {

        //atParseS1
        let itp1 = atParseS1(composItems1)
        let itp2 = atParseS1(composItems2)

        //its
        let its = []
        each(itp1, (v) => {
            if (!arrHas(v, itp2)) {
                its.push(v)
            }
        })

        //check
        if (size(its) === 0) {
            return ''
        }

        return atItemsMergeS1(its)
    }


    function atRemoveS2(composItems1, composItems2) {

        //atParseS2
        let itp1 = atParseS2(composItems1)
        let itp2 = atParseS2(composItems2)

        //its
        let its = []
        each(itp1, (v) => {
            if (!arrHas(v, itp2)) {
                its.push(v)
            }
        })

        //check
        if (size(its) === 0) {
            return ''
        }

        return atItemsMergeS2(its)
    }


    function atRemove(composItems, removeItemOrId, opt = {}) {

        //check composItems
        if (!isestr(composItems)) {
            return ''
        }

        //check removeItemOrId
        if (!isestr(removeItemOrId)) {
            return composItems
        }

        //mode
        let mode = get(opt, 'mode')
        if (mode !== '1p' && mode !== '2p') {
            mode = 'auto'
        }

        if (mode === '1p') {
            return atRemoveS1(composItems, removeItemOrId)
        }
        else if (mode === '2p') {
            return atRemoveS2(composItems, removeItemOrId)
        }

        //bt
        // let bc = composItems.indexOf(dlmSep) >= 0 //bc可為空字串故不一定有dlmSep故不納入檢測
        let bt = removeItemOrId.indexOf(dlmSep) >= 0

        //mode='2p'
        if (bt) {
            return atRemoveS2(composItems, removeItemOrId)
        }

        //default
        return atRemoveS1(composItems, removeItemOrId)
    }

    //at
    let at = {
        parse: atParse,
        join: atJoin,
        remove: atRemove,
        add: atAdd,
    }

    return at
}


export default attstr
