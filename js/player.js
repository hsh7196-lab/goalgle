/**
 * Player Career Model & 1-Year Fast Progression System
 * Includes Nationality, Youth Academies, and Military Service System (KR)
 */

class Player {
    constructor(data = {}) {
        this.name = data.name || '김골글';
        this.nationality = data.nationality || 'KR';
        this.youthId = data.youthId || 'y_maetan';
        this.position = data.position || 'ST';
        this.traitId = data.traitId || 'poacher';

        this.age = data.age || 17;
        this.season = data.season || 1;

        // Youth Academy & Initial Club Assignment
        const youth = getYouthById(this.youthId);
        this.clubId = data.clubId || youth.parentClub || 'c_ss'; // 매탄고 출신은 기본 수원 삼성 입단
        this.wage = data.wage || (this.nationality === 'KR' ? 1200000 : 2000000); // 초기 주급
        this.wealth = data.wealth || 5000000;
        this.fame = data.fame || 25;
        this.managerTrust = data.managerTrust || 55;

        // Military Service Status (Only for Korean nationality)
        // 'NONE' | 'PENDING' (미필) | 'EXEMPT' (병역특례 면제) | 'ENLISTED' (김천 상무 복무 중) | 'COMPLETED' (군필)
        if (this.nationality === 'KR') {
            this.militaryStatus = data.militaryStatus || 'PENDING';
        } else {
            this.militaryStatus = 'NONE';
        }
        this.preMilitaryClubId = data.preMilitaryClubId || null;

        // Base Attributes (1~99) - Harder realistic start
        const base = data.stats || this.generateInitialStats(this.position, this.traitId, youth);
        this.stats = {
            sho: base.sho || 62,
            pas: base.pas || 56,
            dri: base.dri || 60,
            def: base.def || 40,
            phy: base.phy || 58,
            pac: base.pac || 66,
            mental: base.mental || 52
        };

        this.potential = data.potential || Math.floor(Math.random() * 8) + 86; // 86 ~ 94

        // Career Records
        this.careerStats = data.careerStats || {
            apps: 0,
            goals: 0,
            assists: 0,
            trophies: { league: 0, ucl: 0 },
            awards: { ballon: 0, goldenBoot: 0, best11: 0, asianGold: 0 }
        };

        this.history = data.history || [];
    }

    generateInitialStats(pos, traitId, youth) {
        let stats = { sho: 52, pas: 52, dri: 52, def: 46, phy: 54, pac: 58, mental: 50 };
        if (pos === 'ST') {
            stats.sho = 64; stats.pac = 66; stats.dri = 60; stats.phy = 58; stats.def = 32;
        } else if (pos === 'WG') {
            stats.pac = 70; stats.dri = 65; stats.pas = 58; stats.sho = 58; stats.def = 35;
        } else if (pos === 'CAM') {
            stats.pas = 66; stats.dri = 64; stats.sho = 60; stats.mental = 58; stats.def = 38;
        } else if (pos === 'CM') {
            stats.pas = 64; stats.phy = 62; stats.def = 58; stats.pac = 60; stats.sho = 52;
        } else if (pos === 'CB') {
            stats.def = 68; stats.phy = 68; stats.pac = 56; stats.pas = 50; stats.sho = 28;
        }

        // Apply Trait Bonus
        if (traitId === 'poacher') stats.sho += 4;
        else if (traitId === 'sprinter') stats.pac += 5;
        else if (traitId === 'maestro') stats.pas += 5;
        else if (traitId === 'dribbler') stats.dri += 5;
        else if (traitId === 'commander') { stats.mental += 6; stats.phy += 2; }
        else if (traitId === 'ironman') { stats.phy += 5; }

        // Apply Youth Academy Specialization Bonus
        if (youth && youth.bonus) {
            for (const [k, v] of Object.entries(youth.bonus)) {
                if (stats[k] !== undefined) stats[k] += v;
            }
        }

        return stats;
    }

    getOverall() {
        const pInfo = GAME_DATA.positions[this.position] || GAME_DATA.positions.ST;
        const w = pInfo.radarWeights;
        const total = (
            this.stats.sho * (w.sho || 1) +
            this.stats.pas * (w.pas || 1) +
            this.stats.dri * (w.dri || 1) +
            this.stats.def * (w.def || 1) +
            this.stats.phy * (w.phy || 1) +
            this.stats.pac * (w.pac || 1)
        );
        const weightSum = Object.values(w).reduce((a, b) => a + b, 0);
        return Math.min(99, Math.round(total / weightSum));
    }

