const projects = [
  {id:'shadow',title:'Shadow Frames',year:'2025',category:'Game audio',role:'Sole audio designer',work:'Built the Wwise and Unreal systems for ten anomalies, edited the assets and mixed the final game.',proof:'Players locate every anomaly by listening; there are no HUD markers or minimap cues.',tools:'Wwise · UE5 · C++ · Reaper',image:'/old/public/assets/images/projects-shadowframes/story/03-seating-room.jpg',alt:'Shadow Frames abandoned pub',link:'/dist/shadowframes.html',caps:['Implement','Design']},
  {id:'xr',title:'XR Labs',year:'Current',category:'VR / AR',role:'Technical sound designer',work:'Design and implementation for Unity VR and AR training, including direction, obstruction, distance and weapon audio.',proof:'Public footage and recreated diagrams show the principles without exposing client assets or internal settings.',tools:'Unity · Steam Audio · Perforce',image:'/old/public/assets/images/about-grid/xrlabssoldiers.png',alt:'XR Labs VR training simulation',link:'/dist/xrlabs.html',caps:['Implement','Design']},
  {id:'transientica',title:'Transientica',year:'In development',category:'Audio ML',role:'Solo developer',work:'Rebuilt beatbox classification inside Unity: onset detection, a 512-sample FFT, seven features and KNN in C#.',proof:'The current build trains on the player’s own kick, snare and hi-hat and uses Unity’s audio clock for timing judgements.',tools:'Unity 6 · C# · DSP · KNN',image:'/transienticascreenshot.png',alt:'Transientica rhythm game',link:'/dist/transientica.html',caps:['Program','Research']},
  {id:'nottoday',title:'Not Today, Darling!',year:'2025',category:'Game audio',role:'Sole audio designer',work:'Edited roughly 450 source files, built procedural MetaSounds engines and handled implementation, VO and the final mix.',proof:'A priority hierarchy keeps the local kart audible while four players share a 32-source limit.',tools:'UE5 · MetaSounds · Blueprints · Reaper',image:'/old/public/assets/images/projects/NotTodayPic4.png',alt:'Not Today Darling racing game',link:'/dist/nottoday.html',caps:['Implement','Design']},
  {id:'research',title:'AI Audio Research',year:'Published 2026',category:'Research',role:'Solo researcher and developer',work:'Measured event-to-first-sample latency across 600 generations in a UE5 and Python prototype.',proof:'The fastest tested generator reached 1.9 seconds at p95 against the prototype’s 150 ms interaction target.',tools:'UE5 · C++ · Python · Generative audio',image:'/aithesiscover.png',alt:'AI audio thesis cover',link:'/dist/ai-audio-research.html',caps:['Program','Research']},
  {id:'audioq',title:'AudioQ',year:'2024–2025',category:'Audio software',role:'Solo developer',work:'Built a VST3 and standalone sampler with granular playback, filters, dynamics and glitch processing.',proof:'Sixteen APVTS parameters provide host automation and saved plugin state.',tools:'C++17 · JUCE 8 · VST3',image:'/audioqscreenshot.png',alt:'AudioQ plugin interface',link:'/dist/audioq.html',caps:['Program']},
  {id:'sidar',title:'SIDAR:NULL',year:'In development',category:'Original project',role:'Concept, direction and prototype development',work:'Developing an original psychological horror project and its first Unreal prototype.',proof:'The project page includes the first week prototype recording.',tools:'Unreal Engine · Prototyping · Game audio',image:'/old/public/assets/images/projects-sidar/sidar-null-poster.jpg',alt:'SIDAR NULL poster',link:'/dist/sidar.html',caps:['Design','Implement']}
];

const capabilities = {
  Implement:'Wwise, Unreal, Unity, MetaSounds and Steam Audio systems tied to gameplay state.',
  Design:'Sound editing, recording, foley and mixes built for interactive priorities.',
  Program:'C++, C#, Python and JUCE tools, DSP and engine-side audio code.',
  Research:'Measured prototypes, documented limitations and reproducible technical comparisons.'
};

const root = document.querySelector('#app');
const layout = document.body.dataset.layout;
const names = {inspector:'Capability Inspector',index:'Project Index',dual:'Dual Index',brief:'Recruiter Brief',table:'Evidence Table',sequence:'Capability Sequence',compare:'Compare View',map:'Role Map',dossier:'Project Dossier',library:'Proof Library'};

