import assert from 'assert'
import { HUGE_COUNT, HUGE_VEND, runIntInputHangG6 } from './tools/intInputHangG6Runner.mjs'


//長度、個數、範圍上限為Infinity（或超大值）使程式不終止或耗盡記憶體之防護（排程第221項第二批第2輪, ws272b; 規格: dspec〈輸入參數之檢測機制〉§7.1 opt類、K3、§11 Infinity一律非預期、改用預設）
//  每案於獨立子行程加逾時（12秒）與記憶體上限（256MB）執行: 修前原碼於此為逾時或記憶體不足（無結果行, 紅燈）, 修後須立即完成
//  失敗通道: genID len、rang num為opt類參數, 非預期改用預設不報錯（genID len預設32、rang num預設2）; randomIntsNdpRange與pseudoRandomIntsNdpRange之vend自ws426起為範圍參數, 有給而無效即throw（使用者2026-11-12, dspec §11 Q1-b; 原改用預設100）


describe('length/count/range Infinity input hang guards (child process)', function() {

    this.timeout(60000)

    it(`genID-huge: len ${HUGE_COUNT.length} huge/invalid values should all use the default length 32 instead of looping nearly forever`, function() {
        assert.strict.deepStrictEqual(runIntInputHangG6('genID-huge'), { lens: HUGE_COUNT.map(() => 32) })
    })

    it(`rang-num-huge: num ${HUGE_COUNT.length} huge/invalid values should all use the default 2 instead of looping nearly forever`, function() {
        assert.strict.deepStrictEqual(runIntInputHangG6('rang-num-huge'), { rs: HUGE_COUNT.map(() => [0, 5, 10]) })
    })

    it(`rang-overflow-huge-num (ws272c): an overflowing interval with num 4294967295 should return [] at once instead of pushing billions of Infinity until out of memory`, function() {
        assert.strict.deepStrictEqual(runIntInputHangG6('rang-overflow-huge-num'), { rs: [[], [], []] })
    })

    it(`randomIntsNdpRange-vend-huge: vend ${HUGE_VEND.length} huge/invalid values should all throw 'invalid vend: must be an integer' at once instead of building a huge range (ws426: formerly the default 100 was used)`, function() {
        // dspec §11 Q1-b(使用者2026-11-12): 隨機範圍無效即同步拋錯; 子行程須立即完成(不建立巨大範圍)
        let out = runIntInputHangG6('randomIntsNdpRange-vend-huge')
        assert.strict.deepStrictEqual(out.msgs, HUGE_VEND.map(() => 'invalid vend: must be an integer'))
    })

    it(`repObj-n-over-max: n 4294967296 (count max + 1) should throw the fixed message instead of allocating a huge array until out of memory`, function() {
        assert.strict.deepStrictEqual(runIntInputHangG6('repObj-n-over-max'), { out: ['invalid n: must be a non-negative integer', 'invalid n: must be a non-negative integer'] })
    })

    it(`bufWrite-mLen-nBytes-huge: mLen/nBytes ${HUGE_COUNT.length} huge/invalid values should all return null and write nothing instead of looping nearly forever`, function() {
        let out = runIntInputHangG6('bufWrite-mLen-nBytes-huge')
        assert.strict.deepStrictEqual(out, { out: HUGE_COUNT.map(() => [null, null, true, true]) })
    })

    it(`pseudoRandomIntsNdpRange-vend-huge: vend ${HUGE_VEND.length} huge/invalid values should all throw 'invalid vend: must be an integer' at once instead of looping nearly forever (ws426: formerly the default 100 was used)`, function() {
        // dspec §11 Q1-b(使用者2026-11-12): 隨機範圍無效即同步拋錯; 子行程須立即完成(不近乎無限迴圈)
        let out = runIntInputHangG6('pseudoRandomIntsNdpRange-vend-huge')
        assert.strict.deepStrictEqual(out.msgs, HUGE_VEND.map(() => 'invalid vend: must be an integer'))
    })

})
