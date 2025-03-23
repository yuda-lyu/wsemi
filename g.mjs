import _ from 'lodash-es'
import isDate from './src/isDate.mjs'

let c

c = '2019-01-01T12:34:56:7891+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:7891+08:00 false Invalid Date

c = '2019-01-01T12:34:56.7891+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56.7891+08:00 true 2019-01-01T04:34:56.789Z

c = '2019-01-01T12:34:56:789+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:789+08:00 false Invalid Date

c = '2019-01-01T12:34:56.789+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56.789+08:00 true 2019-01-01T04:34:56.789Z

c = '2019-01-01T12:34:56:78+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:78+08:00 false Invalid Date

c = '2019-01-01T12:34:56.78+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56.78+08:00 true 2019-01-01T04:34:56.780Z

c = '2019-01-01T12:34:56+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56+08:00 true 2019-01-01T04:34:56.000Z

c = '2019-01-01T12:34+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34+08:00 true 2019-01-01T04:34:00.000Z

c = '2019-01-01T12+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12+08:00 false Invalid Date

c = '2019-01-01+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01+08:00 false Invalid Date

c = '2019-01+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019-01+08:00 false Invalid Date

c = '2019+08:00'
console.log(c, isDate(c), new Date(c))
// => 2019+08:00 false Invalid Date

c = '2019-01-01T12:34:56:7891Z'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:7891Z false Invalid Date

c = '2019-01-01T12:34:56.7891Z'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56.7891Z true 2019-01-01T12:34:56.789Z

c = '2019-01-01T12:34:56:789Z'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56.789Z true 2019-01-01T12:34:56.789Z

c = '2019-01-01T12:34:56.789Z'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:789Z false Invalid Date

c = '2019-01-01T12:34:56:78Z'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:78Z false Invalid Date

c = '2019-01-01T12:34:56.78Z'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56.78Z true 2019-01-01T12:34:56.780Z

c = '2019-01-01T12:34:56Z'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56Z true 2019-01-01T12:34:56.000Z

c = '2019-01-01T12:34Z'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34Z true 2019-01-01T12:34:00.000Z

c = '2019-01-01T12Z'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12Z false Invalid Date

c = '2019-01-01Z'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01Z true 2019-01-01T00:00:00.000Z

c = '2019-01Z'
console.log(c, isDate(c), new Date(c))
// => 2019-01Z true 2019-01-01T00:00:00.000Z

c = '2019Z'
console.log(c, isDate(c), new Date(c))
// => 2019Z true 2019-01-01T00:00:00.000Z

c = '2019-01-01T12:34:56:7891'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:7891 false Invalid Date

c = '2019-01-01T12:34:56.7891'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56.7891 true 2019-01-01T04:34:56.789Z

c = '2019-01-01T12:34:56:789'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:789 false Invalid Date

c = '2019-01-01T12:34:56.789'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56.789 true 2019-01-01T04:34:56.789Z

c = '2019-01-01T12:34:56:78'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:78 false Invalid Date

c = '2019-01-01T12:34:56.78'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56.78 true 2019-01-01T04:34:56.780Z

c = '2019-01-01T12:34:56'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56 true 2019-01-01T04:34:56.000Z

c = '2019-01-01T12:34'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34 true 2019-01-01T04:34:00.000Z

c = '2019-01-01T12'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12 false Invalid Date

c = '2019-01-01'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01 true 2019-01-01T00:00:00.000Z

c = '2019-01'
console.log(c, isDate(c), new Date(c))
// => 2019-01 true 2019-01-01T00:00:00.000Z

c = '2019'
console.log(c, isDate(c), new Date(c))
// => 2019 true 2019-01-01T00:00:00.000Z

c = '2019-01-01T12:34:56A'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56A false Invalid Date

c = '1256'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:789+08:00 false Invalid Date

c = '1.25'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:789+08:00 false Invalid Date

c = '-1.25'
console.log(c, isDate(c), new Date(c))
// => 2019-01-01T12:34:56:789+08:00 false Invalid Date

//node --experimental-modules g.mjs
