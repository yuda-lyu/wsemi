import each from 'lodash/each'
import haskey from './haskey.mjs'


/**
 * 取得檔案關聯性資訊
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileAccept.test.js Github}
 * @memberOf wsemi
 * @param {string} [groupBy=''] 輸入群組化關鍵字字串，預設''，可選用'name','group','acp','exec'
 * @returns {Array} 回傳檔案關聯性資訊陣列，若有給groupBy則自動群組化
 * @example
 * console.log(getFileAccept()[2])
 * // => { name: 'pdf',
 * //      group: 'docums',
 * //      acp: 'application/pdf',
 * //      exec: 'acrobat' }
 *
 * console.log(getFileAccept('acp')['text/html'])
 * // => [ { name: 'htm',
 * //        group: 'docums',
 * //        acp: 'text/html',
 * //        exec: 'browser' },
 * //      { name: 'html',
 * //        group: 'docums',
 * //        acp: 'text/html',
 * //        exec: 'browser' } ]
 */
function getFileAccept(groupBy = '') {

    //check
    if (groupBy !== '' && groupBy !== 'name' && groupBy !== 'group' && groupBy !== 'acp' && groupBy !== 'exec') {
        return []
    }

    //data, MIME_types: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
    let data = [
        {
            name: 'htm',
            group: 'docums',
            acp: 'text/html',
            exec: 'browser',
        },
        {
            name: 'html',
            group: 'docums',
            acp: 'text/html',
            exec: 'browser',
        },
        {
            name: 'pdf',
            group: 'docums',
            acp: 'application/pdf',
            exec: 'acrobat',
        },
        {
            name: 'rtf',
            group: 'docums',
            acp: 'application/rtf',
            exec: 'word',
        },
        {
            name: 'doc',
            group: 'docums',
            acp: 'application/msword',
            exec: 'word',
        },
        {
            name: 'docx',
            group: 'docums',
            acp: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            exec: 'word',
        },
        {
            name: 'ppt',
            group: 'docums',
            acp: 'application/vnd.ms-powerpoint',
            exec: 'powerpoint',
        },
        {
            name: 'pptx',
            group: 'docums',
            acp: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            exec: 'powerpoint',
        },
        {
            name: 'xls',
            group: 'docums',
            acp: 'application/vnd.ms-excel',
            exec: 'excel',
        },
        {
            name: 'xlsx',
            group: 'docums',
            acp: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            exec: 'excel',
        },
        {
            name: 'odt',
            group: 'docums',
            acp: 'application/vnd.oasis.opendocument.text',
            exec: 'word',
        },
        {
            name: 'odp',
            group: 'docums',
            acp: 'application/vnd.oasis.opendocument.presentation',
            exec: 'powerpoint',
        },
        {
            name: 'application/vnd.oasis.opendocument.spreadsheet',
            group: 'docums',
            acp: 'application/vnd.oasis.opendocument.spreadsheet',
            exec: 'excel',
        },
        {
            name: 'zip',
            group: 'compress',
            acp: 'application/zip',
            exec: '7z',
        },
        {
            name: 'rar',
            group: 'compress',
            acp: 'application/x-rar-compressed',
            exec: '7z',
        },
        {
            name: '7z',
            group: 'compress',
            acp: 'application/x-7z-compressed',
            exec: '7z',
        },
        {
            name: 'bzip',
            group: 'compress',
            acp: 'application/x-bzip',
            exec: '7z',
        },
        {
            name: 'bzip2',
            group: 'compress',
            acp: 'application/x-bzip2',
            exec: '7z',
        },
        {
            name: 'pic',
            group: 'image',
            acp: 'image/*',
            exec: 'imageviwer',
        },
        {
            name: 'xml',
            group: 'data',
            acp: 'text/xml',
            exec: 'textviwer',
        },
        {
            name: 'json',
            group: 'data',
            acp: 'application/json',
            exec: 'textviwer',
        },
        {
            name: 'txt',
            group: 'data',
            acp: 'text/plain',
            exec: 'textviwer',
        },
        {
            name: 'csv',
            group: 'data',
            acp: 'text/csv',
            exec: 'excel',
        },
        {
            name: 'dat',
            group: 'data',
            acp: 'application/octet-stream',
            exec: 'binaryviwer',
        },
    ]

    //check
    if (groupBy === '') {
        return data
    }

    //groupBy
    let r = {}
    each(data, function(v) {
        let k = v[groupBy]
        if (!haskey(r, k)) {
            r[k] = []
        }
        r[k].push(v)
    })

    return r
}


export default getFileAccept
