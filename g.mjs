import chokidar from 'chokidar'
import fsWatchFile from './src/fsWatchFile.mjs'
import fsWatchFolder from './src/fsWatchFolder.mjs'

// let evfl = fsWatchFile()

// evfl.on('./abc.json', (msg) => {
//     console.log(msg.type, ':', msg.fp)
//     // => add : ./abc.json
//     // change : ./abc.json
//     // unlink : ./abc.json
// })

// // evfl.clear()

let evfd = fsWatchFolder()

evfd.on('./abc', (msg) => {
    console.log(msg.type, ':', msg.fp)
    // => addDir : ./abc
    // add : ./abc/temp1.txt
    // unlink : ./abc/temp1.txt
    // add : ./abc/temp2.json
    // unlinkDir : ./abc
    // unlink : ./abc/temp2.json
})

// evfd.clear()


//node --experimental-modules --es-module-specifier-resolution=node g.mjs
