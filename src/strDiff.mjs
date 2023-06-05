import * as Diff from 'diff'
import get from 'lodash/get'
import each from 'lodash/each'
import split from 'lodash/split'
import drop from 'lodash/drop'
import dropRight from 'lodash/dropRight'
import size from 'lodash/size'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import strleft from './strleft.mjs'
import strdelleft from './strdelleft.mjs'
// console.log('Diff', Diff)


/**
 * 比對新舊文字差異處
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strDiff.test.mjs Github}
 * @memberOf wsemi
 * @param {String} strOld 輸入原始文字字串
 * @param {String} strNew 輸入更新文字字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.titleOld='title'] 輸入原始文字之標題字串，預設'title'
 * @param {String} [opt.titleNew='title'] 輸入更新文字之標題字串，預設'title'
 * @param {Boolean} [opt.eliminateEndLine=false] 輸入是否清除diff最後解析結果布林值，通常為處理數據時因各列有自動添加換行符號，導致diff會多出額外比對結果故須清除。預設false
 * @returns {Object} 回傳比對結果物件，包含diff與dfs鍵值，diff為比對原始結果字串，dfs為依照各列比對結果陣列
 * @example
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
 *
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
 *
 * let r = strDiff(tab1, tab2)
 * console.log(r)
 * // => {
 * //   diff: 'Index: title\n' +
 * //     '===================================================================\n' +
 * //     '--- title\n' +
 * //     '+++ title\n' +
 * //     '@@ -1,15 +1,16 @@\n' +
 * //     ' 1|0.974848293|0.791303871|0.716898185|0.506002098|0.137888903|0.626724085\n' +
 * //     '-2|-0.529408622|0.839882385|0.663059856|0.49047221|0.395763265|0.866151835\n' +
 * //     '+2|-0.529408622|a0.839882385|0.663059856|0.49047221|0.395763265|0.866151835\n' +
 * //     ' 3|-0.10320217|0.475514539|0.969205779|0.711250309|0.153847069|0.410092395\n' +
 * //     ' 4|-0.121479865|0.486179086|0.481023842|0.467410582|0.42602231|0.849701641\n' +
 * //     ' 5|0.757346003|0.697242433|0.67532802|0.174644416|0.045652267|0.397104668\n' +
 * //     '-6|0.663032731|0.259252779|0.566177431|0.679637706|0.377814487|0.400248119\n' +
 * //     ' 7|0.72721374|0.263793391|0.167895215|0.794808602|0.107070584|0.011822872\n' +
 * //     ' 8|0.247416664|0.360426795|0.014346373|0.000469616|0.4082693|0.913806611\n' +
 * //     '-9|0.345880037|0.167996664|0.711054429|0.363177921|0.206849994|0.636855344\n' +
 * //     '+9|0.345880037|0.167996664|0.711054429|0.363173478|0.636855344\n' +
 * //     ' 10|0.576739457|0.324665077|0.973218005|0.883927423|0.176906125|0.20087887\n' +
 * //     '-11|a1\n' +
 * //     '-12|a2\n' +
 * //     ' 13|0.504421248|0.984003751|0.32549507|0.987090751|0.192745589|0.735133561\n' +
 * //     ' 14|0.273214614|0.083431884|0.565146092|0.935388666|0.637675154|0.523815661\n' +
 * //     '+n1|0.944492151|0.89950443|0.182709318|0.892820757|0.709746901|0.097385354\n' +
 * //     '+n2|0.769805921|0.061355308|0.314826137|0.855857651|0.653550539|0.772500773\n' +
 * //     '+n3|0.158739038|0.085078711|0.844664253|0.21630142|0.912931341|0.735138313\n' +
 * //     ' \n' +
 * //     '+\n',
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
 * //     { p: 'add', vo: '', vn: '' },
 * //     { p: '', vo: '', vn: '' }
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

    //titleOld
    let titleOld = get(opt, 'titleOld', 'title')

    //titleNew
    let titleNew = get(opt, 'titleNew', 'title')

    //eliminateEndLine
    let eliminateEndLine = get(opt, 'eliminateEndLine')
    if (!isbol(eliminateEndLine)) {
        eliminateEndLine = false
    }

    //createTwoFilesPatch
    let diff = Diff.createTwoFilesPatch(titleOld, titleNew, strOld, strNew)
    // console.log('diff', diff)

    let s = split(diff, '\n')
    s = drop(s, 5)
    // console.log('s', s)
    if (true) {
        let t = '\\ No newline at end of file'
        let _s = []
        each(s, (v) => {
            if (v === t) {
                return false //跳出
            }
            _s.push(v)
        })
        s = _s
    }
    if (eliminateEndLine) {
        s = dropRight(s, 1)
    }
    // console.log('s', s)

    let n = size(s)
    let dfs = []
    let k = -1
    while (true) {
        k++
        if (k > n - 1) {
            break
        }
        let k0 = k
        let k1 = k + 1
        let v0 = s[k0]
        let cl0 = strleft(v0, 1)
        v0 = strdelleft(v0, 1)
        let v1 = ''
        let cl1 = ''
        if (k < n - 1) {
            v1 = s[k1]
            cl1 = strleft(v1, 1)
            v1 = strdelleft(v1, 1)
        }
        let p = ''
        let vo = v0
        let vn = ''
        if (cl0 === '-' && cl1 === '+') {
            p = 'modify'
            vn = v1
            k++ //有修改時為使用兩列數據
        }
        else if ((cl0 === '-' && cl1 === '-') || (cl0 === '-' && cl1 === ' ') || (cl0 === '-' && cl1 === '')) {
            p = 'remove'
        }
        else if ((cl0 === '+' && cl1 === '+') || (cl0 === '+' && cl1 === ' ') || (cl0 === '+' && cl1 === '')) {
            p = 'add'
        }
        dfs.push({
            p,
            vo,
            vn,
        })
    }
    // console.log('dfs', dfs)

    return {
        diff,
        dfs,
    }
}


export default strDiff