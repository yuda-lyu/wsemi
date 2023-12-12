import * as Diff from 'diff'
import get from 'lodash-es/get'
import split from 'lodash-es/split'
import take from 'lodash-es/take'
import size from 'lodash-es/size'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
// console.log('Diff', Diff)


/**
 * 比對新舊文字差異處
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strDiff.test.mjs Github}
 * @memberOf wsemi
 * @param {String} strOld 輸入原始文字字串
 * @param {String} strNew 輸入更新文字字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.eliminateEndLine=false] 輸入是否清除diff最後解析結果布林值，通常為處理數據時因各列有自動添加換行符號，導致diff會多出額外比對結果故須清除。預設false
 * @returns {Object} 回傳比對結果物件，包含diff與dfs鍵值，diff為比對原始結果字串，dfs為依照各列比對結果陣列
 * @example
 *
 * let r
 *
 * r = strDiff('test中文', '')
 * console.log(r)
 * // => {
 * //   diff: [ { count: 1, added: undefined, removed: true, value: 'test中文' } ],
 * //   dfs: [ { p: 'remove', vo: 'test中文', vn: '' } ]
 * // }
 *
 * r = strDiff('test中文1\ntest中文2', '')
 * console.log(r)
 * // => {
 * //   diff: [
 * //     {
 * //       count: 2,
 * //       added: undefined,
 * //       removed: true,
 * //       value: 'test中文1\ntest中文2'
 * //     }
 * //   ],
 * //   dfs: [
 * //     { p: 'remove', vo: 'test中文1', vn: '' },
 * //     { p: 'remove', vo: 'test中文2', vn: '' }
 * //   ]
 * // }
 *
 * r = strDiff('', 'test中文')
 * console.log(r)
 * // => {
 * //   diff: [ { count: 1, added: true, removed: undefined, value: 'test中文' } ],
 * //   dfs: [ { p: 'add', vo: 'test中文', vn: '' } ]
 * // }
 *
 * r = strDiff('', 'test中文1\ntest中文2')
 * console.log(r)
 * // => {
 * //   diff: [
 * //     {
 * //       count: 2,
 * //       added: true,
 * //       removed: undefined,
 * //       value: 'test中文1\ntest中文2'
 * //     }
 * //   ],
 * //   dfs: [
 * //     { p: 'add', vo: 'test中文1', vn: '' },
 * //     { p: 'add', vo: 'test中文2', vn: '' }
 * //   ]
 * // }
 *
 * let tab1 = `1|0.974848293|0.791303871|0.716898185|0.506002098|0.137888903|0.626724085
 * 2|-0.529408622|0.839882385|0.663059856|0.49047221|0.395763265|0.866151835
 * 3|-0.10320217|0.475514539|0.969205779|0.711250309|0.153847069|0.410092395
 * 4|-0.121479865|0.486179086|0.481023842|0.467410582|0.42602231|0.849701641
 * 5|0.757346003|0.697242433|0.67532802|0.174644416|0.045652267|0.397104668
 * 6|0.663032731|0.259252779|0.566177431|0.679637706|0.377814487|0.400248119
 * 7|0.72721374|0.263793391|0.167895215|0.794808602|0.107070584|0.011822872
 * 8|0.247416664|0.360426795|0.014346373|0.000469616|0.4082693|0.913806611
 * 9|0.345880037|0.167996664|0.711054429|0.363177921|0.206849994|0.636855344
 * 10|0.576739457|0.324665077|0.973218005|0.883927423|0.176906125|0.20087887
 * 11|a1
 * 12|a2
 * 13|0.504421248|0.984003751|0.32549507|0.987090751|0.192745589|0.735133561
 * 14|0.273214614|0.083431884|0.565146092|0.935388666|0.637675154|0.523815661
 *
 * `
 * let tab2 = `1|0.974848293|0.791303871|0.716898185|0.506002098|0.137888903|0.626724085
 * 2|-0.529408622|a0.839882385|0.663059856|0.49047221|0.395763265|0.866151835
 * 3|-0.10320217|0.475514539|0.969205779|0.711250309|0.153847069|0.410092395
 * 4|-0.121479865|0.486179086|0.481023842|0.467410582|0.42602231|0.849701641
 * 5|0.757346003|0.697242433|0.67532802|0.174644416|0.045652267|0.397104668
 * 7|0.72721374|0.263793391|0.167895215|0.794808602|0.107070584|0.011822872
 * 8|0.247416664|0.360426795|0.014346373|0.000469616|0.4082693|0.913806611
 * 9|0.345880037|0.167996664|0.711054429|0.363173478|0.636855344
 * 10|0.576739457|0.324665077|0.973218005|0.883927423|0.176906125|0.20087887
 * 13|0.504421248|0.984003751|0.32549507|0.987090751|0.192745589|0.735133561
 * 14|0.273214614|0.083431884|0.565146092|0.935388666|0.637675154|0.523815661
 * n1|0.944492151|0.89950443|0.182709318|0.892820757|0.709746901|0.097385354
 * n2|0.769805921|0.061355308|0.314826137|0.855857651|0.653550539|0.772500773
 * n3|0.158739038|0.085078711|0.844664253|0.21630142|0.912931341|0.735138313
 *
 *
 * `
 * r = strDiff(tab1, tab2)
 * console.log(r)
 * // => {
 * //   diff: [
 * //     {
 * //       count: 1,
 * //       value: '1|0.974848293|0.791303871|0.716898185|0.506002098|0.137888903|0.626724085\n'
 * //     },
 * //     {
 * //       count: 1,
 * //       added: undefined,
 * //       removed: true,
 * //       value: '2|-0.529408622|0.839882385|0.663059856|0.49047221|0.395763265|0.866151835\n'
 * //     },
 * //     {
 * //       count: 1,
 * //       added: true,
 * //       removed: undefined,
 * //       value: '2|-0.529408622|a0.839882385|0.663059856|0.49047221|0.395763265|0.866151835\n'
 * //     },
 * //     {
 * //       count: 3,
 * //       value: '3|-0.10320217|0.475514539|0.969205779|0.711250309|0.153847069|0.410092395\n' +
 * //         '4|-0.121479865|0.486179086|0.481023842|0.467410582|0.42602231|0.849701641\n' +
 * //         '5|0.757346003|0.697242433|0.67532802|0.174644416|0.045652267|0.397104668\n'
 * //     },
 * //     {
 * //       count: 1,
 * //       added: undefined,
 * //       removed: true,
 * //       value: '6|0.663032731|0.259252779|0.566177431|0.679637706|0.377814487|0.400248119\n'
 * //     },
 * //     {
 * //       count: 2,
 * //       value: '7|0.72721374|0.263793391|0.167895215|0.794808602|0.107070584|0.011822872\n' +
 * //         '8|0.247416664|0.360426795|0.014346373|0.000469616|0.4082693|0.913806611\n'
 * //     },
 * //     {
 * //       count: 1,
 * //       added: undefined,
 * //       removed: true,
 * //       value: '9|0.345880037|0.167996664|0.711054429|0.363177921|0.206849994|0.636855344\n'
 * //     },
 * //     {
 * //       count: 1,
 * //       added: true,
 * //       removed: undefined,
 * //       value: '9|0.345880037|0.167996664|0.711054429|0.363173478|0.636855344\n'
 * //     },
 * //     {
 * //       count: 1,
 * //       value: '10|0.576739457|0.324665077|0.973218005|0.883927423|0.176906125|0.20087887\n'
 * //     },
 * //     {
 * //       count: 2,
 * //       added: undefined,
 * //       removed: true,
 * //       value: '11|a1\n12|a2\n'
 * //     },
 * //     {
 * //       count: 2,
 * //       value: '13|0.504421248|0.984003751|0.32549507|0.987090751|0.192745589|0.735133561\n' +
 * //         '14|0.273214614|0.083431884|0.565146092|0.935388666|0.637675154|0.523815661\n'
 * //     },
 * //     {
 * //       count: 3,
 * //       added: true,
 * //       removed: undefined,
 * //       value: 'n1|0.944492151|0.89950443|0.182709318|0.892820757|0.709746901|0.097385354\n' +
 * //         'n2|0.769805921|0.061355308|0.314826137|0.855857651|0.653550539|0.772500773\n' +
 * //         'n3|0.158739038|0.085078711|0.844664253|0.21630142|0.912931341|0.735138313\n'
 * //     },
 * //     { count: 1, value: '\n' },
 * //     { count: 1, added: true, removed: undefined, value: '\n' }
 * //   ],
 * //   dfs: [
 * //     {
 * //       p: '',
 * //       vo: '1|0.974848293|0.791303871|0.716898185|0.506002098|0.137888903|0.626724085',
 * //       vn: ''
 * //     },
 * //     {
 * //       p: 'modify',
 * //       vo: '2|-0.529408622|0.839882385|0.663059856|0.49047221|0.395763265|0.866151835',
 * //       vn: '2|-0.529408622|a0.839882385|0.663059856|0.49047221|0.395763265|0.866151835'
 * //     },
 * //     {
 * //       p: '',
 * //       vo: '3|-0.10320217|0.475514539|0.969205779|0.711250309|0.153847069|0.410092395',
 * //       vn: ''
 * //     },
 * //     {
 * //       p: '',
 * //       vo: '4|-0.121479865|0.486179086|0.481023842|0.467410582|0.42602231|0.849701641',
 * //       vn: ''
 * //     },
 * //     {
 * //       p: '',
 * //       vo: '5|0.757346003|0.697242433|0.67532802|0.174644416|0.045652267|0.397104668',
 * //       vn: ''
 * //     },
 * //     {
 * //       p: 'remove',
 * //       vo: '6|0.663032731|0.259252779|0.566177431|0.679637706|0.377814487|0.400248119',
 * //       vn: ''
 * //     },
 * //     {
 * //       p: '',
 * //       vo: '7|0.72721374|0.263793391|0.167895215|0.794808602|0.107070584|0.011822872',
 * //       vn: ''
 * //     },
 * //     {
 * //       p: '',
 * //       vo: '8|0.247416664|0.360426795|0.014346373|0.000469616|0.4082693|0.913806611',
 * //       vn: ''
 * //     },
 * //     {
 * //       p: 'modify',
 * //       vo: '9|0.345880037|0.167996664|0.711054429|0.363177921|0.206849994|0.636855344',
 * //       vn: '9|0.345880037|0.167996664|0.711054429|0.363173478|0.636855344'
 * //     },
 * //     {
 * //       p: '',
 * //       vo: '10|0.576739457|0.324665077|0.973218005|0.883927423|0.176906125|0.20087887',
 * //       vn: ''
 * //     },
 * //     { p: 'remove', vo: '11|a1', vn: '' },
 * //     { p: 'remove', vo: '12|a2', vn: '' },
 * //     {
 * //       p: '',
 * //       vo: '13|0.504421248|0.984003751|0.32549507|0.987090751|0.192745589|0.735133561',
 * //       vn: ''
 * //     },
 * //     {
 * //       p: '',
 * //       vo: '14|0.273214614|0.083431884|0.565146092|0.935388666|0.637675154|0.523815661',
 * //       vn: ''
 * //     },
 * //     {
 * //       p: 'add',
 * //       vo: 'n1|0.944492151|0.89950443|0.182709318|0.892820757|0.709746901|0.097385354',
 * //       vn: ''
 * //     },
 * //     {
 * //       p: 'add',
 * //       vo: 'n2|0.769805921|0.061355308|0.314826137|0.855857651|0.653550539|0.772500773',
 * //       vn: ''
 * //     },
 * //     {
 * //       p: 'add',
 * //       vo: 'n3|0.158739038|0.085078711|0.844664253|0.21630142|0.912931341|0.735138313',
 * //       vn: ''
 * //     },
 * //     { p: '', vo: '', vn: '' },
 * //     { p: 'add', vo: '', vn: '' }
 * //   ]
 * // }
 *
 */
