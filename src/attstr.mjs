import trim from 'lodash/trim'
import uniq from 'lodash/uniq'
import get from 'lodash/get'
import size from 'lodash/size'
import each from 'lodash/each'
import filter from 'lodash/filter'
import join from 'lodash/join'
import sep from './sep.mjs'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'


function sepItems(composItems) {

    //check
    if (!isestr(composItems)) {
        return []
    }

    //arrItems
    let arrItems = sep(composItems, ';')

    //uniq
    arrItems = uniq(arrItems)

    return arrItems
}


function joinItems(arrItems) {

    //check
    if (!isearr(arrItems)) {
        return ''
    }

    //uniq
    arrItems = uniq(arrItems)

    //str
    let str = join(arrItems, ';')

    return str
}


function atItemsMergeS1(its) {

    //filter
    its = filter(its, isestr)

    //uniq
    its = uniq(its)

    return joinItems(its)
}


function atItemsMergeS2(its) {

    //itsTemp
    let itsTemp = []
    each(its, (v) => {
        let table = get(v, 'table', '')
        let id = get(v, 'id', '')
        if (trim(table) === '') {
            console.log('atItemsMergeS2: invalid table in its', v, its)
        }
        else if (trim(id) === '') {
            console.log('atItemsMergeS2: invalid id in its', v, its)
        }
        else {
            itsTemp.push(`${table}@${id}`)
        }
    })

    //itsTemp
    its = joinItems(itsTemp)

    return its
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
        let s = sep(v, '@')
        let table = get(s, 0, '')
        let id = get(s, 1, '')
        if (table === '') {
            console.log('atParseS2: invalid table in composItems', v, composItems)
        }
        else if (id === '') {
            console.log('atParseS2: invalid id in composItems', v, composItems)
        }
        else {
            ids.push({
                item: v,
                table,
                id,
            })
        }
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

    //mode
    if (mode === '1p') {
        return atParseS1(composItems)
    }
    else if (mode === '2p') {
        return atParseS2(composItems)
    }

    //indexOf
    let bc = composItems.indexOf('@') >= 0

    if (bc) {
        return atParseS2(composItems)
    }
    return atParseS1(composItems)
}


