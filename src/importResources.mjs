import each from 'lodash/each'
import map from 'lodash/map'
import join from 'lodash/join'
import isarr from './isarr.mjs'
import isstr from './isstr.mjs'
import isfun from './isfun.mjs'
import haskey from './haskey.mjs'
import genPm from './genPm.mjs'
import pmSeries from './pmSeries.mjs'
import waitFun from './waitFun.mjs'
import strright from './strright.mjs'


let _paths = {}
let _pathItems = {}


function importResource({ tagName, path, attributes = {}, func }) {
    let pm = genPm()

    //check
    if (haskey(_paths, path)) {
        pm.resolve()
        return pm
    }
    //console.log('load path', path)

    //save key
    _paths[path] = true

    //element attrs
    let element = document.createElement(tagName)
    each(attributes, (v, k) => {
        element.setAttribute(k, v)
    })

    //element type
    if (attributes.rel && attributes.rel === 'stylesheet') {
        element.setAttribute('href', path)
        setTimeout(() => {
            pm.resolve(element)
        }, 1)
    }
    else {
        element.src = path
        element.addEventListener('load', () => {
            if (!isfun(func)) {
                func = () => true
            }
            waitFun(func)
                .then(function() {
                    pm.resolve(element)
                })
        })
        element.addEventListener('error', () => {
            pm.reject(element)
        })
    }

    //appendChild
    let head = document.getElementsByTagName('head')[0]
    head.appendChild(element)

    return pm
}


/**
 * 前端動態引入資源如Javascript或CSS檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/importResources.test.js Github}
 * @memberOf wsemi
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
 * @returns {Promise} 回傳Promise，resolve回傳注入成功的HtmlElement，reject回傳錯誤訊息
 * @example
 * need test in browser
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
        let pm = genPm()
        pm.resolve('loaded')
        return pm
    }
    else if (_pathItems[key] === 'loading') {
        let pm = genPm()
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
        let p
        if (pathItem.type === 'js') {
            p = importResource({
                tagName: 'script',
                path: pathItem.path,
                attributes: { type: 'text/javascript' },
                func: pathItem.func,
            })
        }
        else if (pathItem.type === 'css') {
            p = importResource({
                tagName: 'link',
                path: pathItem.path,
                attributes: { rel: 'stylesheet' },
            })
        }
        else {
            console.log('invalid pathItem.type: ', pathItem.type)
        }
        return p
    })
        .then(() => {

            //done
            _pathItems[key] = 'done'

        })

}


export default importResources
