import {create,retrieve,update,del,tokey,getnotebooks,findbytitle} from './db.js';
import {show} from './note.js';

export const LASTOPEN='_lastopen';

var active=false;

function updatenavigation(){
  let input=document.querySelector('#activenotebook');
  var selected=getnotebook().key;
  for(var i=0;i<input.options.length;i++){
      if(input.options[i].getAttribute('key')==selected) {
        input.selectedIndex=i;
        break;
      }
  }
  var note=retrieve(active);
  document.querySelector('#notebookactions').style.opacity=note?1:.25;
  var parent=note&&note.parent;
  var topbar=document.querySelector('#zoombar');
  if(note) topbar.querySelector('#zoomed').innerHTML=note.title;
  topbar.style.display=parent?'initial':'none';
}

export function load(starting=false){
  let input=document.querySelector('#activenotebook');
  while(input.options.length>1){
    input.removeChild(input.options[1]);
  }
  for(let n of getnotebooks()){
    let option=document.createElement('option');
    option.innerHTML=n.title;
    option.setAttribute('key',n.key);
    input.appendChild(option);
  }
  if(starting){
    var lastopen=localStorage.getItem(LASTOPEN);
    if(lastopen) open(lastopen);
  }
  updatenavigation();
}

export function changenotebook(){
  let input=document.querySelector('#activenotebook');
  if(input.selectedIndex>0) open(input.options[input.selectedIndex].getAttribute('key'));
}

export function open(key){
  var note=retrieve(key);
  if(!note) return;
  document.querySelector('#notebook').innerHTML='';
  active=key;
  document.body.style.background=note.background;
  for(var c of note.children){
    show(c);
  }
  localStorage.setItem(LASTOPEN,active);
  updatenavigation();
}

export function addnotebook(){
  let name=prompt("Choose a name for your new notebook:",'New notebook');
  if(!name) return;
  name=name.trim();
  let key=tokey(name);
  if(!key){
    alert("Invalid name, please try again.");
    return;
  }
  if(retrieve(key)||checknameconflict(name)){
    alert("A similar name already exists, please try again.");
    return;
  }
  var notebook=create(key,name);
  /*notebook.background='#808080';
  update(key,notebook);*/
  load();
  open(key);
  updatenavigation();
}

export function getnotebook(){
  if(!active) return false;
  var note=active;
  if(note.indexOf('.')>=0) note=note.substr(0,note.indexOf('.'));
  return retrieve(note);
}

export function deletenotebook(){
  if(!active) return;
  var notebook=getnotebook();
  if(!confirm('Are you sure you want to delete this notebook: '+notebook.title+'?')) return;
  del(notebook.key);
  active=false;
  load();
  document.querySelector('#notebook').innerHTML='';
  location.reload();
}

function checknameconflict(name){
  return getnotebooks().filter(n=>n.title.toLowerCase()==name.toLowerCase()).length>0;
}

//this approach leaves us with old keys but that's necessary to preserve subnote hierarchy
export function renamenotebook(){
  if(!active) return;
  let note=getnotebook();
  let name=prompt('Choose a new name for this notebook:',note.title);
  if(!name) return;
  name=name.trim();
  if(checknameconflict(name)){
    alert("There's already a notebook with this name or similar, please try again.");
    return;
  }
  note.title=name;
  update(note.key,note);
  load();
  updatenavigation();
}

export function pickcolor(note,callback){
  var colorpicker=document.querySelector('#colorpicker');
  colorpicker.value=note.background;
  colorpicker.onchange=function(){callback(colorpicker.value);};
  colorpicker.click();
}

export function changebackground(){
  if(!active) return;
  var note=retrieve(active);
  pickcolor(note,function(color){
    note.background=color;
    update(active,note);
    open(active);
  });
}

export function getactive(){return active;}

export function goup(){
  var parent=retrieve(active).parent;
  open(parent);
  updatenavigation();
}

export function openlink(link){ //open internal links
  var note=findbytitle(link,getnotebook().key);
  if(!note) {
    alert('Could not find note "'+link+'"!');
    return;
  }
  if(note.parent!=active) open(note.parent);
}
