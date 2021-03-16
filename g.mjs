import arrfilter from './src/arrfilter.mjs'

let arr = [
    'abc def xyz',
    '測試abc中文mnop',
    'Instead of creating yet another opinionated application',
    'Node.js module which can be integrated into a larger application',
]
let kws = null
let r = null

kws = 'abc'
r = arrfilter(arr, kws)
console.log(r)
// => [
//     { hasKeyword: true, weight: 1 },
//     { hasKeyword: true, weight: 1 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 }
// ]

kws = 'def'
r = arrfilter(arr, kws)
console.log(r)
// => [
//     { hasKeyword: true, weight: 1 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 }
// ]

kws = 'def 中文'
r = arrfilter(arr, kws)
console.log(r)
// => [
//     { hasKeyword: true, weight: 1 },
//     { hasKeyword: true, weight: 0.25 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 }
// ]

kws = 'def 中文 mnop'
r = arrfilter(arr, kws)
console.log(r)
// => [
//     { hasKeyword: true, weight: 1 },
//     { hasKeyword: true, weight: 0.5555555555555557 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 }
// ]

kws = 'def +yet'
r = arrfilter(arr, kws)
console.log(r)
// => [
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: true, weight: 0.25 },
//     { hasKeyword: false, weight: 0 }
// ]

kws = 'def of module -yet'
r = arrfilter(arr, kws)
console.log(r)
// => [
//     { hasKeyword: true, weight: 1 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: true, weight: 0.25 }
// ]

kws = '+'
r = arrfilter(arr, kws)
console.log(r)
// => [
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 }
// ]

kws = '-'
r = arrfilter(arr, kws)
console.log(r)
// => [
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 }
// ]

kws = 'def +'
r = arrfilter(arr, kws)
console.log(r)
// => [
//     { hasKeyword: true, weight: 1 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 },
//     { hasKeyword: false, weight: 0 }
// ]

//node --experimental-modules --es-module-specifier-resolution=node g.mjs
