import fs from 'fs'
import _ from 'lodash-es'
import getFiles from 'w-package-tools/src/getFiles.mjs'


//fdSrc, fdTest
let fdSrc = './src/'
let fdTest = './test/'

//ltfsSrc
let ltfsSrc = getFiles(fdSrc)
ltfsSrc = _.filter(ltfsSrc, (v) => {
    return v.substring(0, 1) !== '_'
})
ltfsSrc = _.filter(ltfsSrc, (v) => {
    return v !== 'index.mjs'
})
ltfsSrc = _.map(ltfsSrc, (v) => {
    return v.replace('.mjs', '')
})
// console.log('size ltfsSrc', _.size(ltfsSrc))

let ltfsTest = getFiles(fdTest)
ltfsTest = _.map(ltfsTest, (v) => {
    return v.replace('.test.mjs', '')
})
// console.log('size ltfsTest', _.size(ltfsTest))

//diff
let ltfs = [...ltfsSrc, ...ltfsTest]
let gs = _.groupBy(ltfs)
let r = []
_.each(gs, (v, k) => {
    if (_.size(v) !== 2) {
        r.push(`${k}`)
    }
})
if (_.size(r) === 0) {
    console.log('matched')
}
else {
    console.log(r)
}


//node toolg/checkTest.mjs

