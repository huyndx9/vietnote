import json,re,html,hashlib
from pathlib import Path
root=Path(__file__).resolve().parent.parent
out=root/'dist'
def item(id,title,category,desc,photo,sections,**kw):
 return dict(id=id,title=title,category=category,desc=desc,photo=photo,sections=sections,**kw)
photos={'hanoi':'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1200&q=85','hoian':'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=85','danang':'https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?w=1200&q=85','phuquoc':'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=85','story':'https://images.unsplash.com/photo-1555921015-5532091f6026?w=1200&q=85','pho':'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=1200&q=85','coffee':'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&q=85'}
data=[]
cities=[('hanoi','하노이','Hanoi','북부','호수와 골목, 커피로 시작하는 여행',[('어떤 도시인가요?','하노이는 호수 주변 산책과 구시가지 골목 탐방을 함께 즐기기 좋은 도시입니다. 유명한 장소를 많이 찍기보다 한 동네를 천천히 걸어 보세요.'),('어디에 머물까요?','첫 방문이라면 호안끼엠 주변을 출발점으로 살펴보세요. 이동이 편한 위치인지, 밤에 소음이 있는지 최근 숙소 후기를 함께 확인하면 좋습니다.'),('하루를 보내는 방법','아침에는 호수 산책과 쌀국수, 낮에는 박물관이나 카페, 해가 기울면 골목 산책을 제안합니다. 더운 시간에는 실내 일정을 넣어 쉬어 가세요.'),('맛보고 싶은 것','퍼, 분짜, 에그커피를 하나씩 경험해 보세요. 고수나 소스는 따로 요청하면 자신의 입맛에 맞춰 먹기 편합니다.')]),('hoian','호이안','Hoi An','중부','노란 벽 사이로 천천히 걷는 오후',[('어떤 도시인가요?','호이안의 매력은 오래된 거리와 강변을 걸으며 작은 풍경을 발견하는 데 있습니다. 낮과 밤의 분위기가 달라 여유 있게 머무는 여행에 잘 어울립니다.'),('어디에 머물까요?','올드타운 산책이 중심이면 도보 접근성을, 휴식이 중심이면 해변 주변을 비교해 보세요. 숙소와 주요 일정 사이의 이동 시간을 먼저 확인하세요.'),('하루를 보내는 방법','오전에는 카페나 시장, 오후에는 구시가지 산책, 저녁에는 강변 풍경을 즐겨 보세요. 인기 시간대를 피해 골목을 걸으면 한결 여유롭습니다.'),('맛보고 싶은 것','까오러우와 반미 등 지역 음식을 찾아보세요. 가게마다 맛과 양이 다르므로 메뉴와 최근 후기를 살펴본 뒤 선택해도 좋습니다.')]),('danang','다낭','Da Nang','중부','바다와 도시 사이, 편안한 첫 베트남 여행',[('어떤 도시인가요?','다낭은 해변에서 쉬는 일정과 도시 식사·카페 탐방을 섞기 좋은 여행지입니다. 호이안과 함께 계획할 때는 이동과 휴식 시간을 넉넉히 남겨 두세요.'),('어디에 머물까요?','해변 산책을 좋아한다면 미케비치 주변, 식사와 시내 이동을 중시한다면 한강 주변 숙소를 비교해 보세요. 실제 도보 동선은 지도에서 확인하세요.'),('하루를 보내는 방법','아침에는 바닷가 산책, 한낮에는 카페나 숙소 휴식, 저녁에는 식사와 강변 산책을 추천합니다. 부모님과 동행한다면 하루의 주요 일정은 두 곳 정도로 줄여 보세요.'),('맛보고 싶은 것','미꽝과 해산물 등 다양한 음식을 시도할 수 있습니다. 해산물은 주문 전 단위, 무게, 조리비를 확인하면 선택하기 편합니다.')]),('phuquoc','푸꾸옥','Phu Quoc','남부','일정을 비우고 바다 곁에 머무는 시간',[('어떤 도시인가요?','푸꾸옥은 숙소에서 쉬는 시간을 여행의 중심에 두기 좋은 섬입니다. 넓은 섬을 매일 가로지르기보다 머무는 지역을 중심으로 일정을 묶어 보세요.'),('어디에 머물까요?','가고 싶은 장소의 위치를 먼저 지도에 표시한 뒤 숙소를 고르세요. 해변 접근성, 식사 선택지, 이동 방식도 함께 비교하는 것이 좋습니다.'),('하루를 보내는 방법','오전에는 해변과 수영, 낮에는 휴식, 저녁에는 가까운 식당을 찾는 느슨한 일정을 제안합니다. 바다 활동은 당일 기상과 운영 안내를 확인하세요.'),('여행을 준비하며','리조트 밖 이동을 계획한다면 왕복 방법을 미리 알아보세요. 섬 전체를 한 번에 보기보다 이번 여행에서 원하는 경험을 먼저 정하면 좋습니다.')])]
for id,ko,en,region,desc,sections in cities:data.append(item(id,ko+' · '+en,'destinations',desc,photos[id],sections,region=region,city=ko,keywords=en+' '+ko))
data += [
item('story','관광지가 아닌, 베트남의 일상을 만나다','journal','시장과 골목, 커피 한 잔에서 시작하는 작은 발견.',photos['story'],[('한 동네에 시간을 주세요','여행지의 이름을 하나 더 지우기보다 숙소 주변의 한 골목을 다시 걸어 보세요. 아침과 저녁의 풍경이 달라지고 처음에는 보이지 않던 가게가 눈에 들어옵니다.'),('시장에서는 먼저 둘러보세요','처음부터 무엇을 살지 정하지 않아도 괜찮습니다. 어떤 재료를 팔고 사람들이 무엇을 먹는지 보세요. 사진을 가까이서 찍고 싶다면 먼저 양해를 구해 주세요.'),('작은 대화로 가까워지기','Xin chào와 Cảm ơn, 두 마디만으로도 인사를 건넬 수 있습니다. 주문할 때는 메뉴를 가리키고 수량을 함께 보여 주면 한결 편합니다.'),('서두르지 않는 여행','잠시 앉아 쉬는 시간도 일정의 일부입니다. 관광 명소 사이를 채우기보다 한 장소에 머무는 시간을 남겨 두세요.')]),
item('pho','쌀국수 한 그릇을 더 맛있게 즐기는 법','food','퍼의 이름부터 곁들임까지, 처음 먹는 분을 위한 작은 노트.',photos['pho'],[('메뉴에서 찾는 단어','Phở bò는 소고기 쌀국수, phở gà는 닭고기 쌀국수를 뜻합니다. 같은 이름이라도 가게와 지역에 따라 육수와 곁들임이 달라집니다.'),('먼저 육수를 맛보세요','소스를 넣기 전에 육수를 한 숟갈 맛보세요. 그다음 라임이나 고추를 조금씩 더하면 자신의 입맛에 맞추기 쉽습니다.'),('고수가 낯설다면','고수를 빼 달라고 말할 때는 Không cho rau mùi를 보여 주세요. 지역이나 가게에 따라 표현과 사용하는 허브가 다를 수 있으니 재료를 가리켜 확인하면 더 좋습니다.'),('주문 전 확인할 것','알레르기가 있다면 재료와 육수를 별도로 확인하세요. 메뉴 사진만으로 모든 재료를 알 수는 없습니다.')]),
item('coffee','커피 한 잔으로 만나는 베트남의 하루','food','빠르게 마시기보다 잠시 앉아 있는 시간.',photos['coffee'],[('취향에 맞는 한 잔','Cà phê đen은 블랙커피, cà phê sữa는 연유가 들어간 커피를 가리킵니다. đá는 얼음, nóng은 따뜻한 음료를 뜻합니다.'),('달게 느껴진다면','연유가 들어가는 메뉴는 달게 느껴질 수 있습니다. Ít sữa, ít ngọt라고 말하거나 화면을 보여 주며 연유와 단맛을 줄여 달라고 요청해 보세요.'),('카페를 고르는 기준','유명한 사진 명소뿐 아니라 숙소 근처 카페도 살펴보세요. 그늘, 좌석, 소음처럼 내가 편히 쉬는 데 필요한 조건이 더 중요할 때도 있습니다.')]),
item('lantern','호이안, 낮과 밤 사이를 걷다','journal','같은 골목을 두 번 걷고 싶은 이유.',photos['hoian'],[('해가 지기 전에','노란 벽과 오래된 창문을 자세히 보고 싶다면 밝을 때 먼저 걸어 보세요. 사람들로 붐비는 거리 옆의 작은 골목도 놓치지 마세요.'),('강변의 저녁','저녁에는 강변과 등불이 만드는 분위기를 즐겨 보세요. 배나 체험을 이용한다면 탑승 전 가격, 시간, 포함 내용을 확인하세요.'),('사진보다 먼저','가게 앞이나 주민의 생활 공간에서 사진을 찍을 때는 통행을 막지 않도록 배려해 주세요. 잠시 카메라를 내려놓으면 또 다른 장면이 보이기도 합니다.')])]
guides={
'visa':('입국과 비자, 출발 전 확인할 것',[('조건을 먼저 정리하세요','여권 국적, 방문 목적, 입국일과 체류 기간을 정리하세요. 다른 사람의 여행 후기와 자신의 입국 조건이 같다고 가정하지 않는 것이 좋습니다.'),('공식 안내로 최종 확인','비자·입국 규정은 변경될 수 있습니다. 출발 전에 베트남 정부 전자비자 포털과 관련 대사관의 최신 안내를 확인하세요. 이 페이지는 개별 입국 가능 여부를 판단하지 않습니다.'),('서류를 준비하세요','여권과 필요한 입국 서류, 숙소 및 귀국편 정보를 확인하고 오프라인에서도 볼 수 있도록 준비하세요.')]),
'money':('환전과 예산을 준비하는 방법',[('예산을 나누어 보세요','숙소, 식사, 이동, 체험, 예비비를 구분해 적어 보세요. 여행 스타일에 따라 차이가 커서 하나의 금액을 모든 여행자에게 적용하기 어렵습니다.'),('동 단위에 익숙해지기','베트남 화폐는 동(VND)입니다. 결제 전 지폐의 숫자를 확인하고 잔돈을 받은 뒤 천천히 세어 보세요.'),('현금과 카드','사용 가능한 결제 방식과 카드 수수료는 가게·금융사에 따라 다릅니다. 환전과 인출 전 적용 환율 및 수수료를 직접 확인하세요.')]),
 'transport':('공항부터 숙소까지, 이동 준비',[('첫 이동은 미리 정하세요','도착 시간, 숙소 주소, 짐의 양을 확인하고 공항에서 이동할 방식을 미리 비교하세요. 숙소 주소는 베트남어로 저장하면 편합니다.'),('차량에 타기 전','예약한 차량의 번호와 기사 정보를 확인하세요. 목적지와 예상 요금, 추가 비용을 확인한 뒤 출발하세요.'),('도시 간 이동','비행기, 기차, 버스를 비교할 때 이동 시간 외에 터미널 왕복과 대기 시간도 포함하세요. 부모님이나 아이와 함께라면 쉬는 시간을 먼저 확보하세요.')]),
'weather':('날씨에 맞춰 여행 계획하기',[('도시별로 확인하세요','베트남은 남북으로 길어 같은 날짜에도 지역별 날씨가 다를 수 있습니다. 국가 전체의 예보보다 방문 도시의 예보를 확인하세요.'),('실내 대안을 준비하세요','비가 오거나 너무 더울 때 갈 수 있는 카페, 박물관, 숙소 휴식 일정을 준비하세요. 야외 활동은 운영사의 당일 안내를 확인하세요.'),('짐을 가볍고 유연하게','통기성 있는 옷, 가벼운 겉옷과 우산 등을 일정에 맞춰 준비하세요. 출발 직전 예보를 보고 마지막으로 조정하는 것이 좋습니다.')]),
'safety':('편안한 여행을 위한 기본 준비',[('중요한 정보는 따로','여권 사본, 보험 연락처, 숙소 주소를 별도로 보관하세요. 휴대전화가 작동하지 않을 상황에도 대비해 두면 좋습니다.'),('이동 중에는','차량과 오토바이가 많은 곳에서는 주변 흐름을 확인하며 이동하세요. 사진이나 휴대전화에 집중한 채 도로로 나가지 않도록 주의하세요.'),('정보는 현장에서 다시 확인','운영 시간, 이용 요금, 현장 상황은 바뀔 수 있습니다. 중요한 일정은 방문 전 운영사나 숙소에 직접 확인하세요.')]),
'language':('여행에서 바로 보여 주는 베트남어',[('인사','안녕하세요 — Xin chào\n감사합니다 — Cảm ơn\n죄송합니다 / 실례합니다 — Xin lỗi'),('식당에서','고수를 빼 주세요 — Không cho rau mùi.\n맵지 않게 해 주세요 — Không cay.\n계산해 주세요 — Cho tôi tính tiền.'),('이동할 때','이 주소로 가 주세요 — Cho tôi đến địa chỉ này.\n얼마인가요? — Bao nhiêu tiền?\n여기서 내려 주세요 — Cho tôi xuống ở đây.'),('사용 팁','문장을 눌러 복사하거나 화면을 상대방에게 보여 주세요. 주소와 숫자는 함께 적으면 의사 전달에 도움이 됩니다.')])}
for id,(title,sections) in guides.items():data.append(item(id,title,'guides',sections[0][1][:85]+'…',None,sections))
for id,title,city,days,plans in [
('danang-4days','부모님과 함께, 다낭 3박 4일','다낭',4,[('DAY 1 · 도착과 적응','숙소 체크인 → 가까운 식당 → 해변 또는 강변 산책. 늦게 도착한다면 첫날은 휴식만 계획하세요.'),('DAY 2 · 바다 곁에서','아침 해변 산책 → 브런치 → 한낮 숙소 휴식 → 저녁 식사. 이동 거리를 짧게 잡는 날입니다.'),('DAY 3 · 호이안 나들이','늦은 오전 출발 → 호이안 점심 → 구시가지 카페와 산책 → 숙소 복귀. 왕복 차량과 쉬는 장소를 먼저 정하세요.'),('DAY 4 · 여유 있게 귀국','아침 식사 → 짐 정리 → 공항 이동. 체크아웃과 출발 시간 사이에 무리한 일정을 넣지 마세요.')]),
('hanoi-3days','처음 만나는 하노이, 2박 3일','하노이',3,[('DAY 1 · 호수와 골목','도착 → 체크인 → 호안끼엠 주변 산책 → 쌀국수와 카페. 숙소 주변 동선을 익히세요.'),('DAY 2 · 나의 속도로','아침 시장 → 관심 있는 박물관 → 점심 → 카페 휴식 → 저녁 골목 탐방. 박물관 운영 일정은 별도로 확인하세요.'),('DAY 3 · 다시 걷는 거리','마음에 들었던 동네에서 아침 식사 → 기념품 둘러보기 → 공항 이동. 이동 시간에는 여유를 두세요.')]),
('phuquoc-4days','쉬러 가는 푸꾸옥, 3박 4일','푸꾸옥',4,[('DAY 1 · 섬에 도착','체크인 → 숙소 둘러보기 → 가까운 곳에서 저녁 식사. 다음 날의 날씨와 이동 방법을 확인하세요.'),('DAY 2 · 해변과 휴식','아침 해변 → 수영 → 점심 → 낮잠과 독서 → 저녁 식사. 일정을 비워 두는 날입니다.'),('DAY 3 · 하나의 경험','원하는 체험 한 가지 → 점심 → 숙소 휴식. 바다 체험은 날씨와 운영 상태를 확인한 뒤 결정하세요.'),('DAY 4 · 천천히 마무리','아침 식사 → 짐 정리 → 공항 이동. 숙소와 공항 사이의 이동 시간을 확인하세요.')])]:
 data.append(item(id,title,'itineraries','주요 일정을 줄이고 쉬는 시간을 남긴 여행 제안.',photos['danang' if city=='다낭' else 'hanoi' if city=='하노이' else 'phuquoc'],plans,city=city,days=days))
