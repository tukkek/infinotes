import {getnotebook} from './ui.js';
import {retrieve,del} from './db.js';

function fillbackup(key,data){
  let note=retrieve(key);
  data[key]=note;
  for(let c of note.children) fillbackup(c,data);
}

export function savebackup(target){
  let notebook=getnotebook().key;
  if(!notebook) return;
  let backup={'_notebook':notebook,};
  fillbackup(notebook,backup);
  let file=new Blob([JSON.stringify(backup)],{type: 'application/json'});
  target.href=URL.createObjectURL(file);
  target.download='infinotes.json';
}

function restorebackup(data){
  let notebook=data['_notebook'];
  let current=retrieve(notebook);
  if(current){
    let prompt='This action will replace the current "'+current.title+
      '" with the import "'+data[notebook].title+'". Proceed?';
    if(!confirm(prompt)) return;
    del(current.key);
  }
  delete data['_notebook'];
  for(let key in data) {
    console.log(key);
    localStorage.setItem(key,JSON.stringify(data[key]));
  }
  location.reload();
}

export function loadbackup(){
  let input = document.createElement('input');
  input.setAttribute('type','file');
  input.onchange=function(e){
    let reader=new FileReader();
    reader.readAsText(input.files[0]);
    reader.onloadend=function(){
      restorebackup(JSON.parse(reader.result));
    };
  };
  input.click();
}
