// deal with the persistence layer, currently localStorage but some day may become MongoDB or similar
export function tokey(name){
  if(name.length==0||name.indexOf('.')>=0) return false;
  while(name.indexOf(' ')>=0) name=name.replace(' ','');
  return name.toLowerCase();
}

export function create(key,name){
  localStorage.setItem(key,JSON.stringify({
    title:name,
    background:'gray',
    children:[],
  }));
}

export function retrieve(key){
  var note=JSON.parse(localStorage.getItem(key));
  if(note) note.key=key;
  return note;
}

export function update(key,item){localStorage.setItem(key,JSON.stringify(item));}

// remove note and children
// should be called delete, but delete is a javascript keyword
export function del(key){
  var remove=[];
  for(var i=0;i<=localStorage.length;i++){
    var k=localStorage.key(i);
    if(k==key||key.indexOf(key+'.')==0) remove.push(k);
  }
  for(var r of remove) localStorage.removeItem(r);
}

export function getnotebooks(){
  var notebooks=[];
  for(let i=0;i<localStorage.length;i++){
    let key=localStorage.key(i);
    if(key.indexOf('.')<0) notebooks.push(retrieve(key));
  }
  return notebooks;
}
