const $=id=>document.getElementById(id);
let current=1,step=0,elements=[],view,mapStarted=false,renderToken=0;
const sequenceDefinitions={3:{images:['reserva.jpg','proyecto.jpg'],labels:['Reserva RBTTF','Ámbito del proyecto']},5:{images:['corredores.jpg','maa.jpg','ccb.jpg'],labels:['Corredores y áreas protegidas','MAA','CCB']}};
const sequences={};
const loadImage=src=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src='assets/'+src});
const rasterCache=new Map();
// Reveal only changed original pixels, preserving supplied map coordinates and symbols.
async function mapLayers(){
 if(rasterCache.has('layers'))return rasterCache.get('layers');
 const promise=Promise.all(sequenceDefinitions[5].images.map(loadImage)).then(images=>{
  const w=images[0].naturalWidth,h=images[0].naturalHeight;
  const read=im=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,w,h);return x.getImageData(0,0,w,h)};
  const base=read(images[0]);return images.map((im,k)=>{
   if(!k)return im.src;
   const raw=read(im),a=raw.data,b=base.data;
   for(let j=0;j<a.length;j+=4){const delta=Math.max(Math.abs(a[j]-b[j]),Math.abs(a[j+1]-b[j+1]),Math.abs(a[j+2]-b[j+2]));
    // JPEG noise is below this threshold. Only orange MAA symbols / CCB differences remain.
    const isMAA=a[j]>130&&a[j+1]>65&&a[j+1]<210&&a[j+2]<150&&a[j]>a[j+2]*1.35;
    a[j+3]=(delta>42&&(k===2||isMAA))?255:0;
   }
   const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').putImageData(raw,0,0);return c.toDataURL('image/png');
  });
 });rasterCache.set('layers',promise);return promise;
}
function render(){
 const token=++renderToken;document.querySelectorAll('video').forEach(v=>v.pause());
 const slide=elements[current-1],seq=sequences[current];
 $('elements').innerHTML=slide.html||'';$('stage').style.background=slide.background||'#f4f5ef';$('stage').dataset.slide=current;$('stage').dataset.original=slide.original||'';
 $('special').replaceChildren();$('indicators').replaceChildren();$('sequence').hidden=!seq;$('mapPanel').hidden=slide.original!==4;
 if(seq){$('sequence').className=slide.original===3?'d4':'d7';$('frames').replaceChildren();$('steps').replaceChildren();seq.images.forEach((src,i)=>{
  const img=new Image();img.src='assets/'+src;img.alt=seq.labels[i];img.className='map-frame';
  if(elements[current-1].original===5&&i>0)img.style.visibility='hidden';$('frames').append(img);
  const b=document.createElement('button');b.textContent=seq.labels[i];b.onclick=()=>{step=i;renderStep()};$('steps').append(b);
 });
 if(elements[current-1].original===5)mapLayers().then(srcs=>{if(token!==renderToken)return;srcs.forEach((src,i)=>{const im=$('frames').children[i];im.src=src;im.style.visibility='visible';im.classList.toggle('overlay',i>0)});renderStep()}).catch(()=>{if(token!==renderToken)return;$('frames').dataset.fallback='true';[...$('frames').children].forEach(im=>im.style.visibility='visible');renderStep()});
 else delete $('frames').dataset.fallback;
 renderStep();}
 if(slide.kind==='video')renderVideo();
 if(['watersheds','reserve-detail','legacy-projects','resistance'].includes(slide.kind))renderEditorial();
 if(slide.kind==='conservacion')renderCollage();
 if(slide.kind==='ortofoto')renderOrtho();
 if(elements[current-1].original===11)renderEmbed('https://www.arcgis.com/apps/dashboards/eb2df0096bad4811b9cb8e15161b5ed6','Tablero de levantamiento fotogramétrico CCB');
 if(elements[current-1].original===14)renderEmbed('https://experience.arcgis.com/experience/17a96304527549d9a58f65bfbda81a86','Sistema de Monitoreo Plan Trifinio');
 if(elements[current-1].original===4){initMap();if(view)setTimeout(()=>view.invalidateSize(),80)}
 animateNumbers();updateCount();history.replaceState(null,'','#'+current);
}
function updateCount(){$('count').textContent=`${current} / ${elements.length}`;$('prev').disabled=current===1&&step===0;$('next').disabled=current===elements.length;}
function renderStep(){
 [...$('frames').children].forEach((e,i)=>e.classList.toggle('active',elements[current-1].original===5&&!$('frames').dataset.fallback?i<=step:i===step));
 [...$('steps').children].forEach((e,i)=>{e.classList.toggle('active',i===step);e.setAttribute('aria-pressed',String(i===step))});
 if(elements[current-1].original===3){$('indicators').innerHTML=(elements[current-1].mapIndex??step)===0?'<div class="reserve-stats"><div><strong>424,000 <small>ha</small></strong><span>Reserva de Biosfera Trinacional Trifinio</span></div><div><strong>33 <small>municipalidades</small></strong><span>Territorio de la reserva</span></div></div>':elements[current-1].projectIndicators;}
 updateCount();
}
function advance(d){const scene=elements[current-1];if(scene.steps){if(d>0&&step<scene.steps-1){step++;renderEditorialStep();updateCount();return}if(d<0&&step>0){step--;renderEditorialStep();updateCount();return}}const s=sequences[current];if(d>0&&s&&step<s.images.length-1){step++;renderStep();return}if(d<0&&step>0){step--;renderStep();return}const n=current+d;if(n<1||n>elements.length)return;current=n;step=d<0?(elements[n-1].steps?elements[n-1].steps-1:sequences[n]?sequences[n].images.length-1:0):0;render()}
function replay(){step=0;render()}
function full(){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{});}
$('prev').onclick=()=>advance(-1);$('next').onclick=()=>advance(1);$('replay').onclick=replay;$('full').onclick=full;
const interactive='#mapPanel,button,a,input,textarea,select,iframe,video,.collage,.ortho-view,[data-interactive]';
$('stage').onclick=e=>{if(e.target.closest(interactive))return;const r=$('stage').getBoundingClientRect();advance(e.clientX<r.left+r.width/2?-1:1)};
document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,iframe,#mapPanel')||e.altKey||e.ctrlKey||e.metaKey)return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();advance(1)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();advance(-1)}else if(e.key.toLowerCase()==='f')full();else if(e.key.toLowerCase()==='r')replay();});
function renderVideo(){
 $('special').innerHTML='<div class="video-scene" data-interactive><video id="intro" playsinline preload="auto" aria-label="Introducción cartográfica del Trifinio"></video><button id="playVideo" class="media-play" hidden>Reproducir video</button><button id="restartVideo" class="media-restart" aria-label="Reiniciar video">↻ Reiniciar</button><button id="continueVideo" class="media-next">Continuar →</button></div>';
 const v=$('intro');v.src='assets/trifinio.mp4';v.muted=true;
 const play=()=>{v.play().then(()=>$('playVideo').hidden=true).catch(()=>$('playVideo').hidden=false)};
 $('playVideo').onclick=play;$('restartVideo').onclick=()=>{v.currentTime=0;play()};$('continueVideo').onclick=()=>advance(1);
 v.onclick=()=>advance(1);play();
}
function renderCollage(){
 const cards=[['agua.webp','Sistema hídrico'],['nuboso.webp','Bosque nuboso'],['pino.webp','Bosque de pino-encino'],['seco.webp','Bosque seco'],['cultura.webp','Patrimonio cultural tangible e intangible'],['felinos.webp','Felinos y sus presas']];
 $('special').innerHTML='<h1 class="slide-title">Objetos de conservación</h1><p class="slide-kicker">Reserva de Biosfera Trinacional Trifinio</p><div class="collage" aria-label="Seis objetos de conservación">'+cards.map(([src,label],i)=>`<button class="photo photo-${i}" style="--i:${i}" aria-pressed="false"><img src="assets/${src}" alt="${label}"><span>${label}</span></button>`).join('')+'</div>';
 document.querySelectorAll('.photo').forEach(b=>b.onclick=()=>{const on=!b.classList.contains('selected');document.querySelectorAll('.photo').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});
}
function renderOrtho(){
 $('special').innerHTML='<h1 class="slide-title">Levantamiento fotogramétrico de cobertura forestal</h1><div class="ortho-view" data-interactive><img id="ortho" src="assets/ortofoto.webp" alt="Ortofoto suministrada con polígonos originales delimitados en rojo"></div><div class="ortho-tools"><button id="orthoDetail">Acercar a las áreas delimitadas</button><button id="orthoReset">Vista completa</button></div>';
 $('orthoDetail').onclick=()=>$('ortho').classList.add('detail');$('orthoReset').onclick=()=>$('ortho').classList.remove('detail');
}
function renderEmbed(src,title){
 const wrap=document.createElement('section');wrap.className='embed-wrap'+(elements[current-1].original===14?' final-embed':'');wrap.dataset.interactive='';
 const frame=document.createElement('iframe');frame.title=title;frame.src=src;frame.allow='fullscreen';frame.setAttribute('allowfullscreen','');
 const status=document.createElement('div');status.className='embed-loading';status.textContent='Cargando '+title+'…';frame.onload=()=>status.hidden=true;
 wrap.append(frame,status);$('special').append(wrap);
 const expand=document.createElement('button');expand.className='embed-expand';expand.textContent='Ampliar tablero';expand.onclick=()=>{const expanded=wrap.classList.toggle('expanded');expand.textContent=expanded?'Volver a la diapositiva':'Ampliar tablero'};wrap.append(expand);
}
function animateNumbers(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 document.querySelectorAll('#elements .text span').forEach(el=>{
  const s=el.textContent;const match=s.match(/^(USD\s+|€)?(\d[\d,]*(?:\.\d+)?)(\s*(?:ha|M))?$/);if(!match||Number(match[2].replaceAll(',',''))<10)return;
  const target=Number(match[2].replaceAll(',','')),decimals=(match[2].split('.')[1]||'').length,token=renderToken;
  const start=performance.now()+300;function tick(t){if(token!==renderToken)return;const p=Math.max(0,Math.min(1,(t-start)/1000));const v=target*(1-Math.pow(1-p,3));el.textContent=(match[1]||'')+v.toLocaleString('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals})+(match[3]||'');if(p<1)requestAnimationFrame(tick);else el.textContent=s}requestAnimationFrame(tick);
 });
}
fetch('elements-v5.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(e=>{elements=e;elements.forEach((s,i)=>{if(sequenceDefinitions[s.original]){const def=sequenceDefinitions[s.original];sequences[i+1]=s.mapIndex==null?def:{images:[def.images[s.mapIndex]],labels:[def.labels[s.mapIndex]]}}});const n=Number(location.hash.slice(1));if(n>=1&&n<=e.length)current=n;render()}).catch(()=>{$('elements').textContent='No se pudo cargar la presentación. Recargá la página.'});

async function initMap(){
 if(mapStarted)return;mapStarted=true;$('mapStatus').hidden=false;$('mapStatus').textContent='Cargando mapa…';if(view){view.remove();view=null}$('legend').replaceChildren();
 try{
  const layers=await fetch('mapdata-v4.json').then(r=>{if(!r.ok)throw Error('Map data HTTP '+r.status);return r.json()});
  view=L.map('map',{scrollWheelZoom:false,attributionControl:true,zoomControl:true}).setView([14.48,-89.26],8);
  const basemap=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri · CTPT / RBTTF',maxZoom:17}).addTo(view);
  let failures=0;basemap.on('tileerror',()=>{if(++failures>=3){$('mapStatus').hidden=false;$('mapStatus').textContent='Fondo cartográfico no disponible. Las capas del proyecto permanecen activas.'}});
  let bounds=L.latLngBounds([]);
  for(const layer of layers){
   const point=/Infraestructura|Equipamiento|Actualización/.test(layer.title);
   if(!point){
    const isLimit=layer.title.includes('Límite');
    L.geoJSON(layer.data,{interactive:false,style:{color:isLimit?'#66746a':'#397448',weight:isLimit?1.3:1.8,fillColor:'#73aa69',fillOpacity:isLimit?.035:.32},pointToLayer:(f,ll)=>L.circleMarker(ll,{radius:5,color:'#9e5a36',fillOpacity:1})}).addTo(view);
    continue;
   }
   const kind=layer.title.startsWith('Infra')?0:layer.title.startsWith('Equip')?1:2;
   const label=['Infraestructura','Equipamiento','Planes de manejo'][kind];
   const iconUrl='data:'+layer.symbol.contentType+';base64,'+layer.symbol.imageData;
   const icon=L.icon({iconUrl,iconSize:[19,19],iconAnchor:[9.5+[-14,0,14][kind],9.5],popupAnchor:[-[-14,0,14][kind],-11]});
   const legend=document.createElement('label'),im=new Image(),check=document.createElement('input');check.type='checkbox';check.checked=true;check.setAttribute('aria-label',label);im.src=iconUrl;im.alt='';legend.append(check,im,document.createTextNode(label));$('legend').append(legend);
   const group=L.geoJSON(layer.data,{pointToLayer:(f,ll)=>{bounds.extend(ll);return L.marker(ll,{icon,alt:label+' · '+(f.properties.NOMBRE_1||''),title:label+' · '+(f.properties.NOMBRE_1||'')})},onEachFeature:(f,l)=>{
    const box=document.createElement('div');box.className='record';const title=document.createElement('h3');title.textContent=label;box.append(title);
    const fields=layer.popup.popupElements?.find(e=>e.type==='fields')?.fieldInfos||layer.popup.fieldInfos||[];
    for(const field of fields){if(field.visible===false)continue;const value=f.properties[field.fieldName];if(value==null||value==='')continue;const row=document.createElement('p'),strong=document.createElement('strong');strong.textContent=field.label;row.append(strong,document.createElement('br'));const text=String(value);if(/^https?:\/\//i.test(text)){const a=document.createElement('a');a.href=text;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Ver documento';row.append(a)}else row.append(document.createTextNode(text));box.append(row)}
    l.bindPopup(box,{maxWidth:310,maxHeight:270,autoPan:true});
   }}).addTo(view);check.onchange=()=>{if(check.checked)group.addTo(view);else view.removeLayer(group)};
  }
  const reset=()=>{view.closePopup();view.fitBounds(bounds,{padding:[42,42],animate:false})};reset();$('home').onclick=reset;$('mapStatus').hidden=true;
 }catch(e){mapStarted=false;$('mapStatus').textContent='No se pudo cargar el mapa. ';const retry=document.createElement('button');retry.textContent='Reintentar';retry.onclick=initMap;$('mapStatus').append(retry);$('mapStatus').hidden=false;console.error(e)}
}


function renderEditorial(){
 const kind=elements[current-1].kind;
 if(kind==='watersheds'){
 $('special').innerHTML=`<section class="editorial watershed"><div class="editorial-state" data-state="0"><div class="map-copy"><h1>La Región Trifinio</h1><p>Ubicada entre tres grandes cuencas hidrográficas de los ríos <strong>Lempa, Motagua y Ulúa</strong>.</p><div class="basin-labels"><span>Motagua</span><span>Ulúa</span><span>Lempa</span></div></div><img class="basin-map" src="assets/source-image18.webp" alt="Cuencas de los ríos Motagua, Ulúa y Lempa"></div><div class="editorial-state" data-state="1"><img class="lempa-map" src="assets/source-image17.webp" alt="Nacimiento y recorrido del río Lempa"><div class="lempa-copy"><h1>La cuenca del río Lempa</h1><p class="metric-line"><strong>17,919 km²</strong> de extensión<br><strong>422 km</strong> de longitud del río</p><p>Nacimiento en Olopa, Guatemala. Provee servicios ecosistémicos a Guatemala, Honduras y El Salvador.</p><ul><li>Agua para consumo humano.</li><li>Energía renovable que cubre el 38% de la demanda de El Salvador.</li><li>Recursos para la agricultura y la industria.</li></ul><p class="small-copy">Centrales hidroeléctricas: Guajoyo, Cerrón Grande, Cinco de Noviembre y 15 de Septiembre.</p></div></div><div class="editorial-progress"><span>Cuencas de la región</span><span>Cuenca del Lempa</span></div></section>`;
 }else if(kind==='reserve-detail'){
 $('special').innerHTML=`<section class="editorial reserve-detail"><h1>Reserva de Biosfera Transfronteriza Trifinio Fraternidad</h1><img class="reserve-map-hd" src="assets/source-image19.webp" alt="Mapa de la reserva, municipios, Región Trifinio y Punto Trifinio"><div class="reserve-description"><p class="reserve-year">2011</p><p>Integrada a la Red Mundial de Reservas de Biosfera del Programa sobre el Hombre y la Biosfera.</p><p class="metric-line"><strong>427,108 ha</strong><br>11 áreas protegidas · 27 municipios<br>Más de 546 mil habitantes</p><p>Poblaciones Maya-Chortí y Pipil.</p><p>La gestión descansa en una plataforma de gobernanza multiactor y multinivel.</p><p>La CTPT tiene el desafío de consolidar y fortalecer la sostenibilidad del Comité Gestor Trinacional.</p></div><img class="reserve-partners" src="assets/source-image22.webp" alt="Cooperación Alemana y KfW"><img class="reserve-certificate" src="assets/source-image20.webp" alt="Reconocimiento de la Reserva de Biosfera, 2011"></section>`;
 }else if(kind==='legacy-projects'){
 $('special').innerHTML=`<section class="editorial photo-editorial"><div class="photo-copy"><h1>¿Cómo se manejaban tradicionalmente los proyectos sin un sistema robusto de monitoreo con información geoespacial?</h1></div><img class="side-photo" src="assets/source-image27.webp" alt="Archivo físico de documentos"></section>`;
 }else{
 $('special').innerHTML=`<section class="editorial photo-editorial resistance"><div class="photo-copy"><div class="editorial-state" data-state="0"><h1>Resistencia inicial</h1><ol><li>Escepticismo institucional.</li><li>Personal no capacitado.</li><li>Dificultades de conectividad.</li></ol></div><div class="editorial-state" data-state="1"><h1>Paradigma de pensamiento generacional</h1></div></div><img class="side-photo" src="assets/source-image28.webp" alt="Reunión de equipo y presentación institucional"></section>`;
 }
 renderEditorialStep();
}
function renderEditorialStep(){
 document.querySelectorAll('.editorial-state').forEach(el=>{const active=Number(el.dataset.state)===step;el.classList.toggle('visible',active);el.setAttribute('aria-hidden',String(!active))});
 document.querySelectorAll('.editorial-progress span').forEach((el,i)=>el.classList.toggle('active',i===step));
}
