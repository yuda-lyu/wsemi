import * as Diff from 'diff'
import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import isarr from './isarr.mjs'
import _cellText from './_cellText.mjs'
import _diffPair from './_diffPair.mjs'


//texts, 各元素(或儲存格)之比對文字(_cellText.cellText), 空位與undefined為''
function texts(arr) {
    let r = []
    for (let i = 0; i < arr.length; i++) {
        r.push(_cellText.cellText(arr[i]))
    }
    return r
}


//diffByKeys, 以字串鍵逐項比對(diffArrays, ===), 再依各段之項數由原序列取項目(不變者取舊側, 其鍵相同即內容相同)
function diffByKeys(keysOld, keysNew, itemsOld, itemsNew) {
    let diff = Diff.diffArrays(keysOld, keysNew)
    let iOld = 0
    let iNew = 0
    let chunks = []
    for (let s of diff) {
        let count = s.value.length
        let added = s.added === true
        let removed = s.removed === true
        let items
        if (added) {
            items = itemsNew.slice(iNew, iNew + count)
            iNew += count
        }
        else if (removed) {
            items = itemsOld.slice(iOld, iOld + count)
            iOld += count
        }
        else {
            items = itemsOld.slice(iOld, iOld + count)
            iOld += count
            iNew += count
        }
        chunks.push({ count, added, removed, items })
    }
    return chunks
}


//toDiff, 底層比對結果: 各段為{ count, added, removed, value }, value為該段之元素陣列(一維為元素之比對文字, 矩陣為各列之儲存格比對文字陣列)
function toDiff(chunks) {
    return chunks.map((c) => {
        return {
            count: c.count,
            added: c.added,
            removed: c.removed,
            value: c.items,
        }
    })
}


function arrDiff1D(arrOld, arrNew) {

    //to, tn, 逐元素之比對文字
    let to = texts(arrOld)
    let tn = texts(arrNew)

    //逐元素比對, 連續之刪除與其後之新增依序配對為modify(同原以strDiff逐行比對之語意)
    let chunks = diffByKeys(to, tn, to, tn)
    let dfs = _diffPair(chunks)

    //parse
    dfs = dfs.map((df, kdf) => {
        return {
            p: df.p,
            k: kdf,
            vo: df.vo,
            vn: df.vn,
        }
    })

    return {
        diff: toDiff(chunks),
        dfs,
    }
}


function arrDiff2D(arrOld, arrNew) {

    //rowsOld, rowsNew, 各列之儲存格比對文字; 列須為陣列(含空位視為非陣列), arrOld整側先於arrNew整側, 訊息不帶輸入值, 亦不輸出輸入資料至console
    let rowsOld = []
    for (let i = 0; i < arrOld.length; i++) {
        let v = arrOld[i]
        if (!isarr(v)) {
            throw new Error(`invalid arrOld: every element must be an array when opt.mode is 'matrix'`)
        }
        rowsOld.push(texts(v))
    }
    let rowsNew = []
    for (let i = 0; i < arrNew.length; i++) {
        let v = arrNew[i]
        if (!isarr(v)) {
            throw new Error(`invalid arrNew: every element must be an array when opt.mode is 'matrix'`)
        }
        rowsNew.push(texts(v))
    }

    //逐列比對(列之鍵為其儲存格文字陣列之JSON, 各儲存格文字全同才為同一列), 連續之刪除列與其後之新增列依序配對為modify
    let keysOld = rowsOld.map((cs) => JSON.stringify(cs))
    let keysNew = rowsNew.map((cs) => JSON.stringify(cs))
    let chunks = diffByKeys(keysOld, keysNew, rowsOld, rowsNew)
    let rdfs = _diffPair(chunks)

    //dfs, modify列再逐格比對(儲存格之鍵含欄位指標, 同欄位且同文字才為同一格, 同原以「欄位指標∶值」比對之語意), 其餘列各格沿用該列之比對結果
    let dfs = rdfs.map((r) => {
        let cs
        if (r.p === 'modify') {
            let co = r.vo
            let cn = r.vn
            let ko = co.map((t, j) => JSON.stringify([j, t]))
            let kn = cn.map((t, j) => JSON.stringify([j, t]))
            cs = _diffPair(diffByKeys(ko, kn, co, cn))
        }
        else { //nomodify, add, remove
            let co = isarr(r.vo) ? r.vo : []
            cs = co.map((t) => {
                return {
                    p: r.p,
                    vo: t,
                    vn: '',
                }
            })
        }
        return cs.map((c, kc) => {
            return {
                p: c.p,
                k: kc,
                vo: c.vo,
                vn: c.vn,
            }
        })
    })

    return {
        diff: toDiff(chunks),
        dfs,
    }
}


