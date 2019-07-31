import {create,retrieve,update,del,tokey,getnotebooks} from './db.js';
import {show} from './note.js';

var active=false;

export function load(){
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
}

export function changenotebook(){
  let input=document.querySelector('#activenotebook');
  if(input.selectedIndex>0) open(input.options[input.selectedIndex].getAttribute('key'));
}

function open(key){
  var note=retrieve(key);
  if(!note) return;
  active=key;
  document.body.style.background=note.background;
  console.log('children',note.children);
  for(var c of note.children){
    show(c);
  }
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
  if(retrieve(key)||checknameconflict()){
    alert("A similar name already exists, please try again.");
    return;
  }
  var notebook=create(key,name);
  notebook.background='gray';
  update(key,notebook);
  load();
  let input=document.querySelector('#activenotebook');
  for(var i=0;i<input.options.length;i++){
      if(input.options[i].textContent==name) {
        input.selectedIndex=i;
        break;
      }
  }
  open(key);
}

export function deletenotebook(){
  if(!active) return;
  var note=retrieve(active);
  if(!confirm('Are you sure you want to delete this notebook: '+note.title+'?')) return;
  del(active);
  active=false;
  load();
  //TODO clear screen
  //TODO check subnotes being deleted
}

function checknameconflict(name){
  return getnotebooks().filter(n=>n.title.toLowerCase()==name.toLowerCase()).length>0;
}

//this approach leaves us with old keys but that's necessary to preserve subnote hierarchy
export function renamenotebook(){
  if(!active) return;
  let note=retrieve(active);
  let name=prompt('Choose a new name for this notebook:',note.title);
  if(!name) return;
  name=name.trim();
  if(checknameconflict(name)){
    alert("There's already a notebook with this name or similar, please try again.");
    return;
  }
  note.title=name;
  update(active,note);
  load();
}

export function changebackground(){
  if(!active) return;
  var colorpicker=document.querySelector('#colorpicker');
  var note=retrieve(active);
  colorpicker.value=active.background;
  colorpicker.onchange=function(){
    note.background=colorpicker.value;
    update(active,note);
    open(active);
  };
  colorpicker.click();
}

export function getactive(){return active;}
