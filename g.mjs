import fs from 'fs'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsDeleteFile from './src/fsDeleteFile.mjs'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import fsSrlog from './src/fsSrlog.mjs'
import dig from './src/dig.mjs'
import estimateTicks from './src/estimateTicks.mjs'


let rmin = null
let rmax = null
let r = null

// -4.66~-3.11
rmin = -4.66
rmax = -3.11
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin -4.66 rmax -3.11 r { tickNum: 3, tickInterval: 0.8, tickPositions: [ -4.7, -3.9, -3.1 ] }

// 0~0.9
rmin = 0
rmax = 0.9
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0 rmax 0.9 r { tickNum: 3, tickInterval: 0.5, tickPositions: [ 0, 0.5, 1 ] }

// 0~1
rmin = 0
rmax = 1
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0 rmax 1 r { tickNum: 3, tickInterval: 0.5, tickPositions: [ 0, 0.5, 1 ] }

// 0~99
rmin = 0
rmax = 99
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0 rmax 99 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] }

// 0~100
rmin = 0
rmax = 100
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0 rmax 100 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] }

// 0.1~0.9
rmin = 0.1
rmax = 0.9
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0.1 rmax 0.9 r { tickNum: 3, tickInterval: 0.4, tickPositions: [ 0.1, 0.5, 0.9 ] }

// 0.1~1
rmin = 0.1
rmax = 1
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0.1 rmax 1 r { tickNum: 3, tickInterval: 0.5, tickPositions: [ 0, 0.5, 1 ] }

// 0.1~99
rmin = 0.1
rmax = 99
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0.1 rmax 99 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] }

// 0.1~100
rmin = 0.1
rmax = 100
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0.1 rmax 100 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] }

// 0.1~100.1
rmin = 0.1
rmax = 100.1
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0.1 rmax 100.1 r { tickNum: 4, tickInterval: 34, tickPositions: [ 0, 34, 68, 102 ] }

// 0.89~0.9
rmin = 0.89
rmax = 0.9
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0.89 rmax 0.9 r { tickNum: 3, tickInterval: 0.01, tickPositions: [ 0.88, 0.89, 0.9 ] }

// 0.89~1
rmin = 0.89
rmax = 1
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0.89 rmax 1 r { tickNum: 3, tickInterval: 0.1, tickPositions: [ 0.8, 0.9, 1 ] }

// 0.89~99
rmin = 0.89
rmax = 99
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0.89 rmax 99 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] }

// 0.89~100
rmin = 0.89
rmax = 100
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0.89 rmax 100 r { tickNum: 3, tickInterval: 50, tickPositions: [ 0, 50, 100 ] }

// 0.89~100.89
rmin = 0.89
rmax = 100.89
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 0.89 rmax 100.89 r { tickNum: 4, tickInterval: 34, tickPositions: [ 0, 34, 68, 102 ] }

// 50.89~99
rmin = 50.89
rmax = 99
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 50.89 rmax 99 r { tickNum: 3, tickInterval: 25, tickPositions: [ 50, 75, 100 ] }

// 50.89~100
rmin = 50.89
rmax = 100
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 50.89 rmax 100 r { tickNum: 3, tickInterval: 25, tickPositions: [ 50, 75, 100 ] }

// 90.89~99
rmin = 90.89
rmax = 99
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 90.89 rmax 99 r { tickNum: 4, tickInterval: 3, tickPositions: [ 90, 93, 96, 99 ] }

// 90.89~100
rmin = 90.89
rmax = 100
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 90.89 rmax 100 r { tickNum: 3, tickInterval: 5, tickPositions: [ 90, 95, 100 ] }

// 98.9~99
rmin = 98.9
rmax = 99
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 98.9 rmax 99 r { tickNum: 3, tickInterval: 1, tickPositions: [ 98, 99, 100 ] }

// 98.9~100
rmin = 98.9
rmax = 100
r = estimateTicks(rmin, rmax)
console.log('rmin', rmin, 'rmax', rmax, 'r', r)
// => rmin 98.9 rmax 100 r { tickNum: 3, tickInterval: 1, tickPositions: [ 98, 99, 100 ] }

//node g.mjs