    // =========================================================================
    // Core 1-Year Fast Progression with Military & Realistic Difficulty
    // =========================================================================
    simulateYear(focusId) {
        const ovr = this.getOverall();

        // Check Military Service Progression (KR only)
        let militaryEventLog = '';
        if (this.nationality === 'KR') {
            militaryEventLog = this.processMilitaryDuty();
        }

        const currentClub = getClubById(this.clubId);

        // 1. Realistic Training Growth
        const growthLog = this.applyAnnualGrowth(focusId);

        // 2. Realistic Match Performance (Apps, Goals, Rating)
        const perf = this.calculateYearlyPerformance(ovr, currentClub);

        // 3. Team Achievements
        const teamPerf = this.calculateTeamAchievements(ovr, currentClub);

        // 4. Ballon d'Or Evaluation (Much higher difficulty!)
        const ballonResult = this.evaluateBallonDor(perf, teamPerf, currentClub);

        // 5. Update Career Totals
        this.careerStats.apps += perf.apps;
        this.careerStats.goals += perf.goals;
        this.careerStats.assists += perf.assists;

        if (teamPerf.wonLeague) this.careerStats.trophies.league += 1;
        if (teamPerf.wonUcl) this.careerStats.trophies.ucl += 1;
        if (perf.isGoldenBoot) this.careerStats.awards.goldenBoot += 1;
        if (ballonResult.rank === 1) this.careerStats.awards.ballon += 1;

        // 6. Finances (Military receives modest stipend)
        const annualWage = this.militaryStatus === 'ENLISTED' ? 12000000 : (this.wage * 52);
        this.wealth += annualWage;
        this.fame += perf.goals * 4 + perf.assists * 2 + (teamPerf.wonLeague ? 40 : 0);

        // 7. Transfer Offers (Blocked if currently enlisted in Gimcheon Sangmu)
        let transferOffers = [];
        if (this.militaryStatus !== 'ENLISTED') {
            transferOffers = this.generateTransferOffers(ovr);
        }

        // 8. Save Record
        const seasonRecord = {
            season: this.season,
            age: this.age,
            clubName: currentClub.name,
            apps: perf.apps,
            goals: perf.goals,
            assists: perf.assists,
            avgRating: perf.avgRating,
            leagueRank: teamPerf.leagueRank,
            wonLeague: teamPerf.wonLeague,
            wonUcl: teamPerf.wonUcl,
            ballonRank: ballonResult.rank,
            ballonWinner: ballonResult.winnerName,
            isGoldenBoot: perf.isGoldenBoot,
            growthLog: `${growthLog} ${militaryEventLog}`.trim(),
            transferOffers
        };
        this.history.push(seasonRecord);

        // 9. Age up & Apply Ageing
        this.age += 1;
        this.season += 1;
        this.applyAgeing();

        return seasonRecord;
    }

    processMilitaryDuty() {
        if (this.militaryStatus === 'PENDING') {
            // Draft age reached (Age 27) without exemption -> Forced enlistment in Gimcheon Sangmu!
            if (this.age >= 27) {
                this.preMilitaryClubId = this.clubId;
                this.clubId = 'c_gimcheon'; // Move to Gimcheon Sangmu
                this.militaryStatus = 'ENLISTED';
                this.stats.phy = Math.min(99, this.stats.phy + 2);
                this.stats.mental = Math.min(99, this.stats.mental + 3);
                return '🪖 [병역 의무] 병역특례를 얻지 못해 입영 영장이 발부되었습니다! 국군체육부대 김천 상무에 입대하여 1년간 복무합니다. (피지컬+2, 멘탈+3)';
            }
        } else if (this.militaryStatus === 'ENLISTED') {
            // Finished 1-year service in Gimcheon Sangmu -> Discharge!
            this.militaryStatus = 'COMPLETED';
            if (this.preMilitaryClubId) {
                this.clubId = this.preMilitaryClubId;
            } else {
                this.clubId = 'c_fcseoul';
            }
            const returnClub = getClubById(this.clubId);
            return `🎖️ [만기 전역] 김천 상무에서의 충실한 군 복무를 마치고 병장 만기 전역했습니다! 원소속팀 ${returnClub.name}으로 화려하게 복귀합니다!`;
        }
        return '';
    }

