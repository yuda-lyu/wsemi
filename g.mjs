// import genPm from './src/genPm.mjs'
// import _ from 'lodash'


// function aaa() {
//     let pm = genPm()
//     setTimeout(function() {
//         console.log('a')
//         pm.resolve('aaa')
//     }, 100)
//     return pm
// }

// function bbb() {
//     let pm = genPm()
//     setTimeout(function() {
//         console.log('b')
//         pm.resolve('bbb')
//     }, 1000)
//     return pm
// }

// function ccc() {
//     let pm = genPm()
//     setTimeout(function() {
//         console.log('c')
//         pm.resolve('ccc')
//     }, 1)
//     return pm
// }

// async function pmSer(pms) {
//     return pms.reduce(async (chain, pm) => {
//         let r1 = await chain
//         let r2 = await pm
//         return [r1, r2]
//     }, Promise.resolve())
// }

// async function asyncWay(pms) {
//     for (let pm in pms) {
//         await pm
//     }
// }


// async function aspm(pms) {
//     pms.reduce(function(pmm, v) {
//         return pmm.then(function(t) {
//             // ts.push(t)
//             // k += 1
//             return Promise.resolve() //fn(v, k)
//         })
//     }, Promise.resolve())

// }


// // function promiseSerial(funcs) {
// //     funcs.reduce((promise, func) =>
// //         promise.then(result =>
// //             func().then(),
// //     Promise.resolve())
// // }


// function pmSeries(pms) {
//     return new Promise((resolve, reject) => {
//         pms.reduce(function(pmm, pm) {
//             return pmm.then(function() {
//                 return pm()
//             })
//         }, Promise.resolve())
//             .then(function() {
//                 resolve()
//             })
//             .catch(function(err) {
//                 reject(err)
//             })
//     })
// }

// async function main() {
//     //pmSer([aaa(), bbb(), ccc()])
//     //promiseSerial([aaa(), bbb(), ccc()])
//     //asyncWay([aaa(), bbb(), ccc()])
//     //aspm([aaa(), bbb(), ccc()])
//     let r = await pmSeries([aaa, bbb, ccc])
// }
// main()

