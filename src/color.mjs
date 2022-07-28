import trim from 'lodash/trim'
import get from 'lodash/get'
import map from 'lodash/map'
import each from 'lodash/each'
import size from 'lodash/size'
import keys from 'lodash/keys'
import round from 'lodash/round'
import sortBy from 'lodash/sortBy'
import toLower from 'lodash/toLower'
import toUpper from 'lodash/toUpper'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import isnum from './isnum.mjs'
import isarr from './isarr.mjs'
import isint from './isint.mjs'
import strleft from './strleft.mjs'
import strdelleft from './strdelleft.mjs'
import replace from './replace.mjs'
import sep from './sep.mjs'
import cdbl from './cdbl.mjs'
import cstr from './cstr.mjs'
import cint from './cint.mjs'
import haskey from './haskey.mjs'
import strmid from './strmid.mjs'


//svg-color
let kpColorNames = {
    aliceblue: 'f0f8ff',
    antiquewhite: 'faebd7',
    aqua: '0ff',
    aquamarine: '7fffd4',
    azure: 'f0ffff',
    beige: 'f5f5dc',
    bisque: 'ffe4c4',
    black: '000',
    blanchedalmond: 'ffebcd',
    blue: '00f',
    blueviolet: '8a2be2',
    brown: 'a52a2a',
    burlywood: 'deb887',
    burntsienna: 'ea7e5d',
    cadetblue: '5f9ea0',
    chartreuse: '7fff00',
    chocolate: 'd2691e',
    coral: 'ff7f50',
    cornflowerblue: '6495ed',
    cornsilk: 'fff8dc',
    crimson: 'dc143c',
    cyan: '0ff',
    darkblue: '00008b',
    darkcyan: '008b8b',
    darkgoldenrod: 'b8860b',
    darkgray: 'a9a9a9',
    darkgreen: '006400',
    darkgrey: 'a9a9a9',
    darkkhaki: 'bdb76b',
    darkmagenta: '8b008b',
    darkolivegreen: '556b2f',
    darkorange: 'ff8c00',
    darkorchid: '9932cc',
    darkred: '8b0000',
    darksalmon: 'e9967a',
    darkseagreen: '8fbc8f',
    darkslateblue: '483d8b',
    darkslategray: '2f4f4f',
    darkslategrey: '2f4f4f',
    darkturquoise: '00ced1',
    darkviolet: '9400d3',
    deeppink: 'ff1493',
    deepskyblue: '00bfff',
    dimgray: '696969',
    dimgrey: '696969',
    dodgerblue: '1e90ff',
    firebrick: 'b22222',
    floralwhite: 'fffaf0',
    forestgreen: '228b22',
    fuchsia: 'f0f',
    gainsboro: 'dcdcdc',
    ghostwhite: 'f8f8ff',
    gold: 'ffd700',
    goldenrod: 'daa520',
    gray: '808080',
    green: '008000',
    greenyellow: 'adff2f',
    grey: '808080',
    honeydew: 'f0fff0',
    hotpink: 'ff69b4',
    indianred: 'cd5c5c',
    indigo: '4b0082',
    ivory: 'fffff0',
    khaki: 'f0e68c',
    lavender: 'e6e6fa',
    lavenderblush: 'fff0f5',
    lawngreen: '7cfc00',
    lemonchiffon: 'fffacd',
    lightblue: 'add8e6',
    lightcoral: 'f08080',
    lightcyan: 'e0ffff',
    lightgoldenrodyellow: 'fafad2',
    lightgray: 'd3d3d3',
    lightgreen: '90ee90',
    lightgrey: 'd3d3d3',
    lightpink: 'ffb6c1',
    lightsalmon: 'ffa07a',
    lightseagreen: '20b2aa',
    lightskyblue: '87cefa',
    lightslategray: '789',
    lightslategrey: '789',
    lightsteelblue: 'b0c4de',
    lightyellow: 'ffffe0',
    lime: '0f0',
    limegreen: '32cd32',
    linen: 'faf0e6',
    magenta: 'f0f',
    maroon: '800000',
    mediumaquamarine: '66cdaa',
    mediumblue: '0000cd',
    mediumorchid: 'ba55d3',
    mediumpurple: '9370db',
    mediumseagreen: '3cb371',
    mediumslateblue: '7b68ee',
    mediumspringgreen: '00fa9a',
    mediumturquoise: '48d1cc',
    mediumvioletred: 'c71585',
    midnightblue: '191970',
    mintcream: 'f5fffa',
    mistyrose: 'ffe4e1',
    moccasin: 'ffe4b5',
    navajowhite: 'ffdead',
    navy: '000080',
    oldlace: 'fdf5e6',
    olive: '808000',
    olivedrab: '6b8e23',
    orange: 'ffa500',
    orangered: 'ff4500',
    orchid: 'da70d6',
    palegoldenrod: 'eee8aa',
    palegreen: '98fb98',
    paleturquoise: 'afeeee',
    palevioletred: 'db7093',
    papayawhip: 'ffefd5',
    peachpuff: 'ffdab9',
    peru: 'cd853f',
    pink: 'ffc0cb',
    plum: 'dda0dd',
    powderblue: 'b0e0e6',
    purple: '800080',
    rebeccapurple: '663399',
    red: 'f00',
    rosybrown: 'bc8f8f',
    royalblue: '4169e1',
    saddlebrown: '8b4513',
    salmon: 'fa8072',
    sandybrown: 'f4a460',
    seagreen: '2e8b57',
    seashell: 'fff5ee',
    sienna: 'a0522d',
    silver: 'c0c0c0',
    skyblue: '87ceeb',
    slateblue: '6a5acd',
    slategray: '708090',
    slategrey: '708090',
    snow: 'fffafa',
    springgreen: '00ff7f',
    steelblue: '4682b4',
    tan: 'd2b48c',
    teal: '008080',
    thistle: 'd8bfd8',
    tomato: 'ff6347',
    turquoise: '40e0d0',
    violet: 'ee82ee',
    wheat: 'f5deb3',
    white: 'fff',
    whitesmoke: 'f5f5f5',
    yellow: 'ff0',
    yellowgreen: '9acd32'
}


