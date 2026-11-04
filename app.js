/* Public one-page portfolio. Content is read from content.json on hosted sites. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const el = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text;
    return node;
  };
  const safeLink = (value) => {
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const setText = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = String(value ?? ''); };
  let data = window.PORTFOLIO_FALLBACK || {};
  let filter = 'All';
  let observer;
  const artWords = {
    agri: ['Growing', 'connections.'], forest: ['Nature,', 'in numbers.'],
    trust: ['Clarity', 'by design.'], insure: ['Protection', 'rethought.'],
    nature: ['Design for', 'nature.'], study: ['Learn.', 'Better.'], film: ['Stories', 'that matter.']
  };
  function makeProjectVisual(project) {
    const art = el('div', 'project-visual ' + (['agri','forest','trust','insure','nature','study','film'].includes(project.visual) ? project.visual : 'agri'));
    art.setAttribute('aria-hidden', 'true');
    const image = safeLink(project.image);
    if (image) { const photo=el('img','visual-photo'); photo.src=image; photo.alt=''; photo.loading='lazy'; art.append(photo); art.classList.add('has-image'); }
    const top = el('div', 'visual-top');
    top.append(el('span', '', 'FA / SELECTED WORK'), el('span', 'visual-corner', '↗'));
    const words = artWords[project.visual] || [project.title, ''];
    const title = el('div', 'visual-title', words[0]);
    if (words[1]) title.append(el('span', '', words[1]));
    art.append(top, title, el('div', 'visual-shape'), el('div', 'visual-shape two'), el('div', 'visual-bottom', (project.category || 'Project') + ' / Project'));
    return art;
  }
  function showProject(project) {
    setText('dialogTitle', project.title);
    setText('dialogSubtitle', project.subtitle);
    setText('dialogDescription', project.description);
    setText('dialogRole', project.role ? 'MY CONTRIBUTION  /  ' + project.role : '');
    const tagWrap = $('#dialogTags'); tagWrap.replaceChildren();
    (project.tags || []).forEach(t => tagWrap.append(el('span','',t)));
    const link = $('#dialogLink'); const url = safeLink(project.url);
    link.hidden = !url; if (url) link.href = url;
    const dialog = $('#projectDialog'); if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open','');
  }
  function projectCard(project) {
    const card = el('article', 'project-card reveal' + (project.featured ? ' featured' : ''));
    card.append(makeProjectVisual(project));
    const info = el('div', 'project-info');
    info.append(el('span', 'card-overline', project.category || 'Selected project'));
    info.append(el('h3', '', project.title));
    info.append(el('p', 'project-subtitle', project.subtitle || ''));
    info.append(el('p', 'project-description', project.description || ''));
    const tags = el('div','card-tags');(project.tags || []).forEach(x => tags.append(el('span','',x))); info.append(tags);
    const actions = el('div','project-actions');
    const overview = el('button','', 'Project overview ↗'); overview.type='button'; overview.addEventListener('click',()=>showProject(project)); actions.append(overview);
    const url = safeLink(project.url);
    if (url) { const link = el('a','', 'Visit website ↗'); link.href = url; link.target='_blank'; link.rel='noopener noreferrer'; actions.append(link); }
    info.append(actions);card.append(info);return card;
  }
  function renderProjects() {
    const grid = $('#projectGrid');if(!grid)return;
    grid.replaceChildren();
    const selected = (data.projects || []).filter(p => filter === 'All' || p.category === filter);
    if (!selected.length) grid.append(el('p','project-description','No projects in this category yet.'));
    selected.forEach(p => grid.append(projectCard(p)));
    revealElements();
  }
  function renderStats() {
    const target = $('#statsGrid');target.replaceChildren();
    (data.highlights || []).forEach(h=>{const box=el('div','stat');box.append(el('span','stat-number',h.number),el('div','stat-label',h.label));target.append(box);});
  }
  function renderSkills() {
    const target = $('#skillsGrid');target.replaceChildren();
    (data.skills || []).forEach((group,i) => {
      const card=el('article','skill-card reveal');
      card.append(el('span','skill-index',group.index || String(i+1).padStart(2,'0')));
      card.append(el('h3','',group.title || 'Expertise'));
      card.append(el('p','',group.description || ''));
      const ul=el('ul');(group.items||[]).forEach(s=>ul.append(el('li','',s)));card.append(ul);target.append(card);
    });
    const tags=$('#toolTags');tags.replaceChildren();(data.tools||[]).forEach(s=>tags.append(el('span','',s)));
  }
  function renderExperience() {
    const target=$('#timeline');target.replaceChildren();
    (data.experience||[]).forEach(e=>{
      const row=el('article','timeline-item reveal');
      row.append(el('span','timeline-date',e.period||''));
      const middle=el('div');middle.append(el('div','timeline-role',e.role||''),el('div','timeline-company',e.company||''));row.append(middle);
      row.append(el('p','timeline-description',e.description||''));target.append(row);
    });
  }
  function renderSocials() {
    const target=$('#footerSocials');target.replaceChildren();
    (data.socials||[]).forEach(s=>{
      const url=safeLink(s.url);if(!url)return;
      const a=el('a','',s.label+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';target.append(a);
    });
  }
  function renderSite(next) {
    data=next||data;const s=data.site||{};
    setText('heroEyebrow',s.eyebrow);setText('heroIntro',s.intro);
    const headline=$('#heroTitle');headline.replaceChildren();
    const title=s.headline||'Turning moving parts into momentum.';
    const pieces=title.split(' ');const last=pieces.pop()||'';
    headline.append(document.createTextNode(pieces.join(' ')+' '),el('em','',last));
    setText('availability',s.availability);setText('location',s.location);
    setText('aboutTitle',s.aboutHeading);setText('aboutText',s.about);setText('educationText',s.education);
    setText('footerNote',s.footerNote);setText('footerName',s.name);setText('year',new Date().getFullYear());
    const email=$('#emailLink');email.textContent=(s.email||'Get in touch')+' ↗';
    email.href=s.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email) ? `mailto:${s.email}` : '#contact';
    if(s.name)document.title=s.name+' | '+(s.title||'Portfolio');
    renderProjects();renderStats();renderSkills();renderExperience();renderSocials();revealElements();
  }
  function revealElements() {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(!observer) observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    }),{threshold:.075,rootMargin:'0px 0px 30px 0px'});
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(node=>observer.observe(node));
  }
  function wireControls(){
    $('#projectFilters').addEventListener('click', event=>{
      const btn=event.target.closest('button[data-filter]');if(!btn)return;
      filter=btn.dataset.filter;
      document.querySelectorAll('.filter-chip').forEach(chip=>{const active=chip===btn;chip.classList.toggle('active',active);chip.setAttribute('aria-pressed',String(active));});
      renderProjects();
    });
    $('#dialogClose').addEventListener('click',()=>$('#projectDialog').close());
    $('#projectDialog').addEventListener('click',ev=>{if(ev.target===$('#projectDialog'))$('#projectDialog').close();});
    const menu=$('#mobileMenu'),toggle=$('#menuToggle');
    toggle.addEventListener('click',()=>{
      const expanded=toggle.getAttribute('aria-expanded')==='true';
      toggle.setAttribute('aria-expanded',String(!expanded));toggle.setAttribute('aria-label',expanded?'Open menu':'Close menu');menu.hidden=expanded;
    });
    menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');}));
    if('IntersectionObserver' in window){const sections=[...document.querySelectorAll('main section[id]')];
      const navObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;document.querySelectorAll('.desktop-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));});},{rootMargin:'-25% 0px -65% 0px'});
      sections.forEach(s=>navObserver.observe(s));}
  }
  async function loadContent(){
    try{const response=await fetch('content.json?v='+Date.now(),{cache:'no-store'});if(!response.ok)throw new Error('Content unavailable');
      const value=await response.json();if(!value.site||!Array.isArray(value.projects))throw new Error('Invalid content');renderSite(value);
    }catch(error){console.info('Showing bundled portfolio content. Hosted sites load content.json.',error.message);}
  }
  wireControls();renderSite(data);document.documentElement.classList.add('js-motion');loadContent();
  /* Same-origin preview for the owner editor. Never writes public content. */
  window.addEventListener('message',event=>{
    if(window.parent===window||event.source!==window.parent)return;
    if(event.origin!==location.origin && location.protocol!=='file:')return;
    if(event.data?.type==='portfolio-preview'&&event.data?.data?.site)renderSite(event.data.data);
  });
})();