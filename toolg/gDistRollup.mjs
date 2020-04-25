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
        //'tippy.js': 'tippy.js', //按需(沒辦法只能全入)打包tippy.js與popper.js進來
        'ua-parser-js': 'UAParser',
        'xss': 'filterXSS',
    },
    external: [
        'path',
        'fs',
        'child_process',
        //'crypto-js',
        'dayjs',
        'xlsx',
        'fuzzball',
        //'tippy.js',
        'ua-parser-js',
        'xss',
    ],
})