    applyAnnualGrowth(focusId) {
        const ovr = this.getOverall();
        // Realistic modest growth rate
        const growthFactor = (this.potential - ovr) > 0 ? (this.age <= 21 ? 2.0 : (this.age <= 27 ? 1.0 : 0.3)) : 0.1;
        let logs = [];

        if (this.age <= 20) {
            this.stats.pac = Math.min(99, this.stats.pac + (Math.random() < 0.6 ? 1 : 0));
        }

        const opt = GAME_DATA.annualFocusOptions.find(o => o.id === focusId) || GAME_DATA.annualFocusOptions[0];
        if (opt.bonusStat === 'sho') {
            const gain = Math.min(99 - this.stats.sho, Math.round(2 * growthFactor) || 1);
            this.stats.sho += gain;
            logs.push(`슈팅 감각을 연마했습니다. (SHO +${gain})`);
        } else if (opt.bonusStat === 'pas') {
            const gain = Math.min(99 - this.stats.pas, Math.round(2 * growthFactor) || 1);
            this.stats.pas += gain;
            logs.push(`패스 시야가 넓어졌습니다. (PAS +${gain})`);
        } else if (opt.bonusStat === 'phy') {
            const gain = Math.min(99 - this.stats.phy, Math.round(2 * growthFactor) || 1);
            this.stats.phy += gain;
            logs.push(`피지컬 코어를 단련했습니다. (PHY +${gain})`);
        } else if (opt.bonusStat === 'dri') {
            const gain = Math.min(99 - this.stats.dri, Math.round(2 * growthFactor) || 1);
            this.stats.dri += gain;
            logs.push(`탈압박 드리블 테크닉 향상. (DRI +${gain})`);
        } else if (opt.bonusStat === 'mental') {
            const gain = Math.min(99 - this.stats.mental, 2);
            this.stats.mental += gain;
            logs.push(`축구 지능 및 침착성 강화. (MENTAL +${gain})`);
        } else if (opt.bonusStat === 'fame') {
            this.fame += 70;
            const extraCash = Math.floor(this.fame * 100000);
            this.wealth += extraCash;
            logs.push(`광고 촬영으로 수익 확보. (명성 +70, ${(extraCash/10000).toLocaleString()}만원)`);
        }

        return logs.join(' ');
    }

    calculateYearlyPerformance(ovr, club) {
        // Realistic appearances: Young unproven players must fight for minutes
        let apps = 38;
        if (this.age <= 18 && ovr < 70) {
            apps = Math.floor(Math.random() * 12) + 8; // 8~19 apps (Youth backup)
        } else if (ovr < 76 && club.power >= 88) {
            apps = Math.floor(Math.random() * 14) + 14; // Sub role at Real/City
        } else if (ovr >= 82) {
            apps = Math.min(38, Math.floor(Math.random() * 5) + 34); // Undisputed key player
        } else {
            apps = Math.floor(Math.random() * 10) + 24;
        }

        let goals = 0;
        let assists = 0;

        if (this.position === 'ST') {
            const baseRate = Math.pow(this.stats.sho / 10, 1.65) * 0.38;
            goals = Math.round(baseRate * (apps / 38));
            assists = Math.round((this.stats.pas / 15) * (apps / 38));
            if (this.traitId === 'poacher') goals = Math.round(goals * 1.18);
        } else if (this.position === 'WG') {
            goals = Math.round((Math.pow(this.stats.sho / 10, 1.4) * 0.3) * (apps / 38));
            assists = Math.round((Math.pow(this.stats.dri / 10, 1.5) * 0.36) * (apps / 38));
            if (this.traitId === 'sprinter') { goals = Math.round(goals * 1.15); assists = Math.round(assists * 1.15); }
        } else if (this.position === 'CAM') {
            goals = Math.round((this.stats.sho / 10) * (apps / 38));
            assists = Math.round((Math.pow(this.stats.pas / 10, 1.6) * 0.42) * (apps / 38));
            if (this.traitId === 'maestro') assists = Math.round(assists * 1.25);
        } else if (this.position === 'CM') {
            goals = Math.round((this.stats.sho / 16) * (apps / 38));
            assists = Math.round((this.stats.pas / 10) * (apps / 38));
        } else if (this.position === 'CB') {
            goals = Math.round(Math.random() * 2);
            assists = Math.round(Math.random() * 2);
        }

        let baseRating = 6.4 + (ovr - 68) * 0.03 + (goals * 0.02) + (assists * 0.015);
        if (this.traitId === 'dribbler') baseRating += 0.2;
        const avgRating = parseFloat(Math.min(8.5, Math.max(6.1, baseRating)).toFixed(2));

        const isGoldenBoot = goals >= 28;

        return { apps, goals, assists, avgRating, isGoldenBoot };
    }