function shell(content){
  root.innerHTML=`<header class="top"><a class="brand" href="/portfolio-mockups-round2/">Igor Szuniewicz</a><span>${names[layout]}</span><nav><a href="#work">Work</a><a href="#profile">Profile</a><a href="mailto:igorszuniewiczwork@gmail.com">Contact</a></nav></header>${content}<footer><span>Technical Sound Designer & Audio Programmer</span><a href="/portfolio-mockups-round2/">All round two directions ↑</a></footer>`;
}
function factList(p){return `<dl class="facts"><div><dt>Role</dt><dd>${p.role}</dd></div><div><dt>Work</dt><dd>${p.work}</dd></div><div><dt>Proof</dt><dd>${p.proof}</dd></div><div><dt>Tools</dt><dd>${p.tools}</dd></div></dl>`}
function media(p){return `<img src="${p.image}" alt="${p.alt}">`}
function projectDetail(p,extra=''){return `<article class="detail" data-project="${p.id}"><div class="detail-media">${media(p)}</div><div class="detail-copy"><div class="meta"><span>${p.category}</span><span>${p.year}</span></div><h2>${p.title}</h2>${factList(p)}<a class="open" href="${p.link}">Open case study →</a>${extra}</div></article>`}
function projectButtons(items=projects){return items.map((p,i)=>`<button class="project-button${i===0?' active':''}" data-id="${p.id}"><strong>${p.title}</strong><span>${p.role}</span><small>${p.tools}</small></button>`).join('')}
function updateDetail(container,p){container.innerHTML=projectDetail(p);}

