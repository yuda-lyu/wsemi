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
        'fs': 'fs',
        'child_process': 'child_process',
        'dayjs': 'dayjs',
        'xlsx': 'XLSX',
        'fuzzball': 'fuzzball',
        'tippy.js': 'tippy',
        'ua-parser-js': 'UAParser',
        'xss': 'filterXSS',
    },
    external: [
        'fs',
        'child_process',
        'dayjs',
        'xlsx',
        'fuzzball',
        'tippy.js',
        'ua-parser-js',
        'xss',
    ],
})
