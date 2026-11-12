/**
 * Global Football Database - Real Players, Realistic Trillion/Billion Currency, and Clubs
 */

// Universal Currency Formatter (조, 억, 만원)
function formatMoney(amount) {
    if (!amount || amount === 0) return '0원';
    const num = Math.round(amount);
    const jo = Math.floor(num / 1000000000000);
    const eok = Math.floor((num % 1000000000000) / 100000000);
    const man = Math.floor((num % 100000000) / 10000);

    let parts = [];
    if (jo > 0) parts.push(`${jo.toLocaleString()}조`);
    if (eok > 0) parts.push(`${eok.toLocaleString()}억`);
    if (man > 0 && jo === 0 && eok < 10) parts.push(`${man.toLocaleString()}만`);

    return parts.length > 0 ? parts.join(' ') + '원' : `${num.toLocaleString()}원`;
}

const GAME_DATA = {
    // Nationalities
    nationalities: [
        { id: 'KR', name: '대한민국 🇰🇷', desc: '병역 문제(아시안게임 금메달 특례 or 김천 상무 입대) 해결 필수' },
        { id: 'GB', name: '잉글랜드 🏴󠁧󠁢󠁥󠁮󠁧󠁿', desc: '프리미어리그 홈그로운 혜택, 종주국의 자부심' },
        { id: 'FR', name: '프랑스 🇫🇷', desc: '압도적인 신체 능력과 스피드, 황금 세대' },
        { id: 'BR', name: '브라질 🇧🇷', desc: '타고난 삼바 리듬, 천부적인 개인기와 테크닉' },
        { id: 'ES', name: '스페인 🇪🇸', desc: '정교한 패스와 탈압박, 티키타카의 본고장' },
        { id: 'DE', name: '독일 🇩🇪', desc: '강철 피지컬과 전술적 규율, 게르만 멘탈리티' },
        { id: 'AR', name: '아르헨티나 🇦🇷', desc: '폭발적인 드리블과 천재적인 골 결정력' },
        { id: 'JP', name: '일본 🇯🇵', desc: '섬세한 기본기와 왕성한 활동량' }
    ],

    // Youth Academies
    youthAcademies: [
        { id: 'y_maetan', nation: 'KR', name: '수원 삼성 산하 매탄고등학교', parentClub: 'c_ss', desc: '정교한 왼발 킥과 테크니션의 요람', bonus: { pas: 3, sho: 2 } },
        { id: 'y_youngsaeng', nation: 'KR', name: '전북 현대 산하 영생고등학교', parentClub: 'c_jb', desc: '강력한 피지컬과 전북 닥공 멘탈리티', bonus: { phy: 4, sho: 1 } },
        { id: 'y_osan', nation: 'KR', name: 'FC 서울 산하 오산고등학교', parentClub: 'c_fcseoul', desc: '현대적인 전술 이해도와 유연한 기동력', bonus: { dri: 3, mental: 2 } },
        { id: 'y_pocheol', nation: 'KR', name: '포항 스틸러스 산하 포철고등학교', parentClub: 'c_pohang', desc: '전통의 스틸야드 화수분, 탄탄한 기본기', bonus: { pas: 3, dri: 2 } },
        { id: 'y_hyundai', nation: 'KR', name: '울산 HD 산하 현대고등학교', parentClub: 'c_ulsan', desc: '우승 DNA를 품은 균형 잡힌 엘리트 유스', bonus: { sho: 2, pac: 3 } },
        { id: 'y_boin', nation: 'KR', name: '서울 보인고등학교 (학원 명문)', parentClub: 'c_fcseoul', desc: '강한 규율과 엄청난 활동량의 명문 학원', bonus: { phy: 3, pac: 2 } },
        { id: 'y_jungdong', nation: 'KR', name: '서울 중동고등학교 (100년 전통)', parentClub: 'c_fcseoul', desc: '한국 축구 역사를 함께한 전통의 강호', bonus: { mental: 4, pas: 1 } },
        { id: 'y_masia', nation: 'ES', name: '바르셀로나 라 마시아 (La Masia)', parentClub: 'c_bar', desc: '메시, 이니에스타를 배출한 세계 최고 유스', bonus: { pas: 4, dri: 3 } },
        { id: 'y_fabrica', nation: 'ES', name: '레알 마드리드 라 파브리카 (La Fábrica)', parentClub: 'c_rm', desc: '완벽한 피지컬과 승리욕을 주입하는 유스', bonus: { sho: 3, phy: 3 } },
        { id: 'y_toekomst', nation: 'OTHER', name: '아약스 데 토에콤스트 (De Toekomst)', parentClub: 'c_ajax_b', desc: '토탈 사커의 산실, 전방위 다재다능함', bonus: { dri: 3, pas: 3 } },
        { id: 'y_carrington', nation: 'GB', name: '맨체스터 유나이티드 캐링턴 아카데미', parentClub: 'c_mun', desc: '베컴, 긱스의 클래스 오브 92 유산', bonus: { pac: 3, sho: 2 } },
        { id: 'y_sporting', nation: 'OTHER', name: '스포르팅 CP 아카데미 (알코셰트)', parentClub: 'c_wre', desc: 'C.호날두, 피구를 탄생시킨 크랙의 성지', bonus: { pac: 4, dri: 3 } },
        { id: 'y_santos', nation: 'BR', name: '산투스 FC 빌라 벨미루 (Santos Youth)', parentClub: 'c_bar', desc: '펠레와 네이마르가 성장한 삼바의 성지', bonus: { dri: 5, sho: 2 } }
    ],

    // Worldwide Clubs (With Realistic Trillion / Billion Won Budgets)
    leagues: [
        {
            id: 'epl',
            name: '잉글랜드 프리미어리그 (EPL)',
            tier: 1,
            reputation: 95,
            clubs: [
                { id: 'c_mci', name: '맨체스터 시티', short: 'MCI', power: 93, budget: 850000000000, rep: 96, color: '#38bdf8' }, // 8,500억원
                { id: 'c_ars', name: '아스날', short: 'ARS', power: 89, budget: 620000000000, rep: 90, color: '#ef4444' },
                { id: 'c_liv', name: '리버풀', short: 'LIV', power: 90, budget: 580000000000, rep: 91, color: '#dc2626' },
                { id: 'c_che', name: '첼시', short: 'CHE', power: 85, budget: 700000000000, rep: 86, color: '#2563eb' },
                { id: 'c_tot', name: '토트넘 홋스퍼', short: 'TOT', power: 84, budget: 450000000000, rep: 85, color: '#0ea5e9' },
                { id: 'c_mun', name: '맨체스터 유나이티드', short: 'MUN', power: 84, budget: 680000000000, rep: 88, color: '#b91c1c' },
                { id: 'c_ast', name: '아스톤 빌라', short: 'AVL', power: 83, budget: 320000000000, rep: 82, color: '#7c2d12' }
            ]
        },
        {
            id: 'laliga',
            name: '스페인 라리가 (La Liga)',
            tier: 1,
            reputation: 92,
            clubs: [
                { id: 'c_rm', name: '레알 마드리드', short: 'RMA', power: 93, budget: 950000000000, rep: 96, color: '#f59e0b' }, // 9,500억원
                { id: 'c_bar', name: '바르셀로나', short: 'BAR', power: 90, budget: 520000000000, rep: 93, color: '#6366f1' },
                { id: 'c_atm', name: '아틀레티코 마드리드', short: 'ATM', power: 86, budget: 380000000000, rep: 87, color: '#e11d48' },
                { id: 'c_rso', name: '레알 소시에다드', short: 'RSO', power: 82, budget: 220000000000, rep: 81, color: '#0284c7' }
            ]
        },
        {
            id: 'bundesliga',
            name: '독일 분데스리가 (Bundesliga)',
            tier: 1,
            reputation: 89,
            clubs: [
                { id: 'c_bay', name: '바이에른 뮌헨', short: 'BAY', power: 91, budget: 720000000000, rep: 93, color: '#dc2626' }, // 7,200억원
                { id: 'c_b04', name: '바이어 레버쿠젠', short: 'B04', power: 87, budget: 390000000000, rep: 87, color: '#000000' },
                { id: 'c_dor', name: '보루시아 도르트문트', short: 'BVB', power: 85, budget: 350000000000, rep: 86, color: '#eab308' }
            ]
        },
        {
            id: 'seriea',
            name: '이탈리아 세리에 A (Serie A)',
            tier: 1,
            reputation: 88,
            clubs: [
                { id: 'c_int', name: '인터 밀란', short: 'INT', power: 87, budget: 380000000000, rep: 88, color: '#1d4ed8' },
                { id: 'c_juv', name: '유벤투스', short: 'JUV', power: 84, budget: 420000000000, rep: 86, color: '#475569' },
                { id: 'c_acm', name: 'AC 밀란', short: 'ACM', power: 84, budget: 340000000000, rep: 85, color: '#b91c1c' },
                { id: 'c_nap', name: '나폴리', short: 'NAP', power: 83, budget: 310000000000, rep: 84, color: '#38bdf8' }
            ]
        },
        {
            id: 'ligue1',
            name: '프랑스 리그앙 (Ligue 1)',
            tier: 1,
            reputation: 86,
            clubs: [
                { id: 'c_psg', name: '파리 생제르맹', short: 'PSG', power: 88, budget: 820000000000, rep: 89, color: '#2563eb' },
                { id: 'c_mon', name: 'AS 모나코', short: 'ASM', power: 81, budget: 240000000000, rep: 81, color: '#e11d48' }
            ]
        },
        {
            id: 'kleague1',
            name: '대한민국 K리그 1 (K League 1)',
            tier: 2,
            reputation: 72,
            clubs: [
                { id: 'c_ulsan', name: '울산 HD FC', short: 'ULS', power: 76, budget: 52000000000, rep: 77, color: '#1d4ed8' }, // 520억원
                { id: 'c_jb', name: '전북 현대 모터스', short: 'JHM', power: 75, budget: 56000000000, rep: 77, color: '#15803d' },
                { id: 'c_fcseoul', name: 'FC 서울', short: 'FCS', power: 74, budget: 48000000000, rep: 75, color: '#991b1b' },
                { id: 'c_pohang', name: '포항 스틸러스', short: 'POH', power: 74, budget: 38000000000, rep: 74, color: '#dc2626' },
                { id: 'c_daejeon', name: '대전 하나시티즌', short: 'DHN', power: 72, budget: 42000000000, rep: 72, color: '#78350f' },
                { id: 'c_gimcheon', name: '김천 상무 FC (국군체육부대)', short: 'GMC', power: 73, budget: 30000000000, rep: 73, color: '#ef4444' }
            ]
        },
        {
            id: 'kleague2',
            name: '대한민국 K리그 2 (K League 2)',
            tier: 3,
            reputation: 62,
            clubs: [
                { id: 'c_ss', name: '수원 삼성 블루윙즈', short: 'SSB', power: 70, budget: 34000000000, rep: 73, color: '#2563eb' },
                { id: 'c_busan', name: '부산 아이파크', short: 'BUS', power: 67, budget: 25000000000, rep: 68, color: '#b91c1c' }
            ]
        },
        {
            id: 'youth_abroad',
            name: '유럽 유망주 하부 리그',
            tier: 3,
            reputation: 63,
            clubs: [
                { id: 'c_wre', name: '렉섬 AFC', short: 'WRE', power: 67, budget: 28000000000, rep: 68, color: '#ef4444' },
                { id: 'c_castilla', name: '레알 마드리드 카스티야', short: 'CAS', power: 70, budget: 35000000000, rep: 72, color: '#f59e0b' }
            ]
        }
    ],

    // =========================================================================
    // Real Worldwide Football Superstar Player Pool (60+ World Stars)
    // =========================================================================
    realPlayers: [
        // 대한민국 스타
        { id: 'p_son', name: '손흥민', nation: 'KR', pos: 'WG', ovr: 88, clubName: '토트넘 홋스퍼', clubId: 'c_tot', price: 95000000000, wage: 340000000 },
        { id: 'p_lee', name: '이강인', nation: 'KR', pos: 'CAM', ovr: 83, clubName: '파리 생제르맹', clubId: 'c_psg', price: 72000000000, wage: 180000000 },
        { id: 'p_kim', name: '김민재', nation: 'KR', pos: 'CB', ovr: 87, clubName: '바이에른 뮌헨', clubId: 'c_bay', price: 88000000000, wage: 290000000 },
        { id: 'p_hwang', name: '황희찬', nation: 'KR', pos: 'ST', ovr: 82, clubName: '울버햄튼', clubId: 'c_ast', price: 45000000000, wage: 130000000 },
        { id: 'p_cho', name: '조규성', nation: 'KR', pos: 'ST', ovr: 77, clubName: '미트윌란', clubId: 'c_wre', price: 16000000000, wage: 45000000 },
        { id: 'p_seol', name: '설영우', nation: 'KR', pos: 'CB', ovr: 77, clubName: '즈베즈다', clubId: 'c_wre', price: 12000000000, wage: 35000000 },
        { id: 'p_hwi', name: '황인범', nation: 'KR', pos: 'CM', ovr: 80, clubName: '페예노르트', clubId: 'c_ast', price: 28000000000, wage: 75000000 },
        { id: 'p_joh', name: '조현우', nation: 'KR', pos: 'GK', ovr: 76, clubName: '울산 HD', clubId: 'c_ulsan', price: 7000000000, wage: 25000000 },

        // 세계 최고 공격수 (ST / CF)
        { id: 'p_haaland', name: '엘링 홀란', nation: 'OTHER', pos: 'ST', ovr: 93, clubName: '맨체스터 시티', clubId: 'c_mci', price: 270000000000, wage: 650000000 },
        { id: 'p_mbappe', name: '킬리안 음바페', nation: 'FR', pos: 'ST', ovr: 93, clubName: '레알 마드리드', clubId: 'c_rm', price: 280000000000, wage: 720000000 },
        { id: 'p_kane', name: '해리 케인', nation: 'GB', pos: 'ST', ovr: 90, clubName: '바이에른 뮌헨', clubId: 'c_bay', price: 150000000000, wage: 520000000 },
        { id: 'p_osimhen', name: '빅터 오시멘', nation: 'OTHER', pos: 'ST', ovr: 87, clubName: '갈라타사라이', clubId: 'c_ast', price: 110000000000, wage: 320000000 },
        { id: 'p_lautaro', name: '라우타로 마르티네스', nation: 'AR', pos: 'ST', ovr: 88, clubName: '인터 밀란', clubId: 'c_int', price: 140000000000, wage: 380000000 },
        { id: 'p_lewa', name: '로베르트 레반도프스키', nation: 'OTHER', pos: 'ST', ovr: 88, clubName: '바르셀로나', clubId: 'c_bar', price: 45000000000, wage: 480000000 },
        { id: 'p_ronaldo', name: '크리스티아누 호날두', nation: 'OTHER', pos: 'ST', ovr: 85, clubName: '알 나스르', clubId: 'c_ast', price: 30000000000, wage: 950000000 },

        // 세계 최고 윙어 (WG)
        { id: 'p_vini', name: '비니시우스 주니오르', nation: 'BR', pos: 'WG', ovr: 92, clubName: '레알 마드리드', clubId: 'c_rm', price: 260000000000, wage: 580000000 },
        { id: 'p_salah', name: '모하메드 살라', nation: 'OTHER', pos: 'WG', ovr: 89, clubName: '리버풀', clubId: 'c_liv', price: 90000000000, wage: 600000000 },
        { id: 'p_saka', name: '부카요 사카', nation: 'GB', pos: 'WG', ovr: 88, clubName: '아스날', clubId: 'c_ars', price: 180000000000, wage: 420000000 },
        { id: 'p_yamal', name: '라민 야말', nation: 'ES', pos: 'WG', ovr: 86, clubName: '바르셀로나', clubId: 'c_bar', price: 210000000000, wage: 250000000 },
        { id: 'p_rodrygo', name: '호드리구 고에스', nation: 'BR', pos: 'WG', ovr: 86, clubName: '레알 마드리드', clubId: 'c_rm', price: 150000000000, wage: 350000000 },
        { id: 'p_kvara', name: '흐비차 크바라츠헬리아', nation: 'OTHER', pos: 'WG', ovr: 86, clubName: '나폴리', clubId: 'c_nap', price: 120000000000, wage: 220000000 },
        { id: 'p_messi', name: '리오넬 메시', nation: 'AR', pos: 'WG', ovr: 87, clubName: '인터 마이애미', clubId: 'c_bar', price: 40000000000, wage: 800000000 },

        // 세계 최고 공격형 미드필더 (CAM)
        { id: 'p_bellingham', name: '주드 벨링엄', nation: 'GB', pos: 'CAM', ovr: 91, clubName: '레알 마드리드', clubId: 'c_rm', price: 250000000000, wage: 550000000 },
        { id: 'p_kdb', name: '케빈 더브라위너', nation: 'OTHER', pos: 'CAM', ovr: 90, clubName: '맨체스터 시티', clubId: 'c_mci', price: 75000000000, wage: 680000000 },
        { id: 'p_wirtz', name: '플로리안 비르츠', nation: 'DE', pos: 'CAM', ovr: 89, clubName: '바이어 레버쿠젠', clubId: 'c_b04', price: 190000000000, wage: 360000000 },
        { id: 'p_musiala', name: '자말 무시알라', nation: 'DE', pos: 'CAM', ovr: 88, clubName: '바이에른 뮌헨', clubId: 'c_bay', price: 180000000000, wage: 380000000 },
        { id: 'p_foden', name: '필 포든', nation: 'GB', pos: 'CAM', ovr: 88, clubName: '맨체스터 시티', clubId: 'c_mci', price: 190000000000, wage: 420000000 },
        { id: 'p_odegaard', name: '마르틴 외데고르', nation: 'OTHER', pos: 'CAM', ovr: 88, clubName: '아스날', clubId: 'c_ars', price: 160000000000, wage: 390000000 },
        { id: 'p_bruno', name: '브루노 페르난데스', nation: 'OTHER', pos: 'CAM', ovr: 87, clubName: '맨체스터 유나이티드', clubId: 'c_mun', price: 95000000000, wage: 480000000 },

        // 세계 최고 중앙 미드필더 (CM / CDM)
        { id: 'p_rodri', name: '로드리', nation: 'ES', pos: 'CM', ovr: 91, clubName: '맨체스터 시티', clubId: 'c_mci', price: 200000000000, wage: 480000000 },
        { id: 'p_valverde', name: '페데리코 발베르데', nation: 'OTHER', pos: 'CM', ovr: 89, clubName: '레알 마드리드', clubId: 'c_rm', price: 180000000000, wage: 420000000 },
        { id: 'p_rice', name: '데클란 라이스', nation: 'GB', pos: 'CM', ovr: 87, clubName: '아스날', clubId: 'c_ars', price: 160000000000, wage: 410000000 },
        { id: 'p_pedri', name: '페드리', nation: 'ES', pos: 'CM', ovr: 87, clubName: '바르셀로나', clubId: 'c_bar', price: 130000000000, wage: 320000000 },
        { id: 'p_camavinga', name: '에두아르도 카마빙가', nation: 'FR', pos: 'CM', ovr: 85, clubName: '레알 마드리드', clubId: 'c_rm', price: 120000000000, wage: 280000000 },
        { id: 'p_gavi', name: '가비', nation: 'ES', pos: 'CM', ovr: 84, clubName: '바르셀로나', clubId: 'c_bar', price: 110000000000, wage: 240000000 },

        // 세계 최고 수비수 (CB / FB)
        { id: 'p_vvd', name: '버질 반다이크', nation: 'OTHER', pos: 'CB', ovr: 89, clubName: '리버풀', clubId: 'c_liv', price: 75000000000, wage: 450000000 },
        { id: 'p_saliba', name: '윌리엄 살리바', nation: 'FR', pos: 'CB', ovr: 88, clubName: '아스날', clubId: 'c_ars', price: 140000000000, wage: 350000000 },
        { id: 'p_dias', name: '후벵 디아스', nation: 'OTHER', pos: 'CB', ovr: 88, clubName: '맨체스터 시티', clubId: 'c_mci', price: 130000000000, wage: 380000000 },
        { id: 'p_gvardiol', name: '요슈코 그바르디올', nation: 'OTHER', pos: 'CB', ovr: 85, clubName: '맨체스터 시티', clubId: 'c_mci', price: 110000000000, wage: 290000000 },
        { id: 'p_trent', name: '트렌트 알렉산더-아놀드', nation: 'GB', pos: 'CB', ovr: 86, clubName: '리버풀', clubId: 'c_liv', price: 100000000000, wage: 360000000 },
        { id: 'p_davies', name: '알폰소 데이비스', nation: 'OTHER', pos: 'CB', ovr: 84, clubName: '바이에른 뮌헨', clubId: 'c_bay', price: 85000000000, wage: 260000000 },

        // 세계 최고 골키퍼 (GK)
        { id: 'p_courtois', name: '티보 쿠르투아', nation: 'OTHER', pos: 'GK', ovr: 89, clubName: '레알 마드리드', clubId: 'c_rm', price: 60000000000, wage: 380000000 },
        { id: 'p_alisson', name: '알리송 베케르', nation: 'BR', pos: 'GK', ovr: 89, clubName: '리버풀', clubId: 'c_liv', price: 55000000000, wage: 360000000 }
    ],

    // Ballon d'Or Rivals with Point Baseline
    rivals: [
        { name: '킬리안 음바페', club: '레알 마드리드', basePoints: 215 },
        { name: '엘링 홀란', club: '맨체스터 시티', basePoints: 210 },
        { name: '비니시우스 주니오르', club: '레알 마드리드', basePoints: 200 },
        { name: '주드 벨링엄', club: '레알 마드리드', basePoints: 195 },
        { name: '해리 케인', club: '바이에른 뮌헨', basePoints: 190 },
        { name: '모하메드 살라', club: '리버풀', basePoints: 185 },
        { name: '로드리', club: '맨체스터 시티', basePoints: 185 },
        { name: '라민 야말', club: '바르셀로나', basePoints: 180 },
        { name: '손흥민', club: '토트넘 홋스퍼', basePoints: 175 }
    ],

    positions: {
        ST: { name: '스트라이커 (ST)', desc: '골망을 가르는 득점 기계', radarWeights: { sho: 1.4, pas: 0.7, dri: 1.1, def: 0.3, phy: 1.1, pac: 1.4 } },
        WG: { name: '윙어 (LW/RW)', desc: '측면을 파괴하는 크랙', radarWeights: { sho: 1.1, pas: 1.1, dri: 1.4, def: 0.4, phy: 0.8, pac: 1.5 } },
        CAM: { name: '공격형 미드필더 (CAM)', desc: '사령탑 플레이메이커', radarWeights: { sho: 1.1, pas: 1.5, dri: 1.2, def: 0.5, phy: 0.8, pac: 1.0 } },
        CM: { name: '중앙 미드필더 (CM)', desc: '그라운드를 지배하는 박스투박스', radarWeights: { sho: 0.8, pas: 1.3, dri: 1.0, def: 1.2, phy: 1.3, pac: 1.0 } },
        CB: { name: '센터백 (CB)', desc: '통곡의 벽', radarWeights: { sho: 0.3, pas: 0.8, dri: 0.5, def: 1.6, phy: 1.5, pac: 0.9 } }
    },

    traits: [
        { id: 'poacher', name: '골 냄새의 달인', desc: '시즌 득점력 +18%, 슈팅 +4' },
        { id: 'sprinter', name: '총알탄 사나이', desc: '역습 및 침투 능력치 +18%, 스피드 +5' },
        { id: 'maestro', name: '필드의 마에스트로', desc: '시즌 어시스트 창출력 +20%, 패스 +5' },
        { id: 'dribbler', name: '테크니션', desc: '경기 평점 보정 +0.25, 드리블 +5' },
        { id: 'commander', name: '타고난 리더', desc: '감독 전직 시 장악력 +20, 멘탈 +6' },
        { id: 'ironman', name: '철인 피지컬', desc: '부상 확률 격감, 피지컬 +5' }
    ],

    annualFocusOptions: [
        { id: 'shooting', name: '⚽ 슈팅 & 피니시 특화', desc: '골 결정력과 슛 감각 연마 (SHO ↑)', bonusStat: 'sho' },
        { id: 'playmaking', name: '🎯 플레이메이킹 & 시야', desc: '킬패스와 찬스 메이킹에 집중 (PAS ↑)', bonusStat: 'pas' },
        { id: 'physical', name: '🏋️ 벌크업 & 피지컬', desc: '몸싸움과 스프린트 파워 강화 (PHY/PAC ↑)', bonusStat: 'phy' },
        { id: 'dribbling', name: '⚡ 드리블 & 탈압박', desc: '1:1 돌파와 볼 터치 감각 (DRI ↑)', bonusStat: 'dri' },
        { id: 'mindset', name: '🧠 축구 지능 & 멘탈', desc: '전술 통찰력 및 감독 신뢰 (MENTAL ↑)', bonusStat: 'mental' },
        { id: 'fame_biz', name: '🌟 SNS 스타 & 스폰서', desc: '상업 광고 및 글로벌 인지도 확장 (명성/자산 ↑)', bonusStat: 'fame' }
    ],

    tactics: {
        formations: [
            { id: '433', name: '4-3-3', desc: '공격적인 전방 압박과 화력', attBonus: 5, defBonus: -2 },
            { id: '4231', name: '4-2-3-1', desc: '공수 밸런스와 안정적인 중원', attBonus: 3, defBonus: 3 },
            { id: '352', name: '3-5-2', desc: '중원 장악 및 투톱의 득점력', attBonus: 4, defBonus: 1 },
            { id: '532', name: '5-3-2', desc: '극단적인 텐백 카운터', attBonus: -3, defBonus: 7 }
        ]
    },

    hallOfFameTiers: [
        {
            title: '축구의 신 (GOAT)',
            minBallon: 3,
            minTrophies: 10,
            minGoals: 400,
            desc: '메시, 호날두, 펠레와 함께 인류 축구 역사상 최고의 신으로 불립니다.'
        },
        {
            title: '시대의 지배자 (World Legend)',
            minBallon: 1,
            minTrophies: 6,
            minGoals: 250,
            desc: '발롱도르를 품에 안고 한 시대를 지배했던 전 세계 축구 팬들의 우상.'
        },
        {
            title: '월드 클래스 (World Class)',
            minBallon: 0,
            minTrophies: 3,
            minGoals: 150,
            desc: '유럽 빅클럽의 부동의 에이스이자 전 세계가 인정하는 슈퍼스타.'
        },
        {
            title: '구단의 영원한 레전드 (Club Icon)',
            minBallon: 0,
            minTrophies: 1,
            minGoals: 80,
            desc: '팀의 심장이자 서포터즈들의 가슴속에 영원히 각인된 레전드.'
        },
        {
            title: '자랑스러운 프로 축구선수 (Respectable Pro)',
            minBallon: 0,
            minTrophies: 0,
            minGoals: 0,
            desc: '프로 무대의 높은 벽을 묵묵히 버텨내며 멋진 발자취를 남긴 선수.'
        }
    ]
};

function getClubById(clubId) {
    for (const lg of GAME_DATA.leagues) {
        const found = lg.clubs.find(c => c.id === clubId);
        if (found) return { ...found, leagueName: lg.name, leagueTier: lg.tier };
    }
    return GAME_DATA.leagues[0].clubs[0];
}

function getYouthById(youthId) {
    return GAME_DATA.youthAcademies.find(y => y.id === youthId) || GAME_DATA.youthAcademies[0];
}

function getRealPlayerById(playerId) {
    return GAME_DATA.realPlayers.find(p => p.id === playerId);
}
