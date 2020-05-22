import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './src'
let fdTar = './dist'


rollupFiles({
    fns: 'index.mjs',
    fdSrc,
    fdTar,
    hookNameDist: () => 'wsemi',
    nameDistType: 'kebabCase',
    globals: {
        'path': 'path',
        'fs': 'fs',
        'child_process': 'child_process',
        //'crypto-js': 'crypto-js', //按需打包crypto-js進來
        'dayjs': 'dayjs',
        'xlsx': 'XLSX',
        'fuzzball': 'fuzzball',
        'ua-parser-js': 'UAParser',
        'xss': 'filterXSS',
        'viewerjs': 'viewerjs',
        //'tippy.js': 'tippy.js', //打包tippy.js與popper.js進來, 因沒辦法按需只能全入
        //'@shopify/draggable': '@shopify/draggable',
    },
    external: [
        'path',
        'fs',
        'child_process',
        //'crypto-js',
        'dayjs',
        'xlsx',
        'fuzzball',
        'ua-parser-js',
        'xss',
        'viewerjs',
        //'tippy.js',
        //'@shopify/draggable',
    ],
})
