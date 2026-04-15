import assert from 'assert'
import isUserPw from '../src/isUserPw.mjs'


describe(`isUserPw`, function() {

    it(`should return true when input 'Asdf%1234'`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%1234')
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return multiple errors when input '246135' (too short, missing uppercase, lowercase, special)`, function() {
        let r = null
        try {
            r = isUserPw('246135')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼長度須大於等於8個字元 | 密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個小寫英文字母 | 密碼須包含至少一個特殊符號`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return multiple errors when input '24681357' (missing uppercase, lowercase, special)`, function() {
        let r = null
        try {
            r = isUserPw('24681357')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個小寫英文字母 | 密碼須包含至少一個特殊符號`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return multiple errors when input 'abcdefgh' (missing uppercase, digit, special)`, function() {
        let r = null
        try {
            r = isUserPw('abcdefgh')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個數字 | 密碼須包含至少一個特殊符號`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return multiple errors when input 'asdf1234' (missing uppercase, special)`, function() {
        let r = null
        try {
            r = isUserPw('asdf1234')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個特殊符號`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return multiple errors when input '123456789012345678901234567890a' (too long, missing uppercase, special)`, function() {
        let r = null
        try {
            r = isUserPw('123456789012345678901234567890a')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼長度須小於等於30個字元 | 密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個特殊符號`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return multiple errors when input '' (too short, missing all char types)`, function() {
        let r = null
        try {
            r = isUserPw('')
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼長度須大於等於8個字元 | 密碼須包含至少一個大寫英文字母 | 密碼須包含至少一個小寫英文字母 | 密碼須包含至少一個數字 | 密碼須包含至少一個特殊符號`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input []`, function() {
        let r = null
        try {
            r = isUserPw([])
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input {}`, function() {
        let r = null
        try {
            r = isUserPw({})
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input null`, function() {
        let r = null
        try {
            r = isUserPw(null)
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input undefined`, function() {
        let r = null
        try {
            r = isUserPw(undefined)
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼非有效字串' when input NaN`, function() {
        let r = null
        try {
            r = isUserPw(NaN)
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼非有效字串`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- noSpace 可配置 ---

    it(`should return true when input 'Asdf %1234' with noSpace=false`, function() {
        let r = null
        try {
            r = isUserPw('Asdf %1234', { noSpace: false })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '密碼不可包含空白字元' when input 'Asdf %1234' with noSpace=true`, function() {
        let r = null
        try {
            r = isUserPw('Asdf %1234', { noSpace: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼不可包含空白字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- requireLetter ---

    it(`should return 'keyLimRequireLetter' when input '1234@5678' with requireLetter=true`, function() {
        let r = null
        try {
            r = isUserPw('1234@5678', { useKeyForError: true, useOnlyOneError: true, requireLetter: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireLetter`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input 'abcd@1234' with requireLetter=true, requireDigit=true, requireSpecial=true`, function() {
        let r = null
        try {
            r = isUserPw('abcd@1234', { useKeyForError: true, requireLetter: true, requireUppercase: false, requireLowercase: true, requireDigit: true, requireSpecial: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- requireUppercase / requireLowercase ---

    it(`should return 'keyLimRequireUppercase' when input 'abcd@1234' with requireUppercase=true`, function() {
        let r = null
        try {
            r = isUserPw('abcd@1234', { useKeyForError: true, useOnlyOneError: true, requireUppercase: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireUppercase`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'keyLimRequireLowercase' when input 'ABCD@1234' with requireLowercase=true`, function() {
        let r = null
        try {
            r = isUserPw('ABCD@1234', { useKeyForError: true, useOnlyOneError: true, requireLowercase: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireLowercase`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- requireDigit ---

    it(`should return 'keyLimRequireDigit' when input 'Abcdefg@!' with requireDigit=true`, function() {
        let r = null
        try {
            r = isUserPw('Abcdefg@!', { useKeyForError: true, useOnlyOneError: true, requireDigit: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireDigit`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- requireSpecial ---

    it(`should return 'keyLimRequireSpecial' when input 'Abcdefg123' with requireSpecial=true`, function() {
        let r = null
        try {
            r = isUserPw('Abcdefg123', { useKeyForError: true, useOnlyOneError: true, requireSpecial: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireSpecial`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- forbiddenChars ---

    it(`should return 'keyLimForbiddenChar' when input contains forbidden char`, function() {
        let r = null
        try {
            r = isUserPw('Abcd@12\\4', { useKeyForError: true, useOnlyOneError: true, requireLetter: true, forbiddenChars: ['\\'] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimForbiddenChar`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- commonPasswordBlacklist ---

    it(`should return 'keyLimCommonPassword' when input '1qaz@WSX' is in blacklist`, function() {
        let r = null
        try {
            r = isUserPw('1qaz@WSX', { useKeyForError: true, useOnlyOneError: true, requireLetter: true, commonPasswordBlacklist: ['1qaz@WSX', 'P@ssw0rd'] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimCommonPassword`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'keyLimCommonPassword' when input 'p@ssw0rd' matches blacklist case-insensitively`, function() {
        let r = null
        try {
            r = isUserPw('p@ssw0rd', { useKeyForError: true, useOnlyOneError: true, requireLetter: true, requireUppercase: false, commonPasswordBlacklist: ['1qaz@WSX', 'P@ssw0rd'] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimCommonPassword`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- noConsecutiveCharsFromAccount ---

    it(`should return 'keyLimConsecutiveCharsFromAccount' when pw contains consecutive chars from account`, function() {
        let r = null
        try {
            r = isUserPw('Xadm@12345', { useKeyForError: true, useOnlyOneError: true, requireLetter: true, account: 'ac-admin', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: 3 })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimConsecutiveCharsFromAccount`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when pw does not contain consecutive chars from account`, function() {
        let r = null
        try {
            r = isUserPw('Xxyz@12345', { useKeyForError: true, useOnlyOneError: true, requireLetter: true, account: 'ac-admin', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: 3 })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- 向下相容 ---

    it(`should return true when no new params given (backward compat) for 'Asdf%1234'`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%1234', { useKeyForError: true, useOnlyOneError: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'keyLimRequireUppercase' when no new params given for 'asdf1234'`, function() {
        let r = null
        try {
            r = isUserPw('asdf1234', { useKeyForError: true, useOnlyOneError: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireUppercase`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- 業主需求完整測試 ---

    it(`should return true for full policy test with 'Abcd@1234'`, function() {
        let policy = {
            useKeyForError: true,
            useOnlyOneError: true,
            numLenMin: 8,
            numLenMax: 16,
            requireLetter: true,
            requireDigit: true,
            requireSpecial: true,
            noSpace: true,
            forbiddenChars: ['\\'],
            noConsecutiveCharsFromAccount: true,
            consecutiveCharsMinMatch: 3,
            commonPasswordBlacklist: ['1qaz@WSX', 'P@ssw0rd'],
            account: 'ac-admin',
        }
        let r = null
        try {
            r = isUserPw('Abcd@1234', policy)
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'keyLimNumLenMin' for full policy test with 'Ab@1'`, function() {
        let policy = {
            useKeyForError: true,
            useOnlyOneError: true,
            numLenMin: 8,
            numLenMax: 16,
            requireLetter: true,
            requireDigit: true,
            requireSpecial: true,
        }
        let r = null
        try {
            r = isUserPw('Ab@1', policy)
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNumLenMin`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'keyLimNumLenMax' for full policy test with too long password`, function() {
        let policy = {
            useKeyForError: true,
            useOnlyOneError: true,
            numLenMin: 8,
            numLenMax: 16,
            requireLetter: true,
            requireDigit: true,
            requireSpecial: true,
        }
        let r = null
        try {
            r = isUserPw('Abcdefghijk@12345', policy)
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNumLenMax`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- 中文訊息 (useKeyForError=false) for new checks ---

    it(`should return Chinese message for requireLetter when useKeyForError=false`, function() {
        let r = null
        try {
            r = isUserPw('1234@5678', { useOnlyOneError: true, requireLetter: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含至少一個英文字母`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return Chinese message for requireUppercase when useKeyForError=false`, function() {
        let r = null
        try {
            r = isUserPw('abcd@1234', { useOnlyOneError: true, requireUppercase: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含至少一個大寫英文字母`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return Chinese message for requireLowercase when useKeyForError=false`, function() {
        let r = null
        try {
            r = isUserPw('ABCD@1234', { useOnlyOneError: true, requireLowercase: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含至少一個小寫英文字母`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return Chinese message for requireDigit when useKeyForError=false`, function() {
        let r = null
        try {
            r = isUserPw('Abcdefg@!', { useOnlyOneError: true, requireDigit: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含至少一個數字`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return Chinese message for requireSpecial when useKeyForError=false`, function() {
        let r = null
        try {
            r = isUserPw('Abcdefg123', { useOnlyOneError: true, requireSpecial: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼須包含至少一個特殊符號`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return Chinese message for forbiddenChars when useKeyForError=false`, function() {
        let r = null
        try {
            r = isUserPw('Abcd@12\\4', { useOnlyOneError: true, requireLetter: true, forbiddenChars: ['\\'] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼不可包含字元：\\`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return Chinese message for commonPasswordBlacklist when useKeyForError=false`, function() {
        let r = null
        try {
            r = isUserPw('1qaz@WSX', { useOnlyOneError: true, requireLetter: true, commonPasswordBlacklist: ['1qaz@WSX'] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `此密碼為常見弱密碼，不允許使用`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return Chinese message for noConsecutiveCharsFromAccount when useKeyForError=false`, function() {
        let r = null
        try {
            r = isUserPw('Xadm@12345', { useOnlyOneError: true, requireLetter: true, account: 'ac-admin', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: 3 })
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼不可包含與帳號相同之3個以上連續字元`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- useOnlyOneError=false 多錯誤累積 ---

    it(`should accumulate multiple errors when useOnlyOneError=false with new params`, function() {
        let r = null
        try {
            r = isUserPw('24681357', { useKeyForError: true, requireLetter: true, requireSpecial: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireLetter | keyLimRequireUppercase | keyLimRequireLowercase | keyLimRequireSpecial`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- noSpace 預設行為 ---

    it(`should block space by default when noSpace is not given`, function() {
        let r = null
        try {
            r = isUserPw('Asdf %1234', { useKeyForError: true, useOnlyOneError: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimHasSpace`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- numLenMin > numLenMax 設定矛盾 ---

    it(`should return 'keyLimNumLenMinOrMax' when numLenMin > numLenMax`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%1234', { useKeyForError: true, numLenMin: 20, numLenMax: 10 })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNumLenMinOrMax`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '設定密碼最小長度大於最大長度' when numLenMin > numLenMax and useKeyForError=false`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%1234', { numLenMin: 20, numLenMax: 10 })
        }
        catch (err) {
            r = err.message
        }
        let rr = `設定密碼最小長度大於最大長度`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- keyLimHasSpace with useKeyForError=true ---

    it(`should return 'keyLimHasSpace' when password has space and useKeyForError=true`, function() {
        let r = null
        try {
            r = isUserPw('Asdf %1234', { useKeyForError: true, useOnlyOneError: true, noSpace: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimHasSpace`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- forbiddenChars 無命中 ---

    it(`should return true when forbiddenChars given but no match`, function() {
        let r = null
        try {
            r = isUserPw('Abcd@1234', { useKeyForError: true, requireLetter: true, forbiddenChars: ['\\', '~'] })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- forbiddenChars 空陣列 ---

    it(`should return true when forbiddenChars is empty array`, function() {
        let r = null
        try {
            r = isUserPw('Abcd@1234', { useKeyForError: true, requireLetter: true, forbiddenChars: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- commonPasswordBlacklist 無命中 ---

    it(`should return true when commonPasswordBlacklist given but no match`, function() {
        let r = null
        try {
            r = isUserPw('Abcd@1234', { useKeyForError: true, requireLetter: true, commonPasswordBlacklist: ['1qaz@WSX', 'P@ssw0rd'] })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- noConsecutiveCharsFromAccount=false 明確禁用 ---

    it(`should skip consecutive check when noConsecutiveCharsFromAccount=false`, function() {
        let r = null
        try {
            r = isUserPw('Xadm@12345', { useKeyForError: true, requireLetter: true, account: 'ac-admin', noConsecutiveCharsFromAccount: false, consecutiveCharsMinMatch: 3 })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- account 長度小於 consecutiveCharsMinMatch 跳過檢查 ---

    it(`should skip consecutive check when account is shorter than consecutiveCharsMinMatch`, function() {
        let r = null
        try {
            r = isUserPw('Xab@12345', { useKeyForError: true, requireLetter: true, account: 'ab', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: 3 })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- requireLetter=false + 其他新參數有給 ---

    it(`should not require letter when requireLetter=false and requireDigit=true`, function() {
        let r = null
        try {
            r = isUserPw('1234@5678', { useKeyForError: true, requireLetter: false, requireUppercase: false, requireLowercase: false, requireDigit: true, requireSpecial: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    // ===================================================================
    // 交互組合測試
    // ===================================================================

    // --- A. useOnlyOneError=true 短路順序：前面的錯擋住後面 ---

    it(`[A1] useOnlyOneError=true: space error blocks char requirement`, function() {
        let r = null
        try {
            r = isUserPw('12 45678', { useKeyForError: true, useOnlyOneError: true, noSpace: true, requireLetter: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimHasSpace`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[A2] useOnlyOneError=true: numLenMin error blocks char requirement`, function() {
        let r = null
        try {
            r = isUserPw('12@', { useKeyForError: true, useOnlyOneError: true, requireLetter: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNumLenMin`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[A3] useOnlyOneError=true: numLenMax error blocks char requirement`, function() {
        let r = null
        try {
            r = isUserPw('12345678901234567890123456789012', { useKeyForError: true, useOnlyOneError: true, numLenMax: 30, requireLetter: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNumLenMax`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[A4] useOnlyOneError=true: requireLetter error blocks forbiddenChars`, function() {
        let r = null
        try {
            r = isUserPw('1234@56\\8', { useKeyForError: true, useOnlyOneError: true, requireLetter: true, forbiddenChars: ['\\'] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireLetter`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[A5] useOnlyOneError=true: forbiddenChars error blocks blacklist`, function() {
        let r = null
        try {
            r = isUserPw('1qaz@WS\\', { useKeyForError: true, useOnlyOneError: true, requireLetter: true, forbiddenChars: ['\\'], commonPasswordBlacklist: ['1qaz@WS\\'] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimForbiddenChar`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[A6] useOnlyOneError=true: blacklist error blocks consecutive`, function() {
        let r = null
        try {
            r = isUserPw('1qaz@WSX', { useKeyForError: true, useOnlyOneError: true, requireLetter: true, commonPasswordBlacklist: ['1qaz@WSX'], account: '1qaz@WSX', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: 3 })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimCommonPassword`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[A7] useOnlyOneError=true: requireLetter blocks requireDigit`, function() {
        let r = null
        try {
            r = isUserPw('!@#$%^&*', { useKeyForError: true, useOnlyOneError: true, requireLetter: true, requireDigit: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireLetter`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[A8] useOnlyOneError=true: requireUppercase blocks requireLowercase`, function() {
        let r = null
        try {
            r = isUserPw('1234@567', { useKeyForError: true, useOnlyOneError: true, numLenMin: 8, requireUppercase: true, requireLowercase: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireUppercase`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- B. useOnlyOneError=false 跨類別多錯誤累積 ---

    it(`[B1] useOnlyOneError=false: space + char requirement errors accumulate`, function() {
        let r = null
        try {
            r = isUserPw('12 45678', { useKeyForError: true, noSpace: true, requireLetter: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimHasSpace | keyLimRequireLetter | keyLimRequireUppercase | keyLimRequireLowercase | keyLimRequireSpecial`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[B2] useOnlyOneError=false: numLenMin + char requirement errors accumulate`, function() {
        let r = null
        try {
            r = isUserPw('1@3', { useKeyForError: true, requireLetter: true, requireUppercase: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNumLenMin | keyLimRequireLetter | keyLimRequireUppercase | keyLimRequireLowercase`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[B3] useOnlyOneError=false: multiple char + forbiddenChars + blacklist + consecutive all accumulate`, function() {
        let r = null
        try {
            r = isUserPw('admin@12', { useKeyForError: true, requireUppercase: true, forbiddenChars: ['@'], commonPasswordBlacklist: ['admin@12'], account: 'admin', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: 3 })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireUppercase | keyLimForbiddenChar | keyLimCommonPassword | keyLimConsecutiveCharsFromAccount`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[B4] useOnlyOneError=false: space + numLenMin + individual char errors all accumulate`, function() {
        let r = null
        try {
            r = isUserPw('1 3', { useKeyForError: true, noSpace: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimHasSpace | keyLimNumLenMin | keyLimRequireUppercase | keyLimRequireLowercase | keyLimRequireSpecial`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[B5] useOnlyOneError=false: all five new char requirements fail simultaneously`, function() {
        let r = null
        try {
            // 中文字元非英文字母、非數字、非ASCII特殊符號
            r = isUserPw('中文中文中文中文', { useKeyForError: true, onlyAscii: false, requireLetter: true, requireUppercase: true, requireLowercase: true, requireDigit: true, requireSpecial: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireLetter | keyLimRequireUppercase | keyLimRequireLowercase | keyLimRequireDigit | keyLimRequireSpecial`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- C. 新字元要求內部組合 ---

    it(`[C1] requireLetter=true + requireUppercase=true: lowercase-only pw fails uppercase but passes letter`, function() {
        let r = null
        try {
            r = isUserPw('abcde@123', { useKeyForError: true, requireLetter: true, requireUppercase: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireUppercase`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[C2] requireLetter=true + requireLowercase=true + requireUppercase=true: all three pass`, function() {
        let r = null
        try {
            r = isUserPw('Abcde@123', { useKeyForError: true, requireLetter: true, requireLowercase: true, requireUppercase: true, requireDigit: true, requireSpecial: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[C3] requireLetter=true + requireLowercase=true + requireUppercase=true: digits-only pw fails all three`, function() {
        let r = null
        try {
            r = isUserPw('12345@78', { useKeyForError: true, requireLetter: true, requireLowercase: true, requireUppercase: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireLetter | keyLimRequireUppercase | keyLimRequireLowercase`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- D. requireXxx=false 觸發 useNewCharRequirements，舊邏輯不執行 ---

    it(`[D1] requireSpecial=false only disables special check, other defaults still apply`, function() {
        let r = null
        try {
            r = isUserPw('asdf1234', { useKeyForError: true, useOnlyOneError: true, requireSpecial: false })
        }
        catch (err) {
            r = err.message
        }
        // requireSpecial=false 關閉特殊符號，但 requireUppercase 預設 true 仍生效
        let rr = `keyLimRequireUppercase`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[D2] requireUppercase=false + requireDigit=true: no uppercase required, digit required`, function() {
        let r = null
        try {
            r = isUserPw('abcde@12', { useKeyForError: true, requireUppercase: false, requireDigit: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[D3] all five new params=false: effectively no char check at all`, function() {
        let r = null
        try {
            r = isUserPw('24681357', { useKeyForError: true, requireLetter: false, requireUppercase: false, requireLowercase: false, requireDigit: false, requireSpecial: false })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[D4] only requireLetter=false, other defaults still apply`, function() {
        let r = null
        try {
            r = isUserPw('24681357', { useKeyForError: true, requireLetter: false })
        }
        catch (err) {
            r = err.message
        }
        // requireLetter=false 不要求英文字母，但 requireUppercase/requireLowercase/requireSpecial 預設 true 仍生效
        let rr = `keyLimRequireUppercase | keyLimRequireLowercase | keyLimRequireSpecial`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- E. noSpace=false 不影響後續檢查 ---

    it(`[E1] noSpace=false: space password still checked for char requirements`, function() {
        let r = null
        try {
            r = isUserPw('ab d@1234', { useKeyForError: true, noSpace: false, requireLetter: true, requireUppercase: false, requireDigit: true, requireSpecial: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[E2] noSpace=false: space password can still fail other checks`, function() {
        let r = null
        try {
            r = isUserPw('12 45678', { useKeyForError: true, useOnlyOneError: true, noSpace: false, requireLetter: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireLetter`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- F. forbiddenChars + blacklist + consecutive 同時命中 ---

    it(`[F1] useOnlyOneError=false: forbiddenChars + blacklist both hit`, function() {
        let r = null
        try {
            r = isUserPw('P@ssw0rd', { useKeyForError: true, requireLetter: true, forbiddenChars: ['@'], commonPasswordBlacklist: ['P@ssw0rd'] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimForbiddenChar | keyLimCommonPassword`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[F2] useOnlyOneError=false: blacklist + consecutive both hit`, function() {
        let r = null
        try {
            r = isUserPw('admin@12', { useKeyForError: true, requireLetter: true, requireUppercase: false, commonPasswordBlacklist: ['admin@12'], account: 'admin123', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: 3 })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimCommonPassword | keyLimConsecutiveCharsFromAccount`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[F3] useOnlyOneError=false: forbiddenChars + consecutive both hit, blacklist miss`, function() {
        let r = null
        try {
            r = isUserPw('admi\\@12', { useKeyForError: true, requireLetter: true, requireUppercase: false, forbiddenChars: ['\\'], commonPasswordBlacklist: ['other'], account: 'admin123', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: 3 })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimForbiddenChar | keyLimConsecutiveCharsFromAccount`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- G. 完整交互：所有設定同時啟用，密碼通過 ---

    it(`[G1] all features enabled, valid password passes everything`, function() {
        let r = null
        try {
            r = isUserPw('Xy!45678', {
                useKeyForError: true,
                useOnlyOneError: false,
                noSpace: true,
                numLenMin: 8,
                numLenMax: 16,
                requireLetter: true,
                requireUppercase: true,
                requireLowercase: true,
                requireDigit: true,
                requireSpecial: true,
                forbiddenChars: ['\\', '`'],
                commonPasswordBlacklist: ['1qaz@WSX', 'P@ssw0rd'],
                account: 'testuser',
                noConsecutiveCharsFromAccount: true,
                consecutiveCharsMinMatch: 3,
            })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[G2] all features enabled, password fails maximum number of checks`, function() {
        let r = null
        try {
            // '  ' → space, too short, no letter/upper/lower/digit/special
            // Note: '  ' length=2 < 8, has space, no letter/upper/lower/digit/special
            // forbiddenChars [' '] hits, blacklist won't match, consecutive won't match (account too different)
            r = isUserPw('!!!\\!!!!', {
                useKeyForError: true,
                useOnlyOneError: false,
                noSpace: true,
                numLenMin: 8,
                numLenMax: 16,
                requireLetter: true,
                requireUppercase: true,
                requireLowercase: true,
                requireDigit: true,
                forbiddenChars: ['\\'],
                commonPasswordBlacklist: ['!!!\\!!!!'],
                account: '!!!\\!!!!',
                noConsecutiveCharsFromAccount: true,
                consecutiveCharsMinMatch: 3,
            })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimRequireLetter | keyLimRequireUppercase | keyLimRequireLowercase | keyLimRequireDigit | keyLimForbiddenChar | keyLimCommonPassword | keyLimConsecutiveCharsFromAccount`
        assert.strict.deepStrictEqual(r, rr)
    })

    // ===================================================================
    // onlyAscii 測試
    // ===================================================================

    it(`should return 'keyLimNonAsciiChar' when password contains Chinese characters`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%12中', { useKeyForError: true, useOnlyOneError: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNonAsciiChar`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'keyLimNonAsciiChar' when password contains emoji`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%12😀', { useKeyForError: true, useOnlyOneError: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNonAsciiChar`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'keyLimNonAsciiChar' when password contains Unicode symbol ©`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%12©', { useKeyForError: true, useOnlyOneError: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNonAsciiChar`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'keyLimNonAsciiChar' when password contains Unicode letter Ü`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%12Ü', { useKeyForError: true, useOnlyOneError: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNonAsciiChar`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return Chinese message for onlyAscii when useKeyForError=false`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%12中', { useOnlyOneError: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼僅允許使用英文大小寫、數字及特殊符號`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when password has ASCII only and onlyAscii=true`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%1234', { useKeyForError: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should allow Unicode when onlyAscii=false`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%12中', { useKeyForError: true, onlyAscii: false, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'keyLimNonAsciiChar' when password contains control character`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%12\x01', { useKeyForError: true, useOnlyOneError: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNonAsciiChar`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[onlyAscii] useOnlyOneError=true: onlyAscii error blocks later checks`, function() {
        let r = null
        try {
            r = isUserPw('中文中文中文中文', { useKeyForError: true, useOnlyOneError: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNonAsciiChar`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`[onlyAscii] useOnlyOneError=false: onlyAscii error accumulates with other errors`, function() {
        let r = null
        try {
            r = isUserPw('中文', { useKeyForError: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNonAsciiChar | keyLimNumLenMin | keyLimRequireUppercase | keyLimRequireLowercase | keyLimRequireDigit | keyLimRequireSpecial`
        assert.strict.deepStrictEqual(r, rr)
    })

    // ===================================================================
    // 問題修正驗證
    // ===================================================================

    // --- 問題2: 分隔符為 ' | ' ---

    it(`should use ' | ' as separator for multiple errors`, function() {
        let r = null
        try {
            r = isUserPw('asdf1234', { commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        assert.strict.deepStrictEqual(r.includes(' | '), true)
        assert.strict.deepStrictEqual(r.includes(','), false)
    })

    // --- 問題6: forbiddenChars message模式報全部違規字元 ---

    it(`should report all forbidden chars in message mode`, function() {
        let r = null
        try {
            r = isUserPw('Ab@1#2&3', { forbiddenChars: ['@', '#', '&'], commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼不可包含字元：@ | 密碼不可包含字元：# | 密碼不可包含字元：&`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should report only one keyLimForbiddenChar in key mode`, function() {
        let r = null
        try {
            r = isUserPw('Ab@1#2&3', { useKeyForError: true, forbiddenChars: ['@', '#', '&'], commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimForbiddenChar`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- 問題7: numLenMin=0 允許空密碼(長度0) ---

    it(`should allow numLenMin=0`, function() {
        let r = null
        try {
            r = isUserPw('A@1', { numLenMin: 0, requireUppercase: true, requireLowercase: false, requireDigit: true, requireSpecial: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback numLenMin to 8 when given negative`, function() {
        let r = null
        try {
            r = isUserPw('Ab@1', { useKeyForError: true, useOnlyOneError: true, numLenMin: -1, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNumLenMin`
        assert.strict.deepStrictEqual(r, rr)
    })

    // ===================================================================
    // 覆蓋性補齊
    // ===================================================================

    // --- 預設黑名單實際命中 ---

    it(`should catch 'password' from default blacklist`, function() {
        let r = null
        try {
            r = isUserPw('password', { useKeyForError: true, useOnlyOneError: true, requireUppercase: false, requireSpecial: false, requireDigit: false })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimCommonPassword`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should catch '123456' from default blacklist`, function() {
        let r = null
        try {
            r = isUserPw('123456', { useKeyForError: true, useOnlyOneError: true, numLenMin: 1, requireUppercase: false, requireLowercase: false, requireSpecial: false })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimCommonPassword`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should catch 'Aa123456' from default blacklist (case-insensitive)`, function() {
        let r = null
        try {
            r = isUserPw('aa123456', { useKeyForError: true, useOnlyOneError: true, requireUppercase: false, requireSpecial: false })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimCommonPassword`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- forbiddenChars 含逗號 ---

    it(`should correctly report forbidden comma without separator confusion`, function() {
        let r = null
        try {
            r = isUserPw('Ab@1,234', { forbiddenChars: [','], commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `密碼不可包含字元：,`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- 邊界值：密碼長度剛好等於 numLenMin / numLenMax ---

    it(`should pass when password length equals numLenMin exactly`, function() {
        let r = null
        try {
            r = isUserPw('Ab@12345', { useKeyForError: true, numLenMin: 8, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should pass when password length equals numLenMax exactly`, function() {
        let r = null
        try {
            r = isUserPw('Ab@12345', { useKeyForError: true, numLenMax: 8, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fail when password length is numLenMin - 1`, function() {
        let r = null
        try {
            r = isUserPw('Ab@1234', { useKeyForError: true, useOnlyOneError: true, numLenMin: 8, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNumLenMin`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fail when password length is numLenMax + 1`, function() {
        let r = null
        try {
            r = isUserPw('Ab@123456', { useKeyForError: true, useOnlyOneError: true, numLenMax: 8, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNumLenMax`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- 密碼等於帳號 ---

    it(`should catch when password equals account`, function() {
        let r = null
        try {
            r = isUserPw('Admin@12', { useKeyForError: true, useOnlyOneError: true, account: 'Admin@12', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: 3, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimConsecutiveCharsFromAccount`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- consecutiveCharsMinMatch=1 極端值 ---

    it(`should match single character when consecutiveCharsMinMatch=1`, function() {
        let r = null
        try {
            r = isUserPw('Xbcd@123', { useKeyForError: true, useOnlyOneError: true, account: 'abc', noConsecutiveCharsFromAccount: true, consecutiveCharsMinMatch: 1, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        // 'Xbcd@123' contains 'b' and 'c' from account 'abc', with minMatch=1 any single char match triggers
        let rr = `keyLimConsecutiveCharsFromAccount`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- numLenMax=0 邊界 ---

    it(`should return keyLimNumLenMinOrMax when numLenMax=0 and numLenMin defaults to 8`, function() {
        let r = null
        try {
            r = isUserPw('Ab@12345', { useKeyForError: true, numLenMax: 0 })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNumLenMinOrMax`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- numLenMin/numLenMax 傳字串 ---

    it(`should accept string '10' for numLenMin`, function() {
        let r = null
        try {
            r = isUserPw('Ab@12345', { useKeyForError: true, useOnlyOneError: true, numLenMin: '10', commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNumLenMin`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- onlyAscii=true, noSpace=false + tab ---

    it(`should catch tab with onlyAscii=true even when noSpace=false`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%\t234', { useKeyForError: true, useOnlyOneError: true, noSpace: false, onlyAscii: true, commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimNonAsciiChar`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- 完全預設（不傳 opt）---

    it(`should work with all defaults (no opt)`, function() {
        let r = null
        try {
            r = isUserPw('Asdf%1234')
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should catch default blacklist password with all defaults`, function() {
        let r = null
        try {
            r = isUserPw('P@ssw0rd', { useKeyForError: true, useOnlyOneError: true })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimCommonPassword`
        assert.strict.deepStrictEqual(r, rr)
    })

    // --- forbiddenChars 含多字元字串（子字串比對）---

    it(`should match multi-char forbidden string as substring`, function() {
        let r = null
        try {
            r = isUserPw('Abc@1abc', { useKeyForError: true, useOnlyOneError: true, forbiddenChars: ['abc'], commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = `keyLimForbiddenChar`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not match multi-char forbidden string when not present as substring`, function() {
        let r = null
        try {
            r = isUserPw('Axyz@123', { useKeyForError: true, forbiddenChars: ['abc'], commonPasswordBlacklist: [] })
        }
        catch (err) {
            r = err.message
        }
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

})
