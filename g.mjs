import fs from 'fs'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsDeleteFile from './src/fsDeleteFile.mjs'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import genPm from './src/genPm.mjs'
import getErrorMessage from './src/getErrorMessage.mjs'


try {
    throw new Error('something wrong')
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => something wrong

try {
    throw new Error()
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => ''

try {
    throw new TypeError('wrong type')
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => wrong type

try {
    throw new RangeError('range bad')
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => range bad

try {
    throw new ReferenceError('ref bad')
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => ref bad

try {
    throw new SyntaxError('syntax bad')
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => syntax bad

try {
    throw new URIError('uri bad')
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => uri bad

try {
    throw new AggregateError([new Error('e1'), 'e2'], 'outer')
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => outer

try {
    throw new Error('top', { cause: new Error('root cause') })
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => top

try {
    throw new DOMException('operation was aborted.', 'AbortError')
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => operation was aborted.

try {
    throw fs.readFileSync('definitely_not_exists_1234567890.txt')
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => ENOENT: no such file or directory, open ...

let test1 = async() => {
    return Promise.reject('promise reject')
}
try {
    await test1()
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => promise reject

let test2 = async() => {
    throw new Error('something wrong')
}
try {
    await test2()
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => something wrong

let test3 = async() => {
    throw new Error()
}
try {
    await test3()
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => ''

let test4 = async() => {
    throw new TypeError('wrong type')
}
try {
    await test4()
}
catch (err) {
    console.log(getErrorMessage(err))
}
// => wrong type

//node g.mjs
