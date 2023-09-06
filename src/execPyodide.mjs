import get from 'lodash/get'
import each from 'lodash/each'
import isarr from './isarr.mjs'
import loadPyodide from './_loadPyodide.js'
import getGlobal from './getGlobal.mjs'
import haskey from './haskey.mjs'
import waitFun from './waitFun.mjs'
import queue from './queue.mjs'
// console.log('loadPyodide', loadPyodide)


function getLoadPyodide() {
    let g = getGlobal()
    let x = loadPyodide || g.loadPyodide
    // console.log('getLoadPyodide loadPyodide', x)
    return x
}


let state = ''
let pyodide = null
let micropip = null
async function iniPyodide() {

    //state
    if (state === 'done') {
        return
    }
    else if (state === 'loading') {
        await waitFun(() => {
            return pyodide !== null
        })
        return
    }
    state = 'loading'

    //getLoadPyodide
    let lpd = getLoadPyodide()
    // console.log('lpd', lpd)

    //lpd
    let _pyodide = await lpd()
    // console.log('_pyodide',_pyodide)

    await _pyodide.loadPackage('micropip')
    let _micropip = _pyodide.pyimport('micropip')
    // console.log('_micropip',_micropip)

    //save
    pyodide = _pyodide
    micropip = _micropip

    //state
    state = 'done'

}


let q = null
let kp = {}
if (true) {

    //queue
    let takeLimit = 1
    q = queue(takeLimit)

    //message
    q.on('message', function(qs) {
        // console.log('message', JSON.stringify(qs))

        //get
        let pkg = q.get()
        if (!pkg) {
            return
        }
        // console.log('get', pkg)

        async function core() {

            //loading
            if (!haskey(kp, pkg)) {
                kp[pkg] = 'loading'
            }

            //install and loadPackage
            await micropip.install(pkg)
            await pyodide.loadPackage(pkg)
            // console.log('inst-load pkg',pkg)

            //done
            kp[pkg] = 'done'

            //cb
            q.cb()

            // console.log('finish',pkg)
        }
        core()
            .catch((err) => {
                console.log(err)
            })

    })

}


function loadPkg(pkg) {
    q.push(pkg)
}


async function checkPkgs(pkgs) {
    await waitFun(() => {
        // console.log('check pkgs',pkgs)
        let b = true
        each(pkgs, (pkg) => {
            let c = get(kp, pkg)
            if (c !== 'done') {
                b = false
                return false //跳出
            }
        })
        return b
    })
}


async function loadPkgs(pkgs) {

    //loadPkg
    each(pkgs, (pkg) => {
        loadPkg(pkg)
    })

    //checkPkgs
    await checkPkgs(pkgs)

}


/**
 * 通過Pyodide執行Python程式碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execPyodide.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Array} [opt.pkgs=[]] 輸入Python引用已安裝套件字串陣列，例如為'scipy'、'numpy'等，預設[]
 * @param {Array} [opt.imps=[]] 輸入Python引入(import)的字串陣列，例如為['import scipy','import numpy']等，預設[]
 * @param {Array} [opt.inps=[]] 輸入輸入數據陣列，例如為[123,'abc']等，預設[]
 * @param {String} [opt.content=''] 輸入執行程式核心字串，若要使用inps則使用'rIn數字'，數字由1至inps的長度n，回傳使用'ret'接收，例如ret = fun(rIn1,rIn2,...rInn)，預設''
 * @returns {Number|String|Boolean|Array|Object} 回傳運算結果資料
 * @example
 *
 * async function test() {
 *
 *     let pkgs = [
 *         'scipy',
 *     ]
 *     let imps = [
 *         'from scipy.interpolate import griddata',
 *     ]
 *     let psSrc = [
 *         [-0.1, -0.1, -0.1, 0],
 *         [1, 0, 0, 0],
 *         [1, 1, 0, 0],
 *         [0, 0, 1, 0],
 *         [1, 0, 1, 0],
 *         [1, 1, 1, 10],
 *     ]
 *     let psLocs = []
 *     let psValus = []
 *     for (let k = 0; k < psSrc.length; k++) {
 *         let v = psSrc[k]
 *         psLocs.push([v[0], v[1], v[2]])
 *         psValus.push(v[3])
 *     }
 *     let psTar = [
 *         0.1, 0.1, 0.95
 *     ]
 *     let inps = [
 *         psLocs,
 *         psValus,
 *         psTar,
 *     ]
 *     let content = `
 * ret = griddata(rIn1, rIn2, rIn3, method='linear')
 *     `
 *     let rs = await execPyodide({
 *         pkgs,
 *         imps,
 *         inps,
 *         content,
 *     })
 *     console.log('rs', rs)
 *
 * }
 *
 * test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // Loading micropip, packaging
 * // Loaded packaging, micropip
 * // Loading scipy, numpy, clapack
 * // Loaded clapack, numpy, scipy
 * // scipy already loaded from default channel
 * // No new packages to load
 * // rs Float64Array(1) [ 0.49999999999999933 ]
 *
 */
async function execPyodide(opt = {}) {

    //pkgs
    let pkgs = get(opt, 'pkgs', [])
    if (!isarr(pkgs)) {
        pkgs = []
    }

    //imps
    let imps = get(opt, 'imps', [])
    if (!isarr(imps)) {
        imps = []
    }

    //inps
    let inps = get(opt, 'inps', [])
    if (!isarr(inps)) {
        inps = []
    }

    //content, 執行Python程式碼, 例如 ret = griddata(rIn1, rIn2, rIn3, method='linear')
    let content = get(opt, 'content', '')

    //iniPyodide
    await iniPyodide()

    //loadPkgs
    await loadPkgs(pkgs)

    //cimps
    let cimps = ''
    each(imps, (imp) => {
        cimps += imp + '\n'
    })
    // console.log('cimps', cimps)

    //cins, 待之後與pyodide.globals.set變數提高效能, 可能有轉型問題, 待確認
    let cins = ''
    each(inps, (v, k) => {
        cins += `rIn${k + 1} = ${JSON.stringify(v)}` + '\n'
    })
    // console.log('cins', cins)

    //scp
    let scp = `
${cimps}

${cins}

ret = ''

${content}

# print(ret)
    `

    //runPython
    await pyodide.runPython(scp)

    //r
    let r = pyodide.globals.get('ret').toJs()
    // console.log('r', r)

    // //cdbl
    // rs = map(rs, (v) => {
    //     return cdbl(v)
    // })

    return r
}


export default execPyodide
