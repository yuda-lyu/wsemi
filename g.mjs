import interp1 from './src/interp1.mjs'


let r
let x

let ps = [
    { x: 1, y: 0.2 },
    { x: 3, y: 1.2 },
    { x: 4, y: 2 },
]

let psInv = [
    { x: 4, y: 2 },
    { x: 3, y: 1.2 },
    { x: 1, y: 0.2 },
]

let psErr = [
    { x: 'a', y: 0.2 },
    { x: 'mnop', y: 1.2 },
    { x: 'xyz', y: 2 },
]

let psEmpty = [
]

let psEffOne = [
    { x: 1, y: 0.2 },
    { x: 'mnop', y: 1.2 },
    { x: 'xyz', y: 2 },
]

let psP = [
    { a: 1, b: 0.2 },
    { a: 3, b: 1.2 },
    { a: 4, b: 2 },
]

let px = [0, 1, 2, 2.6, 3, 3.5, 4, 5]

let opt = {
    mode: 'stairs',
}

let optX = {
    mode: 'stairs',
    xMin: 0,
    xMax: 4.5,
}

let optP = {
    keyX: 'a',
    keyY: 'b',
}

x = 0
r = interp1(psErr, x)
console.log(`linear(error data): x=${x}`, 'r=' + JSON.stringify(r))
// => linear(error data): x=0 r={"err":"ps(length=0) is not an effective array","ps":[{"x":"a","y":0.2},{"x":"mnop","y":1.2},{"x":"xyz","y":2}],"psEff":[]}

x = 0
r = interp1(psEmpty, x)
console.log(`linear(empty data): x=${x}`, 'r=' + JSON.stringify(r))
// => linear(empty data): x=0 r={"err":"ps(length=0) is not an effective array","ps":[],"psEff":[]}

x = 0
r = interp1(psEffOne, x)
console.log(`linear(one point): x=${x}`, 'r=' + JSON.stringify(r))
// => linear(one point): x=0 r={"err":"ps(length=1) is one point only","ps":[{"x":1,"y":0.2},{"x":"mnop","y":1.2},{"x":"xyz","y":2}],"psEff":[{"x":1,"y":0.2}]}

x = 0
r = interp1(ps, x)
console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
// => linear: x=0 r={"err":"out of x-range","msg":"x[0] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":0,"xmin":1,"xmax":4}}

x = 1
r = interp1(ps, x)
console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
// => linear: x=1 r=0.2

x = 2
r = interp1(ps, x)
console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
// => linear: x=2 r=0.7

x = 2.6
r = interp1(ps, x)
console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
// => linear: x=2.6 r=1

x = 3
r = interp1(ps, x)
console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
// => linear: x=3 r=1.2

x = 3.5
r = interp1(ps, x)
console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
// => linear: x=3.5 r=1.6

x = 4
r = interp1(ps, x)
console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
// => linear: x=4 r=2

x = 5
r = interp1(ps, x)
console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
// => linear: x=5 r={"err":"out of x-range","msg":"x[5] greater than upper limit[4]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":5,"xmin":1,"xmax":4}}

x = 0
r = interp1(psInv, x)
console.log(`linear(inverse data): x=${x}`, 'r=' + JSON.stringify(r))
// => linear(inverse data): x=0 r={"err":"out of x-range","msg":"x[0] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":0,"xmin":1,"xmax":4}}

x = 1
r = interp1(psInv, x)
console.log(`linear(inverse data): x=${x}`, 'r=' + JSON.stringify(r))
// => linear(inverse data): x=1 r=0.2

x = 2
r = interp1(psInv, x)
console.log(`linear(inverse data): x=${x}`, 'r=' + JSON.stringify(r))
// => linear(inverse data): x=2 r=0.7

x = 2.6
r = interp1(psInv, x)
console.log(`linear(inverse data): x=${x}`, 'r=' + JSON.stringify(r))
// => linear(inverse data): x=2.6 r=1

x = 3
r = interp1(psInv, x)
console.log(`linear(inverse data): x=${x}`, 'r=' + JSON.stringify(r))
// => linear(inverse data): x=3 r=1.2

x = 3.5
r = interp1(psInv, x)
console.log(`linear(inverse data): x=${x}`, 'r=' + JSON.stringify(r))
// => linear(inverse data): x=3.5 r=1.6

x = 4
r = interp1(psInv, x)
console.log(`linear(inverse data): x=${x}`, 'r=' + JSON.stringify(r))
// => linear(inverse data): x=4 r=2

x = 5
r = interp1(psInv, x)
console.log(`linear(inverse data): x=${x}`, 'r=' + JSON.stringify(r))
// => linear(inverse data): x=5 r={"err":"out of x-range","msg":"x[5] greater than upper limit[4]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":5,"xmin":1,"xmax":4}}

