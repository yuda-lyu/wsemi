import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './toolfp/src'
let fdTar = './toolfp/dist'


rollupFiles({
    fns: 'index.mjs',
    fdSrc,
    fdTar,
    hookNameDist: () => 'wsemip',
    nameDistType: 'kebabCase',
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


//node --experimental-modules --es-module-specifier-resolution=node toolfp/gDistRollup.mjs
