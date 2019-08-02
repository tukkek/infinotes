import {getactive,pickcolor,open} from './ui.js';
import {create,tokey,retrieve,update,del,getnotes} from './db.js';
import {enableinteract} from './interact.js';

const INNERLINKS={
  type: 'lang',
  regex: /\[\[(.*)\]\]/g,
  replace: '<a href="#" onclick="openlink(\'$1\')">$1</a>'
}

const SHOWDOWN=new showdown.Converter({extensions:[INNERLINKS]});
SHOWDOWN.setOption('openLinksInNewWindow', 'true');

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
  show(key);
}

function settext(body,note){
  body.innerHTML=SHOWDOWN.makeHtml(note.content);
}

export function show(key){
  //console.log('retrieve note',key);
  let note=retrieve(key);
  let template=document.querySelector('template#note').content;
  let div=document.importNode(template,true).querySelector('div');
  div.style.left=note.x+'px';
  div.style.top=note.y+'px';
  div.style.width=note.width+'px';
  div.style.height=note.height+'px';
  div.style.background=note.background;
  div.setAttribute('key',key);
  div.querySelector('.header').innerHTML=note.title;
  settext(div.querySelector('.body'),note);
  document.querySelector('#notebook').appendChild(div);
  enableinteract(div);
}

function getnotediv(target){
  while(target&&!target.classList.contains('note')) target=target.parentNode;
  return target;
}

export function updatenote(e){ //update note size and position from interact.js
  let div=getnotediv(e.target)
  let key=div.getAttribute('key');
  let note=retrieve(key);
  var r=div.getBoundingClientRect();
  note.x=r.left;
  note.y=r.top;
  note.width=div.clientWidth;
  note.height=div.clientHeight;
  update(key,note);
}

export function changenotecolor(target){
  let div=getnotediv(target);
  let key=div.getAttribute('key');
  let note=retrieve(key);
  pickcolor(note,function(color){
    div.style.background=color;
    note.background=color;
    update(key,note);
  });
}

export function expandnote(target){
  open(getnotediv(target).getAttribute('key'));
}

export function editnote(target){
  let div=getnotediv(target);
  let key=div.getAttribute('key');
  let note=retrieve(key);
  let body=div.querySelector('.body');
  if(body.getAttribute('editing')){
    body.removeAttribute('editing');
    note.content=body.querySelector('textarea').value;
    settext(body,note);
    update(key,note);
  }else{
    body.innerHTML='';
    var text=document.createElement('textarea');
    text.innerHTML=note.content;
    text.addEventListener('keydown',function(e){
      if (e.keyCode!=13||!e.ctrlKey) return false;
      editnote(e.target);
      return true;
    });
    body.appendChild(text);
    text.focus();
    body.setAttribute('editing','yes');
  }
}

export function deletenote(target){
  let div=getnotediv(target);
  let key=div.getAttribute('key');
  let note=retrieve(key);
  if(!confirm('Are you sure you want to delete the note "'+note.title+'"?')) return;
  del(key);
  div.parentNode.removeChild(div);
}

export function renamenote(target){
  let div=getnotediv(target);
  let key=div.getAttribute('key');
  let note=retrieve(key);
  let name=prompt('Choose new name for note:',note.title);
  if(name){
    note.title=name;
    update(key,note);
    target.innerHTML=name;
  }  
}

export function transfernote(target){
  let div=getnotediv(target);
  let key=div.getAttribute('key');
  let note=retrieve(key);
  let transferdiv=document.querySelector('#transferpanel');
  transferdiv.setAttribute('key',key);
  transferdiv.querySelector('#transfername').innerHTML=note.title;
  let select=transferdiv.querySelector('select');
  select.innerHTML='';
  for(let n of getnotes()){
    if(n.key==key||n.key==note.parent) continue;
    let option=document.createElement('option');
    option.innerHTML=n.title;
    option.value=n.key;
    select.appendChild(option);
  }
  transferdiv.style.display='initial';
}

export function confirmtransfer(){
  let transferdiv=document.querySelector('#transferpanel');
  let key=transferdiv.getAttribute('key');
  let note=retrieve(key);
  let select=transferdiv.querySelector('select');
  var selected=select.selectedIndex;
  if(selected<0) return;
  note.parent=select.options[selected].value;
  del(key);
  create(key,note.title,note.parent);
  update(key,note);
  transferdiv.style.display="none";
  var notediv=document.querySelector('.note[key="'+note.key+'"]');
  notediv.parentNode.removeChild(notediv);
}
