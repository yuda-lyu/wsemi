# 狀態

本檔記 wsemi 各功能之**現況**(做到哪裡、對應之規則帳本條目與測試檔、已知缺口與待辦、最近一次驗證之版本);只記現況、不寫過程(過程見 `sgud/exp/experience.md`).

本檔 2026-10-28 新建;此前各功能之現況未逐一盤點入檔,以 `sgud/rule/rulebook.md` 各條目之「站點全集」「測試」「已知限制」「變更紀錄」為準.之後完成一項功能或結束一輪工作時於此增列或更新.

## 帶期望雜湊之下載 `fsDownloadFileVerify`(R-DL-VERIFY-01)

- 現況: 已發布於 wsemi 1.9.26(2026-10-28,wsemi-run01~run03 實作與修正).`src/fsDownloadFileVerify.mjs`(對外,傳入 Node 內建 fs、crypto、Readable、pipeline)、`src/fsDownloadFileVerifyCore.mjs`(主體,fs/fetch 可由呼叫端傳入);`src/index.mjs` 已含兩個匯出.
- 規則: `sgud/rule/rulebook.md` R-DL-VERIFY-01(含站點全集: 自有套件中下載執行檔/二進位資產之站點).
- 測試: `test/fsDownloadFileVerify.test.mjs`(本機 HTTP 服務 127.0.0.1:8802–8804、不連外網;夾具 `test/_tmp/fsDownloadFileVerify/`,after 刪除)、子行程工具 `test/tools/dlVerifyChild.mjs`.指令: `npx mocha --no-parallel test/fsDownloadFileVerify.test.mjs --timeout 180000`.
- 既有函數: `fsDownloadFile`、`fsDownloadFileCore` 未改(行為不變).
- 待辦(他套件,不在 wsemi): 第 3 波由 w-mousekey、w-dwload-dlp、w-ffmpeg 改用(建議呼叫方式見主控任務 20261028054319 之 `agent-out/wsemi-run01-修正報告.md`〈三套件改用建議〉);盤點另見 6 個套件以 `fsDownloadFile` 下載 exe 不驗、3 個 w-scan-* 套件下載 GitHub 最新 release 工具未見雜湊驗證(R-DL-VERIFY-01 站點全集),未排入.
- 驗證(wsemi-run03,2026-10-28 最終碼): 122 案(run01 之 84 + run02 補 16 + run03 補 22);變異 129 項 128 紅、1 項等價存活(`close()` 內 `abort()`,見 R-DL-VERIFY-01〈測試數與變異〉).
- 外審: **run02 之最終碼已於 run03 經 terra(`gpt-6.1-terra`/max)完整第三方複核**(2026-10-28 10:57–11:20,新問題 24 條 H1–H24 逐條核對: 屬實 21、部分屬實 3〔H3、H6、H10〕、誤報 0,其中修程式 16〔H1–H16〕、補測試 8〔H17–H24;H22 原碼已會刪鍵,屬 run02「等價變異」之誤判〕;另依處置表逐條核對駁回 F3、F5 窗口、F25、P4、Q2、Q3、R1 等,理由見 R-DL-VERIFY-01〈已知限制〉).run03 修正後之碼**未再經第三方複核**(terra 單輪;修正均有紅測試與變異).
- 已知限制: 見 R-DL-VERIFY-01〈已知限制〉.

## 外部執行檔之取得 `fsEnsureBins` 與清單項產生 `fsGetBinManifestEntry`(R-BIN-ENSURE-01)

- 現況: 已實作(2026-10-28,wsemi-run04;package.json version 1.9.26 之工作樹,未發布).`src/fsEnsureBinsCore.mjs`(主體)、`src/fsEnsureBins.mjs`(對外,傳入 Node 內建模組與 process.env)、`src/fsGetBinManifestEntry.mjs`(依實檔產生清單項);`src/index.mjs` 已含三個匯出.規格為主控之制式規格 `外部執行檔之存放下載校驗與離線.md`(dspec)§3~§6.
- 規則: `sgud/rule/rulebook.md` R-BIN-ENSURE-01.
- 測試: `test/fsEnsureBins.test.mjs`(本機 HTTP 127.0.0.1:8811/8812、不連外網、真 tar.exe)、`test/fsGetBinManifestEntry.test.mjs`;工具 `test/tools/zipStore.mjs`、`test/tools/ensureBinsChild.mjs`.最終碼 155 passing、1 pending(符號連結權限).
- 驗證(wsemi-run04,2026-10-28 最終碼): 外審 terra 兩輪(第 1 輪 24 條、第 2 輪 18 條,屬實 37、部分屬實 5、誤報 0);修前紅與變異見主控任務 20261028054319 `agent-out/wsemi-run04-修正報告.md` §4、§5.第 2 輪之修正未再經第三方複核.
- 待辦(他套件,不在 wsemi): 16 套件依規格 §9 推行順序改用(範本見主控任務 20261028054319 `agent-out/wsemi-run04-修正報告.md`〈各套件改用之範本〉).規格之矛盾與遺漏待主控裁定(同報告〈規格回饋〉),裁定後本函數可能需調整.
- 已知限制: 見 R-BIN-ENSURE-01〈已知限制〉.
