import assert from 'assert'
import detectXSS from '../src/detectXSS.mjs'


describe(`detectXSS`, function() {

    let tag = (t) => {
        return { type: 'tag', tag: t }
    }
    let attr = (t, n) => {
        return { type: 'attr', tag: t, name: n }
    }
    let url = (t, n, s) => {
        return { type: 'url', tag: t, name: n, scheme: s }
    }

    let check = (s, e) => {
        let r = detectXSS(s)
        assert.strict.deepStrictEqual(r, e)
    }

    describe(`規則1: 白名單外之標籤回報為tag`, function() {

        it(`should report script`, function() {
            check('<script>alert(1)</script>', [tag('script')])
        })

        it(`should report svg, iframe, body, style`, function() {
            check('<svg onload=alert(1)>', [tag('svg')])
            check('<iframe src="javascript:alert(1)"></iframe>', [tag('iframe')])
            check('<body onload=alert(1)>', [tag('body')])
            check('<style>body{display:none}</style>', [tag('style')])
        })

        it(`should report script when tags are nested to evade filters`, function() {
            check('<scr<script>ipt>alert(1)</script>', [tag('script')])
        })

        it(`should report script when breaking out of an attribute`, function() {
            check('"><script>alert(1)</script>', [tag('script')])
        })

        it(`should report tags whose attributes are separated by slashes`, function() {
            //瀏覽器視斜線為屬性分隔而執行, js-xss則取整串為標籤名
            check('<svg/onload=alert(1)>', [tag('svg')])
            check('<img/src="x"/onerror=alert(1)>', [tag('img')])
            check('<a/href="javascript:alert(1)">x</a>', [tag('a')])
        })

        it(`should report tag names in lowercase`, function() {
            check('<SCRIPT>alert(1)</SCRIPT>', [tag('script')])
        })

        it(`should report the full name of an unclosed tag at the end`, function() {
            check('<script', [tag('script')])
        })

        it(`should report form controls and custom elements`, function() {
            check('<input onfocus=alert(1) autofocus>', [tag('input')])
            check('<form action="javascript:alert(1)"><button>送出</button></form>', [tag('form'), tag('button')])
            check('<x-foo>自訂</x-foo>', [tag('x-foo')])
        })

        it(`should not report comparison signs, numbers and colon names`, function() {
            check('孔深 < 500 m 且 > 10 m', [])
            check('5<6>4', [])
            check('<o:p></o:p>', [])
            check('輸入 -> 輸出 <- 回饋', [])
        })

        it(`should not report whitelisted tags`, function() {
            check('<b>粗體</b>', [])
            check('<p>段落<br/>換行</p>', [])
            check('<table border="1"><tr><td colspan="2">c</td></tr></table>', [])
        })

    })

    describe(`規則2: 白名單內標籤被刪除之事件屬性回報為attr`, function() {

        it(`should report onerror of img`, function() {
            check('<img src=x onerror=alert(1)>', [attr('img', 'onerror')])
            check(`<img src="http://888.888.com/999.png" onerror="alert('XSS')">`, [attr('img', 'onerror')])
        })

        it(`should report event attributes in any case`, function() {
            check('<IMG SRC=x ONERROR=alert(1)>', [attr('img', 'onerror')])
        })

        it(`should report events of other whitelisted tags`, function() {
            check('<details open ontoggle=alert(1)>', [attr('details', 'ontoggle')])
            check('<a href="#" onclick="alert(1)">x</a>', [attr('a', 'onclick')])
            check('<b onmouseover=alert(1)>粗</b>', [attr('b', 'onmouseover')])
        })

        it(`should report events of an unclosed tag at the end`, function() {
            check('<img src=x onerror=alert(1)', [attr('img', 'onerror')])
        })

        it(`should not report words starting with on that have no value`, function() {
            check('a<b and once>c', [])
            check('x<b online>y', [])
            check('<img src="x" onerror="">', [])
        })

        it(`should not report names that are not on followed by letters`, function() {
            //瀏覽器之事件屬性為on接事件名, on-click、on:click、on為框架語法或一般字, 不會執行
            check('<b on-click="go()">x</b>', [])
            check('<b on:click="go()">x</b>', [])
            check('a<b on=1>c', [])
        })

        it(`should not report ordinary attributes removed by parsing text as a tag`, function() {
            check('a<b 且 c>d, 0<x<1', [])
        })

        it(`should not report style, which is kept as clearXSS does`, function() {
            check('<div style="text-align:center;">圖1 名稱</div>', [])
            check('<div style="position:fixed;top:0;left:0;width:100%;height:100%">遮罩</div>', [])
        })

        it(`should not report event words in text or attribute values`, function() {
            check('<p>onerror=alert(1)</p>', [])
            check('<img src="x" alt="onerror=alert(1)">', [])
        })

    })

    describe(`規則3: href或src被擋下且協定為javascript、vbscript或data回報為url`, function() {

        it(`should report javascript of href and src`, function() {
            check('<a href="javascript:alert(1)">點我</a>', [url('a', 'href', 'javascript')])
            check(`<img src="javascript:alert('XSS')">`, [url('img', 'src', 'javascript')])
        })

        it(`should report vbscript and data`, function() {
            check('<a href="vbscript:msgbox(1)">x</a>', [url('a', 'href', 'vbscript')])
            check('<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>', [url('a', 'href', 'data')])
        })

        it(`should report schemes in any case or with leading spaces`, function() {
            check('<a href="JaVaScRiPt:alert(1)">x</a>', [url('a', 'href', 'javascript')])
            check('<a href=" javascript:alert(1)">x</a>', [url('a', 'href', 'javascript')])
        })

        it(`should report schemes split by tab or newline`, function() {
            //瀏覽器解析網址時會刪除tab與換行
            check('<a href="jav&#x09;ascript:alert(1)">x</a>', [url('a', 'href', 'javascript')])
            check('<a href="java&Tab;script:alert(1)">x</a>', [url('a', 'href', 'javascript')])
            check('<a href="java\nscript:alert(1)">x</a>', [url('a', 'href', 'javascript')])
        })

        it(`should report schemes written in character references`, function() {
            check('<a href="javascript&colon;alert(1)">x</a>', [url('a', 'href', 'javascript')])
            check('<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">x</a>', [url('a', 'href', 'javascript')])
            check('<a href="&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A;alert(1)">x</a>', [url('a', 'href', 'javascript')])
        })

        it(`should report schemes after leading control characters`, function() {
            check('<a href="&#14;javascript:alert(1)">x</a>', [url('a', 'href', 'javascript')])
        })

        it(`should not report blocked relative paths`, function() {
            check('<img src="pics/a.png" alt="圖">', [])
            check('<a href="pics/a.png">圖</a>', [])
            check('<a href="C:\\docs\\a.pdf">檔案</a>', [])
            check('<a href="">x</a>', [])
        })

        it(`should not report allowed urls`, function() {
            check('<a href="https://example.com" target="_blank">連結</a>', [])
            check('<img src="data:image/png;base64,iVBORw0KGgo=">', [])
            check('<a href="#top">頂端</a>', [])
        })

    })

    describe(`規則4: 有註解時另保留註解再解析一次取聯集`, function() {

        it(`should report script after a comment closed by --!>`, function() {
            check('<!-- --!><script>alert(1)</script>-->', [tag('script')])
        })

        it(`should report script after a comment containing a quote`, function() {
            check('<!-- a="x --><script>alert(1)</script><!-- " -->', [tag('script')])
        })

        it(`should report script after an empty comment`, function() {
            check('<!--><script>alert(1)</script>-->', [tag('script')])
        })

        it(`should report script inside a comment`, function() {
            check('<!--<script>alert(1)</script>-->', [tag('script')])
        })

        it(`should not report a comment itself`, function() {
            check('備註 <!-- 內部用 --> 結束', [])
        })

    })

    describe(`規則5: 重複項目合併為1筆, 依出現順序排列`, function() {

        it(`should keep the order of appearance`, function() {
            check('<img src=x onerror=alert(1)><script>alert(1)</script>', [attr('img', 'onerror'), tag('script')])
            check('<script>alert(1)</script><img src=x onerror=alert(1)>', [tag('script'), attr('img', 'onerror')])
        })

        it(`should merge duplicated items`, function() {
            check('<script>a</script><script>b</script>', [tag('script')])
            check('<img src=x onerror=alert(1)><img src=y onerror=alert(2)>', [attr('img', 'onerror')])
        })

        it(`should keep items differing in tag or name`, function() {
            check('<img src=x onerror=alert(1)><img src=x onload=alert(2)><b onclick=alert(3)>', [attr('img', 'onerror'), attr('img', 'onload'), attr('b', 'onclick')])
        })

    })

    describe(`不報字元參照與一般文字(現行以htmlDecode(clearXSS(v))比對會誤報者)`, function() {

        it(`should not report escaped tags and entities`, function() {
            check('&lt;b&gt; 為粗體標籤', [])
            check('&copy 2026 版權', [])
            check('A&amp;B', [])
            check('R&D 中心', [])
        })

        it(`should not report plain text of a javascript url`, function() {
            //非HTML不偵測, 網址欄位須另檢查協定
            check('javascript:alert(1)', [])
        })

    })

    describe(`非字串或空字串回傳空陣列`, function() {

        it(`should return [] when input is not a non-empty string`, function() {
            check('', [])
            check(123, [])
            check(12.34, [])
            check(true, [])
            check(null, [])
            check(undefined, [])
            check(NaN, [])
            check([], [])
            check({}, [])
            check(['<script>alert(1)</script>'], [])
        })

        it(`should return [] when input is whitespace or plain text`, function() {
            check(' ', [])
            check('12.34abc', [])
        })

    })

})
