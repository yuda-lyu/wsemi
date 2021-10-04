import rollupFile from 'w-package-tools/src/rollupFile.mjs'


let fdSrc = './toolparfor/src'
let fdTar = './toolparfor/dist'


rollupFile({
    fn: 'index.mjs',
    fdSrc,
    fdTar,
    hookNameDist: () => 'wpf',
    // nameDistType: 'kebabCase', //直接由hookNameDist給予
    // format: 'es', //w-package-tools需使用es
    // ext: 'mjs', //w-package-tools需使用副檔名mjs
    bSourcemap: false,
    globals: {
        'path': 'path',
        'fs': 'fs',
        'child_process': 'child_process',
    },
    external: [
        'path',
        'fs',
        'child_process',
    ],
})


rollupFile({
    fn: '../../src/pmSeries.mjs',
    fdSrc,
    fdTar,
    hookNameDist: () => 'wpf_pmSeries',
    // nameDistType: 'kebabCase', //直接由hookNameDist給予
    // format: 'es', //w-package-tools需使用es
    // ext: 'mjs', //w-package-tools需使用副檔名mjs
    bSourcemap: false,
    globals: {
        'path': 'path',
        'fs': 'fs',
        'child_process': 'child_process',
    },
    external: [
        'path',
        'fs',
        'child_process',
    ],
})


//node --experimental-modules --es-module-specifier-resolution=node toolparfor/gDistRollup.mjs
