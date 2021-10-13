import isu8arr from './isu8arr.mjs'
import isu16arr from './isu16arr.mjs'
import isstr from './isstr.mjs'
import strleft from './strleft.mjs'
import strdelleft from './strdelleft.mjs'
import u8arr2b64 from './u8arr2b64.mjs'
import b642u8arr from './b642u8arr.mjs'
import u16arr2b64 from './u16arr2b64.mjs'
import b642u16arr from './b642u16arr.mjs'


let tagU8A = '[Uint8Array]::'
function _u8arr2b64(v) {
    if (isu8arr(v)) {
        return tagU8A + u8arr2b64(v)
    }
    return v
}
function _b642u8arr(v) {
    if (isstr(v)) {
        if (strleft(v, tagU8A.length) === tagU8A) {
            v = strdelleft(v, tagU8A.length)
            return b642u8arr(v)
        }
    }
    return v
}


let tagU16A = '[Uint16Array]::'
function _u16arr2b64(v) {
    if (isu16arr(v)) {
        return tagU16A + u16arr2b64(v)
    }
    return v
}
function _b642u16arr(v) {
    if (isstr(v)) {
        if (strleft(v, tagU16A.length) === tagU16A) {
            v = strdelleft(v, tagU16A.length)
            return b642u16arr(v)
        }
    }
    return v
}


let cv = {
    tagU8A,
    u8arr2b64: _u8arr2b64,
    b642u8arr: _b642u8arr,
    tagU16A,
    u16arr2b64: _u16arr2b64,
    b642u16arr: _b642u16arr,
}

export default cv
