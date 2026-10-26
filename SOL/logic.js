'use strict';
(function(root){
  const suits=['clubs','diamonds','hearts','spades'];
  function red(card){return card.suit===1||card.suit===2}
  function shuffled(random=Math.random){const deck=Array.from({length:52},(_,id)=>({id,suit:Math.floor(id/13),rank:id%13+1,up:false}));for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}return deck}
  function deal(random=Math.random){const deck=shuffled(random),tableau=Array.from({length:7},()=>[]);for(let col=0;col<7;col++){for(let j=0;j<=col;j++)tableau[col].push(deck.pop());tableau[col].at(-1).up=true}return{stock:deck,waste:[],foundations:[[],[],[],[]],tableau,score:0,moves:0}}
  function pile(state,ref){return ref.kind==='tableau'?state.tableau[ref.col]:ref.kind==='foundation'?state.foundations[ref.col]:ref.kind==='waste'?state.waste:null}
  function moving(state,from){const p=pile(state,from);if(!p||!p[from.index]?.up)return[];if(from.kind!=='tableau'&&from.index!==p.length-1)return[];const cards=p.slice(from.index);for(let i=1;i<cards.length;i++)if(!cards[i].up||cards[i-1].rank!==cards[i].rank+1||red(cards[i-1])===red(cards[i]))return[];return cards}
  function canMove(state,from,to){
    if(from.kind===to.kind&&from.col===to.col)return false;
    const cards=moving(state,from);if(!cards.length)return false;const target=pile(state,to);if(!target)return false;const top=target.at(-1),card=cards[0];
    if(to.kind==='foundation')return cards.length===1&&card.suit===to.col&&card.rank===(top?top.rank+1:1);
    if(to.kind==='tableau')return top?top.up&&top.rank===card.rank+1&&red(top)!==red(card):card.rank===13;
    return false;
  }
  function move(state,from,to){if(!canMove(state,from,to))return false;const source=pile(state,from),cards=source.splice(from.index);pile(state,to).push(...cards);if(to.kind==='foundation')state.score+=10;else if(from.kind==='foundation')state.score=Math.max(0,state.score-15);else if(from.kind==='waste')state.score+=5;if(from.kind==='tableau'&&source.length&&!source.at(-1).up){source.at(-1).up=true;state.score+=5}state.moves++;return true}
  function draw(state,count){if(state.stock.length){for(let i=0;i<count&&state.stock.length;i++){const c=state.stock.pop();c.up=true;state.waste.push(c)}}else if(state.waste.length){while(state.waste.length){const c=state.waste.pop();c.up=false;state.stock.push(c)}state.score=Math.max(0,state.score-20)}else return false;state.moves++;return true}
  function won(state){return state.foundations.every(p=>p.length===13)}
  function topSources(state){const sources=[];if(state.waste.length)sources.push({kind:'waste',col:0,index:state.waste.length-1});state.tableau.forEach((p,col)=>{if(p.length&&p.at(-1).up)sources.push({kind:'tableau',col,index:p.length-1})});return sources}
  function canComplete(state){return !won(state)&&state.stock.length===0&&state.tableau.every(p=>p.every(c=>c.up))}
  function complete(state){
    if(!canComplete(state))return null;
    const next=JSON.parse(JSON.stringify(state)),seen=new Set();
    // Finish through legal foundation moves, recycling the waste if necessary.
    for(let step=0;step<5000;step++){
      if(won(next))return next;
      const key=JSON.stringify([next.stock.map(c=>c.id),next.waste.map(c=>c.id),next.tableau.map(p=>p.map(c=>c.id)),next.foundations.map(p=>p.length)]);
      if(seen.has(key))return null;seen.add(key);
      const from=topSources(next).find(ref=>{const c=moving(next,ref)[0];return canMove(next,ref,{kind:'foundation',col:c.suit})});
      if(from){const card=moving(next,from)[0];move(next,from,{kind:'foundation',col:card.suit})}
      else if(!draw(next,1))return null;
    }
    return null;
  }
  const api={suits,red,deal,pile,moving,canMove,move,draw,won,topSources,canComplete,complete};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Solitaire=api;
})(typeof globalThis!=='undefined'?globalThis:this);
