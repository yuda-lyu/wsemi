import isu8arr from './isu8arr.mjs'
import isu16arr from './isu16arr.mjs'
import isstr from './isstr.mjs'
import u8arr2b64 from './u8arr2b64.mjs'
import b642u8arr from './b642u8arr.mjs'
import u16arr2b64 from './u16arr2b64.mjs'
import b642u16arr from './b642u16arr.mjs'


//標記與跳脫記號
//二進位數據於JSON內以'[Uint8Array]::<base64>'一類標記代表, 解碼端須完整匹配整個字串值(錨定^與$)且base64部份須合法字元集, 否則應用字串只要以標記開頭即被誤判為二進位, 且非法base64會被靜默解成垃圾位元組
//應用字串若恰與標記格式完整相同, 由編碼端前置跳脫記號區分, 解碼端剝除一層還原; 跳脫可重複故以*涵蓋多層
let tagEsc = '[BlazeForPreventEscape]'
let reNeedEsc = /^(?:\[BlazeForPreventEscape\])*\[(?:Uint8Array|Uint16Array)\]::[A-Za-z0-9+/]*={0,2}$/
let reEsced = /^\[BlazeForPreventEscape\](?:\[BlazeForPreventEscape\])*\[(?:Uint8Array|Uint16Array)\]::[A-Za-z0-9+/]*={0,2}$/


//_escape, 編碼端於轉換二進位之前先行套用, 只對字串生效故二進位不受影響
function _escape(v) {
    if (isstr(v) && v.charCodeAt(0) === 91 && reNeedEsc.test(v)) {
        return tagEsc + v
    }
    return v
}


//_unescape, 解碼端於還原二進位之後才套用, 已還原為二進位者非字串故不受影響
function _unescape(v) {
    if (isstr(v) && v.charCodeAt(0) === 91 && reEsced.test(v)) {
        return v.slice(tagEsc.length)
    }
    return v
}


let tagU8A = '[Uint8Array]::'
let reU8A = /^\[Uint8Array\]::([A-Za-z0-9+/]*={0,2})$/
function _u8arr2b64(v) {
    if (isu8arr(v)) {
        return tagU8A + u8arr2b64(v)
    }
    return v
}
function _b642u8arr(v) {
    if (isstr(v) && v.charCodeAt(0) === 91) {
        let m = reU8A.exec(v)
        if (m !== null) {
            return b642u8arr(m[1])
        }
    }
    return v
}


let tagU16A = '[Uint16Array]::'
let reU16A = /^\[Uint16Array\]::([A-Za-z0-9+/]*={0,2})$/
function _u16arr2b64(v) {
    if (isu16arr(v)) {
        return tagU16A + u16arr2b64(v)
    }
    return v
}
function _b642u16arr(v) {
    if (isstr(v) && v.charCodeAt(0) === 91) {
        let m = reU16A.exec(v)
        if (m !== null) {
            return b642u16arr(m[1])
        }
    }
    return v
}


let cv = {
    tagEsc,
    escape: _escape,
    unescape: _unescape,
    tagU8A,
    u8arr2b64: _u8arr2b64,
    b642u8arr: _b642u8arr,
    tagU16A,
    u16arr2b64: _u16arr2b64,
    b642u16arr: _b642u16arr,
}

export default cv
