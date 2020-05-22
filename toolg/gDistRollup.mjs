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
        'dayjs': 'dayjs',
        'xlsx': 'XLSX',
        'fuzzball': 'fuzzball',
        'ua-parser-js': 'UAParser',
        'xss': 'filterXSS',
        'viewerjs': 'Viewer',
        //'tippy.js': 'tippy.js', //打包tippy.js與popper.js進來, 因沒辦法按需只能全入
        //'@shopify/draggable': 'Draggable', //因draggable.js沒有umd版, 且被rollup剔除打包還是會有未檢查window導致無法運行於nodejs的錯誤, 故不安裝此套件改用dyn引用
    },
    external: [
        'path',
        'fs',
        'child_process',
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
