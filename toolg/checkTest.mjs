import fs from 'fs'
import _ from 'lodash'
import getFiles from 'w-package-tools/src/getFiles.mjs'


//fdSrc, fdTest
let fdSrc = './src/'
let fdTest = './test/'

//ltfsSrc
let ltfsSrc = getFiles(fdSrc)
ltfsSrc = _.filter(ltfsSrc, (v) => {
    return v.substring(0, 1) !== '_'
})
ltfsSrc = _.map(ltfsSrc, (v) => {
    return v.replace('.mjs', '')
})
ltfsSrc = _.filter(ltfsSrc, (v) => {
    return v.indexOf('index.mjs') < 0
})
console.log('size ltfsSrc', _.size(ltfsSrc))

let ltfsTest = getFiles(fdTest)
ltfsTest = _.map(ltfsTest, (v) => {
    return v.replace('.test.mjs', '')
})
console.log('size ltfsTest', _.size(ltfsTest))

//diff
let ltfs = [...ltfsSrc, ...ltfsTest]
let gs = _.groupBy(ltfs)
let r = []
_.each(gs, (v, k) => {
    if (_.size(v) !== 2) {
        r.push(`${k}`)
    }
})
console.log(r)

//node --experimental-modules --es-module-specifier-resolution=node toolg/checkTest.mjs