labels={'destinations':'여행지','itineraries':'추천 일정','food':'음식과 카페','journal':'현지인의 노트','guides':'여행 준비'}
paths={x['id']:('/destinations/' if x['category']=='destinations' else '/articles/')+x['id']+'/' for x in data}
for x in data:x['url']=paths[x['id']]
(out/'assets/content.js').write_text('window.VIETNOTE_CONTENT='+json.dumps(data,ensure_ascii=False)+';')
home=(root/'src/home.html').read_text()
head=home.split('</head>')[0]+'</head>'
head=head.replace('</head>','<link rel="stylesheet" href="/assets/pages.css"></head>')
nav=''.join(f'<a href="/{k}/">{v}</a>' for k,v in labels.items())
header=f'<header class="wrap topbar"><a href="/" class="logo">VIETNOTE<span>.</span></a><nav class="nav">{nav}</nav><div class="navright"><a class="notebook-link" href="/notebook/" aria-label="내 여행 노트">♡ <span>내 노트</span></a><button class="iconbtn" aria-label="전체 검색" onclick="openSearch()">⌕</button><button class="iconbtn menu-btn" aria-label="메뉴" onclick="toggleMenu(true)">☰</button></div></header><div class="mobilemenu" id="mobilemenu"><button aria-label="메뉴 닫기" onclick="toggleMenu(false)">×</button>{nav}<a href="/notebook/">내 여행 노트</a><a href="/about/">VIETNOTE 소개</a></div>'
footer='<footer class="footer wrap"><div class="footer-top"><div><a href="/"><h2>VIETNOTE<span>.</span></h2></a><p class="section-sub">베트남을 발견하는 새로운 시선.<br>Discover Vietnam, one story at a time.</p></div><div class="footer-links"><a href="/about/">소개</a><a href="/guides/">여행 준비</a><a href="/notebook/">내 여행 노트</a><a href="/about/#feedback">정보 수정 제안</a></div></div><div class="footer-bottom"><span>© 2026 VIETNOTE · 여행의 작은 발견을 기록합니다.</span><a href="https://www.pexels.com/photo/breathtaking-view-of-ha-long-bay-in-vietnam-36551013/" target="_blank" rel="noopener">Hero photo · Haneul Trac / Pexels</a></div></footer>'
common='<script src="/assets/content.js"></script><script src="/assets/pages.js"></script>'
def write(path,title,body,desc='베트남 여행의 작은 발견을 기록하는 VIETNOTE.'):
 p=out/path.strip('/')/'index.html' if path!='/' else out/'index.html';p.parent.mkdir(parents=True,exist_ok=True)
 h=re.sub(r'<title>.*?</title>','<title>'+html.escape(title)+' — VIETNOTE</title>',head)
 h=re.sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="'+html.escape(desc,quote=True)+'">',h)
 p.write_text(h+'<body>'+header+body+footer+common+'</body></html>')
