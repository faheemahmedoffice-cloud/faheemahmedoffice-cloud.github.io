/* Portfolio Studio: local editor + optional GitHub Contents API publishing.
   Access to publish is controlled by a GitHub fine-grained token with Contents: Read and write.
   Tokens are held in memory only and are never written to site files or storage. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const make = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text;
    return node;
  };
  const copy = value => JSON.parse(JSON.stringify(value));
  const FALLBACK = window.PORTFOLIO_FALLBACK || {site:{},projects:[],experience:[],skills:[],tools:[],socials:[],highlights:[]};
  let draft = copy(FALLBACK);
  let snapshot = JSON.stringify(draft);
  let tab = 'profile';
  let accessToken = ''; // Not stored, exported or displayed.
  let remoteSha = '';
  let activeRepo = null;
  let previewTimer;
  const tabs = {
    profile: ['Profile & intro', 'Edit the words people see first.'],
    projects: ['Selected projects', 'Add, remove, reorder and update your portfolio work.'],
    experience: ['Work experience', 'Keep your career journey current and accurate.'],
    skills: ['Skills & tools', 'Show what you do and the software you use.'],
    links: ['Social links', 'Manage the profiles visitors can open.'],
    publishing: ['Publishing & access', 'Connect to your own GitHub repository to make edits live.']
  };
  function notice(message, error=false){const node=$('#notification');node.hidden=false;node.textContent=message;node.classList.toggle('error',error);}
  function updateStatus() {
    const dirty=JSON.stringify(draft)!==snapshot;
    $('#draftStatus').lastChild.textContent=dirty?' Unsaved changes':accessToken?' Connected to GitHub':' Local draft';
    $('#publishButton').textContent=accessToken?'Publish changes ↗':'Set up publishing ↗';
  }
  function field(path,label,kind='text',help='',opts={}){
    const wrap=make('div','field'),lab=make('label','',label),id='fld-'+path.replace(/[^a-z0-9]/gi,'-');lab.htmlFor=id;wrap.append(lab);
    let node;
    if(kind==='textarea'){node=make('textarea');node.rows=opts.rows||4;}
    else if(kind==='select'){node=make('select');(opts.choices||[]).forEach(([value,text])=>{const op=make('option','',text);op.value=value;node.append(op);});}
    else{node=make('input');node.type=kind==='checkbox'?'checkbox':kind==='email'?'email':'text';}
    node.id=id;node.dataset.path=path;
    const value=getPath(draft,path);
    if(kind==='checkbox')node.checked=!!value;
    else if(Array.isArray(value))node.value=value.join(opts.join==='lines'?'\n':', ');
    else node.value=value ?? '';
    if(opts.array)node.dataset.array=opts.array;
    if(opts.placeholder)node.placeholder=opts.placeholder;
    wrap.append(node);if(help)wrap.append(make('small','',help));return wrap;
  }
  function grid(...fields){const wrapper=make('div','field-grid');wrapper.append(...fields);return wrapper;}
  function card(title,description=''){const c=make('section','editor-card');c.append(make('h2','',title));if(description)c.append(make('p','',description));return c;}
  function getPath(obj,path){return path.split('.').reduce((val,key)=>val?.[key],obj);}
  function setPath(obj,path,value){const parts=path.split('.');let target=obj;parts.slice(0,-1).forEach(p=>target=target[p]);target[parts.at(-1)]=value;}
  function button(label,action,scope='',className='soft-btn'){
    const b=make('button',className,label);b.type='button';b.dataset.action=action;if(scope!==undefined)b.dataset.scope=scope;return b;
  }
  function actionRow(type,index,title){
    const row=make('div','entry-header');row.append(make('h2','',title));const controls=make('div','entry-controls');
    controls.append(button('↑','up-'+type,String(index)),button('↓','down-'+type,String(index)),button('Remove','remove-'+type,String(index),'delete'));
    row.append(controls);return row;
  }
  function renderProfile(pane){
    const first=card('Your first impression','A short, direct introduction usually works better than a long biography.');
    first.append(grid(field('site.name','Full name'),field('site.title','Professional title')));
    first.append(field('site.eyebrow','Short label above headline'));
    first.append(field('site.headline','Main headline'));
    first.append(field('site.intro','Intro paragraph','textarea'));
    first.append(grid(field('site.availability','Availability status'),field('site.location','Location')));
    pane.append(first);
    const second=card('About & contact','Edit the lower About and Contact sections.');
    second.append(field('site.aboutHeading','About heading'));
    second.append(field('site.about','About paragraph','textarea'));
    second.append(field('site.email','Public email','email'));
    second.append(field('site.education','Education line'));
    second.append(field('site.footerNote','Footer note'));
    pane.append(second);
    const stats=card('Quick highlights','Use verified, meaningful numbers. These appear beneath your projects.');
    (draft.highlights||[]).forEach((h,i)=>stats.append(grid(field(`highlights.${i}.number`,'Highlight '+(i+1)+' / Number'),field(`highlights.${i}.label`,'Highlight '+(i+1)+' / Description'))));
    pane.append(stats);
  }
  function renderProjects(pane){
    const hint=make('div','inline-note','Tip: Upload actual project screenshots somewhere public and link to them from your project websites. This design currently uses original abstract illustrations, not fake screenshots.');pane.append(hint);
    draft.projects.forEach((project,i)=>{
      const c=card('');c.firstChild.remove();c.append(actionRow('project',i,project.title||'Untitled project'));
      c.append(grid(field(`projects.${i}.title`,'Project title'),field(`projects.${i}.subtitle`,'Short subtitle')));
      c.append(grid(field(`projects.${i}.category`,'Filter category','select','',{choices:[['Product','Product'],['Design','Design'],['Creative','Creative']]}),field(`projects.${i}.visual`,'Artwork theme','select','',{choices:[['agri','Green / growth'],['forest','Forest green'],['trust','Soft blue'],['insure','Warm orange'],['nature','Olive green'],['study','Lavender'],['film','Dark / film']]})));
      c.append(field(`projects.${i}.description`,'Project summary','textarea'));
      c.append(field(`projects.${i}.role`,'Your contribution'));
      c.append(field(`projects.${i}.tags`,'Skill tags (comma-separated)','text','Shown as small chips under each project.',{array:'comma'}));
      c.append(field(`projects.${i}.url`,'Project URL','text','Optional: leave blank when no public URL is available.'));
      c.append(field(`projects.${i}.image`,'Project cover image URL (optional)','text','Upload an image to your repo and enter its relative path, such as images/agrigate.jpg, or use a public https:// image URL.'));
      c.append(field(`projects.${i}.featured`,'Featured full-width project','checkbox'));
      pane.append(c);
    });
    pane.append(button('+ Add project','add-project'));
  }
  function renderExperience(pane){
    draft.experience.forEach((e,i)=>{
      const c=card('');c.firstChild.remove();c.append(actionRow('experience',i,e.role||'New role'));
      c.append(grid(field(`experience.${i}.role`,'Role'),field(`experience.${i}.company`,'Organization')));
      c.append(field(`experience.${i}.period`,'Dates / period'));
      c.append(field(`experience.${i}.description`,'Work summary','textarea'));
      pane.append(c);
    });pane.append(button('+ Add experience','add-experience'));
  }
  function renderSkills(pane){
    draft.skills.forEach((s,i)=>{
      const c=card('');c.firstChild.remove();c.append(actionRow('skill',i,s.title||'Skill group'));
      c.append(field(`skills.${i}.title`,'Group name'));
      c.append(field(`skills.${i}.description`,'Short description'));
      c.append(field(`skills.${i}.items`,'Skills (one per line)','textarea','Keep each skill short and specific.',{array:'lines',join:'lines',rows:7}));
      pane.append(c);
    });pane.append(button('+ Add skill group','add-skill'));
    const tools=card('Software & platforms','Enter a tool on each line.');
    tools.append(field('tools','Tools (one per line)','textarea','For example: Figma, FigJam, Microsoft Office.',{array:'lines',join:'lines',rows:10}));
    pane.append(tools);
  }
  function renderLinks(pane){
    draft.socials.forEach((s,i)=>{
      const c=card('');c.firstChild.remove();c.append(actionRow('social',i,s.label||'Social profile'));
      c.append(grid(field(`socials.${i}.label`,'Link label'),field(`socials.${i}.url`,'Full link (https://...)')));
      pane.append(c);
    });pane.append(button('+ Add social link','add-social'));
  }
  function publishingField(id,title,placeholder='',type='text'){
    const w=make('div','field');const l=make('label','',title);l.htmlFor=id;
    const inp=make('input');inp.id=id;inp.type=type;inp.placeholder=placeholder;inp.autocomplete='off';w.append(l,inp);return w;
  }
  function renderPublishing(pane){
    const how=card('Free hosting. Your GitHub address.','Your portfolio runs on GitHub Pages without purchasing a domain or server.');
    const ol=make('ol','publish-steps');
    const steps=[
      'Create a free GitHub account (if needed).',
      'Create a public repository named YOUR-USERNAME.github.io (replace YOUR-USERNAME with your real GitHub username).',
      'Upload all files from the unzipped portfolio folder into the repository root and commit.',
      'Go to repository Settings → Pages. Choose Deploy from a branch → main → /(root), then Save.',
      'Your website will appear at https://YOUR-USERNAME.github.io/ after GitHub publishes it.',
      'Create a fine-grained Personal Access Token restricted to that repository, with Contents: Read and write, only when you need to publish edits from this admin page.'
    ];steps.forEach(s=>ol.append(make('li','',s)));how.append(ol);
    const note=make('div','inline-note','Security: The editor has no shared password. Publishing requires your private GitHub token, which stays in this browser tab only. Never upload the token to your repository or share it. Repository content is public.');how.append(note);pane.append(how);
    const c=card('Connect your repository','The GitHub token is never saved to local storage, cookies, HTML or content.json.');
    const owner=publishingField('githubOwner','GitHub username','e.g. your-username');
    const repo=publishingField('githubRepo','Repository name','e.g. your-username.github.io');
    c.append(grid(owner,repo));c.append(publishingField('githubBranch','Branch','main'));
    c.append(publishingField('githubToken','Fine-grained personal access token','github_pat_…','password'));
    c.append(make('p','github-indicator '+(accessToken?'':'off'),accessToken?'● GitHub connected: '+activeRepo.owner+'/'+activeRepo.repo:'○ Not connected yet. Local editing and JSON export still work.'));
    const row=make('div','button-row');row.append(button('Connect & load GitHub content','connect-github'),button('Disconnect','disconnect-github','','ghost-btn'));c.append(row);pane.append(c);
    const ex=card('Prefer to edit without a token?','Export your updated content.json, upload it to your GitHub repository, and commit. GitHub Pages will republish automatically.');
    ex.append(button('↓ Download content.json','export-content','','ghost-btn'));pane.append(ex);
    const githubOwner=localStorage.getItem('portfolio:githubOwner')||'';
    $('#githubOwner').value=activeRepo?.owner||githubOwner;
    $('#githubRepo').value=activeRepo?.repo||localStorage.getItem('portfolio:githubRepo')||'';
    $('#githubBranch').value=activeRepo?.branch||localStorage.getItem('portfolio:githubBranch')||'main';
  }
  function renderTab(){
    setText('tabTitle',tabs[tab][0]);setText('tabDescription',tabs[tab][1]);
    document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    const pane=$('#editorPane');pane.replaceChildren();
    if(tab==='profile')renderProfile(pane);
    if(tab==='projects')renderProjects(pane);
    if(tab==='experience')renderExperience(pane);
    if(tab==='skills')renderSkills(pane);
    if(tab==='links')renderLinks(pane);
    if(tab==='publishing')renderPublishing(pane);
    updateStatus();
  }
  function setText(id,value){const node=document.getElementById(id);if(node)node.textContent=value;}
  function postPreview(){try{$('#previewFrame').contentWindow.postMessage({type:'portfolio-preview',data:draft},'*');}catch(e){console.warn('Preview currently unavailable',e);}}
  function schedulePreview(){clearTimeout(previewTimer);previewTimer=setTimeout(postPreview,90);updateStatus();}
  function exportContent(){
    const json=JSON.stringify(draft,null,2)+'\n';const blob=new Blob([json],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='content.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
    notice('Downloaded content.json. Upload it into your GitHub repository to publish manually.');
  }
  function switchTab(next){tab=next;renderTab();window.scrollTo({top:0,behavior:'smooth'});}
  function mutate(action,index){
    if(action==='add-project'){draft.projects.push({id:'new-'+Date.now(),title:'New project',subtitle:'What it is',category:'Design',description:'Describe your work and impact.',role:'Your contribution',tags:['Design'],url:'',image:'',visual:'study',featured:false});}
    else if(action==='add-experience'){draft.experience.push({role:'New role',company:'Organization',period:'Year – Year',description:'Briefly explain the work.'});}
    else if(action==='add-skill'){draft.skills.push({title:'New expertise',description:'What you offer',items:['First skill']});}
    else if(action==='add-social'){draft.socials.push({label:'Profile',url:'https://'});}
    else{
      const [verb,type]=action.split('-');const key=({project:'projects',experience:'experience',skill:'skills',social:'socials'})[type];
      if(!key || !draft[key])return;
      const arr=draft[key];
      if(verb==='remove'){if(!confirm('Remove this item from your draft?'))return;arr.splice(index,1);}
      if(verb==='up'&&index>0)[arr[index-1],arr[index]]=[arr[index],arr[index-1]];
      if(verb==='down'&&index<arr.length-1)[arr[index+1],arr[index]]=[arr[index],arr[index+1]];
    }
    renderTab();schedulePreview();
  }
  function utf8Base64(str){const bytes=new TextEncoder().encode(str);let binary='';for(let i=0;i<bytes.length;i++)binary+=String.fromCharCode(bytes[i]);return btoa(binary);}
  async function githubRequest(path,options={}){
    const response=await fetch('https://api.github.com'+path,{
      ...options,headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+accessToken,'X-GitHub-Api-Version':'2022-11-28',...(options.headers||{})}
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.message||('GitHub error '+response.status));
    return result;
  }
  async function connectGitHub(){
    const owner=$('#githubOwner').value.trim(),repo=$('#githubRepo').value.trim(),branch=$('#githubBranch').value.trim()||'main',token=$('#githubToken').value.trim();
    if(!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(owner)||!/^[a-z\d_.-]+$/i.test(repo)||!/^[a-z\d._/-]+$/i.test(branch)||!token){notice('Enter a valid GitHub username, repository, branch and personal access token.',true);return;}
    if(JSON.stringify(draft)!==snapshot&&!confirm('Loading from GitHub will replace your unsaved local edits. Continue?'))return;
    accessToken=token;const path=`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/content.json?ref=${encodeURIComponent(branch)}`;
    try{
      const remote=await githubRequest(path);
      if(!remote.sha||!remote.content)throw Error('content.json was not found. Upload the portfolio files first.');
      const source=remote.content.replace(/\s/g,'');
      const bytes=Uint8Array.from(atob(source),ch=>ch.charCodeAt(0));
      const parsed=JSON.parse(new TextDecoder().decode(bytes));
      if(!parsed.site||!Array.isArray(parsed.projects))throw Error('GitHub content.json does not match this portfolio.');
      remoteSha=remote.sha;activeRepo={owner,repo,branch};draft=parsed;snapshot=JSON.stringify(draft);
      ['githubOwner','githubRepo','githubBranch'].forEach((key,i)=>localStorage.setItem('portfolio:'+key,[owner,repo,branch][i]));
      renderTab();schedulePreview();notice('Connected. Loaded your current public portfolio from GitHub. Your token is held only in this tab.');
    }catch(e){accessToken='';remoteSha='';activeRepo=null;notice('Connection failed: '+e.message+'. Check the repository name, token permissions and uploaded files.',true);renderTab();}
  }
  async function publish(){
    if(!accessToken||!activeRepo||!remoteSha){switchTab('publishing');notice('To publish directly, connect GitHub below. You can also export content.json and upload it manually.');return;}
    const btn=$('#publishButton');btn.disabled=true;btn.textContent='Publishing…';
    try{
      const path=`/repos/${encodeURIComponent(activeRepo.owner)}/${encodeURIComponent(activeRepo.repo)}/contents/content.json`;
      const result=await githubRequest(path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Update portfolio content from Portfolio Studio',content:utf8Base64(JSON.stringify(draft,null,2)+'\n'),sha:remoteSha,branch:activeRepo.branch})});
      remoteSha=result.content?.sha||remoteSha;snapshot=JSON.stringify(draft);
      notice('Saved to GitHub! Your site will update when GitHub Pages finishes publishing (often a few minutes).');
    }catch(e){notice('Publishing failed: '+e.message+'. Your draft is still here. For 409 conflicts, reconnect to fetch the current file.',true);}
    finally{btn.disabled=false;updateStatus();}
  }
  document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>switchTab(button.dataset.tab)));
  $('#editorPane').addEventListener('input',event=>{
    const element=event.target;const path=element.dataset.path;if(!path)return;
    let value=element.type==='checkbox'?element.checked:element.value;
    if(element.dataset.array==='comma')value=value.split(',').map(s=>s.trim()).filter(Boolean);
    if(element.dataset.array==='lines')value=value.split('\n').map(s=>s.trim()).filter(Boolean);
    setPath(draft,path,value);schedulePreview();
  });
  $('#editorPane').addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button)return;
    if(button.dataset.action==='connect-github')return connectGitHub();
    if(button.dataset.action==='disconnect-github'){accessToken='';activeRepo=null;remoteSha='';renderTab();notice('Disconnected. Your GitHub token is no longer held by the editor.');return;}
    if(button.dataset.action==='export-content')return exportContent();
    mutate(button.dataset.action,Number(button.dataset.scope));
  });
  $('#exportButton').addEventListener('click',exportContent);
  $('#publishButton').addEventListener('click',publish);
  $('#previewFrame').addEventListener('load',postPreview);
  $('#desktopPreview').addEventListener('click',()=>setPreviewMode(false));
  $('#mobilePreview').addEventListener('click',()=>setPreviewMode(true));
  function setPreviewMode(mobile){$('#previewFrameHolder').classList.toggle('mobile',mobile);$('#desktopPreview').classList.toggle('selected',!mobile);$('#mobilePreview').classList.toggle('selected',mobile);$('#desktopPreview').setAttribute('aria-pressed',String(!mobile));$('#mobilePreview').setAttribute('aria-pressed',String(mobile));resizePreview();}
  function resizePreview(){const holder=$('#previewFrameHolder'),frame=$('#previewFrame'),mobile=holder.classList.contains('mobile'),width=mobile?390:1100;const scale=Math.min(1,(holder.clientWidth-16)/width);frame.style.width=width+'px';frame.style.height=(mobile?1800:2200)+'px';frame.style.transform='scale('+scale+')';}
  window.addEventListener('resize',resizePreview);
  window.addEventListener('beforeunload',e=>{if(JSON.stringify(draft)!==snapshot){e.preventDefault();e.returnValue='';}});
  async function loadInitial(){
    try{const response=await fetch('content.json?v='+Date.now(),{cache:'no-store'});if(!response.ok)throw Error('Not found');const parsed=await response.json();if(!parsed.site||!Array.isArray(parsed.projects))throw Error('Invalid content');draft=copy(parsed);snapshot=JSON.stringify(draft);renderTab();postPreview();}
    catch{ /* Bundled fallback allows the editor to open when offline or via file:// */ }
  }
  renderTab();resizePreview();loadInitial();
})();