import assert from 'assert'
import setTimeoutHp from '../src/setTimeoutHp.mjs'
import isenum from '../src/isenum.mjs'
import iseint from '../src/iseint.mjs'
import arrAccum from '../src/arrAccum.mjs'
import arrNorm from '../src/arrNorm.mjs'
import { resetWarned } from './tools/numOptKit.mjs'
import { captureTimers } from './tools/optValKit.mjs'


//第221項第二批,獨立審查者(sonnet)指出之兩個加固點(第一級發布A: 原以delay驗optVal路徑, delay屬第二、三級不納入, 改以setTimeoutHp驗同一單一擁有者_optVal.mjs/_numOpt.warnOnce):
//  1. opt.funLog為async函數而reject時,「出口拋錯一律忽略」須涵蓋其回傳之rejected Promise(否則unhandledRejection使行程崩潰)
//  2. opt為已撤銷之Proxy時,視為未給(Array.isArray對已撤銷之Proxy會拋TypeError)
describe('optVal hardening', function() {

    //等unhandledRejection有機會觸發(事件於微任務清空後的下一輪發出), 以setImmediate兩輪同步, 不以固定時間等待
    let tick = () => new Promise((resolve) => setImmediate(() => setImmediate(resolve)))

    describe('async funLog that rejects must not become an unhandledRejection (the outlet swallows errors)', function() {

        let un = []
        let onUn = (r) => un.push(String(r))

        before(function() {
            process.on('unhandledRejection', onUn)
        })

        after(function() {
            process.removeListener('unhandledRejection', onUn)
            resetWarned()
        })

        it('optVal path (setTimeoutHp): debug warning handed to a rejecting async funLog is swallowed', async function() {
            resetWarned()
            un.length = 0
            let n = 0
            let funLog = async () => {
                n++
                throw new Error('log outlet failed')
            }
            captureTimers(() => {
                setTimeoutHp(() => {}, 'bad', { debug: true, funLog }) //啟動後之輪詢setTimeout被攔截, 不真的排程
            })
            await tick()
            assert.strict.deepStrictEqual(n, 1)
            assert.strict.deepStrictEqual(un, [])
        })

        it('isenum / iseint opt path: warning handed to a rejecting async funLog is swallowed', async function() {
            resetWarned()
            un.length = 0
            let n = 0
            let funLog = () => {
                n++
                return Promise.reject(new Error('log outlet failed'))
            }
            isenum(5, { min: 'abc', debug: true, funLog })
            iseint(5, { use: 'nope', debug: true, funLog })
            await tick()
            assert.strict.deepStrictEqual(n, 2)
            assert.strict.deepStrictEqual(un, [])
        })

        it('a thenable whose then throws is also swallowed, and a sync-throwing funLog still does not throw', async function() {
            resetWarned()
            un.length = 0
            let funLog = () => ({
                then() {
                    throw new Error('then failed')
                }
            })
            captureTimers(() => {
                assert.doesNotThrow(() => setTimeoutHp(() => {}, 'bad', { debug: true, funLog }))
            })
            resetWarned()
            captureTimers(() => {
                assert.doesNotThrow(() => setTimeoutHp(() => {}, 'bad', {
                    debug: true,
                    funLog: () => {
                        throw new Error('sync fail')
                    }
                }))
            })
            await tick()
            assert.strict.deepStrictEqual(un, [])
        })

    })

    describe('revoked Proxy as opt is treated as not given', function() {

        let revoked = () => {
            let { proxy, revoke } = Proxy.revocable({ base: 5 }, {})
            revoke()
            return proxy
        }

        it('arrAccum(vec, revoked) uses base 0', function() {
            assert.strict.deepStrictEqual(arrAccum([1, '-', 3], revoked()), [1, 1, 4])
        })

        it('arrNorm(vec, revoked) uses base 0', function() {
            assert.strict.deepStrictEqual(arrNorm([3, '-', 4], revoked()), 5)
        })

        it('a getter that throws on base is treated as not given (existing behaviour kept)', function() {
            let o = {
                get base() {
                    throw new Error('x')
                }
            }
            assert.strict.deepStrictEqual(arrAccum([1, '-', 3], o), [1, 1, 4])
        })

    })

})
