import assert from 'assert'
//import importResources from '../src/importResources.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


describe(`importResources`, function() {

    it(`need test in browser`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

})


describe(`importResources settle(R-PM-SETTLE-01)`, function() {

    it(`importResources: pathItem.func拋錯時reject該錯誤, 不懸置且無未處理之rejection [規則1、2]`, function() {
        let { r } = runPmSettle('importResourcesFuncThrows')
        assert.strict.deepStrictEqual(r.out, { s: 'reject', msg: 'func boom' })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

    it(`importResources: 載入中之後到者與首位同成敗, 失敗後之呼叫可重新載入 [規則1、5]`, function() {
        let { r } = runPmSettle('importResourcesConcurrent')
        //retry之funcCalls為2: 失敗後之呼叫確實重新載入(再次呼叫func), 而非直接回'loaded'
        assert.strict.deepStrictEqual(r.out, { first: { s: 'reject', msg: 'func boom 1' }, concurrent: { s: 'reject', msg: 'func boom 1' }, retry: { s: 'resolve', funcCalls: 2 } })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

    it(`importResources: 不同組共用同一路徑時, 該路徑載入中之後到者亦與首位同成敗 [規則1、5]`, function() {
        let { r } = runPmSettle('importResourcesSharedPath')
        assert.strict.deepStrictEqual(r.out, { first: { s: 'reject', msg: 'func boom c' }, otherGroup: { s: 'reject', msg: 'func boom c' } })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

})


describe(`importResources 輸入檢測(ws492g W-15 C13: pathItems依宣告種類檢測, 不改寫呼叫端輸入)`, function() {

    let r = null
    before(function() {
        r = runPmSettle('importResourcesInvalid').r
    })

    it(`pathItems無效(27種)以固定字串reject(不同步拋錯、不回顯值), 且先於任何載入(head新增0個)`, function() {
        //dspec §11 W-15/盤點報告 C13「必須參數無效應有明確通道(C13 reject)而非原生錯誤; 'invalid pathItem.type: <值>'回顯輸入之type(K9); path未檢測為非空字串(S4)」
        //V19格式與V20(不回顯值); 通道依§5.1「回傳Promise者reject不同步throw」; 檢測先於任何載入(V17無殘留): 無效項目之前之有效項目(如['a1.css', 5]之'a1.css')亦不載入
        //ws492g2 第5點: type無效依S3『one of <值>』(dspec §6 V19: 'invalid pathItems[i].type: must be one of 'js', 'css'')、無type而副檔名不符之path訊息為『must be a path ending with '.js' or '.css' when type is not given』
        //ws492g2 第6點: type只有未給/null/空字串視為未給, 其餘非'js'/'css'之值(含false、0、NaN)皆無效
        let eRoot = 'invalid pathItems: must be a non-empty string, an object or an array of them'
        let eElem = (i) => `invalid pathItems[${i}]: must be a non-empty string or an object`
        let ePath = (nm) => `invalid ${nm}.path: must be a non-empty string`
        let eType = (nm) => `invalid ${nm}.type: must be one of 'js', 'css'`
        let rj = (v) => ({ s: 'reject', v, headAdded: 0 })
        assert.strict.deepStrictEqual(r.out.invalid, {
            undefined: rj(eRoot),
            null: rj(eRoot),
            num: rj(eRoot),
            bool: rj(eRoot),
            emptyStr: rj(eRoot),
            fn: rj(eRoot),
            revokedObj: rj(eRoot),
            objNoPath: rj(ePath('pathItems')),
            objPathNum: rj(ePath('pathItems')),
            objPathEmpty: rj(ePath('pathItems')),
            classInstance: rj(eRoot),
            pathGetter: rj(eRoot),
            arrNull: rj(eElem(0)),
            arrNum: rj(eElem(1)),
            arrEmptyStr: rj(eElem(1)),
            arrNested: rj(eElem(0)),
            arrMidPathNum: rj(ePath('pathItems[1]')),
            arrBadType: rj(eType('pathItems[0]')),
            arrTypeNum: rj(eType('pathItems[0]')),
            arrTypeSecret: rj(eType('pathItems[0]')),
            arrTypeCase: rj(eType('pathItems[0]')),
            arrTypeFalse: rj(eType('pathItems[0]')),
            arrTypeZero: rj(eType('pathItems[0]')),
            arrTypeNaN: rj(eType('pathItems[0]')),
            arrNoExt: rj(`invalid pathItems[1].path: must be a path ending with '.js' or '.css' when type is not given`),
            arrHole: rj(eElem(1)),
            arrElemGetter: rj(eElem(0)),
        })
        //訊息不回顯輸入值(V20): 型別字串'secretTypeXYZ'與各路徑皆不出現; 全程不console.log(原對無效type以console.log輸出回顯之字串)
        assert.strict.deepStrictEqual(JSON.stringify(r.out.invalid).includes('secretTypeXYZ'), false)
        assert.strict.deepStrictEqual(r.out.logs, [])
    })

    it(`無效之呼叫不登記載入狀態: 同一路徑之其後有效呼叫照常載入 [V17無殘留]`, function() {
        //['u1.css', 5]無效 → head新增0個; 其後['u1.css']仍載入(新增1個), 證明無效之呼叫未把'u1.css'標記為載入中或完成
        assert.strict.deepStrictEqual(r.out.afterInvalid, {
            r: { s: 'reject', v: 'invalid pathItems[1]: must be a non-empty string or an object' },
            nAfterBad: 0,
            rU: { s: 'resolve', n: 1 },
            nAfterGood: 1,
        })
    })

    it(`有效輸入(字串、物件、陣列、凍結之輸入、type為null或空字串、func非函數、空陣列)照常載入, 且不改寫呼叫端傳入之陣列與物件`, function() {
        //盤點報告 C13「就地改寫呼叫端輸入(實測['abc']呼叫後變[{path:'abc',type:'unknow'}])」; V9「不改寫呼叫端之opt」之同義: 內部以副本處理
        //凍結之陣列與物件(嚴格模式下改寫即拋TypeError)亦可載入, 3個項目各新增1個head子元素
        assert.strict.deepStrictEqual(r.out.valid.frozen, { r: { s: 'resolve', n: 3 }, added: 3, unchanged: true })
        //未凍結之輸入: 呼叫後內容不變(含第1項仍為字串, 未被改成{ path, type })
        assert.strict.deepStrictEqual(r.out.valid.loose, { r: { s: 'resolve', n: 4 }, unchanged: true, firstStillString: true })
        assert.strict.deepStrictEqual({ s: r.out.valid.singleStr, o: r.out.valid.singleObj, e: r.out.valid.emptyArr }, { s: { s: 'resolve', n: 1 }, o: { s: 'resolve', n: 1 }, e: { s: 'resolve', n: 0 } })
        //副檔名.js推斷為script(func非函數視為未給, 不等待)
        assert.strict.deepStrictEqual(r.out.valid.js, { r: { s: 'resolve', n: 1 }, tag: 'script' })
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})


describe(`importResources 進入後才被撤銷之func(ws492g2 第2點: 載入事件內之判定改isFunSafe, 視為未給K3)`, function() {

    it(`func通過入口檢測、呼叫後即撤銷(函數Proxy): 載入事件內視為未給, 該資源照常完成(不懸置、無未捕捉例外), _paths不卡在載入中 [W-15 K3]`, function() {
        //dspec §4 K3「回呼型選填值無效視為未給」; ws492g2 第2點「進入後才被撤銷者視為未給(K3), 該資源照常完成, 不得使Promise懸置或_paths卡在載入中」
        //修前: load事件內isfun(已撤銷之函數Proxy)拋TypeError(於事件回呼內外拋)→ Promise永不settle、_paths['rv1.js']停在載入中、其後同路徑之呼叫亦懸置、產生未捕捉例外
        let { r } = runPmSettle('importResourcesRevokedFunc')
        assert.strict.deepStrictEqual(r.out, {
            r1: { s: 'resolve', n: 1 },
            nAdded: 1,
            r2: { s: 'resolve', v: 'loaded' }, //同路徑之其後呼叫立即回'loaded': _paths已為done, 未卡在載入中
            nAfter: 1, //未再載入
        })
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})


describe(`importResources 明示type優先於副檔名(ws492g2 第7點②)`, function() {

    it(`明示type優先於副檔名({ path: 'x.js', type: 'css' }載入為link, { path: 'x.css', type: 'js' }載入為script); 未給/null/空字串依副檔名推斷(.css為link、.js為script); 明示type時不限副檔名`, function() {
        //JSDoc importResources「明示之type優先於副檔名; 只有未給、null、空字串視為未給而依副檔名推斷」; ws492g2 第6點之正向面(type給了且有效即採用)
        let { r } = runPmSettle('importResourcesTypePrecedence')
        let one = (tag) => ({ r: { s: 'resolve', n: 1 }, added: 1, tag })
        assert.strict.deepStrictEqual(r.out, {
            jsAsCss: one('link'), //.js而type為css: 以type為準
            cssAsJs: one('script'), //.css而type為js: 以type為準
            cssInfer: one('link'), //未給type: .css推斷為link
            jsInfer: one('script'), //未給type: .js推斷為script
            pngAsCss: one('link'), //明示type時副檔名不限
            jsTypeNull: one('script'), //type為null視為未給, 依副檔名推斷
            cssTypeEmpty: one('link'), //type為空字串視為未給, 依副檔名推斷
            strCss: one('link'), //字串項目依副檔名推斷
        })
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})