function strIsHex(cc) {
    if (strleft(cc, 1) !== '#') {
        return false
    }
    let re1 = /[0-9A-Fa-f]{2}/g
    let b1 = re1.test(cc)
    if (b1) {
        return true
    }
    let re2 = /[0-9A-Fa-f]{3}/g
    let b2 = re2.test(cc)
    if (b2) {
        return true
    }
    let re3 = /[0-9A-Fa-f]{6}/g
    let b3 = re3.test(cc)
    if (b3) {
        return true
    }
    let re4 = /[0-9A-Fa-f]{8}/g
    let b4 = re4.test(cc)
    if (b4) {
        return true
    }
    return false
}


function strIsName(cc) {
    return haskey(kpColorNames, cc)
}


function strIsRgba(cc) {
    return strleft(cc, 3) === 'rgb' || strleft(cc, 4) === 'rgba'
}


function strIsHsla(cc) {
    return strleft(cc, 3) === 'hsl' || strleft(cc, 4) === 'hsla'
}


function strIsHsva(cc) {
    return strleft(cc, 3) === 'hsv' || strleft(cc, 4) === 'hsva'
}


function name2hex(key) {
    let hex = kpColorNames[key]
    return `#${hex}`
}


function strCvFrom01AndPercent(cc) {
    return strCvFromPercent(cc, 1)
}


function strCvFrom0255AndPercent(cc) {
    return strCvFromPercent(cc, 255)
}


function strCvFrom0360AndPercent(cc) {
    return strCvFromPercent(cc, 360)
}


function strCvFromPercent(cc, defValue = 1) {
    if (cc.indexOf('%') >= 0) {
        cc = replace(cc, '%', '')
        if (!isnum(cc)) {
            throw new Error('invalid color: value is not a number')
        }
        cc = cdbl(cc) / 100 //百分比值0~100, 轉0~1分佈
    }
    else {
        if (!isnum(cc)) {
            throw new Error('invalid color: value is not a number')
        }
        cc = cdbl(cc) / defValue //基於defValue轉0~1分佈
    }
    if (cc > 1) {
        throw new Error('invalid color: value > 1')
    }
    else if (cc < 0) {
        throw new Error('invalid color: value < 0')
    }
    return cc //回傳0~1
}


function strCvFrom01(cc) {
    if (!isnum(cc)) {
        throw new Error('invalid color: value is not a number')
    }
    cc = cdbl(cc)
    if (cc > 1) {
        throw new Error('invalid color: value > 1')
    }
    else if (cc < 0) {
        throw new Error('invalid color: value < 0')
    }
    return cc //回傳0~1
}


function strExtract4(arr, tar = 'rgba') {
    if (!isarr(arr)) {
        throw new Error('invalid colors array')
    }
    let v0 = get(arr, 0, 0)
    let v1 = get(arr, 1, 0)
    let v2 = get(arr, 2, 0)
    let v3 = get(arr, 3, 1) //alpha無則預設給1
    tar = tar.split('')
    if (size(tar) !== 4) {
        throw new Error('tar.length !== 4')
    }
    let t0 = get(tar, 0)
    let t1 = get(tar, 1)
    let t2 = get(tar, 2)
    let t3 = get(tar, 3)
    return {
        [t0]: v0,
        [t1]: v1,
        [t2]: v2,
        [t3]: v3,
    }
}


function strParseHex8(cc) {
    cc = strdelleft(cc, 1) //刪除#
    let n = size(cc)
    if (n === 2) {
        cc = `${cc}${cc}${cc}ff`
    }
    else if (n === 3) {
        let c0 = strmid(cc, 0, 1)
        let c1 = strmid(cc, 1, 1)
        let c2 = strmid(cc, 2, 1)
        cc = `${c0}${c0}${c1}${c1}${c2}${c2}ff`
    }
    else if (n === 6) {
        cc = `${cc}ff`
    }
    else if (n === 8) {
        //hex含alpha
    }
    else {
        throw new Error('invalid hex color')
    }
    function gvhex(c) {
        if (size(c) !== 2) {
            throw new Error('hex.length of color is not equal to 2')
        }
        c = parseInt(c, 16)
        if (!isnum(c)) {
            throw new Error('invalid hex of color')
        }
        c = cdbl(c)
        return c / 255 //回傳0~1
    }
    let r = gvhex(strmid(cc, 0, 2))
    let g = gvhex(strmid(cc, 2, 2))
    let b = gvhex(strmid(cc, 4, 2))
    let a = gvhex(strmid(cc, 6, 2))
    return {
        r, g, b, a
    }
}


function strParseRgba(cc) {
    //string: rgb (255, 0, 0)
    //string: rgb (255 200 30)
    //string: rgb (50%, 12%, 8%)
    //string: rgb (50% 12% 8%)
    //string: rgb 255, 0, 0
    //string: rgb 255 200 30
    //string: rgb 50%, 12%, 8%
    //string: rgb 50% 12% 8%

    //string: rgba (255, 0, 0, 0.1)
    //string: rgba (255 200 30 0.1)
    //string: rgba (50%, 12%, 8%, 0.1)
    //string: rgba (50% 12% 8% 0.1)
    //string: rgba 255, 0, 0, 0.1
    //string: rgba 255 200 30 0.1
    //string: rgba 50%, 12%, 8%, 0.1
    //string: rgba 50% 12% 8% 0.1
    cc = replace(cc, 'rgba', '') //要先取代, 否則先取待rgb會剩下a而出錯
    cc = replace(cc, 'rgb', '')
    cc = cc.replace(/[()]/g, '')
    cc = replace(cc, ',', ' ')
    let s = sep(cc, ' ')
    return strParseRgbaCore(s)
}


