import isearr from './isearr.mjs'
import importResources from './importResources.mjs'
import execPyodide from './execPyodide.mjs'


/**
 * 通過Pyodide執行Python程式碼，採用動態加載技術
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execPyodideDyn.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Array} [opt.pkgs=[]] 輸入Python引用已安裝套件字串陣列，例如為'scipy'、'numpy'等，預設[]
 * @param {Array} [opt.imps=[]] 輸入Python引入(import)的字串陣列，例如為['import scipy','import numpy']等，預設[]
 * @param {Array} [opt.inps=[]] 輸入輸入數據陣列，例如為[123,'abc']等，預設[]
 * @param {String} [opt.content=''] 輸入執行程式核心字串，若要使用inps則使用'rIn數字'，數字由1至inps的長度n，回傳使用'ret'接收，例如ret = fun(rIn1,rIn2,...rInn)，預設''
 * @param {String|Object|Array} pathItems 輸入資源字串、字串陣列、物件、物件陣列
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
 *     let rs = await execPyodideDyn({
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
async function execPyodideDyn(opt = {}, pathItems) {

    //pathItems
    //若更新, 記得example與readme也要更新
    if (!isearr(pathItems)) {
        pathItems = [
            'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js',
        ]
    }

    //importResources
    await importResources(pathItems)

    //execPyodide
    let r = await execPyodide(opt)

    return r
}


export default execPyodideDyn
