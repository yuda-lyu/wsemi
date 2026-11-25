# 狀態(測試)

本檔自 `sgud/state/state.md` 之索引分出(2026-11-02 ws265 新增類型): 測試檔結構與全套穩定性之現況;索引見 `sgud/state/state.md`.

## 真瀏覽器行為測試之基建(R-TEST-BROWSER-01;排程第 642 項;主控任務 20261125225421 t642,2026-11-25;package.json version 1.9.77 之工作樹,未提交未發布)

- 現況(已實作): `devDependencies` 新增 `playwright-core`(精確版 `1.65.1`,同 w-playwright 所依);`test/tools/browserKit.mjs`(`launchBrowser`、`installBrowser`、`openPage`、`analyzePic`)、`test/tools/snapdomFailStub.mjs`;首個使用者 `test/domConvertToPic.test.mjs`(29 案).頁面以 `page.route` 虛擬主機載入本庫 `src` 與相依(import map),不依賴 `./dist`、不開埠、不連網;瀏覽器已安裝者直接啟動,缺才以 playwright-core 之 CLI 安裝(並行由 Playwright 之 `__dirlock` 序列化,逾 10 分鐘結束子行程樹並拋錯);取不到即拋錯(不 skip).斷言為行為量測(尺寸、區塊平均色、非白像素數、像素雜湊),不比標準圖.環境變數 `WSEMI_DOMCONVERTTOPIC_SRC` 取代被測檔,供修前紅與變異驗證.
- 限制: wsemi 為 Level 3,不得依賴 w-playwright(Level 3)與 w-package-tools-e2e(Level 4),故自建最小版,與 w-playwright 之安裝邏輯重複一份(見 `sgud/feedback/feedback.md`).
- 已知缺口與待辦: 首次取得瀏覽器須連網(Playwright CDN);離線環境預先安裝或設 `PLAYWRIGHT_BROWSERS_PATH`;其他函數之真瀏覽器測試(如 `domShowImages`、`domTooltip`)尚未補,可沿用本基建.
- 規則: `sgud/rule/rulebook_test.md` R-TEST-BROWSER-01.

## 全套案數一致與測試檔結構(R-TEST-STRUCT-01;排程第 254 項;主控任務 20261102014123 ws265,2026-11-02;package.json version 1.9.40 之工作樹,未提交未發布)

- 現況(已實作): 全套 `npm test` 之通過數不再隨 `mocha --parallel` 之檔案分派而異.成因: `test/blob2b64.test.mjs` 被 6 個測試檔 `import { getRes }`,ESM 快取使其頂層 `describe` 於各 worker 第一次載入時註冊,案數 = 25 + 3×(分到該批檔案之 worker 數 − 1)(7 檔 `--jobs N` 修前實測 25/28/…/43,修後恆 25).修正: `getRes` 移至 `test/tools/resKit.mjs`,7 個檔改 import 之;新增 `test/testStructure.test.mjs` 靜態釘住「測試檔互不 import、工具檔頂層不註冊 describe／it／hook」.規則 4: 測試不得把行程層全域(`Error.prepareStackTrace` 等)留在被改過之狀態(`getUserAgentUmd.test.mjs` 之打包曾污染同 worker 之 `maskDiagErr` capi #14,已修).
- 規則: `sgud/rule/rulebook_test.md` R-TEST-STRUCT-01(僅測試目錄,無對外行為變更).
- 測試: `test/testStructure.test.mjs`(4 案,變異 6/6 擊殺);`test/tools/resKit.mjs`.
- 驗證(2026-11-02 最終碼): 全套連跑 3 次皆 **23011 passing／6 pending／0 failing**(exit 0),各次 ✔ 行 23011、相異案名 10795,案名多重集合相同(僅 24 個標題含執行當下時間戳或 AES 密文者每次不同,標題非確定);較移除 *Dyn 後之 22907 多 104 案 = 新增 107(`fsWatchFolder` 5、`getUserAgentUmd` 9、`testStructure` 4、`fsInvalidPath` 89)減 `blob2b64` 之 3 案重複註冊 1 次(22907 為該 3 案註冊 2 次之一次).首次最終碼全套連跑 3 次中 2 次紅(`maskDiagErr` capi #14,上述污染),修後 3 次全綠.
- 待辦: 無.
