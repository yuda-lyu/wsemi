import assert from 'assert'
import _ from 'lodash-es'
import strDiffToHtml from '../src/strDiffToHtml.mjs'


describe(`strDiffToHtml`, function() {
    let k = 0
    let kp = {}

    k++
    kp[k] = {
        oin1: 'test中文',
        oin2: 'test',
        oout: _.trim(`
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">-</span>
            <span class="d2h-code-line-ctn">test<del style="color:#f26; background:#ffefd5;">中文</del></span>
        </div>
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">+</span>
            <span class="d2h-code-line-ctn">test</span>
        </div>
        `),
    }
    it(`sould return '${kp[k].oout}' when input '${kp[k].oin1}', '${kp[k].oin2}'`, function() {
        let k = 1
        let r = strDiffToHtml(kp[k].oin1, kp[k].oin2)
        r = _.trim(r)
        let rr = kp[k].oout
        assert.strict.deepStrictEqual(r, rr)
    })

    k++
    kp[k] = {
        oin1: 'test中文',
        oin2: 'tes文',
        oout: _.trim(`
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">-</span>
            <span class="d2h-code-line-ctn">tes<del style="color:#f26; background:#ffefd5;">t中</del>文</span>
        </div>
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">+</span>
            <span class="d2h-code-line-ctn">tes文</span>
        </div>
        `),
    }
    it(`sould return '${kp[k].oout}' when input '${kp[k].oin1}', '${kp[k].oin2}'`, function() {
        let k = 2
        let r = strDiffToHtml(kp[k].oin1, kp[k].oin2)
        r = _.trim(r)
        let rr = kp[k].oout
        assert.strict.deepStrictEqual(r, rr)
    })

    k++
    kp[k] = {
        oin1: 'test中文',
        oin2: 'tet中英文',
        oout: _.trim(`
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">-</span>
            <span class="d2h-code-line-ctn">te<del style="color:#f26; background:#ffefd5;">s</del>t中文</span>
        </div>
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">+</span>
            <span class="d2h-code-line-ctn">tet中<ins style="color:#090; background:#e4fed1;">英</ins>文</span>
        </div>
        `),
    }
    it(`sould return '${kp[k].oout}' when input '${kp[k].oin1}', '${kp[k].oin2}'`, function() {
        let k = 3
        let r = strDiffToHtml(kp[k].oin1, kp[k].oin2)
        r = _.trim(r)
        let rr = kp[k].oout
        assert.strict.deepStrictEqual(r, rr)
    })

    k++
    kp[k] = {
        oin1: 'test中文',
        oin2: '',
        oout: _.trim(`
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">-</span>
            <span class="d2h-code-line-ctn">test中文</span>
        </div>
        `),
    }
    it(`sould return '${kp[k].oout}' when input '${kp[k].oin1}', '${kp[k].oin2}'`, function() {
        let k = 4
        let r = strDiffToHtml(kp[k].oin1, kp[k].oin2)
        r = _.trim(r)
        let rr = kp[k].oout
        assert.strict.deepStrictEqual(r, rr)
    })

    k++
    kp[k] = {
        oin1: '',
        oin2: 'test中文',
        oout: _.trim(`
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">+</span>
            <span class="d2h-code-line-ctn">test中文</span>
        </div>
        `),
    }
    it(`sould return '${kp[k].oout}' when input '${kp[k].oin1}', '${kp[k].oin2}'`, function() {
        let k = 5
        let r = strDiffToHtml(kp[k].oin1, kp[k].oin2)
        r = _.trim(r)
        let rr = kp[k].oout
        assert.strict.deepStrictEqual(r, rr)
    })

    k++
    kp[k] = {
        oin1: `This is a long text used for testing.
It contains multiple sentences that will be modified.`,
        oin2: `This is a long text used for testing.
This section has been replaced completely.`,
        oout: _.trim(`
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">&nbsp;</span>
            <span class="d2h-code-line-ctn">This is a long text used for testing.</span>
        </div>
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">-</span>
            <span class="d2h-code-line-ctn"><del style="color:#f26; background:#ffefd5;">It</del> c<del style="color:#f26; background:#ffefd5;">on</del>t<del style="color:#f26; background:#ffefd5;">a</del>ins <del style="color:#f26; background:#ffefd5;">multipl</del>e<del style="color:#f26; background:#ffefd5;"> s</del>en<del style="color:#f26; background:#ffefd5;">t</del>e<del style="color:#f26; background:#ffefd5;">n</del>ce<del style="color:#f26; background:#ffefd5;">s</del> <del style="color:#f26; background:#ffefd5;">that wi</del>l<del style="color:#f26; background:#ffefd5;">l b</del>e<del style="color:#f26; background:#ffefd5;"> modifi</del>e<del style="color:#f26; background:#ffefd5;">d</del>.</span>
        </div>
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">+</span>
            <span class="d2h-code-line-ctn"><ins style="color:#090; background:#e4fed1;">This</ins> <ins style="color:#090; background:#e4fed1;">se</ins>cti<ins style="color:#090; background:#e4fed1;">o</ins>n<ins style="color:#090; background:#e4fed1;"> ha</ins>s <ins style="color:#090; background:#e4fed1;">b</ins>een<ins style="color:#090; background:#e4fed1;"> r</ins>e<ins style="color:#090; background:#e4fed1;">pla</ins>ce<ins style="color:#090; background:#e4fed1;">d</ins> <ins style="color:#090; background:#e4fed1;">comp</ins>le<ins style="color:#090; background:#e4fed1;">t</ins>e<ins style="color:#090; background:#e4fed1;">ly</ins>.</span>
        </div>
        `),
    }
    it(`sould return '${kp[k].oout}' when input '${kp[k].oin1}', '${kp[k].oin2}'`, function() {
        let k = 6
        let r = strDiffToHtml(kp[k].oin1, kp[k].oin2)
        r = _.trim(r)
        let rr = kp[k].oout
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', []`, function() {
        let r = strDiffToHtml('test中文', [])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}`, function() {
        let r = strDiffToHtml('test中文', {})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null`, function() {
        let r = strDiffToHtml('test中文', null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', undefined`, function() {
        let r = strDiffToHtml('test中文', undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = strDiffToHtml('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = strDiffToHtml([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strDiffToHtml({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strDiffToHtml(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strDiffToHtml(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input NaN`, function() {
        let r = strDiffToHtml(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
