import each from 'lodash/each'
import map from 'lodash/map'
import join from 'lodash/join'
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
    else if (_paths[path] === 'loading') {
        waitFun(() => {
            return _paths[path] === 'done'
        })
            .then(function() {
                pm.resolve('loaded')
            })
        return pm
    }

    //loading
    _paths[path] = 'loading'

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
        })
        ele.addEventListener('error', () => {

            //reject
            pm.reject(ele)

            //done
            _paths[path] = 'done'

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
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/importResources.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳注入成功的HtmlElement，reject回傳錯誤訊息
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
    else if (_pathItems[key] === 'loading') {
        waitFun(() => {
            return _pathItems[key] === 'done'
        })
            .then(function() {
                pm.resolve('loaded')
            })
        return pm
    }

    //loading
    _pathItems[key] = 'loading'

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
    return pmSeries(pathItems, (pathItem) => {
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
        .finally(() => {

            //done
            _pathItems[key] = 'done'

        })

}


export default importResources
