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
import arrHas from './arrHas.mjs'


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

    //mode
    if (mode === '1p') {
        atAddS1(composItems1, composItems2)
    }
    else if (mode === '2p') {
        return atAddS2(composItems1, composItems2)
    }

    //indexOf
    let bc1 = composItems1.indexOf('@') >= 0
    let bc2 = composItems2.indexOf('@') >= 0

    if (bc1 || bc2) {
        return atAddS2(composItems1, composItems2)
    }
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

    //mode
    if (mode === '1p') {
        return atRemoveS1(composItems, removeItemOrId)
    }
    else if (mode === '2p') {
        return atRemoveS2(composItems, removeItemOrId)
    }

    //indexOf
    // let bc = composItems.indexOf('@') >= 0
    let bt = removeItemOrId.indexOf('@') >= 0

    if (bt) { //bc可為空字串故不一定有@
        return atRemoveS2(composItems, removeItemOrId)
    }
    return atRemoveS1(composItems, removeItemOrId)
}


/**
 * 屬性字串處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/attstr.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳attstr物件，提供parse、remove、add、combine等共4種處理函數
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
 * c = ''
 * r = at.parse(c)
 * console.log(r)
 * // => []
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
 * c1 = 'abc@123;ghi789'
 * c2 = 'abc@123;def@456'
 * r = at.add(c1, c2)
 * console.log(r)
 * // => abc@123;ghi789;def@456
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
 */
function attstr() {
    let at = {
        parse: atParse,
        remove: atRemove,
        add: atAdd,
    }
    return at
}


export default attstr()
