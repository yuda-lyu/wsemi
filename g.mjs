import interp1 from './src/interp1.mjs'

let r
let x

let ps = [
    // { x: 1, y: 0.2 },
    // { x: 3, y: 1.2 },
    // { x: 4, y: 2 },
    { x: 'a', y: 0.2 },
    { x: 'mnop', y: 1.2 },
    { x: 'xyz', y: 2 },
]

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

let psP = [
    { a: 1, b: 0.2 },
    { a: 3, b: 1.2 },
    { a: 4, b: 2 },
]

x = 0
r = interp1(ps, x)
console.log(`linear: x=${x}`, 'r=' + JSON.stringify(r))
// => linear: x=0 r={"err":"x[0] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":0,"trend":"increasing sequence","xmin":1,"xmax":4}}

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
// => linear: x=5 r={"err":"x[5] greater than upper limit[4]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":5,"trend":"increasing sequence","xmin":1,"xmax":4}}

x = -1
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=-1 r={"err":"x[-1] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":-1,"trend":"increasing sequence","xmin":1,"xmax":4}}

x = 0.51
r = interp1(ps, x, opt)
console.log(`stairs: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs: x=0.51 r={"err":"x[0.51] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":0.51,"trend":"increasing sequence","xmin":1,"xmax":4}}

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
// => stairs: x=4.5 r={"err":"x[4.5] greater than upper limit[4]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":4.5,"trend":"increasing sequence","xmin":1,"xmax":4}}

x = -1
r = interp1(ps, x, optX)
console.log(`stairs with x-limit: x=${x}`, 'r=' + JSON.stringify(r))
// => stairs with x-limit: x=-1 r={"err":"x[-1] less than lower limit[0]","data":{"ps":[{"x":0,"y":0.2},{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2},{"x":4.5,"y":2}],"x":-1,"trend":"increasing sequence","xmin":0,"xmax":4.5}}

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
// => stairs with x-limit: x=4.51 r={"err":"x[4.51] greater than upper limit[4.5]","data":{"ps":[{"x":0,"y":0.2},{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2},{"x":4.5,"y":2}],"x":4.51,"trend":"increasing sequence","xmin":0,"xmax":4.5}}

x = 0
r = interp1(psP, x, optP)
console.log(`linear by keyX & keyY: x=${x}`, 'r=' + JSON.stringify(r))
// => linear by keyX & keyY: x=0 r={"err":"x[0] less than lower limit[1]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":0,"trend":"increasing sequence","xmin":1,"xmax":4}}

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
// => linear by keyX & keyY: x=5 r={"err":"x[5] greater than upper limit[4]","data":{"ps":[{"x":1,"y":0.2},{"x":3,"y":1.2},{"x":4,"y":2}],"x":5,"trend":"increasing sequence","xmin":1,"xmax":4}}

//node --experimental-modules --es-module-specifier-resolution=node g.mjs

