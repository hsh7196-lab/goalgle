/**
 * Manager Mode System - 1-Year Fast Season Simulation
 * Transition from retired player to legendary football manager
 */

class Manager {
    constructor(player, selectedClubId = null) {
        this.name = player.name;
        this.nationality = player.nationality;
        this.age = player.age;
        this.season = 1;

        // Inherit legacy from player career
        this.playerLegacy = {
            totalApps: player.careerStats.apps,
            totalGoals: player.careerStats.goals,
            totalAssists: player.careerStats.assists,
            trophies: { ...player.careerStats.trophies },
            ballons: player.careerStats.awards.ballon,
            fame: player.fame
        };

        // Manager specific attributes inherited from player mental & fame
        const baseMental = player.stats ? player.stats.mental : 70;
        this.tacticsRating = Math.min(99, Math.floor(baseMental * 0.95 + (player.careerStats.awards.ballon * 6)));
        this.leadership = Math.min(99, Math.floor(baseMental * 0.9 + (player.careerStats.apps / 45)));
        this.fame = Math.floor(player.fame * 0.8);

        // Assign initial club
        this.clubId = selectedClubId || this.recommendInitialClub(player);
        const club = getClubById(this.clubId);
        this.budget = club.budget + Math.floor(this.fame * 60000); // 선수 시절 명성으로 스폰서 유치
        this.boardTrust = 80;
        this.fanSupport = 85;

        // Tactics
        this.formation = '433';
        this.style = 'gegenpress';

        // Career Records as Manager
        this.managerStats = {
            seasons: 0,
            matches: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            trophies: { league: 0, ucl: 0 },
            coachOfYearAwards: 0
        };

        // Squad
        this.squad = this.generateInitialSquad(club);
        this.transferMarket = this.generateMarketPlayers(6, club.leagueTier);
        this.history = [];
    }

    recommendInitialClub(player) {
        const ballons = player.careerStats.awards.ballon;
        if (ballons >= 2) return 'c_ars'; // 아스날 등 1부 상위권
        if (ballons >= 1 || player.careerStats.apps > 250) return 'c_lei'; // 2부 명문 레스터
        return 'c_wre'; // 렉섬 등 친근한 구단
    }

    generateInitialSquad(club) {
        const squad = [];
        const posSlots = [
            'GK', 'CB', 'CB', 'LB', 'RB', 
            'CM', 'CM', 'CAM', 
            'LW', 'RW', 'ST', 
            'GK', 'CB', 'CM', 'ST'
        ];
        const names = ['마르코 실바', '가브리엘 산토스', '루카 모랄레스', '율리안 베르너', '토마스 뮐러', '올리버 존슨', '라파엘 코스타', '호드리구 에르난데스', '브루노 알바레스', '네이선 스미스', '다비드 두산'];

        posSlots.forEach((pos, idx) => {
            const isStarter = idx < 11;
            const ovr = Math.min(95, Math.max(65, club.power + (Math.floor(Math.random() * 8) - 4)));
            const name = names[Math.floor(Math.random() * names.length)] + ` #${idx+1}`;
            squad.push({
                id: 'sq_' + idx + '_' + Date.now(),
                name,
                pos,
                isStarter,
                ovr
            });
        });
        return squad;
    }

    generateMarketPlayers(count = 6, tier = 1) {
        const names = ['빅터 오시멘', '로드리 에르난데스', '주앙 네베스', '플로리안 비르츠', '손흥민', '이강인', '김민재', '가비 파에스', '부카요 사카', '데클란 라이스'];
        const positions = ['ST', 'WG', 'CAM', 'CM', 'CB'];
        const list = [];

        for (let i = 0; i < count; i++) {
            const name = names[Math.floor(Math.random() * names.length)] + (i > 0 ? ` [${i+1}]` : '');
            const pos = positions[Math.floor(Math.random() * positions.length)];
            const age = Math.floor(Math.random() * 10) + 19;
            const ovr = Math.min(94, Math.max(70, Math.floor(Math.random() * 15) + (tier === 1 ? 80 : 70)));
            const price = Math.floor(Math.pow(ovr - 60, 2.3) * 60000);

            list.push({
                id: 'mkt_' + Date.now() + '_' + i,
                name,
                pos,
                age,
                ovr,
                price
            });
        }
        return list;
    }

