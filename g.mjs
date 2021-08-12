import timemsTZ2hour from './src/timemsTZ2hour.mjs'

console.log(timemsTZ2hour('2019-01-02T12:34:56.987+08:00'))
console.log(timemsTZ2hour('2019-01-02T12:34:56.987Z'))

//node --experimental-modules --es-module-specifier-resolution=node g.mjs
