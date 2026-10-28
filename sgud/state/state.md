# 狀態

本檔記 wsemi 各功能之**現況**(做到哪裡、對應之規則帳本條目與測試檔、已知缺口與待辦、最近一次驗證之版本);只記現況、不寫過程(過程見 `sgud/exp/experience.md`).

本檔 2026-10-28 新建;此前各功能之現況未逐一盤點入檔,以 `sgud/rule/rulebook.md` 各條目之「站點全集」「測試」「已知限制」「變更紀錄」為準.之後完成一項功能或結束一輪工作時於此增列或更新.

## 帶期望雜湊之下載 `fsDownloadFileVerify`(R-DL-VERIFY-01)

- 現況: 已實作(2026-10-28,wsemi-run01;package.json version 1.9.25 之工作樹,未發布).`src/fsDownloadFileVerify.mjs`(對外,傳入 Node 內建 fs、crypto、Readable、pipeline)、`src/fsDownloadFileVerifyCore.mjs`(主體,fs/fetch 可由呼叫端傳入);`src/index.mjs` 已含兩個匯出.
- 規則: `sgud/rule/rulebook.md` R-DL-VERIFY-01(含站點全集: 自有套件中下載執行檔/二進位資產之站點).
- 測試: `test/fsDownloadFileVerify.test.mjs`(本機 HTTP 服務 127.0.0.1:8802–8804、不連外網;夾具 `test/_tmp/fsDownloadFileVerify/`,after 刪除)、子行程工具 `test/tools/dlVerifyChild.mjs`.指令: `npx mocha --no-parallel test/fsDownloadFileVerify.test.mjs --timeout 180000`.
- 既有函數: `fsDownloadFile`、`fsDownloadFileCore` 未改(行為不變).
- 待辦(他套件,不在 wsemi): 第 3 波由 w-mousekey、w-dwload-dlp、w-ffmpeg 改用(建議呼叫方式見主控任務 20261028054319 之 `agent-out/wsemi-run01-修正報告.md`〈三套件改用建議〉);盤點另見 6 個套件以 `fsDownloadFile` 下載 exe 不驗、3 個 w-scan-* 套件下載 GitHub 最新 release 工具未見雜湊驗證(R-DL-VERIFY-01 站點全集),未排入.
- 驗證(wsemi-run03,2026-10-28 最終碼): 122 案(run01 之 84 + run02 補 16 + run03 補 22);變異 129 項 128 紅、1 項等價存活(`close()` 內 `abort()`,見 R-DL-VERIFY-01〈測試數與變異〉).
- 外審: **run02 之最終碼已於 run03 經 terra(`gpt-6.1-terra`/max)完整第三方複核**(2026-10-28 10:57–11:20,新問題 24 條 H1–H24 逐條核對: 屬實 21、部分屬實 3〔H3、H6、H10〕、誤報 0,其中修程式 16〔H1–H16〕、補測試 8〔H17–H24;H22 原碼已會刪鍵,屬 run02「等價變異」之誤判〕;另依處置表逐條核對駁回 F3、F5 窗口、F25、P4、Q2、Q3、R1 等,理由見 R-DL-VERIFY-01〈已知限制〉).run03 修正後之碼**未再經第三方複核**(terra 單輪;修正均有紅測試與變異).
- 已知限制: 見 R-DL-VERIFY-01〈已知限制〉.