def card(x):
 image='<img loading="lazy" src="'+x['photo']+'" alt="'+html.escape(x['title'])+' 관련 풍경">' if x['photo'] else '<div class="guide-art">'+({'visa':'✈','money':'₫','transport':'↗','weather':'☼','safety':'◇','language':'文'}.get(x['id'],'✦'))+'</div>'
 return f'<article class="browse-card" data-city="{x.get("city","")}"><div class="card-image"><a href="{x["url"]}">{image}</a><button class="save-button" data-save="{x["id"]}" aria-label="여행 노트에 저장">♡</button></div><div class="meta">{labels[x["category"]]}'+(f' · {x["region"]}' if 'region'in x else '')+f'</div><h2><a href="{x["url"]}">{x["title"]}</a></h2><p>{x["desc"]}</p></article>'
for cat,label in labels.items():
 subtitle={'destinations':'어떤 베트남을 만나고 싶으세요? 도시마다 다른 여행을 골라 보세요.','itineraries':'다녀야 할 곳보다, 머물고 싶은 순간을 먼저 생각합니다.','food':'이름을 알고, 맛을 이해하고, 한 걸음 더 가까워지는 시간.','journal':'관광 안내서 사이에 담기지 않은, 일상의 작은 이야기.','guides':'처음 떠나는 여행도 조금 더 편안해지도록.'}[cat]
 en={'destinations':'Find your Vietnam.','itineraries':'Days well spent.','food':'A taste of everyday.','journal':'From a local perspective.','guides':'Before you go.'}[cat]
 options=['전체']+(['북부','중부','남부'] if cat=='destinations' else sorted(set(x.get('city','') for x in data if x['category']==cat and x.get('city'))))
 filters=''.join(f'<button class="filter-chip {"active" if i==0 else ""}" data-filter="{v}" aria-pressed="{"true" if i==0 else "false"}">{v}</button>' for i,v in enumerate(options))
 cards=''.join(card(x) for x in data if x['category']==cat)
 write('/'+cat+'/',label,f'<main class="page-wrap"><div class="page-intro"><div class="section-no">VIETNOTE / {label}</div><h1 class="serif">{en}</h1><p>{subtitle}</p></div><div class="browse-toolbar"><div class="filter-list">{filters}</div><label class="browse-search">⌕ <input id="browseQuery" placeholder="이름이나 키워드 검색" aria-label="목록 검색"></label></div><p class="list-count" id="listCount"></p><section class="browse-grid" id="browseGrid">{cards}</section><p class="empty-state" id="browseEmpty" hidden>검색 결과가 없습니다. 다른 검색어로 찾아보세요.</p></main>')