function atCombineS1(composItems1, composItems2) {

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


function atCombineS2(composItems1, composItems2) {

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


function atCombine(composItems1, composItems2, opt = {}) {

    //mode
    let mode = get(opt, 'mode')
    if (mode !== '1p' && mode !== '2p') {
        mode = 'auto'
    }

    //indexOf
    let bc1 = composItems1.indexOf('@') >= 0
    let bc2 = composItems2.indexOf('@') >= 0

    //mode
    if (mode === '1p') {
        atCombineS1(composItems1, composItems2)
    }
    else if (mode === '2p') {
        return atCombineS2(composItems1, composItems2)
    }

    if (bc1 || bc2) {
        return atCombineS2(composItems1, composItems2)
    }
    return atCombineS1(composItems1, composItems2)
}


function atItemsRemoveS1(its, removeItem) {

    //check its
    if (!isearr(its)) {
        return ''
    }

    //check removeItem
    if (!isestr(removeItem)) {
        return atItemsMergeS1(its)
    }

    //filter
    its = filter(its, (v) => {
        return v !== removeItem
    })

    return atItemsMergeS1(its)
}


function atRemoveS1(composItems, removeId) {

    //check composItems
    if (!isestr(composItems)) {
        return ''
    }

    //check removeId
    if (!isestr(removeId)) {
        return composItems
    }

    //atParseS1
    let its = atParseS1(composItems)

    //check
    if (size(its) === 0) {
        return ''
    }

    //atItemsRemoveS1
    its = atItemsRemoveS1(its, removeId)

    return its
}


function atItemsRemoveS2(its, removeItem) {

    //check
    if (!isearr(its)) {
        return ''
    }

    //check removeId
    if (!isestr(removeItem)) {
        return atItemsMergeS2(its)
    }

    //removeId為純id, 則提取取後面純id出來
    let s = sep(removeItem, '@')
    let rmTable = get(s, 0, '')
    let rmId = get(s, 1, '')

    //check rmTable and rmId
    if (!isestr(rmTable)) {
        console.log('atItemsRemoveS2: table of removeItem is not an effective string', removeItem)
        return ''
    }
    if (!isestr(rmId)) {
        console.log('atItemsRemoveS2: id of removeItem is not an effective string', removeItem)
        return ''
    }

    //filter
    its = filter(its, (v) => {
        return (v.table !== rmTable) && (v.id !== rmId)
    })

    return atItemsMergeS2(its)
}


function atRemoveS2(composItems, removeItem) {

    //check composItems
    if (!isestr(composItems)) {
        return ''
    }

    //atParseS2
    let its = atParseS2(composItems)

    //check
    if (size(its) === 0) {
        return ''
    }

    //atItemsRemoveS2
    let composItemsTemp = atItemsRemoveS2(its, removeItem)

    return composItemsTemp
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

    //mode
    if (mode === '1p') {
        return atRemoveS1(composItems, removeItemOrId)
    }
    else if (mode === '2p') {
        return atRemoveS2(composItems, removeItemOrId)
    }

    //indexOf
    let bc = composItems.indexOf('@') >= 0
    let bt = removeItemOrId.indexOf('@') >= 0

    if (bc && bt) {
        return atRemoveS2(composItems, removeItemOrId)
    }
    return atRemoveS1(composItems, removeItemOrId)
}


function atItemsAddS1(its, addId) {

    //check its
    if (!isearr(its)) {
        return ''
    }

    //check addId
    if (!isestr(addId)) {
        return atItemsMergeS1(its)
    }

    //push
    if (its.indexOf(addId) < 0) {
        its.push(addId)
    }

    return atItemsMergeS1(its)
}


function atAddS1(composItems, addId) {

    //check composItems
    if (!isestr(composItems)) {
        return ''
    }

    //check addId
    if (!isestr(addId)) {
        return composItems
    }

    //atParseS1
    let its = atParseS1(composItems)

    //check
    if (size(its) === 0) {
        return ''
    }

    //atItemsAddS1
    let composItemsTemp = atItemsAddS1(its, addId)

    return composItemsTemp
}


function atItemsAddS2(its, addItem) {

    //check
    if (!isearr(its)) {
        return ''
    }

    //addItem為純id, 則提取取後面純id出來
    let s = sep(addItem, '@')
    let addTable = get(s, 0, '')
    let addId = get(s, 1, '')

    //check addTable and addId
    if (!isestr(addTable)) {
        console.log('atItemsAddS2: table of addItem is not an effective string', addItem)
        return ''
    }
    if (!isestr(addId)) {
        console.log('atItemsAddS2: id of addItem is not an effective string', addItem)
        return ''
    }

    //find
    let b = false
    each(its, (v) => {
        if (v === addItem) {
            b = true
            return false //跳出
        }
    })

    //push
    if (!b) {
        its.push({
            table: addTable,
            id: addId,
        })
    }

    return atItemsMergeS2(its)
}


function atAddS2(composItems, addItem) {

    //check composItems
    if (!isestr(composItems)) {
        return ''
    }

    //atParseS2
    let its = atParseS2(composItems)

    //check
    if (size(its) === 0) {
        return ''
    }

    //atItemsAddS2
    let composItemsTemp = atItemsAddS2(its, addItem)

    return composItemsTemp
}


function atAdd(composItems, addItemOrId, opt = {}) {

    //check composItems
    if (!isestr(composItems)) {
        return ''
    }

    //check addItemOrId
    if (!isestr(addItemOrId)) {
        return composItems
    }

    //mode
    let mode = get(opt, 'mode')
    if (mode !== '1p' && mode !== '2p') {
        mode = 'auto'
    }

    //mode
    if (mode === '1p') {
        return atAddS1(composItems, addItemOrId)
    }
    else if (mode === '2p') {
        return atAddS2(composItems, addItemOrId)
    }

    //indexOf
    let bc = composItems.indexOf('@') >= 0
    let bt = addItemOrId.indexOf('@') >= 0

    if (bc && bt) {
        return atAddS2(composItems, addItemOrId)
    }
    return atAddS1(composItems, addItemOrId)
}


/**
 * 屬性字串處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/color.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Object} color 輸入顏色字串或物件
 * @returns {Object} 回傳color物件，提供toRgbaString、toHslaString、toHsvaString、toHexString等共37種處理函數
 * @example
 *
 * let c
 * let c1
 * let c2
 * let r
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
 * //combine
 * console.log('combine')
 *
 * c1 = 'abc123'
 * c2 = 'def456'
 * r = at.combine(c1, c2)
 * console.log(r)
 * // => abc123;def456
 *
 * c1 = 'abc123'
 * c2 = 'def456;ghi789'
 * r = at.combine(c1, c2)
 * console.log(r)
 * // => abc123;def456;ghi789
 *
 * c1 = 'abc123'
 * c2 = 'abc123'
 * r = at.combine(c1, c2)
 * console.log(r)
 * // => abc123
 *
 * c1 = 'abc123'
 * c2 = 'abc123;def456'
 * r = at.combine(c1, c2)
 * console.log(r)
 * // => abc123;def456
 *
 * c1 = 'abc@123'
 * c2 = 'def@456'
 * r = at.combine(c1, c2)
 * console.log(r)
 * // => abc@123;def@456
 *
 * c1 = 'abc@123'
 * c2 = 'def@456;ghi@789'
 * r = at.combine(c1, c2)
 * console.log(r)
 * // => abc@123;def@456;ghi@789
 *
 * c1 = 'abc@123'
 * c2 = 'abc@123;def@456'
 * r = at.combine(c1, c2)
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
 * c1 = 'abc123;def456'
 * c2 = 'ghi789;jkl012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => abc123;def456
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
 * c1 = 'abc@123;def@456'
 * c2 = 'ghi@789;jkl@012'
 * r = at.remove(c1, c2)
 * console.log(r)
 * // => abc@123;def@456
 *
 * //add
 * console.log('add')
 *
 * c1 = 'abc123'
 * c2 = 'abc123'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc123
 *
 * c1 = 'abc123;def456'
 * c2 = 'abc123'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc123;def456
 *
 * c1 = 'abc123'
 * c2 = 'def456'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc123;def456
 *
 * c1 = 'abc123;def456'
 * c2 = 'ghi789;jkl012'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc123;def456;ghi789;jkl012
 *
 * c1 = 'abc@123'
 * c2 = 'abc@123'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc@123
 *
 * c1 = 'abc@123;def@456'
 * c2 = 'abc@123'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc@123;def@456
 *
 * c1 = 'abc@123'
 * c2 = 'def@456'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc@123;def@456
 *
 * c1 = 'abc@123;def@456'
 * c2 = 'ghi@789;jkl@012'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc@123;def@456;ghi@789;jkl@012
 *
 */
let attstr = {
    parse: atParse,
    remove: atRemove,
    add: atAdd,
    combine: atCombine,
}


export default attstr