function strDiff(strOld, strNew, opt = {}) {

    //check
    if (!isstr(strOld)) {
        return {}
    }
    if (!isstr(strNew)) {
        return {}
    }
    if (strOld === '' && strNew === '') {
        return {}
    }

    //eliminateEndLine
    let eliminateEndLine = get(opt, 'eliminateEndLine')
    if (!isbol(eliminateEndLine)) {
        eliminateEndLine = false
    }

    // console.log('strDiff strOld', strOld)
    // console.log('strDiff strNew', strNew)

    //diffLines
    let diff = Diff.diffLines(strOld, strNew)
    // console.log('diff', diff)

    //k
    let k

    //dfsOld, dfsNew
    let n = size(diff)
    let dfsOld = []
    let dfsNew = []
    k = -1
    while (true) {
        k++
        if (k > n - 1) {
            break
        }

        //s
        let s = diff[k]

        //count, removed, added
        let count = get(s, 'count', 0)
        let removed = get(s, 'removed', false)
        let added = get(s, 'added', false)

        //vs
        let v = get(s, 'value', '')
        let vs = split(v, '\n')
        vs = take(vs, count)

        //each
        for (let i = 1; i <= count; i++) {
            let v = vs[i - 1]

            if (!removed && !added) { //不變line
                dfsOld.push({
                    p: '',
                    v,
                })
                dfsNew.push({
                    p: '',
                    v,
                })
            }
            else if (removed && !added) { //有刪除line
                dfsOld.push({
                    p: 'remove',
                    v,
                })
                dfsNew.push({
                    p: 'empty',
                    v: '',
                })
            }
            else if (!removed && added) { //有新增line
                dfsOld.push({
                    p: 'empty',
                    v: '',
                })
                dfsNew.push({
                    p: 'add',
                    v,
                })
            }

        }
    }
    // console.log('dfsOld(分開彙整)', dfsOld)
    // console.log('dfsNew(分開彙整)', dfsNew)
    // each(dfsOld, (_, k) => {
    //     let vOld = get(dfsOld, k)
    //     let vNew = get(dfsNew, k)
    //     console.log('分開彙整', k, vOld, vNew)
    // })

    //nOld, nNew
    let nOld = size(dfsOld)
    // let nNew = size(dfsNew)

    //merge dfsOld, dfsNew
    let m = nOld //Math.max(nOld, nNew)
    k = -1
    while (true) {
        k++
        if (k > m - 1) {
            break
        }

        //v0
        let df0Old = get(dfsOld, k, null)
        let df0New = get(dfsNew, k, null)
        let p0Old = get(df0Old, 'p', '')
        let p0New = get(df0New, 'p', '')
        // let v0Old = get(df0Old, 'v', '')
        // let v0New = get(df0New, 'v', '')

        //偵測modify
        if (p0Old === 'remove' && p0New === 'empty') {

            let icOld = 0 //old出現連續可合併列數
            let icOldStart = k
            let icOldEnd = -1
            for (let j = k; j <= m - 1; j++) {
                let dfOld = get(dfsOld, j, null)
                let dfNew = get(dfsNew, j, null)
                let pOld = get(dfOld, 'p', '')
                let pNew = get(dfNew, 'p', '')
                if (pOld === 'remove' && pNew === 'empty') {
                    icOld++
                    icOldEnd = j
                }
                else {
                    break
                }
            }
            if (icOld <= 0) {
                continue
            }
            // console.log(k, 'icOld', icOld, 'from', icOldStart, `to`, icOldEnd)

            let icNew = 0 //new出現連續可合併列數
            let icNewState = false
            let icNewStart = -1
            let icNewEnd = -1
            for (let j = k; j <= icOldEnd + icOld; j++) {
                let dfOld = get(dfsOld, j, null)
                let dfNew = get(dfsNew, j, null)
                let pOld = get(dfOld, 'p', '')
                let pNew = get(dfNew, 'p', '')
                if (pOld === 'empty' && pNew === 'add') {
                    if (!icNewState) {
                        icNewStart = j
                    }
                    icNewState = true
                    icNew++
                    if (icNewState) {
                        icNewEnd = j
                    }
                }
                else if (icNewState) {
                    break
                }
            }
            if (icNew <= 0) {
                continue
            }
            // console.log(k, 'icNew', icNew, 'from', icNewStart, `to`, icNewEnd)

            //ic
            let ic = Math.min(icOld, icNew)
            // console.log(k, 'ic', ic)

            //combine
            if (ic >= 1) {
                for (let j = 0; j <= ic - 1; j++) {
                    let jOld = icOldStart + j
                    let jNew = icNewStart + j
                    dfsOld[jOld] = {
                        p: 'modify',
                        vo: get(dfsOld, `${jOld}.v`, ''),
                        vn: get(dfsNew, `${jNew}.v`, ''),
                        // b: true,
                    }
                    dfsNew[jOld] = null
                    dfsOld[jNew] = null
                    dfsNew[jNew] = null
                }
                k += ic + 1 //跳過ic行繼續偵測
            }

        }
        else {
            // dfsOld[k].b = true
            // dfsNew[k].b = true
        }

    }
    // console.log('dfsOld(偵測modify)', dfsOld)
    // console.log('dfsNew(偵測modify)', dfsNew)

    //dfs
    let dfs = []
    k = -1
    while (true) {
        k++
        if (k > m - 1) {
            break
        }

        let dfOld = get(dfsOld, k, null)
        let dfNew = get(dfsNew, k, null)
        let pOld = get(dfOld, 'p', '')
        let pNew = get(dfNew, 'p', '')
        let vOld = get(dfOld, 'v', '')
        let vNew = get(dfNew, 'v', '')

        //check
        if (dfOld === null && dfNew === null) {
            continue
        }

        let p = ''
        let vo = vOld
        let vn = ''
        if (pOld === 'modify') {
            p = 'modify'
            vo = dfOld.vo
            vn = dfOld.vn
        }
        else if (pOld === 'remove' && pNew === 'empty') {
            p = 'remove'
            vo = vOld
            vn = ''
        }
        else if (pOld === 'empty' && pNew === 'add') {
            p = 'add'
            vo = vNew
            vn = ''
        }
        dfs.push({
            p,
            vo,
            vn,
            // _dfOld: dfOld,
            // _dfNew: dfNew,
        })
    }
    // console.log('dfs', dfs)

    return {
        diff,
        dfs,
    }
}


export default strDiff