function strParseRgbaCore(s) {
    s = map(s, (v, k) => {
        if (k <= 2) {
            return strCvFrom0255AndPercent(v)
        }
        else if (k === 3) {
            return strCvFrom01(v)
        }
        return null
    })
    s = strExtract4(s, 'rgba')
    return s
}


function strParseHsla(cc) {
    //string: hsl (320, 100%, 50%)
    //string: hsl (320 100% 50%)
    //string: hsl (320, 1, 0.5)
    //string: hsl (320 1 0.5)
    //string: hsl 320, 100%, 50%
    //string: hsl 320 100% 50%
    //string: hsl 320, 1, 0.5
    //string: hsl 320 1 0.5

    //string: hsla (320, 100%, 50%, 0.1)
    //string: hsla (320 100% 50% 0.1)
    //string: hsla (320, 1, 0.5, 0.1)
    //string: hsla (320 1 0.5 0.1)
    //string: hsla 320, 100%, 50%, 0.1
    //string: hsla 320 100% 50% 0.1
    //string: hsla 320, 1, 0.5, 0.1
    //string: hsla 320 1 0.5 0.1
    cc = replace(cc, 'hsla', '')
    cc = replace(cc, 'hsl', '')
    cc = cc.replace(/[()]/g, '')
    cc = replace(cc, ',', ' ')
    let s = sep(cc, ' ')
    return strParseHslaCore(s)
}


function strParseHslaCore(s) {
    s = map(s, (v, k) => {
        if (k === 0) {
            return strCvFrom0360AndPercent(v)
        }
        else if (k === 1 || k === 2) {
            return strCvFrom01AndPercent(v)
        }
        else if (k === 3) {
            return strCvFrom01(v)
        }
        return null
    })
    s = strExtract4(s, 'hsla')
    s = hsla2Rgba(s)
    return s
}


function strParseHsva(cc) {
    //string: hsv (320, 100%, 50%)
    //string: hsv (320 100% 50%)
    //string: hsv (320, 1, 0.5)
    //string: hsv (320 1 0.5)
    //string: hsv 320, 100%, 50%
    //string: hsv 320 100% 50%
    //string: hsv 320, 1, 0.5
    //string: hsv 320 1 0.5

    //string: hsva (320, 100%, 50%, 0.1)
    //string: hsva (320 100% 50% 0.1)
    //string: hsva (320, 1, 0.5, 0.1)
    //string: hsva (320 1 0.5 0.1)
    //string: hsva 320, 100%, 50%, 0.1
    //string: hsva 320 100% 50% 0.1
    //string: hsva 320, 1, 0.5, 0.1
    //string: hsva 320 1 0.5 0.1
    cc = replace(cc, 'hsva', '')
    cc = replace(cc, 'hsv', '')
    cc = cc.replace(/[()]/g, '')
    cc = replace(cc, ',', ' ')
    let s = sep(cc, ' ')
    return strParseHsvaCore(s)
}


function strParseHsvaCore(s) {
    s = map(s, (v, k) => {
        if (k === 0) {
            return strCvFrom0360AndPercent(v)
        }
        else if (k === 1 || k === 2) {
            return strCvFrom01AndPercent(v)
        }
        else if (k === 3) {
            return strCvFrom01(v)
        }
        return null
    })
    s = strExtract4(s, 'hsva')
    s = hsva2Rgba(s)
    return s
}


function parseString(cc) {
    if (cc === 'transparent') {
        return { r: 0, g: 0, b: 0, a: 0 }
    }
    if (strIsName(cc)) {
        cc = name2hex(cc) //轉成hex
        return strParseHex8(cc)
    }
    else if (strIsHex(cc)) {
        return strParseHex8(cc)
    }
    else if (strIsRgba(cc)) {
        return strParseRgba(cc)
    }
    else if (strIsHsla(cc)) {
        return strParseHsla(cc)
    }
    else if (strIsHsva(cc)) {
        return strParseHsva(cc)
    }
    throw new Error('format of color string is not hex-color, name-color, rgba, hsla, hsva')
}


function objHaskey(o, key) {
    key = toLower(key)
    let b1 = haskey(o, key)
    if (b1) {
        return true
    }
    key = toUpper(key)
    let b2 = haskey(o, key)
    if (b2) {
        return true
    }
    return false
}


function objIsRgba(co) {
    let b0 = objHaskey(co, 'r')
    let b1 = objHaskey(co, 'g')
    let b2 = objHaskey(co, 'b')
    return b0 && b1 && b2
}


function objIsHsla(co) {
    let b0 = objHaskey(co, 'h')
    let b1 = objHaskey(co, 's')
    let b2 = objHaskey(co, 'l')
    return b0 && b1 && b2
}


function objIsHsva(co) {
    let b0 = objHaskey(co, 'h')
    let b1 = objHaskey(co, 's')
    let b2 = objHaskey(co, 'v')
    return b0 && b1 && b2
}


function objGet(o, key, def) {
    let v
    v = get(o, key, null)
    if (v !== null) {
        return v
    }
    key = toUpper(key)
    v = get(o, key, null)
    if (v !== null) {
        return v
    }
    return def
}


function objParseRgba(co) {
    //object: { r: 255, g: 150, b: 50 }
    //object: { r: '50%', g: 150, b: 50 }
    //object: { r: '50%', g: '12%', b: '8%' }
    //object: { r: 255, g: 150, b: 50, a: 0.1 }
    //object: { r: '50%', g: 150, b: 50, a: 0.1 }
    //object: { r: '50%', g: '12%', b: '8%', a: 0.1 }
    let s0 = objGet(co, 'r', null)
    let s1 = objGet(co, 'g', null)
    let s2 = objGet(co, 'b', null)
    let s3 = objGet(co, 'a', 1) //alpha若無預設為1
    let s = [s0, s1, s2, s3]
    s = map(s, cstr)
    return strParseRgbaCore(s)
}


