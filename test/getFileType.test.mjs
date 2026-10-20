import assert from 'assert'
import getFileType from '../src/getFileType.mjs'
import base, { applyChanges } from './tools/getFileTypeBase.mjs'


//既有項目期望值: 修前基準表 + 規則 5 唯一允許之差異(heic 之 acp)
let existing = applyChanges(base)


describe(`getFileType`, function() {

    let o1 = {
        name: 'html',
        group: 'docums',
        acp: 'text/html',
        exec: 'browser',
    }
    it(`should return ${JSON.stringify(o1)} when 'html'`, function() {
        let r = getFileType('html')
        assert.strict.deepStrictEqual(r, o1)
    })

    let o2 = {
        name: 'zip',
        group: 'compress',
        acp: 'application/zip',
        exec: 'compressor'
    }
    it(`should return ${JSON.stringify(o2)} when 'zip'`, function() {
        let r = getFileType('zip')
        assert.strict.deepStrictEqual(r, o2)
    })

})


//R-FILETYPE-01: 新增項目(附於表尾)之預期列, acp 依 IANA 登錄(gpx 無登錄取通行值), group/exec 比照同類既有項目
let newRows = [
    { name: 'jpeg', group: 'image', acp: 'image/jpeg', exec: 'imageviwer' },
    { name: 'jpe', group: 'image', acp: 'image/jpeg', exec: 'imageviwer' },
    { name: 'jfif', group: 'image', acp: 'image/jpeg', exec: 'imageviwer' },
    { name: 'tiff', group: 'image', acp: 'image/tiff', exec: 'imageviwer' },
    { name: 'svg', group: 'image', acp: 'image/svg+xml', exec: 'imageviwer' },
    { name: 'heif', group: 'image', acp: 'image/heif', exec: 'imageviwer' },
    { name: 'md', group: 'data', acp: 'text/markdown', exec: 'textviwer' },
    { name: 'markdown', group: 'data', acp: 'text/markdown', exec: 'textviwer' },
    { name: 'yaml', group: 'data', acp: 'application/yaml', exec: 'textviwer' },
    { name: 'yml', group: 'data', acp: 'application/yaml', exec: 'textviwer' },
    { name: 'log', group: 'data', acp: 'text/plain', exec: 'textviwer' },
    { name: 'ini', group: 'data', acp: 'text/plain', exec: 'textviwer' },
    { name: 'tsv', group: 'data', acp: 'text/tab-separated-values', exec: 'excel' },
    { name: 'kml', group: 'data', acp: 'application/vnd.google-earth.kml+xml', exec: 'textviwer' },
    { name: 'kmz', group: '', acp: 'application/vnd.google-earth.kmz', exec: '' },
    { name: 'gpx', group: 'data', acp: 'application/gpx+xml', exec: 'textviwer', msg: 'gpx無IANA登錄，application/gpx+xml為通行用法' },
    { name: 'dxf', group: 'image', acp: 'image/vnd.dxf', exec: 'imageviwer' },
    { name: 'las', group: '', acp: 'application/vnd.las', exec: '', msg: 'las亦為井測資料(Log ASCII Standard)副檔名，此處依光達點雲(LASer)' },
    { name: 'laz', group: '', acp: 'application/vnd.laszip', exec: '' },
    { name: 'obj', group: '', acp: 'model/obj', exec: '', msg: 'obj亦為編譯目的檔副檔名，此處依3D模型(Wavefront OBJ)' },
    { name: 'gltf', group: '', acp: 'model/gltf+json', exec: '' },
]


