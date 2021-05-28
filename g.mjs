import oc from './src/color.mjs'

let r
let c1
let c2

c1 = '#cd'
c2 = 'hsl (320, 50%, 40%)'
r = oc.mix(c1, 0.5, c2, 0.5, 'toRgbString')
console.log(r)
// => rgb(179, 128, 162)

c1 = '#cd'
c2 = 'hsl (320, 50%, 40%)'
r = oc.mix(c1, 0, c2, 1, 'toRgbString')
console.log(r)
// => rgb(153, 51, 119)

c1 = '#cd'
c2 = 'hsl (320, 50%, 40%)'
r = oc.mix(c1, 0, c2, 0, 'toRgbString')
console.log(r)
// => rgb(0, 0, 0)

c1 = 'rgb(250, 120, 50)'
c2 = 'hsva (320, 100%, 50%, 0.1)'
r = oc.mix(c1, 0.5, c2, 0.5, 'toRgba')
console.log(r)
// => { r: 189, g: 60, b: 68, a: 0.55 }


//node --experimental-modules --es-module-specifier-resolution=node g.mjs
