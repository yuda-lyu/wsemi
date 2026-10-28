import assert from 'assert'
import queue from '../src/queue.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


//pick, 事件轉簡式字串, 供斷言事件序列
function pick(e) {
    if (e.type === 'push') {
        return `push${e.size}`
    }
    if (e.type === 'hold') {
        return `hold${e.size}/${e.taking}`
    }
    if (e.type === 'message') {
        return `msg-${e.by}${e.size}`
    }
    if (e.type === 'get') {
        return e.hit ? `get${e.size}/${e.taking}` : `get-none/${e.taking}`
    }
    if (e.type === 'cb') {
        return `cb${e.size}/${e.taking}`
    }
    return `${e.type}${e.size}/${e.taking}`
}


describe(`queue`, function() {

    async function test(takeLimit, timeCallBack, opt) {
        return new Promise((resolve, reject) => {

            //queue
            let q = queue(takeLimit, opt)
            let n = 0
            let ms = []

            //message
            q.on('message', function(qs) {
                // console.log('message', JSON.stringify(qs))

                //ms
                ms.push(JSON.parse(JSON.stringify(qs)))

                //get
                let v = q.get()
                if (!v) {
                    return
                }
                // console.log('get', v)

                setTimeout(function() {
                    // console.log('cb', v)

                    //cb
                    q.cb()

                    //resolve
                    if (v === '$10') {
                        resolve(ms)
                    }

                }, timeCallBack)

            })

            //queues push 1~5
            setTimeout(function() {
                // console.log('queues push 1~5')
                let t = setInterval(function() {
                    n += 1
                    q.push('$' + n)
                    if (n === 5) {
                        clearInterval(t)
                    }
                }, 50)
            }, 1)

            //queues push 6~10 by delay 1s
            setTimeout(function() {
                // console.log('queues push 6~10')
                let t = setInterval(function() {
                    n += 1
                    q.push('$' + n)
                    if (n === 10) {
                        clearInterval(t)
                    }
                }, 50)
            }, 500)

        })
    }

    // console.log('test1')
    // queues push 1~5
    // message ["$1"]
    // get $1
    // message ["$2"]
    // get $2
    // queues push 6~10
    // cb $1
    // message ["$3","$4","$5","$6","$7","$8","$9","$10"]
    // get $3
    // cb $2
    // message ["$4","$5","$6","$7","$8","$9","$10"]
    // get $4
    // cb $3
    // message ["$5","$6","$7","$8","$9","$10"]
    // get $5
    // cb $4
    // message ["$6","$7","$8","$9","$10"]
    // get $6
    // cb $5
    // message ["$7","$8","$9","$10"]
    // get $7
    // cb $6
    // message ["$8","$9","$10"]
    // get $8
    // cb $7
    // message ["$9","$10"]
    // get $9
    // cb $8
    // message ["$10"]
    // get $10
    // cb $9
    // cb $10
    // [["$1"],["$2"],["$3","$4","$5","$6","$7","$8","$9","$10"],["$4","$5","$6","$7","$8","$9","$10"],["$5","$6","$7","$8","$9","$10"],["$6","$7","$8","$9","$10"],["$7","$8","$9","$10"],["$8","$9","$10"],["$9","$10"],["$10"]]
    let r1 = '[["$1"],["$2"],["$3","$4","$5","$6","$7","$8","$9","$10"],["$4","$5","$6","$7","$8","$9","$10"],["$5","$6","$7","$8","$9","$10"],["$6","$7","$8","$9","$10"],["$7","$8","$9","$10"],["$8","$9","$10"],["$9","$10"],["$10"]]'
    it(`should return '${r1}' when run test1'`, async function() {
        //結果取決於第二批push(500ms起、每50ms、至750ms)與第一個cb計時器(1051ms)之先後, 時間本身即規格, 以假時鐘推進(R-TRACE-01 P5); 原以真實計時器, 負載下第二批延後即改變先後
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let ms = null
            test(2, 1000, { onTrace: tr.on }).then((v) => {
                ms = v
            }) //takeLimit=2, timeCallBack=1000ms
            await clock.advance(5200) //最後一個cb於5101ms
            // console.log(JSON.stringify(ms))
            assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
            //觀察回調: $1、$2各push即派發並取走(處理中達上限2), $3~$10 push後皆暫不派發(hold, 全部早於第一個cb), 其後每個cb扣減處理中數量並派發剩餘全部(message之size逐次減1)再取走1個, 最後2個cb時佇列已空不再派發
            assert.strict.deepStrictEqual(tr.events.map(pick), [
                'push1', 'msg-push1', 'get0/1',
                'push1', 'msg-push1', 'get0/2',
                'push1', 'hold1/2',
                'push2', 'hold2/2',
                'push3', 'hold3/2',
                'push4', 'hold4/2',
                'push5', 'hold5/2',
                'push6', 'hold6/2',
                'push7', 'hold7/2',
                'push8', 'hold8/2',
                'cb8/1', 'msg-cb8', 'get7/2',
                'cb7/1', 'msg-cb7', 'get6/2',
                'cb6/1', 'msg-cb6', 'get5/2',
                'cb5/1', 'msg-cb5', 'get4/2',
                'cb4/1', 'msg-cb4', 'get3/2',
                'cb3/1', 'msg-cb3', 'get2/2',
                'cb2/1', 'msg-cb2', 'get1/2',
                'cb1/1', 'msg-cb1', 'get0/2',
                'cb0/1',
                'cb0/0',
            ])
        }
        finally {
            clock.restore()
        }
    })

    // console.log('test2')
    // test2
    // queues push 1~5
    // message ["$1"]
    // get $1
    // message ["$2"]
    // get $2
    // message ["$3"]
    // get $3
    // message ["$4"]
    // get $4
    // message ["$5"]
    // get $5
    // queues push 6~10
    // message ["$6"]
    // get $6
    // cb $1
    // message ["$7"]
    // get $7
    // cb $2
    // message ["$8"]
    // get $8
    // cb $3
    // message ["$9"]
    // get $9
    // cb $4
    // message ["$10"]
    // get $10
    // cb $5
    // cb $6
    // cb $7
    // cb $8
    // cb $9
    // cb $10
    // [["$1"],["$2"],["$3"],["$4"],["$5"],["$6"],["$7"],["$8"],["$9"],["$10"]]
    let r2 = '[["$1"],["$2"],["$3"],["$4"],["$5"],["$6"],["$7"],["$8"],["$9"],["$10"]]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test(0, 500) //takeLimit=0, timeCallBack=500ms
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    //message事件傳入佇列之快照(JSDoc): 監聽器修改它不影響佇列, 內部之後的push、get、clear亦不改變已傳出之快照; 全為同步呼叫, 不涉及時間
    it(`should pass a snapshot of the queue to message listeners, not the internal array`, function() {
        //監聽器修改傳入值(push一個不屬於佇列之值、再清空): 不影響佇列內容
        let q1 = queue(0)
        q1.on('message', (qs) => {
            qs.push('evil')
            qs.length = 0
        })
        q1.push('a')
        q1.push('b')
        let got1 = [q1.get(), q1.get(), q1.get()] //佇列仍為[a, b], 之後為空
        assert.strict.deepStrictEqual(got1, ['a', 'b', null])

        //內部之後的push、get不改變先前收到的快照(push路徑)
        let q2 = queue(0)
        let held = []
        q2.on('message', (qs) => {
            held.push(qs)
        })
        q2.push('a') //快照1: [a]
        q2.push('b') //快照2: [a, b]
        q2.get()
        q2.get()
        q2.push('c') //快照3: [c]
        q2.clear()
        assert.strict.deepStrictEqual(held, [['a'], ['a', 'b'], ['c']])
        assert.strict.deepStrictEqual(held[0] !== held[1] && held[1] !== held[2], true) //各次派發之快照互為不同之陣列

        //cb路徑: takeLimit=1時b、c於a處理中暫不派發, cb後派發之快照為[b, c], 其後get不改變它
        let q3 = queue(1)
        let held3 = []
        q3.on('message', (qs) => {
            held3.push(qs)
        })
        q3.push('a') //派發[a]
        q3.get()
        q3.push('b') //處理中已達上限而暫不派發
        q3.push('c')
        q3.cb() //派發[b, c]
        q3.get()
        q3.get()
        assert.strict.deepStrictEqual(held3, [['a'], ['b', 'c']])
    })

})


