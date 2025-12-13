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
        'path': 'path',
        'fs': 'fs',
        'readline': 'readline',
        'events': 'events',
        'stream': 'stream',
        'process': 'process',
        'child_process': 'child_process',
        'crypto': 'crypto',
        'dayjs': 'dayjs',
        'xlsx': 'XLSX',
        'fuse.js': 'Fuse',
        'diff': 'diff',
        'diff2html': 'diff2html',
        'html-to-text': 'html-to-text',
        'he': 'he',
        'ua-parser-js': 'UAParser',
        'xss': 'filterXSS',
        // 'tippy.js': 'tippyjs', //因需要滑鼠移入就顯示, 若採動態加載會有時間差, 故需直接打包近來, 不能使用小數點故內部引用需為tippyjs
        // 'hash-wasm': 'hash-wasm', //因計算hash重要, 故需直接打包近來
        // 'xxhash-wasm': 'xxhash-wasm', //因計算hash重要, 故需直接打包近來
        'tesseract.js': 'tesseractjs', //不能使用小數點故內部引用需為tesseractjs
        'pyodide': 'pyodide',
        'chokidar': 'chokidar',
    },
    external: [
        'path',
        'fs',
        'readline',
        'events',
        'stream',
        'process',
        'child_process',
        'crypto',
        'dayjs',
        'xlsx',
        'fuse.js',
        'diff',
        'diff2html',
        'html-to-text',
        'he',
        'ua-parser-js',
        'xss',
        // 'tippy.js', //因需要滑鼠移入就顯示, 若採動態加載會有時間差, 故需直接打包近來
        // 'hash-wasm', //因計算hash重要, 故需直接打包近來
        // 'xxhash-wasm', //因計算hash重要, 故需直接打包近來
        'tesseract.js',
        'pyodide',
        'chokidar',
    ],
})
