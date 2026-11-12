# 狀態(瀏覽器函數:開分頁與彈窗訊息)

本檔 2026-11-12(ws430)新建(`state_dom與資料.md` 已約 29.8KB,依全域設定§14 另開類型檔);索引見 `sgud/state/state.md`.新增之現況附於本檔最前.

## 規格第 199 項 C18:`browserView` 系、`openLink`、`domAlert`(排程第 430 項第一批;主控任務 20261112220545 ws430,2026-11-12;package.json version 1.9.58 之工作樹,未提交未發布)

- 背景: 使用者 2026-11-12 對 C18 之裁示(dspec〈輸入參數之檢測機制〉§11 Q1-g:`openLink` 非字串或空字串拋錯、不設協定白名單、無 `document` 拋錯、C4／C5 文件;`domAlert` D1～D7 依主控建議;`browserView` 系 ①無效即拋錯 ②開不成即拋錯並延遲釋放 ③可執行腳本之類型行為不改、文件載明責任).
- 現況(已套): `browserView`、`browserViewFromText`、`browserViewFromBlob`、`browserViewFromU8arr` 無效即同步拋錯(先於建 Blob 與開分頁)、開不成即拋錯、開啟後 60 秒 `revokeObjectURL`、JSDoc 範例修正;`openLink` 無效與無 `document`／`document.body` 拋錯,JSDoc 載明真 Chromium 實測之各協定行為與「須於使用者操作之事件中呼叫」;`domAlert` D1～D7 全部已套(✕ 與移入移出以 `addEventListener` 綁定,全域 `ttWAlert*` 與行內事件已移除;外觀並排像素差 0).
- 帳本: `rulebook_browser.md` R-BROWSER-OPEN-01、R-DOMALERT-01;破壞性變更 `rulebook_breaking_65on.md` 第 65 項.
- 品牌判定之單一擁有者: `src/_browserData.mjs`(內部模組;原始字串、Blob、可用之 ArrayBuffer／檢視、Uint8Array 以內部槽判定,不採可偽裝之標籤;外審 terra 後改定).
- 測試: `test/browserView.test.mjs`(18)、`test/_browserData.test.mjs`(4)、`test/browserViewFromText.test.mjs`(4)、`test/browserViewFromBlob.test.mjs`(5)、`test/browserViewFromU8arr.test.mjs`(5)、`test/openLink.test.mjs`(6)、`test/domAlert.test.mjs`(26);共用假環境 `test/tools/browserFakeKit.mjs`.真 Chromium 驗證不納入本套件測試(證據在 ws430 報告).
- 已知缺口與待辦: `window.open` 被攔截回 `null` 之路徑未能以真瀏覽器重現(本機只有 headless shell,不攔彈窗),只有單元測試;Node 之 Blob 以屬性判定,Proxy 包裝之真 Blob 於 Node 會通過品牌檢查(瀏覽器拒收;本系列只在瀏覽器執行);`domAlert` 之 msg 之 HTML 解析限於內容容器(未閉合標籤不再吞入關閉按鈕)屬 D7 之附帶差異,待確認;`domAlert` 有效 msg 而無 document 時同步拋錯為既有行為;`browserView` 之新分頁 `window.opener` 指向本頁(行為不改,JSDoc 已載);`domAlert` 之 `closeIconShift` 部分給鍵採「同軸互斥」解讀(待主控／使用者確認);下游 w-ui-dwload `opt.browserViewTypes` 之 JSDoc 由主控另行處理.
