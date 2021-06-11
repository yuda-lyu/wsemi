import fs from 'fs'
import cheerio from 'cheerio'
import getPks from 'w-package-tools/src/getPks.mjs'


let cdnCodepen = 'https://static.codepen.io/assets/embed/ei.js'
let fnHtml = './docs/wsemi.html'


function main() {
    //由jsdoc產製之wsemi.html, 自動添加將example轉換成codepen線上編輯功能

    //wrap
    function wrap(selector, wrapper) {
        return $(selector).each(function() {
            $(this).before(wrapper).prev().append(this)
        })
    }

    //pks
    let pks = getPks()

    //read
    let h = fs.readFileSync(fnHtml, 'utf8')

    //check
    if (h.indexOf(cdnCodepen) >= 0) {
        console.log('已進行轉換')
        return
    }

    //$
    const $ = cheerio.load(h)
    //console.log($('body').html())

    //modify each pre
    $('pre[class="prettyprint"]').map(function(i, v) {

        //name
        let name = $(v).prev().prev().prev().prev().attr('id')
        name = name.replace('.', '')

        //h
        let h = $(v).html()

        //wrap, pre換成div
        wrap(v, '<div style="position:relative;"></div>')

        //取得div, 物件因wrap變成為原本pre的外層
        let p = $(v).parent()

        //把div內按鈕與原pre內容塞回去
        p.html(`
<div onclick="editOnline(this, '${name}')" style="position:absolute; right:16px; bottom:12px; font-size:9pt; color:#fff; cursor:pointer; padding-bottom:3px; border-bottom:1px solid #fff;">Try in Codepen</div>
<pre class="prettyprint">${h}</pre>
        `)

    })
    //console.log($.html())

    //add script, 使用jquery操作dom與掛載codepen, 而codepen還需要提供wsemi所需js套件
    let scOper = `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="${cdnCodepen}"></script>
    <script>
        let prefill = { 
            'scripts': [
                'https://cdn.jsdelivr.net/npm/dayjs@1.x/dayjs.min.js',
                'https://cdn.jsdelivr.net/npm/fuzzball@1.3.1/dist/fuzzball.umd.min.js',
                'https://cdn.jsdelivr.net/npm/ua-parser-js@0.7.23/dist/ua-parser.min.js',
                'https://cdn.jsdelivr.net/npm/xss@1.x/dist/xss.min.js',
                //'https://cdn.jsdelivr.net/npm/popper.js/dist/umd/popper.min.js',
                //'https://cdn.jsdelivr.net/npm/tippy.js@6.x/umd/index.all.js',
                //'https://cdn.jsdelivr.net/npm/xlsx@0.17.0/dist/xlsx.full.min.js',
                'https://cdn.jsdelivr.net/npm/wsemi@${pks.version}/dist/wsemi.umd.js',
            ] 
        }
        prefill = JSON.stringify(prefill)
    </script>
    <script>
        function editOnline(me, name) {
    
            //me
            me = $(me)
    
            //parent
            let p = me.parent()
    
            //ele, pre(prettyprint)
            let ele = me.next()
    
            //get code from pre
            let code = ele.children().text()
            //console.log(code)

            //add code for test and bodyLog function
            code='let '+name+' = wsemi.'+name+'<br>'+code
            code='let log = console.log; console.log = function(){ log.apply(null, arguments); wsemi.bodyLog.apply(null, arguments) }<br>'+code

            //reset to empty div
            ele.remove()
            p.html('<div></div>')
            let ediv = p.children()
    
            //ediv setting
            ediv
                .attr('class', 'codepen-later-' + name)
                .attr({
                    'data-prefill': prefill,
                    'data-height': 200,
                    'data-default-tab': 'js,result',
                    'data-editable': true
                })
    
            //add pre for js code
            ediv.append('<pre data-lang="js"></pre>')
    
            //epre
            let epre = ediv.children()
    
            //set code
            epre.html(code)
    
            //convert to codepen
            window.__CPEmbed('.' + 'codepen-later-' + name)
    
        }
    </script>
    `
    $('body').append(scOper)

    //get html
    let c = $.html()

    //write
    //console.log(c)
    fs.writeFileSync(fnHtml, c, 'utf8')

}
main()
