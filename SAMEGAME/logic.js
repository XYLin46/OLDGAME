'use strict';
// Pure game rules shared by the browser and the Node verification script.
(function(root){
  function group(board,row,col){
    const value=board[row]?.[col];if(!value)return[];
    const seen=new Set(),found=[],stack=[[row,col]];
    while(stack.length){const [r,c]=stack.pop(),key=r+','+c;if(seen.has(key)||board[r]?.[c]!==value)continue;seen.add(key);found.push([r,c]);stack.push([r-1,c],[r+1,c],[r,c-1],[r,c+1])}
    return found;
  }
  function hasMoves(board){return board.some((row,r)=>row.some((v,c)=>v&&(board[r+1]?.[c]===v||row[c+1]===v)))}
  function remove(board,cells){
    const next=board.map(row=>row.slice()),height=next.length,width=next[0].length;
    for(const [r,c]of cells)next[r][c]=null;
    const columns=[];
    for(let c=0;c<width;c++){const values=next.map(row=>row[c]).filter(Boolean);if(values.length)columns.push(Array(height-values.length).fill(null).concat(values))}
    return Array.from({length:height},(_,r)=>Array.from({length:width},(_,c)=>columns[c]?.[r]??null));
  }
  function points(count){return count>=2?(count-2)**2:0}
  const api={group,hasMoves,remove,points};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SameGame=api;
})(typeof globalThis!=='undefined'?globalThis:this);
