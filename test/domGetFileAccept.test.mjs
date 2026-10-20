import assert from 'assert'
import domGetFileAccept from '../src/domGetFileAccept.mjs'
import base, { applyChanges } from './tools/getFileTypeBase.mjs'


describe(`domGetFileAccept`, function() {

    it(`need test in browser`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

})


//R-FILETYPE-01: 以修前基準表(獨立於 src)推得修前之 accept 片段, 驗證表擴充後(集合)只增不減
describe(`domGetFileAccept 隨 getFileType 表擴充只增不減(R-FILETYPE-01)`, function() {

    //oldRaw: 修前原樣; oldOf: 套用規則 5(heic 之 acp 為 image/heic)後之既有項目片段, 新增片段附於其後
    let uniq = (arr) => [...new Set(arr)]
    let rowsNow = applyChanges(base)
    let oldRaw = (group) => uniq(base.filter((v) => v.group === group).map((v) => v.acp))
    let oldOf = (group) => uniq(rowsNow.filter((v) => v.group === group).map((v) => v.acp))
    let toks = (s) => (s === '' ? [] : s.split(','))

    //image/heif 原由 heic 帶入, heic 改 image/heic 後改由新增之 heif 列帶入(位於新增片段中)
    let addImage = ['image/svg+xml', 'image/heif', 'image/vnd.dxf']
    let addData = [
        'text/markdown',
        'application/yaml',
        'text/tab-separated-values',
        'application/vnd.google-earth.kml+xml',
        'application/gpx+xml',
    ]

    it(`'*' 與非字串/非陣列維持 '*'`, function() {
        assert.strict.deepStrictEqual(domGetFileAccept('*'), '*')
        assert.strict.deepStrictEqual(domGetFileAccept(), '*')
        assert.strict.deepStrictEqual(domGetFileAccept(123), '*')
    })

    it(`'docums' 與 'compress' 與修前完全相同`, function() {
        assert.strict.deepStrictEqual(domGetFileAccept('docums'), oldOf('docums').join(','))
        assert.strict.deepStrictEqual(domGetFileAccept('compress'), oldOf('compress').join(','))
    })

    it(`'image': 既有片段與順序不變(heic 為 image/heic), 其後附加 ${addImage.join(',')}; 集合為修前之超集`, function() {
        let r = toks(domGetFileAccept('image'))
        assert.strict.deepStrictEqual(r, [...oldOf('image'), ...addImage])
        assert.strict.deepStrictEqual(oldRaw('image').every((v) => r.includes(v)), true)
        assert.strict.deepStrictEqual(r.includes('image/heic'), true)
        assert.strict.deepStrictEqual(r.indexOf('image/heic') < r.indexOf('image/svg+xml'), true)
    })

    it(`'data': 修前片段與順序不變, 其後附加 ${addData.length} 項`, function() {
        let r = toks(domGetFileAccept('data'))
        assert.strict.deepStrictEqual(r, [...oldOf('data'), ...addData])
    })

    it(`'common': 修前片段與相對順序不變, 新增片段恰為 image 與 data 之附加項`, function() {
        let old = [...oldOf('docums'), ...oldOf('compress'), ...oldOf('image'), ...oldOf('data')]
        let oldR = [...oldRaw('docums'), ...oldRaw('compress'), ...oldRaw('image'), ...oldRaw('data')]
        let r = toks(domGetFileAccept('common'))
        assert.strict.deepStrictEqual(r.filter((v) => old.includes(v)), old)
        assert.strict.deepStrictEqual(r.filter((v) => !old.includes(v)), [...addImage, ...addData])
        assert.strict.deepStrictEqual(oldR.every((v) => r.includes(v)), true)
    })

    it(`以副檔名為 kind: 新增副檔名由 '' 改為對應 acp, 既有副檔名不變`, function() {
        assert.strict.deepStrictEqual(domGetFileAccept(['jpg']), 'image/jpeg')
        assert.strict.deepStrictEqual(domGetFileAccept(['jpeg']), 'image/jpeg')
        assert.strict.deepStrictEqual(domGetFileAccept(['svg']), 'image/svg+xml')
        assert.strict.deepStrictEqual(domGetFileAccept(['jpg', 'svg']), 'image/jpeg,image/svg+xml')
        assert.strict.deepStrictEqual(domGetFileAccept(['md']), 'text/markdown')
        assert.strict.deepStrictEqual(domGetFileAccept(['heic']), 'image/heic')
        assert.strict.deepStrictEqual(domGetFileAccept(['heif']), 'image/heif')
        assert.strict.deepStrictEqual(domGetFileAccept(['Z']), 'application/x-compress')
    })

})
