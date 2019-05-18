let indexOf = [].indexOf || function(item) {
    for (let i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item) return i
    } return -1
}

function makePrefixer(prefix) {
    return function(name) {
        return prefix + '-' + name
    }
}

function isArray(obj) {
    return toString.call(obj) === '[object Array]'
}

function sn(tagName, className, data) {
    let result = document.createElement(tagName)

    result.className = className
    result.appendChild(document.createTextNode('' + data))

    return result
}

function scn(tagName, className, child) {
    let result = document.createElement(tagName)
    let i
    let len

    result.className = className

    if (isArray(child)) {
        for (i = 0, len = child.length; i < len; i += 1) {
            result.appendChild(child[i])
        }
    }
    else {
        result.appendChild(child)
    }

    return result
}

function linkNode(child, href, target) {
    let a = scn('a', HYPERLINK_CLASS_NAME, child)
    a.setAttribute('href', href)
    a.setAttribute('target', target)
    return a
}

let toString = Object.prototype.toString
let prefixer = makePrefixer('jh')
let p = prefixer
let ARRAY = 1
let BOOL = 2
let INT = 3
let FLOAT = 4
let STRING = 5
let OBJECT = 6
let FUNCTION = 7
let UNK = 99

let STRING_CLASS_NAME = p('type-string')
let STRING_EMPTY_CLASS_NAME = p('type-string') + ' ' + p('empty')

let BOOL_TRUE_CLASS_NAME = p('type-bool-true')
let BOOL_FALSE_CLASS_NAME = p('type-bool-false')
let BOOL_IMAGE = p('type-bool-image')
let INT_CLASS_NAME = p('type-int') + ' ' + p('type-number')
let FLOAT_CLASS_NAME = p('type-float') + ' ' + p('type-number')

let OBJECT_CLASS_NAME = p('type-object')
let OBJ_KEY_CLASS_NAME = p('key') + ' ' + p('object-key')
let OBJ_VAL_CLASS_NAME = p('value') + ' ' + p('object-value')
let OBJ_EMPTY_CLASS_NAME = p('type-object') + ' ' + p('empty')

let FUNCTION_CLASS_NAME = p('type-function')

let ARRAY_KEY_CLASS_NAME = p('key') + ' ' + p('array-key')
let ARRAY_VAL_CLASS_NAME = p('value') + ' ' + p('array-value')
let ARRAY_CLASS_NAME = p('type-array')
let ARRAY_EMPTY_CLASS_NAME = p('type-array') + ' ' + p('empty')

let HYPERLINK_CLASS_NAME = p('a')

let UNKNOWN_CLASS_NAME = p('type-unk')

function getType(obj) {
    let type = typeof obj

    switch (type) {
    case 'boolean':
        return BOOL
    case 'string':
        return STRING
    case 'number':
        return (obj % 1 === 0) ? INT : FLOAT
    case 'function':
        return FUNCTION
    default:
        if (isArray(obj)) {
            return ARRAY
        }
        else if (obj === Object(obj)) {
            return OBJECT
        }
        else {
            return UNK
        }
    }
}

function _format(data, options, parentKey) {

    let result
    let container
    let key
    let keyNode
    let valNode
    let len
    let childs
    let tr
    let value
    let isEmpty = true
    let type = getType(data)

    // Initialized & used only in case of objects & arrays
    let hyperlinksEnabled, aTarget, hyperlinkKeys

    switch (type) {
    case BOOL:
        let boolOpt = options.bool
        container = document.createElement('div')

        if (boolOpt.showImage) {
            let img = document.createElement('img')
            img.setAttribute('class', BOOL_IMAGE)

            img.setAttribute('src',
                '' + (data ? boolOpt.img.true : boolOpt.img.false))

            container.appendChild(img)
        }

        if (boolOpt.showText) {
            container.appendChild(data
                ? sn('span', BOOL_TRUE_CLASS_NAME, boolOpt.text.true)
                : sn('span', BOOL_FALSE_CLASS_NAME, boolOpt.text.false))
        }

        result = container
        break

    case STRING:
        if (data === '') {
            result = sn('span', STRING_EMPTY_CLASS_NAME, '(Empty Text)')
        }
        else {
            result = sn('span', STRING_CLASS_NAME, data)
        }
        break
    case INT:
        result = sn('span', INT_CLASS_NAME, data)
        break
    case FLOAT:
        result = sn('span', FLOAT_CLASS_NAME, data)
        break
    case OBJECT:
        childs = []

        aTarget = options.hyperlinks.target
        hyperlinkKeys = options.hyperlinks.keys

        // Is Hyperlink Key
        hyperlinksEnabled =
                options.hyperlinks.enable &&
                hyperlinkKeys &&
                hyperlinkKeys.length > 0

        for (key in data) {
            isEmpty = false

            value = data[key]

            valNode = _format(value, options, key)
            keyNode = sn('th', OBJ_KEY_CLASS_NAME, key)

            if (hyperlinksEnabled &&
                    typeof (value) === 'string' &&
                    indexOf.call(hyperlinkKeys, key) >= 0) {

                valNode = scn('td', OBJ_VAL_CLASS_NAME, linkNode(valNode, value, aTarget))
            }
            else {
                valNode = scn('td', OBJ_VAL_CLASS_NAME, valNode)
            }

            tr = document.createElement('tr')
            tr.appendChild(keyNode)
            tr.appendChild(valNode)

            childs.push(tr)
        }

        if (isEmpty) {
            result = sn('span', OBJ_EMPTY_CLASS_NAME, '(Empty Object)')
        }
        else {
            result = scn('table', OBJECT_CLASS_NAME, scn('tbody', '', childs))
        }
        break
    case FUNCTION:
        result = sn('span', FUNCTION_CLASS_NAME, data)
        break
    case ARRAY:
        if (data.length > 0) {
            childs = []
            let showArrayIndices = options.showArrayIndex

            aTarget = options.hyperlinks.target
            hyperlinkKeys = options.hyperlinks.keys

            // Hyperlink of arrays?
            hyperlinksEnabled = parentKey && options.hyperlinks.enable &&
                    hyperlinkKeys &&
                    hyperlinkKeys.length > 0 &&
                    indexOf.call(hyperlinkKeys, parentKey) >= 0

            for (key = 0, len = data.length; key < len; key += 1) {

                keyNode = sn('th', ARRAY_KEY_CLASS_NAME, key)
                value = data[key]

                if (hyperlinksEnabled && typeof (value) === 'string') {
                    valNode = _format(value, options, key)
                    valNode = scn('td', ARRAY_VAL_CLASS_NAME, linkNode(valNode, value, aTarget))
                }
                else {
                    valNode = scn('td', ARRAY_VAL_CLASS_NAME, _format(value, options, key))
                }

                tr = document.createElement('tr')

                if (showArrayIndices) {
                    tr.appendChild(keyNode)
                }
                tr.appendChild(valNode)

                childs.push(tr)
            }

            result = scn('table', ARRAY_CLASS_NAME, scn('tbody', '', childs))
        }
        else {
            result = sn('span', ARRAY_EMPTY_CLASS_NAME, '(Empty List)')
        }
        break
    default:
        result = sn('span', UNKNOWN_CLASS_NAME, data)
        break
    }

    return result
}