function objParseHsla(co) {
    //object: { h: 320, s: 0.2, l: 0.15 }
    //object: { h: 320, s: '12%', l: '8%' }
    //object: { h: '50%', s: 0.2, l: 0.15 }
    //object: { h: '50%', s: '12%', l: '8%' }
    //object: { h: 320, s: 0.2, l: 0.15, a: 0.1 }
    //object: { h: 320, s: '12%', l: '8%', a: 0.1 }
    //object: { h: '50%', s: 0.2, l: 0.15, a: 0.1 }
    //object: { h: '50%', s: '12%', l: '8%', a: 0.1 }
    let s0 = objGet(co, 'h', null)
    let s1 = objGet(co, 's', null)
    let s2 = objGet(co, 'l', null)
    let s3 = objGet(co, 'a', 1) //alpha若無預設為1
    let s = [s0, s1, s2, s3]
    s = map(s, cstr)
    return strParseHslaCore(s)
}


function objParseHsva(co) {
    //object: { h: 320, s: 0.2, v: 0.15 }
    //object: { h: 320, s: '12%', v: '8%' }
    //object: { h: '50%', s: 0.2, v: 0.15 }
    //object: { h: '50%', s: '12%', v: '8%' }
    //object: { h: 320, s: 0.2, v: 0.15, a: 0.1 }
    //object: { h: 320, s: '12%', v: '8%', a: 0.1 }
    //object: { h: '50%', s: 0.2, v: 0.15, a: 0.1 }
    //object: { h: '50%', s: '12%', v: '8%', a: 0.1 }
    let s0 = objGet(co, 'h', null)
    let s1 = objGet(co, 's', null)
    let s2 = objGet(co, 'v', null)
    let s3 = objGet(co, 'a', 1) //alpha若無預設為1
    let s = [s0, s1, s2, s3]
    s = map(s, cstr)
    return strParseHsvaCore(s)
}


function parseObject(co) {
    if (objIsRgba(co)) {
        return objParseRgba(co)
    }
    else if (objIsHsla(co)) {
        return objParseHsla(co)
    }
    else if (objIsHsva(co)) {
        return objParseHsva(co)
    }
    else {
        throw new Error('color object is not rgba, hsla, hsva')
    }
}


function getBrightness(rgba) {
    //Brightness, 亮度
    //http://www.w3.org/TR/AERT#color-contrast
    //r,g,b都0~1, 回傳0~1

    if (rgba.a !== 1) {
        throw new Error('alpha of color can not be equal to 1')
    }
    return (rgba.r * 299 + rgba.g * 587 + rgba.b * 114) / 1000
}


function getLuminance(rgba) {
    //Luminance, 亮度(輝度)
    //https://zh.wikipedia.org/wiki/%E4%BA%AE%E5%BA%A6
    //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
    //r,g,b都0~1, 回傳0~1

    if (rgba.a !== 1) {
        throw new Error('alpha of color can not be equal to 1')
    }
    let r01 = rgba.r
    let g01 = rgba.g
    let b01 = rgba.b
    let R
    let G
    let B

    if (r01 <= 0.03928) {
        R = r01 / 12.92
    }
    else {
        R = Math.pow(((r01 + 0.055) / 1.055), 2.4)
    }
    if (g01 <= 0.03928) {
        G = g01 / 12.92
    }
    else {
        G = Math.pow(((g01 + 0.055) / 1.055), 2.4)
    }
    if (b01 <= 0.03928) {
        B = b01 / 12.92
    }
    else {
        B = Math.pow(((b01 + 0.055) / 1.055), 2.4)
    }
    return (0.2126 * R) + (0.7152 * G) + (0.0722 * B)
}


function rgba2Hsla(rgba) {
    //https://gist.github.com/mjackson/5311256
    //r,g,b,a都0~1, 回傳h,s,l,a都0~1

    let r = rgba.r
    let g = rgba.g
    let b = rgba.b

    let max = Math.max(r, g, b)
    let min = Math.min(r, g, b)
    let h
    let s
    let l = (max + min) / 2

    if (max === min) {
        h = s = 0 // achromatic
    }
    else {
        let d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
        }

        h /= 6
    }

    return { h, s, l, a: rgba.a }
}


function rgba2Hsva(rgba) {
    //https://gist.github.com/mjackson/5311256
    //r,g,b,a都0~1, 回傳h,s,v,a都0~1

    let r = rgba.r
    let g = rgba.g
    let b = rgba.b

    let max = Math.max(r, g, b)
    let min = Math.min(r, g, b)
    let h
    let s
    let v = max

    let d = max - min
    s = max === 0 ? 0 : d / max

    if (max === min) {
        h = 0 // achromatic
    }
    else {
        switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }
    return { h, s, v, a: rgba.a }
}


function hsla2Rgba(hsla) {
    //https://gist.github.com/mjackson/5311256
    //h,s,l,a都0~1, 回傳r,g,b,a都0~1

    let h = hsla.h
    let s = hsla.s
    let l = hsla.l
    let r
    let g
    let b

    function hue2rgb(p, q, t) {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }

    if (s === 0) {
        r = g = b = l // achromatic
    }
    else {
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s
        let p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }
    return { r, g, b, a: hsla.a }
}


