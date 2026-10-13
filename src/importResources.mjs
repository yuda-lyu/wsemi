import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import join from 'lodash-es/join.js'
import isarr from './isarr.mjs'
import isstr from './isstr.mjs'
import isfun from './isfun.mjs'
import genPm from './genPm.mjs'
import pmSeries from './pmSeries.mjs'
import waitFun from './waitFun.mjs'
import strright from './strright.mjs'
import delay from './delay.mjs'


let _paths = {}
let _pathItems = {}


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
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳注入成功的HtmlElement陣列(已載入完成或與載入中者共用時為'loaded')，reject回傳載入失敗之script元素(error事件)、func之錯誤或錯誤訊息
 * @example
 * //need test in browser
 *
 * let pathItems
 *
 * pathItems = [
 *     'https://cdn.jsdelivr.net/npm/ag-grid-community@22.0.0/dist/ag-grid-community.noStyle.js',
 *     'https://cdn.jsdelivr.net/npm/ag-grid-vue@22.0.0/dist/ag-grid-vue.umd.js',
 *     'https://cdn.jsdelivr.net/npm/w-aggrid-vue@1.0.28/dist/w-aggrid-vue.umd.js',
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
 *         path: 'https://cdn.jsdelivr.net/npm/w-aggrid-vue@1.0.28/dist/w-aggrid-vue.umd.js',
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

    //check
    if (!isarr(pathItems)) {
        pathItems = [pathItems]
    }

    //check string
    each(pathItems, (v, k) => {
        if (isstr(v)) {
            pathItems[k] = {
                path: v
            }
        }
    })

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

    //judge type
    each(pathItems, (v, k) => {
        if (!v.type) {
            if (strright(v.path, 3) === '.js') {
                v.type = 'js'
            }
            else if (strright(v.path, 4) === '.css') {
                v.type = 'css'
            }
            else {
                v.type = 'unknow'
            }
        }
    })

    //pmSeries
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
        else if (pathItem.type === 'css') {
            pm = importResource({
                tagName: 'link',
                path: pathItem.path,
                attributes: { rel: 'stylesheet' },
            })
        }
        else {
            let err = 'invalid pathItem.type: ' + pathItem.type
            console.log(err)
            pm.reject(err)
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
