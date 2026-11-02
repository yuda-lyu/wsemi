import assert from 'assert'
import { runIntInputHangG5 } from './tools/intInputHangG5Runner.mjs'


//計時毫秒、個數、防抖時間為Infinity（或超過計時器上限）使程式不終止或等24.8天之防護（排程第221項第二批第2輪, ws272a; 規格: dspec〈輸入參數之檢測機制〉§7.1 opt類與必須參數、K3、§11 Infinity一律非預期、改用預設）
//  每案於獨立子行程加逾時執行（12秒）: 修前原碼於此為逾時（無結果行, 紅燈）, 修後須於預設時間內完成
//  失敗通道維持各函數現行者: pmTimeout為必須參數, 非預期reject固定訊息'invalid ms: must be an integer within 0 to 2147483647'(不帶值, ws272b起); 其餘為opt類, 非預期改用預設不報錯


describe('timer/flow Infinity input hang guards (child process)', function() {

    this.timeout(60000)

    describe('delay (default 10ms)', function() {
        for (let name of ['delay-inf', 'delay-1e10']) {
            it(`${name} should finish quickly instead of waiting about 24.8 days`, function() {
                assert.strict.deepStrictEqual(runIntInputHangG5(name), { done: true, fast: true })
            })
        }
    })

    describe('waitFun (attemptNum default 200, timeInterval default 1000)', function() {

        it('waitFun-attempt-inf should reject exceeded attemptNum[200] instead of polling forever', function() {
            assert.strict.deepStrictEqual(runIntInputHangG5('waitFun-attempt-inf'), { msg: 'exceeded attemptNum[200]' })
        })

        it('waitFun-interval-2p40 should poll with the default 1000ms instead of the clamped 24.8 days', function() {
            assert.strict.deepStrictEqual(runIntInputHangG5('waitFun-interval-2p40'), { msg: 'exceeded attemptNum[1]', fast: true })
        })

    })

    describe('debounce, pmDebounce (ms default 300)', function() {
        it('debounce-ms-inf should run the task instead of never triggering', function() {
            assert.strict.deepStrictEqual(runIntInputHangG5('debounce-ms-inf'), { ran: true })
        })
        it('pmDebounce-ms-inf should run the task instead of never triggering', function() {
            assert.strict.deepStrictEqual(runIntInputHangG5('pmDebounce-ms-inf'), { ran: true })
        })
    })

    describe('evEmitDelay (ms default 1)', function() {
        it('evEmitDelay-ms-inf should call the listener instead of waiting about 24.8 days', function() {
            assert.strict.deepStrictEqual(runIntInputHangG5('evEmitDelay-ms-inf'), { got: true })
        })
    })

    describe('pmTimeout (required ms)', function() {
        it('pmTimeout-inf should reject the fixed invalid ms message at once instead of waiting about 24.8 days for a never-settling pm', function() {
            assert.strict.deepStrictEqual(runIntInputHangG5('pmTimeout-inf'), { msg: 'invalid ms: must be an integer within 0 to 2147483647' })
        })
    })

    describe('alive, cacheSt (timeDetect defaults 50 / 2000)', function() {
        it('alive-detect-inf should detect the leave with the default 50ms instead of never', function() {
            assert.strict.deepStrictEqual(runIntInputHangG5('alive-detect-inf'), { leave: 'k' })
        })
        it('cacheSt-detect-inf should expire the key with the default 2000ms detect period instead of never', function() {
            assert.strict.deepStrictEqual(runIntInputHangG5('cacheSt-detect-inf'), { got: 'k' })
        })
    })

    describe('cacheBd (nMax default 200)', function() {
        it('cacheBd-nMax-inf should reject exceeded nMax[200] after 200 polls instead of polling forever', function() {
            let out = runIntInputHangG5('cacheBd-nMax-inf')
            assert.strict.deepStrictEqual(out.msg, 'exceeded nMax[200]')
        })
    })

    describe('fsDeleteFileSafeCore, fsDeleteFolderSafeCore (numRetry default 5)', function() {
        it('fsDeleteFile-numRetry-inf should give up after 5 attempts instead of retrying forever', function() {
            assert.strict.deepStrictEqual(runIntInputHangG5('fsDeleteFile-numRetry-inf'), { r: 'rejected', calls: 5 })
        })
        it('fsDeleteFolder-numRetry-inf should give up after 5 attempts instead of retrying forever', function() {
            assert.strict.deepStrictEqual(runIntInputHangG5('fsDeleteFolder-numRetry-inf'), { r: 'rejected', calls: 5 })
        })
    })

    describe('fsWatchFolder (timeInterval default 100)', function() {
        it('fsWatchFolder-interval-inf should create the watcher with the default 100ms poll instead of never', function() {
            assert.strict.deepStrictEqual(runIntInputHangG5('fsWatchFolder-interval-inf'), { got: true })
        })
    })

})
