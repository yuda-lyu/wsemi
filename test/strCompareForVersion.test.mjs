import assert from 'assert'
import strCompareForVersion from '../src/strCompareForVersion.mjs'


describe(`strCompareForVersion`, function() {

    it(`should return 1 when '1.1.27' > '1.1.11'`, function() {
        assert.strict.deepStrictEqual(strCompareForVersion('1.1.27', '1.1.11'), 1)
    })

    it(`should return 0 when '1.1.11' == '1.1.11'`, function() {
        assert.strict.deepStrictEqual(strCompareForVersion('1.1.11', '1.1.11'), 0)
    })

    it(`should return -1 when '1.0.0' < '1.1.11'`, function() {
        assert.strict.deepStrictEqual(strCompareForVersion('1.0.0', '1.1.11'), -1)
    })

    it(`should compare numerically per segment, not lexically ('1.2.10' > '1.2.9')`, function() {
        assert.strict.deepStrictEqual(strCompareForVersion('1.2.10', '1.2.9'), 1)
        assert.strict.deepStrictEqual(strCompareForVersion('1.10.0', '1.9.99'), 1)
        assert.strict.deepStrictEqual(strCompareForVersion('10.0.0', '9.99.99'), 1)
    })

    it(`should accept prefixed/suffixed text such as 'v1.2.10' and 'agy 1.1.27 (build 3)'`, function() {
        assert.strict.deepStrictEqual(strCompareForVersion('v1.2.10', '1.2.9'), 1)
        assert.strict.deepStrictEqual(strCompareForVersion('agy 1.1.27 (build 3)', '1.1.11'), 1)
        assert.strict.deepStrictEqual(strCompareForVersion('codex-cli 0.40.0\n', '0.40.0'), 0)
    })

    it(`should take the first x.y.z occurrence and ignore pre-release tags`, function() {
        assert.strict.deepStrictEqual(strCompareForVersion('1.2.3-beta.1', '1.2.3'), 0)
        assert.strict.deepStrictEqual(strCompareForVersion('build 2024 v1.2.3', '1.2.3'), 0)
    })

    it(`should return null when either side has no x.y.z`, function() {
        assert.strict.deepStrictEqual(strCompareForVersion('abc', '1.0.0'), null)
        assert.strict.deepStrictEqual(strCompareForVersion('1.0.0', 'abc'), null)
        assert.strict.deepStrictEqual(strCompareForVersion('1.2', '1.2.0'), null)
        assert.strict.deepStrictEqual(strCompareForVersion('', '1.0.0'), null)
    })

    it(`should return null for non-string inputs`, function() {
        assert.strict.deepStrictEqual(strCompareForVersion(1, '1.0.0'), null)
        assert.strict.deepStrictEqual(strCompareForVersion(null, '1.0.0'), null)
        assert.strict.deepStrictEqual(strCompareForVersion(undefined, '1.0.0'), null)
        assert.strict.deepStrictEqual(strCompareForVersion(['1.0.0'], '1.0.0'), null)
        assert.strict.deepStrictEqual(strCompareForVersion({}, '1.0.0'), null)
        assert.strict.deepStrictEqual(strCompareForVersion(), null)
    })

})
