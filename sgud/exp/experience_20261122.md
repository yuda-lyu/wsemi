# 累積經驗(2026-09-01 至 2026-10-13 初期工作之經驗)

本檔 2026-11-22 自本套件之 Claude Code 自動記憶提取(自動記憶依資料夾路徑存放,路徑更名即失聯;sgud 優先於自動記憶).`sgud/exp/experience_20261028.md` 起之經驗自 2026-10-06 記,本檔補其前之初期工作中 sgud 未載者.設計細節以 `src/` 之 JSDoc 與註解為準(各節只註明所在),本檔只記程式碼未載之教訓、驗證法與使用者裁示;使用者之處理偏好見 `sgud/proc/process.md`,規則見 `sgud/rule/rulebook_evem.md`(R-EVEM-RAW-01)、`sgud/rule/rulebook_data.md`(R-NUM-INPUT-01、R-JUDGE-SOURCE-01).各節當時之版本與「未提交」「待發布」等狀態已過時,不記.

## 事件派發之定案與「連續補丁」之教訓(2026-09-07 至 2026-09-13)

- 經過: 2026-09-07~08 為 `evem` 加 `type:'safe'` 於註冊時包裝監聽器(約 270 行);2026-09-12~13 整個移除,`evem` 回到只回傳 `new EventEmitter()`(`src/evem.mjs`),改由 `evEmit`／`evEmitDelay` 於派發站點包 try(規則 R-EVEM-RAW-01).
- 根因只有一個: setTimeout、stream、watcher 回呼之呼叫堆疊沒有呼叫端,監聽器同步拋錯變 uncaughtException;正解在派發站點包 try,不在註冊時包裝監聽器.包裝版另有缺陷: 須維護「包裝函數↔原函數」對應表而使 `on`／`off`／`once`／`listeners` 偏離規範,且 `isfun`／`ispm` 當時以 toString 標籤判定、與 eventemitter3 之 typeof 判定不一致,產生 13 處可觀察差異(標籤可偽造、getter 可拋).
- **教訓(補丁堆積)**: 同一功能連續修補時,先問「架構是否錯了」,不要再補點.使用者質疑「感覺是補破洞」,追查後兩天前加的 270 行確為方向錯誤.
- 審查: 雙 opus 獨立審加另一家複審,逐條核原始碼後才採納.
- setTimeout 上限: 門檻 2^31-1=2147483647;Node 超過夾成 1ms 並印 TimeoutOverflowWarning,瀏覽器(WebIDL ToInt32 模 2^32)環繞且無警告(2^32+5000 → 5 秒後觸發),故進 setTimeout 前須自行處理.當時做法(2026-09-13)為 13 個 timer 站點加 `Math.min(x, cst.TIMER_TIME_MAX)`(用 max 會把正常值放大為上限);其後使用者給之計時 opt 改依 R-ENUM-01 之 `use:'timer'` 與 R-OPT-VAL-01,超出上限者改用預設、不夾限(`evEmitDelay` 之 `opt.ms` 同),僅內部運算所得之延遲(如 `fsDownloadFileVerifyCore`)仍 `Math.min(x, cst.TIMER_TIME_MAX)`.安全整數上限擋不到 2^31(它是安全整數),兩個界限分開.`src/_const.mjs` 須寫成 `let cst = {...}; export default cst`(使用者要求,否則自動編譯規則不通).`debounce`／`pmDebounce`／`pmThrottle` 當時不加夾限(其 ms 是比較門檻,非 setTimeout 參數).
- 測法: 「行程會崩潰」類主張須用子行程斷言 exit code(mocha 本行程會攔 uncaught);unhandledRejection 在 mocha 管線下會觸發 2 次(獨立執行 1 次),斷言用 includes 不數次數.盤點「事件派發」類問題時,軸要用 `evem(|EventEmitter|chokidar|fs.watch` 全範圍.

## fsMergeFilesCore 失敗路徑重寫(2026-09-07)

