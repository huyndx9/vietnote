(()=>{
const host=document.getElementById('travelMap');if(!host)return;
const places=[
['hanoi','하노이 · 호안끼엠 호수','Hà Nội','north',21.028,105.852,'호수 산책과 구시가지, 커피 문화를 함께 즐겨 보세요.','/vietnote/destinations/hanoi/'],
['halong','하롱베이','Vịnh Hạ Long','north',20.91,107.18,'석회암 섬과 푸른 바다가 만드는 베트남 북부의 대표 풍경.',''],
['sapa','사파','Sa Pa','north',22.336,103.844,'산악 풍경과 계단식 논을 만나는 고원 여행지.',''],
['hagiang','하장','Hà Giang','north',22.824,104.983,'산악 도로와 고원 풍경으로 알려진 북부 지역.',''],
['bangioc','반족 폭포','Thác Bản Giốc','north',22.854,106.724,'까오방의 국경 지대에 자리한 웅장한 폭포.',''],
['ninhbinh','닌빈 · 짱안','Tràng An, Ninh Bình','north',20.25,105.918,'강과 석회암 산 사이를 천천히 둘러보는 여행지.',''],
['phongnha','퐁냐','Phong Nha','central',17.607,106.31,'동굴과 카르스트 지형으로 유명한 국립공원 지역.',''],
['hue','후에','Huế','central',16.463,107.59,'옛 왕조의 역사와 궁궐 문화를 만나는 도시.',''],
['danang','다낭 · 미케비치','Đà Nẵng','central',16.054,108.247,'해변 휴식과 도시 여행을 함께 즐길 수 있는 곳.','/vietnote/destinations/danang/'],
['hoian','호이안 구시가지','Hội An','central',15.88,108.326,'노란 벽과 오래된 거리, 강변의 등불 풍경.','/vietnote/destinations/hoian/'],
['quynhon','꾸이년','Quy Nhơn','central',13.783,109.219,'베트남 중부 해안의 바다와 여유로운 도시 풍경.',''],
['nhatrang','나트랑','Nha Trang','central',12.238,109.196,'해변과 섬 여행으로 알려진 중남부 해안 도시.',''],
['dalat','달랏','Đà Lạt','central',11.94,108.458,'서늘한 고원 기후와 호수, 소나무 숲을 만나는 도시.',''],
['muine','무이네','Mũi Né','south',10.933,108.287,'해변과 모래 언덕으로 유명한 남부 해안 여행지.',''],
['saigon','호찌민시','Thành phố Hồ Chí Minh','south',10.776,106.7,'도시의 역사와 활기찬 거리, 다양한 음식을 만나 보세요.',''],
['cantho','껀터 · 메콩델타','Cần Thơ','south',10.045,105.747,'메콩델타의 강과 시장, 물길을 따라 만나는 일상.',''],
['phuquoc','푸꾸옥','Phú Quốc','south',10.227,103.967,'해변과 섬에서 여유로운 휴식을 즐기는 여행지.','/vietnote/destinations/phuquoc/'],
['condao','꼰다오','Côn Đảo','south',8.684,106.608,'남쪽 바다의 섬과 자연을 만나는 여행지.','']
].map(([id,title,vi,region,lat,lon,description,url])=>({id,title,vi,region,lat,lon,description,url}));
const photos={hanoi:['/vietnote/assets/hanoi-the-huc-bridge.jpg','테훅 다리와 호안끼엠 호수'],halong:['/vietnote/assets/halong-haneul-trac.webp','하롱베이의 석회암 섬'],hoian:['/vietnote/assets/hoian-covered-bridge.jpg','호이안의 내원교'],bangioc:['/vietnote/assets/ban-gioc-waterfall.jpg','반족 폭포']};
const regionNames={north:'북부',central:'중부',south:'남부'};
const list=document.getElementById('mapPlaces'),detail=document.getElementById('mapDetail');
let region='all',query='',selected='hanoi';
const mapElement=document.getElementById('vietnamMap');
const map=L.map(mapElement,{zoomControl:false,scrollWheelZoom:false,minZoom:4,maxZoom:11,zoomSnap:.25,maxBounds:[[3,94],[29,120]],maxBoundsViscosity:.8}).setView([16,106],5);
const pins=map.getPane('markerPane');pins.id='mapPins';
map.createPane('countryLabels');map.getPane('countryLabels').style.zIndex=450;map.getPane('countryLabels').style.pointerEvents='none';
L.geoJSON(window.VIETNOTE_GEOGRAPHY.countries,{interactive:false,smoothFactor:.35,style:f=>({color:f.properties.name==='Vietnam'?'#6f927f':'#bfc9b9',weight:f.properties.name==='Vietnam'?1.4:.8,fillColor:f.properties.name==='Vietnam'?'#d4e1c9':'#eceee3',fillOpacity:1})}).addTo(map);
L.geoJSON(window.VIETNOTE_GEOGRAPHY.rivers,{interactive:false,style:{color:'#9fc7ca',weight:1.3,opacity:.9}}).addTo(map);
const labels=[['VIỆT NAM',16.8,107.3,'country-vietnam'],['LÀO',18.4,103.4,''],['CAMPUCHIA',12.9,104.3,''],['THÁI LAN',16.4,100.8,''],['TRUNG QUỐC',24.5,106,''],['BIỂN ĐÔNG',14,114,'ocean-label']];
for(const [name,lat,lon,extra] of labels)L.marker([lat,lon],{interactive:false,keyboard:false,pane:'countryLabels',icon:L.divIcon({className:'atlas-country-label '+extra,html:name,iconSize:[130,22],iconAnchor:[65,11]})}).addTo(map);
// Geographic labels and representative island locations; no maritime boundaries.
const archipelagos=[
 {id:'hoang-sa',name:'QUẦN ĐẢO HOÀNG SA',english:'Paracel Islands',label:[17.7,112],islands:[[16.834,112.337],[16.534,111.603],[16.451,111.706],[15.783,111.2],[16.661,112.731]]},
 {id:'truong-sa',name:'QUẦN ĐẢO TRƯỜNG SA',english:'Spratly Islands',label:[12.15,114.1],islands:[[8.643,111.92],[11.431,114.331],[9.883,114.333],[10.178,114.365],[10.377,114.482],[7.891,112.916],[8.816,112.585]]}
];
map.createPane('islandLabels');map.getPane('islandLabels').style.zIndex=455;map.getPane('islandLabels').style.pointerEvents='none';
for(const group of archipelagos){
 for(const location of group.islands)L.circleMarker(location,{pane:'islandLabels',radius:2.8,color:'#628d86',weight:1,fillColor:'#f8fcf6',fillOpacity:1,interactive:false}).addTo(map);
 const label=L.marker(group.label,{interactive:false,keyboard:false,pane:'islandLabels',icon:L.divIcon({className:'atlas-archipelago-label',html:'<strong>'+group.name+'</strong><small>'+group.english+'</small>',iconSize:[180,38],iconAnchor:[90,19]})}).addTo(map);
 label.getElement().dataset.archipelago=group.id;
}
const markerLayer=L.layerGroup().addTo(map);
const resetBounds=()=>{const visible=places.filter(p=>(region==='all'||p.region===region)&&[p.title,p.vi].join(' ').toLocaleLowerCase().includes(query));if(!visible.length)return;const bounds=region==='all'&&!query?L.latLngBounds([[6.8,101.7],[24.1,117.2]]):L.latLngBounds(visible.map(p=>[p.lat,p.lon]));map.fitBounds(bounds,{padding:[35,38],maxZoom:8,animate:false})};
L.control.zoom({position:'topright',zoomInTitle:'확대',zoomOutTitle:'축소'}).addTo(map);
const Reset=L.Control.extend({options:{position:'topright'},onAdd(){const box=L.DomUtil.create('div','leaflet-bar atlas-reset');const button=L.DomUtil.create('button','',box);button.type='button';button.title='선택 지역 전체 보기';button.setAttribute('aria-label','선택 지역 전체 보기');button.textContent='⌂';L.DomEvent.disableClickPropagation(box);L.DomEvent.on(button,'click',resetBounds);return box}});new Reset().addTo(map);
L.control.scale({position:'bottomleft',imperial:false,maxWidth:90}).addTo(map);
map.attributionControl.setPrefix('<a href="https://leafletjs.com/" target="_blank" rel="noopener">Leaflet</a>');map.attributionControl.addAttribution('<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a>');
map.on('movestart zoomstart',()=>hidePreview());
map.on('zoomend',()=>{mapElement.dataset.detailed=String(map.getZoom()>=7)});
const resizeObserver=new ResizeObserver(()=>{map.invalidateSize({pan:false});});resizeObserver.observe(mapElement);
// One reusable, hoverable preview for pins and list rows. Selection stays unchanged.
const preview=document.createElement('div');preview.id='mapHoverPreview';preview.className='map-hover-preview';preview.setAttribute('role','tooltip');preview.hidden=true;document.body.append(preview);
let previewAnchor=null,hideTimer=null;
function hidePreview(){clearTimeout(hideTimer);if(previewAnchor)previewAnchor.removeAttribute('aria-describedby');previewAnchor=null;preview.hidden=true;}
function deferHide(){clearTimeout(hideTimer);hideTimer=setTimeout(hidePreview,160);}
function showPreview(p,anchor){
 clearTimeout(hideTimer);if(previewAnchor&&previewAnchor!==anchor)previewAnchor.removeAttribute('aria-describedby');previewAnchor=anchor;anchor.setAttribute('aria-describedby',preview.id);preview.replaceChildren();
 const photo=document.createElement('div');photo.className='map-preview-photo '+p.region;
 if(photos[p.id]){const image=document.createElement('img');image.src=photos[p.id][0];image.alt=photos[p.id][1];image.onerror=()=>{image.remove();photo.classList.add('no-photo');photo.textContent=p.vi;};photo.append(image)}else{photo.classList.add('no-photo');photo.textContent=p.vi;}
 const body=document.createElement('div');body.className='map-preview-body';const label=document.createElement('small');label.textContent=regionNames[p.region]+' / '+p.vi;const title=document.createElement('strong');title.textContent=p.title;const description=document.createElement('p');description.textContent=p.description;const hint=document.createElement('span');hint.className='map-preview-hint';hint.textContent=photos[p.id]?'눌러서 자세히 보기 ↗':'사진 준비 중 · 눌러서 자세히 보기 ↗';body.append(label,title,description,hint);preview.append(photo,body);preview.hidden=false;
 positionPreview();
}
function positionPreview(){
 if(!previewAnchor)return;
 const rect=previewAnchor.getBoundingClientRect(),box=preview.getBoundingClientRect(),gap=12,edge=10;
 const left=Math.max(edge,Math.min(rect.left+rect.width/2-box.width/2,innerWidth-box.width-edge));
 const above=rect.top-box.height-gap;const top=above>=edge?above:Math.min(innerHeight-box.height-edge,rect.bottom+gap);
 preview.style.left=left+'px';preview.style.top=Math.max(edge,top)+'px';
}
function bindPreview(el,p){
 el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')showPreview(p,el)});
 el.addEventListener('pointerleave',deferHide);
 el.addEventListener('focus',()=>{if(matchMedia('(hover: hover)').matches||el.matches(':focus-visible'))showPreview(p,el)});
 el.addEventListener('blur',hidePreview);
}
preview.addEventListener('pointerenter',()=>clearTimeout(hideTimer));preview.addEventListener('pointerleave',deferHide);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hidePreview()});window.addEventListener('scroll',()=>{if(!previewAnchor)return;requestAnimationFrame(()=>{if(!previewAnchor)return;const r=previewAnchor.getBoundingClientRect(),parent=previewAnchor.closest('#mapPlaces'),clip=parent?.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||(clip&&(r.bottom<clip.top||r.top>clip.bottom)))hidePreview();else positionPreview()})},true);window.addEventListener('resize',hidePreview);
function show(p,focus=false){hidePreview();selected=p.id;detail.replaceChildren();const eyebrow=document.createElement('div');eyebrow.className='section-no';eyebrow.textContent=regionNames[p.region]+' / '+p.vi;const title=document.createElement('h2');title.textContent=p.title;const desc=document.createElement('p');desc.textContent=p.description;const coords=document.createElement('small');coords.textContent=`${p.lat.toFixed(3)}° N · ${p.lon.toFixed(3)}° E`;const maps=document.createElement('a');maps.className='primary-button';maps.textContent='Google Maps에서 위치 보기 ↗';maps.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.vi+' Vietnam');maps.target='_blank';maps.rel='noopener noreferrer';const cover=document.createElement('div');cover.className='map-detail-cover '+p.region;if(photos[p.id]){const img=document.createElement('img');img.src=photos[p.id][0];img.alt=photos[p.id][1];cover.append(img)}else{const word=document.createElement('span');word.textContent=p.vi;cover.append(word)}const tag=document.createElement('span');tag.className='map-cover-tag';tag.textContent=regionNames[p.region]+' VIETNAM';cover.append(tag);const body=document.createElement('div');body.className='map-detail-body';body.append(eyebrow,title,desc,coords,maps);detail.append(cover,body);document.getElementById('mapSelection').textContent=p.vi;host.dataset.selectedRegion=p.region;if(p.url){const article=document.createElement('a');article.className='action-button';article.textContent='VIETNOTE 여행지 읽기 ↗';article.href=p.url;detail.querySelector('.map-detail-body').append(article)}
 pins.querySelectorAll('[data-place]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.place===p.id)));list.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.place===p.id)));if(focus)detail.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
}
function render(){
 hidePreview();const visible=places.filter(p=>(region==='all'||p.region===region)&&[p.title,p.vi].join(' ').toLocaleLowerCase().includes(query));markerLayer.clearLayers();list.replaceChildren();
 for(const p of visible){
  const icon=L.divIcon({className:'atlas-marker',html:'<span class="map-pin-dot"></span><span class="map-pin-label"></span>',iconSize:[28,28],iconAnchor:[14,14]});
  const marker=L.marker([p.lat,p.lon],{icon,keyboard:true,title:p.vi,riseOnHover:true}).addTo(markerLayer);const el=marker.getElement();el.dataset.place=p.id;el.dataset.region=p.region;el.setAttribute('role','button');el.setAttribute('aria-label',p.title);el.setAttribute('aria-pressed',String(selected===p.id));el.querySelector('.map-pin-label').textContent=p.vi;
  if(p.id==='hoian')el.classList.add('atlas-offset');bindPreview(el,p);el.onclick=e=>{e.stopPropagation();show(p)};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();show(p)}};
  const button=document.createElement('button');button.type='button';button.dataset.place=p.id;button.dataset.region=p.region;const name=document.createElement('strong');name.textContent=p.title;const sub=document.createElement('small');sub.textContent=p.vi+' · '+regionNames[p.region];const arrow=document.createElement('span');arrow.className='map-place-arrow';arrow.textContent='↗';button.append(name,sub,arrow);bindPreview(button,p);button.onclick=()=>{show(p);map.panInside([p.lat,p.lon],{padding:[50,50],animate:!matchMedia('(prefers-reduced-motion: reduce)').matches})};list.append(button);
 }
 document.getElementById('mapCount').textContent=visible.length+'개의 여행지';document.getElementById('mapEmpty').hidden=visible.length>0;detail.hidden=visible.length===0;resetBounds();if(visible.length)show(visible.find(p=>p.id===selected)||visible[0]);
}
document.querySelectorAll('[data-map-region]').forEach(b=>b.onclick=()=>{region=b.dataset.mapRegion;document.querySelectorAll('[data-map-region]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));render()});document.getElementById('mapSearch').oninput=e=>{query=e.target.value.trim().toLocaleLowerCase();render()};render();
})();