function validateOptions(options) {
    options = validateArrayIndexOption(options)
    options = validateHyperlinkOptions(options)
    options = validateBoolOptions(options)

    // Add any more option validators here

    return options
}


function validateArrayIndexOption(options) {
    if (options.showArrayIndex === undefined) {
        options.showArrayIndex = true
    }
    else {
        // Force to boolean just in case
        options.showArrayIndex = !!options.showArrayIndex
    }

    return options
}

function validateHyperlinkOptions(options) {
    let hyperlinks = {
        enable: false,
        keys: null,
        target: ''
    }

    if (options.hyperlinks && options.hyperlinks.enable) {
        hyperlinks.enable = true

        hyperlinks.keys = isArray(options.hyperlinks.keys) ? options.hyperlinks.keys : []

        if (options.hyperlinks.target) {
            hyperlinks.target = '' + options.hyperlinks.target
        }
        else {
            hyperlinks.target = '_blank'
        }
    }

    options.hyperlinks = hyperlinks

    return options
}

function validateBoolOptions(options) {
    if (!options.bool) {
        options.bool = {
            text: {
                true: 'true',
                false: 'false'
            },
            img: {
                true: '',
                false: ''
            },
            showImage: false,
            showText: true
        }
    }
    else {
        let boolOptions = options.bool

        // Show text if no option
        if (!boolOptions.showText && !boolOptions.showImage) {
            boolOptions.showImage = false
            boolOptions.showText = true
        }

        if (boolOptions.showText) {
            if (!boolOptions.text) {
                boolOptions.text = {
                    true: 'true',
                    false: 'false'
                }
            }
            else {
                let t = boolOptions.text.true
                let f = boolOptions.text.false

                if (getType(t) !== STRING || t === '') {
                    boolOptions.text.true = 'true'
                }

                if (getType(f) !== STRING || f === '') {
                    boolOptions.text.false = 'false'
                }
            }
        }

        if (boolOptions.showImage) {
            if (!boolOptions.img.true && !boolOptions.img.false) {
                boolOptions.showImage = false
            }
        }
    }

    return options
}

function format(data, options) {
    options = validateOptions(options || {})

    let result

    result = _format(data, options)
    result.className = result.className + ' ' + prefixer('root')

    return result
}


/**
 * 針對元素rootElem產生展示Json表格套件
 * 因js與css設定無法進行模組化, 自己下載來修改
 *
 * Depend on: {@link https://github.com/marianoguerra/json.human.js json.human.js}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/viewJsonTable.test.js Github}
 * @memberOf wsemi
 * @param {Object} jsonObj 輸入Json物件
 * @param {Element} rootElem 輸入初始化元素
 * @example
 * need test in browser
 */
function viewJsonTable(jsonObj, rootElem) {
    rootElem.innerHTML = ''
    // let options = {
    //     // Show or hide Array-Indices in the output
    //     showArrayIndex: true,

    //     // Hyperlinks Option
    //     // Enable <a> tag in the output html based on object keys
    //     // Supports only strings and arrays
    //     hyperlinks: {
    //         enable: true,
    //         keys: ['url'], // Keys which will be output as links
    //         target: '_blank' // 'target' attribute of a
    //     },

    //     // Options for displaying bool
    //     bool: {
    //         // Show text? And what text for true & false?
    //         showText: true,
    //         text: {
    //             true: 'Yes',
    //             false: 'No'
    //         },

    //         // Show image? And which images (urls)?
    //         showImage: true,
    //         img: {
    //             true: 'css/true.png',
    //             false: 'css/false.png'
    //         }
    //     }
    // }
    let node = format(jsonObj)
    rootElem.appendChild(node)
}


export default viewJsonTable