/**
 * 比對新舊陣列差異處
 *
 * arrOld與arrNew皆為必須參數，須為陣列，非陣列throw Error('invalid arrOld: must be an array')或Error('invalid arrNew: must be an array')(依arrOld、arrNew序)，訊息不帶輸入值；空陣列為合法輸入，只有一邊為空者照常回傳差異結果，兩邊皆為空陣列時回傳{ diff: [], dfs: [] }(與正常輸出同形，無差異)；opt內無效的鍵一律改用預設；opt.mode為'matrix'時各元素須為陣列，否則throw Error("invalid arrOld: every element must be an array when opt.mode is 'matrix'")或Error("invalid arrNew: every element must be an array when opt.mode is 'matrix'")(arrOld整側先於arrNew整側)，訊息不帶輸入值，亦不輸出輸入資料至console
 * 以diff套件之diffArrays逐元素(一維)、逐列再逐格(矩陣)比對，不先把陣列串成文字，故值內含換行或任何字元皆不影響對齊；連續刪除與其後之新增依序配對為modify；矩陣模式之列以其各儲存格文字全同為同一列，modify之列再逐格比對(同一欄位且同一文字為同一格)
 * 以元素(儲存格)之文字比對、不比型別(1與'1'、true與'true'、null與'null'視為相同)：字串與有限數字為原文，布林為'true'或'false'，null為'null'，undefined與空位為''，NaN與±Infinity為字串'NaN'、'Infinity'、'-Infinity'，物件與陣列為鍵排序後之JSON(鍵之順序不同視為相同)，Date為ISO字串，函數視為null即'null'，BigInt為String(v)；dfs之vo、vn為此文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrDiff.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arrOld 輸入原始數據陣列，必須參數，非陣列throw Error，[]為合法輸入
 * @param {Array} arrNew 輸入更新數據陣列，必須參數，非陣列throw Error，[]為合法輸入
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.mode='array'] 輸入數據維度字串，可選為'array'與'matrix'，預設'array'
 * @returns {Object} 回傳比對結果物件{ diff, dfs }：diff為底層比對結果陣列(各段為{ count, added, removed, value }，value為該段之元素陣列，一維為各元素之比對文字，矩陣為各列之儲存格比對文字陣列)；dfs於一維為各元素之比對結果陣列[{ p, k, vo, vn }]，於矩陣為各列之各儲存格比對結果陣列，p為''(不變)、'remove'、'add'或'modify'；arrOld與arrNew皆為[]時回傳{ diff: [], dfs: [] }
 * @throws {Error} arrOld或arrNew非陣列時throw Error('invalid arrOld: must be an array')或Error('invalid arrNew: must be an array')；opt.mode為'matrix'且有元素非陣列時throw Error("invalid arrOld: every element must be an array when opt.mode is 'matrix'")或Error("invalid arrNew: every element must be an array when opt.mode is 'matrix'")；訊息皆不帶輸入值
 * @example
 *
 * let r
 * let arrOld
 * let arrNew
 *
 * if (true) {
 *     r = arrDiff([], [])
 *     console.log(r)
 *     // => { diff: [], dfs: [] }
 * }
 *
 * if (true) {
 *     try {
 *         arrDiff('x', [])
 *     }
 *     catch (err) {
 *         console.log(err.message)
 *     }
 *     // => invalid arrOld: must be an array
 *
 *     try {
 *         arrDiff([], null)
 *     }
 *     catch (err) {
 *         console.log(err.message)
 *     }
 *     // => invalid arrNew: must be an array
 *
 *     try {
 *         arrDiff([1], [2], { mode: 'matrix' })
 *     }
 *     catch (err) {
 *         console.log(err.message)
 *     }
 *     // => invalid arrOld: every element must be an array when opt.mode is 'matrix'
 * }
 *
 * if (true) {
 *     arrOld = [-0.529408622, 0.839882385, 0.663059856, 0.49047221, 123, 0.395763265, 0.866151835]
 *     arrNew = [-0.529408622, 0.1839882385, 0.663059856, 0.49047221, 0.395763265, 45.6, 0.866151835]
 *     r = arrDiff(arrOld, arrNew) //因第[5](0.395763265)元素會往前到[4]去, diff會偵測到並視為前面刪除(123)而後面加入(45.6), 故解析後長度會由7變成8
 *     console.dir(r, { depth: null })
 *     // => {
 *     //   diff: [
 *     //     {
 *     //       count: 1,
 *     //       added: false,
 *     //       removed: false,
 *     //       value: [ '-0.529408622' ]
 *     //     },
 *     //     { count: 1, added: false, removed: true, value: [ '0.839882385' ] },
 *     //     {
 *     //       count: 1,
 *     //       added: true,
 *     //       removed: false,
 *     //       value: [ '0.1839882385' ]
 *     //     },
 *     //     {
 *     //       count: 2,
 *     //       added: false,
 *     //       removed: false,
 *     //       value: [ '0.663059856', '0.49047221' ]
 *     //     },
 *     //     { count: 1, added: false, removed: true, value: [ '123' ] },
 *     //     {
 *     //       count: 1,
 *     //       added: false,
 *     //       removed: false,
 *     //       value: [ '0.395763265' ]
 *     //     },
 *     //     { count: 1, added: true, removed: false, value: [ '45.6' ] },
 *     //     {
 *     //       count: 1,
 *     //       added: false,
 *     //       removed: false,
 *     //       value: [ '0.866151835' ]
 *     //     }
 *     //   ],
 *     //   dfs: [
 *     //     { p: '', k: 0, vo: '-0.529408622', vn: '' },
 *     //     { p: 'modify', k: 1, vo: '0.839882385', vn: '0.1839882385' },
 *     //     { p: '', k: 2, vo: '0.663059856', vn: '' },
 *     //     { p: '', k: 3, vo: '0.49047221', vn: '' },
 *     //     { p: 'remove', k: 4, vo: '123', vn: '' },
 *     //     { p: '', k: 5, vo: '0.395763265', vn: '' },
 *     //     { p: 'add', k: 6, vo: '45.6', vn: '' },
 *     //     { p: '', k: 7, vo: '0.866151835', vn: '' }
 *     //   ]
 *     // }
 * }
 *
 * if (true) {
 *     arrOld = [
 *         [1, 0.974848293, 0.791303871, 0.716898185, 0.506002098, 0.137888903, 0.626724085],
 *         [2, -0.529408622, 0.839882385, 0.663059856, 0.49047221, 123, 0.395763265, 0.866151835],
 *         [3, -0.10320217, 0.475514539, 0.969205779, 0.711250309, 0.153847069, 0.410092395],
 *         [4, -0.121479865, 0.486179086, 0.481023842, 0.467410582, 0.42602231, 0.849701641],
 *         [5, 0.757346003, 0.697242433, 0.67532802, 0.174644416, 0.045652267, 0.397104668],
 *         [6, 0.663032731, 0.259252779, 0.566177431, 0.679637706, 0.377814487, 0.400248119],
 *         [7, 0.72721374, 0.263793391, 0.167895215, 0.794808602, 0.107070584, 0.011822872],
 *         [8, 0.247416664, 0.360426795, 0.014346373, 0.000469616, 0.4082693, 0.913806611],
 *         [9, 0.345880037, 0.167996664, 0.711054429, 0.363177921, 0.206849994, 0.636855344],
 *         [10, 0.576739457, 0.324665077, 0.973218005, 0.883927423, 0.176906125, 0.20087887],
 *         [11, 1.2],
 *         [12, 23.5],
 *         [13, 0.504421248, 0.984003751, 0.32549507, 0.987090751, 0.192745589, 0.735133561],
 *         [14, 0.273214614, 0.083431884, 0.565146092, 0.935388666, 0.637675154, 0.523815661],
 *     ]
 *     arrNew = [
 *         [1, 0.974848293, 0.791303871, 0.716898185, 0.506002098, 0.137888903, 0.626724085],
 *         [2, -0.529408622, 0.1839882385, 0.663059856, 0.49047221, 0.395763265, 45.6, 0.866151835],
 *         [3, -0.10320217, 0.475514539, 0.969205779, 0.711250309, 0.153847069, 0.410092395],
 *         [4, -0.121479865, 0.486179086, 0.481023842, 0.467410582, 0.42602231, 0.849701641],
 *         [5, 0.757346003, 0.697242433, 0.67532802, 0.174644416, 0.045652267, 0.397104668],
 *         [7, 0.72721374, 0.263793391, 0.167895215, 0.794808602, 0.107070584, 0.011822872],
 *         [8, 0.247416664, 0.360426795, 0.014346373, 0.000469616, 0.4082693, 0.913806611],
 *         [9, 0.345880037, 0.167996664, 0.711054429, 0.363173478, 0.636855344],
 *         [10, 0.576739457, 0.324665077, 0.973218005, 0.883927423, 0.176906125, 0.20087887],
 *         [13, 0.504421248, 0.984003751, 0.32549507, 0.987090751, 0.192745589, 0.735133561],
 *         [14, 0.273214614, 0.083431884, 0.565146092, 0.935388666, 0.637675154, 0.523815661],
 *         ['n1', 0.944492151, 0.89950443, 0.182709318, 0.892820757, 0.709746901, 0.097385354],
 *         ['n2', 0.769805921, 0.061355308, 0.314826137, 0.855857651, 0.653550539, 0.772500773],
 *         ['n3', 0.158739038, 0.085078711, 0.844664253, 0.21630142, 0.912931341, 0.735138313],
 *     ]
 *     r = arrDiff(arrOld, arrNew, { mode: 'matrix' })
 *     console.dir(r.diff, { depth: null })
 *     // => [
 *     //   {
 *     //     count: 1,
 *     //     added: false,
 *     //     removed: false,
 *     //     value: [
 *     //       [
 *     //         '1',
 *     //         '0.974848293',
 *     //         '0.791303871',
 *     //         '0.716898185',
 *     //         '0.506002098',
 *     //         '0.137888903',
 *     //         '0.626724085'
 *     //       ]
 *     //     ]
 *     //   },
 *     //   {
 *     //     count: 1,
 *     //     added: false,
 *     //     removed: true,
 *     //     value: [
 *     //       [
 *     //         '2',
 *     //         '-0.529408622',
 *     //         '0.839882385',
 *     //         '0.663059856',
 *     //         '0.49047221',
 *     //         '123',
 *     //         '0.395763265',
 *     //         '0.866151835'
 *     //       ]
 *     //     ]
 *     //   },
 *     //   {
 *     //     count: 1,
 *     //     added: true,
 *     //     removed: false,
 *     //     value: [
 *     //       [
 *     //         '2',
 *     //         '-0.529408622',
 *     //         '0.1839882385',
 *     //         '0.663059856',
 *     //         '0.49047221',
 *     //         '0.395763265',
 *     //         '45.6',
 *     //         '0.866151835'
 *     //       ]
 *     //     ]
 *     //   },
 *     //   {
 *     //     count: 3,
 *     //     added: false,
 *     //     removed: false,
 *     //     value: [
 *     //       [
 *     //         '3',
 *     //         '-0.10320217',
 *     //         '0.475514539',
 *     //         '0.969205779',
 *     //         '0.711250309',
 *     //         '0.153847069',
 *     //         '0.410092395'
 *     //       ],
 *     //       [
 *     //         '4',
 *     //         '-0.121479865',
 *     //         '0.486179086',
 *     //         '0.481023842',
 *     //         '0.467410582',
 *     //         '0.42602231',
 *     //         '0.849701641'
 *     //       ],
 *     //       [
 *     //         '5',
 *     //         '0.757346003',
 *     //         '0.697242433',
 *     //         '0.67532802',
 *     //         '0.174644416',
 *     //         '0.045652267',
 *     //         '0.397104668'
 *     //       ]
 *     //     ]
 *     //   },
 *     //   {
 *     //     count: 1,
 *     //     added: false,
 *     //     removed: true,
 *     //     value: [
 *     //       [
 *     //         '6',
 *     //         '0.663032731',
 *     //         '0.259252779',
 *     //         '0.566177431',
 *     //         '0.679637706',
 *     //         '0.377814487',
 *     //         '0.400248119'
 *     //       ]
 *     //     ]
 *     //   },
 *     //   {
 *     //     count: 2,
 *     //     added: false,
 *     //     removed: false,
 *     //     value: [
 *     //       [
 *     //         '7',
 *     //         '0.72721374',
 *     //         '0.263793391',
 *     //         '0.167895215',
 *     //         '0.794808602',
 *     //         '0.107070584',
 *     //         '0.011822872'
 *     //       ],
 *     //       [
 *     //         '8',
 *     //         '0.247416664',
 *     //         '0.360426795',
 *     //         '0.014346373',
 *     //         '0.000469616',
 *     //         '0.4082693',
 *     //         '0.913806611'
 *     //       ]
 *     //     ]
 *     //   },
 *     //   {
 *     //     count: 1,
 *     //     added: false,
 *     //     removed: true,
 *     //     value: [
 *     //       [
 *     //         '9',
 *     //         '0.345880037',
 *     //         '0.167996664',
 *     //         '0.711054429',
 *     //         '0.363177921',
 *     //         '0.206849994',
 *     //         '0.636855344'
 *     //       ]
 *     //     ]
 *     //   },
 *     //   {
 *     //     count: 1,
 *     //     added: true,
 *     //     removed: false,
 *     //     value: [
 *     //       [
 *     //         '9',
 *     //         '0.345880037',
 *     //         '0.167996664',
 *     //         '0.711054429',
 *     //         '0.363173478',
 *     //         '0.636855344'
 *     //       ]
 *     //     ]
 *     //   },
 *     //   {
 *     //     count: 1,
 *     //     added: false,
 *     //     removed: false,
 *     //     value: [
 *     //       [
 *     //         '10',
 *     //         '0.576739457',
 *     //         '0.324665077',
 *     //         '0.973218005',
 *     //         '0.883927423',
 *     //         '0.176906125',
 *     //         '0.20087887'
 *     //       ]
 *     //     ]
 *     //   },
 *     //   {
 *     //     count: 2,
 *     //     added: false,
 *     //     removed: true,
 *     //     value: [ [ '11', '1.2' ], [ '12', '23.5' ] ]
 *     //   },
 *     //   {
 *     //     count: 2,
 *     //     added: false,
 *     //     removed: false,
 *     //     value: [
 *     //       [
 *     //         '13',
 *     //         '0.504421248',
 *     //         '0.984003751',
 *     //         '0.32549507',
 *     //         '0.987090751',
 *     //         '0.192745589',
 *     //         '0.735133561'
 *     //       ],
 *     //       [
 *     //         '14',
 *     //         '0.273214614',
 *     //         '0.083431884',
 *     //         '0.565146092',
 *     //         '0.935388666',
 *     //         '0.637675154',
 *     //         '0.523815661'
 *     //       ]
 *     //     ]
 *     //   },
 *     //   {
 *     //     count: 3,
 *     //     added: true,
 *     //     removed: false,
 *     //     value: [
 *     //       [
 *     //         'n1',
 *     //         '0.944492151',
 *     //         '0.89950443',
 *     //         '0.182709318',
 *     //         '0.892820757',
 *     //         '0.709746901',
 *     //         '0.097385354'
 *     //       ],
 *     //       [
 *     //         'n2',
 *     //         '0.769805921',
 *     //         '0.061355308',
 *     //         '0.314826137',
 *     //         '0.855857651',
 *     //         '0.653550539',
 *     //         '0.772500773'
 *     //       ],
 *     //       [
 *     //         'n3',
 *     //         '0.158739038',
 *     //         '0.085078711',
 *     //         '0.844664253',
 *     //         '0.21630142',
 *     //         '0.912931341',
 *     //         '0.735138313'
 *     //       ]
 *     //     ]
 *     //   }
 *     // ]
 *     for (let i = 0; i < r.dfs.length; i++) {
 *         let df = r.dfs[i]
 *         console.log(i, 'df', df)
 *     }
 *     // => 0 df [
 *     //   { p: '', k: 0, vo: '1', vn: '' },
 *     //   { p: '', k: 1, vo: '0.974848293', vn: '' },
 *     //   { p: '', k: 2, vo: '0.791303871', vn: '' },
 *     //   { p: '', k: 3, vo: '0.716898185', vn: '' },
 *     //   { p: '', k: 4, vo: '0.506002098', vn: '' },
 *     //   { p: '', k: 5, vo: '0.137888903', vn: '' },
 *     //   { p: '', k: 6, vo: '0.626724085', vn: '' }
 *     // ]
 *     // 1 df [
 *     //   { p: '', k: 0, vo: '2', vn: '' },
 *     //   { p: '', k: 1, vo: '-0.529408622', vn: '' },
 *     //   { p: 'modify', k: 2, vo: '0.839882385', vn: '0.1839882385' },
 *     //   { p: '', k: 3, vo: '0.663059856', vn: '' },
 *     //   { p: '', k: 4, vo: '0.49047221', vn: '' },
 *     //   { p: 'modify', k: 5, vo: '123', vn: '0.395763265' },
 *     //   { p: 'modify', k: 6, vo: '0.395763265', vn: '45.6' },
 *     //   { p: '', k: 7, vo: '0.866151835', vn: '' }
 *     // ]
 *     // 2 df [
 *     //   { p: '', k: 0, vo: '3', vn: '' },
 *     //   { p: '', k: 1, vo: '-0.10320217', vn: '' },
 *     //   { p: '', k: 2, vo: '0.475514539', vn: '' },
 *     //   { p: '', k: 3, vo: '0.969205779', vn: '' },
 *     //   { p: '', k: 4, vo: '0.711250309', vn: '' },
 *     //   { p: '', k: 5, vo: '0.153847069', vn: '' },
 *     //   { p: '', k: 6, vo: '0.410092395', vn: '' }
 *     // ]
 *     // 3 df [
 *     //   { p: '', k: 0, vo: '4', vn: '' },
 *     //   { p: '', k: 1, vo: '-0.121479865', vn: '' },
 *     //   { p: '', k: 2, vo: '0.486179086', vn: '' },
 *     //   { p: '', k: 3, vo: '0.481023842', vn: '' },
 *     //   { p: '', k: 4, vo: '0.467410582', vn: '' },
 *     //   { p: '', k: 5, vo: '0.42602231', vn: '' },
 *     //   { p: '', k: 6, vo: '0.849701641', vn: '' }
 *     // ]
 *     // 4 df [
 *     //   { p: '', k: 0, vo: '5', vn: '' },
 *     //   { p: '', k: 1, vo: '0.757346003', vn: '' },
 *     //   { p: '', k: 2, vo: '0.697242433', vn: '' },
 *     //   { p: '', k: 3, vo: '0.67532802', vn: '' },
 *     //   { p: '', k: 4, vo: '0.174644416', vn: '' },
 *     //   { p: '', k: 5, vo: '0.045652267', vn: '' },
 *     //   { p: '', k: 6, vo: '0.397104668', vn: '' }
 *     // ]
 *     // 5 df [
 *     //   { p: 'remove', k: 0, vo: '6', vn: '' },
 *     //   { p: 'remove', k: 1, vo: '0.663032731', vn: '' },
 *     //   { p: 'remove', k: 2, vo: '0.259252779', vn: '' },
 *     //   { p: 'remove', k: 3, vo: '0.566177431', vn: '' },
 *     //   { p: 'remove', k: 4, vo: '0.679637706', vn: '' },
 *     //   { p: 'remove', k: 5, vo: '0.377814487', vn: '' },
 *     //   { p: 'remove', k: 6, vo: '0.400248119', vn: '' }
 *     // ]
 *     // 6 df [
 *     //   { p: '', k: 0, vo: '7', vn: '' },
 *     //   { p: '', k: 1, vo: '0.72721374', vn: '' },
 *     //   { p: '', k: 2, vo: '0.263793391', vn: '' },
 *     //   { p: '', k: 3, vo: '0.167895215', vn: '' },
 *     //   { p: '', k: 4, vo: '0.794808602', vn: '' },
 *     //   { p: '', k: 5, vo: '0.107070584', vn: '' },
 *     //   { p: '', k: 6, vo: '0.011822872', vn: '' }
 *     // ]
 *     // 7 df [
 *     //   { p: '', k: 0, vo: '8', vn: '' },
 *     //   { p: '', k: 1, vo: '0.247416664', vn: '' },
 *     //   { p: '', k: 2, vo: '0.360426795', vn: '' },
 *     //   { p: '', k: 3, vo: '0.014346373', vn: '' },
 *     //   { p: '', k: 4, vo: '0.000469616', vn: '' },
 *     //   { p: '', k: 5, vo: '0.4082693', vn: '' },
 *     //   { p: '', k: 6, vo: '0.913806611', vn: '' }
 *     // ]
 *     // 8 df [
 *     //   { p: '', k: 0, vo: '9', vn: '' },
 *     //   { p: '', k: 1, vo: '0.345880037', vn: '' },
 *     //   { p: '', k: 2, vo: '0.167996664', vn: '' },
 *     //   { p: '', k: 3, vo: '0.711054429', vn: '' },
 *     //   { p: 'modify', k: 4, vo: '0.363177921', vn: '0.363173478' },
 *     //   { p: 'modify', k: 5, vo: '0.206849994', vn: '0.636855344' },
 *     //   { p: 'remove', k: 6, vo: '0.636855344', vn: '' }
 *     // ]
 *     // 9 df [
 *     //   { p: '', k: 0, vo: '10', vn: '' },
 *     //   { p: '', k: 1, vo: '0.576739457', vn: '' },
 *     //   { p: '', k: 2, vo: '0.324665077', vn: '' },
 *     //   { p: '', k: 3, vo: '0.973218005', vn: '' },
 *     //   { p: '', k: 4, vo: '0.883927423', vn: '' },
 *     //   { p: '', k: 5, vo: '0.176906125', vn: '' },
 *     //   { p: '', k: 6, vo: '0.20087887', vn: '' }
 *     // ]
 *     // 10 df [
 *     //   { p: 'remove', k: 0, vo: '11', vn: '' },
 *     //   { p: 'remove', k: 1, vo: '1.2', vn: '' }
 *     // ]
 *     // 11 df [
 *     //   { p: 'remove', k: 0, vo: '12', vn: '' },
 *     //   { p: 'remove', k: 1, vo: '23.5', vn: '' }
 *     // ]
 *     // 12 df [
 *     //   { p: '', k: 0, vo: '13', vn: '' },
 *     //   { p: '', k: 1, vo: '0.504421248', vn: '' },
 *     //   { p: '', k: 2, vo: '0.984003751', vn: '' },
 *     //   { p: '', k: 3, vo: '0.32549507', vn: '' },
 *     //   { p: '', k: 4, vo: '0.987090751', vn: '' },
 *     //   { p: '', k: 5, vo: '0.192745589', vn: '' },
 *     //   { p: '', k: 6, vo: '0.735133561', vn: '' }
 *     // ]
 *     // 13 df [
 *     //   { p: '', k: 0, vo: '14', vn: '' },
 *     //   { p: '', k: 1, vo: '0.273214614', vn: '' },
 *     //   { p: '', k: 2, vo: '0.083431884', vn: '' },
 *     //   { p: '', k: 3, vo: '0.565146092', vn: '' },
 *     //   { p: '', k: 4, vo: '0.935388666', vn: '' },
 *     //   { p: '', k: 5, vo: '0.637675154', vn: '' },
 *     //   { p: '', k: 6, vo: '0.523815661', vn: '' }
 *     // ]
 *     // 14 df [
 *     //   { p: 'add', k: 0, vo: 'n1', vn: '' },
 *     //   { p: 'add', k: 1, vo: '0.944492151', vn: '' },
 *     //   { p: 'add', k: 2, vo: '0.89950443', vn: '' },
 *     //   { p: 'add', k: 3, vo: '0.182709318', vn: '' },
 *     //   { p: 'add', k: 4, vo: '0.892820757', vn: '' },
 *     //   { p: 'add', k: 5, vo: '0.709746901', vn: '' },
 *     //   { p: 'add', k: 6, vo: '0.097385354', vn: '' }
 *     // ]
 *     // 15 df [
 *     //   { p: 'add', k: 0, vo: 'n2', vn: '' },
 *     //   { p: 'add', k: 1, vo: '0.769805921', vn: '' },
 *     //   { p: 'add', k: 2, vo: '0.061355308', vn: '' },
 *     //   { p: 'add', k: 3, vo: '0.314826137', vn: '' },
 *     //   { p: 'add', k: 4, vo: '0.855857651', vn: '' },
 *     //   { p: 'add', k: 5, vo: '0.653550539', vn: '' },
 *     //   { p: 'add', k: 6, vo: '0.772500773', vn: '' }
 *     // ]
 *     // 16 df [
 *     //   { p: 'add', k: 0, vo: 'n3', vn: '' },
 *     //   { p: 'add', k: 1, vo: '0.158739038', vn: '' },
 *     //   { p: 'add', k: 2, vo: '0.085078711', vn: '' },
 *     //   { p: 'add', k: 3, vo: '0.844664253', vn: '' },
 *     //   { p: 'add', k: 4, vo: '0.21630142', vn: '' },
 *     //   { p: 'add', k: 5, vo: '0.912931341', vn: '' },
 *     //   { p: 'add', k: 6, vo: '0.735138313', vn: '' }
 *     // ]
 * }
 *
 */
function arrDiff(arrOld, arrNew, opt = {}) {

    //check, arrOld與arrNew為必須參數(陣列, []合法), 非陣列throw(訊息不帶值)
    if (!isarr(arrOld)) {
        throw new Error('invalid arrOld: must be an array')
    }
    if (!isarr(arrNew)) {
        throw new Error('invalid arrNew: must be an array')
    }
    if (size(arrOld) === 0 && size(arrNew) === 0) {
        return {
            diff: [],
            dfs: [],
        }
    }

    //mode
    let mode = get(opt, 'mode', '')
    if (mode !== 'array' && mode !== 'matrix') {
        mode = 'array'
    }

    let r
    if (mode === 'array') {
        r = arrDiff1D(arrOld, arrNew)
    }
    else if (mode === 'matrix') {
        r = arrDiff2D(arrOld, arrNew)
    }

    return r
}


export default arrDiff
