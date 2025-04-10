import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './src'
let fdTar = './dist'


rollupFiles({
    fns: 'index.mjs',
    fdSrc,
    fdTar,
    hookNameDist: () => 'wsemi',
    // nameDistType: 'kebabCase', //直接由hookNameDist給予
    globals: { //注意右側為引入後的名稱，該名稱不能包含小數點「.」, 通常外部引用後還有default問題, 盡量於開發階段自己處理掉(不依賴rollup提供的global的左側名稱)
        //因html2canvas沒有umd版, 且被rollup剔除打包還是會有未檢查window導致無法運行於nodejs的錯誤, 故不安裝此套件改用dyn引用
        'path': 'path',
        'fs': 'fs',
        'events': 'events',
        'process': 'process',
        'child_process': 'child_process',
        'iconv-lite': 'iconv-lite',
        'crypto': 'crypto', //因crypto-js修改使用內建crypto方式, 會偵測nodejs並使用require內建的crypto, 故需剔除
        'dayjs': 'dayjs',
        'xlsx': 'XLSX',
        'fuse.js': 'Fuse',
        'ua-parser-js': 'UAParser',
        'xss': 'filterXSS',
        'viewerjs': 'viewerjs',
        //'tippy.js': 'tippyjs', //因需要滑鼠移入就顯示, 若採動態加載會有時間差, 故需直接打包近來, 不能使用小數點故內部引用需為tippyjs
        'tesseract.js': 'tesseractjs', //不能使用小數點故內部引用需為tesseractjs
        'htmlparser': 'htmlparser',
        'pyodide': 'pyodide',
        'chokidar': 'chokidar',
    },
    external: [
        'path',
        'fs',
        'events',
        'process',
        'child_process',
        'iconv-lite',
        'crypto',
        'dayjs',
        'xlsx',
        'fuse.js',
        'ua-parser-js',
        'xss',
        'viewerjs',
        //'tippy.js', //因需要滑鼠移入就顯示, 若採動態加載會有時間差, 故需直接打包近來
        'tesseract.js',
        'htmlparser',
        'pyodide',
        'chokidar',
    ],
})