    calculateTeamAchievements(ovr, club) {
        const teamPower = club.power + (ovr > club.power ? (ovr - club.power) * 0.3 : 0);
        let leagueRank = 5;
        let wonLeague = false;
        let wonUcl = false;

        if (club.leagueTier === 1) {
            if (teamPower >= 92 && Math.random() < 0.6) {
                leagueRank = 1;
                wonLeague = true;
            } else if (teamPower >= 87) {
                leagueRank = Math.floor(Math.random() * 3) + 2;
            } else {
                leagueRank = Math.floor(Math.random() * 5) + 5;
            }

            if (wonLeague || (teamPower >= 89 && Math.random() < 0.3)) {
                wonUcl = Math.random() < 0.35; // UCL is very hard to win
            }
        } else if (club.leagueTier === 2) {
            wonLeague = teamPower >= 76 && Math.random() < 0.65;
            leagueRank = wonLeague ? 1 : (Math.floor(Math.random() * 4) + 2);
        } else {
            wonLeague = teamPower >= 70 && Math.random() < 0.7;
            leagueRank = wonLeague ? 1 : 2;
        }

        return { leagueRank, wonLeague, wonUcl };
    }

    // Realistic Harder Ballon d'Or
    evaluateBallonDor(perf, teamPerf, club) {
        // Must be in Tier 1 European League to compete for Ballon d'Or
        if (club.leagueTier !== 1) {
            return { rank: 35, winnerName: GAME_DATA.rivals[0].name };
        }

        // Must have stellar numbers to score over 200 pts
        const myScore = (
            (perf.goals * 3.0) +
            (perf.assists * 1.8) +
            (teamPerf.wonUcl ? 50 : 0) +
            (teamPerf.wonLeague ? 25 : 0) +
            (perf.avgRating * 11) +
            (this.fame / 35)
        );

        const rivalScores = GAME_DATA.rivals.map(r => ({
            name: r.name,
            score: r.basePoints + (Math.random() * 30 - 15)
        }));

        rivalScores.push({ name: this.name, score: myScore, isMe: true });
        rivalScores.sort((a, b) => b.score - a.score);

        const myRank = rivalScores.findIndex(r => r.isMe) + 1;
        const winner = rivalScores[0].name;

        return { rank: myRank, winnerName: winner, myScore: Math.round(myScore) };
    }

    generateTransferOffers(ovr) {
        const offers = [];
        const currentClub = getClubById(this.clubId);

        for (const league of GAME_DATA.leagues) {
            for (const club of league.clubs) {
                if (club.id === this.clubId) continue;
                if (club.id === 'c_gimcheon') continue; // Cannot normally transfer to military club

                if (ovr >= (club.power - 5) && ovr <= (club.power + 8)) {
                    const proposedWage = Math.floor(club.power * 130000 * (ovr / 72));
                    offers.push({
                        club,
                        wage: proposedWage,
                        signingBonus: proposedWage * 4
                    });
                }
            }
        }
        return offers.slice(0, 3);
    }

    acceptTransfer(offer) {
        this.clubId = offer.club.id;
        this.wage = offer.wage;
        this.wealth += offer.signingBonus;
        this.fame += 45;
    }

    applyAgeing() {
        if (this.age >= 32) {
            const decay = this.age >= 35 ? 3 : 1;
            this.stats.pac = Math.max(30, this.stats.pac - decay);
            this.stats.phy = Math.max(35, this.stats.phy - (decay - 1));
            this.stats.mental = Math.min(99, this.stats.mental + 1);
            this.stats.pas = Math.min(99, this.stats.pas + 1);
        }
    }

    getHallOfFame() {
        const ballons = this.careerStats.awards.ballon;
        const trophies = this.careerStats.trophies.league + this.careerStats.trophies.ucl;
        const goals = this.careerStats.goals;

        for (const tier of GAME_DATA.hallOfFameTiers) {
            if (ballons >= tier.minBallon && trophies >= tier.minTrophies && goals >= tier.minGoals) {
                return tier;
            }
        }
        return GAME_DATA.hallOfFameTiers[GAME_DATA.hallOfFameTiers.length - 1];
    }
}
