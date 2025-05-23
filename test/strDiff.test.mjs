import assert from 'assert'
import strDiff from '../src/strDiff.mjs'


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

    it(`sould return '' when input 'test中文', []`, function() {
        let r = strDiff('test中文', [])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}`, function() {
        let r = strDiff('test中文', {})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null`, function() {
        let r = strDiff('test中文', null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', undefined`, function() {
        let r = strDiff('test中文', undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = strDiff('')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = strDiff([])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strDiff({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strDiff(null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strDiff(undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input NaN`, function() {
        let r = strDiff(NaN)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

})
