import assert from 'assert'
import copyStrToClipboard from '../src/copyStrToClipboard.mjs'
import { NOT_ELE, mkEditDom } from './tools/domEditKit.mjs'


//ws286a: 非計算類函數之必須參數遇非預期(第221項 §11 第6項第一類), copyStrToClipboard(str, opt)
//  str非字串、取不到焦點、document.execCommand('copy')拋錯或回false, 皆改拋Error(原回訊息字串, 暫存textarea留在頁面; execCommand回false視為成功), 且暫存textarea必定移除; 成功回''不變
//  規格: dspec〈輸入參數之檢測機制〉§5.1(同步且有副作用者同步throw Error, 先於任何副作用; V17無殘留)、V19(訊息格式invalid <名稱>: must be <種類描述>)、V20(不回顯輸入值)、§5.3 C18(不以訊息字串作回傳值)、
//        訊息不得洩漏內部錯誤(execCommand拋出之原錯誤訊息不外洩)
//  DOM測試作法: 以最小假DOM(test/tools/fakeDom.mjs經domEditKit.mjs補語義)驅動; 真實焦點判定、剪貼簿權限與execCommand之實際複製屬瀏覽器語義, 非本檔所能驗證, 須於瀏覽器實測
describe(`copyStrToClipboard`, function() {

    let env = null

    beforeEach(function() {
        env = mkEditDom()
    })

    afterEach(function() {
        env.restore()
    })

    let MSG_STR = 'invalid str: must be a string'
    let MSG_FOCUS = 'ele can not be focused'
    let MSG_COPY = 'can not copy str to clipboard'

    //clean, 暫存textarea已移除: 所建元素皆不在頁面中, 且body與指定容器下無殘留
    let assertClean = (...parents) => {
        for (let e of env.created) {
            assert.strict.deepStrictEqual(e.parentNode, null)
            assert.strict.deepStrictEqual(e.isConnected, false)
        }
        assert.strict.deepStrictEqual(env.body.children.filter((c) => c.tagName === 'TEXTAREA').length, 0)
        for (let p of parents) {
            assert.strict.deepStrictEqual(p.children.length, 0)
        }
    }

    //--- str非字串 ---

    //spec: str非字串拋Error('invalid str: must be a string'), 未建立textarea、未動DOM、未呼叫execCommand
    for (let [label, v] of NOT_ELE) {
        if (typeof v === 'string') {
            continue //字串為有效輸入
        }
        it(`should throw ${MSG_STR} for non-string str ${label} without creating a textarea`, function() {
            env.resetOps()
            let snap = env.snap()
            assert.throws(() => copyStrToClipboard(v), (err) => {
                assert.strict.deepStrictEqual(err instanceof Error, true)
                assert.strict.deepStrictEqual(err.message, MSG_STR)
                return true
            })
            assert.strict.deepStrictEqual(env.created.length, 0)
            assert.strict.deepStrictEqual(env.ops.length, 0)
            assert.strict.deepStrictEqual(env.snap(), snap)
            assert.strict.deepStrictEqual(env.copyCalls.length, 0)
        })
    }

    it(`should throw ${MSG_STR} when called without argument, even with a valid opt.eleParent`, function() {
        let parent = env.mkParent()
        env.resetOps()
        assert.throws(() => copyStrToClipboard(), { message: MSG_STR })
        assert.throws(() => copyStrToClipboard(undefined, { eleParent: parent }), { message: MSG_STR })
        assert.strict.deepStrictEqual(env.created.length, 0)
        assert.strict.deepStrictEqual(env.ops.length, 0)
        assert.strict.deepStrictEqual(parent.children.length, 0)
    })

    //spec V20: 錯誤訊息不回顯輸入值
    it(`should not echo the input value in the error message`, function() {
        assert.throws(() => copyStrToClipboard({ secret: 'SECRET-9f3a' }), (err) => {
            assert.strict.deepStrictEqual(err.message.includes('SECRET'), false)
            return true
        })
    })

    //--- 成功 ---

    //spec: 成功回傳''(嚴格等於), 複製當下textarea已在頁面中、持有焦點且value即輸入字串(端到端不變式), 複製後暫存textarea已移除
    for (let str of ['abc', 'The Woodman(樵夫) set to work at once, and so...', 'line1\nline2\n<b>&amp;</b>', '', '   ']) {
        it(`should return '' and remove the temporary textarea on success (str ${JSON.stringify(str)})`, function() {
            env.resetOps()
            let r = copyStrToClipboard(str)
            assert.strict.deepStrictEqual(r, '')
            assert.strict.deepStrictEqual(env.created.length, 1)
            assert.strict.deepStrictEqual(env.created[0].tagName, 'TEXTAREA')
            assert.strict.deepStrictEqual(env.copyCalls, [{ cmd: 'copy', value: str, connected: true, tag: 'TEXTAREA' }])
            assertClean()
        })
    }

    //spec: opt.eleParent為元素時textarea建於其下並自其下移除, body不被動到
    it(`should create the textarea under opt.eleParent and remove it from there`, function() {
        let parent = env.mkParent()
        env.resetOps()
        let r = copyStrToClipboard('abc', { eleParent: parent })
        assert.strict.deepStrictEqual(r, '')
        assert.strict.deepStrictEqual(env.copyCalls[0].connected, true)
        assert.strict.deepStrictEqual(env.ops.filter((o) => o === 'appendChild').length, 1)
        assertClean(parent)
    })

    //spec: opt.eleParent非元素或opt非物件時改用document.body(opt類非預期視為未給)
    it(`should fall back to document.body when opt.eleParent is not an element or opt is not an object`, function() {
        for (let opt of [undefined, null, {}, { eleParent: null }, { eleParent: 'body' }, { eleParent: {} }, 'abc', 123]) {
            env.resetOps()
            assert.strict.deepStrictEqual(copyStrToClipboard('abc', opt), '')
            assert.strict.deepStrictEqual(env.copyCalls[0].connected, true)
            assertClean()
        }
    })

    //--- 失敗路徑: 皆拋錯且textarea已移除 ---

    //spec: 取不到焦點拋Error, 不呼叫execCommand, textarea已移除
    it(`should throw ${MSG_FOCUS} when the textarea can not be focused, not call execCommand and remove the textarea`, function() {
        env.focusOnSelect = false
        env.resetOps()
        assert.throws(() => copyStrToClipboard('abc'), (err) => {
            assert.strict.deepStrictEqual(err instanceof Error, true)
            assert.strict.deepStrictEqual(err.message, MSG_FOCUS)
            return true
        })
        assert.strict.deepStrictEqual(env.created.length, 1)
        assert.strict.deepStrictEqual(env.selects.length, 1)
        assert.strict.deepStrictEqual(env.copyCalls.length, 0)
        assertClean()
    })

    it(`should remove the textarea from opt.eleParent when it can not be focused`, function() {
        let parent = env.mkParent()
        env.focusOnSelect = false
        env.resetOps()
        assert.throws(() => copyStrToClipboard('abc', { eleParent: parent }), { message: MSG_FOCUS })
        assertClean(parent)
    })

    //spec: execCommand('copy')拋錯改拋Error(固定訊息, 不外洩原錯誤之訊息), textarea已移除
    it(`should throw ${MSG_COPY} when execCommand throws, not leak the original message and remove the textarea`, function() {
        env.copyMode = 'throw'
        env.resetOps()
        assert.throws(() => copyStrToClipboard('abc'), (err) => {
            assert.strict.deepStrictEqual(err instanceof Error, true)
            assert.strict.deepStrictEqual(err.message, MSG_COPY)
            assert.strict.deepStrictEqual(err.message.includes('internal-detail'), false)
            return true
        })
        assert.strict.deepStrictEqual(env.copyCalls.length, 1)
        assertClean()
    })

    it(`should remove the textarea from opt.eleParent when execCommand throws`, function() {
        let parent = env.mkParent()
        env.copyMode = 'throw'
        env.resetOps()
        assert.throws(() => copyStrToClipboard('abc', { eleParent: parent }), { message: MSG_COPY })
        assertClean(parent)
    })

    //spec: execCommand('copy')回false視為複製失敗(原視為成功), 拋Error, textarea已移除
    it(`should throw ${MSG_COPY} when execCommand returns false and remove the textarea`, function() {
        env.copyMode = 'false'
        env.resetOps()
        assert.throws(() => copyStrToClipboard('abc'), (err) => {
            assert.strict.deepStrictEqual(err instanceof Error, true)
            assert.strict.deepStrictEqual(err.message, MSG_COPY)
            return true
        })
        assert.strict.deepStrictEqual(env.copyCalls.length, 1)
        assertClean()
    })

    it(`should remove the textarea from opt.eleParent when execCommand returns false`, function() {
        let parent = env.mkParent()
        env.copyMode = 'false'
        env.resetOps()
        assert.throws(() => copyStrToClipboard('abc', { eleParent: parent }), { message: MSG_COPY })
        assertClean(parent)
    })

    //spec: 失敗路徑不回傳訊息字串(失敗只經拋錯)
    it(`should never return a message string on failure (the failure channel is the throw only)`, function() {
        let outcomes = []
        for (let mode of ['focus', 'throw', 'false']) {
            env.resetOps()
            env.focusOnSelect = mode !== 'focus'
            env.copyMode = mode === 'focus' ? 'ok' : mode
            let r = '(not returned)'
            try {
                r = copyStrToClipboard('abc')
            }
            catch (err) {
                outcomes.push(err instanceof Error)
            }
            assert.strict.deepStrictEqual(r, '(not returned)', mode)
        }
        assert.strict.deepStrictEqual(outcomes, [true, true, true])
    })

    //spec: 清理不得覆蓋原錯誤或原結果(頁面腳本於複製當下已自行移除textarea, 使removeChild拋NotFoundError)
    it(`should keep the original failure when the cleanup itself fails (textarea already removed by page script)`, function() {
        env.copyMode = 'false'
        env.onCopy = (ae) => {
            ae.remove()
        }
        env.resetOps()
        assert.throws(() => copyStrToClipboard('abc'), { message: MSG_COPY })
        assertClean()
    })

    it(`should keep the success result when the cleanup itself fails (textarea already removed by page script)`, function() {
        env.onCopy = (ae) => {
            ae.remove()
        }
        env.resetOps()
        assert.strict.deepStrictEqual(copyStrToClipboard('abc'), '')
        assertClean()
    })

    //spec: 失敗後不留殘留, 之後的呼叫不受影響(連續呼叫每次皆建一個並移除一個)
    it(`should leave no residue after failures so that a following call works normally`, function() {
        env.resetOps()
        env.focusOnSelect = false
        assert.throws(() => copyStrToClipboard('a'), { message: MSG_FOCUS })
        env.focusOnSelect = true
        env.copyMode = 'false'
        assert.throws(() => copyStrToClipboard('b'), { message: MSG_COPY })
        env.copyMode = 'throw'
        assert.throws(() => copyStrToClipboard('c'), { message: MSG_COPY })
        env.copyMode = 'ok'
        assert.strict.deepStrictEqual(copyStrToClipboard('d'), '')
        assert.strict.deepStrictEqual(env.created.length, 4)
        assertClean()
    })

})
