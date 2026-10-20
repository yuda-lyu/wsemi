//ormFindRef.mjs: w-orm系列條件(find)之參考比對器(測試用, 獨立於cvOrmFind與lowerFind)
//
//依族別語意直接對find計算命中之列, 用以核對契約案例表(src/_cvOrmFindCases.mjs)之ids, 並作為IR求值器(irEval.mjs)之find層對照:
//  fam='mongo': $ne/$nin遇NULL或缺欄之列時含該列(MongoDB式)
//  fam='sql'  : 三值邏輯, $ne/$nin不命中NULL列; 字串與數字依欄型轉換(字串須為數值格式)
//兩個測試(test/cvOrmFind.test.mjs、test/lowerFind.test.mjs)共用本檔, 值比較規則(cmp)亦供irEval.mjs使用, 使[SQL族之值比較]只有一個定義.


let isDate = (v) => Object.prototype.toString.call(v) === '[object Date]'
let isNil = (v) => v === undefined || v === null

//cmp, 回傳-1/0/1, 不可比較者回傳undefined
let cmp = (fam, a, b) => {
    let ta = isDate(a) ? 'date' : typeof a
    let tb = isDate(b) ? 'date' : typeof b
    if (fam === 'sql' && ta !== tb) {
        //SQL族: 數字與字串依欄型轉換(字串須為數值格式)
        let na = ta === 'string' && a.trim() !== '' ? Number(a) : a
        let nb = tb === 'string' && b.trim() !== '' ? Number(b) : b
        if (typeof na === 'number' && typeof nb === 'number' && !Number.isNaN(na) && !Number.isNaN(nb)) {
            return na < nb ? -1 : na > nb ? 1 : 0
        }
        return undefined
    }
    if (ta !== tb) {
        return undefined
    }
    let x = ta === 'date' ? a.getTime() : a
    let y = tb === 'date' ? b.getTime() : b
    if (ta === 'boolean') {
        x = x ? 1 : 0
        y = y ? 1 : 0
    }
    return x < y ? -1 : x > y ? 1 : 0
}

let eq = (fam, a, b) => (b === null ? isNil(a) : !isNil(a) && cmp(fam, a, b) === 0)

let matchField = (fam, a, cond) => {
    if (cond === null || typeof cond !== 'object' || isDate(cond)) {
        return eq(fam, a, cond)
    }
    return Object.keys(cond).every((op) => {
        let b = cond[op]
        let c = (isNil(a) || b === null) ? undefined : cmp(fam, a, b)
        switch (op) {
        case '$eq': return eq(fam, a, b)
        case '$ne': return fam === 'mongo' ? !eq(fam, a, b) : (b === null ? !isNil(a) : !isNil(a) && c !== 0 && c !== undefined)
        case '$gt': return c !== undefined && c > 0
        case '$gte': return c !== undefined && c >= 0
        case '$lt': return c !== undefined && c < 0
        case '$lte': return c !== undefined && c <= 0
        case '$in': return b.some((x) => eq(fam, a, x))
        case '$nin': return fam === 'mongo' ? !b.some((x) => eq(fam, a, x)) : (!isNil(a) && !b.some((x) => eq(fam, a, x)))
        default: throw new Error(`reference: unknown operator ${op}`)
        }
    })
}

let matchDoc = (fam, row, doc) => Object.keys(doc).every((k) => {
    if (k === '$and') {
        return doc.$and.every((d) => matchDoc(fam, row, d))
    }
    if (k === '$or') {
        return doc.$or.some((d) => matchDoc(fam, row, d))
    }
    return matchField(fam, row[k], doc[k])
})

//refIds, find命中之列的id(依rows順序); rows須含id欄
let refIds = (fam, find, rows) => rows.filter((row) => matchDoc(fam, row, find)).map((row) => row.id)


export { cmp, eq, isDate, isNil, matchField, matchDoc, refIds }
export default refIds
