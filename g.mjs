import execPyodide from './src/execPyodide.mjs'
// import w from './dist/wsemi.umd.js'
// let execPyodide = w.execPyodide


async function test() {

    let pkgs = [
        'scipy',
    ]
    let imps = [
        'from scipy.interpolate import griddata',
    ]
    let psSrc = [
        [-0.1, -0.1, -0.1, 0],
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 1, 0],
        [1, 0, 1, 0],
        [1, 1, 1, 10],
    ]
    let psLocs = []
    let psValus = []
    for (let k = 0; k < psSrc.length; k++) {
        let v = psSrc[k]
        psLocs.push([v[0], v[1], v[2]])
        psValus.push(v[3])
    }
    let psTar = [
        0.1, 0.1, 0.95
    ]
    let inps = [
        psLocs,
        psValus,
        psTar,
    ]
    let content = `
ret = griddata(rIn1, rIn2, rIn3, method='linear')
    `
    let rs = await execPyodide({
        pkgs,
        imps,
        inps,
        content,
    })
    console.log('rs', rs)

}

test()
    .catch((err) => {
        console.log(err)
    })
// Loading micropip, packaging
// Loaded packaging, micropip
// Loading scipy, numpy, clapack
// Loaded clapack, numpy, scipy
// scipy already loaded from default channel
// No new packages to load
// rs Float64Array(1) [ 0.49999999999999933 ]

//node --experimental-modules --es-module-specifier-resolution=node g.mjs
