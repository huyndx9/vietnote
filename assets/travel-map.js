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
const regionNames={north:'북부',central:'중부',south:'남부'};
const svg=document.getElementById('vietnamMap'),pins=document.getElementById('mapPins'),list=document.getElementById('mapPlaces'),detail=document.getElementById('mapDetail');
const ns='http://www.w3.org/2000/svg';let region='all',query='',selected='hanoi';
const point=(lat,lon)=>[(lon-101.5)*70,(24-lat)*42];
// Simplified mainland outline for orientation; this is not a boundary survey.
const coast=[[23.35,105.3],[23.15,105.9],[22.8,106.5],[22.6,106.8],[22.5,107.2],[21.55,108.05],[21.1,107.7],[20.8,107.2],[20.4,106.7],[19.8,106],[19,105.75],[18.4,105.9],[17.7,106.5],[17,107.2],[16.2,108.2],[15.4,108.75],[14.5,109.05],[13.7,109.3],[12.5,109.35],[11.7,109.15],[11,108.8],[10.6,107.8],[10.3,107.1],[9.6,106.65],[9.1,106.1],[8.6,104.9],[9.25,104.8],[10,105],[10.6,104.5],[10.9,105.2],[10.9,105.9],[11.6,106.1],[11.9,106.6],[12.3,107.1],[13,107.5],[14,107.4],[14.7,107.5],[15.3,107.2],[16.1,106.65],[16.7,106.5],[17.2,106],[17.8,105.2],[18.3,104.8],[18.7,104.1],[19.2,104.1],[19.6,104.5],[20,104.9],[20.4,104.6],[20.8,104],[21.2,103.5],[21.7,102.7],[22.4,102.15],[22.7,102.6],[22.4,103.1],[22.8,103.5],[22.6,104],[22.8,104.4],[23.1,104.8]];
document.getElementById('mapLand').setAttribute('points',coast.map(([lat,lon])=>point(lat,lon).join(',')).join(' '));
function show(p,focus=false){selected=p.id;detail.replaceChildren();const eyebrow=document.createElement('div');eyebrow.className='section-no';eyebrow.textContent=regionNames[p.region]+' / '+p.vi;const title=document.createElement('h2');title.textContent=p.title;const desc=document.createElement('p');desc.textContent=p.description;const coords=document.createElement('small');coords.textContent=`${p.lat.toFixed(3)}° N · ${p.lon.toFixed(3)}° E`;const maps=document.createElement('a');maps.className='primary-button';maps.textContent='Google Maps에서 위치 보기 ↗';maps.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.vi+' Vietnam');maps.target='_blank';maps.rel='noopener noreferrer';detail.append(eyebrow,title,desc,coords,maps);if(p.url){const article=document.createElement('a');article.className='action-button';article.textContent='VIETNOTE 여행지 읽기 ↗';article.href=p.url;detail.append(article)}
 pins.querySelectorAll('[data-place]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.place===p.id)));list.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.place===p.id)));if(focus)detail.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
}
function render(){const visible=places.filter(p=>(region==='all'||p.region===region)&&[p.title,p.vi].join(' ').toLocaleLowerCase().includes(query));pins.replaceChildren();list.replaceChildren();for(const p of visible){const [x,y]=point(p.lat,p.lon);const pin=document.createElementNS(ns,'g');pin.dataset.place=p.id;pin.setAttribute('transform',`translate(${x} ${y})`);pin.setAttribute('role','button');pin.setAttribute('tabindex','0');pin.setAttribute('aria-label',p.title);pin.setAttribute('aria-pressed',String(selected===p.id));const circle=document.createElementNS(ns,'circle');circle.setAttribute('r','10');pin.append(circle);const dot=document.createElementNS(ns,'circle');dot.setAttribute('r','3');dot.setAttribute('class','pin-core');pin.append(dot);pin.onclick=()=>show(p);pin.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(p)}};pins.append(pin);const button=document.createElement('button');button.type='button';button.dataset.place=p.id;button.textContent=p.title+' · '+p.vi;button.onclick=()=>show(p);list.append(button)}document.getElementById('mapCount').textContent=visible.length+'개의 여행지';document.getElementById('mapEmpty').hidden=visible.length>0;detail.hidden=visible.length===0;if(visible.length)show(visible.find(p=>p.id===selected)||visible[0]);}
document.querySelectorAll('[data-map-region]').forEach(b=>b.onclick=()=>{region=b.dataset.mapRegion;document.querySelectorAll('[data-map-region]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));render()});document.getElementById('mapSearch').oninput=e=>{query=e.target.value.trim().toLocaleLowerCase();render()};render();
})();