    // =========================================================================
    // Core 1-Year Fast Manager Simulation
    // =========================================================================
    simulateManagerYear(focusTraining = 'tactics') {
        const club = getClubById(this.clubId);
        
        // 1. Apply Manager Directive Growth
        if (focusTraining === 'tactics') {
            this.tacticsRating = Math.min(99, this.tacticsRating + 2);
        } else if (focusTraining === 'leadership') {
            this.leadership = Math.min(99, this.leadership + 2);
            this.boardTrust = Math.min(100, this.boardTrust + 5);
        }

        // 2. Team Strength
        const starters = this.squad.filter(p => p.isStarter);
        const avgSquadOvr = starters.length > 0 ? starters.reduce((acc, p) => acc + p.ovr, 0) / starters.length : 75;
        const formInfo = GAME_DATA.tactics.formations.find(f => f.id === this.formation) || { attBonus: 3, defBonus: 3 };
        const effectivePower = avgSquadOvr + (this.tacticsRating / 20) + (this.leadership / 25) + ((formInfo.attBonus + formInfo.defBonus) * 0.4);

        // 3. 38 Matches Season Results
        let wins = Math.min(35, Math.max(8, Math.round((effectivePower - 60) * 1.05 + (Math.random() * 6 - 3))));
        let draws = Math.floor(Math.random() * 6) + 4;
        let losses = Math.max(0, 38 - wins - draws);
        const pts = wins * 3 + draws;

        let wonLeague = false;
        let wonUcl = false;
        let leagueRank = 5;

        if (club.leagueTier === 1) {
            if (pts >= 85 || (wins >= 27 && Math.random() < 0.7)) {
                wonLeague = true;
                leagueRank = 1;
            } else if (pts >= 72) {
                leagueRank = Math.floor(Math.random() * 3) + 2;
            } else {
                leagueRank = Math.floor(Math.random() * 4) + 5;
            }

            if (wonLeague || (effectivePower >= 90 && Math.random() < 0.4)) {
                wonUcl = Math.random() < 0.45;
            }
        } else {
            wonLeague = pts >= 78;
            leagueRank = wonLeague ? 1 : 2;
        }

        // Coach of the year
        const isCoachOfYear = wonLeague && wins >= 26;
        if (isCoachOfYear) {
            this.managerStats.coachOfYearAwards += 1;
            this.fame += 250;
        }

        // 4. Update Manager Career Stats
        this.managerStats.seasons += 1;
        this.managerStats.matches += 38;
        this.managerStats.wins += wins;
        this.managerStats.draws += draws;
        this.managerStats.losses += losses;

        if (wonLeague) {
            this.managerStats.trophies.league += 1;
            this.budget += 60000000;
            this.boardTrust = 100;
        }
        if (wonUcl) {
            this.managerStats.trophies.ucl += 1;
            this.budget += 90000000;
            this.boardTrust = 100;
        }

        if (!wonLeague && leagueRank > 5) {
            this.boardTrust = Math.max(20, this.boardTrust - 12);
        }

        const seasonRecord = {
            season: this.season,
            age: this.age,
            clubName: club.name,
            wins,
            draws,
            losses,
            pts,
            leagueRank,
            wonLeague,
            wonUcl,
            isCoachOfYear,
            boardEvaluation: this.boardTrust >= 70 ? '보드진과 팬들의 절대적인 지지 🌟' : (this.boardTrust >= 40 ? '보통 (성적 반등 필요)' : '경질 위기 직면 ⚠️')
        };

        this.history.push(seasonRecord);

        // Age up
        this.age += 1;
        this.season += 1;
        this.transferMarket = this.generateMarketPlayers(6, club.leagueTier);

        return seasonRecord;
    }

    buyPlayer(marketPlayerId) {
        const idx = this.transferMarket.findIndex(p => p.id === marketPlayerId);
        if (idx === -1) return { success: false, message: '해당 선수가 이적 시장에 없습니다.' };

        const target = this.transferMarket[idx];
        if (this.budget < target.price) {
            return { success: false, message: `예산 부족! (필요: ${(target.price/10000).toLocaleString()}만원)` };
        }

        this.budget -= target.price;
        this.transferMarket.splice(idx, 1);
        this.squad.push({
            id: 'sq_b_' + Date.now(),
            name: target.name,
            pos: target.pos,
            ovr: target.ovr,
            isStarter: false
        });

        return { success: true, message: `${target.name} 선수를 영입하여 전력을 보강했습니다!` };
    }
}
