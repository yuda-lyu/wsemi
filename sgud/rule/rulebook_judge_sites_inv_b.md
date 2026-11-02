# 規則帳本(判斷類站點全集——§6 一般數值運算、§7 不符合、實作時須先處理之耦合與缺陷)

本檔自 `sgud/rule/rulebook_judge_sites.md` 抽出(2026-11-02 整理,ws272c,全域設定 §14):§6、§7 與〈實作時須先處理之耦合與缺陷〉逐字搬移、節號與標題不變;風險代號(〈共通說明〉)與各檔索引見 `sgud/rule/rulebook_judge_sites.md`.

## 6 一般數值運算(88)

| 檔:行 | 現行判定 | 值之用途 | 建議 | 行為變化風險 | 狀態 |
|---|---|---|---|---|---|
| src/addMonth.mjs:29 | `isint(n)` | dayjs `add(n, 'months')` 之月數 | `iseint(n)`(安全整數;極大值 dayjs 為 Invalid Date,可另加 min / max) | R-INT;Infinity 現通過→輸出 'Invalid Date' 字串,改後回 '' | 建議改 |
| src/arrAccum.mjs:31 | `isnum(v)` | 累加:`vv += cdbl(v)` 先累加,再依判定 push 累加值或 '' | `isenum(v)`,**並把累加移入判定之內** | R-NUM;若只換判定,Infinity 元素仍經 cdbl 以 MAX_VALUE 污染其後累加和 | 待確認(須調整順序) |
| src/arrAdd.mjs:26 | `isnum(v1[k])` | 逐元素相加(無效視為缺值) | `isenum(v1[k])` | R-NUM;Infinity 元素現以 MAX_VALUE 加入,改後當缺值略過 | 建議改 |
| src/arrAdd.mjs:27 | `isnum(v2[k])` | 同上 | `isenum(v2[k])` | 同上 | 建議改 |
| src/arrMulti.mjs:26 | `isnum(v1[k])` | 逐元素相乘 | `isenum(v1[k])` | 同上(MAX_VALUE 參與乘積) | 建議改 |
| src/arrMulti.mjs:27 | `isnum(v2[k])` | 同上 | `isenum(v2[k])` | 同上 | 建議改 |
| src/arrMax.mjs:110 | `isnum(vNow)` → cdbl | 取最大值之比較 | `isenum(vNow)` | R-NUM;Infinity 元素現以 MAX_VALUE 參與比較,改後略過 | 建議改 |
| src/arrMin.mjs:110 | `isnum(vNow)` → cdbl | 取最小值之比較 | `isenum(vNow)` | 同上 | 建議改 |
| src/arrNorm.mjs:36 | `isnum(r)`(r 為 `arrProduct(vec, vec)` 自算結果) | `Math.sqrt(r)` | `isenum(r)` | 僅 r 溢位成 Infinity 時有別:現→sqrt(MAX_VALUE),改後 null | 建議改 |
| src/arrSort.mjs:24 | `isnum(v)` | 排序分類:數字依 cdbl 數值排序,其餘放最末 | `isenum(v)` | R-NUM;Infinity / '0x10' 現列入數字排序(Infinity→MAX_VALUE 排最後端),改後落入字串或最末組;牽涉已裁示之「無法轉數字者放最末」邊界 | 待確認 |
| src/arrSort.mjs:55 | `vst.every((t) => isnum(t))` | 字串全可轉數字時依數值排序 | `isenum(t)` | 同上 | 待確認 |
| src/arrFilterByNum.mjs:40 | `filter(arr, isnum)`(回調型,非呼叫式) | 過濾保留數字再 cdbl | `filter(arr, (v) => isenum(v))`(**不可**直接傳 `isenum`,filter 會把 index 當 opt 而拋錯) | R-NUM;Infinity 元素現以 MAX_VALUE 保留,改後濾除 | 建議改 |
| src/arrGroupByMaxmin.mjs:495 | `isnum(value)` → cdbl | 分組比較值 | `isenum(value)` | R-NUM | 建議改 |
| src/arrGroupByMaxmin.mjs:499 | `isnum(v)` → cdbl | 元素本身作比較值 | `isenum(v)` | R-NUM | 建議改 |
| src/arrGroupByMaxmin.mjs:517 | `isnum(rmax) && isnum(rmin)` → cdbl | 區間上下界(`>= / <=` 比較) | `isenum(rmax) && isenum(rmin)` | R-NUM;以 ±Infinity 表開放區間者(經 cdbl→±MAX_VALUE 仍可比)改後該區間被略過 | 待確認(呼叫端有無以 Infinity 作開放界) |
| src/arrLookupByMaxmin.mjs:611 | `isnum(value)` → cdbl | 查表比較值 | `isenum(value)` | R-NUM | 建議改 |
| src/arrLookupByMaxmin.mjs:628 | `isnum(rmax) && isnum(rmin)` → cdbl | 區間上下界 | `isenum(rmax) && isenum(rmin)` | 同 arrGroupByMaxmin:517 | 待確認 |
| src/asind.mjs:45 | `isnum(v)` → Math.asin | 反正弦輸入 | `isenum(v)`(不建議加 min / max:超出 [-1,1] 現回 NaN,加了會變 null) | R-NUM | 建議改 |
| src/atand.mjs:57 | `isnum(v)` → Math.atan | 反正切輸入 | 保留 isnum | **JSDoc 範例明列 `atand(Infinity)`、`atand(-Infinity)` => ±90**,依賴 Infinity 經 cdbl→MAX_VALUE;改後回 null | 建議保留 |
| src/atan2d.mjs:58 | `isnum(x)` | atan2 輸入 | 保留 isnum | JSDoc 範例含 `atan2d(1, Infinity)`、`atan2d(1, -Infinity)` | 建議保留 |
| src/atan2d.mjs:62 | `isnum(y)` | atan2 輸入 | 保留 isnum | 同上 | 建議保留 |
| src/cosd.mjs:75 | `isnum(deg)` | 角度(度)輸入 | `isenum(deg)` | R-NUM;Infinity 現→cos(MAX_VALUE × π / 180) 得無意義值,改後 null | 建議改 |
| src/cotd.mjs:76 | `isnum(deg)` | 角度輸入 | `isenum(deg)` | 同上 | 建議改 |
| src/cscd.mjs:76 | `isnum(deg)` | 角度輸入 | `isenum(deg)` | 同上 | 建議改 |
| src/secd.mjs:76 | `isnum(deg)` | 角度輸入 | `isenum(deg)` | 同上 | 建議改 |
| src/sind.mjs:75 | `isnum(deg)` | 角度輸入 | `isenum(deg)` | 同上 | 建議改 |
| src/tand.mjs:75 | `isnum(deg)` | 角度輸入 | `isenum(deg)` | 同上 | 建議改 |
| src/bufWrite.mjs:40 | `isnum(value)` → cdbl | 待編碼寫入之 IEEE754 數值 | `isenum(value)` | R-NUM;現 Infinity 被 cdbl 轉 MAX_VALUE 後編碼(後方 `value === Infinity` 與 NaN 分支因此為死碼);改後 Infinity 回 null | 待確認(IEEE754 寫入是否要支援 ±Infinity / NaN,現行實質不支援) |
| src/cdbl.mjs:22 | `isnum(v)` → toFinite | 轉換函數本身 | 保留 isnum | cdbl 為 isnum 域之轉換契約(Infinity→MAX_VALUE),全庫約 60 處站點依賴,isint / ispint / cint 皆建於其上 | 建議保留 |
| src/cint.mjs:99 | `isnum(v)` → cdbl → round | 轉換函數本身 | 保留 isnum | cint JSDoc 與 useClampSafe / useLimitSafe 明列 Infinity 之處置(鉗制或錯誤),改後語意消失 | 建議保留 |
| src/cfilesize.mjs:36 | `isnum(b)` → cdbl | 位元組數換算單位字串 | `isenum(b)`(不加 nonnegative,負值現有輸出) | R-NUM;Infinity 現→MAX_VALUE→很大單位字串,改後 '' | 建議改 |
| src/color.mjs:252 | `isnum(cc)`(去 % 後) | 顏色分量(除 100 後驗 0~1) | `isenum(cc)` | R-NUM;Infinity 現→`value > 1` 錯誤,改後 `value is not a number` 錯誤(同為 throw,訊息變) | 建議改 |
| src/color.mjs:258 | `isnum(cc)` | 顏色分量(除 defValue) | `isenum(cc)` | 同上 | 建議改 |
| src/color.mjs:274 | `isnum(cc)` | 0~1 分量 | `isenum(cc)` | 同上 | 建議改 |
| src/domConvertToPic.mjs:41 | `isnum(scale)` → cdbl,<1 則 reject | 放大倍率 | `isenum(scale)`(不加 min:1,否則 <1 由 reject 變預設 1) | R-NUM;Infinity 現→MAX_VALUE→畫布失敗,改後回預設 1 | 建議改 |
| src/domDetect.mjs:97 | `isnum(v) ? cdbl(v) : null` | 元素尺寸屬性值 | `isenum(v)` | 瀏覽器尺寸屬性為有限數,無實質差異 | 建議改(低價值) |
| src/domFadeIn.mjs:51 | `isnum(ele.style.opacity)` → cdbl | 元素現行不透明度作漸變起點 | `isenum(ele.style.opacity)` | style.opacity 為 '' 或有限數字字串,無實質差異 | 建議改(低價值) |
| src/domFadeOut.mjs:51 | 同上 | 同上 | 同上 | 同上 | 建議改(低價值) |
| src/domShowImages.mjs:92 | `isp0int(disTouchMoveToHide)` → cint | 觸控移動超過幾 px 即隱藏 | `iseint(disTouchMoveToHide, { min: 0 })` | R-INT;Infinity 現=永不因移動隱藏,改後回預設 4 | 建議改 |
| src/domShowInputAndGetFiles.mjs:115 | `isnum(sizeMbLimit)` → cdbl | 檔案大小上限 MB(與檔案大小比較) | `isenum(sizeMbLimit)`(或加 `use: 'positive'`) | R-NUM;**反向**:Infinity 現→MAX_VALUE=不限,改後回預設 1000MB;加 positive 則 0 / 負數由現收(全拒)改回預設 | 待確認(Infinity=不限之用法) |
| src/domShowInputAndGetFilesU8Arrs.mjs:49 | `isnum(sizeMbLimit)` → cdbl | 同上,轉交 domShowInputAndGetFiles | 同上 | 同上 | 待確認 |
| src/domTooltip.mjs:74 | `isnum(tippystate)` | 元件自設之倒數屬性(寫入 '5',遞減) | `isenum(tippystate)` | 值僅由本函數寫入,無實質差異 | 建議改(低價值) |
| src/domTooltip.mjs:113 | `isnum(ts)` → cint → `ts -= 1` | 倒數計數 | `isenum(ts)` | 同上 | 建議改(低價值) |
| src/domVirtualCreate.mjs:44 | `isnum(width)` → cdbl | CSS 寬度(px) | `isenum(width)` | R-NUM;Infinity 現→`1.79e308px`(無效 CSS),改後 null | 建議改 |
| src/domVirtualCreate.mjs:56 | `isnum(height)` → cdbl | CSS 高度(px) | `isenum(height)` | 同上 | 建議改 |
| src/domVirtualCreate.mjs:65 | `isnum(width)` → `${width}px` | 寫入 style.width | `isenum(width)`(可加 `use: 'nonnegative'`,但會改負值行為) | R-NUM;'0x10' 現→'0x10px'(無效 CSS),改後略過 | 建議改 |
| src/domVirtualCreate.mjs:68 | `isnum(height)` → `${height}px` | 寫入 style.height | `isenum(height)` | 同上 | 建議改 |
| src/estimateTicks.mjs:230 | `isnum(rmin)` → cdbl,不合 throw | 刻度區間下界 | `isenum(rmin)` | R-NUM;Infinity 現→MAX_VALUE 後 rmax-rmin 溢位,改後 throw `rmin is not a number` | 建議改 |
| src/estimateTicks.mjs:236 | `isnum(rmax)` → cdbl,不合 throw | 刻度區間上界 | `isenum(rmax)` | 同上 | 建議改 |
| src/estimateTicks.mjs:422 | `isint(v)` | 計算得之刻度值是否為整數(降權重計次) | `iseint(v)` | 僅 \|v\|>2**53 之整數浮點有別(刻度實務不會出現) | 建議改 |
| src/interp1.mjs:37 | `isnum(v)` → toNumber | 內插輸入點(純數字形式)x 座標 | `isenum(v)` | R-NUM;Infinity 現經 lodash toNumber 保留 Infinity 進入內插運算,改後略過該點;'0x10' 現→16 | 建議改 |
| src/interp1.mjs:46 | `isnum(x)` → toNumber | 內插輸入點 x | `isenum(x)` | 同上 | 建議改 |
| src/interp1.mjs:90 | `isnum(x) && isnum(y)` → toNumber | 內插資料點 (x, y) | `isenum(x) && isenum(y)` | 同上 | 建議改 |
| src/interp1.mjs:750 | `!isnum(px)` 且 `!isarr(px)` 回 err | 查詢點 px 之型別守門(數字或陣列) | `!isenum(px)` | 同上;Infinity 現通過守門後入運算,改後回 err `px is not a number or an array` | 建議改 |
| src/judge.mjs:119 | `isnum(x1)`,不合 throw | 容差比較左值(其後 preciseNum → 比較) | `isenum(x1)` | R-NUM;須與 preciseNum:78 同時決定(preciseNum 之 JSDoc 現明載「沿用 isnum,不在本函式變動範圍」;judge.test 正在新增中) | 待確認 |
| src/judge.mjs:122 | `isnum(x2)`,不合 throw | 容差比較右值 | `isenum(x2)` | 同上 | 待確認 |
| src/preciseNum.mjs:78 | `isnum(v)`,不合 throw | 取 12 位有效數字之輸入 | `isenum(v)` | JSDoc 明載沿用 isnum('0x10'、'Infinity' 寬鬆寫法不在變動範圍),為進行中之決定;estimateTicks / judge 皆經此 | 待確認 |
| src/preciseNum.mjs:89 | `isint(v)` | 整數路徑分流:整數直接 cstr 回傳、位數 0 | 保留 isint | 此為「分類」非「有效性」判定;改 iseint 則非安全整數(如 1e21)改走 Decimal 路徑,與 JSDoc 限制第 3 點(1e21 得 '1e+21')衝突 | 建議保留 |
| src/pseudoRandomIntRange.mjs:119 | `isint(vstart)` → cint | 隨機整數區間下界 | `iseint(vstart)` | R-INT;±Infinity 現→±MAX_VALUE 區間運算得 Infinity / NaN,2**60 精度失真;改後回預設 0 | 建議改 |
| src/pseudoRandomIntRange.mjs:125 | `isint(vend)` → cint | 隨機整數區間上界 | `iseint(vend)` | 同上(預設 100) | 建議改 |
| src/pseudoRandomIntsRange.mjs:121 | `isint(vstart)` | 同上 | `iseint(vstart)` | 同上 | 建議改 |
| src/pseudoRandomIntsRange.mjs:127 | `isint(vend)` | 同上 | `iseint(vend)` | 同上 | 建議改 |
| src/pseudoRandomIntsNdpRange.mjs:123 | `isint(vstart)` | 同上 | `iseint(vstart)` | 同上 | 建議改 |
| src/pseudoRandomIntsNdpRange.mjs:129 | `isint(vend)` | 同上 | `iseint(vend)` | 同上 | 建議改 |
| src/randomIntRange.mjs:34 | `isint(vstart)` | 同上 | `iseint(vstart)` | 同上 | 建議改 |
| src/randomIntRange.mjs:40 | `isint(vend)` | 同上 | `iseint(vend)` | 同上 | 建議改 |
| src/randomIntsNdpRange.mjs:45 | `isint(vstart)` | 同上 | `iseint(vstart)` | 同上 | 建議改 |
| src/randomIntsNdpRange.mjs:51 | `isint(vend)` | 同上 | `iseint(vend)` | 同上 | 建議改 |
| src/randomIntsRange.mjs:44 | `isint(vstart)` | 同上 | `iseint(vstart)` | 同上 | 建議改 |
| src/randomIntsRange.mjs:50 | `isint(vend)` | 同上 | `iseint(vend)` | 同上 | 建議改 |
| src/pseudoRandomRange.mjs:91 | `isnum(vstart)` → cdbl | 隨機數區間下界 | `isenum(vstart)` | R-NUM;±Infinity 現→±MAX_VALUE 區間寬度溢位為 Infinity,改後回預設 0 | 建議改 |
| src/pseudoRandomRange.mjs:97 | `isnum(vend)` → cdbl | 隨機數區間上界 | `isenum(vend)` | 同上(預設 1) | 建議改 |
| src/pseudoRandomsRange.mjs:102 | `isnum(vstart)` | 同上 | `isenum(vstart)` | 同上 | 建議改 |
| src/pseudoRandomsRange.mjs:108 | `isnum(vend)` | 同上 | `isenum(vend)` | 同上 | 建議改 |
| src/randomRange.mjs:34 | `isnum(vstart)` | 同上 | `isenum(vstart)` | 同上 | 建議改 |
| src/randomRange.mjs:40 | `isnum(vend)` | 同上 | `isenum(vend)` | 同上 | 建議改 |
| src/randomsRange.mjs:45 | `isnum(vstart)` | 同上 | `isenum(vstart)` | 同上 | 建議改 |
| src/randomsRange.mjs:51 | `isnum(vend)` | 同上 | `isenum(vend)` | 同上 | 建議改 |
| src/rang.mjs:40 | `isnum(rStart)` → cdbl | 等分區間起點 | `isenum(rStart)` | R-NUM;不合現回 [],維持 | 建議改 |
| src/rang.mjs:47 | `isnum(rEnd)` → cdbl | 等分區間終點 | `isenum(rEnd)` | 同上 | 建議改 |
| src/round.mjs:120 | `isnum(v)` → `new Decimal(v)` | 被修約數值 | `isenum(v)` | R-NUM;Decimal 對 Infinity 回 Infinity、另可解析 '0x10',呼叫端或有依賴 | 待確認 |
| src/ceil.mjs:75 | `isnum(v)` → `new Decimal(v)` | 同上 | `isenum(v)` | 同上 | 待確認 |
| src/floor.mjs:75 | `isnum(v)` → `new Decimal(v)` | 同上 | `isenum(v)` | 同上 | 待確認 |
| src/dig.mjs:31 | `isnum(v)` → cdbl → toFixed | 被格式化數值 | `isenum(v)` | R-NUM;Infinity 現→MAX_VALUE 之很長字串,改後 '' | 建議改 |
| src/digExp.mjs:25 | `isnum(v)` → cdbl | 被格式化數值 | `isenum(v)` | Infinity 現→'1.7976931348623157e+308',改後 '' | 建議改 |
| src/cfinancial.mjs:30 | `isnum(v)` → dig | 被格式化數值 | `isenum(v)` | 同 dig | 建議改 |
| src/sepInt.mjs:26 | `isint(v)` | 被切分之整數(`floor(v / n)`、`v - q * n`) | `iseint(v)` | R-INT;Infinity 現通過→運算得 NaN,改後回 [] | 建議改 |
| src/_optNum.mjs:41 | `isnum(v)` → Number(v) | 各函數數值選項共用 helper(domDetect / domDrag / domIsStable / fsDownloadFileVerifyCore / fsEnsureBinsCore、domDragPreview 等共 19 處呼叫) | 不建議直接換:helper 規則明列 +Infinity 之處置(timer 夾上限、`inf: 'keep'` 保留),多個呼叫端之 JSDoc 依賴;若要受益須在 helper 內先分流 Infinity,對有限值再用 isenum | 直接換則 `v === Infinity` 分支成死碼,tolerancePixel / toleranceBounce 之 Infinity 語意與 timer 夾上限消失 | 待確認 |

