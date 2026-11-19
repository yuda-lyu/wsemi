import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import join from 'lodash-es/join.js'
import isfun from './isfun.mjs'
import genPm from './genPm.mjs'
import pmSeries from './pmSeries.mjs'
import waitFun from './waitFun.mjs'
import strright from './strright.mjs'
import delay from './delay.mjs'


let _paths = {}
let _pathItems = {}


//isPlainObj, 一般物件(O1): 原型為Object.prototype或null(跨realm之Object.prototype其原型亦為null), 其餘(陣列、類別實例、函數、null)為false
function isPlainObj(v) {
    if (v === null || typeof v !== 'object') {
        return false
    }
    let p = Object.getPrototypeOf(v)
    return p === null || Object.getPrototypeOf(p) === null
}


//readPathItem, 讀取並驗證單一資源項目(字串或物件), 回傳{ item }或{ err }; item為新建之{ path, type, func }(不改寫呼叫端之輸入), 每個屬性只讀一次, 讀取拋錯(存取器、已撤銷之Proxy)視為無效; 訊息為固定詞彙(只含名稱與種類描述, 不含輸入值)
//nm為名稱(如'pathItems[2]'、'pathItems'), desc為該項目本身無效時之種類描述
function readPathItem(v, nm, desc) {
    try {

        //字串: 非空字串(S1)即資源路徑
        if (typeof v === 'string') {
            if (v.length === 0) {
                return { err: `invalid ${nm}: must be ${desc}` }
            }
            v = { path: v }
        }
        else if (!isPlainObj(v)) {
            return { err: `invalid ${nm}: must be ${desc}` }
        }

        //一次讀取各屬性(快照)
        let path = v.path
        let type = v.type
        let func = v.func

        //path, 必須且為非空字串(S1)
        if (typeof path !== 'string' || path.length === 0) {
            return { err: `invalid ${nm}.path: must be a non-empty string` }
        }

        //type, 選填: 只有undefined、null、空字串視為未給, 改依副檔名推斷; 其餘值(含false、0、NaN等假值)給了則須為'js'或'css'(S3, 區分大小寫), 明示之type優先於副檔名
        if (type === undefined || type === null || type === '') {
            if (strright(path, 3) === '.js') {
                type = 'js'
            }
            else if (strright(path, 4) === '.css') {
                type = 'css'
            }
            else {
                return { err: `invalid ${nm}.path: must be a path ending with '.js' or '.css' when type is not given` }
            }
        }
        else if (type !== 'js' && type !== 'css') {
            return { err: `invalid ${nm}.type: must be one of 'js', 'css'` }
        }

        //func, 選填(僅js用): 非函數視為未給(K3)
        if (!isfun(func)) {
            func = undefined
        }

        return { item: { path, type, func } }
    }
    catch (err) {
        return { err: `invalid ${nm}: must be ${desc}` }
    }
}


//readPathItems, 於進入時一次讀取並驗證全部資源項目(先於任何載入與狀態登記), 回傳{ items }或{ err }
function readPathItems(pathItems) {
    let items = []
    try {
        let isArr = Array.isArray(pathItems)
        if (!isArr) {
            let r = readPathItem(pathItems, 'pathItems', 'a non-empty string, an object or an array of them')
            if (r.err) {
                return { err: r.err }
            }
            items.push(r.item)
            return { items }
        }
        let n = pathItems.length
        for (let i = 0; i < n; i++) {
            let v = null
            try {
                v = pathItems[i]
            }
            catch (err) {
                return { err: `invalid pathItems[${i}]: must be a non-empty string or an object` }
            }
            let r = readPathItem(v, `pathItems[${i}]`, 'a non-empty string or an object')
            if (r.err) {
                return { err: r.err }
            }
            items.push(r.item)
        }
        return { items }
    }
    catch (err) {
        return { err: 'invalid pathItems: must be a non-empty string, an object or an array of them' }
    }
}


function importResource({ tagName, path, attributes = {}, func }) {

    //pm
    let pm = genPm()

    //check
    if (_paths[path] === 'done') {
        pm.resolve('loaded')
        return pm
    }
    else if (_paths[path]) {
        //載入中, 共用首位之載入結果(與其同成敗), 不輪詢
        _paths[path]
            .then(() => {
                pm.resolve('loaded')
            }, (err) => {
                pm.reject(err)
            })
        return pm
    }

    //loading, 記錄載入中之Promise供後到者共用
    _paths[path] = pm

    //fail, 失敗時清除標記使之後之呼叫可重新載入, 並reject(載入中之後到者一併reject)
    let fail = (err) => {
        delete _paths[path]
        pm.reject(err)
    }

    //ele attrs
    let ele = document.createElement(tagName)
    each(attributes, (v, k) => {
        ele.setAttribute(k, v)
    })

    //ele type
    if (attributes.rel && attributes.rel === 'stylesheet') {
        ele.setAttribute('href', path)
        setTimeout(() => {

            //resolve
            pm.resolve(ele)

            //done
            _paths[path] = 'done'

        }, 1)
    }
    else {
        ele.src = path
        ele.addEventListener('load', () => {
            let wf
            //進入後func才被撤銷者(函數Proxy, isfun對其回false而不拋錯)視為未給(K3), 該資源照常完成, 不得於事件回呼內外拋而使Promise懸置、_paths卡在載入中
            if (isfun(func)) {
                wf = waitFun(func)
            }
            else {
                wf = genPm()
                wf.resolve()
            }
            wf
                .then(() => {
                    return delay(500) //無縫載入頁面會無法更新, 強制delay 0.5s使頁面可更新
                })
                .then(function() {

                    //resolve
                    pm.resolve(ele)

                    //done
                    _paths[path] = 'done'

                })
                .catch((err) => {

                    //func拋錯、其Promise被reject或超過嘗試次數: 視為載入失敗, 不得懸置
                    fail(err)

                })
        })
        ele.addEventListener('error', () => {

            //reject, 清除標記使之後可重新載入
            fail(ele)

        })
    }

    //appendChild
    let head = document.getElementsByTagName('head')[0]
    head.appendChild(ele)

    return pm
}