x = -1
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=-1 r={"err":"out of x-range","msg":"x[-1] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":-1,"xmin":1,"xmax":4}}

x = 0.51
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=0.51 r={"err":"out of x-range","msg":"x[0.51] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":0.51,"xmin":1,"xmax":4}}

x = 1
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=1 r=0.2

x = 1.9
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=1.9 r=0.2

x = 2
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=2 r=0.2

x = 2.1
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=2.1 r=1.2

x = 2.5
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=2.5 r=1.2

x = 3
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=3 r=1.2

x = 3.49
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=3.49 r=1.2

x = 3.5
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=3.5 r=1.2

x = 3.51
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=3.51 r=2

x = 4
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=4 r=2

x = 4.5
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=4.5 r={"err":"out of x-range","msg":"x[4.5] greater than upper limit[4]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":4.5,"xmin":1,"xmax":4}}

x = -1
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=-1 r={"err":"out of x-range","msg":"x[-1] less than lower limit[0]","data":{"ps":[{"x":0,"y":0.2},{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2},{"x":4.5,"y":2}],"x":-1,"xmin":0,"xmax":4.5}}

x = 0
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=0 r=0.2

x = 0.49
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=0.49 r=0.2

x = 0.5
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=0.5 r=0.2

x = 0.51
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=0.51 r=0.2

x = 1
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=1 r=0.2

x = 1.9
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=1.9 r=0.2

x = 2
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=2 r=0.2

x = 2.1
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=2.1 r=1.2

x = 2.5
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=2.5 r=1.2

x = 3
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=3 r=1.2

x = 3.49
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=3.49 r=1.2

x = 3.5
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=3.5 r=1.2

x = 3.51
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=3.51 r=2

x = 4
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=4 r=2

x = 4.49
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=4.49 r=2

x = 4.5
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=4.5 r=2

x = 4.51
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=4.51 r={"err":"out of x-range","msg":"x[4.51] greater than upper limit[4.5]","data":{"ps":[{"x":0,"y":0.2},{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2},{"x":4.5,"y":2}],"x":4.51,"xmin":0,"xmax":4.5}}

x = 0
r = interp1(psP, x, optP)
console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
// => linear by keyX & keyY: x=0 r={"err":"out of x-range","msg":"x[0] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":0,"xmin":1,"xmax":4}}

x = 1
r = interp1(psP, x, optP)
console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
// => linear by keyX & keyY: x=1 r=0.2

x = 2
r = interp1(psP, x, optP)
console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
// => linear by keyX & keyY: x=2 r=0.7

x = 2.6
r = interp1(psP, x, optP)
console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
// => linear by keyX & keyY: x=2.6 r=1

x = 3
r = interp1(psP, x, optP)
console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
// => linear by keyX & keyY: x=3 r=1.2

x = 3.5
r = interp1(psP, x, optP)
console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
// => linear by keyX & keyY: x=3.5 r=1.6

x = 4
r = interp1(psP, x, optP)
console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
// => linear by keyX & keyY: x=4 r=2

x = 5
r = interp1(psP, x, optP)
console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
// => linear by keyX & keyY: x=5 r={"err":"out of x-range","msg":"x[5] greater than upper limit[4]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":5,"xmin":1,"xmax":4}}

r = interp1(ps, px)
console.log(`linear: px=${JSON.stringify(px)}`, 'r=' + JSON.stringify(r))
// => linear: px=[0,1,2,2.6,3,3.5,4,5] r=[
//   {
//     "err": "out of x-range",
//     "msg": "x[0] less than lower limit[1]",
//     "data": {
//       "ps": [
//         {
//           "x": 1,
//           "y": 0.2
//         },
//         {
//           "x": 3,
//           "y": 1.2
//         },
//         {
//           "x": 4,
//           "y": 2
//         }
//       ],
//       "x": 0,
//       "xmin": 1,
//       "xmax": 4
//     }
//   },
//   0.2,
//   0.7,
//   1,
//   1.2,
//   1.6,
//   2,
//   {
//     "err": "out of x-range",
//     "msg": "x[5] greater than upper limit[4]",
//     "data": {
//       "ps": [
//         {
//           "x": 1,
//           "y": 0.2
//         },
//         {
//           "x": 3,
//           "y": 1.2
//         },
//         {
//           "x": 4,
//           "y": 2
//         }
//       ],
//       "x": 5,
//       "xmin": 1,
//       "xmax": 4
//     }
//   }
// ]


//node --experimental-modules --es-module-specifier-resolution=node g.mjs