## 7 不符合(26,不計入符合數)

| 檔:行 | 現行判定 | 不符合之理由 |
|---|---|---|
| src/arrDiff.mjs:161 | 註解中的 `isnum(vok)` | 註解,非程式 |
| src/arrDiff.mjs:167 | 註解中的 `isnum(vnk)` | 註解,非程式 |
| src/fsTreeFolderWithHashCore.mjs:74 | 註解中的 `ispint(levelLimit)` | 註解,非程式 |
| src/flattenToConn.mjs:674 | 註解中的 `isnum(i)` | 註解,非程式 |
| src/_const.mjs:45 | JSDoc 註解中的 `ispint(v, { useLimitSafe: true })` | 註解,非程式 |
| src/flattenToConn.mjs:670 | `isestr(k) 或 isnum(k)` | 鍵名型別分流(收進 nk 後 join('-')),非計算 |
| src/arrPull.mjs:38 | `isobj(vpull) 或 isnum(vpull) ...` | 型別分流(單值包成陣列),非計算 |
| src/cstr.mjs:30 | `!isestr(v) && !isnum(v) && ...` | 字串化之型別守門,Infinity 字串化為 'Infinity' 屬合法輸出,非計算 |
| src/domSetAttr.mjs:31 | `!isestr(val) && !isnum(val)` | 屬性值型別守門,後續 setAttribute 字串化,非計算 |
| src/haskey.mjs:26 | `!isestr(key) && !isnum(key)` | 物件鍵型別守門(`key in obj`),非計算 |
| src/ltdtkeys2mat.mjs:92 | `!isstr(v[k]) && !isnum(v[k])` | 儲存格值型別分流(非字串數字者轉 JSON),非計算 |
| src/strFindSimilar.mjs:47 | `isestr(ar) 或 isnum(ar)` | 型別分流後 cstr 轉字串,非計算 |
| src/strFindSimilar.mjs:58 | `isnum(strkeys)` | 型別分流後 cstr 轉字串,非計算 |
| src/strFindFuzz.mjs:51 | `isestr(arr) 或 isnum(arr)` | 型別分流後 cstr 轉字串,非計算 |
| src/isnnum.mjs:48 | `isnum(v)` 後判 `cdbl(v) < 0` | 判斷類函數(符號判斷)本身,其定義域沿用 isnum,屬公開 API 語意,不在計算站點 |
| src/isn0num.mjs:49 | `isnum(v)` 後判 `<= 0` | 同上 |
| src/ispnum.mjs:48 | `isnum(v)` 後判 `> 0` | 同上 |
| src/isp0num.mjs:49 | `isnum(v)` 後判 `>= 0` | 同上 |
| src/isnint.mjs:49 | `isint(v)` 後判 `cint(v) < 0` | 同上(整數符號判斷) |
| src/isn0int.mjs:49 | `isint(v)` 後判 `cint(v) <= 0` | 同上 |
| src/verifyValue.mjs:66 | `type === 'isnum'` 分支內 `isnum(value)` | 驗證器以型別名稱對應判斷函數,公開 API 語意,非計算 |
| src/verifyValue.mjs:87 | `type === 'isint'` 分支 | 同上 |
| src/verifyValue.mjs:94 | `type === 'ispint'` 分支 | 同上 |
| src/verifyValue.mjs:101 | `type === 'isp0int'` 分支 | 同上 |
| src/verifyValue.mjs:133 | `custom` 回傳值型別檢查 `!isnum(r.value) & !isstr(r.value)` | 型別守門,非計算 |
| src/verifyValue.mjs:145 | `type === 'any'` 分支 `!isnum(value) && !isstr(value)` | 型別守門,非計算 |

