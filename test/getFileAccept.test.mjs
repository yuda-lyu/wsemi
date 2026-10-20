import assert from 'assert'
import getFileAccept from '../src/getFileAccept.mjs'
import getFileType from '../src/getFileType.mjs'
import base, { applyChanges } from './tools/getFileTypeBase.mjs'


describe(`getFileAccept`, function() {

    let o1 = {
        name: 'json',
        group: 'data',
        acp: 'application/json',
        exec: 'textviwer',
    }
    it(`should return ${JSON.stringify(o1)} when no input and get [4]`, function() {
        let r = getFileAccept()[4]
        assert.strict.deepStrictEqual(r, o1)
    })

    let o2 = [{
        name: 'htm',
        group: 'docums',
        acp: 'text/html',
        exec: 'browser'
    },
    {
        name: 'html',
        group: 'docums',
        acp: 'text/html',
        exec: 'browser'
    }]
    it(`should return ${JSON.stringify(o2)} when 'acp' and get ['text/html']`, function() {
        let r = getFileAccept('acp')['text/html']
        assert.strict.deepStrictEqual(r, o2)
    })

})


describe(`getFileAccept 隨 getFileType 表擴充(R-FILETYPE-01)`, function() {

    it(`getFileAccept() 與 getFileType() 為同一份全表, 前 ${base.length} 列為修前原樣(唯一差異 heic 之 acp)`, function() {
        assert.strict.strictEqual(getFileAccept(), getFileType())
        assert.strict.deepStrictEqual(getFileAccept().slice(0, base.length), applyChanges(base))
    })

    it(`依 acp 群組化: 既有成員順序不變, 新增成員附於其後`, function() {
        let r = getFileAccept('acp')
        assert.strict.deepStrictEqual(r['image/jpeg'].map((v) => v.name), ['jpg', 'jpeg', 'jpe', 'jfif'])
        assert.strict.deepStrictEqual(r['image/tiff'].map((v) => v.name), ['tif', 'tiff'])
        assert.strict.deepStrictEqual(r['text/plain'].map((v) => v.name), ['txt', 'log', 'ini'])
        assert.strict.deepStrictEqual(r['image/heic'].map((v) => v.name), ['heic'])
        assert.strict.deepStrictEqual(r['image/heif'].map((v) => v.name), ['heif'])
        assert.strict.deepStrictEqual(r['image/svg+xml'].map((v) => v.name), ['svg'])
        assert.strict.deepStrictEqual(r['text/markdown'].map((v) => v.name), ['md', 'markdown'])
        assert.strict.deepStrictEqual(r['application/yaml'].map((v) => v.name), ['yaml', 'yml'])
    })

    it(`依 name 群組化: 每個鍵恰一列, 表內大寫鍵 Z 維持原樣`, function() {
        let r = getFileAccept('name')
        assert.strict.deepStrictEqual(Object.keys(r).length, getFileAccept().length)
        assert.strict.deepStrictEqual(r['Z'].length, 1)
    })

})


describe(`getFileAccept 分組鍵以自有屬性判斷(R-FILETYPE-01 規則 6)`, function() {

    //Object.prototype 之成員名(不含 __proto__, 其由規則 1 禁止作為表內值)
    let protoNames = ['constructor', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString']

    //於 getFileType() 回傳之表尾暫時加列(getFileAccept 取同一份表), 結束必還原
    function withRows(rows, fun) {
        let tbl = getFileType()
        let n0 = tbl.length
        tbl.push(...rows)
        try {
            return fun()
        }
        finally {
            tbl.splice(n0)
        }
    }

    for (let by of ['name', 'acp', 'group', 'exec']) {
        it(`${by} 之值為 Object.prototype 成員名: 不拋錯, 各值為自有鍵且成員為該值之列`, function() {
            let mk = (v, i) => ({ name: `zz${i}`, group: 'g', acp: 'a/b', exec: '', [by]: v })
            let rows = [...protoNames.map(mk), mk('constructor', 99)]
            let r = withRows(rows, () => getFileAccept(by))
            for (let v of protoNames) {
                assert.strict.deepStrictEqual(Object.prototype.hasOwnProperty.call(r, v), true, v)
                assert.strict.deepStrictEqual(Array.isArray(r[v]), true, v)
                let expected = rows.filter((x) => x[by] === v)
                assert.strict.deepStrictEqual(r[v], expected, v)
            }
            assert.strict.deepStrictEqual(r['constructor'].length, 2)
        })
    }

    it(`回傳物件之原型仍為 Object.prototype, 分組值皆為陣列`, function() {
        for (let by of ['name', 'acp', 'group', 'exec']) {
            let r = getFileAccept(by)
            assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
            for (let k of Object.keys(r)) {
                assert.strict.deepStrictEqual(Array.isArray(r[k]), true, `${by} ${k}`)
            }
        }
    })

    it(`暫時加列後已還原, 表長度與修前加新增項相同`, function() {
        let n = getFileType().length
        withRows([{ name: 'zz', group: 'g', acp: 'a/b', exec: '' }], () => null)
        assert.strict.deepStrictEqual(getFileType().length, n)
        assert.strict.deepStrictEqual(n, base.length + 21)
    })

})
