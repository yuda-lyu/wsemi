import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './toolfp/src'
let fdTar = './toolfp/dist'


rollupFiles({
    fns: 'index.mjs',
    fdSrc,
    fdTar,
    hookNameDist: () => 'wsemip',
    // nameDistType: 'kebabCase', //直接由hookNameDist給予
    // format: 'es', //w-package-tools需使用es
    // ext: 'mjs', //w-package-tools需使用副檔名mjs
    bSourcemap: false,
    globals: {
        'path': 'path',
        'fs': 'fs',
        'child_process': 'child_process',
        'iconv-lite': 'iconv-lite',
    },
    external: [
        'path',
        'fs',
        'child_process',
        'iconv-lite',
    ],
})


//node toolfp/gDistRollup.mjs
