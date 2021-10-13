

/**
 * 前端瀏覽器以分頁開啟指定數據如文字、圖片、影片、pdf等
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/browserView.test.mjs Github}
 * @memberOf wsemi
 * @param {*} data 輸入數據
 * @param {String} type 輸入數據MIME Type字串，例如'application/pdf'或'text/plain'等，詳見[https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types]
 * @example
 * need test in browser
 *
 * let text = 'abc'
 * browserView(u8a, 'text/plain')
 *
 * let u8a = new Uint8Array([66, 97, 115])
 * browserView(u8a, 'application/pdf')
 *
 */
function browserView(data, type) {

    //blob
    let blob = new Blob([data], { type })

    //IE11無法支援createObjectURL
    try {

        //url
        let url = window.URL.createObjectURL(blob)

        //open
        window.open(url)

    }
    catch (err) {
        console.log('window.URL.createObjectURL is not support for IE11', err)
    }

}


export default browserView
