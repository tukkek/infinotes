// deal with the persistence layer, currently localStorage but some day may become MongoDB or similar
import {getactive,getnotebook} from './ui.js';

export const LASTOPEN='_lastopen';
const PREFIX='infinotes_'//sanitize namespace, as localStorage can be shared (ie. localhost or github.com)

function prefix(key){
//   debugger
  return key.indexOf(PREFIX)==0?key:PREFIX+key}
export function get(key){return localStorage.getItem(prefix(key))}
export function set(value,key){return localStorage.setItem(prefix(key),value)}

export function tokey(name,parent=false){
  if(name.length==0||name.indexOf('.')>=0||name.indexOf('"')>=0||name[0]=='_') return false;
  while(name.indexOf(' ')>=0) name=name.replace(' ','');
  name=name.toLowerCase();
  if(parent) name=parent+'.'+name;
  return name;
}

export function randomcolor(){
  var c=Math.floor(Math.random()*255).toString(16);
  if(c.length==1) c='0'+c;
  return c;
}

export function create(key,name,parent=false){
  let x=0;
  let y=0;
  if(parent) {
    parent=retrieve(parent);
    for(let c of parent.children){
      c=retrieve(c);
      x=Math.max(x,c.x+c.width);
      y=Math.max(y,c.y);
    }
    parent.children.push(key);
    update(parent.key,parent);
  }
  x+=10;
  let width=400;
  let height=250;
  while(x+width>document.body.clientWidth){
    x=10;
    y+=height;
  }
  var note={
    title:name,
    background:'#'+randomcolor()+randomcolor()+randomcolor(),
    children:[],
    parent:parent.key,
    x:x,y:y,width:width,height:height,
    content:'',
  };
  set(JSON.stringify(note),key);
  return note;
}

export function retrieve(key){
  key=prefix(key)
  var note=JSON.parse(get(key));
  if(note) note.key=key
  return note;
}

export function update(key,item){set(JSON.stringify(item),key);}

// remove note and children + update parent
// should be called delete, but delete is a javascript keyword
export function del(key){
  key=prefix(key)
  var note=retrieve(key);
  for(var c of note.children) del(c);
  localStorage.removeItem(key);
  if(note.parent){
    var parent=retrieve(note.parent);
    parent.children.splice(parent.children.indexOf(key),1);
    update(parent.key,parent);
  }
}

export function getnotebooks(){
  let notebooks=[];
  for(let i=0;i<localStorage.length;i++){
    let key=localStorage.key(i);
    if(key==PREFIX+LASTOPEN) continue
    if(key.indexOf(PREFIX)==0&&key.indexOf('.')<0)
      notebooks.push(retrieve(key));
  }
  return notebooks;
}

export function findbytitle(title,note){
  note=retrieve(note);
  if(note.title.toLowerCase()==title.toLowerCase()) return note;
  for(let c of note.children){
    c=findbytitle(title,c);
    if(c) return c;
  }
  return false;
}

export function getnotes(){
  let notebook=getnotebook().key;
  let prefix=notebook+'.';
  let notes=[];
  for(let i=0;i<localStorage.length;i++){
    let key=localStorage.key(i);
    if(key==notebook||key.indexOf(prefix)==0) notes.push(retrieve(key));
  }
  return notes;
}