for x in data:
 toc=''.join(f'<a href="#section-{i}">{t}</a>' for i,(t,p) in enumerate(x['sections']))
 sections=''.join(f'<section id="section-{i}"><h2>{t}</h2><p>{html.escape(p).replace(chr(10),"<br>")}</p></section>' for i,(t,p) in enumerate(x['sections']))
 extras=''
 if x['id']=='language':extras='<div class="phrase-cards">'+''.join(f'<button class="phrase" data-copy="{v}"><span>{k}</span><strong>{v}</strong><small>눌러서 복사하기</small></button>' for k,v in [('감사합니다','Cảm ơn'),('고수를 빼 주세요','Không cho rau mùi.'),('맵지 않게 해 주세요','Không cay.'),('이 주소로 가 주세요','Cho tôi đến địa chỉ này.')])+'</div>'
 maplink=''
 if x.get('city'):
  from urllib.parse import quote
  maplink=f'<a class="action-button" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query={quote(x["city"]+" Vietnam")}">지도에서 위치 보기 ↗</a>'
 related=[r for r in data if r['id']!=x['id'] and (r['category']==x['category'] or r.get('city') and r.get('city')==x.get('city'))][:3]
 hero=f'<div class="article-cover"><img src="{x["photo"]}" alt="{html.escape(x["title"])} 관련 풍경"></div>' if x['photo'] else ''
 note='여행 일정 예시입니다. 예약이나 실제 운영을 보장하지 않습니다.' if x['category']=='itineraries' else '요금·운영 시간·입국 조건은 방문 전 공식 안내를 확인해 주세요.'
 body=f'<main class="page-wrap"><nav class="breadcrumb"><a href="/">홈</a> / <a href="/{x["category"]}/">{labels[x["category"]]}</a></nav><header class="article-heading"><div class="section-no">VIETNOTE / {labels[x["category"]]}</div><h1>{x["title"]}</h1><p>{x["desc"]}</p><div class="article-actions"><button class="action-button" data-save="{x["id"]}">♡ 여행 노트에 저장</button><button class="action-button" data-share>링크 공유 ↗</button>{maplink}</div><small>편집일 2026.11.04 · {note}</small></header>{hero}<div class="article-layout"><aside class="article-toc"><strong>이 글의 순서</strong>{toc}</aside><div class="article-body">{sections}{extras}<div class="article-end"><p>내 여행에 맞게 천천히 골라 보세요.</p><a href="/about/?article={x["id"]}#feedback">정보 수정 제안 ↗</a></div></div></div><section class="related"><div class="section-no">KEEP EXPLORING</div><h2 class="serif">Your next discovery.</h2><div class="browse-grid">'+''.join(card(r) for r in related)+'</div></section></main>'
 write(x['url'],x['title'],body,x['desc'])
