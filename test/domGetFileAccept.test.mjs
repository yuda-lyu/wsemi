import assert from 'assert'
import domGetFileAccept from '../src/domGetFileAccept.mjs'
import base, { applyChanges } from './tools/getFileTypeBase.mjs'


//ws492e: W-17(使用者2026-11-16「甲」): domGetFileAccept依查詢類通則(同domIsFocused: 不拋錯、不輸出console), JSDoc補寫輸入之處置; 行為不改, 本檔釘住JSDoc所載
//  規格: dspec〈輸入參數之檢測機制〉§11 W-17(domGetFileAccept依上二通則並補JSDoc)、K3(帶預設值之位置參數非預期視為未給)
describe(`domGetFileAccept`, function() {

    let quiet = (fn) => {
        let logs = []
        let raw = console.log
        console.log = (...a) => {
            logs.push(a)
        }
        try {
            return { r: fn(), logs }
        }
        finally {
            console.log = raw
        }
    }

    //JSDoc第1點: 未給(undefined)或'*'回'*'
    it(`should return '*' when kind is not given or is '*'`, function() {
        assert.strict.deepStrictEqual(domGetFileAccept(), '*')
        assert.strict.deepStrictEqual(domGetFileAccept(undefined), '*')
        assert.strict.deepStrictEqual(domGetFileAccept('*'), '*')
    })

    //JSDoc第2點: kind非字串亦非有效陣列視為未給(K3), 回'*', 不拋錯、不輸出console
    let BAD = [
        ['null', null],
        ['0', 0],
        ['123', 123],
        ['NaN', NaN],
        ['true', true],
        ['false', false],
        ['{}', {}],
        ['{ a: 1 }', { a: 1 }],
        ['[]', []],
        ['[null]', [null]],
        [`['']`, ['']],
        ['function', () => {}],
        ['Symbol', Symbol('x')],
    ]
    for (let [label, v] of BAD) {
        it(`should treat kind ${label} as not given and return '*' without throwing or logging`, function() {
            let o = null
            assert.doesNotThrow(() => {
                o = quiet(() => domGetFileAccept(v))
            })
            assert.strict.deepStrictEqual(o.r, '*')
            assert.strict.deepStrictEqual(o.logs, [])
        })
    }

    //JSDoc第3點: 字串或有效陣列無任何符合(未知名稱、空字串)回'', 與第2點之'*'不同
    it(`should return '' when a string or a valid array matches nothing`, function() {
        assert.strict.deepStrictEqual(domGetFileAccept('zzz-unknown'), '')
        assert.strict.deepStrictEqual(domGetFileAccept(''), '')
        assert.strict.deepStrictEqual(domGetFileAccept(['zzz-unknown']), '')
        assert.strict.deepStrictEqual(domGetFileAccept(['zzz-unknown', 'nope']), '')
        //兩個以上元素之陣列屬有效陣列(isearr只對單一元素檢查其有效性), 無符合回''而非'*'(內部獨立複審#4; ['', '']之空字串元素會比對到未歸類項目為既有現況, 不凍結於測試)
        assert.strict.deepStrictEqual(domGetFileAccept([null, null]), '')
        assert.strict.deepStrictEqual(domGetFileAccept([5, 6]), '')
        assert.strict.deepStrictEqual(domGetFileAccept([{}, {}]), '')
    })

    //JSDoc第4點: 陣列內之非字串元素視為無符合, 不影響其餘元素
    it(`should ignore non-string elements of a valid array without affecting the others`, function() {
        let want = domGetFileAccept(['jpg'])
        assert.strict.deepStrictEqual(want, 'image/jpeg')
        assert.strict.deepStrictEqual(domGetFileAccept(['jpg', 5, null, {}, ['x']]), want)
        assert.strict.deepStrictEqual(domGetFileAccept([5, 'jpg']), want)
    })

    //種類與副檔名皆可, 'common'為四大類之聯集
    it(`should accept a group name, an extension and 'common'`, function() {
        assert.strict.deepStrictEqual(domGetFileAccept('image').split(',').includes('image/jpeg'), true)
        assert.strict.deepStrictEqual(domGetFileAccept('jpg'), 'image/jpeg')
        let common = domGetFileAccept('common').split(',')
        for (let g of ['docums', 'compress', 'image', 'data']) {
            for (let acp of domGetFileAccept(g).split(',')) {
                assert.strict.deepStrictEqual(common.includes(acp), true)
            }
        }
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
