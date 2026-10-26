'use strict';
const ROWS=10,COLS=12,LETTERS='ABCDE',rules=SameGame;
const $=id=>document.getElementById(id),boardEl=$('board');
let board,score=0,history=[],over=false,focusRow=0,focusCol=0;
function readBest(){try{return Number(localStorage.getItem('oldgame-samegame-best'))||0}catch{return 0}}
let best=readBest();
function remaining(){return board.flat().filter(Boolean).length}
function status(text){$('status').textContent=text}
function clearHighlight(){boardEl.querySelectorAll('.highlight').forEach(el=>el.classList.remove('highlight'))}
function preview(r,c){clearHighlight();if(over)return;const cells=rules.group(board,r,c);if(cells.length<2){status('這個方塊落單了，找找相連的同字母方塊。');return}for(const [y,x]of cells)boardEl.children[y*COLS+x].classList.add('highlight');status(`消除 ${cells.length} 個 ${board[r][c]} → +${rules.points(cells.length)} 分`)}
function saveBest(){if(score>best){best=score;try{localStorage.setItem('oldgame-samegame-best',best)}catch{}}}
function render(){
  boardEl.replaceChildren();
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const v=board[r][c],el=document.createElement(v?'button':'span');
    if(v){el.type='button';el.className='tile tile-'+v.toLowerCase();el.textContent=v;el.dataset.row=r;el.dataset.col=c;el.setAttribute('aria-label',`第 ${r+1} 列，第 ${c+1} 欄，${v}`);el.tabIndex=r===focusRow&&c===focusCol?0:-1;el.addEventListener('click',()=>play(r,c));el.addEventListener('pointerenter',()=>preview(r,c));el.addEventListener('focus',()=>{focusRow=r;focusCol=c;for(const tile of boardEl.querySelectorAll('button'))tile.tabIndex=tile===el?0:-1;preview(r,c)})}
    else{el.className='empty';el.setAttribute('aria-hidden','true')}
    boardEl.append(el);
  }
  if(!board[focusRow]?.[focusCol]){const first=boardEl.querySelector('button');if(first){first.tabIndex=0;focusRow=Number(first.dataset.row);focusCol=Number(first.dataset.col)}}
  $('score').textContent=score.toLocaleString();$('best').textContent=best.toLocaleString();$('remaining').textContent=remaining();$('undo').disabled=!history.length;$('result-undo').disabled=!history.length;
  $('result').hidden=!over;boardEl.inert=over;
  if(over){$('result-title').textContent=remaining()?'沒有可消除的方塊了':'漂亮！全部清空';$('final-score').textContent=score.toLocaleString();$('result-summary').textContent=remaining()?`剩下 ${remaining()} 個方塊。復原一步，試試不同路線？`:'全清獎勵 +1,000 分已計入。';$('play-again').focus()}
}
function play(r,c){
  if(over)return;const cells=rules.group(board,r,c);if(cells.length<2){preview(r,c);return}
  history.push({board:board.map(row=>row.slice()),score});focusRow=r;focusCol=c;
  board=rules.remove(board,cells);const gained=rules.points(cells.length);score+=gained;
  if(!remaining())score+=1000;over=!rules.hasMoves(board);saveBest();render();
  if(over)status(remaining()?'本局結束。可以復原，或開始新的一局。':'全清！額外獲得 1,000 分。');else{status(`消除 ${cells.length} 個方塊，+${gained} 分。`);boardEl.querySelector('[tabindex="0"]')?.focus();clearHighlight();status(`消除 ${cells.length} 個方塊，+${gained} 分。`)}
}
function newGame(){
  do{board=Array.from({length:ROWS},()=>Array.from({length:COLS},()=>LETTERS[Math.floor(Math.random()*5)]))}while(!rules.hasMoves(board));
  score=0;history=[];over=false;focusRow=0;focusCol=0;render();status('點擊 2 個以上相連的同字母方塊。');
}
function undo(){if(!history.length)return;const state=history.pop();board=state.board;score=state.score;over=false;render();boardEl.querySelector('[tabindex="0"]')?.focus();clearHighlight();status('已復原上一步，試試另一種消除順序。')}
boardEl.addEventListener('pointerleave',()=>{clearHighlight();if(!over)status('點擊 2 個以上相連的同字母方塊。')});
boardEl.addEventListener('keydown',e=>{
  const directions={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]},dir=directions[e.key];if(!dir||over)return;e.preventDefault();let r=focusRow+dir[0],c=focusCol+dir[1];while(r>=0&&r<ROWS&&c>=0&&c<COLS){if(board[r][c]){boardEl.children[r*COLS+c].focus();break}r+=dir[0];c+=dir[1]}
});
$('undo').onclick=undo;$('result-undo').onclick=undo;$('restart').onclick=newGame;$('play-again').onclick=newGame;newGame();
