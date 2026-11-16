"""Destination-specific editorial sections for the atlas guides."""
REGIONS = {'north': '북부', 'central': '중부', 'south': '남부'}


def sections(p, g):
    """Keep general travel advice in the shared guides, not in every destination."""
    def section(id, title, *paragraphs):
        return {'id': id, 'title': title, 'body': '\n\n'.join(paragraphs)}

    required = ('weather', 'local_transport', 'food_notes', 'budget')
    for field in required:
        if not isinstance(g.get(field), str) or not g[field].strip():
            raise ValueError(f'{p["id"]}: missing destination-specific {field}')

    return [
        section('first-look', '01 · 이곳을 여행하는 이유', *p['paragraphs']),
        section('getting-there', '02 · 도착 거점과 마지막 이동',
                '이동 경로: ' + g['gateway'], g['transport']),
        section('weather', '03 · 이곳의 날씨와 준비물', g['weather']),
        section('stay', '04 · 숙소 위치를 고르는 기준', g['stay']),
        section('itinerary', '05 · 체류 시간에 맞춘 추천 동선',
                '권장 체류: ' + g['duration'] + '. 이동일 포함 여부를 확인하고 아래 경험을 체력과 관심에 맞춰 골라 보세요.',
                *[f'{i + 1}. {v["title"]} — {v["body"]}' for i, v in enumerate(g['plan'])]),
        section('food', '06 · 지역 음식과 주문 포인트',
                '찾아볼 메뉴: ' + ', '.join(g['food']) + '.', g['food_notes']),
        section('local-transport', '07 · 명소 사이를 이동하는 방법', g['local_transport']),
        section('budget', '08 · 이 여행에서 따로 계산할 비용', g['budget']),
        section('before-booking', '09 · 예약 전에 확인할 현지 조건', p['tip']),
        section('phrases', '10 · 목적지를 보여 주는 베트남어',
                '목적지 이름: ' + p['vi'] + '. 같은 이름의 숙소·항구·시설이 있을 수 있으니 예약한 주소와 지도 핀을 함께 보여 주세요.'),
    ]