function inspector(){
  shell(`<main id="work" class="inspector"><aside><p class="label">Choose a capability</p><div class="cap-buttons">${Object.keys(capabilities).map((c,i)=>`<button class="cap-button${i===0?' active':''}" data-cap="${c}"><strong>${c}</strong><span>${capabilities[c]}</span></button>`).join('')}</div></aside><section class="inspection"><header><p class="label">Projects as evidence</p><h1>What I do, and where I have done it.</h1></header><div class="inspect-projects">${projectButtons(projects.filter(p=>p.caps.includes('Implement')))}</div><div class="inspect-detail">${projectDetail(projects[0])}</div></section></main>`);
  const capBtns=[...root.querySelectorAll('.cap-button')], list=root.querySelector('.inspect-projects'), detail=root.querySelector('.inspect-detail');
  function bindProject(){list.querySelectorAll('.project-button').forEach(b=>b.onclick=()=>{list.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');updateDetail(detail,projects.find(p=>p.id===b.dataset.id))})}
  capBtns.forEach(b=>b.onclick=()=>{capBtns.forEach(x=>x.classList.remove('active'));b.classList.add('active');const items=projects.filter(p=>p.caps.includes(b.dataset.cap));list.innerHTML=projectButtons(items);updateDetail(detail,items[0]);bindProject()});bindProject();
}

function projectIndex(){
  shell(`<main id="work" class="project-index"><aside><p class="label">Selected work</p><h1>Project index</h1><div class="index-list">${projectButtons()}</div></aside><section class="index-detail">${projectDetail(projects[0])}</section></main>`);
  const detail=root.querySelector('.index-detail');root.querySelectorAll('.project-button').forEach(b=>b.onclick=()=>{root.querySelectorAll('.project-button').forEach(x=>x.classList.remove('active'));b.classList.add('active');updateDetail(detail,projects.find(p=>p.id===b.dataset.id))});
}

function dualIndex(){
  shell(`<main id="work" class="dual-index"><aside class="dual-caps"><p class="label">Capability</p>${Object.keys(capabilities).map((c,i)=>`<button data-cap="${c}" class="${i===0?'active':''}">${c}</button>`).join('')}</aside><aside class="dual-projects"><p class="label">Project</p>${projectButtons(projects.filter(p=>p.caps.includes('Implement')))}</aside><section class="dual-detail">${projectDetail(projects[0])}</section></main>`);
  const caps=[...root.querySelectorAll('.dual-caps button')],pList=root.querySelector('.dual-projects'),detail=root.querySelector('.dual-detail');
  function bind(){pList.querySelectorAll('.project-button').forEach(b=>b.onclick=()=>{pList.querySelectorAll('.project-button').forEach(x=>x.classList.remove('active'));b.classList.add('active');updateDetail(detail,projects.find(p=>p.id===b.dataset.id))})}
  caps.forEach(b=>b.onclick=()=>{caps.forEach(x=>x.classList.remove('active'));b.classList.add('active');const items=projects.filter(p=>p.caps.includes(b.dataset.cap));pList.querySelectorAll('.project-button').forEach(x=>x.remove());pList.insertAdjacentHTML('beforeend',projectButtons(items));updateDetail(detail,items[0]);bind()});bind();
}

function recruiterBrief(){
  shell(`<main id="work" class="recruiter"><section class="recruiter-top"><div><p class="label">Technical Sound Designer & Audio Programmer</p><h1>Game audio implementation, design and programming.</h1></div><p>I build interactive audio in Wwise, Unreal and Unity. Currently at XR Labs Belgium and finishing Game Sound Integration at Howest DAE.</p><dl><div><dt>Available for</dt><dd>Junior technical sound design roles</dd></div><div><dt>Based</dt><dd>Kortrijk, Belgium</dd></div></dl></section><nav class="cap-summary">${Object.entries(capabilities).map(([k,v])=>`<a href="#cap-${k}"><strong>${k}</strong><span>${v}</span></a>`).join('')}</nav><section class="brief-projects">${projects.slice(0,5).map(p=>`<article><div>${media(p)}</div><div class="meta"><span>${p.category}</span><span>${p.year}</span></div><h2><a href="${p.link}">${p.title}</a></h2><p>${p.role}. ${p.work}</p><small>${p.tools}</small></article>`).join('')}</section></main>`);
}

function evidenceTable(){
  shell(`<main id="work" class="table-layout"><header><p class="label">All selected work</p><h1>Evidence table</h1><p>Open a row to inspect role, contribution and proof without leaving the list.</p></header><div class="work-table">${projects.map((p,i)=>`<article class="table-row${i===0?' open-row':''}"><button aria-expanded="${i===0}"><span>${p.title}</span><span>${p.role}</span><span>${p.year}</span><b>${i===0?'−':'+'}</b></button><div class="row-detail">${projectDetail(p)}</div></article>`).join('')}</div></main>`);
  root.querySelectorAll('.table-row>button').forEach(b=>b.onclick=()=>{const row=b.parentElement,open=row.classList.toggle('open-row');b.setAttribute('aria-expanded',open);b.querySelector('b').textContent=open?'−':'+'});
}

function sequence(){
  shell(`<main id="work" class="sequence"><header><p class="label">Capability-led portfolio</p><h1>Four areas of practice. Projects underneath.</h1></header>${Object.entries(capabilities).map(([cap,desc])=>{const items=projects.filter(p=>p.caps.includes(cap)).slice(0,2);return `<section id="cap-${cap}"><div class="sequence-title"><h2>${cap}</h2><p>${desc}</p></div><div class="sequence-cases">${items.map(p=>`<article>${media(p)}<p class="label">${p.role}</p><h3><a href="${p.link}">${p.title}</a></h3><p>${p.work}</p><small>${p.tools}</small></article>`).join('')}</div></section>`}).join('')}</main>`);
}

function compare(){
  shell(`<main id="work" class="compare"><header><p class="label">Compare project evidence</p><h1>Two projects, one consistent set of questions.</h1></header><div class="compare-controls"><label>Left project<select id="left">${projects.map((p,i)=>`<option value="${p.id}"${i===0?' selected':''}>${p.title}</option>`).join('')}</select></label><label>Right project<select id="right">${projects.map((p,i)=>`<option value="${p.id}"${i===1?' selected':''}>${p.title}</option>`).join('')}</select></label></div><div class="compare-grid"><div id="left-detail">${projectDetail(projects[0])}</div><div id="right-detail">${projectDetail(projects[1])}</div></div></main>`);
  ['left','right'].forEach(side=>root.querySelector(`#${side}`).onchange=e=>updateDetail(root.querySelector(`#${side}-detail`),projects.find(p=>p.id===e.target.value)));
}

function roleMap(){
  shell(`<main id="work" class="role-map"><header><p class="label">Role map</p><h1>Capabilities and the projects that prove them.</h1></header><div class="role-columns">${Object.entries(capabilities).map(([cap,desc])=>`<section><h2>${cap}</h2><p>${desc}</p>${projects.filter(p=>p.caps.includes(cap)).map(p=>`<button data-id="${p.id}"><strong>${p.title}</strong><span>${p.role}</span></button>`).join('')}</section>`).join('')}</div><div class="map-detail">${projectDetail(projects[0])}</div></main>`);
  const detail=root.querySelector('.map-detail');root.querySelectorAll('.role-columns button').forEach(b=>b.onclick=()=>updateDetail(detail,projects.find(p=>p.id===b.dataset.id)));
}

function dossier(){
  shell(`<main id="work" class="dossier"><aside><p class="label">Project dossier</p><div class="dossier-list">${projects.map((p,i)=>`<a href="#d-${p.id}" class="${i===0?'active':''}"><strong>${p.title}</strong><span>${p.category} · ${p.year}</span></a>`).join('')}</div></aside><section>${projects.map(p=>`<article id="d-${p.id}" class="dossier-page"><div class="meta"><span>${p.category}</span><span>${p.year}</span></div><h2>${p.title}</h2><p class="dossier-role">${p.role}</p>${media(p)}${factList(p)}<a class="open" href="${p.link}">Open case study →</a></article>`).join('')}</section></main>`);
}

function proofLibrary(){
  const groups=[['Gameplay','shadow','nottoday','transientica'],['Implementation','shadow','xr','sidar'],['Research','research','transientica'],['Tools','audioq','research']];
  shell(`<main id="work" class="library"><header><p class="label">Evidence library</p><h1>Start from what you want to inspect.</h1><p>Gameplay, implementation, research and tools each lead back to the project context.</p></header><div class="library-groups">${groups.map(([name,...ids])=>`<section><h2>${name}</h2>${ids.map(id=>{const p=projects.find(x=>x.id===id);return `<button data-id="${p.id}">${media(p)}<strong>${p.title}</strong><span>${p.proof}</span></button>`}).join('')}</section>`).join('')}</div><div class="library-detail">${projectDetail(projects[0])}</div></main>`);
  const detail=root.querySelector('.library-detail');root.querySelectorAll('.library-groups button').forEach(b=>b.onclick=()=>updateDetail(detail,projects.find(p=>p.id===b.dataset.id)));
}

({inspector, index:projectIndex, dual:dualIndex, brief:recruiterBrief, table:evidenceTable, sequence, compare, map:roleMap, dossier, library:proofLibrary}[layout] || projectIndex)();
