import {getactive,getnotebook} from './ui.js';

// deal with the persistence layer, currently localStorage but some day may become MongoDB or similar
export function tokey(name,parent=false){
  if(name.length==0||name.indexOf('.')>=0||name.indexOf('"')>=0||name[0]=='_') return false;
  while(name.indexOf(' ')>=0) name=name.replace(' ','');
  name=name.toLowerCase();
  if(parent) name=parent+'.'+name;
  return name;
}

export function randomcolor(){
  return Math.floor(Math.random()*255);
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
  var note={
    title:name,
    background:'rgb('+randomcolor()+','+randomcolor()+','+randomcolor()+')',
    children:[],
    parent:parent.key,
    x:x,y:y,
    width:400,height:200,
    content:'',
  };
  localStorage.setItem(key,JSON.stringify(note));
  return note;
}

export function retrieve(key){
  var note=JSON.parse(localStorage.getItem(key));
  if(note) note.key=key;
  return note;
}

export function update(key,item){localStorage.setItem(key,JSON.stringify(item));}

// remove note and children + update parent
// should be called delete, but delete is a javascript keyword
export function del(key){
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
    if(key[0]!='_'&&key.indexOf('.')<0) notebooks.push(retrieve(key));
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