- 審報告先量再信: 報告「目錄可刪=fd 已釋放」為無效證據(Windows 之 FILE_SHARE_DELETE);報告之「寫入流 error 無監聽 → uncaughtException、永不 settle」實測屬實,「Windows 無法刪除或覆寫」未重現.
- **報告之修正 diff 不能照抄**(兩缺陷): ①read `end` 即刪切片有競態——小切片之 end 先於非同步 write error,資料未寫成功之切片被刪(mocha 內必現,獨立單跑會僥倖過);②error 監聽在 `await` 期間 `pm.reject()` 而函數尚未 `return pm` → unhandledRejection(開檔失敗案).
- 做法(`src/fsMergeFilesCore.mjs` 註解已載): 建流後立即掛 error／finish;不用 pipe,`for await` 逐 chunk `write()`,以本片最後一個 callback 作屏障(零長度 write 不可當屏障,Writable 會短路回呼)成功才刪切片;`write()` 回 false 時 `Promise.race([once(ws,'drain'), pmWrite])`;catch 內 `destroy()`;`pm.catch(()=>{})`.
- 動 stream 類 fs 函數時,失敗路徑一律驗四項: settle 保證、uncaught／unhandled 為 0、fd 釋放、來源檔於目的端確認成功前不可刪;**獨立腳本過了還要進 mocha 跑**(競態常在 mocha 內才現形).
- 測試手法(`test/fsMergeFiles.test.mjs` 〈error paths〉): fs 代理攔 `createWriteStream` 取實例斷言 `destroyed`／`fd`;失敗 `_write` 以 `setImmediate` 回呼仿真實 fs;`highWaterMark:1024` 逼出 drain;`process.on('uncaughtException'／'unhandledRejection')` 計數;`settle` 5 秒 race 抓懸置;root 下唯讀案 skip.

## 下載與外部程序輸出解碼(2026-09-13)

- `fsDownloadFileCore`(`src/fsDownloadFileCore.mjs` JSDoc 已載暫存檔 `${fpOut}.download` 加 rename 與 pipeline 注入): pipe 不轉發來源錯誤,斷線時呼叫端崩潰或永久 pending 且正式檔名殘留截斷檔,故改 `stream/promises` pipeline.content-length 核對只在無 content-encoding 且無 transfer-encoding 時做(gzip 時 header 是壓縮後大小,實測誤判);真實 HTTP/1.1 下 undici 會先以 `terminated` 報錯,核對分支只能用假 fetch 測.Core 不 import builtin,pipeline 由外層注入;打包設定須列 `stream/promises`(`toolg/gDistRollup.mjs` 已列,否則 rollup 只能猜全域名).
- `execProcess` 解碼核心為內部模組 `src/_execProcessCodec.mjs`(不匯出 index,有獨立測試檔,底線開頭照來源模組命名).`Buffer.toString` 不支援 big5 且拋點在 data 事件內會拉倒行程,故改 TextDecoder 串流.**使用者拍板**: `codeCmd` 預設維持 `utf8`(下游多數呼叫端跑 utf-8 工具,翻預設會整批回歸);`'auto'`(先 utf-8 嚴格,該串流首次非法即改系統字碼頁)與 `'system'` 為顯式值,之後要不要把預設翻成 auto 另拍板.
- 下游要跑原生指令或 PyInstaller 凍結之 exe 者自行補 `codeCmd:'auto'`: PyInstaller 凍結程式刻意忽略 `PYTHONIOENCODING`／`PYTHONUTF8`(官方文件),`execCliCore` 之環境變數注入對其無效.
- exec 模式陣列 args: 不採建議書「含雙引號者 reject」,改為元素含空白且無雙引號才包引號,已含引號者原樣,字串型 args 原樣(自動包會把整串當一個參數).JSDoc 之 7z 範例原本 execFile 配字串 args 是壞的(node 實測 bad option),改陣列——**JSDoc 範例須抽出實跑**核對 `// =>`.
- 測試用本機 HTTP 服務之埠當時避開 test 目錄內其他測試所用者.

## execCliCore／execCliSession／execCliJsonRpc／strCompareForVersion 之提案審查(2026-09-05)

- 使用者要求提案**先審(逐條核 file:line)再做**: 審出三個設計缺陷——①`execCliSession` 之 `timeoutMs` 預設應為 null(不限制),不可沿用 execCli 之 120 秒;②提案把 LSP 列為適用,但 LSP 為 Content-Length 分幀,不適用一行一則 JSON 之 `execCliJsonRpc`;③回應判定應為「有 id 且含 result 或 error」,帶 id 含 method 者為伺服器→客戶端請求走 `onServerRequest`,無 id 走 `onNotify`.提案文件之行號亦有誤(匯出行 731 實為 599).實作時要求「既有測試連動、新函數各寫測試」,既有 `execCli` 行為零變更.
- wsemi 慣例: `*Core` 進 index.mjs;`buildSpawnArgs` 三分支一律帶 `opt`;子程序一律 `process.execPath`;Windows 專屬案例 `this.skip()`;exec 類新函數沿用「不 throw／不 reject、結果物件 ok／error」風格,並以腳本抽 JSDoc 範例實跑核對 `// =>`.

