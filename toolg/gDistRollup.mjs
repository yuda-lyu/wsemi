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
        //因draggable.js與html2canvas沒有umd版, 且被rollup剔除打包還是會有未檢查window導致無法運行於nodejs的錯誤, 故不安裝此套件改用dyn引用
        'path': 'path',
        'fs': 'fs',
        'child_process': 'child_process',
        'crypto': 'crypto', //因crypto-js修改使用內建crypto方式, 會偵測nodejs並使用require內建的crypto, 故需剔除
        'dayjs': 'dayjs',
        'xlsx': 'XLSX',
        'fuzzball': 'fuzzball',
        'ua-parser-js': 'UAParser',
        'xss': 'filterXSS',
        //'tippy.js': 'tippy.js', //因需要滑鼠移入就顯示, 若採動態加載會有時間差, 故需直接打包近來
    },
    external: [
        'path',
        'fs',
        'child_process',
        'crypto',
        'dayjs',
        'xlsx',
        'fuzzball',
        'ua-parser-js',
        'xss',
        //'tippy.js',
    ],
})
