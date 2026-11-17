import isestr from './isestr.mjs'
import isWindow from './isWindow.mjs'


/**
 * 前端下載base64資料成為檔案
 *
 * 會觸發瀏覽器下載(改動畫面)，輸入無效即同步拋Error(固定訊息、不含輸入值、先於建立元素與觸發下載)：fileName非非空字串為'invalid fileName: must be a non-empty string'，b64非非空字串為'invalid b64: must be a non-empty string'；檢測順序為fileName、b64，且先於環境檢查；非瀏覽器環境(無window)有效輸入時不動作、不拋錯(輸出'no window'，維持原行為)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadFileFromB64.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fileName 輸入檔名字串，須為非空字串
 * @param {String} b64 輸入base64資料字串，須為非空字串
 * @throws {Error} fileName或b64非非空字串，見上
 * @example
 * need test in browser
 *
 * //icon.png to base64
 * let b64='iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACGklEQVQ4T6WTzWsTQRjGZ/YrEk1oofYgglURCqHb0QrBdLfNQQTPag9V624Sowh6FLz5F3hRqBSym1TsJWDx4EVESXdjWojYTdkqilAEL1ZaMGubNrMzsoGUxqyN4Nzm/fjx8jzvC8F/Ptipfz6eOhxyN8MR4+myX60vwJDGu0M8fwi9ydmWlJgAAB6gFBdQMWf/CfEFWLJ6D1JKSICfhXVXHpzTMovSNRUI9CV6Pf1tN6QNsCSnrjA1/ArvZ3uAS5OU4klkTn/6OJwI1SC5jszsg78CluQJ0aXccWRqsxTcZ5bj33vtg6urY/m86zUtjiTOMRBUxYJWakJaJrBGlVt1R8iefje14SdYeSjNC8H6DdHQH7UBrNjVXsByFwYNfXIvZyxJvQPB1hPRnFn36nYmeB9TEMvCI6KhP98LUJGUSxhC+5ShN2zdAVjDikwBQ1FRM5uA+ejlcBcXoP1FrdqMVWR1lKWgFjH1hRZA5YzS7wrswMlCJu8lykPpIBfESQAIwBtCpqlLRUqOQ4IXBt7mvrQAvE9FVu862HkYK+U3LVm9SAn5wLCQIQCcQHPZZ35WtrhQjqd7eLw9tsb1ad3uioKM7OOGfbJyc53ty3aRr0mW1GaaArZN4AWskdRRSPFZQpljkGGmICGQQpqCDFkh2/QFKnXYRA/y+fztsPOzGt3C9YZQgX18VPjxqxSx884/3UKnC92d/w3GFd4RMMe9pgAAAABJRU5ErkJggg=='
 * downloadFileFromB64('icon.png',b64)
 *
 */
function downloadFileFromB64(fileName, b64) {

    //check, 會觸發下載, 輸入無效即拋錯且先於任何動作(同domAppend; 原fileName無效僅console.log後return、b64無任何檢測而任意值寫入href並觸發下載, 主次參數處置不一致)
    if (!isestr(fileName)) {
        throw new Error('invalid fileName: must be a non-empty string')
    }
    if (!isestr(b64)) {
        throw new Error('invalid b64: must be a non-empty string')
    }

    //check
    if (!isWindow()) {
        console.log('no window')
        return
    }

    //tag a
    let a = document.createElement('a')
    a.href = b64
    a.download = fileName

    //download
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

}


export default downloadFileFromB64
