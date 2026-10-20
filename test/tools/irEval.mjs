//irEval.mjs: IR(src/lowerFind.mjs輸出)之求值器(測試用, 契約之獨立預言機)
//
//依SQL三值邏輯對列求命中集合, 不含任何lowerFind之碼; 值比較規則取自ormFindRef.mjs(SQL族: 字串對數字依欄型轉換), 使[SQL族之值比較]只有一個定義.
//用途: ①以手推之hits核對契約案例表(src/_lowerFindCases.mjs)之ir ②以案例表ids.sql核對lowerFind對共用案例(src/_cvOrmFindCases.mjs)之輸出
//  ③reladb、mdb等後端遷移時, 無資料庫之發射器(記憶體查詢)可直接以本求值器對拍.
//三值邏輯之簡化: IR只有and/or而無一般性NOT(not只出現在null/in葉節點且其結果在葉內定義), 故UNKNOWN與FALSE對最終[是否為TRUE]之判定等價,
//  求值器以兩值計算: 葉節點遇NULL列(null/undefined)一律不命中(null not與in not亦然: IS NOT NULL命中非NULL列, NOT IN不命中NULL列).
import { cmp, isNil } from './ormFindRef.mjs'


let OPS = {
    eq: (c) => c === 0,
    ne: (c) => c !== 0,
    gt: (c) => c > 0,
    gte: (c) => c >= 0,
    lt: (c) => c < 0,
    lte: (c) => c <= 0,
}

let hitCmp = (a, op, v) => {
    if (!Object.prototype.hasOwnProperty.call(OPS, op)) {
        throw new Error(`irEval: unknown op ${op}`)
    }
    if (isNil(a)) {
        return false //NULL列不命中任何比較(含ne)
    }
    let c = cmp('sql', a, v)
    return c !== undefined && OPS[op](c)
}

let evalNode = (n, row) => {
    switch (n.t) {
    case 'and':
        return n.a.every((x) => evalNode(x, row))
    case 'or':
        return n.a.some((x) => evalNode(x, row))
    case 'cmp':
        return hitCmp(row[n.c], n.op, n.v)
    case 'bool': {
        //布林節點: 欄值須為布林(NULL列與非布林值不命中), false < true
        let a = row[n.c]
        return typeof a === 'boolean' && hitCmp(a, n.op, n.v)
    }
    case 'null':
        return n.not ? !isNil(row[n.c]) : isNil(row[n.c])
    case 'in': {
        let a = row[n.c]
        if (isNil(a)) {
            return false //NULL列不命中in與not in
        }
        let has = n.vs.some((x) => cmp('sql', a, x) === 0)
        return n.not ? !has : has
    }
    default:
        throw new Error(`irEval: unknown node ${String(n.t)}`)
    }
}

//evalIr, IR對rows求命中之id(依rows順序); ir為null表示無條件(全部)
let evalIr = (ir, rows) => rows.filter((row) => ir === null || evalNode(ir, row)).map((row) => row.id)


export { evalIr, evalNode }
export default evalIr
