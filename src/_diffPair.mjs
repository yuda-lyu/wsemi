import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'


//本檔為內部使用, 不由index匯出


//vOf, 取項目之值, 無項目或值為undefined回傳''(同原strDiff之get(…, 'v', ''))
function vOf(df) {
    if (df === null || df === undefined) {
        return ''
    }
    let v = df.v
    return v === undefined ? '' : v
}


/**
 * 依jsdiff之比對結果整理逐項差異, 連續之刪除項與其後之新增項依序配對為modify(單一擁有者, 供strDiff之逐行與arrDiff之逐元素、逐列、逐格共用; 2026-11-15 ws430c自strDiff抽出, 演算法不變)
 *
 * 配對: 遇連續icOld個刪除項時, 於其後至多icOld項內找第一段連續之新增項(icNew個), 前min(icOld, icNew)個刪除項與新增項依序配對為modify(vo為刪除項、vn為新增項), 其餘維持remove或add
 * 輸出: 依合併序列輸出{ p, vo, vn }, p為''(不變)、'remove'、'add'、'modify'; 不變與刪除者vo為該項、add者vo為新增項, 非modify者vn為''
 *
 * @param {Array} chunks 輸入比對結果陣列, 各元素為{ removed, added, count, items }, items為該段之項目陣列(不變、刪除或新增), count為項目數
 * @returns {Array} 回傳逐項差異陣列[{ p, vo, vn }]
 */
function _diffPair(chunks) {

    //k
    let k

    //dfsOld, dfsNew
    let n = size(chunks)
    let dfsOld = []
    let dfsNew = []
    k = -1
    while (true) {
        k++
        if (k > n - 1) {
            break
        }

        //s
        let s = chunks[k]

        //removed, added
        let removed = get(s, 'removed', false)
        let added = get(s, 'added', false)

        //count, vs
        let count = get(s, 'count', 0)
        let vs = s.items

        //each
        for (let i = 1; i <= count; i++) {
            let v = vs[i - 1]

            if (!removed && !added) { //不變
                dfsOld.push({
                    p: '',
                    v,
                })
                dfsNew.push({
                    p: '',
                    v,
                })
            }
            else if (removed && !added) { //刪除
                dfsOld.push({
                    p: 'remove',
                    v,
                })
                dfsNew.push({
                    p: 'empty',
                    v: '',
                })
            }
            else if (!removed && added) { //新增
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

    //nOld
    let nOld = size(dfsOld)

    //merge dfsOld, dfsNew
    let m = nOld
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

        //偵測modify
        if (p0Old === 'remove' && p0New === 'empty') {

            let icOld = 0 //old出現連續可合併項數
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

            let icNew = 0 //new出現連續可合併項數
            let icNewState = false
            let icNewStart = -1
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
                }
                else if (icNewState) {
                    break
                }
            }
            if (icNew <= 0) {
                continue
            }

            //ic
            let ic = Math.min(icOld, icNew)

            //combine
            if (ic >= 1) {
                for (let j = 0; j <= ic - 1; j++) {
                    let jOld = icOldStart + j
                    let jNew = icNewStart + j
                    dfsOld[jOld] = {
                        p: 'modify',
                        vo: vOf(dfsOld[jOld]),
                        vn: vOf(dfsNew[jNew]),
                    }
                    dfsNew[jOld] = null
                    dfsOld[jNew] = null
                    dfsNew[jNew] = null
                }
                k += ic + 1 //跳過ic項繼續偵測
            }

        }

    }

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

        //check
        if (dfOld === null && dfNew === null) {
            continue
        }

        let vOld = vOf(dfOld)
        let vNew = vOf(dfNew)

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
        })
    }

    return dfs
}


export default _diffPair