---

## 實作時須先處理之耦合與缺陷(摘要,皆未處理)

1. **取值缺陷(判定通過後取值未轉數字)**:`strmid.mjs:31` 之 s、`arrSep.mjs` 之 num(`i += num`)——現收字串型數字卻直接做加法,與換不換 iseint 無關,須另案修取值。`arrAccum.mjs:31` 須先調整累加順序。
2. **成對同步**:`execCliJsonRpc.mjs:147` ↔ `execCliSession.mjs:164`(逾時);`fsGetFileHashCore.mjs:53` ↔ `fsGetFileXxHashCore.mjs:38`(chunkSize);`judge.mjs` ↔ `preciseNum.mjs` ↔ `estimateTicks.mjs`(數字判定須一致)。
3. **Infinity 當「無上限/很久」之反向風險**(換後由無限變有限或由有限逾時變不限時):`waitFun.mjs:145`、`cacheSt.mjs:211/242`、`cacheBd.mjs:182`、`execCli.mjs:515/542`、`execCliSession.mjs:164`、`execProcess.mjs:113`、`pmTimeout.mjs:85`、`cache.mjs:579`、`domShowInputAndGetFiles*.mjs`;換前宜先裁示專案對 Infinity 之慣例(`_optNum.mjs` 現行慣例為超大值夾至上限、`inf:'keep'` 者保留)。
4. **文件/契約明載 Infinity,建議保留 isnum**:`atand.mjs`、`atan2d.mjs`(JSDoc 範例)、`cdbl.mjs`、`cint.mjs`、`_optNum.mjs`;`preciseNum.mjs` 現為進行中之決定(JSDoc 明載沿用 isnum)。
5. **未使用變數(死碼,僅提出不處置)**:`getFileHash.mjs:104-109` 之本地 `chunkSize` 未被後續使用。
6. 呼叫 isenum / iseint 時第二參數為 opt;把函數本身當回調傳給 filter / every 時索引會被視為未給(不拋錯),但慣例仍建議包成 `(v) => isenum(v)`(見 `arrFilterByNum.mjs:40`)。

---