function hsva2Rgba(hsva) {
    //https://gist.github.com/mjackson/5311256
    //h,s,v都0~1, 回傳r,g,b都0~1

    let h = hsva.h
    let s = hsva.s
    let v = hsva.v
    let r
    let g
    let b

    let i = Math.floor(h * 6)
    let f = h * 6 - i
    let p = v * (1 - s)
    let q = v * (1 - f * s)
    let t = v * (1 - (1 - f) * s)
    switch (i % 6) {
    case 0:
        r = v
        g = t
        b = p
        break
    case 1: r = q
        g = v
        b = p
        break
    case 2: r = p
        g = v
        b = t
        break
    case 3: r = p
        g = q
        b = v
        break
    case 4: r = t
        g = p
        b = v
        break
    case 5: r = v
        g = p
        b = q
        break
    }

    return { r, g, b, a: hsva.a }
}


function value2Hex(v) {
    //輸入0~1轉出hex
    let hex = Math.round(v * 255).toString(16)
    if (size(hex) === 1) {
        return `0${hex}`
    }
    else if (size(hex) === 2) {
        return hex
    }
    else {
        throw new Error('invalid value')
    }
}


function rgba2Hex(rgba) {
    return rgba2Hex8(rgba, false)
}


function rgba2Hex8(rgba, useLen8 = true) {
    //r,g,b,a都0~1, 回傳hex或hex8

    let r = rgba.r
    let g = rgba.g
    let b = rgba.b
    let a = rgba.a
    let hex8 = `${value2Hex(r)}${value2Hex(g)}${value2Hex(b)}`
    if (useLen8) {
        hex8 = `${hex8}${value2Hex(a)}`
    }
    return hex8
}


function maxmin(v) {
    return Math.min(1, Math.max(0, v))
}


function fmtColor(rgba, fmtOutput) {
    if (!isestr(fmtOutput)) {
        throw new Error('fmtOutput is not string')
    }
    if (kpCv[fmtOutput]) {
        rgba = kpCv[fmtOutput](rgba)
    }
    else {
        console.log(`fmtOutput must be [${keys(kpCv)}]`)
        throw new Error('invalid fmtOutput')
    }
    return rgba
}


function modSaturate(rgba, amount, fmtOutput = 'toRgbString') {
    //調整飽和度, amount介於0~1
    if (amount < 0 || amount > 1) {
        throw new Error('amount < 0 or > 1')
    }
    let hsla = rgba2Hsla(rgba)
    hsla.s += amount
    hsla.s = maxmin(hsla.s)
    let rt = hsla2Rgba(hsla)
    return fmtColor(rt, fmtOutput)
}


function modGrey(rgba, fmtOutput = 'toRgbString') {
    let hsla = rgba2Hsla(rgba)
    hsla.s = 0
    let rt = hsla2Rgba(hsla)
    return fmtColor(rt, fmtOutput)
}


function modLighten(rgba, amount, fmtOutput = 'toRgbString') {
    //調整亮度, amount介於0~1
    if (amount < 0 || amount > 1) {
        throw new Error('amount < 0 or > 1')
    }
    let hsla = rgba2Hsla(rgba)
    hsla.l += amount
    hsla.l = maxmin(hsla.l)
    let rt = hsla2Rgba(hsla)
    return fmtColor(rt, fmtOutput)
}


function modBrighten(rgba, amount, fmtOutput = 'toRgbString') {
    //調整亮度, amount介於0~1
    if (amount < 0 || amount > 1) {
        throw new Error('amount < 0 or > 1')
    }
    rgba.r += amount
    rgba.r = maxmin(rgba.r)
    rgba.g += amount
    rgba.g = maxmin(rgba.g)
    rgba.b += amount
    rgba.b = maxmin(rgba.b)
    let rt = rgba
    return fmtColor(rt, fmtOutput)
}


function modHue(rgba, amount, fmtOutput = 'toRgbString') {
    //調整色相, amount介於0~1
    if (amount < 0 || amount > 1) {
        throw new Error('amount < 0 or > 1')
    }
    let hsla = rgba2Hsla(rgba)
    hsla.h += amount
    hsla.h = hsla.h % 1
    let rt = hsla2Rgba(hsla)
    return fmtColor(rt, fmtOutput)
}


function modComplement(rgba, fmtOutput = 'toRgbString') {
    //轉互補色
    return modHue(rgba, 0.5, fmtOutput)
}


function spreadHue(rgba, num, fmtOutput = 'toRgbString') {
    //依照顏色的色相與數量num產生分佈色
    if (!isint(num)) {
        throw new Error('num is not integer')
    }
    num = cint(num)
    if (num <= 1) {
        return [rgba]
    }
    let hsla = rgba2Hsla(rgba)
    let amount = 1 / num
    let cs = []
    for (let i = 0; i < num; i++) {
        cs.push(fmtColor(hsla2Rgba(hsla), fmtOutput))
        hsla.h += amount
        hsla.h = hsla.h % 1
    }
    return cs
}


function spreadMonochromatic(rgba, num, fmtOutput = 'toRgbString') {
    //依照顏色的飽和度與亮度與數量num產生分佈配色
    if (!isint(num)) {
        throw new Error('num is not integer')
    }
    num = cint(num)
    if (num <= 1) {
        return [rgba]
    }
    let hsva = rgba2Hsva(rgba)
    hsva.s = 1
    hsva.l = 1
    let amount = 1 / num
    let cs = []
    for (let i = 0; i < num; i++) {
        cs.push(fmtColor(hsva2Rgba(hsva), fmtOutput))
        hsva.h -= amount
        hsva.l -= amount
    }
    return cs
}


function mix(rgba1, w1, rgba2, w2, fmtOutput = 'toRgbString') {
    //混合顏色, w1與w2需介於0~1, 兩者合可不等於1
    if (w1 < 0 || w1 > 1) {
        throw new Error('w1 < 0 or > 1')
    }
    if (w2 < 0 || w2 > 1) {
        throw new Error('w1 < 0 or > 1')
    }
    let rt = {
        r: rgba1.r * w1 + rgba2.r * w2,
        g: rgba1.g * w1 + rgba2.g * w2,
        b: rgba1.b * w1 + rgba2.b * w2,
        a: rgba1.a * w1 + rgba2.a * w2,
    }
    return fmtColor(rt, fmtOutput)
}


