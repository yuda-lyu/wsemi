import isErr from './isErr.mjs'
import isobj from './isobj.mjs'
import isarr from './isarr.mjs'
import isstr from './isstr.mjs'
import cstr from './cstr.mjs'
import haskey from './haskey.mjs'


/**
 * 提取Error內Message訊息
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getErrorMessage.test.mjs Github}
 * @memberOf wsemi
 * @param {Error} err 傳入錯誤訊息
 * @returns {String} 回傳錯誤訊息的message字串
 * @example
 *
 * try {
 *     throw new Error('something wrong')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => something wrong
 *
 * try {
 *     throw new Error()
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => ''
 *
 * try {
 *     throw new TypeError('wrong type')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => wrong type
 *
 * try {
 *     throw new RangeError('range bad')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => range bad
 *
 * try {
 *     throw new ReferenceError('ref bad')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => ref bad
 *
 * try {
 *     throw new SyntaxError('syntax bad')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => syntax bad
 *
 * try {
 *     throw new URIError('uri bad')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => uri bad
 *
 * try {
 *     throw new AggregateError([new Error('e1'), 'e2'], 'outer')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => outer
 *
 * try {
 *     throw new Error('top', { cause: new Error('root cause') })
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => top
 *
 * try {
 *     throw new DOMException('operation was aborted.', 'AbortError')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => operation was aborted.
 *
 * try {
 *     throw fs.readFileSync('definitely_not_exists_1234567890.txt')
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => ENOENT: no such file or directory, open ...
 *
 * let test1 = async() => {
 *     return Promise.reject('promise reject')
 * }
 * try {
 *     await test1()
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => promise reject
 *
 * let test2 = async() => {
 *     throw new Error('something wrong')
 * }
 * try {
 *     await test2()
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => something wrong
 *
 * let test3 = async() => {
 *     throw new Error()
 * }
 * try {
 *     await test3()
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => ''
 *
 * let test4 = async() => {
 *     throw new TypeError('wrong type')
 * }
 * try {
 *     await test4()
 * }
 * catch (err) {
 *     console.log(getErrorMessage(err))
 * }
 * // => wrong type
 *
 */
function getErrorMessage(err) {

    let errMsg = ''
    if (isErr(err)) { //err instanceof Error
        // console.log(`instanceof(err)`)
        errMsg = err.message
    }
    else if (isstr(err)) {
        // console.log(`isstr(err)`)
        return err
    }
    else if (isobj(err)) {
        // console.log(`isobj(err)`)
        if (haskey(err, 'message')) {
            return err.message
        }
        else {
            return JSON.stringify(err)
        }
    }
    else if (isarr(err)) {
        // console.log(`isarr(err)`)
        return JSON.stringify(err)
    }
    else {
        // console.log(`cstr(err)`)
        errMsg = cstr(err)
    }

    return errMsg
}


export default getErrorMessage
