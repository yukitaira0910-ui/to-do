const storeKey = 'flow-tasks';
const seed = [{id:'welcome', title:'最初のタスクを追加する', status:'active'}];
let tasks = JSON.parse(localStorage.getItem(storeKey) || 'null') || seed;
let filter = 'all';
const $ = (s) => document.querySelector(s);
const save = () => localStorage.setItem(storeKey, JSON.stringify(tasks));
const visible = () => tasks.filter(t => filter === 'all' || t.status === filter);
function render(){
  const list = $('#task-list'); list.replaceChildren();
  visible().forEach(task => { const node = $('#task-template').content.firstElementChild.cloneNode(true); const card = node.querySelector('.task-card'); card.dataset.id = task.id; node.dataset.id = task.id; node.querySelector('.task-title').textContent = task.title; if(task.status==='done') card.classList.add('done'); node.querySelector('.check').onclick=()=>setStatus(task.id, task.status==='done'?'active':'done'); addSwipe(node, card, task); list.append(node); });
  if(!visible().length) list.innerHTML='<p class="empty">タスクはありません</p>';
  ['all','active','done'].forEach(kind=>$('#count-'+kind).textContent=kind==='all'?tasks.length:tasks.filter(t=>t.status===kind).length);
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));
}
function setStatus(id,status){tasks=tasks.map(t=>t.id===id?{...t,status}:t);save();render()}
function addTask(){const input=$('#task-input'), title=input.value.trim();if(!title)return;tasks.unshift({id:crypto.randomUUID(),title,status:'active'});save();input.value='';render()}
function addSwipe(wrap,card,task){let start=0,delta=0; const move=e=>{delta=e.clientX-start;card.style.transform=`translateX(${delta}px)`;wrap.querySelector(delta<0?'.done-bg':'.later-bg').style.opacity=Math.min(Math.abs(delta)/90,1)};card.addEventListener('pointerdown',e=>{start=e.clientX;card.setPointerCapture(e.pointerId)});card.addEventListener('pointermove',e=>{if(start)move(e)});card.addEventListener('pointerup',()=>{if(Math.abs(delta)>88){setStatus(task.id,delta<0?'done':'active')}else{card.style.transform='';wrap.querySelectorAll('.swipe-bg').forEach(x=>x.style.opacity=0)}start=0;delta=0});}
$('#add-task').onclick=addTask; $('#new-task').onclick=()=>$('#task-input').focus(); $('#task-input').addEventListener('keydown',e=>{if(e.key==='Enter')addTask()});document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render()});$('#profile').onclick=()=>$('#login-dialog').showModal();$('.close').onclick=()=>$('#login-dialog').close();$('#google-login').onclick=()=>{location.href='/api/auth/google'};$('#day').textContent=new Intl.DateTimeFormat('ja-JP',{month:'long',day:'numeric',weekday:'short'}).format(new Date());
setTimeout(()=>{$('#loading').hidden=true;$('#app').hidden=false;render()},650);