## cache() 改版:共用 in-flight promise(2026-09-01)

- 使用者裁示(使用端提案後): 「不用 waitFun,直接改 promise」「預設改 false」;對自有套件核心行為直接改、重推測試預期,不加相容旗標保舊行為(通則見專案原則 14);命名見 `sgud/proc/process.md`.選項 `timeFrom`、`useCacheWhenError`(預設 false)、`useCloneDeep` 之語意以 `src/cache.mjs` JSDoc 為準.
- 動 `cache.mjs` 時沿用 `get()` 內 `run()` 之 try／catch／finally: `d.pm` 須於首個 await 前同步寫入(自 get 進入至此無 await,同一 tick 內之後續呼叫才能共用);寫值與時間前檢查 `d.gen === gen`(執行中被 update 者不覆寫);新增取值類選項須同時套用 `get()` 內 2 處 return 快取值之處,並確認 `getProxy` 有把 opt 傳給 `get`.
- **預設 `useCacheWhenError=false` 之後果**: fun 失敗則 `get`／`getProxy` reject,未接 catch 之 fire-and-forget 呼叫(如 `getProxy` 不 await)會 unhandled rejection,Node v24 直接終止行程(exit 1);故 JSDoc 範例與測試中每個 promise 鏈都須接 `.catch`(當時 33 處),新增範例同.以腳本機械掃描未配對者——**此類盤點務必跑工具**(曾口頭估 15 處,漏掉自己寫的 3 處).
- 改預設或語意時,失敗路徑之既有測試要顯式補回舊旗標,另留一格驗新預設.
- 當時未動之 `importResources` 同類輪詢,已於 R-PM-SETTLE-01(D14／D21)改為共用載入中之 Promise,不再輪詢.

## domDragBarAndScroll 兩輪與改建於 domDragPointer(2026-09-22)