write('/notebook/','내 여행 노트','<main class="page-wrap"><div class="page-intro"><div class="section-no">YOUR PERSONAL COLLECTION</div><h1 class="serif">Your travel notebook.</h1><p>마음에 든 도시, 이야기, 일정을 한곳에 모아 두세요.</p></div><div class="storage-note">이 브라우저에 저장됩니다. 다른 기기와 동기화되지 않으며, 브라우저 데이터를 지우면 삭제됩니다.</div><div id="notebookItems" class="browse-grid"></div><div id="notebookEmpty" class="empty-state" hidden><h2>아직 비어 있는 여행 노트</h2><p>여행지나 글의 ♡ 버튼을 눌러 첫 번째 발견을 저장해 보세요.</p><a class="action-button" href="/destinations/">여행지 둘러보기 ↗</a></div><section class="feedback-list"><h2>내가 남긴 수정 메모</h2><p>메모는 이 브라우저에만 보관되며 운영자에게 전송되지 않습니다.</p><div id="savedFeedback"></div></section></main>')
write('/about/','VIETNOTE 소개','<main class="page-wrap"><div class="page-intro"><div class="section-no">THE STORY BEHIND VIETNOTE</div><h1 class="serif">Between two homes.</h1><p>한국과 베트남, 그 사이에서 전하는 여행 이야기.</p></div><div class="about-layout"><div class="about-image"><img src="/assets/halong-haneul-trac.webp" alt="하롱베이의 푸른 하늘과 바다"></div><div class="article-body"><section><h2>안녕하세요, 베트남에서 온 Huy입니다.</h2><p>저는 베트남에서 태어나 2017년 한국에 왔습니다. 한국에서 공부하고 일하며 지내는 동안, 한국 친구들에게 제가 아는 베트남을 소개하고 싶었습니다.</p><p>VIETNOTE는 그 마음에서 시작한 여행 노트입니다. 유명한 여행지뿐 아니라 동네의 작은 식당, 커피 한 잔, 문화의 차이처럼 여행을 조금 더 깊게 만드는 이야기를 담고자 합니다.</p></section><section><h2>우리가 기록하고 싶은 것</h2><p>화려한 수식어보다 이해하기 쉬운 설명을, 빽빽한 일정표보다 자신에게 맞는 여행을 제안합니다. 베트남을 처음 찾는 분도 편하게 읽을 수 있는 한국어로 전합니다.</p></section></div></div><section id="feedback" class="feedback-panel"><div><div class="section-no">HELP US KEEP IT USEFUL</div><h2>바뀐 정보를 발견하셨나요?</h2><p>현재는 수정 제안을 개인 메모로 저장할 수 있습니다. 운영자 전송 기능은 아직 연결되지 않았습니다.</p></div><form id="feedbackForm"><label>관련 글 또는 장소<input name="article" maxlength="160" required placeholder="글 제목이나 장소 이름"></label><label>수정할 내용<textarea name="message" maxlength="2000" required placeholder="어떤 정보가 달라졌는지 적어 주세요."></textarea></label><button class="primary-button">내 브라우저에 메모 저장</button><p id="feedbackStatus" role="status"></p></form></section></main>')
# Keep the established homepage and replace preview-only navigation/detail popups with real pages.
h=home
h=re.sub(r'<header class="wrap topbar">.*?</header><div class="mobilemenu".*?</div><main',header+'<main',h,count=1,flags=re.S)
h=re.sub(r'<footer class="footer wrap">.*?</footer>',footer,h,count=1,flags=re.S)
h=re.sub(r'<div class="overlay" id="overlay".*?</script>', '',h,count=1,flags=re.S)
h=h.replace('</head>','<link rel="stylesheet" href="/assets/pages.css"></head>')
h=h.replace('</body>',common+'</body>')
h=h.replace('href="#journey">EXPLORE ALL','href="/destinations/">EXPLORE ALL').replace('href="#journey">DISCOVER MORE','href="/food/">DISCOVER MORE')
h=h.replace('VIETNOTE JOURNAL','VIETNOTE JOURNAL')
# Keyboard-accessible links for homepage cards.
for x in data:
 h=h.replace('onclick="showDetail(\''+x['id']+'\')"','onclick="location.href=\''+x['url']+'\'" tabindex="0" role="link" onkeydown="if(event.key===\'Enter\')this.click()"')
(out/'index.html').write_text(h)
(out/'404.html').write_text(head+'<body>'+header+'<main class="page-wrap empty-state"><h1 class="serif">A little detour.</h1><p>찾으시는 페이지가 없습니다.</p><a class="action-button" href="/">홈으로 돌아가기</a></main>'+footer+common+'</body></html>')
print('Built',len(data),'detail pages and 8 main pages')

# Content hashes refresh browser caches after an asset update.
for page in out.rglob('*.html'):
 text=page.read_text()
 text=re.sub(r'<link[^>]+href="/assets/typography.css[^"]*"[^>]*>', '', text)
 text=re.sub(r'<link[^>]+(?:href="https://fonts\.(?:googleapis|gstatic)\.com[^"]*")[^>]*>', '', text)
 text=text.replace('</head>', '<link rel="stylesheet" href="/assets/typography.css"></head>')
 for asset in ('pages.js','pages.css','content.js','typography.css'):
  digest=hashlib.sha256((out/'assets'/asset).read_bytes()).hexdigest()[:12]
  text=text.replace('/assets/'+asset+'"', '/assets/'+asset+'?v='+digest+'"')
 page.write_text(text)
