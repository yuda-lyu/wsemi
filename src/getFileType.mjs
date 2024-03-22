import find from 'lodash-es/find.js'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'


//MIME_types: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
let fts = [
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
        name: 'json',
        group: 'data',
        acp: 'application/json',
        exec: 'textviwer',
    },
    {
        name: 'geojson',
        group: 'data',
        acp: 'application/geo+json',
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
    {
        name: '7z',
        group: 'compress',
        acp: 'application/x-7z-compressed',
        exec: 'compressor'
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
        exec: 'compressor'
    },
    {
        name: 'bz2',
        group: 'compress',
        acp: 'application/x-bzip2',
        exec: 'compressor'
    },
    {
        name: 'ace',
        group: 'compress',
        acp: 'application/x-ace-compressed',
        exec: 'compressor'
    },
    {
        name: 'Z',
        group: 'compress',
        acp: 'application/x-compress',
        exec: 'compressor'
    },
    {
        name: 'lzh',
        group: 'compress',
        acp: 'application/x-lzh-compressed',
        exec: 'compressor'
    },
    {
        name: 'lz',
        group: 'compress',
        acp: 'application/x-lzip',
        exec: 'compressor'
    },
    {
        name: 'rar',
        group: 'compress',
        acp: 'application/x-rar-compressed',
        exec: 'compressor'
    },
    {
        name: 'tar',
        group: 'compress',
        acp: 'application/x-tar',
        exec: 'compressor'
    },
    {
        name: 'ar',
        group: 'compress',
        acp: 'application/x-unix-archive',
        exec: 'compressor'
    },
    {
        name: 'zip',
        group: 'compress',
        acp: 'application/zip',
        exec: 'compressor'
    },
    {
        name: 'gz',
        group: 'compress',
        acp: 'application/gzip',
        exec: 'compressor'
    },
    {
        name: 'avro',
        group: '',
        acp: 'application/avro',
        exec: ''
    },
    {
        name: 'dcm',
        group: '',
        acp: 'application/dicom',
        exec: ''
    },
    {
        name: 'eps',
        group: '',
        acp: 'application/eps',
        exec: ''
    },
    {
        name: 'epub',
        group: '',
        acp: 'application/epub+zip',
        exec: ''
    },
    {
        name: 'class',
        group: '',
        acp: 'application/java-vm',
        exec: ''
    },
    {
        name: 'mxf',
        group: '',
        acp: 'application/mxf',
        exec: ''
    },
    {
        name: 'ogx',
        group: '',
        acp: 'application/ogg',
        exec: ''
    },
    {
        name: 'pdf',
        group: 'docums',
        acp: 'application/pdf',
        exec: 'acrobat'
    },
    {
        name: 'pgp',
        group: '',
        acp: 'application/pgp-encrypted',
        exec: ''
    },
    {
        name: 'ps',
        group: '',
        acp: 'application/postscript',
        exec: ''
    },
    {
        name: 'ai',
        group: '',
        acp: 'application/postscript',
        exec: ''
    },
    {
        name: 'rtf',
        group: 'docums',
        acp: 'application/rtf',
        exec: 'word'
    },
    {
        name: 'icc',
        group: '',
        acp: 'application/vnd.iccprofile',
        exec: ''
    },
    {
        name: 'asf',
        group: '',
        acp: 'application/vnd.ms-asf',
        exec: '',
        msg: 'asf的acp可能為application/vnd.ms-asf或audio/x-ms-asf或video/x-ms-asf'
    },
    {
        name: 'cab',
        group: '',
        acp: 'application/vnd.ms-cab-compressed',
        exec: ''
    },
    {
        name: 'eot',
        group: '',
        acp: 'application/vnd.ms-fontobject',
        exec: ''
    },
    {
        name: 'chm',
        group: '',
        acp: 'application/vnd.ms-htmlhelp',
        exec: ''
    },
    {
        name: 'pst',
        group: '',
        acp: 'application/vnd.ms-outlook',
        exec: ''
    },
    {
        name: 'odp',
        group: 'docums',
        acp: 'application/vnd.oasis.opendocument.presentation',
        exec: 'powerpoint'
    },
    {
        name: 'ods',
        group: 'docums',
        acp: 'application/vnd.oasis.opendocument.spreadsheet',
        exec: 'excel'
    },
    {
        name: 'odt',
        group: 'docums',
        acp: 'application/vnd.oasis.opendocument.text',
        exec: 'word'
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
        exec: 'powerpoint'
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
        exec: 'excel'
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
        exec: 'word'
    },
    {
        name: 'skp',
        group: '',
        acp: 'application/vnd.sketchup.skp',
        exec: ''
    },
    {
        name: 'pcap',
        group: '',
        acp: 'application/vnd.tcpdump.pcap',
        exec: ''
    },
    {
        name: 'wasm',
        group: '',
        acp: 'application/wasm',
        exec: ''
    },
    {
        name: 'arrow',
        group: '',
        acp: 'application/x-apache-arrow',
        exec: ''
    },
    {
        name: 'dmg',
        group: '',
        acp: 'application/x-apple-diskimage',
        exec: ''
    },
    {
        name: 'arj',
        group: '',
        acp: 'application/x-arj',
        exec: ''
    },
    {
        name: 'asar',
        group: '',
        acp: 'application/x-asar',
        exec: ''
    },
    {
        name: 'blend',
        group: '',
        acp: 'application/x-blender',
        exec: 'blender'
    },
    {
        name: 'cfb',
        group: '',
        acp: 'application/x-cfb',
        exec: ''
    },
    {
        name: 'cpio',
        group: '',
        acp: 'application/x-cpio',
        exec: ''
    },
    {
        name: 'deb',
        group: '',
        acp: 'application/x-deb',
        exec: ''
    },
    {
        name: 'elf',
        group: '',
        acp: 'application/x-elf',
        exec: ''
    },
    {
        name: 'shp',
        group: '',
        acp: 'application/x-esri-shape',
        exec: ''
    },
    {
        name: 'crx',
        group: '',
        acp: 'application/x-google-chrome-extension',
        exec: ''
    },
    {
        name: 'indd',
        group: '',
        acp: 'application/x-indesign',
        exec: ''
    },
    {
        name: 'macho',
        group: '',
        acp: 'application/x-mach-binary',
        exec: ''
    },
    {
        name: 'mie',
        group: '',
        acp: 'application/x-mie',
        exec: ''
    },
    {
        name: 'mobi',
        group: '',
        acp: 'application/x-mobipocket-ebook',
        exec: ''
    },
    {
        name: 'exe',
        group: '',
        acp: 'application/x-msdownload',
        exec: ''
    },
    {
        name: 'nes',
        group: '',
        acp: 'application/x-nintendo-nes-rom',
        exec: ''
    },
    {
        name: 'parquet',
        group: '',
        acp: 'application/x-parquet',
        exec: ''
    },
    {
        name: 'rpm',
        group: '',
        acp: 'application/x-rpm',
        exec: ''
    },
    {
        name: 'swf',
        group: '',
        acp: 'application/x-shockwave-flash',
        exec: ''
    },
    {
        name: 'sqlite',
        group: '',
        acp: 'application/x-sqlite3',
        exec: ''
    },
    {
        name: 'xpi',
        group: '',
        acp: 'application/x-xpinstall',
        exec: ''
    },
    {
        name: 'xz',
        group: '',
        acp: 'application/x-xz',
        exec: ''
    },
    {
        name: 'alias',
        group: '',
        acp: 'application/x.apple.alias',
        exec: ''
    },
    {
        name: 'fbx',
        group: '',
        acp: 'application/x.autodesk.fbx',
        exec: ''
    },
    {
        name: 'lnk',
        group: '',
        acp: 'application/x.ms.shortcut',
        exec: ''
    },
    {
        name: 'zst',
        group: '',
        acp: 'application/zstd',
        exec: ''
    },
    {
        name: 'aac',
        group: 'audio',
        acp: 'audio/aac',
        exec: 'audioplayer'
    },
    {
        name: 'aif',
        group: 'audio',
        acp: 'audio/aiff',
        exec: 'audioplayer'
    },
    {
        name: 'amr',
        group: 'audio',
        acp: 'audio/amr',
        exec: 'audioplayer'
    },
    {
        name: 'ape',
        group: 'audio',
        acp: 'audio/ape',
        exec: 'audioplayer'
    },
    {
        name: 'mid',
        group: 'audio',
        acp: 'audio/midi',
        exec: 'audioplayer'
    },
    {
        name: 'm4b',
        group: 'audio',
        acp: 'audio/mp4',
        exec: 'audioplayer'
    },
    {
        name: 'f4a',
        group: 'audio',
        acp: 'audio/mp4',
        exec: 'audioplayer'
    },
    {
        name: 'f4b',
        group: 'audio',
        acp: 'audio/mp4',
        exec: 'audioplayer'
    },
    {
        name: 'mp3',
        group: 'audio',
        acp: 'audio/mpeg',
        exec: 'audioplayer'
    },
    {
        name: 'mp2',
        group: 'audio',
        acp: 'audio/mpeg',
        exec: 'audioplayer'
    },
    {
        name: 'mp1',
        group: 'audio',
        acp: 'audio/mpeg',
        exec: 'audioplayer'
    },
    {
        name: 'oga',
        group: 'audio',
        acp: 'audio/ogg',
        exec: 'audioplayer'
    },
    {
        name: 'spx',
        group: 'audio',
        acp: 'audio/ogg',
        exec: 'audioplayer'
    },
    {
        name: 'ogg',
        group: 'audio',
        acp: 'audio/ogg',
        exec: 'audioplayer'
    },
    {
        name: 'opus',
        group: 'audio',
        acp: 'audio/opus',
        exec: 'audioplayer'
    },
    {
        name: 'qcp',
        group: 'audio',
        acp: 'audio/qcelp',
        exec: 'audioplayer'
    },
    {
        name: 'ac3',
        group: 'audio',
        acp: 'audio/vnd.dolby.dd-raw',
        exec: 'audioplayer'
    },
    {
        name: 'wav',
        group: 'audio',
        acp: 'audio/wav',
        exec: 'audioplayer'
    },
    {
        name: 'wv',
        group: 'audio',
        acp: 'audio/wavpack',
        exec: 'audioplayer'
    },
    {
        name: 'dsf',
        group: 'audio',
        acp: 'audio/x-dsf',
        exec: 'audioplayer'
    },
    {
        name: 'flac',
        group: 'audio',
        acp: 'audio/x-flac',
        exec: 'audioplayer'
    },
    {
        name: 'it',
        group: 'audio',
        acp: 'audio/x-it',
        exec: 'audioplayer'
    },
    {
        name: 'm4a',
        group: 'audio',
        acp: 'audio/x-m4a',
        exec: 'audioplayer'
    },
    {
        name: 'mpc',
        group: 'audio',
        acp: 'audio/x-musepack',
        exec: 'audioplayer'
    },
    {
        name: 's3m',
        group: 'audio',
        acp: 'audio/x-s3m',
        exec: 'audioplayer'
    },
    {
        name: 'voc',
        group: 'audio',
        acp: 'audio/x-voc',
        exec: 'audioplayer'
    },
    {
        name: 'xm',
        group: 'audio',
        acp: 'audio/x-xm',
        exec: 'audioplayer'
    },
    {
        name: 'otf',
        group: '',
        acp: 'font/otf',
        exec: ''
    },
    {
        name: 'ttf',
        group: '',
        acp: 'font/ttf',
        exec: ''
    },
    {
        name: 'woff',
        group: '',
        acp: 'font/woff',
        exec: ''
    },
    {
        name: 'woff2',
        group: '',
        acp: 'font/woff2',
        exec: ''
    },
    {
        name: 'apng',
        group: 'image',
        acp: 'image/apng',
        exec: 'imageviwer'
    },
    {
        name: 'avif',
        group: 'image',
        acp: 'image/avif',
        exec: 'imageviwer'
    },
    {
        name: 'bmp',
        group: 'image',
        acp: 'image/bmp',
        exec: 'imageviwer'
    },
    {
        name: 'bpg',
        group: 'image',
        acp: 'image/bpg',
        exec: 'imageviwer'
    },
    {
        name: 'flif',
        group: 'image',
        acp: 'image/flif',
        exec: 'imageviwer'
    },
    {
        name: 'gif',
        group: 'image',
        acp: 'image/gif',
        exec: 'imageviwer'
    },
    {
        name: 'heic',
        group: 'image',
        acp: 'image/heif',
        exec: 'imageviwer'
    },
    {
        name: 'icns',
        group: 'image',
        acp: 'image/icns',
        exec: 'imageviwer'
    },
    {
        name: 'j2c',
        group: 'image',
        acp: 'image/j2c',
        exec: 'imageviwer'
    },
    {
        name: 'jls',
        group: 'image',
        acp: 'image/jls',
        exec: 'imageviwer'
    },
    {
        name: 'jp2',
        group: 'image',
        acp: 'image/jp2',
        exec: 'imageviwer'
    },
    {
        name: 'jpg',
        group: 'image',
        acp: 'image/jpeg',
        exec: 'imageviwer'
    },
    {
        name: 'jpm',
        group: 'image',
        acp: 'image/jpm',
        exec: 'imageviwer'
    },
    {
        name: 'jpx',
        group: 'image',
        acp: 'image/jpx',
        exec: 'imageviwer'
    },
    {
        name: 'jxl',
        group: 'image',
        acp: 'image/jxl',
        exec: 'imageviwer'
    },
    {
        name: 'ktx',
        group: 'image',
        acp: 'image/ktx',
        exec: 'imageviwer'
    },
    {
        name: 'mj2',
        group: 'image',
        acp: 'image/mj2',
        exec: 'imageviwer'
    },
    {
        name: 'png',
        group: 'image',
        acp: 'image/png',
        exec: 'imageviwer'
    },
    {
        name: 'tif',
        group: 'image',
        acp: 'image/tiff',
        exec: 'imageviwer'
    },
    {
        name: 'psd',
        group: 'image',
        acp: 'image/vnd.adobe.photoshop',
        exec: 'imageviwer'
    },
    {
        name: 'dwg',
        group: 'image',
        acp: 'image/vnd.dwg',
        exec: 'imageviwer'
    },
    {
        name: 'jxr',
        group: 'image',
        acp: 'image/vnd.ms-photo',
        exec: 'imageviwer'
    },
    {
        name: 'webp',
        group: 'image',
        acp: 'image/webp',
        exec: 'imageviwer'
    },
    {
        name: 'dng',
        group: 'image',
        acp: 'image/x-adobe-dng',
        exec: 'imageviwer'
    },
    {
        name: 'cr2',
        group: 'image',
        acp: 'image/x-canon-cr2',
        exec: 'imageviwer'
    },
    {
        name: 'cr3',
        group: 'image',
        acp: 'image/x-canon-cr3',
        exec: 'imageviwer'
    },
    {
        name: 'raf',
        group: 'image',
        acp: 'image/x-fujifilm-raf',
        exec: 'imageviwer'
    },
    {
        name: 'ico',
        group: 'image',
        acp: 'image/x-icon',
        exec: 'imageviwer'
    },
    {
        name: 'cur',
        group: 'image',
        acp: 'image/x-icon',
        exec: 'imageviwer'
    },
    {
        name: 'nef',
        group: 'image',
        acp: 'image/x-nikon-nef',
        exec: 'imageviwer'
    },
    {
        name: 'orf',
        group: 'image',
        acp: 'image/x-olympus-orf',
        exec: 'imageviwer'
    },
    {
        name: 'rw2',
        group: 'image',
        acp: 'image/x-panasonic-rw2',
        exec: 'imageviwer'
    },
    {
        name: 'arw',
        group: 'image',
        acp: 'image/x-sony-arw',
        exec: 'imageviwer'
    },
    {
        name: 'xcf',
        group: 'image',
        acp: 'image/x-xcf',
        exec: 'imageviwer'
    },
    {
        name: '3mf',
        group: '',
        acp: 'model/3mf',
        exec: ''
    },
    {
        name: 'glb',
        group: '',
        acp: 'model/gltf-binary',
        exec: ''
    },
    {
        name: 'stl',
        group: '',
        acp: 'model/stl',
        exec: ''
    },
    {
        name: 'ics',
        group: '',
        acp: 'text/calendar',
        exec: ''
    },
    {
        name: 'vcf',
        group: '',
        acp: 'text/vcard',
        exec: ''
    },
    {
        name: '3gp',
        group: 'video',
        acp: 'video/3gpp',
        exec: 'videoplayer'
    },
    {
        name: '3g2',
        group: 'video',
        acp: 'video/3gpp2',
        exec: 'videoplayer'
    },
    {
        name: 'm2p',
        group: 'video',
        acp: 'video/MP2P',
        exec: 'videoplayer'
    },
    {
        name: 'vob',
        group: 'video',
        acp: 'video/MP2P',
        exec: 'videoplayer'
    },
    {
        name: 'sub',
        group: 'video',
        acp: 'video/MP2P',
        exec: 'videoplayer',
        msg: '與字幕檔衝突'
    },
    {
        name: 'mts',
        group: 'video',
        acp: 'video/mp2t',
        exec: 'videoplayer'
    },
    {
        name: 'm4p',
        group: 'video',
        acp: 'video/mp4',
        exec: 'videoplayer'
    },
    {
        name: 'f4v',
        group: 'video',
        acp: 'video/mp4',
        exec: 'videoplayer'
    },
    {
        name: 'f4p',
        group: 'video',
        acp: 'video/mp4',
        exec: 'videoplayer'
    },
    {
        name: 'mp4',
        group: 'video',
        acp: 'video/mp4',
        exec: 'videoplayer'
    },
    {
        name: 'mpg',
        group: 'video',
        acp: 'video/mpeg',
        exec: 'videoplayer',
        msg: 'mpg可能為mpeg或video/MP1S或video/MP2S'
    },
    {
        name: 'ogv',
        group: 'video',
        acp: 'video/ogg',
        exec: 'videoplayer'
    },
    {
        name: 'ogm',
        group: 'video',
        acp: 'video/ogg',
        exec: 'videoplayer'
    },
    {
        name: 'mov',
        group: 'video',
        acp: 'video/quicktime',
        exec: 'videoplayer'
    },
    {
        name: 'avi',
        group: 'video',
        acp: 'video/vnd.avi',
        exec: 'videoplayer'
    },
    {
        name: 'webm',
        group: 'video',
        acp: 'video/webm',
        exec: 'videoplayer'
    },
    {
        name: 'flv',
        group: 'video',
        acp: 'video/x-flv',
        exec: 'videoplayer'
    },
    {
        name: 'm4v',
        group: 'video',
        acp: 'video/x-m4v',
        exec: 'videoplayer'
    },
    {
        name: 'mkv',
        group: 'video',
        acp: 'video/x-matroska',
        exec: 'videoplayer'
    }
]


/**
 * 取得檔案類型資訊
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getFileType.test.mjs Github}
 * @memberOf wsemi
 * @param {string} [name=''] 輸入過濾副檔名字串，預設''
 * @returns {Object|Array} 回傳檔案關聯性資訊物件或陣列
 * @example
 *
 * let r
 *
 * r = getFileType('mp3')
 * console.log('name=mp3', r)
 * // => name=mp3 { name: 'mp3', group: 'audio', acp: 'audio/mpeg', exec: 'audioplayer' }
 *
 * r = getFileType('mp4')
 * console.log('name=mp4', r)
 * // => name=mp4 { name: 'mp4', group: 'video', acp: 'video/mp4', exec: 'videoplayer' }
 *
 */
function getFileType(name = '') {

    let r = null
    if (isestr(name)) {
        r = find(fts, { name })
        if (!iseobj(r)) {
            r = null
        }
    }
    else {
        r = fts
    }

    return r
}

export default getFileType
