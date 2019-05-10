import map from 'lodash/map'
import concat from 'lodash/concat'
import filter from 'lodash/filter'
import join from 'lodash/join'
import isstr from './isstr.mjs'
import isearr from './isearr.mjs'
import isernot from './isernot.mjs'


/**
 * 前端依照檔案類型或種類回傳input file的accept欄位所用字串
 * kind若需使用種類，可選為'docums', 'compress', 'image', 'data'，或複選以陣列儲存傳入
 * kind若需使用通用檔案，可使用'common'
 *
 * @memberOf wsemi
 * @param {String|Array} [kind='*'] 輸入檔案類型或種類字串或陣列
 * @returns {String} 回傳input file的accept欄位所用字串
 */
function domGetFileAccept(kind = '*') {

    //check all
    if (kind === '*') {
        return kind
    }

    //check not string or array
    if (!isstr(kind) && !isearr(kind)) {
        return '*'
    }

    //check common
    if (kind === 'common') {
        kind = ['docums', 'compress', 'image', 'data']
    }

    //data, MIME_types: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
    let data = [
        {
            name: 'htm',
            group: 'docums',
            acp: '.htm',
        },
        {
            name: 'html',
            group: 'docums',
            acp: '.html',
        },
        {
            name: 'pdf',
            group: 'docums',
            acp: 'application/pdf',
        },
        {
            name: 'rtf',
            group: 'docums',
            acp: 'application/rtf',
        },
        {
            name: 'doc',
            group: 'docums',
            acp: 'application/msword',
        },
        {
            name: 'docx',
            group: 'docums',
            acp: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        {
            name: 'ppt',
            group: 'docums',
            acp: 'application/vnd.ms-powerpoint',
        },
        {
            name: 'pptx',
            group: 'docums',
            acp: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        },
        {
            name: 'xls',
            group: 'docums',
            acp: 'application/vnd.ms-excel',
        },
        {
            name: 'xlsx',
            group: 'docums',
            acp: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        {
            name: 'odt',
            group: 'docums',
            acp: 'application/vnd.oasis.opendocument.text',
        },
        {
            name: 'odp',
            group: 'docums',
            acp: 'application/vnd.oasis.opendocument.presentation',
        },
        {
            name: 'application/vnd.oasis.opendocument.spreadsheet',
            group: 'docums',
            acp: 'application/vnd.oasis.opendocument.spreadsheet',
        },
        {
            name: 'zip',
            group: 'compress',
            acp: 'application/zip',
        },
        {
            name: 'rar',
            group: 'compress',
            acp: 'application/x-rar-compressed',
        },
        {
            name: '7z',
            group: 'compress',
            acp: 'application/x-7z-compressed',
        },
        {
            name: 'bzip',
            group: 'compress',
            acp: 'application/x-bzip',
        },
        {
            name: 'bzip2',
            group: 'compress',
            acp: 'application/x-bzip2',
        },
        {
            name: 'pic',
            group: 'image',
            acp: 'image/*',
        },
        {
            name: 'xml',
            group: 'data',
            acp: '.xml',
        },
        {
            name: 'json',
            group: 'data',
            acp: '.json',
        },
        {
            name: 'txt',
            group: 'data',
            acp: '.txt',
        },
        {
            name: 'csv',
            group: 'data',
            acp: '.csv',
        },
        {
            name: 'dat',
            group: 'data',
            acp: '.dat',
        },
    ]

    function getName(name) {
        let rs = filter(data, { name: name })
        return getAcp(rs)
    }

    function getMode(kind) {
        let rs = filter(data, { group: kind })
        return getAcp(rs)
    }

    function getAcp(rs) {
        return map(rs, 'acp')
    }

    //convert to array
    if (isstr(kind)) {
        kind = [kind]
    }

    //accept string
    let c = ''
    if (isearr(kind)) {
        let r1 = map(kind, function(v) {
            return getMode(v)
        })
        let r2 = map(kind, function(v) {
            return getName(v)
        })
        let r = concat(r1, r2)
        r = filter(r, isernot)
        c = join(r, ',')
    }

    return c
}


export default domGetFileAccept
