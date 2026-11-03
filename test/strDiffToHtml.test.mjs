import assert from 'assert'
import _ from 'lodash-es'
import strDiffToHtml from '../src/strDiffToHtml.mjs'
import { NON_STR, LEAK, throwsMsg, throwsMsgNoLeak } from './tools/diffInputKit.mjs'


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

    //ws286c: strOld與strNew為必須參數(使用者2026-11-03逐列確認: 差異比對子類), 非字串throw Error, 訊息固定不帶值, 依strOld、strNew序檢測; ''為合法輸入
    const MSG_OLD = 'invalid strOld: must be a string'
    const MSG_NEW = 'invalid strNew: must be a string'

    for (let [label, v] of NON_STR) {
        it(`should throw '${MSG_OLD}' when strOld is not a string: ${label} (strNew valid, '' or invalid too)`, function() {
            throwsMsg(() => strDiffToHtml(v, 'abc'), MSG_OLD)
            throwsMsg(() => strDiffToHtml(v, ''), MSG_OLD)
            throwsMsg(() => strDiffToHtml(v, v), MSG_OLD)
        })

        it(`should throw '${MSG_NEW}' when strNew is not a string: ${label} (strOld valid or '')`, function() {
            throwsMsg(() => strDiffToHtml('abc', v), MSG_NEW)
            throwsMsg(() => strDiffToHtml('', v), MSG_NEW)
        })
    }

    it(`should throw when strOld or strNew is not given (required parameters)`, function() {
        throwsMsg(() => strDiffToHtml(), MSG_OLD)
        throwsMsg(() => strDiffToHtml('abc'), MSG_NEW)
        throwsMsg(() => strDiffToHtml(''), MSG_NEW)
        throwsMsg(() => strDiffToHtml(undefined, 'abc'), MSG_OLD)
    })

    it(`should throw the fixed messages without the input value`, function() {
        for (let v of [{ secret: LEAK }, [LEAK], Symbol(LEAK), () => LEAK, 7391.4217, new Map([[LEAK, LEAK]])]) {
            throwsMsgNoLeak(() => strDiffToHtml(v, 'abc'), MSG_OLD)
            throwsMsgNoLeak(() => strDiffToHtml('abc', v), MSG_NEW)
        }
    })

    //兩邊皆為'': 仍回傳''(無差異可呈現), 不拋錯
    it(`should return '' when both strOld and strNew are '' (whatever opt is)`, function() {
        for (let opt of [undefined, null, {}, { useNormNewline: false }, { useNormNewline: true }, { useNormNewline: 'x' }, 'x', 123, []]) {
            assert.strict.deepStrictEqual(strDiffToHtml('', '', opt), '')
        }
    })

    //只有一邊為空(含只有換行、空白)照常回傳html(取自修前HEAD之實測)
    it(`should return the normal html when only one side is empty, even if the other side is only a newline or a space`, function() {
        assert.strict.deepStrictEqual(
            _.trim(strDiffToHtml('\n', '')),
            _.trim(`
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">-</span>
            <span class="d2h-code-line-ctn"><br></span>
        </div>
`)
        )
        assert.strict.deepStrictEqual(
            _.trim(strDiffToHtml(' ', '')),
            _.trim(`
        <div class="d2h-code-line">
            <span class="d2h-code-line-prefix" style="display:inline-block; width: 0.7rem;">-</span>
            <span class="d2h-code-line-ctn"> </span>
        </div>
`)
        )
    })

    it(`should return the 'File without changes' html when the two strings are the same (not '')`, function() {
        let rr = _.trim(`
        <div class="d2h-code-line">
            File without changes
        </div>
`)
        assert.strict.deepStrictEqual(_.trim(strDiffToHtml('a', 'a')), rr)
        assert.strict.deepStrictEqual(_.trim(strDiffToHtml('a\r\nb', 'a\nb')), rr)
    })

    //opt內無效的鍵維持現行(改用預設)
    it(`should use the default useNormNewline when opt or opt.useNormNewline is invalid`, function() {
        let rr = strDiffToHtml('a\r\nb', 'a\nb')
        for (let opt of [undefined, null, 0, 'x', [], true, {}, { useNormNewline: 'x' }, { useNormNewline: null }, { useNormNewline: 1 }, { other: false }]) {
            assert.strict.deepStrictEqual(strDiffToHtml('a\r\nb', 'a\nb', opt), rr)
        }
    })

})