function vp1(v) {
    return `${round(v * 100, 1)}%`
}


function vd0(v) {
    return round(v, 0)
}


function vd3(v) {
    return round(v, 3)
}


function toRgb(rgba) {
    return {
        r: vd0(rgba.r * 255),
        g: vd0(rgba.g * 255),
        b: vd0(rgba.b * 255),
    }
}


function toRgbString(rgba) {
    return `rgb(${vd0(rgba.r * 255)}, ${vd0(rgba.g * 255)}, ${vd0(rgba.b * 255)})`
}


function toRgba(rgba) {
    return {
        r: vd0(rgba.r * 255),
        g: vd0(rgba.g * 255),
        b: vd0(rgba.b * 255),
        a: vd3(rgba.a),
    }
}


function toRgbaString(rgba) {
    return `rgba(${vd0(rgba.r * 255)}, ${vd0(rgba.g * 255)}, ${vd0(rgba.b * 255)}, ${vd3(rgba.a)})`
}


function toHsl(rgba) {
    let hsla = rgba2Hsla(rgba)
    return {
        h: vd0(hsla.h * 360),
        s: vd3(hsla.s),
        l: vd3(hsla.l),
    }
}


function toHslString(rgba) {
    let hsla = rgba2Hsla(rgba)
    return `hsl(${vd0(hsla.h * 360)}, ${vd3(hsla.s)}, ${vd3(hsla.l)})`
}


function toHsla(rgba) {
    let hsla = rgba2Hsla(rgba)
    return {
        h: vd0(hsla.h * 360),
        s: vd3(hsla.s),
        l: vd3(hsla.l),
        a: vd3(hsla.a),
    }
}


function toHslaString(rgba) {
    let hsla = rgba2Hsla(rgba)
    return `hsla(${vd0(hsla.h * 360)}, ${vd3(hsla.s)}, ${vd3(hsla.l)}, ${vd3(hsla.a)})`
}


function toHsv(rgba) {
    let hsva = rgba2Hsva(rgba)
    return {
        h: vd0(hsva.h * 360),
        s: vd3(hsva.s),
        v: vd3(hsva.v),
    }
}


function toHsvString(rgba) {
    let hsva = rgba2Hsva(rgba)
    return `hsv(${vd0(hsva.h * 360)}, ${vd3(hsva.s)}, ${vd3(hsva.v)})`
}


function toHsva(rgba) {
    let hsva = rgba2Hsva(rgba)
    return {
        h: vd0(hsva.h * 360),
        s: vd3(hsva.s),
        v: vd3(hsva.v),
        a: vd3(hsva.a),
    }
}


function toHsvaString(rgba) {
    let hsva = rgba2Hsva(rgba)
    return `hsva(${vd0(hsva.h * 360)}, ${vd3(hsva.s)}, ${vd3(hsva.v)}, ${vd3(hsva.a)})`
}


function toRgbP(rgba) {
    return {
        r: vp1(rgba.r),
        g: vp1(rgba.g),
        b: vp1(rgba.b),
    }
}


function toRgbPString(rgba) {
    return `rgb(${vp1(rgba.r)}, ${vp1(rgba.g)}, ${vp1(rgba.b)})`
}


function toRgbaP(rgba) {
    return {
        r: vp1(rgba.r),
        g: vp1(rgba.g),
        b: vp1(rgba.b),
        a: vd3(rgba.a),
    }
}


function toRgbaPString(rgba) {
    return `rgba(${vp1(rgba.r)}, ${vp1(rgba.g)}, ${vp1(rgba.b)}, ${vd3(rgba.a)})`
}


function toHslP(rgba) {
    let hsla = rgba2Hsla(rgba)
    return {
        h: vd0(hsla.h * 360),
        s: vp1(hsla.s),
        l: vp1(hsla.l),
    }
}


function toHslPString(rgba) {
    let hsla = rgba2Hsla(rgba)
    return `hsl(${vd0(hsla.h * 360)}, ${vp1(hsla.s)}, ${vp1(hsla.l)})`
}


function toHslaP(rgba) {
    let hsla = rgba2Hsla(rgba)
    return {
        h: vd0(hsla.h * 360),
        s: vp1(hsla.s),
        l: vp1(hsla.l),
        a: vd3(hsla.a),
    }
}


function toHslaPString(rgba) {
    let hsla = rgba2Hsla(rgba)
    return `hsla(${vd0(hsla.h * 360)}, ${vp1(hsla.s)}, ${vp1(hsla.l)}, ${vd3(hsla.a)})`
}


function toHsvP(rgba) {
    let hsva = rgba2Hsva(rgba)
    return {
        h: vd0(hsva.h * 360),
        s: vp1(hsva.s),
        v: vp1(hsva.v),
    }
}


function toHsvPString(rgba) {
    let hsva = rgba2Hsva(rgba)
    return `hsv(${vd0(hsva.h * 360)}, ${vp1(hsva.s)}, ${vp1(hsva.v)})`
}


function toHsvaP(rgba) {
    let hsva = rgba2Hsva(rgba)
    return {
        h: vd0(hsva.h * 360),
        s: vp1(hsva.s),
        v: vp1(hsva.v),
        a: vd3(hsva.a),
    }
}


function toHsvaPString(rgba) {
    let hsva = rgba2Hsva(rgba)
    return `hsva(${vd0(hsva.h * 360)}, ${vp1(hsva.s)}, ${vp1(hsva.v)}, ${vd3(hsva.a)})`
}


function toHexString(rgba) {
    let hex = rgba2Hex(rgba)
    return `#${hex}`
}


