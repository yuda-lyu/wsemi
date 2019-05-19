// import isbol from './src/isbol'
// console.log(isbol)

// import w from './dist/wsemi.umd.js'
// console.log(w)
// console.log(w.isbol)

import w from './dist/wsemi.umd.js'
let { isbol } = w //解構賦值, --experimental-modules doesn't support importing named exports
console.log(isbol)

// import { isbol } from './dist/wsemi.umd.js'
// console.log(isbol) //error
