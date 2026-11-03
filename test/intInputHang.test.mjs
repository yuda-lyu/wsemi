import assert from 'assert'
import { runIntInputHang } from './tools/intInputHangRunner.mjs'


//整數輸入使迴圈不終止之防護(排程第221項第二批已知缺陷先修, ws270; 規格: dspec〈輸入參數之檢測機制〉§3.1 iseint、§7.1必須參數與opt類、K2、K3、§11 Infinity一律非預期)
//  每案於獨立子行程(堆積上限64mb)加逾時執行: 修前原碼對Infinity、超過個數上限、0、負數之輸入迴圈不終止(或無限配置), 於此為逾時或崩潰之紅燈, 修後須立即回傳
//  失敗通道: sepInt無效throw(ws286b起, 原回[]); arrSep整數寫法無效throw(ws286e起, 原回[])、設定物件之numCount與numGroup皆無效throw; 雜湊函數之chunkSize為opt類, 非預期改用預設不報錯


const MSG_INVALID_OPT = 'invalid opt.numCount or opt.numGroup'
const MSG_INVALID_NUM = 'invalid opt: must be a positive integer or an object with numCount or numGroup'
const MSG_SEPINT_N = 'invalid n: must be a positive integer'

//內文'xyz'之雜湊(JSDoc範例值), 預設切片與非預期chunkSize皆須得此值
const H_SHA256 = '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
const H_XXH64 = 'feba48465b833ca1'


describe('integer input hang guards (child process)', function() {

    this.timeout(60000)

    describe('sepInt', function() {

        // 規格§7.1必須參數n(切分數量)非預期 → throw(ws286b起, 使用者2026-11-02逐列確認; 原回[]); 修前Infinity與超過上限之n使迴圈不終止
        for (let name of ['sepInt-n-inf', 'sepInt-n-neginf', 'sepInt-n-str-inf', 'sepInt-n-2p32', 'sepInt-n-maxsafe', 'sepInt-n-1e21', 'sepInt-n-str-1e21']) {
            it(`${name} should throw ${MSG_SEPINT_N} without hanging`, function() {
                let out = runIntInputHang(name)
                assert.strict.deepStrictEqual(out, { throwMsg: MSG_SEPINT_N })
            })
        }

    })

    describe('arrSep', function() {

        // 規格§7.1必須參數: 整數寫法之Infinity、超過上限 → throw(ws286e起, 使用者2026-11-03逐列確認; 原回[])
        for (let name of ['arrSep-num-inf', 'arrSep-num-str-inf', 'arrSep-num-2p32']) {
            it(`${name} should throw ${MSG_INVALID_NUM} without hanging`, function() {
                let out = runIntInputHang(name)
                assert.strict.deepStrictEqual(out, { throwMsg: MSG_INVALID_NUM })
            })
        }

        // 設定物件之numCount或numGroup無效且另一鍵未給 → 維持現行throw
        for (let name of ['arrSep-numCount-inf', 'arrSep-numCount-2p32', 'arrSep-numCount-maxsafe', 'arrSep-numGroup-inf', 'arrSep-numGroup-maxsafe', 'arrSep-numGroup-2p32']) {
            it(`${name} should throw ${MSG_INVALID_OPT} without hanging`, function() {
                let out = runIntInputHang(name)
                assert.strict.deepStrictEqual(out, { throwMsg: MSG_INVALID_OPT })
            })
        }

        it('arrSep-numCount-inf-numGroup-3 should ignore the invalid numCount and use numGroup', function() {
            let out = runIntInputHang('arrSep-numCount-inf-numGroup-3')
            assert.strict.deepStrictEqual(out, { ret: [[1, 4, 7], [2, 5, 8], [3, 6]] })
        })

    })

    describe('bufRead', function() {

        // 規格§7.1必須參數nBytes、mLen非預期(Infinity、超過個數上限) → 維持現行失敗通道null; 修前位元組迴圈不終止
        for (let name of ['bufRead-nBytes-inf', 'bufRead-mLen-inf', 'bufRead-nBytes-maxsafe', 'bufRead-mLen-maxsafe', 'bufRead-nBytes-2p32m1', 'bufRead-nBytes-str-inf', 'bufRead-mLen-str-inf']) {
            it(`${name} should return null without hanging`, function() {
                let out = runIntInputHang(name)
                assert.strict.deepStrictEqual(out, { ret: null })
            })
        }

    })

    describe('getFileBasicHash, getFileXxHash, getFileHash (opt.chunkSize 0 or negative)', function() {

        // 規格§7.1 opt類 + K3: chunkSize非預期(0、負數、數字字串0)改用預設(64mb), 雜湊值與預設相同; 修前切片不前進, 迴圈不終止
        let list = [
            ['bfh-chunk-0', H_SHA256],
            ['bfh-chunk-neg1', H_SHA256],
            ['bfh-chunk-str0', H_SHA256],
            ['xxh-chunk-0', H_XXH64],
            ['xxh-chunk-neg1', H_XXH64],
            ['xxh-chunk-str0', H_XXH64],
            ['gfh-sha256-chunk-0', H_SHA256],
            ['gfh-xxhash64-chunk-0', H_XXH64],
        ]
        for (let [name, h] of list) {
            it(`${name} should give the same hash as the default chunkSize without hanging`, function() {
                let out = runIntInputHang(name)
                assert.strict.deepStrictEqual(out, { ref: h, got: h })
            })
        }

    })

})
