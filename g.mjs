import fs from 'fs'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsIsFile from './src/fsIsFile.mjs'
import fsDeleteFile from './src/fsDeleteFile.mjs'
import fsIsFolder from './src/fsIsFolder.mjs'
import fsCleanFolder from './src/fsCleanFolder.mjs'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import fsWriteText from './src/fsWriteText.mjs'
import fsWriteJson from './src/fsWriteJson.mjs'
import arrSort from './src/arrSort.mjs'
import isUserPW from './src/isUserPW.mjs'

let r = null

try {
    r = isUserPW('Asdf%1234')
}
catch (err) {
    r = err.message
}
console.log(r)
// => true

try {
    r = isUserPW('123456')
}
catch (err) {
    r = err.message
}
console.log(r)
// => 密碼長度須大於等於8個字元,密碼須包含大寫、小寫英文、數字、特殊符號各1個字元

try {
    r = isUserPW('12345678')
}
catch (err) {
    r = err.message
}
console.log(r)
// => 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元

try {
    r = isUserPW('abcdefgh')
}
catch (err) {
    r = err.message
}
console.log(r)
// => 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元

try {
    r = isUserPW('asdf1234')
}
catch (err) {
    r = err.message
}
console.log(r)
// => 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元

try {
    r = isUserPW('123456789012345678901234567890a')
}
catch (err) {
    r = err.message
}
console.log(r)
// => 密碼長度須小於等於30個字元, 密碼須包含大寫、小寫英文、數字、特殊符號各1個字元

try {
    r = isUserPW('')
}
catch (err) {
    r = err.message
}
console.log(r)
// => 密碼長度須大於等於8個字元,密碼須包含大寫、小寫英文、數字、特殊符號各1個字元


//node g.mjs