- 現況: `domDragBarAndScroll` 已改建於 Pointer Events 原語 `domDragPointer`(`src/domDragBarAndScroll.mjs` 之 import 與開頭說明);第一輪之 touch 事件模型(lock／unlock／isLockAlive)已不在 src,以下只留教訓與測法.
- **第一輪自引之兩個回歸(第二輪複審抓到)**: ①touchstart「已上鎖即 return」使遺失 touchend 後觸控通道永遠失效——遺失 touchend 為真實可達: 起手元素(bar 之子元素)於拖曳中被移出 DOM,其後 touchmove／touchend 只派發給已脫離之節點,不再冒泡至 bar(真瀏覽器實測);HEAD 版因無該 guard 反而會自行復原.修法: touchstart 時以 `e.touches` 驗證起手指是否仍在,不在或新落下者與起手指同 identifier(Chrome／Firefox 自 0 重用,iOS 不重用)即視為殘鎖而接手;對標 jQuery UI `_mouseDown` 之「We may have missed mouseup」先收尾再開始,split.js 與 MUI 皆直接重新定錨,無人採「忽略」.②取點退路不一致: 只有起手退至 touches,移動與放開不會,致只帶 touches 之合成事件上鎖後永不解鎖;規則: changedTouches 有內容只認它,否則 touches,無 identifier 取第一點,全無採解鎖側.
- 矩陣漏格之歸因: 「已上鎖 × touchstart」未再分起手指在與不在;終止路徑軸沒列「該來的終止沒來」;合成事件軸只對滑鼠做、未對觸控做.列狀態×事件矩陣時,終止軸須含「該來的終止沒來」,合成事件軸須對每種輸入裝置各做一次.
- 冒泡辨識不可靠「已上鎖即忽略」(identifier 重用時,冒泡上來之同一事件與殘鎖後之新觸控以 id 無從區分),改以 bar 最近收到之 touchstart 事件物件比對;不用 WeakSet(同一事件物件被重複派發會誤擋;IE11 無).
- 測試作法(wsemi 無 playwright 相依,故用假 DOM): Ele 類記錄 `addEventListener`(含 options),dispatch 逐層往上模擬冒泡,保留 `lastEvent` 供處理器拋錯時檢查,覆蓋 `globalThis.window`／`document`;測試含 ①狀態×事件全表(當時 169 格,每格斷言「事件序列|事件後狀態」,狀態以不改變狀態之探測事件讀出) ②情境案 ③固定種子亂數之不變式(press／free 成對、任何狀態下新手勢必被服務);先於舊程式取紅綠基準(207 綠／30 紅,紅者須逐一對得上預定變更)再重寫;變異測試驗強度(41 種單點缺陷攔下 40,存活者為等價變異,並抓出兩個測試不足: identifier 為 0 之多指追蹤、斷言時點不夠精準使缺陷被後續接手之 freeBar 掩蓋);真瀏覽器驗收每情境開新 page,以 CDP `DOMDebugger.getEventListeners` 查實際掛載時須扣除 Playwright 自身掛於 window 之監聽(以不建 das 之基準頁取差集).
- 移除 window／document 之 4 個空 scroll／wheel 監聽時,其成本僅有 Chrome 文件依據,本機 headless 量測未能區分,**回報時須照實說**.
- 改建於 `domDragPointer`(2026-09-22,使用端提案經 2×opus+1 家審查): 併入時修四項——eslint 7 錯;JSDoc「合成 pointermove 未帶 buttons 視為仍按住」對真 `new PointerEvent` 不成立(buttons 預設 0 → 首次 move 即 free),改寫;附錄稱「觸控筆無相容事件」錯,實測 pen 緊接 pointer 事件有相容 mouse 事件(無相容 touch),`pendings.mouseup` 改對非 touch 設定並加測試;JSDoc 補和弦多發座標相同之 drag、已按住他鍵再按主鍵無法起手、Pointer Events 支援範圍.→ JSDoc 對事件行為之主張須以真瀏覽器之真事件驗,不只合成事件.
- **並排實測再定性**(使用者糾正之後): 同一組真操作跑現行 das 與提案 das,19 情境中 14 個逐字相同(含 8 個呼叫點全部日常操作),5 個相異全為邊角且皆為修正(輕點雙發→單發、起手元素移除後當次不斷、放開被攔截即 free、右鍵放開不再誤結束、無相容事件之假 press／free);簽名、5 個 opt、4 事件、clear、export 皆不變.不要先把邊角差異升格為破壞性改動(見 `sgud/proc/process.md` 第 1 項).
- 探測手法與陷阱: CDP `Input.dispatchTouchEvent` 同時產生 pointer 與 touch 事件,`Input.dispatchMouseEvent` 可給 `pointerType:'pen'`;touch-action:none 下 Chromium 之 touchmove 為非同步派發,起手元素移除後 touch 事件全到不了 bar,pointer 事件則重新命中父層仍冒泡至 window;捲動接手只發 pointercancel 不發 touchcancel.本機 Playwright 只有 Chromium,跨引擎未驗(對標: iOS 於 touch-action:manipulation 不發 pointercancel;SortableJS 桌面 Safari 停用 pointer 模型).**流程失誤**: 改腳本路徑之 sed 接在 `&&` 鏈後,前一指令失敗即靜默未執行,之後「對 src 重跑」其實仍跑舊副本,直到副本刪除才 404 暴露——改檔後要 grep 確認,不要信 `&&` 鏈.

## domDetect 改 ResizeObserver、擴充與 toleranceBounce(2026-09-25 至 2026-09-30)

