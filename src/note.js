import {getactive} from './ui.js';
import {create,tokey,retrieve,update} from './db.js';
import {enableinteract} from './interact.js';

export function createnote(){
  let parent=getactive();
  if(!parent) return;
  let name=prompt("Choose a name for the new note:",'New note');
  if(!name) return;
  name=name.trim();
  let key=tokey(name,parent);
  if(!key){
    alert("Invalid name, please try again.");
    return;
  }
  if(retrieve(key)){
    alert("A similar name already exists, please try again.");
    return;
  }
  create(key,name,parent);
  console.log('create note',key);
  show(key);
}

export function show(key){
  //console.log('retrieve note',key);
  let note=retrieve(key);
  let div=document.createElement('div');
  div.style.left=note.x+'px';
  div.style.top=note.y+'px';
  div.style.width=note.width+'px';
  div.style.height=note.height+'px';
  div.style.background=note.background;
  div.classList.add('note');
  div.setAttribute('key',key);
  document.querySelector('#notebook').appendChild(div);
  enableinteract(div);
}

export function updatenote(e){
  let target=e.target;
  let key=target.getAttribute('key');
  let note=retrieve(key);
  var r=target.getBoundingClientRect();
  note.x=r.left;
  note.y=r.top;
  note.width=target.clientWidth;
  note.height=target.clientHeight;
  update(key,note);
}
