import assert from 'assert'
import maskDiagUrl from '../src/maskDiagUrl.mjs'
import diagSuite from './tools/diagSuite.mjs'


//maskDiagUrl為連線字串之回顯, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01(主控裁示Q2: scheme://***, 不回顯主機)


describe(`maskDiagUrl`, function() {

    it(`should echo only a declared scheme and never the host`, function() {
        //Q2: 宣告之scheme回scheme://***, 其餘***; 回傳之scheme取自宣告值
        assert.strict.deepStrictEqual(maskDiagUrl('Postgres://h', { schemes: ['postgres'] }), 'postgres://***')
        assert.strict.deepStrictEqual(maskDiagUrl('postgres://h', {}), '***')
        assert.strict.deepStrictEqual(maskDiagUrl('postgres://h'), '***')
        assert.strict.deepStrictEqual(maskDiagUrl('://h', { schemes: [''] }), '***')
        assert.strict.deepStrictEqual(maskDiagUrl('a b://h', { schemes: ['a b'] }), '***')
    })

    diagSuite('maskDiagUrl')

})
