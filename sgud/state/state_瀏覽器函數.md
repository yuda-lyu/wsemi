# 狀態(瀏覽器函數:開分頁與彈窗訊息)

本檔 2026-11-12(ws430)新建(`state_dom與資料.md` 已約 29.8KB,依全域設定§14 另開類型檔);索引見 `sgud/state/state.md`.新增之現況附於本檔最前.

## `domDragPreview`: 拷貝補回 canvas 與單選 select、複本補正單一出處(排程第 647 項;主控任務 20261127030143 wsr1,2026-11-27;package.json version 1.9.81 之工作樹,未提交未發布)

- **核實(真 Chromium)**: 修前預覽之拷貝 canvas 為空白 `[0,0,0,0]`、單選 select 回第 0 項——屬實;同名無表單之 radio 原件勾選不被取消(拷貝原即移除 name)——不屬實.
- **已改**(R-DOMPIC-01〈站點全集與判準〉;破壞性變更第 84 項⑤): `listAll`／`copyCanvas`／`copySelect`／`isolateRadio` 自 `domConvertToPic.mjs` 逐字搬至內部檔 `src/_domCloneFix.mjs`(`isolateRadio` 帶前綴參數,`domConvertToPic` 名稱不變);`domDragPreview` 之 `cloneNode` 後呼叫 `copyCanvas`、`copySelect`;radio 之處理不變.
- **測試**: `test/domDragPreviewBrowser.test.mjs`(5 案;修前 2 failing,修後 5 passing);`test/domConvertToPic.test.mjs`、`test/domDragPreview.test.mjs`(假 DOM)回歸綠;變異 M14～M17 皆被殺.

## `domConvertToPic`: canvas 內容、壞圖首次呼叫輸出高度、select 選取、單選鈕副作用、殘留節點(排程第 642 項;主控任務 20261125225421 t642,2026-11-25;package.json version 1.9.77 之工作樹,未提交未發布)

- 背景: snapdom 3.7.6→3.8.0 升版冒煙(升版已完成,依賴為 `^3.8.0`)時發現兩缺陷,且本函數之測試原為空殼(`import` 被註解、只斷言 `1 === 1`)而升版無任何自動化保護.
- 現況(已實作): 複製後補回 `cloneNode` 不帶走之 canvas 位圖與單選 select 之選取(`copyCanvas`、`copySelect`);複本內有名稱之 radio 改用本次呼叫專用之名稱(`isolateRadio`,修掉修前即有之「同名無表單之原件勾選被取消」);放入頁面後等複本 `<img>` 載入或失敗再截圖(`waitImg`,上限 5000 ms,只等 `complete === false` 者)、複本內 lazy 圖改 eager(`loadImgNow`);截圖成功或失敗皆移除放入之節點(`try/finally`).JSDoc 載明作法、複本之處理與限制.成因與實證見帳本 `rulebook_browser.md` R-DOMPIC-01(含「原元素直交 snapdom 對經本函數」之並排與「57／82 方向相反」之更正).
- 測試: `test/domConvertToPic.test.mjs` 29 案(真 Chromium,基建 `test/tools/browserKit.mjs`、`snapdomFailStub.mjs`,見 `state_測試.md`).修前紅、變異、連跑、全套數字見該輪報告與帳本 R-DOMPIC-01〈測試〉.
- 已知缺口與待辦: ①元素內之捲動位置(`scrollTop`／`scrollLeft`)不帶入複本(原元素直交 snapdom 會呈現捲動後位置)——**未修**,修正會改變下游現有輸出,待主控裁示;②輸出尺寸含元素外距(既有行為,已載於 JSDoc 並以測試鎖定);③`domDragPreview` 亦以 `cloneNode` 作拖曳預覽,同樣不帶 canvas 位圖——屬預覽非截圖,未納入;④下游 w-ui-dwload、w-geo-vue 之接線測試只評估、未改(見報告);⑤`<svg>` 內之 `<image>`、CSS 背景圖之載入等待未處理(只處理 HTML `<img>`).

## 規格第 199 項 C18:`browserView` 系、`openLink`、`domAlert`(排程第 430 項第一批;主控任務 20261112220545 ws430,2026-11-12;package.json version 1.9.58 之工作樹,未提交未發布)

- 背景: 使用者 2026-11-12 對 C18 之裁示(dspec〈輸入參數之檢測機制〉§11 Q1-g:`openLink` 非字串或空字串拋錯、不設協定白名單、無 `document` 拋錯、C4／C5 文件;`domAlert` D1～D7 依主控建議;`browserView` 系 ①無效即拋錯 ②開不成即拋錯並延遲釋放 ③可執行腳本之類型行為不改、文件載明責任).
- 現況(已套): `browserView`、`browserViewFromText`、`browserViewFromBlob`、`browserViewFromU8arr` 無效即同步拋錯(先於建 Blob 與開分頁)、開不成即拋錯、開啟後 60 秒 `revokeObjectURL`、JSDoc 範例修正;`openLink` 無效與無 `document`／`document.body` 拋錯,JSDoc 載明真 Chromium 實測之各協定行為與「須於使用者操作之事件中呼叫」;`domAlert` D1～D7 全部已套(✕ 與移入移出以 `addEventListener` 綁定,全域 `ttWAlert*` 與行內事件已移除;外觀並排像素差 0).
- 帳本: `rulebook_browser.md` R-BROWSER-OPEN-01、R-DOMALERT-01;破壞性變更 `rulebook_breaking_65on.md` 第 65 項.
- 品牌判定之單一擁有者: `src/_browserData.mjs`(內部模組;原始字串、Blob、可用之 ArrayBuffer／檢視、Uint8Array 以內部槽判定,不採可偽裝之標籤;外審 terra 後改定).
- 測試: `test/browserView.test.mjs`(18)、`test/_browserData.test.mjs`(4)、`test/browserViewFromText.test.mjs`(4)、`test/browserViewFromBlob.test.mjs`(5)、`test/browserViewFromU8arr.test.mjs`(5)、`test/openLink.test.mjs`(6)、`test/domAlert.test.mjs`(26);共用假環境 `test/tools/browserFakeKit.mjs`.真 Chromium 驗證不納入本套件測試(證據在 ws430 報告).
- 已知缺口與待辦: `window.open` 被攔截回 `null` 之路徑未能以真瀏覽器重現(本機只有 headless shell,不攔彈窗),只有單元測試;Node 之 Blob 以屬性判定,Proxy 包裝之真 Blob 於 Node 會通過品牌檢查(瀏覽器拒收;本系列只在瀏覽器執行);`domAlert` 之 msg 之 HTML 解析限於內容容器(未閉合標籤不再吞入關閉按鈕)屬 D7 之附帶差異,待確認;`domAlert` 有效 msg 而無 document 時同步拋錯為既有行為;`browserView` 之新分頁 `window.opener` 指向本頁(行為不改,JSDoc 已載);`domAlert` 之 `closeIconShift` 部分給鍵採「同軸互斥」解讀(待主控／使用者確認);下游 w-ui-dwload `opt.browserViewTypes` 之 JSDoc 由主控另行處理.
