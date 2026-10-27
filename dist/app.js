const $=id=>document.getElementById(id);let current=1,step=0,texts=[],elements=[],view,mapStarted=false;const sequences={3:{images:['reserva.jpg','reserva-corredores.jpg'],labels:['Reserva RBTTF','Reserva y corredores']},5:{images:['corredores.jpg','maa.jpg','ccb.jpg'],labels:['Corredores y áreas protegidas','MAA','CCB']}};
function render(){const seq=sequences[current];$('elements').innerHTML=elements[current-1]?.html||'';$('stage').style.background=elements[current-1]?.background||'#f4f5ef';$('sequence').hidden=!seq;$('mapPanel').hidden=current!==4;if(seq){$('sequence').className='d'+current;$('frames').replaceChildren();$('steps').replaceChildren();seq.images.forEach((src,i)=>{const img=new Image();img.src='assets/'+src;img.alt=seq.labels[i];img.className=i===step?'active':'';$('frames').append(img);const b=document.createElement('button');b.textContent=seq.labels[i];b.onclick=()=>{step=i;renderStep()};$('steps').append(b)});renderStep()}updateCount();if(current===4){initMap();if(view)setTimeout(()=>view.invalidateSize(),50);}history.replaceState(null,'','#'+current)}
function updateCount(){$('count').textContent=`${current} / 14`+(sequences[current]?` · ${step+1}/${sequences[current].images.length}`:'');$('prev').disabled=current===1&&step===0;$('next').disabled=current===14;$('hint').textContent=current===4?'Seleccioná un símbolo del mapa':'Flechas para avanzar'}
function renderStep(){[...$('frames').children].forEach((e,i)=>e.classList.toggle('active',i===step));[...$('steps').children].forEach((e,i)=>{e.classList.toggle('active',i===step);e.setAttribute('aria-pressed',i===step)});updateCount()}
function advance(d){let s=sequences[current];if(d>0&&s&&step<s.images.length-1){step++;renderStep();return}if(d<0&&step>0){step--;renderStep();return}const n=current+d;if(n<1||n>14)return;current=n;step=d<0&&sequences[n]?sequences[n].images.length-1:0;render()}
$('prev').onclick=()=>advance(-1);$('next').onclick=()=>advance(1);$('stage').onclick=e=>{if(e.target.closest('#mapPanel,button'))return;advance(e.clientX<innerWidth*.25?-1:1)};document.addEventListener('keydown',e=>{if(e.target.closest('#mapPanel,input,textarea,select'))return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();advance(1)}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();advance(-1)}});$('full').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();document.addEventListener('fullscreenchange',()=>{$('full').textContent=document.fullscreenElement?'Salir de pantalla completa':'Pantalla completa'});
Promise.all([fetch('slides.json').then(r=>r.json()),fetch('elements.json').then(r=>r.json())]).then(([t,e])=>{texts=t;elements=e;const n=Number(location.hash.slice(1));if(n>=1&&n<=14)current=n;render()});

async function initMap(){
 if(mapStarted)return;mapStarted=true;
 try{
  const layers=await fetch('mapdata.json').then(r=>r.json());
  view=L.map('map',{scrollWheelZoom:false,attributionControl:true,zoomControl:true}).setView([14.48,-89.26],8);
  const osm=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors · CTPT / RBTTF',maxZoom:17}).addTo(view);
  let failedTiles=0;osm.on('tileerror',()=>{if(++failedTiles!==3)return;view.removeLayer(osm);L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri · CTPT / RBTTF',maxZoom:17}).addTo(view);const note=L.control({position:'bottomleft'});note.onAdd=()=>{const el=L.DomUtil.create('div','map-fallback');el.textContent='OpenStreetMap no disponible · fondo alternativo';return el};note.addTo(view)});
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
   const icon=L.icon({iconUrl,iconSize:[28,28],iconAnchor:[14+[-24,0,24][kind],14],popupAnchor:[-[-24,0,24][kind],-17]});
   const legend=document.createElement('span'),im=new Image();im.src=iconUrl;im.alt='';legend.append(im,document.createTextNode(label));$('legend').append(legend);
   L.geoJSON(layer.data,{pointToLayer:(f,ll)=>{bounds.extend(ll);return L.marker(ll,{icon,alt:label+' · '+(f.properties.NOMBRE_1||''),title:label+' · '+(f.properties.NOMBRE_1||'')})},onEachFeature:(f,l)=>{
    const box=document.createElement('div');box.className='record';const title=document.createElement('h3');title.textContent=label;box.append(title);
    const fields=layer.popup.popupElements?.find(e=>e.type==='fields')?.fieldInfos||layer.popup.fieldInfos||[];
    for(const field of fields){if(field.visible===false)continue;const value=f.properties[field.fieldName];if(value==null||value==='')continue;const row=document.createElement('p'),strong=document.createElement('strong');strong.textContent=field.label;row.append(strong,document.createElement('br'));const text=String(value);if(/^https?:\/\//i.test(text)){const a=document.createElement('a');a.href=text;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Ver documento';row.append(a)}else row.append(document.createTextNode(text));box.append(row)}
    l.bindPopup(box,{maxWidth:310,maxHeight:270,autoPan:true});
   }}).addTo(view);
  }
  const reset=()=>{view.closePopup();view.fitBounds(bounds,{padding:[42,42],animate:false})};reset();$('home').onclick=reset;$('mapStatus').hidden=true;
 }catch(e){$('mapStatus').textContent='No se pudo cargar el mapa. Recargá la presentación.';console.error(e)}
}

for(const seq of Object.values(sequences))for(const src of seq.images){const im=new Image();im.src='assets/'+src}

$("replay").onclick=()=>{ $("elements").innerHTML=elements[current-1].html; if(sequences[current]){step=0;renderStep()} };