describe(`getFileType 既有項目回傳不變(R-FILETYPE-01)`, function() {

    it(`修前基準表為 174 列`, function() {
        assert.strict.deepStrictEqual(base.length, 174)
    })

    it(`全表前 ${base.length} 列與修前逐列相同(順序與內容), 唯一相異列為 heic`, function() {
        let rs = getFileType().slice(0, base.length)
        assert.strict.deepStrictEqual(rs, existing)
        let diff = base.filter((r, i) => JSON.stringify(r) !== JSON.stringify(rs[i])).map((r) => r.name)
        assert.strict.deepStrictEqual(diff, ['heic'])
    })

    it(`修前每個鍵以原名查詢, 仍回該列(heic 之 acp 除外)`, function() {
        for (let row of existing) {
            assert.strict.deepStrictEqual(getFileType(row.name), row, row.name)
        }
    })

    it(`heic 之 acp 為 image/heic(IANA 與 File.type 實際回報), heif 為 image/heif`, function() {
        assert.strict.deepStrictEqual(getFileType('heic'), { name: 'heic', group: 'image', acp: 'image/heic', exec: 'imageviwer' })
        assert.strict.deepStrictEqual(getFileType('HEIC').acp, 'image/heic')
        assert.strict.deepStrictEqual(getFileType('heif'), { name: 'heif', group: 'image', acp: 'image/heif', exec: 'imageviwer' })
        assert.strict.deepStrictEqual(getFileType('Heif').acp, 'image/heif')
    })

    it(`修前未收錄且不在新增項目內者仍回 null`, function() {
        for (let k of ['nonexist', 'jpgg', 'jp', 'xlsm', 'wmv', '.jpg', ' jpg', 'jpg ', 'j p g', '__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
            assert.strict.deepStrictEqual(getFileType(k), null, k)
        }
    })

    it(`無參數與空字串回全表(同一份)`, function() {
        let rs = getFileType()
        assert.strict.deepStrictEqual(Array.isArray(rs), true)
        assert.strict.deepStrictEqual(rs.length, base.length + newRows.length)
        assert.strict.strictEqual(getFileType(''), rs)
    })

})


describe(`getFileType 新增項目(R-FILETYPE-01)`, function() {

    for (let row of newRows) {
        it(`should return ${row.acp} when '${row.name}'`, function() {
            let r = getFileType(row.name)
            assert.strict.deepStrictEqual(r, row)
        })
    }

    it(`表尾恰為預期之 ${newRows.length} 項且順序相同(附於既有項目之後; 順序決定 getFileAccept 分組與 accept 字串之成員順序)`, function() {
        let rs = getFileType()
        assert.strict.deepStrictEqual(rs.slice(base.length), newRows)
    })

    it(`group 與 exec 只使用修前表已有之值`, function() {
        let groups = new Set(base.map((v) => v.group))
        let execs = new Set(base.map((v) => v.exec))
        for (let row of getFileType()) {
            assert.strict.deepStrictEqual(groups.has(row.group), true, `${row.name} group=${row.group}`)
            assert.strict.deepStrictEqual(execs.has(row.exec), true, `${row.name} exec=${row.exec}`)
        }
    })

    it(`group 為 image 者 acp 皆以 image/ 開頭`, function() {
        for (let row of getFileType()) {
            if (row.group === 'image') {
                assert.strict.deepStrictEqual(row.acp.startsWith('image/'), true, row.name)
            }
        }
    })

    it(`鍵一律小寫(唯一例外 Z), 且小寫後無重複`, function() {
        let names = getFileType().map((v) => v.name)
        assert.strict.deepStrictEqual(names.filter((n) => n !== n.toLowerCase()), ['Z'])
        assert.strict.deepStrictEqual(new Set(names.map((n) => n.toLowerCase())).size, names.length)
    })

    it(`鍵不得為 __proto__(getFileAccept 以 r[k] = [] 建分組, 會設定原型而非自有鍵)`, function() {
        let names = getFileType().map((v) => v.name)
        assert.strict.deepStrictEqual(names.filter((n) => n === '__proto__'), [])
    })

})


describe(`getFileType 不分大小寫(R-FILETYPE-01)`, function() {

    let oZ = {
        name: 'Z',
        group: 'compress',
        acp: 'application/x-compress',
        exec: 'compressor'
    }
    it(`should return ${JSON.stringify(oZ)} when 'z' and 'Z'`, function() {
        assert.strict.deepStrictEqual(getFileType('z'), oZ)
        assert.strict.deepStrictEqual(getFileType('Z'), oZ)
    })

    it(`全表: 每個鍵之全大寫, 全小寫, 首字母大寫變體皆回同一列`, function() {
        for (let row of getFileType()) {
            let n = row.name
            let cap = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()
            for (let v of [n.toUpperCase(), n.toLowerCase(), cap]) {
                assert.strict.strictEqual(getFileType(v), row, `${n} <- ${v}`)
            }
        }
    })

    it(`混合大小寫`, function() {
        assert.strict.deepStrictEqual(getFileType('JPG').acp, 'image/jpeg')
        assert.strict.deepStrictEqual(getFileType('jPeG').acp, 'image/jpeg')
        assert.strict.deepStrictEqual(getFileType('SVG').acp, 'image/svg+xml')
        assert.strict.deepStrictEqual(getFileType('Mp3').acp, 'audio/mpeg')
        assert.strict.deepStrictEqual(getFileType('PdF').acp, 'application/pdf')
        assert.strict.deepStrictEqual(getFileType('HTML').acp, 'text/html')
        assert.strict.deepStrictEqual(getFileType('Docx').exec, 'word')
    })

    it(`包裝字串物件(new String)同原始字串`, function() {
        assert.strict.strictEqual(getFileType(new String('html')), getFileType('html')) // eslint-disable-line no-new-wrappers
        assert.strict.strictEqual(getFileType(new String('JPG')), getFileType('jpg')) // eslint-disable-line no-new-wrappers
        assert.strict.deepStrictEqual(getFileType(new String('nonexist')), null) // eslint-disable-line no-new-wrappers
    })

    it(`回傳列之 name 保持表內原樣`, function() {
        assert.strict.deepStrictEqual(getFileType('SVG').name, 'svg')
        assert.strict.deepStrictEqual(getFileType('z').name, 'Z')
    })

    it(`大小寫變體不影響未命中判定`, function() {
        for (let k of ['NONEXIST', 'JPGG', '.JPG', ' JPG', 'JPG ', 'Constructor', '__PROTO__']) {
            assert.strict.deepStrictEqual(getFileType(k), null, k)
        }
    })

})