describe(`queue 觀察回調(onTrace)`, function() {

    it(`should notify push, hold, message, get, cb and clear in order with the queue length and the number being taken`, function() {
        //JSDoc 'push'為加入佇列、'hold'為已達同時處理上限而暫不派發、'message'為即將派發(by為觸發者, size為派發當下之佇列長度)、'get'、'cb'、'clear'; 事件於動作完成後通知(message於派發前)
        let tr = traceRec()
        let q = queue(1, { onTrace: tr.on })
        let taken = []
        let sizes = []
        q.on('message', (qs) => {
            sizes.push(qs.length) //派發當下監聽器所見之佇列長度
            let v = q.get()
            if (v !== null) {
                taken.push(v)
            }
        })
        q.push('a') //未達上限: 派發並取走
        q.push('b') //處理中1已達上限1: 暫不派發
        q.push('c')
        q.cb() //處理中扣為0: 派發剩餘2個, 取走b
        q.cb() //派發剩餘1個, 取走c
        q.cb() //佇列已空: 不派發
        q.cb() //處理中不為負數
        q.get() //佇列已空: 取不到
        q.push('d')
        q.push('e')
        q.clear() //清空佇列並重置處理中數量
        q.push('f') //重置後可立即派發
        assert.strict.deepStrictEqual(tr.events.map(pick), [
            'push1', 'msg-push1', 'get0/1',
            'push1', 'hold1/1',
            'push2', 'hold2/1',
            'cb2/0', 'msg-cb2', 'get1/1',
            'cb1/0', 'msg-cb1', 'get0/1',
            'cb0/0',
            'cb0/0',
            'get-none/0',
            'push1', 'msg-push1', 'get0/1',
            'push1', 'hold1/1',
            'clear1/1',
            'push1', 'msg-push1', 'get0/1',
        ])
        assert.strict.deepStrictEqual(taken, ['a', 'b', 'c', 'd', 'f'])
        //message事件之size等於監聽器於派發當下所見之佇列長度
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'message').map((e) => e.size), sizes)
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(第2參數可省略, 同舊版之queue(takeLimit)); P4: 回調之拋錯與回傳值不影響佇列、不產生未處理之rejection
        //佇列本身無計時器, 情境為同步(push、cb、get、clear依序呼叫), 不需假時鐘
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rs = []
        let rec = traceRec()
        try {
            let throws = () => {
                throw new Error('trace boom')
            }
            let rejects = () => Promise.reject(new Error('trace reject'))
            for (let args of [[], [{ onTrace: rec.on }], [{ onTrace: throws }], [{ onTrace: rejects }], [{ onTrace: 'abc' }]]) {
                let q = queue(2, ...args)
                let ms = []
                let taken = []
                q.on('message', (qs) => {
                    ms.push(qs.slice())
                    let v = q.get()
                    if (v) {
                        taken.push(v)
                    }
                })
                for (let i = 1; i <= 5; i++) {
                    q.push('$' + i)
                }
                for (let i = 0; i < 6; i++) {
                    q.cb()
                }
                let last = q.get()
                q.push('x')
                q.clear()
                q.push('y')
                rs.push(JSON.stringify({ ms, taken, last }))
            }
            await new Promise((resolve) => setImmediate(resolve))
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        let exp = JSON.stringify({
            ms: [['$1'], ['$2'], ['$3', '$4', '$5'], ['$4', '$5'], ['$5'], ['x'], ['y']],
            taken: ['$1', '$2', '$3', '$4', '$5', 'x', 'y'],
            last: null,
        })
        assert.strict.deepStrictEqual([rs, un], [[exp, exp, exp, exp, exp], []])
        //紀錄器確實收到事件
        assert.strict.deepStrictEqual(Array.from(new Set(rec.events.map((e) => e.type))).sort(), ['cb', 'clear', 'get', 'hold', 'message', 'push'])
    })

    it(`should notify through onTrace with frozen events of primitive fields and no receiver`, function() {
        //R-TRACE-01 P4: 事件為凍結物件、各type之欄位固定且皆為原始值、回調不帶接收者
        let tr = traceRec()
        let meta = []
        let onTrace = function(e) {
            meta.push([this, Object.isFrozen(e)])
            tr.on(e)
        }
        let q = queue(1, { onTrace })
        q.on('message', () => {
            q.get()
        })
        q.push('a')
        q.push('b') //hold
        q.cb() //message by cb
        q.get() //取不到
        q.clear()
        let keys = {}
        for (let e of tr.events) {
            keys[e.type] = Object.keys(e).join(',')
            assert.strict.deepStrictEqual(Object.values(e).every((v) => v === null || typeof v !== 'object'), true)
        }
        assert.strict.deepStrictEqual(keys, {
            push: 'type,size',
            hold: 'type,size,taking',
            message: 'type,by,size',
            get: 'type,hit,size,taking',
            cb: 'type,size,taking',
            clear: 'type,size,taking',
        })
        assert.strict.deepStrictEqual(meta.length > 0 && meta.every(([self, frozen]) => self === undefined && frozen), true)
    })

})