function toHex8String(rgba) {
    let hex = rgba2Hex8(rgba)
    return `#${hex}`
}


function parseColor(color) {
    // console.log('parseColor:', color)
    let cc = null
    let co = null
    let rgba = null

    //check
    if (isestr(color)) {
        cc = toLower(trim(color))
    }
    else if (iseobj(color)) {
        co = color
    }
    else {
        console.log('color=', color)
        throw new Error('color is not string or object')
    }

    //parse
    if (cc !== null) {
        try {
            rgba = parseString(cc)
        }
        catch (err) {
            console.log(err)
            throw new Error(`can not parse color: ${cc}`)
        }
    }
    else if (co !== null) {
        try {
            rgba = parseObject(co)
        }
        catch (err) {
            console.log(err)
            throw new Error(`can not parse color: ${JSON.stringify(co)}`)
        }
    }

    return rgba
}


function interp(gradient) {

    //check gradient
    if (!iseobj(gradient)) {
        console.log('gradient is not effective object')
        return (r) => {
            r = Math.min(Math.max(r, 0), 1)
            return `rgb(${r * 255},${r * 255},${r * 255})`
        }
    }

    //gs
    let gs = []
    each(gradient, (v, k) => {
        // console.log('g', k, v)
        gs.push([cdbl(k), toRgba(parseColor(v)), v])
    })
    gs = sortBy(gs, 0)
    // console.log('gs', gs)

    function getColor(r) {
        let color = null
        for (let i = 1; i < gs.length; i++) {
            let r0 = gs[i - 1][0]
            let c0 = gs[i - 1][1]
            let r1 = gs[i][0]
            let c1 = gs[i][1]
            // console.log(i, c0, c1)
            if (r0 <= r && r1 >= r) {
                let w0 = (r1 - r) / (r1 - r0)
                let w1 = (r - r0) / (r1 - r0)
                color = mix(parseColor(c0), w0, parseColor(c1), w1, 'toRgbaString')
                break
            }
        }
        return color
    }

    return getColor
}


let kpCv = {
    toRgb,
    toRgbString,
    toRgba,
    toRgbaString,
    toHsl,
    toHslString,
    toHsla,
    toHslaString,
    toHsv,
    toHsvString,
    toHsva,
    toHsvaString,
    toRgbP,
    toRgbPString,
    toRgbaP,
    toRgbaPString,
    toHslP,
    toHslPString,
    toHslaP,
    toHslaPString,
    toHsvP,
    toHsvPString,
    toHsvaP,
    toHsvaPString,
    toHexString,
    toHex8String,
}


/**
 * 顏色轉換
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/color.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Object} color 輸入顏色字串或物件
 * @returns {Object} 回傳color物件，提供toRgbaString、toHslaString、toHsvaString、toHexString等共37種處理函數
 * @example
 *
 * import oc from 'wsemi/src/color.mjs'
 *
 * let c
 * let c1
 * let c2
 * let r
 *
 * c = '#cd'
 * r = oc.toRgbaString(c)
 * console.log(r)
 * // => rgba(205, 205, 205, 1)
 *
 * c = '#6a3'
 * r = oc.toRgbaString(c)
 * console.log(r)
 * // => rgba(102, 170, 51, 1)
 *
 * c = '#6b8e23'
 * r = oc.toRgbaString(c)
 * console.log(r)
 * // => rgba(107, 142, 35, 1)
 *
 * c1 = '#cd'
 * c2 = 'hsl (320, 50%, 40%)'
 * r = oc.mix(c1, 0.5, c2, 0.5, 'toRgbString')
 * console.log(r)
 * // => rgb(179, 128, 162)
 *
 * c1 = '#cd'
 * c2 = 'hsl (320, 50%, 40%)' //rgb(153, 51, 119)
 * r = oc.mix(c1, 0, c2, 1, 'toRgbString')
 * console.log(r)
 * // => rgb(153, 51, 119)
 *
 * c1 = 'rgb(250, 120, 50)'
 * c2 = 'hsva (320, 100%, 50%, 0.1)'
 * r = oc.mix(c1, 0.5, c2, 0.5, 'toRgba')
 * console.log(r)
 * // => { r: 189, g: 60, b: 68, a: 0.55 }
 *
 * c = 'rgb(250, 120, 50)'
 * r = oc.toRgbaString(c)
 * console.log(r)
 * // => rgba(250, 120, 50, 1)
 *
 * c = 'rgb(250, 120, 50)'
 * r = oc.toHslaString(c)
 * console.log(r)
 * // => hsla(21, 0.952, 0.588, 1)
 *
 * c = 'rgb(250, 120, 50)'
 * r = oc.toHsvaString(c)
 * console.log(r)
 * // => hsva(21, 0.8, 0.98, 1)
 *
 * c = 'rgb(250, 120, 50)'
 * r = oc.toHexString(c)
 * console.log(r)
 * // => #fa7832
 *
 * c = 'skyblue'
 * r = oc.toRgbaString(c)
 * console.log(r)
 * // => rgba(135, 206, 235, 1)
 *
 * c = 'hsl (320, 50%, 40%)'
 * r = oc.toRgba(c)
 * console.log(r)
 * // => { r: 153, g: 51, b: 119, a: 1 }
 *
 * c = 'hsva (320, 100%, 50%, 0.1)'
 * r = oc.toRgba(c)
 * console.log(r)
 * // => { r: 128, g: 0, b: 85, a: 0.1 }
 *
 * c = { r: 255, g: 150, b: 50 }
 * r = oc.toHsla(c)
 * console.log(r)
 * // => { h: 29, s: 0.672, l: 0.002, a: 1 }
 *
 * c = { r: '50%', g: 150, b: 50, a: 0.1 }
 * r = oc.toHsva(c)
 * console.log(r)
 * // => { h: 74, s: 0.667, v: 0.002, a: 0.1 }
 *
 * c = { h: 320, s: 0.2, l: 0.15 }
 * r = oc.toRgba(c)
 * console.log(r)
 * // => { r: 46, g: 31, b: 31, a: 1 }
 *
 * c = { h: 320, s: '12%', l: '8%', a: 0.1 }
 * r = oc.toRgba(c)
 * console.log(r)
 * // => { r: 23, g: 18, b: 18, a: 0.1 }
 *
 * c = { h: 320, s: 0.2, v: 0.15 }
 * r = oc.toRgba(c)
 * console.log(r)
 * // => { r: 38, g: 31, b: 31, a: 1 }
 *
 * c = { h: '50%', s: 0.2, l: 0.15 }
 * r = oc.toHexString(c)
 * console.log(r)
 * // => #1f2e2e
 *
 * c = { h: '50%', s: 0.2, l: 0.15 }
 * r = oc.toRgbaString(c)
 * console.log(r)
 * // => rgba(31, 46, 46, 1)
 *
 * c = { h: '50%', s: 0.2, l: 0.15 }
 * r = oc.toRgba(c)
 * console.log(r)
 * // => { r: 31, g: 46, b: 46, a: 1 }
 *
 * c = { h: 180, s: 0.2, l: 0.15 }
 * r = oc.toHexString(c)
 * console.log(r)
 * // => #1f2e2e
 *
 * c = { h: '50%', s: '12%', v: '8%', a: 0.1 }
 * r = oc.toRgba(c)
 * console.log(r)
 * // => { r: 20, g: 18, b: 18, a: 0.1 }
 *
 * let gradient = {
 *     0: 'rgb(255, 255, 255)',
 *     0.2: 'rgb(254, 178, 76)',
 *     0.4: 'rgb(252, 78, 42)',
 *     0.6: 'rgb(220, 58, 38)',
 *     0.8: 'rgb(200, 40, 23)',
 *     1: 'rgba(180, 30, 60, 0.5)',
 * }
 * let fun = oc.interp(gradient)
 * console.log('fun(0)', fun(0))
 * //fun(0) rgba(255, 255, 255, 1)
 *
 * console.log('fun(0.1)', fun(0.1))
 * //fun(0.1) rgba(255, 217, 166, 1)
 *
 * console.log('fun(0.2)', fun(0.2))
 * //fun(0.2) rgba(254, 178, 76, 1)
 *
 * console.log('fun(0.8)', fun(0.8))
 * //fun(0.8) rgba(200, 40, 23, 1)
 *
 * console.log('fun(0.9)', fun(0.9))
 * //fun(0.9) rgba(190, 35, 42, 0.75)
 *
 * console.log('fun(1)', fun(1))
 * //fun(1) rgba(180, 30, 60, 0.5)
 *
 * console.log('fun(2)', fun(2))
 * //fun(2) null
 *
 * console.log('fun(-1)', fun(-1))
 * //fun(-1) null
 *
 */
