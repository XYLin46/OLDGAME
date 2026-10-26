'use strict';
// Visual-only celebration: it never changes the completed game state.
window.SolitaireEffects={
  victory(board,foundations,images,onDone){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onDone();return{stop(){}}}
    const canvas=document.createElement('canvas'),width=board.clientWidth,height=board.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
    canvas.className='victory-canvas';canvas.width=width*dpr;canvas.height=height*dpr;canvas.setAttribute('aria-label','過關紙牌彈跳動畫，點擊略過');
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.imageSmoothingEnabled=false;board.append(canvas);
    const queue=[],active=[],step=(width-16-71)/6;
    for(let rank=12;rank>=0;rank--)for(let suit=0;suit<4;suit++){
      const card=foundations[suit][rank];if(!card)continue;
      queue.push({id:card.id,suit,x:8+(suit+3)*step,y:8,vx:(Math.random()<.65?-1:1)*(140+Math.random()*190),vy:-110+Math.random()*190});
    }
    let raf=0,last=0,elapsed=0,nextLaunch=0,stopped=false;
    const hidden=[];
    function stop(notify=true){if(stopped)return;stopped=true;cancelAnimationFrame(raf);canvas.remove();for(const el of hidden)el.style.visibility='';if(notify)onDone()}
    function frame(ts){
      if(stopped)return;const dt=last?Math.min((ts-last)/1000,.04):0;last=ts;elapsed+=dt;
      if(queue.length&&elapsed>=nextLaunch){const p=queue.shift();active.push(p);nextLaunch=elapsed+.13;const el=board.querySelector('.card[data-kind="foundation"][data-col="'+p.suit+'"]');if(el&&!hidden.includes(el)){hidden.push(el);el.style.visibility='hidden'}}
      for(let i=active.length-1;i>=0;i--){const p=active[i];p.vy+=880*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
        const floor=height-96;if(p.y>=floor&&p.vy>0){p.y=floor;p.vy=-Math.max(110,p.vy*.76)}
        const img=images.get(p.id+1);if(img?.complete&&img.naturalWidth)ctx.drawImage(img,Math.round(p.x),Math.round(p.y),71,96);
        if(p.x<-75||p.x>width+4)active.splice(i,1);
      }
      if(!queue.length&&!active.length){stop();return}raf=requestAnimationFrame(frame);
    }
    canvas.addEventListener('pointerdown',()=>stop());raf=requestAnimationFrame(frame);
    return{stop};
  }
};
