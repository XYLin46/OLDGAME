# OLDGAME

每款經典遊戲各自放在一個資料夾，首頁提供遊戲入口。純 HTML / CSS / JavaScript，無需建置或後端。

**[直接開啟 OLDGAME](https://xylin46.github.io/OLDGAME/)**

| 遊戲 | 資料夾 | 直接遊玩 |
| --- | --- | --- |
| SAMEGAME | `SAMEGAME/` | [開始消除方塊](https://xylin46.github.io/OLDGAME/SAMEGAME/) |

SAMEGAME 使用 12 欄 × 10 列、A～E 五種字母與不同顏色。點擊至少兩個上下左右相連的同字母方塊即可消除；方塊向下掉落，空欄向左靠攏。每次得分為 `(消除數量 - 2)²`，全清額外獲得 1,000 分。支援滑鼠、觸控、方向鍵與 Enter / Space，提供多步復原、新的一局與瀏覽器本機最佳成績。

本機使用靜態 HTTP 伺服器開啟目錄。規則檢查：`node SAMEGAME/verify.cjs`。

新增遊戲時建立新的獨立資料夾，並在根目錄 `index.html` 與本表新增入口。GitHub Pages 使用 `main` 分支根目錄發布。
