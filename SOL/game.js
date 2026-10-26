'use strict';
const rules=Solitaire,$=id=>document.getElementById(id),board=$('board');
const ASSETS='assets/SOL_CARDPIC/',symbols=['♣','♦','♥','♠'],suitNames=['梅花','方塊','紅心','黑桃'];
const cardElements=new Map(),slotElements=new Map(),cardImages=new Map();
for(let i=1;i<=65;i++){const img=new Image();img.src=ASSETS+'Card_Bitmap_'+i+'.png';cardImages.set(i,img)}
let visibleIds=new Set(),stockImage=null,dragRaf=0,celebration=null;
let state,history=[],selected=null,drawCount=1,back=54,seconds=0,started=false,finished=false,pointer=null,ghost=null,suppressClick=false;
function message(text){$('message').textContent=text}
function image(card){return ASSETS+'Card_Bitmap_'+(card.up?card.id+1:back)+'.png'}
function cardName(c){return suitNames[c.suit]+(['','A','2','3','4','5','6','7','8','9','10','J','Q','K'][c.rank])}
function sameRef(a,b){return a&&b&&a.kind===b.kind&&a.col===b.col&&a.index===b.index}
function snapshot(){return JSON.parse(JSON.stringify(state))}
function remember(){history.push(snapshot());if(history.length>300)history.shift()}
function menuClose(){$('game-options').hidden=true;$('game-menu').setAttribute('aria-expanded','false')}
function updateStatus(){$('score').textContent='分數：'+state.score;$('time').textContent='時間：'+seconds;$('undo').disabled=!history.length;$('complete').hidden=finished||!rules.canComplete(state)}
function stopCelebration(notify=false){if(celebration){const active=celebration;celebration=null;active.stop(notify)}$('skip-animation').hidden=true}
function showVictory(){celebration=null;$('skip-animation').hidden=true;if(!finished)return;$('win-summary').textContent=`分數 ${state.score}，時間 ${seconds} 秒，共 ${state.moves} 步。`;if(!$('win-dialog').open)$('win-dialog').showModal()}
function checkWin(){if(!finished&&rules.won(state)){finished=true;started=false;$('complete').hidden=true;$('skip-animation').hidden=false;message('恭喜！點牌桌或「略過動畫」可跳過紙牌彈跳。');celebration=SolitaireEffects.victory(board,state.foundations,cardImages,showVictory);if(!board.querySelector('.victory-canvas'))celebration=null}}
function addSlot(kind,col,x,y){const key=kind+':'+col;let el=slotElements.get(key);if(!el){el=document.createElement('button');slotElements.set(key,el);board.append(el)}el.className='slot';el.style.left=x+'px';el.style.top=y+'px';el.dataset.kind=kind;el.dataset.col=col;
  el.setAttribute('aria-label',kind==='stock'?'翻牌堆，點擊翻牌或重新發牌':kind==='waste'?'翻出牌區':kind==='foundation'?suitNames[col]+'收牌區，由 A 排到 K':'第 '+(col+1)+' 欄空位，只能放 K');
  if(kind==='stock'&&!state.stock.length)el.classList.add('stock-empty');else if(kind==='foundation')el.textContent=symbols[col];
  el.onclick=()=>{if(kind==='stock')draw();else if(selected){if(!performMove(selected,{kind,col}))message(kind==='foundation'?'收牌區須同花色，由 A 依序排列。':'這裡只能放紅黑交錯、相差一點的牌；空欄只能放 K。')}};board.append(el);return el;
}
function addCard(card,ref,x,y,z,selectable=true){
  visibleIds.add(card.id);let el=cardElements.get(card.id);if(!el){el=document.createElement('button');const img=document.createElement('img');img.alt='';img.draggable=false;el.append(img);cardElements.set(card.id,el);board.append(el)}el.onclick=null;el.ondblclick=null;el.onpointerdown=null;el.type='button';el.className='card'+(card.up?'':' down');el.style.left='0px';el.style.top='0px';el.style.transform='translate3d('+x+'px,'+y+'px,0)';el.style.zIndex=z;el.style.pointerEvents='';
  el.dataset.kind=ref.kind;el.dataset.col=ref.col;el.dataset.index=ref.index;el.setAttribute('aria-label',card.up?`${cardName(card)}，${ref.kind==='tableau'?'第 '+(ref.col+1)+' 欄':ref.kind==='waste'?'翻出牌':'收牌區'}`:'未翻開牌');
  el.tabIndex=selectable&&card.up?0:-1;
  const img=el.firstElementChild;const src=image(card);if(img.getAttribute('src')!==src)img.src=src;
  if(!selectable){el.style.pointerEvents='none';el.setAttribute('aria-hidden','true')}else el.removeAttribute('aria-hidden');
  if(card.up&&selectable){
    el.onclick=()=>{if(suppressClick){suppressClick=false;return}if(finished)return;
      if(selected&&!sameRef(selected,ref)&&performMove(selected,{kind:ref.kind,col:ref.col}))return;
      if(sameRef(selected,ref)){selected=null;markSelected();message('已取消選取。');return}
      if(rules.moving(state,ref).length){selected=ref;markSelected();message('已選取 '+cardName(card)+'，請點目的地或拖曳。')}
    };
    el.ondblclick=()=>{if(!finished)autoCard(ref)};
    el.onpointerdown=e=>beginDrag(e,ref,el);
  }
}
function markSelected(){for(const el of board.querySelectorAll('.card'))el.classList.toggle('selected',!!selected&&el.dataset.kind===selected.kind&&Number(el.dataset.col)===selected.col&&Number(el.dataset.index)>=selected.index)}
function render(){
  visibleIds=new Set();const step=(board.clientWidth-16-71)/6,x=col=>8+col*step;
  addSlot('stock',0,x(0),8);addSlot('waste',0,x(1),8);
  for(let i=0;i<4;i++)addSlot('foundation',i,x(i+3),8);
  if(state.stock.length){if(!stockImage){stockImage=document.createElement('img');stockImage.alt='';stockImage.draggable=false;stockImage.style.cssText='position:absolute;width:71px;height:96px;left:8px;top:8px;pointer-events:none;image-rendering:pixelated'}const src=ASSETS+'Card_Bitmap_'+back+'.png';if(stockImage.getAttribute('src')!==src)stockImage.src=src;board.append(stockImage)}else stockImage?.remove();
  const wasteStart=Math.max(0,state.waste.length-(drawCount===3?3:1));
  for(let i=wasteStart;i<state.waste.length;i++)addCard(state.waste[i],{kind:'waste',col:0,index:i},x(1)+(i-wasteStart)*15,8,5+i-wasteStart,i===state.waste.length-1);
  state.foundations.forEach((p,col)=>{if(p.length)addCard(p.at(-1),{kind:'foundation',col,index:p.length-1},x(col+3),8,5)});
  let needed=410;
  state.tableau.forEach((p,col)=>{
    addSlot('tableau',col,x(col),124);let y=124;
    const down=p.filter(c=>!c.up).length,up=p.length-down;
    const spread=Math.max(10,Math.min(22,(410-124-96-down*12)/Math.max(1,up-1)));
    p.forEach((card,index)=>{addCard(card,{kind:'tableau',col,index},x(col),y,index+10);needed=Math.max(needed,y+108);y+=card.up?spread:12});
  });
  for(const [id,el]of cardElements)if(!visibleIds.has(id)){el.remove();cardElements.delete(id)}
  board.style.height=needed+'px';markSelected();updateStatus();
}
function performMove(from,to){
  if(finished||!rules.canMove(state,from,to))return false;
  remember();const name=cardName(rules.moving(state,from)[0]);rules.move(state,from,to);started=true;selected=null;render();message(name+' 已移動。');checkWin();return true;
}
function draw(){if(finished)return;const prev=snapshot();if(!rules.draw(state,drawCount)){message('牌堆已空，請移動桌面上的牌。');return}history.push(prev);started=true;selected=null;render();message(state.stock.length?'已翻牌。':'牌堆用完後，可再按一下循環重發。')}
function autoCard(from){const cards=rules.moving(state,from);if(cards.length!==1){message('請選最上方單張牌，才可自動收牌。');return false}if(!performMove(from,{kind:'foundation',col:cards[0].suit})){message('目前還不能收這張牌，需同花色從 A 開始。');return false}return true}
function autoCollect(){menuClose();let count=0;while(!finished){const from=rules.topSources(state).find(ref=>{const card=rules.moving(state,ref)[0];return rules.canMove(state,ref,{kind:'foundation',col:card.suit})});if(!from)break;autoCard(from);count++}message(count?'已自動收好 '+count+' 張牌。':'目前沒有可收的牌。')}
function directComplete(){
  menuClose();if(finished||!rules.canComplete(state))return;
  const completed=rules.complete(state);
  if(!completed){message('目前無法自動完成，請繼續移牌。');return}
  cancelDrag();remember();state=completed;selected=null;render();checkWin();
}
function newGame(){stopCelebration();cancelDrag();state=rules.deal();history=[];selected=null;seconds=0;started=false;finished=false;for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();menuClose();render();message('新遊戲：點牌堆翻牌，或拖曳已翻開的牌。')}
function undo(){menuClose();if(!history.length)return;stopCelebration();cancelDrag();state=history.pop();selected=null;finished=false;started=state.moves>0;$('win-dialog').close();render();message('已復原上一步。')}
function beginDrag(e,ref,el){
  if(e.button!==0||finished||!rules.moving(state,ref).length)return;
  const rect=el.getBoundingClientRect(),cards=rules.moving(state,ref);
  const offsets=cards.map(card=>{const cardEl=cardElements.get(card.id);return cardEl?cardEl.getBoundingClientRect().top-rect.top:0});
  pointer={id:e.pointerId,ref,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,offsetX:e.clientX-rect.left,offsetY:e.clientY-rect.top,cards,offsets};el.setPointerCapture(e.pointerId);
}
function cancelDrag(){cancelAnimationFrame(dragRaf);dragRaf=0;if(ghost)ghost.remove();ghost=null;pointer=null;document.body.classList.remove('dragging');for(const el of board.querySelectorAll('.drag-source'))el.classList.remove('drag-source')}
function paintDrag(){dragRaf=0;if(ghost&&pointer)ghost.style.transform='translate3d('+(pointer.x-pointer.offsetX)+'px,'+(pointer.y-pointer.offsetY)+'px,0)'}
document.addEventListener('pointermove',e=>{
  if(!pointer||pointer.id!==e.pointerId)return;
  pointer.x=e.clientX;pointer.y=e.clientY;
  if(!ghost&&Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)<4)return;
  e.preventDefault();
  if(!ghost){
    ghost=document.createElement('div');ghost.className='drag-ghost';
    pointer.cards.forEach((card,i)=>{const img=cardImages.get(card.id+1).cloneNode();img.draggable=false;img.style.top=pointer.offsets[i]+'px';ghost.append(img);cardElements.get(card.id)?.classList.add('drag-source')});
    document.body.append(ghost);document.body.classList.add('dragging');paintDrag();
  }
  if(!dragRaf)dragRaf=requestAnimationFrame(paintDrag);
},{passive:false});
function dropTarget(e,p){
  const rect=board.getBoundingClientRect();
  if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)return null;
  const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-kind]');
  if(hit&&hit.dataset.kind!=='stock'&&hit.dataset.kind!=='waste')return{kind:hit.dataset.kind,col:Number(hit.dataset.col)};
  const step=(board.clientWidth-16-71)/6,center=e.clientX-p.offsetX+35.5-rect.left,col=Math.round((center-8-35.5)/step),y=e.clientY-rect.top;
  if(col<0||col>6)return null;
  if(y>=112)return{kind:'tableau',col};
  if(col>=3&&y<=110)return{kind:'foundation',col:col-3};return null;
}
document.addEventListener('pointerup',e=>{
  if(!pointer||pointer.id!==e.pointerId)return;
  const from=pointer.ref,dragged=!!ghost,to=dragged?dropTarget(e,pointer):null;
  cancelDrag();
  if(dragged){suppressClick=true;setTimeout(()=>suppressClick=false,0);if(!to||!performMove(from,to)){message('不能放在這裡：紅黑交錯遞減，空欄只能放 K。');selected=null;markSelected()}}
});
document.addEventListener('pointercancel',cancelDrag);
document.addEventListener('selectstart',e=>e.preventDefault());
document.addEventListener('dragstart',e=>e.preventDefault());
$('game-menu').onclick=()=>{const open=$('game-options').hidden;$('game-options').hidden=!open;$('game-menu').setAttribute('aria-expanded',String(open))};
document.addEventListener('click',e=>{if(!e.target.closest('.menu-wrap'))menuClose()});
$('skip-animation').onclick=()=>stopCelebration(true);$('complete').onclick=directComplete;$('new-game').onclick=newGame;$('undo').onclick=undo;$('auto').onclick=autoCollect;$('win-new').onclick=newGame;
function setDraw(n){drawCount=n;$('draw-one').textContent=(n===1?'✓':'　')+' 翻一張';$('draw-three').textContent=(n===3?'✓':'　')+' 翻三張';$('draw-one').setAttribute('aria-pressed',String(n===1));$('draw-three').setAttribute('aria-pressed',String(n===3));$('draw-label').textContent=n===1?'翻一張':'翻三張';newGame()}
$('draw-one').onclick=()=>setDraw(1);$('draw-three').onclick=()=>setDraw(3);
$('help').onclick=()=>{menuClose();$('help-dialog').showModal()};$('backs').onclick=()=>{menuClose();$('backs-dialog').showModal()};
for(const btn of document.querySelectorAll('[data-close]'))btn.onclick=()=>$(btn.dataset.close).close();
for(let i=53;i<=65;i++){const btn=document.createElement('button');btn.setAttribute('aria-label','牌背圖案 '+(i-52));btn.setAttribute('aria-pressed',String(i===back));const img=document.createElement('img');img.src=ASSETS+'Card_Bitmap_'+i+'.png';img.alt='';btn.append(img);btn.onclick=()=>{back=i;for(const b of $('back-choices').children)b.setAttribute('aria-pressed',String(b===btn));render()};$('back-choices').append(btn)}
$('minimize').onclick=()=>{document.querySelector('.window-viewport').hidden=true;$('restore').hidden=false};$('restore').onclick=()=>{document.querySelector('.window-viewport').hidden=false;$('restore').hidden=true};
$('maximize').onclick=()=>{if(celebration)stopCelebration(true);const win=document.querySelector('.window'),on=win.classList.toggle('maximized');$('maximize').setAttribute('aria-pressed',String(on));render()};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a')e.preventDefault();if(e.key==='Escape'){if(celebration){stopCelebration(true);return}selected=null;markSelected();menuClose()}if(document.querySelector('dialog[open]'))return;if(e.key==='F2'){e.preventDefault();newGame()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo()}if(e.key==='F1'){e.preventDefault();$('help-dialog').showModal()}});
board.addEventListener('contextmenu',e=>{e.preventDefault();autoCollect()});
setInterval(()=>{if(started&&!finished&&!document.hidden&&!document.querySelector('dialog[open]')){seconds++;updateStatus()}},1000);
window.addEventListener('resize',()=>{if(state){if(celebration)stopCelebration(true);cancelDrag();render()}});newGame();
