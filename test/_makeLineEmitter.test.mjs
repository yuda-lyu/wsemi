import assert from 'assert'
import makeLineEmitter from '../src/_makeLineEmitter.mjs'


//收集器
let collect = (prefix) => {
    let lines = []
    let emit = makeLineEmitter((line) => {
        lines.push(line)
    }, prefix)
    return { lines, emit }
}

//以固定亂數把文字切成隨機大小之chunk
let chunkify = (text, seed) => {
    let x = seed
    let rnd = () => {
        x = (x * 1103515245 + 12345) & 0x7fffffff
        return x
    }
    let parts = []
    let i = 0
    while (i < text.length) {
        let n = 1 + (rnd() % 7)
        parts.push(text.slice(i, i + n))
        i += n
    }
    return parts
}


describe(`_makeLineEmitter(內部,execCliJsonFile使用)`, function() {

    //規格(建議檔§2 makeLineEmitter): onLine非函數拋錯
    describe(`輸入`, function() {

        it(`should throw 'makeLineEmitter 需要 onLine 函數' when onLine is not a function`, function() {
            for (let v of [undefined, null, 5, 'x', {}, [], true]) {
                assert.throws(() => makeLineEmitter(v), { message: 'makeLineEmitter 需要 onLine 函數' }, String(typeof v))
            }
            assert.throws(() => makeLineEmitter(), { message: 'makeLineEmitter 需要 onLine 函數' })
        })

        it(`should treat a non-string prefix as '' (receive every line)`, function() {
            for (let p of [undefined, null, 5, {}, [], true, ['x']]) {
                let { lines, emit } = collect(p)
                emit('a\nb\n')
                assert.strict.deepStrictEqual(lines, ['a', 'b'], String(typeof p))
            }
        })

    })

    //規格(建議檔§2): chunk累積成完整行, 最後半行留待下個chunk, 空行不回報
    describe(`切行`, function() {

        it(`should emit complete lines and keep the last half line for the next chunk`, function() {
            let { lines, emit } = collect()
            emit('abc')
            assert.strict.deepStrictEqual(lines, [])
            emit('def\nghi')
            assert.strict.deepStrictEqual(lines, ['abcdef'])
            emit('jkl\n')
            assert.strict.deepStrictEqual(lines, ['abcdef', 'ghijkl'])
        })

        it(`should emit several lines from one chunk in order`, function() {
            let { lines, emit } = collect()
            emit('1\n2\n3\n4')
            assert.strict.deepStrictEqual(lines, ['1', '2', '3'])
        })

        it(`should not report empty lines (and lines of only a carriage return)`, function() {
            let { lines, emit } = collect()
            emit('a\n\n\nb\r\n\r\n\nc\n')
            assert.strict.deepStrictEqual(lines, ['a', 'b', 'c'])
        })

        //規格(執行殼原契約 runJsonCli.makeLineEmitter, 逐行trim): 前後空白(含Windows輸出之行尾\r)皆去除, 內部空白保留
        it(`should trim every line (leading and trailing whitespace, including the CRLF carriage return) and keep the inner whitespace`, function() {
            let { lines, emit } = collect()
            emit('a b \r\n  c\r\n\td e\t\n')
            assert.strict.deepStrictEqual(lines, ['a b', 'c', 'd e'])
        })

        it(`should not report a line of only whitespace (spaces, tabs, no-break space, ideographic space) after trimming`, function() {
            let { lines, emit } = collect()
            emit(' \n\t\n \n　\r\n \t   \nx\n')
            assert.strict.deepStrictEqual(lines, ['x'])
        })

        it(`should give the same lines for any chunking of the same text (chunk boundaries need not fall on newlines)`, function() {
            let text = '[a] one\n中文行 two\r\n\n[b] three\nlast-without-newline'
            let want = ['[a] one', '中文行 two', '[b] three']
            for (let seed = 1; seed <= 200; seed++) {
                let { lines, emit } = collect()
                chunkify(text, seed).forEach((c) => emit(c))
                assert.strict.deepStrictEqual(lines, want, `seed=${seed}`)
                emit.flush()
                assert.strict.deepStrictEqual(lines, [...want, 'last-without-newline'], `seed=${seed} after flush`)
            }
        })

        it(`should ignore an undefined or null chunk (not report the text 'undefined')`, function() {
            let { lines, emit } = collect()
            emit(undefined)
            emit(null)
            emit('a\n')
            emit.flush()
            assert.strict.deepStrictEqual(lines, ['a'])
        })

        it(`should assemble one very long line from many chunks without a newline (and report it once when the newline arrives)`, function() {
            let { lines, emit } = collect()
            let piece = 'x'.repeat(1000)
            for (let i = 0; i < 5000; i++) {
                emit(piece) //5 MB, 新段皆無換行
            }
            assert.strict.deepStrictEqual(lines, [])
            emit('\nnext\n')
            assert.strict.deepStrictEqual(lines.length, 2)
            assert.strict.deepStrictEqual(lines[0].length, 5000 * 1000)
            assert.strict.deepStrictEqual(lines[1], 'next')
        })

        it(`should accept Buffer chunks`, function() {
            let { lines, emit } = collect()
            emit(Buffer.from('ab\ncd'))
            emit(Buffer.from('e\n'))
            assert.strict.deepStrictEqual(lines, ['ab', 'cde'])
        })

    })

    describe(`flush(串流結束時補回報殘留半行)`, function() {

        it(`should emit the remaining half line once and then nothing more`, function() {
            let { lines, emit } = collect()
            emit('done\nrest')
            emit.flush()
            emit.flush()
            assert.strict.deepStrictEqual(lines, ['done', 'rest'])
        })

        it(`should emit nothing when there is no remaining text or only a carriage return`, function() {
            let { lines, emit } = collect()
            emit('a\n')
            emit.flush()
            emit('\r')
            emit.flush()
            assert.strict.deepStrictEqual(lines, ['a'])
        })

        //規格(執行殼原契約逐行trim, flush同規則): 殘留半行亦trim, trim後為空不回報, 前綴比對用trim後之字串
        it(`should apply the same trim rule to the remaining half line (trimmed; nothing when only whitespace; prefix compared after trim)`, function() {
            let a = collect()
            a.emit('done\n   tail  \t')
            a.emit.flush()
            assert.strict.deepStrictEqual(a.lines, ['done', 'tail'])
            let b = collect()
            b.emit('x\n \t \r')
            b.emit.flush()
            assert.strict.deepStrictEqual(b.lines, ['x'])
            let c = collect('[x]')
            c.emit('  [x] rest  ')
            c.emit.flush()
            assert.strict.deepStrictEqual(c.lines, ['[x] rest'])
            let d = collect('[x]')
            d.emit('   noise  ')
            d.emit.flush()
            assert.strict.deepStrictEqual(d.lines, [])
        })

        it(`should start fresh after flush (the flushed half line does not join the next chunk)`, function() {
            let { lines, emit } = collect()
            emit('half')
            emit.flush()
            emit('new\n')
            assert.strict.deepStrictEqual(lines, ['half', 'new'])
        })

    })

    //規格(建議檔§2): prefix有給時只回以其開頭之行
    describe(`prefix`, function() {

        //規格(執行殼原契約): 前綴比對與回報皆用trim後之字串, 故縮排之前綴行亦收, 回報時已去縮排
        it(`should emit only the lines that start with the prefix, compared and reported after trimming`, function() {
            let { lines, emit } = collect('[x]')
            emit('[x] a\nnoise\n [x] indented\n[y] b\n[x]c\n  \t[x] tabbed \r\n[x]')
            assert.strict.deepStrictEqual(lines, ['[x] a', '[x] indented', '[x]c', '[x] tabbed'])
            emit.flush()
            assert.strict.deepStrictEqual(lines, ['[x] a', '[x] indented', '[x]c', '[x] tabbed', '[x]'])
        })

        it(`should compare a prefix with leading whitespace against the trimmed line, so it never matches (the line has no leading whitespace left)`, function() {
            let { lines, emit } = collect(' [x]')
            emit(' [x] a\n[x] b\n')
            assert.strict.deepStrictEqual(lines, [])
        })

        it(`should keep a prefixed line whole when its half arrives in the next chunk (decide on the whole line)`, function() {
            let { lines, emit } = collect('[x]')
            emit('[')
            emit('x] split')
            emit(' line\n')
            assert.strict.deepStrictEqual(lines, ['[x] split line'])
        })

        it(`should receive every line when prefix is the empty string`, function() {
            let { lines, emit } = collect('')
            emit('a\nb\n')
            assert.strict.deepStrictEqual(lines, ['a', 'b'])
        })

    })

    //原測試逐字移植(輸入與期望值逐字相同, 僅斷言函數改用assert.strict): 執行殼之 makeLineEmitter 原測試, 以證本模組契約與原件一致
    describe(`原契約逐字(執行殼原測試)`, function() {

        //執行殼/test/unit-check-util.test.mjs:60-71
        it(`makeLineEmitter：onLine 非函數拋錯；prefix 非字串視為""(全收)；有效輸入行為不變 (unit-check-util.test.mjs:60-71)`, function() {
            assert.strict.throws(() => makeLineEmitter('not-a-fn', ''), /makeLineEmitter 需要 onLine 函數/)
            const lines = []
            const feed = makeLineEmitter((l) => lines.push(l), '[x]')
            feed('[x]a\n[y]b\n[x]c')
            feed('d\n')
            assert.strict.deepEqual(lines, ['[x]a', '[x]cd'])
            const lines2 = []
            const feed2 = makeLineEmitter((l) => lines2.push(l), 123) // prefix 非字串
            feed2('hello\n\n  \nworld\r\n')
            assert.strict.deepEqual(lines2, ['hello', 'world'], 'prefix 非字串時視為""(全收);空行與純空白行不回報')
        })

        //執行殼/test/unit-runner.test.mjs:320-322
        it(`空行不回報、半行跨 chunk 接續 (unit-runner.test.mjs:320-322)`, function() {
            const em = []; const emit = makeLineEmitter((l) => em.push(l), '')
            emit('a\r\n\r\n  b'); emit('c\nd')
            assert.strict.deepEqual(em, ['a', 'bc'], '空行不回報、半行跨 chunk 接續')
        })

    })

    describe(`獨立性`, function() {

        it(`should keep two emitters independent (stdout and stderr must not interleave their half lines)`, function() {
            let lines = []
            let eo = makeLineEmitter((l) => lines.push(['out', l]))
            let ee = makeLineEmitter((l) => lines.push(['err', l]))
            eo('out-')
            ee('err-')
            eo('1\n')
            ee('2\n')
            assert.strict.deepStrictEqual(lines, [['out', 'out-1'], ['err', 'err-2']])
        })

    })

    //onLine拋錯之處置: 其餘行照常回報、狀態一致、全部回報後原樣重拋第一個錯誤
    describe(`onLine拋錯`, function() {

        it(`should still emit the other lines of the same chunk and rethrow the first error afterwards`, function() {
            let lines = []
            let emit = makeLineEmitter((l) => {
                lines.push(l)
                if (l === 'b' || l === 'c') {
                    throw new Error('boom-' + l)
                }
            })
            assert.throws(() => emit('a\nb\nc\nd\n'), { message: 'boom-b' })
            assert.strict.deepStrictEqual(lines, ['a', 'b', 'c', 'd'])
        })

        it(`should keep a consistent state after an error (the lines are not delivered twice, the half line is kept)`, function() {
            let lines = []
            let n = 0
            let emit = makeLineEmitter((l) => {
                lines.push(l)
                n++
                if (n === 1) {
                    throw new Error('first')
                }
            })
            assert.throws(() => emit('a\nb\nhalf'), { message: 'first' })
            emit('-end\nz\n')
            assert.strict.deepStrictEqual(lines, ['a', 'b', 'half-end', 'z'])
        })

        it(`should rethrow a thrown non-Error value as is (including undefined/null)`, function() {
            for (let v of ['str', 5, null, undefined, { k: 1 }]) {
                let emit = makeLineEmitter(() => {
                    throw v
                })
                let got = 'NOT-THROWN'
                try {
                    emit('a\n')
                }
                catch (err) {
                    got = err
                }
                assert.strict.deepStrictEqual(got, v)
            }
        })

        it(`should rethrow from flush as well`, function() {
            let emit = makeLineEmitter(() => {
                throw new Error('flush-boom')
            })
            emit('tail')
            assert.throws(() => emit.flush(), { message: 'flush-boom' })
        })

    })

})