- 設計(RO 雙盒加共用 MutationObserver、輪詢退路、`RUN_MAX`、相鄰規則、延後發出之序號守門、`isRendered`、`getBase`／`getSize`／`throttle`／`refresh`)以 `src/domDetect.mjs` 之註解與 JSDoc 為準.
- **使用端抓到三個缺陷之流程缺陷**(2026-09-25~26): 改比較基準時沒同步重推方向語義;評估時已看出視窗事件方向不歸空,卻用推論說下游不受影響、沒實測使用端;知道指令在 bind 建立偵測器卻沒把「建立時點」軸與「行內」軸交叉.→ 改比較基準或狀態語意時,把所有輸出欄位(如方向)重推一遍;對下游之影響要實測不推論;列軸時把「建立時點」與其他軸交叉.
- 1.9.5 擴充之定案(兩個 opus max 獨立審,另一家因額度取消): 延後發出每事件一個 setTimeout,不用跨偵測器共用佇列(共用佇列造成長任務,且後一監聽器看不到前一監聽器 Vue 之 microtask 效果);發出前確認用只需樣式之 `isRendered`,不讀 offsetWidth(讀外框則監聽器同步寫 DOM 時 N 次強制重排);`getBase` 判定變化時若有未處理之延後發出改以 sb 比較(以小幅隨機游走之不變式抓到,兩審皆漏).**隨機不變式要小步游走於容許誤差附近**,才抓得到「回到使用端當下尺寸」類缺陷.
- 測試與驗證: 假 RO 須依瀏覽器行為(Chromium 151 對同盒再 observe 不重建觀察,照規範寫會讓「不先 unobserve」之變異存活);計時器內再排計時器者(節流後續、重拋)測試須多等一輪;Playwright 預設 `--hide-scrollbars`,驗 clientWidth 須 `ignoreDefaultArgs:['--hide-scrollbars']`;工作樹因 core.autocrlf 為 CRLF,變異腳本須先統一換行再比對;產生 runner 時路徑不可經 argv 傳(Git Bash 會把 `/tmp/...` 轉成 Windows 路徑).
- 變異存活之判讀: 先推導是否等價,等價就刪碼而不是硬補測試(曾加「新節點量測前不得判可見」旗標,變異無一失敗,推導後確認等待中重取元素時量測必為 0,屬多餘而移除);變異腳本之 mocha 逾時須大於最慢之單條測試(隨機不變式約 40 秒,曾設 30 秒,致每種變異都多一條逾時失敗,存活者被誤判為已攔下);只被單一條測試攔下者要列出是哪條並推導是否相干.
- **toleranceBounce(2026-09-30)**: 只數反向擋不住「單向+1px」與「鋸齒(+1,+1,−2)」回授(Chromium 實測提案版每秒 61 次無限長高;常見觸發: 容器有 1px 框線,監聽器以其 offsetHeight 設定撐開自身之子元素高),舊版容差本來順帶擋住這兩種;故加同向連續上限 `RUN_MAX=10` 與相鄰規則(同一元素且前後皆可見之兩次量測才比較方向,否則判定狀態歸 0),鋸齒仍不擋(JSDoc 已知限制).上限之代價實測: 160 種 CSS 高度動畫最後發出正確率舊版 106/160、新版 158/160,失準者皆為上限邊界(同向逐 px 恰於連續第 11 步結束時差 1px).變異測試抓到「隱藏→顯示不歸 0」之對稱破缺,故收斂為相鄰規則.

## dom 偵測器與 domDrag 重構(2026-09-27)

- 新增內部 `_detector`(domIsVisible／domIsStable 建於其上,create 於 microtask 啟動、派發經 evEmit、addCleanup)與公開 `domIsRendered`;`domDrag` 改為成員表以元素為鍵、單一拖曳會話(會話期間才掛視窗 capture 監聽)、輸入規則對齊 `domDragPointer`.(2026-11-02 `_optNum` 已退役,數值 opt 改 `optVal`,見 `rulebook_optval.md`.)
- **非顯而易見**: 使用端宿主可能於每次重繪對每個成員 clear→init(例如樹元件於拖曳中 move 改狀態而重繪);任何「解除即取消拖曳／立即拆群組／立即刪屬性」都會讓使用端拖曳中斷——須以「元素是否仍為成員」惰性判定,群組拆除與屬性移除延後一個 microtask.三個審查者中兩位與我方獨立找到,另一位反而建議立即取消.
- 滑鼠 buttons 自癒只看 isTrusted 事件(合成 MouseEvent 之 buttons 預設 0);blur 不可掛 capture(會收到輸入框 blur).
- 驗法: 探測「舊版」基準用 `git -C <repo> archive HEAD src | tar -x -C <暫存夾>/head` 取全套,勿讓量測副本引用已改版之 src(曾被污染);使用端回歸以使用端之 webpack(`createRequire` 自其 node_modules)打包其 e2e 入口,別名 `wsemi/src` 指本 repo src(或 HEAD),複製其 e2e 測試只改 import,使用端 repo 唯讀.
- 已知未修(現況已核): `domIsStable` 等待中之動畫被暫停則該輪於其恢復或取消前不結束(`src/domIsStable.mjs` JSDoc 已載);非 Chromium 之觸控相容滑鼠事件以 800ms 時間窗判定(`src/domDrag.mjs` 之 `COMPAT_MOUSE_MS`).

## domIsStable 誤判修正(2026-09-14)