/**
 * 前端動態引入資源如Javascript或CSS檔案
 *
 * 同一路徑或同一組路徑載入中之呼叫，與首位共用其載入結果(同成敗)；載入失敗(script之error事件、pathItem.func拋錯或其Promise被reject、等待func成立逾次)時reject並清除標記，之後之呼叫重新載入；CSS(link)不等待其載入事件，加入後即視為完成
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/importResources.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列，必須參數。字串為資源路徑(非空字串)；物件(一般物件)之欄位：path為資源路徑(必須，非空字串)，type為'js'或'css'(選填，區分大小寫，明示之type優先於副檔名，如{ path: 'x.js', type: 'css' }以link載入；只有未給、null、空字串視為未給而依path之副檔名.js、.css推斷，推斷不出者無效；其餘非'js'與'css'之值皆無效，含false、0、NaN等假值)，func為僅js用之函數(選填，載入後等待其回傳true才視為完成，非函數視為未給；進入後才被撤銷之函數Proxy於載入事件內亦視為未給，該資源照常完成)。任一項目無效(含非字串非物件、空字串、path非空字串、type非'js'與'css'、無type而副檔名非.js與.css)時，回傳之Promise以固定字串reject(如'invalid pathItems[1].path: must be a non-empty string'、'invalid pathItems[0].type: must be one of 'js', 'css''、'invalid pathItems[1].path: must be a path ending with '.js' or '.css' when type is not given'，不含輸入值)，先於任何資源之載入與標記登記，故其前之有效項目亦不載入；空陣列不載入任何資源；不改寫呼叫端傳入之陣列或物件(內部以副本處理)
 * @returns {Promise} 回傳Promise，resolve回傳注入成功的HtmlElement陣列(已載入完成或與載入中者共用時為'loaded')，reject回傳輸入無效之固定字串、載入失敗之script元素(error事件)、func之錯誤或錯誤訊息
 * @example
 * //need test in browser
 *
 * let pathItems
 *
 * pathItems = [
 *     'https://cdn.jsdelivr.net/npm/ag-grid-community@22.0.0/dist/ag-grid-community.noStyle.js',
 *     'https://cdn.jsdelivr.net/npm/ag-grid-vue@22.0.0/dist/ag-grid-vue.umd.js',
 *     'https://yuda-lyu.github.io/w-aggrid-vue/dist/w-aggrid-vue.umd.js',
 * ]
 * importResources(pathItems)
 *     .then((res)=>{
 *         console.log(res)
 *     })
 *
 * pathItems = [
 *     {
 *         path: 'https://cdn.jsdelivr.net/npm/ag-grid-community@22.0.0/dist/ag-grid-community.noStyle.js',
 *         type: 'js',
 *     },
 *     {
 *         path: 'https://cdn.jsdelivr.net/npm/ag-grid-vue@22.0.0/dist/ag-grid-vue.umd.js',
 *         type: 'js',
 *     },
 *     {
 *         path: 'https://yuda-lyu.github.io/w-aggrid-vue/dist/w-aggrid-vue.umd.js',
 *         type: 'js',
 *     },
 * ]
 * importResources(pathItems)
 *     .then((res)=>{
 *         console.log(res)
 *     })
 *
 */
function importResources(pathItems) {

    //pm
    let pm = genPm()

    //check, 於進入時一次讀取並驗證全部項目(先於任何載入與_pathItems/_paths之登記), 無效以固定字串reject; 其後只處理新建之副本, 不改寫呼叫端之輸入
    let rd = readPathItems(pathItems)
    if (rd.err) {
        pm.reject(rd.err)
        return pm
    }
    pathItems = rd.items

    //key
    let key = join(map(pathItems, 'path'), '|')

    //check
    if (_pathItems[key] === 'done') {
        pm.resolve('loaded')
        return pm
    }
    else if (_pathItems[key]) {
        //載入中, 共用首位之載入結果(與其同成敗), 不輪詢
        _pathItems[key]
            .then(() => {
                pm.resolve('loaded')
            }, (err) => {
                pm.reject(err)
            })
        return pm
    }

    //pmSeries, type於readPathItems已驗為'js'或'css'
    let pmAll = pmSeries(pathItems, (pathItem) => {
        let pm = genPm()
        if (pathItem.type === 'js') {
            pm = importResource({
                tagName: 'script',
                path: pathItem.path,
                attributes: { type: 'text/javascript' },
                func: pathItem.func,
            })
        }
        else {
            pm = importResource({
                tagName: 'link',
                path: pathItem.path,
                attributes: { rel: 'stylesheet' },
            })
        }
        return pm
    })
        .then((r) => {

            //done
            _pathItems[key] = 'done'

            return r
        }, (err) => {

            //失敗時清除標記, 使之後之呼叫可重新載入
            delete _pathItems[key]

            return Promise.reject(err)
        })

    //loading, 記錄載入中之Promise供後到者共用
    _pathItems[key] = pmAll

    return pmAll
}


export default importResources
