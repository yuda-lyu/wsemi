import assert from 'assert'
import arrDiff from '../src/arrDiff.mjs'
import { NON_ARR, LEAK, throwsMsg, throwsMsgNoLeak, oldDiffToNew } from './tools/diffInputKit.mjs'


describe(`arrDiff`, function() {
    let k = 0
    let kp = {}

    let r1in1 = [-0.529408622, 0.839882385, 0.663059856, 0.49047221, 123, 0.395763265, 0.866151835]
    let r1in2 = [-0.529408622, 0.1839882385, 0.663059856, 0.49047221, 0.395763265, 45.6, 0.866151835]
    let r1out = {
        diff: [
            { count: 1, added: false, removed: false, value: '-0.529408622\n' },
            { count: 1, added: false, removed: true, value: '0.839882385\n' },
            { count: 1, added: true, removed: false, value: '0.1839882385\n' },
            {
                count: 2,
                added: false,
                removed: false,
                value: '0.663059856\n0.49047221\n'
            },
            { count: 1, added: false, removed: true, value: '123\n' },
            { count: 1, added: false, removed: false, value: '0.395763265\n' },
            { count: 1, added: true, removed: false, value: '45.6\n' },
            { count: 1, added: false, removed: false, value: '0.866151835\n' }
        ],
        dfs: [
            { p: '', k: 0, vo: '-0.529408622', vn: '' },
            { p: 'modify', k: 1, vo: '0.839882385', vn: '0.1839882385' },
            { p: '', k: 2, vo: '0.663059856', vn: '' },
            { p: '', k: 3, vo: '0.49047221', vn: '' },
            { p: 'remove', k: 4, vo: '123', vn: '' },
            { p: '', k: 5, vo: '0.395763265', vn: '' },
            { p: 'add', k: 6, vo: '45.6', vn: '' },
            { p: '', k: 7, vo: '0.866151835', vn: '' }
        ]
    }
    k++
    kp[k] = {
        oin1: r1in1,
        oin2: r1in2,
        oout: r1out,
    }
    it(`sould return [case:${k}] '${JSON.stringify(kp[k].oout)}' when input '${JSON.stringify(kp[k].oin1)}', '${JSON.stringify(kp[k].oin2)}'`, function() {
        let k = 1
        let r = arrDiff(kp[k].oin1, kp[k].oin2)
        r = JSON.parse(JSON.stringify(r))
        let rr = kp[k].oout
        //ws430c(裁定表〈七〉「回傳之 diff 改以元素陣列表示;dfs 之格式不變」): 原期望diff為字串段 → 新期望為同切分之元素陣列段(oldDiffToNew); dfs原期望不變
        assert.strict.deepStrictEqual(r.dfs, rr.dfs)
        assert.strict.deepStrictEqual(r.diff, oldDiffToNew(rr.diff, 'array'))
    })

    let r2in1 = [
        [1, 0.974848293, 0.791303871, 0.716898185, 0.506002098, 0.137888903, 0.626724085],
        [2, -0.529408622, 0.839882385, 0.663059856, 0.49047221, 123, 0.395763265, 0.866151835],
        [3, -0.10320217, 0.475514539, 0.969205779, 0.711250309, 0.153847069, 0.410092395],
        [4, -0.121479865, 0.486179086, 0.481023842, 0.467410582, 0.42602231, 0.849701641],
        [5, 0.757346003, 0.697242433, 0.67532802, 0.174644416, 0.045652267, 0.397104668],
        [6, 0.663032731, 0.259252779, 0.566177431, 0.679637706, 0.377814487, 0.400248119],
        [7, 0.72721374, 0.263793391, 0.167895215, 0.794808602, 0.107070584, 0.011822872],
        [8, 0.247416664, 0.360426795, 0.014346373, 0.000469616, 0.4082693, 0.913806611],
        [9, 0.345880037, 0.167996664, 0.711054429, 0.363177921, 0.206849994, 0.636855344],
        [10, 0.576739457, 0.324665077, 0.973218005, 0.883927423, 0.176906125, 0.20087887],
        [11, 1.2],
        [12, 23.5],
        [13, 0.504421248, 0.984003751, 0.32549507, 0.987090751, 0.192745589, 0.735133561],
        [14, 0.273214614, 0.083431884, 0.565146092, 0.935388666, 0.637675154, 0.523815661],
    ]
    let r2in2 = [
        [1, 0.974848293, 0.791303871, 0.716898185, 0.506002098, 0.137888903, 0.626724085],
        [2, -0.529408622, 0.1839882385, 0.663059856, 0.49047221, 0.395763265, 45.6, 0.866151835],
        [3, -0.10320217, 0.475514539, 0.969205779, 0.711250309, 0.153847069, 0.410092395],
        [4, -0.121479865, 0.486179086, 0.481023842, 0.467410582, 0.42602231, 0.849701641],
        [5, 0.757346003, 0.697242433, 0.67532802, 0.174644416, 0.045652267, 0.397104668],
        [7, 0.72721374, 0.263793391, 0.167895215, 0.794808602, 0.107070584, 0.011822872],
        [8, 0.247416664, 0.360426795, 0.014346373, 0.000469616, 0.4082693, 0.913806611],
        [9, 0.345880037, 0.167996664, 0.711054429, 0.363173478, 0.636855344],
        [10, 0.576739457, 0.324665077, 0.973218005, 0.883927423, 0.176906125, 0.20087887],
        [13, 0.504421248, 0.984003751, 0.32549507, 0.987090751, 0.192745589, 0.735133561],
        [14, 0.273214614, 0.083431884, 0.565146092, 0.935388666, 0.637675154, 0.523815661],
        ['n1', 0.944492151, 0.89950443, 0.182709318, 0.892820757, 0.709746901, 0.097385354],
        ['n2', 0.769805921, 0.061355308, 0.314826137, 0.855857651, 0.653550539, 0.772500773],
        ['n3', 0.158739038, 0.085078711, 0.844664253, 0.21630142, 0.912931341, 0.735138313],
    ]
    let r2out = { 'diff': [{ 'count': 1, 'added': false, 'removed': false, 'value': '0∶1⟋1∶0.974848293⟋2∶0.791303871⟋3∶0.716898185⟋4∶0.506002098⟋5∶0.137888903⟋6∶0.626724085⟋\n' }, { 'count': 1, 'added': false, 'removed': true, 'value': '0∶2⟋1∶-0.529408622⟋2∶0.839882385⟋3∶0.663059856⟋4∶0.49047221⟋5∶123⟋6∶0.395763265⟋7∶0.866151835⟋\n' }, { 'count': 1, 'added': true, 'removed': false, 'value': '0∶2⟋1∶-0.529408622⟋2∶0.1839882385⟋3∶0.663059856⟋4∶0.49047221⟋5∶0.395763265⟋6∶45.6⟋7∶0.866151835⟋\n' }, { 'count': 3, 'added': false, 'removed': false, 'value': '0∶3⟋1∶-0.10320217⟋2∶0.475514539⟋3∶0.969205779⟋4∶0.711250309⟋5∶0.153847069⟋6∶0.410092395⟋\n0∶4⟋1∶-0.121479865⟋2∶0.486179086⟋3∶0.481023842⟋4∶0.467410582⟋5∶0.42602231⟋6∶0.849701641⟋\n0∶5⟋1∶0.757346003⟋2∶0.697242433⟋3∶0.67532802⟋4∶0.174644416⟋5∶0.045652267⟋6∶0.397104668⟋\n' }, { 'count': 1, 'added': false, 'removed': true, 'value': '0∶6⟋1∶0.663032731⟋2∶0.259252779⟋3∶0.566177431⟋4∶0.679637706⟋5∶0.377814487⟋6∶0.400248119⟋\n' }, { 'count': 2, 'added': false, 'removed': false, 'value': '0∶7⟋1∶0.72721374⟋2∶0.263793391⟋3∶0.167895215⟋4∶0.794808602⟋5∶0.107070584⟋6∶0.011822872⟋\n0∶8⟋1∶0.247416664⟋2∶0.360426795⟋3∶0.014346373⟋4∶0.000469616⟋5∶0.4082693⟋6∶0.913806611⟋\n' }, { 'count': 1, 'added': false, 'removed': true, 'value': '0∶9⟋1∶0.345880037⟋2∶0.167996664⟋3∶0.711054429⟋4∶0.363177921⟋5∶0.206849994⟋6∶0.636855344⟋\n' }, { 'count': 1, 'added': true, 'removed': false, 'value': '0∶9⟋1∶0.345880037⟋2∶0.167996664⟋3∶0.711054429⟋4∶0.363173478⟋5∶0.636855344⟋\n' }, { 'count': 1, 'added': false, 'removed': false, 'value': '0∶10⟋1∶0.576739457⟋2∶0.324665077⟋3∶0.973218005⟋4∶0.883927423⟋5∶0.176906125⟋6∶0.20087887⟋\n' }, { 'count': 2, 'added': false, 'removed': true, 'value': '0∶11⟋1∶1.2⟋\n0∶12⟋1∶23.5⟋\n' }, { 'count': 2, 'added': false, 'removed': false, 'value': '0∶13⟋1∶0.504421248⟋2∶0.984003751⟋3∶0.32549507⟋4∶0.987090751⟋5∶0.192745589⟋6∶0.735133561⟋\n0∶14⟋1∶0.273214614⟋2∶0.083431884⟋3∶0.565146092⟋4∶0.935388666⟋5∶0.637675154⟋6∶0.523815661⟋\n' }, { 'count': 3, 'added': true, 'removed': false, 'value': '0∶n1⟋1∶0.944492151⟋2∶0.89950443⟋3∶0.182709318⟋4∶0.892820757⟋5∶0.709746901⟋6∶0.097385354⟋\n0∶n2⟋1∶0.769805921⟋2∶0.061355308⟋3∶0.314826137⟋4∶0.855857651⟋5∶0.653550539⟋6∶0.772500773⟋\n0∶n3⟋1∶0.158739038⟋2∶0.085078711⟋3∶0.844664253⟋4∶0.21630142⟋5∶0.912931341⟋6∶0.735138313⟋\n' }], 'dfs': [[{ 'p': '', 'k': 0, 'vo': '1', 'vn': '' }, { 'p': '', 'k': 1, 'vo': '0.974848293', 'vn': '' }, { 'p': '', 'k': 2, 'vo': '0.791303871', 'vn': '' }, { 'p': '', 'k': 3, 'vo': '0.716898185', 'vn': '' }, { 'p': '', 'k': 4, 'vo': '0.506002098', 'vn': '' }, { 'p': '', 'k': 5, 'vo': '0.137888903', 'vn': '' }, { 'p': '', 'k': 6, 'vo': '0.626724085', 'vn': '' }], [{ 'p': '', 'k': 0, 'vo': '2', 'vn': '' }, { 'p': '', 'k': 1, 'vo': '-0.529408622', 'vn': '' }, { 'p': 'modify', 'k': 2, 'vo': '0.839882385', 'vn': '0.1839882385' }, { 'p': '', 'k': 3, 'vo': '0.663059856', 'vn': '' }, { 'p': '', 'k': 4, 'vo': '0.49047221', 'vn': '' }, { 'p': 'modify', 'k': 5, 'vo': '123', 'vn': '0.395763265' }, { 'p': 'modify', 'k': 6, 'vo': '0.395763265', 'vn': '45.6' }, { 'p': '', 'k': 7, 'vo': '0.866151835', 'vn': '' }], [{ 'p': '', 'k': 0, 'vo': '3', 'vn': '' }, { 'p': '', 'k': 1, 'vo': '-0.10320217', 'vn': '' }, { 'p': '', 'k': 2, 'vo': '0.475514539', 'vn': '' }, { 'p': '', 'k': 3, 'vo': '0.969205779', 'vn': '' }, { 'p': '', 'k': 4, 'vo': '0.711250309', 'vn': '' }, { 'p': '', 'k': 5, 'vo': '0.153847069', 'vn': '' }, { 'p': '', 'k': 6, 'vo': '0.410092395', 'vn': '' }], [{ 'p': '', 'k': 0, 'vo': '4', 'vn': '' }, { 'p': '', 'k': 1, 'vo': '-0.121479865', 'vn': '' }, { 'p': '', 'k': 2, 'vo': '0.486179086', 'vn': '' }, { 'p': '', 'k': 3, 'vo': '0.481023842', 'vn': '' }, { 'p': '', 'k': 4, 'vo': '0.467410582', 'vn': '' }, { 'p': '', 'k': 5, 'vo': '0.42602231', 'vn': '' }, { 'p': '', 'k': 6, 'vo': '0.849701641', 'vn': '' }], [{ 'p': '', 'k': 0, 'vo': '5', 'vn': '' }, { 'p': '', 'k': 1, 'vo': '0.757346003', 'vn': '' }, { 'p': '', 'k': 2, 'vo': '0.697242433', 'vn': '' }, { 'p': '', 'k': 3, 'vo': '0.67532802', 'vn': '' }, { 'p': '', 'k': 4, 'vo': '0.174644416', 'vn': '' }, { 'p': '', 'k': 5, 'vo': '0.045652267', 'vn': '' }, { 'p': '', 'k': 6, 'vo': '0.397104668', 'vn': '' }], [{ 'p': 'remove', 'k': 0, 'vo': '6', 'vn': '' }, { 'p': 'remove', 'k': 1, 'vo': '0.663032731', 'vn': '' }, { 'p': 'remove', 'k': 2, 'vo': '0.259252779', 'vn': '' }, { 'p': 'remove', 'k': 3, 'vo': '0.566177431', 'vn': '' }, { 'p': 'remove', 'k': 4, 'vo': '0.679637706', 'vn': '' }, { 'p': 'remove', 'k': 5, 'vo': '0.377814487', 'vn': '' }, { 'p': 'remove', 'k': 6, 'vo': '0.400248119', 'vn': '' }], [{ 'p': '', 'k': 0, 'vo': '7', 'vn': '' }, { 'p': '', 'k': 1, 'vo': '0.72721374', 'vn': '' }, { 'p': '', 'k': 2, 'vo': '0.263793391', 'vn': '' }, { 'p': '', 'k': 3, 'vo': '0.167895215', 'vn': '' }, { 'p': '', 'k': 4, 'vo': '0.794808602', 'vn': '' }, { 'p': '', 'k': 5, 'vo': '0.107070584', 'vn': '' }, { 'p': '', 'k': 6, 'vo': '0.011822872', 'vn': '' }], [{ 'p': '', 'k': 0, 'vo': '8', 'vn': '' }, { 'p': '', 'k': 1, 'vo': '0.247416664', 'vn': '' }, { 'p': '', 'k': 2, 'vo': '0.360426795', 'vn': '' }, { 'p': '', 'k': 3, 'vo': '0.014346373', 'vn': '' }, { 'p': '', 'k': 4, 'vo': '0.000469616', 'vn': '' }, { 'p': '', 'k': 5, 'vo': '0.4082693', 'vn': '' }, { 'p': '', 'k': 6, 'vo': '0.913806611', 'vn': '' }], [{ 'p': '', 'k': 0, 'vo': '9', 'vn': '' }, { 'p': '', 'k': 1, 'vo': '0.345880037', 'vn': '' }, { 'p': '', 'k': 2, 'vo': '0.167996664', 'vn': '' }, { 'p': '', 'k': 3, 'vo': '0.711054429', 'vn': '' }, { 'p': 'modify', 'k': 4, 'vo': '0.363177921', 'vn': '0.363173478' }, { 'p': 'modify', 'k': 5, 'vo': '0.206849994', 'vn': '0.636855344' }, { 'p': 'remove', 'k': 6, 'vo': '0.636855344', 'vn': '' }], [{ 'p': '', 'k': 0, 'vo': '10', 'vn': '' }, { 'p': '', 'k': 1, 'vo': '0.576739457', 'vn': '' }, { 'p': '', 'k': 2, 'vo': '0.324665077', 'vn': '' }, { 'p': '', 'k': 3, 'vo': '0.973218005', 'vn': '' }, { 'p': '', 'k': 4, 'vo': '0.883927423', 'vn': '' }, { 'p': '', 'k': 5, 'vo': '0.176906125', 'vn': '' }, { 'p': '', 'k': 6, 'vo': '0.20087887', 'vn': '' }], [{ 'p': 'remove', 'k': 0, 'vo': '11', 'vn': '' }, { 'p': 'remove', 'k': 1, 'vo': '1.2', 'vn': '' }], [{ 'p': 'remove', 'k': 0, 'vo': '12', 'vn': '' }, { 'p': 'remove', 'k': 1, 'vo': '23.5', 'vn': '' }], [{ 'p': '', 'k': 0, 'vo': '13', 'vn': '' }, { 'p': '', 'k': 1, 'vo': '0.504421248', 'vn': '' }, { 'p': '', 'k': 2, 'vo': '0.984003751', 'vn': '' }, { 'p': '', 'k': 3, 'vo': '0.32549507', 'vn': '' }, { 'p': '', 'k': 4, 'vo': '0.987090751', 'vn': '' }, { 'p': '', 'k': 5, 'vo': '0.192745589', 'vn': '' }, { 'p': '', 'k': 6, 'vo': '0.735133561', 'vn': '' }], [{ 'p': '', 'k': 0, 'vo': '14', 'vn': '' }, { 'p': '', 'k': 1, 'vo': '0.273214614', 'vn': '' }, { 'p': '', 'k': 2, 'vo': '0.083431884', 'vn': '' }, { 'p': '', 'k': 3, 'vo': '0.565146092', 'vn': '' }, { 'p': '', 'k': 4, 'vo': '0.935388666', 'vn': '' }, { 'p': '', 'k': 5, 'vo': '0.637675154', 'vn': '' }, { 'p': '', 'k': 6, 'vo': '0.523815661', 'vn': '' }], [{ 'p': 'add', 'k': 0, 'vo': 'n1', 'vn': '' }, { 'p': 'add', 'k': 1, 'vo': '0.944492151', 'vn': '' }, { 'p': 'add', 'k': 2, 'vo': '0.89950443', 'vn': '' }, { 'p': 'add', 'k': 3, 'vo': '0.182709318', 'vn': '' }, { 'p': 'add', 'k': 4, 'vo': '0.892820757', 'vn': '' }, { 'p': 'add', 'k': 5, 'vo': '0.709746901', 'vn': '' }, { 'p': 'add', 'k': 6, 'vo': '0.097385354', 'vn': '' }], [{ 'p': 'add', 'k': 0, 'vo': 'n2', 'vn': '' }, { 'p': 'add', 'k': 1, 'vo': '0.769805921', 'vn': '' }, { 'p': 'add', 'k': 2, 'vo': '0.061355308', 'vn': '' }, { 'p': 'add', 'k': 3, 'vo': '0.314826137', 'vn': '' }, { 'p': 'add', 'k': 4, 'vo': '0.855857651', 'vn': '' }, { 'p': 'add', 'k': 5, 'vo': '0.653550539', 'vn': '' }, { 'p': 'add', 'k': 6, 'vo': '0.772500773', 'vn': '' }], [{ 'p': 'add', 'k': 0, 'vo': 'n3', 'vn': '' }, { 'p': 'add', 'k': 1, 'vo': '0.158739038', 'vn': '' }, { 'p': 'add', 'k': 2, 'vo': '0.085078711', 'vn': '' }, { 'p': 'add', 'k': 3, 'vo': '0.844664253', 'vn': '' }, { 'p': 'add', 'k': 4, 'vo': '0.21630142', 'vn': '' }, { 'p': 'add', 'k': 5, 'vo': '0.912931341', 'vn': '' }, { 'p': 'add', 'k': 6, 'vo': '0.735138313', 'vn': '' }]] }

    k++
    kp[k] = {
        oin1: r2in1,
        oin2: r2in2,
        oout: r2out,
    }
    it(`sould return [case:${k}] '${JSON.stringify(kp[k].oout)}' when input '${JSON.stringify(kp[k].oin1)}', '${JSON.stringify(kp[k].oin2)}', { mode: 'matrix' }`, function() {
        let k = 2
        let r = arrDiff(kp[k].oin1, kp[k].oin2, { mode: 'matrix' })
        r = JSON.parse(JSON.stringify(r))
        let rr = kp[k].oout
        //ws430c(裁定表〈七〉): 同case:1, dfs不變、diff改為元素陣列段
        assert.strict.deepStrictEqual(r.dfs, rr.dfs)
        assert.strict.deepStrictEqual(r.diff, oldDiffToNew(rr.diff, 'matrix'))
    })

    //ws286c: arrOld與arrNew為必須參數(使用者2026-11-03逐列確認: 差異比對子類), 非陣列throw Error, 訊息固定不帶值, 依arrOld、arrNew序檢測; []為合法輸入
    //ws492h(第492項第7批, 使用者2026-11-16「W-16:乙」): arrOld為第1參數, 非陣列一律回與正常輸出同形之空結果{ diff: [], dfs: [] }, 不拋錯(且不檢查arrNew與opt); arrNew為次參數, 非陣列仍throw
    //  對應規格: dspec〈輸入參數之檢測機制〉§11「C7結構運算之第1參數(使用者2026-11-16 W-16:乙)」
    const EMPTY_RESULT = { diff: [], dfs: [] }
    const MSG_NEW = 'invalid arrNew: must be an array'
    //ws290: mode為matrix時元素非陣列之訊息改為合乎輸入參數規格之「invalid <參數名>: …」格式(修前為'arrOld is not a matrix'/'arrNew is not a matrix')
    //ws492j V19: 訊息帶第一個非陣列元素之實際索引i(原'invalid arrOld: every element must be an array when opt.mode is 'matrix'')
    const MSG_MAT_OLD = (i) => `invalid arrOld[${i}]: must be an array when opt.mode is 'matrix'`
    const MSG_MAT_NEW = (i) => `invalid arrNew[${i}]: must be an array when opt.mode is 'matrix'`

    for (let [label, v] of NON_ARR) {
        it(`should return ${JSON.stringify(EMPTY_RESULT)} (no throw) when arrOld is not an array: ${label} (arrNew valid, [] or invalid too; any mode)`, function() {
            for (let opt of [undefined, { mode: 'array' }, { mode: 'matrix' }]) {
                assert.strict.deepStrictEqual(arrDiff(v, ['a'], opt), EMPTY_RESULT)
                assert.strict.deepStrictEqual(arrDiff(v, [], opt), EMPTY_RESULT)
                assert.strict.deepStrictEqual(arrDiff(v, v, opt), EMPTY_RESULT)
            }
        })

        it(`should throw '${MSG_NEW}' when arrNew is not an array: ${label} (arrOld valid or []; any mode)`, function() {
            for (let opt of [undefined, { mode: 'array' }, { mode: 'matrix' }]) {
                throwsMsg(() => arrDiff(['a'], v, opt), MSG_NEW)
                throwsMsg(() => arrDiff([], v, opt), MSG_NEW)
            }
        })
    }

    it(`should return the empty result when arrOld is not given, and throw when arrNew is not given while arrOld is an array`, function() {
        assert.strict.deepStrictEqual(arrDiff(), EMPTY_RESULT)
        throwsMsg(() => arrDiff(['a']), MSG_NEW)
        throwsMsg(() => arrDiff([]), MSG_NEW)
        assert.strict.deepStrictEqual(arrDiff(undefined, ['a']), EMPTY_RESULT)
    })

    it(`should throw the fixed message without the input value when arrNew is invalid, and not throw when arrOld is invalid`, function() {
        for (let v of [LEAK, { secret: LEAK }, Symbol(LEAK), () => LEAK, 7391.4217, new Map([[LEAK, LEAK]])]) {
            assert.strict.deepStrictEqual(arrDiff(v, ['a']), EMPTY_RESULT)
            throwsMsgNoLeak(() => arrDiff(['a'], v), MSG_NEW)
        }
    })

    //兩邊皆為[]: 回傳與正常輸出同形之空結果, 不是{}
    it(`should return { diff: [], dfs: [] } when both arrOld and arrNew are [] (mode array, matrix and default)`, function() {
        for (let opt of [undefined, null, {}, { mode: 'array' }, { mode: 'matrix' }, { mode: 'x' }, 'x', 123, []]) {
            let r = arrDiff([], [], opt)
            assert.strict.deepStrictEqual(r, { diff: [], dfs: [] })
            assert.strict.deepStrictEqual(Object.keys(r), ['diff', 'dfs'])
        }
        assert.strict.deepStrictEqual(Object.keys(arrDiff([], [])), Object.keys(arrDiff(['a'], ['b'])))
        assert.strict.deepStrictEqual(Object.keys(arrDiff([], [], { mode: 'matrix' })), Object.keys(arrDiff([['a']], [['b']], { mode: 'matrix' })))
    })

    it(`should return a fresh object for each call when both are [] (callers may mutate the result)`, function() {
        let r1 = arrDiff([], [])
        r1.dfs.push('x')
        r1.diff.push('y')
        let r2 = arrDiff([], [])
        assert.strict.deepStrictEqual(r2, { diff: [], dfs: [] })
        assert.ok(r1 !== r2)
    })

    //只有一邊為空, 或兩邊各有一個空元素, 都不是[兩邊皆空], 照常回傳差異結果(取自修前HEAD之實測)
    //ws430c(裁定表〈七〉「回傳之 diff 改以元素陣列表示」): 原期望diff之value為'a\n'、'0∶1⟋1∶2⟋\n' → 新期望為['a']、[['1', '2']]; dfs不變
    it(`should return the normal diff when only one side is []`, function() {
        assert.strict.deepStrictEqual(
            arrDiff([], ['a']),
            { diff: [{ count: 1, added: true, removed: false, value: ['a'] }], dfs: [{ p: 'add', k: 0, vo: 'a', vn: '' }] }
        )
        assert.strict.deepStrictEqual(
            arrDiff(['a'], []),
            { diff: [{ count: 1, added: false, removed: true, value: ['a'] }], dfs: [{ p: 'remove', k: 0, vo: 'a', vn: '' }] }
        )
        assert.strict.deepStrictEqual(
            arrDiff([[1, 2]], [], { mode: 'matrix' }),
            {
                diff: [{ count: 1, added: false, removed: true, value: [['1', '2']] }],
                dfs: [[{ p: 'remove', k: 0, vo: '1', vn: '' }, { p: 'remove', k: 1, vo: '2', vn: '' }]],
            }
        )
    })

    //[''] 對 [''] 與 [[]] 對 [[]] 不會走到兩邊皆空; ws430c(〈七〉): diff之value由'\n'改為['']、[[]], dfs與修前相同
    it(`should keep the same dfs as before for [''] vs [''] (array mode) and [[]] vs [[]] (matrix mode)`, function() {
        assert.strict.deepStrictEqual(
            arrDiff([''], ['']),
            { diff: [{ count: 1, added: false, removed: false, value: [''] }], dfs: [{ p: '', k: 0, vo: '', vn: '' }] }
        )
        assert.strict.deepStrictEqual(
            arrDiff([[]], [[]], { mode: 'matrix' }),
            { diff: [{ count: 1, added: false, removed: false, value: [[]] }], dfs: [[]] }
        )
    })

    //ws430c(裁定表〈七〉「值內含換行、⟋、∶ 時之錯位與截斷一併消除」): 原期望鎖定修前之錯位(同列拆成兩行、dfs為[[], [{…vo:''}]]) → 新期望為一列一格之modify
    it(`should compare a cell containing a newline as one cell in matrix mode (no misalignment, ws430c 〈七〉)`, function() {
        assert.strict.deepStrictEqual(
            arrDiff([['a\nz']], [['b\nz']], { mode: 'matrix' }),
            {
                diff: [
                    { count: 1, added: false, removed: true, value: [['a\nz']] },
                    { count: 1, added: true, removed: false, value: [['b\nz']] },
                ],
                dfs: [[{ p: 'modify', k: 0, vo: 'a\nz', vn: 'b\nz' }]],
            }
        )
    })

    //mode為matrix時各元素須為陣列: 仍throw(訊息依ws290改為invalid格式), 且不輸出輸入資料至console
    it(`should throw '${MSG_MAT_OLD('i')}' when mode is matrix and an element of arrOld is not an array, without writing to console`, function() {
        for (let [, v] of NON_ARR) {
            throwsMsg(() => arrDiff([v], [[1]], { mode: 'matrix' }), MSG_MAT_OLD(0))
            throwsMsg(() => arrDiff([[1], v], [[1]], { mode: 'matrix' }), MSG_MAT_OLD(1))
        }
    })

    it(`should throw '${MSG_MAT_NEW('i')}' when mode is matrix and an element of arrNew is not an array, without writing to console`, function() {
        for (let [, v] of NON_ARR) {
            throwsMsg(() => arrDiff([[1]], [v], { mode: 'matrix' }), MSG_MAT_NEW(0))
            throwsMsg(() => arrDiff([], [[1], v], { mode: 'matrix' }), MSG_MAT_NEW(1))
        }
    })

    it(`should throw '${MSG_MAT_OLD(0)}' for arrDiff([1], [2], { mode: 'matrix' }) with 0 console calls and without the input value in the message`, function() {
        throwsMsg(() => arrDiff([1], [2], { mode: 'matrix' }), MSG_MAT_OLD(0))
        throwsMsgNoLeak(() => arrDiff([LEAK], [[1]], { mode: 'matrix' }), MSG_MAT_OLD(0))
        throwsMsgNoLeak(() => arrDiff([[1]], [LEAK], { mode: 'matrix' }), MSG_MAT_NEW(0))
        throwsMsgNoLeak(() => arrDiff([{ secret: LEAK }], [[1]], { mode: 'matrix' }), MSG_MAT_OLD(0))
    })

    //ws290: 訊息須為「invalid <參數名>: …」格式(參數名為arrDiff自身之參數arrOld/arrNew), 不再使用舊字樣'is not a matrix'; 檢測序為arrOld整側先於arrNew整側; ws492j V19: 帶第一個非陣列元素之實際索引
    it(`should throw the 'invalid <name>[i]: ...' format (not 'is not a matrix') and check arrOld before arrNew when mode is matrix`, function() {
        let e1 = throwsMsg(() => arrDiff([1], [[1]], { mode: 'matrix' }), MSG_MAT_OLD(0))
        assert.ok(/^invalid arrOld\[0\]: /.test(e1.message) && !e1.message.includes('is not a matrix'), e1.message)
        let e2 = throwsMsg(() => arrDiff([[1]], [1], { mode: 'matrix' }), MSG_MAT_NEW(0))
        assert.ok(/^invalid arrNew\[0\]: /.test(e2.message) && !e2.message.includes('is not a matrix'), e2.message)
        throwsMsg(() => arrDiff([1], [2], { mode: 'matrix' }), MSG_MAT_OLD(0)) //兩側皆無效: arrOld先
        throwsMsg(() => arrDiff([[1], 2], [3], { mode: 'matrix' }), MSG_MAT_OLD(1)) //arrOld中段無效亦先於arrNew
        throwsMsg(() => arrDiff([,], [[1]], { mode: 'matrix' }), MSG_MAT_OLD(0)) // eslint-disable-line no-sparse-arrays
    })

    //mode為array時元素不受限(依舊轉字串比對)
    it(`should not require array elements in array mode`, function() {
        let r = arrDiff([1, 2], [1, 3], { mode: 'array' })
        assert.strict.deepStrictEqual(r.dfs, [{ p: '', k: 0, vo: '1', vn: '' }, { p: 'modify', k: 1, vo: '2', vn: '3' }])
    })

    //opt內無效的鍵維持現行(改用預設)
    it(`should use the default mode when opt or opt.mode is invalid`, function() {
        let rr = arrDiff([1, 2], [1, 3], { mode: 'array' })
        for (let opt of [undefined, null, 0, 'x', [], true, {}, { mode: 'x' }, { mode: null }, { mode: 1 }, { other: false }]) {
            assert.strict.deepStrictEqual(arrDiff([1, 2], [1, 3], opt), rr)
        }
    })

})
