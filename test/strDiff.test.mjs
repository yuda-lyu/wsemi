import assert from 'assert'
import strDiff from '../src/strDiff.mjs'
import { NON_STR, LEAK, throwsMsg, throwsMsgNoLeak } from './tools/diffInputKit.mjs'


describe(`strDiff`, function() {
    let k = 0
    let kp = {}

    k++
    kp[k] = {
        oin1: 'test中文',
        oin2: '',
        oout: {
            diff: [{ count: 1, added: false, removed: true, value: 'test中文' }],
            dfs: [{ p: 'remove', vo: 'test中文', vn: '' }]
        }
    }
    it(`sould return '${JSON.stringify(kp[k].oout)}' when input '${JSON.stringify(kp[k].oin1)}', '${JSON.stringify(kp[k].oin2)}'`, function() {
        let k = 1
        let r = strDiff(kp[k].oin1, kp[k].oin2)
        r = JSON.parse(JSON.stringify(r))
        let rr = kp[k].oout
        assert.strict.deepStrictEqual(r, rr)
    })

    k++
    kp[k] = {
        oin1: 'test中文1\ntest中文2',
        oin2: '',
        oout: {
            diff: [
                {
                    count: 2,
                    added: false,
                    removed: true,
                    value: 'test中文1\ntest中文2'
                }
            ],
            dfs: [
                { p: 'remove', vo: 'test中文1', vn: '' },
                { p: 'remove', vo: 'test中文2', vn: '' }
            ]
        }
    }
    it(`sould return '${JSON.stringify(kp[k].oout)}' when input '${JSON.stringify(kp[k].oin1)}', '${JSON.stringify(kp[k].oin2)}'`, function() {
        let k = 2
        let r = strDiff(kp[k].oin1, kp[k].oin2)
        r = JSON.parse(JSON.stringify(r))
        let rr = kp[k].oout
        assert.strict.deepStrictEqual(r, rr)
    })

    k++
    kp[k] = {
        oin1: '',
        oin2: 'test中文',
        oout: {
            diff: [{ count: 1, added: true, removed: false, value: 'test中文' }],
            dfs: [{ p: 'add', vo: 'test中文', vn: '' }]
        }
    }
    it(`sould return '${JSON.stringify(kp[k].oout)}' when input '${JSON.stringify(kp[k].oin1)}', '${JSON.stringify(kp[k].oin2)}'`, function() {
        let k = 3
        let r = strDiff(kp[k].oin1, kp[k].oin2)
        r = JSON.parse(JSON.stringify(r))
        let rr = kp[k].oout
        assert.strict.deepStrictEqual(r, rr)
    })

    k++
    kp[k] = {
        oin1: '',
        oin2: 'test中文1\ntest中文2',
        oout: {
            diff: [
                {
                    count: 2,
                    added: true,
                    removed: false,
                    value: 'test中文1\ntest中文2'
                }
            ],
            dfs: [
                { p: 'add', vo: 'test中文1', vn: '' },
                { p: 'add', vo: 'test中文2', vn: '' }
            ]
        }
    }
    it(`sould return '${JSON.stringify(kp[k].oout)}' when input '${JSON.stringify(kp[k].oin1)}', '${JSON.stringify(kp[k].oin2)}'`, function() {
        let k = 4
        let r = strDiff(kp[k].oin1, kp[k].oin2)
        r = JSON.parse(JSON.stringify(r))
        let rr = kp[k].oout
        assert.strict.deepStrictEqual(r, rr)
    })

    let r5in1 = `1|0.974848293|0.791303871|0.716898185|0.506002098|0.137888903|0.626724085
2|-0.529408622|0.839882385|0.663059856|0.49047221|0.395763265|0.866151835
3|-0.10320217|0.475514539|0.969205779|0.711250309|0.153847069|0.410092395
4|-0.121479865|0.486179086|0.481023842|0.467410582|0.42602231|0.849701641
5|0.757346003|0.697242433|0.67532802|0.174644416|0.045652267|0.397104668
6|0.663032731|0.259252779|0.566177431|0.679637706|0.377814487|0.400248119
7|0.72721374|0.263793391|0.167895215|0.794808602|0.107070584|0.011822872
8|0.247416664|0.360426795|0.014346373|0.000469616|0.4082693|0.913806611
9|0.345880037|0.167996664|0.711054429|0.363177921|0.206849994|0.636855344
10|0.576739457|0.324665077|0.973218005|0.883927423|0.176906125|0.20087887
11|a1
12|a2
13|0.504421248|0.984003751|0.32549507|0.987090751|0.192745589|0.735133561
14|0.273214614|0.083431884|0.565146092|0.935388666|0.637675154|0.523815661
`

    let r5in2 = `1|0.974848293|0.791303871|0.716898185|0.506002098|0.137888903|0.626724085
2|-0.529408622|a0.839882385|0.663059856|0.49047221|0.395763265|0.866151835
3|-0.10320217|0.475514539|0.969205779|0.711250309|0.153847069|0.410092395
4|-0.121479865|0.486179086|0.481023842|0.467410582|0.42602231|0.849701641
5|0.757346003|0.697242433|0.67532802|0.174644416|0.045652267|0.397104668
7|0.72721374|0.263793391|0.167895215|0.794808602|0.107070584|0.011822872
8|0.247416664|0.360426795|0.014346373|0.000469616|0.4082693|0.913806611
9|0.345880037|0.167996664|0.711054429|0.363173478|0.636855344
10|0.576739457|0.324665077|0.973218005|0.883927423|0.176906125|0.20087887
13|0.504421248|0.984003751|0.32549507|0.987090751|0.192745589|0.735133561
14|0.273214614|0.083431884|0.565146092|0.935388666|0.637675154|0.523815661
n1|0.944492151|0.89950443|0.182709318|0.892820757|0.709746901|0.097385354
n2|0.769805921|0.061355308|0.314826137|0.855857651|0.653550539|0.772500773
n3|0.158739038|0.085078711|0.844664253|0.21630142|0.912931341|0.735138313
`

    let r5out = {
        diff: [
            {
                count: 1,
                added: false,
                removed: false,
                value: '1|0.974848293|0.791303871|0.716898185|0.506002098|0.137888903|0.626724085\n'
            },
            {
                count: 1,
                added: false,
                removed: true,
                value: '2|-0.529408622|0.839882385|0.663059856|0.49047221|0.395763265|0.866151835\n'
            },
            {
                count: 1,
                added: true,
                removed: false,
                value: '2|-0.529408622|a0.839882385|0.663059856|0.49047221|0.395763265|0.866151835\n'
            },
            {
                count: 3,
                added: false,
                removed: false,
                value: '3|-0.10320217|0.475514539|0.969205779|0.711250309|0.153847069|0.410092395\n' +
              '4|-0.121479865|0.486179086|0.481023842|0.467410582|0.42602231|0.849701641\n' +
              '5|0.757346003|0.697242433|0.67532802|0.174644416|0.045652267|0.397104668\n'
            },
            {
                count: 1,
                added: false,
                removed: true,
                value: '6|0.663032731|0.259252779|0.566177431|0.679637706|0.377814487|0.400248119\n'
            },
            {
                count: 2,
                added: false,
                removed: false,
                value: '7|0.72721374|0.263793391|0.167895215|0.794808602|0.107070584|0.011822872\n' +
              '8|0.247416664|0.360426795|0.014346373|0.000469616|0.4082693|0.913806611\n'
            },
            {
                count: 1,
                added: false,
                removed: true,
                value: '9|0.345880037|0.167996664|0.711054429|0.363177921|0.206849994|0.636855344\n'
            },
            {
                count: 1,
                added: true,
                removed: false,
                value: '9|0.345880037|0.167996664|0.711054429|0.363173478|0.636855344\n'
            },
            {
                count: 1,
                added: false,
                removed: false,
                value: '10|0.576739457|0.324665077|0.973218005|0.883927423|0.176906125|0.20087887\n'
            },
            { count: 2, added: false, removed: true, value: '11|a1\n12|a2\n' },
            {
                count: 2,
                added: false,
                removed: false,
                value: '13|0.504421248|0.984003751|0.32549507|0.987090751|0.192745589|0.735133561\n' +
              '14|0.273214614|0.083431884|0.565146092|0.935388666|0.637675154|0.523815661\n'
            },
            {
                count: 3,
                added: true,
                removed: false,
                value: 'n1|0.944492151|0.89950443|0.182709318|0.892820757|0.709746901|0.097385354\n' +
              'n2|0.769805921|0.061355308|0.314826137|0.855857651|0.653550539|0.772500773\n' +
              'n3|0.158739038|0.085078711|0.844664253|0.21630142|0.912931341|0.735138313\n'
            }
        ],
        dfs: [
            {
                p: '',
                vo: '1|0.974848293|0.791303871|0.716898185|0.506002098|0.137888903|0.626724085',
                vn: ''
            },
            {
                p: 'modify',
                vo: '2|-0.529408622|0.839882385|0.663059856|0.49047221|0.395763265|0.866151835',
                vn: '2|-0.529408622|a0.839882385|0.663059856|0.49047221|0.395763265|0.866151835'
            },
            {
                p: '',
                vo: '3|-0.10320217|0.475514539|0.969205779|0.711250309|0.153847069|0.410092395',
                vn: ''
            },
            {
                p: '',
                vo: '4|-0.121479865|0.486179086|0.481023842|0.467410582|0.42602231|0.849701641',
                vn: ''
            },
            {
                p: '',
                vo: '5|0.757346003|0.697242433|0.67532802|0.174644416|0.045652267|0.397104668',
                vn: ''
            },
            {
                p: 'remove',
                vo: '6|0.663032731|0.259252779|0.566177431|0.679637706|0.377814487|0.400248119',
                vn: ''
            },
            {
                p: '',
                vo: '7|0.72721374|0.263793391|0.167895215|0.794808602|0.107070584|0.011822872',
                vn: ''
            },
            {
                p: '',
                vo: '8|0.247416664|0.360426795|0.014346373|0.000469616|0.4082693|0.913806611',
                vn: ''
            },
            {
                p: 'modify',
                vo: '9|0.345880037|0.167996664|0.711054429|0.363177921|0.206849994|0.636855344',
                vn: '9|0.345880037|0.167996664|0.711054429|0.363173478|0.636855344'
            },
            {
                p: '',
                vo: '10|0.576739457|0.324665077|0.973218005|0.883927423|0.176906125|0.20087887',
                vn: ''
            },
            { p: 'remove', vo: '11|a1', vn: '' },
            { p: 'remove', vo: '12|a2', vn: '' },
            {
                p: '',
                vo: '13|0.504421248|0.984003751|0.32549507|0.987090751|0.192745589|0.735133561',
                vn: ''
            },
            {
                p: '',
                vo: '14|0.273214614|0.083431884|0.565146092|0.935388666|0.637675154|0.523815661',
                vn: ''
            },
            {
                p: 'add',
                vo: 'n1|0.944492151|0.89950443|0.182709318|0.892820757|0.709746901|0.097385354',
                vn: ''
            },
            {
                p: 'add',
                vo: 'n2|0.769805921|0.061355308|0.314826137|0.855857651|0.653550539|0.772500773',
                vn: ''
            },
            {
                p: 'add',
                vo: 'n3|0.158739038|0.085078711|0.844664253|0.21630142|0.912931341|0.735138313',
                vn: ''
            }
        ]
    }

    k++
    kp[k] = {
        oin1: r5in1,
        oin2: r5in2,
        oout: r5out,
    }
    it(`sould return '${JSON.stringify(kp[k].oout)}' when input '${JSON.stringify(kp[k].oin1)}', '${JSON.stringify(kp[k].oin2)}'`, function() {
        let k = 5
        let r = strDiff(kp[k].oin1, kp[k].oin2)
        r = JSON.parse(JSON.stringify(r))
        let rr = kp[k].oout
        assert.strict.deepStrictEqual(r, rr)
    })

    //ws286c: strOld與strNew為必須參數(使用者2026-11-03逐列確認: 差異比對子類), 非字串throw Error, 訊息固定不帶值, 依strOld、strNew序檢測; ''為合法輸入
    const MSG_OLD = 'invalid strOld: must be a string'
    const MSG_NEW = 'invalid strNew: must be a string'

    for (let [label, v] of NON_STR) {
        it(`should throw '${MSG_OLD}' when strOld is not a string: ${label} (strNew valid, '' or invalid too)`, function() {
            throwsMsg(() => strDiff(v, 'abc'), MSG_OLD)
            throwsMsg(() => strDiff(v, ''), MSG_OLD)
            throwsMsg(() => strDiff(v, v), MSG_OLD)
        })

        it(`should throw '${MSG_NEW}' when strNew is not a string: ${label} (strOld valid or '')`, function() {
            throwsMsg(() => strDiff('abc', v), MSG_NEW)
            throwsMsg(() => strDiff('', v), MSG_NEW)
        })
    }

    it(`should throw when strOld or strNew is not given (required parameters)`, function() {
        throwsMsg(() => strDiff(), MSG_OLD)
        throwsMsg(() => strDiff('abc'), MSG_NEW)
        throwsMsg(() => strDiff(''), MSG_NEW)
        throwsMsg(() => strDiff(undefined, 'abc'), MSG_OLD)
    })

    it(`should throw the fixed messages without the input value`, function() {
        for (let v of [{ secret: LEAK }, [LEAK], Symbol(LEAK), () => LEAK, 7391.4217, new Map([[LEAK, LEAK]])]) {
            throwsMsgNoLeak(() => strDiff(v, 'abc'), MSG_OLD)
            throwsMsgNoLeak(() => strDiff('abc', v), MSG_NEW)
        }
    })

    //兩邊皆為'': 回傳與正常輸出同形之空結果, 不是{}
    it(`should return { diff: [], dfs: [] } when both strOld and strNew are '' (same keys as a normal result)`, function() {
        let r = strDiff('', '')
        assert.strict.deepStrictEqual(r, { diff: [], dfs: [] })
        assert.strict.deepStrictEqual(Object.keys(r), ['diff', 'dfs'])
        assert.strict.deepStrictEqual(Object.keys(r), Object.keys(strDiff('a', 'b')))
    })

    it(`should return { diff: [], dfs: [] } for both '' whatever opt is`, function() {
        for (let opt of [undefined, null, {}, { useNormNewline: false }, { useNormNewline: true }, { useNormNewline: 'x' }, 'x', 123, []]) {
            assert.strict.deepStrictEqual(strDiff('', '', opt), { diff: [], dfs: [] })
        }
    })

    it(`should return a fresh object for each call when both are '' (callers may mutate the result)`, function() {
        let r1 = strDiff('', '')
        r1.dfs.push('x')
        r1.diff.push('y')
        let r2 = strDiff('', '')
        assert.strict.deepStrictEqual(r2, { diff: [], dfs: [] })
        assert.ok(r1 !== r2)
    })

    //只有一邊為空(含只有換行、空白)不是[兩邊皆空], 照常回傳差異結果(取自修前HEAD之實測)
    it(`should return the normal diff when only one side is empty, even if the other side is only a newline or a space`, function() {
        assert.strict.deepStrictEqual(
            strDiff('', '\n'),
            { diff: [{ count: 1, added: true, removed: false, value: '\n' }], dfs: [{ p: 'add', vo: '', vn: '' }] }
        )
        assert.strict.deepStrictEqual(
            strDiff('\n', ''),
            { diff: [{ count: 1, added: false, removed: true, value: '\n' }], dfs: [{ p: 'remove', vo: '', vn: '' }] }
        )
        assert.strict.deepStrictEqual(
            strDiff('\r\n', ''),
            { diff: [{ count: 1, added: false, removed: true, value: '\n' }], dfs: [{ p: 'remove', vo: '', vn: '' }] }
        )
        assert.strict.deepStrictEqual(
            strDiff(' ', ''),
            { diff: [{ count: 1, added: false, removed: true, value: ' ' }], dfs: [{ p: 'remove', vo: ' ', vn: '' }] }
        )
    })

    //opt內無效的鍵維持現行(改用預設), 有效的鍵仍生效
    it(`should use the default useNormNewline when opt or opt.useNormNewline is invalid`, function() {
        let rr = { diff: [{ count: 2, added: false, removed: false, value: 'a\nb' }], dfs: [{ p: '', vo: 'a', vn: '' }, { p: '', vo: 'b', vn: '' }] }
        for (let opt of [undefined, null, 0, 'x', [], true, {}, { useNormNewline: 'x' }, { useNormNewline: null }, { useNormNewline: 1 }, { other: false }]) {
            assert.strict.deepStrictEqual(strDiff('a\r\nb', 'a\nb', opt), rr)
        }
    })

    it(`should respect a valid opt.useNormNewline=false`, function() {
        let r = strDiff('a\r\nb', 'a\nb', { useNormNewline: false })
        assert.strict.deepStrictEqual(r.dfs, [{ p: 'modify', vo: 'a\r', vn: 'a' }, { p: '', vo: 'b', vn: '' }])
    })

    //修前修後相同之有效輸入(取自HEAD之實測)
    it(`should keep the normal result for a plain modify`, function() {
        let r = strDiff('a\nb', 'a\nc')
        let rr = {
            diff: [
                { count: 1, added: false, removed: false, value: 'a\n' },
                { count: 1, added: false, removed: true, value: 'b' },
                { count: 1, added: true, removed: false, value: 'c' },
            ],
            dfs: [{ p: '', vo: 'a', vn: '' }, { p: 'modify', vo: 'b', vn: 'c' }],
        }
        assert.strict.deepStrictEqual(r, rr)
    })

})
