import isestr from './isestr.mjs'
import isWindow from './isWindow.mjs'


/**
 * 前端下載base64資料成為檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadFileFromB64.test.js Github}
 * @memberOf wsemi
 * @param {String} cfn 輸入檔名字串
 * @param {String} b64 輸入base64資料字串
 * @example
 * need test in browser
 *
 * //icon.png to base64
 * let b64='iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACGklEQVQ4T6WTzWsTQRjGZ/YrEk1oofYgglURCqHb0QrBdLfNQQTPag9V624Sowh6FLz5F3hRqBSym1TsJWDx4EVESXdjWojYTdkqilAEL1ZaMGubNrMzsoGUxqyN4Nzm/fjx8jzvC8F/Ptipfz6eOhxyN8MR4+myX60vwJDGu0M8fwi9ydmWlJgAAB6gFBdQMWf/CfEFWLJ6D1JKSICfhXVXHpzTMovSNRUI9CV6Pf1tN6QNsCSnrjA1/ArvZ3uAS5OU4klkTn/6OJwI1SC5jszsg78CluQJ0aXccWRqsxTcZ5bj33vtg6urY/m86zUtjiTOMRBUxYJWakJaJrBGlVt1R8iefje14SdYeSjNC8H6DdHQH7UBrNjVXsByFwYNfXIvZyxJvQPB1hPRnFn36nYmeB9TEMvCI6KhP98LUJGUSxhC+5ShN2zdAVjDikwBQ1FRM5uA+ejlcBcXoP1FrdqMVWR1lKWgFjH1hRZA5YzS7wrswMlCJu8lykPpIBfESQAIwBtCpqlLRUqOQ4IXBt7mvrQAvE9FVu862HkYK+U3LVm9SAn5wLCQIQCcQHPZZ35WtrhQjqd7eLw9tsb1ad3uioKM7OOGfbJyc53ty3aRr0mW1GaaArZN4AWskdRRSPFZQpljkGGmICGQQpqCDFkh2/QFKnXYRA/y+fztsPOzGt3C9YZQgX18VPjxqxSx884/3UKnC92d/w3GFd4RMMe9pgAAAABJRU5ErkJggg=='
 * downloadFileFromB64('icon.png',b64)
 *
 */
function downloadFileFromB64(cfn, b64) {

    //check
    if (!isWindow()) {
        console.log('no window')
        return
    }

    //check
    if (!isestr(cfn)) {
        console.log('no filename')
        return
    }

    //tag a
    let a = document.createElement('a')
    a.href = b64
    a.download = cfn

    //download
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

}


export default downloadFileFromB64
