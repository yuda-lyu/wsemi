import assert from 'assert'
import getDiagBriefErr from '../src/getDiagBriefErr.mjs'
import diagSuite from './tools/diagSuite.mjs'


//getDiagBriefErr為錯誤之安全摘要, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01


describe(`getDiagBriefErr`, function() {

    it(`should not accept codes by pattern, only listed members`, function() {
        //設計§3.3: 不用任何樣式, 整數只收集合明列者
        let f = (c, codes) => getDiagBriefErr(Object.assign(new Error('x'), { code: c }), { codes }).errCode
        assert.strict.deepStrictEqual([f('SQLITE_FOO', ['sqlite']), f('MDB_X', ['lmdb']), f(2627, ['mssql']), f(2627, []), f('DuplicateKey', ['mongoServer'])], [undefined, undefined, 2627, undefined, 'DuplicateKey'])
    })

    it(`should ignore unknown code set names and invalid opt`, function() {
        //設計§3.3: 宣告之集合名稱不存在者不收; opt任何值不拋錯
        let e = Object.assign(new Error('x'), { code: '23505' })
        assert.strict.deepStrictEqual([getDiagBriefErr(e, { codes: ['nope', 'toString'] }), getDiagBriefErr(e, null), getDiagBriefErr(e, 'x')], [{ errType: 'Error' }, { errType: 'Error' }, { errType: 'Error' }])
    })

    diagSuite('getDiagBriefErr')

})