let color = {
    toRgb: (c) => toRgb(parseColor(c)),
    toRgbString: (c) => toRgbString(parseColor(c)),
    toRgba: (c) => toRgba(parseColor(c)),
    toRgbaString: (c) => toRgbaString(parseColor(c)),
    toHsl: (c) => toHsl(parseColor(c)),
    toHslString: (c) => toHslString(parseColor(c)),
    toHsla: (c) => toHsla(parseColor(c)),
    toHslaString: (c) => toHslaString(parseColor(c)),
    toHsv: (c) => toHsv(parseColor(c)),
    toHsvString: (c) => toHsvString(parseColor(c)),
    toHsva: (c) => toHsva(parseColor(c)),
    toHsvaString: (c) => toHsvaString(parseColor(c)),
    toRgbP: (c) => toRgbP(parseColor(c)),
    toRgbPString: (c) => toRgbPString(parseColor(c)),
    toRgbaP: (c) => toRgbaP(parseColor(c)),
    toRgbaPString: (c) => toRgbaPString(parseColor(c)),
    toHslP: (c) => toHslP(parseColor(c)),
    toHslPString: (c) => toHslPString(parseColor(c)),
    toHslaP: (c) => toHslaP(parseColor(c)),
    toHslaPString: (c) => toHslaPString(parseColor(c)),
    toHsvP: (c) => toHsvP(parseColor(c)),
    toHsvPString: (c) => toHsvPString(parseColor(c)),
    toHsvaP: (c) => toHsvaP(parseColor(c)),
    toHsvaPString: (c) => toHsvaPString(parseColor(c)),
    toHexString: (c) => toHexString(parseColor(c)),
    toHex8String: (c) => toHex8String(parseColor(c)),
    modSaturate: (c, amount, fmtOutput) => modSaturate(parseColor(c), amount, fmtOutput),
    modGrey: (c, fmtOutput) => modGrey(parseColor(c), fmtOutput),
    modLighten: (c, amount, fmtOutput) => modLighten(parseColor(c), amount, fmtOutput),
    modBrighten: (c, amount, fmtOutput) => modBrighten(parseColor(c), amount, fmtOutput),
    modHue: (c, amount, fmtOutput) => modHue(parseColor(c), amount, fmtOutput),
    modComplement: (c, fmtOutput) => modComplement(parseColor(c), fmtOutput),
    spreadHue: (c, num, fmtOutput) => spreadHue(parseColor(c), num, fmtOutput),
    spreadMonochromatic: (c, num, fmtOutput) => spreadMonochromatic(parseColor(c), num, fmtOutput),
    mix: (c1, w1, c2, w2, fmtOutput) => mix(parseColor(c1), w1, parseColor(c2), w2, fmtOutput),
    getBrightness: (c) => getBrightness(parseColor(c)),
    getLuminance: (c) => getLuminance(parseColor(c)),
    interp,
}


export default color