- 決策已入 `src/domIsStable.mjs` 註解(子樹內無限循環動畫〔spinner〕不納入判定也不等待;已結束但 fill:forwards 仍被 getAnimations 回傳者不計);這兩點建議書沒列,由實測補出: 修改前 spinner 實測 2.5 秒不 resolve、fill:forwards 者實測永遠 false.建議書說「要負載才踩到」寫太窄: 1× 無負載約一成會踩到,20× 節流達五成.
- 真瀏覽器驗證 dom* 函數不必 bundler: Playwright `page.route` 把一個假網址對到專案檔,import map 對 lodash-es 前綴,eventemitter3 之 CJS index.js 包成虛擬 ES module(其 index.mjs 在瀏覽器不能用);Playwright 借用他套件之 node_modules(wsemi 不裝).單元測試用 class 實例當假元素即可通過 `isEle`(lodash isElement 只要 nodeType 1 且非 plain object).

## isEmail 重寫(2026-09-15)

- 規則(RFC 5322 dot-atom 之 local、頂級網域 2 碼以上純字母或 `xn--`、全長 ≤254、local ≤64、不支援引號 local／Unicode／IP／無頂級網域)以 `src/isEmail.mjs` 註解為準.起因: 使用端 e2e 發現含 `+` 或 4 碼以上頂級網域之位址被擋存;IANA 2026-09 有 1438 個頂級網域,974 個 4 碼以上,舊正則全拒.流程: Opus 先審,另一家複審後直接修;複審補出兩點(候選正則 `xn--` 之後允許結尾連字號為非法標籤;`xn--` 只收小寫而網域不分大小寫).
- **審正則除了誤拒,一併跑回溯測試**: 舊正則 `\w+([\.-]?\w+)*` 分隔符可省略而指數回溯(`'abc@'` 加 30 個字母 4 秒,60 個算不完),使用端把檢查放 computed 逐列重算,一列壞值就卡頁;新正則各量詞間有必要分隔符,10 萬碼 0ms.
- 驗證法: 用 IANA 頂級網域清單(`tlds-alpha-by-domain.txt`)全量跑一遍,並對 validator.js 做差分模糊測試(只剩畸形 xn 差異為刻意);刻意收緊三處: 網域底線、數字頂級網域、標籤超過 63 碼.

## isblob 收 File 與 UMD 之 diff2html 判定(2026-09-18)

- **isblob**: File 之標籤為 `[object File]`,原 isblob 只認 `[object Blob]`;2026-09-09 把 isblob 輸入檢查加進 blob2ab／blob2b64／blob2str 後,由 input type=file 取得之 File 全被拒,波及 blob2u8arr、blobs2u8arrs、blobs2b64s、files2data、domShowInputAndGetFilesU8Arrs,`getBufferSize` 對 File 靜默回 null.**教訓**: 加輸入檢查時要列該函數之真實輸入型別(JSDoc 本就寫 Blob|File);判定函數之測試必須有 true 案例(原 47 案全 false,回歸沒被抓到).Node 18 有 Blob、20 有 File,可在 Node 下測.`isfile` 維持嚴格.
- **`_getDiff2Html`**: 建議書說 diff2html 被 external 是錯的(已打包);真因是以 `Object.prototype.toString` 為 `[object Module]` 判定,bundler interop 之 namespace 為無原型純物件(標籤 `[object Object]`)而誤判,UMD 於 Node 與瀏覽器皆拋錯.改為探測 html 函數(同 `_getHtmlToText` 之作法),加 mod 參數供測試注入.→ 判定模組物件用「探測所需成員」,不用標籤.
- 驗 UMD 行為: 複製 `toolg/gDistRollup.mjs` 之設定把輸出夾改 `./tmp/dist_chk` 自行編譯,不動 `./dist`;瀏覽器端用 Playwright `addScriptTag` 載入;檔案選擇器用 `page.waitForEvent('filechooser')` 餵真檔.
- 測 UMD(CJS) bundle 時 `import('...?t=')` 破不了 require cache,要新鮮實例須複製成新檔名;對可能已 dead 之實例呼叫一律包 settle,否則 top-level await 之拒絕會讓腳本安靜 exit 0(2026-09-07 核對 w-package-tools 1.1.16 之 `rollupWorkerCore` 時得: 該版只改注入 worker 打包產物之樣板,wsemi 自身建置不經過它,升版零影響).
