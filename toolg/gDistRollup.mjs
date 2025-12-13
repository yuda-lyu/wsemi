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
        // 'fuse.js': 'Fuse', //因計算字串模糊比對重要, 故需要直接打包
        // 'diff': 'diff', //因計算數據差異重要, 故需要直接打包
        'diff2html': 'diff2html',
        'html-to-text': 'html-to-text',
        // 'he': 'he', //因前端bodyLog須使用htmlEncode, 執行得添加額外script增加複雜度, 故需要直接打包
        'ua-parser-js': 'UAParser',
        'xss': 'filterXSS',
        // 'tippy.js': 'tippyjs', //因前端需要滑鼠移入就顯示, 若採動態加載會有時間差, 故需要直接打包, 不能使用小數點故內部引用需為tippyjs
        // 'hash-wasm': 'hash-wasm', //因計算hash重要, 故需要直接打包
        // 'xxhash-wasm': 'xxhash-wasm', //因計算hash重要, 故需要直接打包
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
        // 'fuse.js', //因計算字串模糊比對重要, 故需要直接打包
        // 'diff', //因計算數據差異重要, 故需要直接打包
        'diff2html',
        'html-to-text',
        // 'he', //因前端bodyLog須使用htmlEncode, 執行得添加額外script增加複雜度, 故需要直接打包
        'ua-parser-js',
        'xss',
        // 'tippy.js', //因前端需要滑鼠移入就顯示, 若採動態加載會有時間差, 故需要直接打包
        // 'hash-wasm', //因計算hash重要, 故需要直接打包
        // 'xxhash-wasm', //因計算hash重要, 故需要直接打包
        'tesseract.js',
        'pyodide',
        'chokidar',
    ],
})
