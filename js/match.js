/**
 * Match Engine for both Player Career and Manager Career
 * Supports real-time text commentary, interactive decisions, speed control, and sounds
 */

class MatchEngine {
    constructor() {
        this.isRunning = false;
        this.currentMinute = 0;
        this.homeTeam = null;
        this.awayTeam = null;
        this.homeScore = 0;
        this.awayScore = 0;
        this.isUserHome = true;
        this.mode = 'player'; // 'player' | 'manager'
        this.events = [];
        this.speed = 100; // ms per simulated game minute
        this.timer = null;
        this.interactiveResolve = null;
    }

    // Initialize player mode match
    initPlayerMatch(player, opponentClub) {
        this.mode = 'player';
        this.player = player;
        this.userClub = getClubById(player.clubId);
        this.opponentClub = opponentClub;
        this.isUserHome = Math.random() > 0.5;

        this.homeTeam = this.isUserHome ? this.userClub : this.opponentClub;
        this.awayTeam = this.isUserHome ? this.opponentClub : this.userClub;

        this.homeScore = 0;
        this.awayScore = 0;
        this.currentMinute = 0;
        this.events = [];
        this.userMatchStats = {
            rating: 6.0,
            goals: 0,
            assists: 0,
            shots: 0,
            shotsOnTarget: 0,
            keyPasses: 0,
            interceptions: 0,
            minutesPlayed: 0
        };

        const status = player.getMatchStatus();
        this.playerStatus = status; // 'STARTING', 'SUBSTITUTE', 'BENCH', 'EXCLUDED'
    }

    // Initialize manager mode match
    initManagerMatch(manager, opponentClub) {
        this.mode = 'manager';
        this.manager = manager;
        this.userClub = getClubById(manager.clubId);
        this.opponentClub = opponentClub;
        this.isUserHome = Math.random() > 0.5;

        this.homeTeam = this.isUserHome ? this.userClub : this.opponentClub;
        this.awayTeam = this.isUserHome ? this.opponentClub : this.userClub;

        this.homeScore = 0;
        this.awayScore = 0;
        this.currentMinute = 0;
        this.events = [];
    }

    // Start simulation loop
    async simulate(callbacks) {
        this.isRunning = true;
        this.callbacks = callbacks; // onMinute, onEvent, onInteractiveChoice, onFinish

        if (window.sound) window.sound.playWhistle(false);
        this.addLog(`[경기 시작] 주심의 킥오프 휘슬과 함께 ${this.homeTeam.name} vs ${this.awayTeam.name} 경기가 시작됩니다!`);

        return new Promise((resolve) => {
            this.finishResolve = resolve;
            this.step();
        });
    }

    setSpeed(speedVal) {
        this.speed = speedVal; // 150(1x), 50(2x), 0(instant)
    }

    step() {
        if (!this.isRunning) return;

        if (this.speed === 0) {
            // Instant skip
            while (this.currentMinute < 90) {
                this.currentMinute++;
                this.processMinute();
            }
            this.endMatch();
            return;
        }

        this.currentMinute++;
        this.processMinute();

        if (this.currentMinute >= 90) {
            this.endMatch();
            return;
        }

        if (this.callbacks.onMinute) {
            this.callbacks.onMinute(this.currentMinute, this.homeScore, this.awayScore);
        }

        this.timer = setTimeout(() => this.step(), this.speed);
    }

    processMinute() {
        const m = this.currentMinute;

        if (this.mode === 'player') {
            this.processPlayerMinute(m);
        } else {
            this.processManagerMinute(m);
        }
    }

    processPlayerMinute(m) {
        const p = this.player;
        const isPlaying = (this.playerStatus === 'STARTING') || (this.playerStatus === 'SUBSTITUTE' && m >= 60);

        if (isPlaying) {
            this.userMatchStats.minutesPlayed++;
        }

        // Sub entry moment
        if (this.playerStatus === 'SUBSTITUTE' && m === 60) {
            this.addLog(`[선수 교체] 60분, 감독의 호출을 받고 ${p.name} 선수가 그라운드에 투입됩니다! 관중들의 뜨거운 박수!`);
        }

        // Random team goal occurrences
        const userPower = this.userClub.power + (isPlaying ? (p.getOverall() - 70) * 0.15 : 0);
        const oppPower = this.opponentClub.power;
        const powerDiff = (userPower - oppPower) / 100;

        // Approx 0.03 probability of goal event per minute
        if (Math.random() < 0.035) {
            const isUserGoal = Math.random() < (0.5 + powerDiff * 0.4);

            if (isUserGoal) {
                if (isPlaying && Math.random() < 0.45) {
                    // Interactive user chance!
                    this.triggerPlayerChance(m);
                } else {
                    // Teammate goal
                    if (this.isUserHome) this.homeScore++; else this.awayScore++;
                    const scorers = ['라파엘', '호드리구', '마르코', '브루노', '알렉스'];
                    const scorer = scorers[Math.floor(Math.random() * scorers.length)];
                    this.addLog(`⚽ [GOAL!!] ${m}' ${this.userClub.name}의 ${scorer} 선수가 멋진 슈팅으로 골망을 흔듭니다! (${this.homeScore} : ${this.awayScore})`);
                    if (window.sound) window.sound.playGoal();
                }
            } else {
                // Opponent goal
                if (this.isUserHome) this.awayScore++; else this.homeScore++;
                this.addLog(`🚨 [실점] ${m}' ${this.opponentClub.name}의 기습적인 침투로 실점합니다. (${this.homeScore} : ${this.awayScore})`);
            }
        }
    }

    // Trigger interactive choice for player
    triggerPlayerChance(m) {
        const p = this.player;
        this.userMatchStats.shots++;

        // Random chance scenario
        const scenarios = [
            {
                type: 'shoot',
                text: `${m}' 페널티 박스 정면에서 완벽한 찬스를 잡았습니다! 어떤 슛을 시도하시겠습니까?`,
                options: [
                    { label: '구석을 찌르는 감아차기 (Z+D)', key: 'finesse' },
                    { label: '골망 찢는 강력한 파워 슈팅', key: 'power' },
                    { label: '쇄도하는 동료에게 킬패스', key: 'pass' }
                ]
            }
        ];

        const sc = scenarios[0];
        // If speed is instant, auto-resolve
        if (this.speed === 0) {
            this.resolvePlayerChoice('finesse');
            return;
        }

        // Pause timer and request user choice
        clearTimeout(this.timer);
        if (this.callbacks.onInteractiveChoice) {
            this.callbacks.onInteractiveChoice(sc, (chosenKey) => {
                this.resolvePlayerChoice(chosenKey);
                this.step();
            });
        }
    }

    resolvePlayerChoice(choice) {
        const p = this.player;
        const ovr = p.getOverall();
        let success = false;

        if (choice === 'finesse') {
            const chance = (p.stats.sho * 0.7 + p.stats.dri * 0.3) / 100;
            success = Math.random() < Math.max(0.35, chance);
            if (success) {
                if (this.isUserHome) this.homeScore++; else this.awayScore++;
                this.userMatchStats.goals++;
                this.userMatchStats.rating = Math.min(10.0, this.userMatchStats.rating + 1.2);
                this.addLog(`⚽⚽ [환상적인 원더골!!] ${p.name} 선수의 날카로운 궤적의 감아차기가 구석 골망을 갈랐습니다!!`);
                if (window.sound) window.sound.playGoal();
            } else {
                this.addLog(`🧤 [선방] ${p.name}의 감아차기가 상대 골키퍼의 슈퍼 세이브에 막혔습니다!`);
            }
        } else if (choice === 'power') {
            const chance = (p.stats.sho * 0.7 + p.stats.phy * 0.3) / 100;
            success = Math.random() < Math.max(0.32, chance);
            if (success) {
                if (this.isUserHome) this.homeScore++; else this.awayScore++;
                this.userMatchStats.goals++;
                this.userMatchStats.rating = Math.min(10.0, this.userMatchStats.rating + 1.2);
                this.addLog(`🚀 [빨래줄 골!!] ${p.name}의 대포알 같은 슈팅이 골대를 강타하며 골문으로 빨려 들어갑니다!!`);
                if (window.sound) window.sound.playGoal();
            } else {
                this.addLog(`💨 [빗나감] ${p.name}의 강력한 중거리 슛이 크로스바를 살짝 넘어갑니다.`);
            }
        } else if (choice === 'pass') {
            const chance = (p.stats.pas * 0.8 + p.stats.dri * 0.2) / 100;
            success = Math.random() < Math.max(0.4, chance);
            if (success) {
                if (this.isUserHome) this.homeScore++; else this.awayScore++;
                this.userMatchStats.assists++;
                this.userMatchStats.rating = Math.min(10.0, this.userMatchStats.rating + 1.0);
                this.addLog(`🎯 [특급 어시스트!] ${p.name}의 절묘한 킬패스를 받은 동료가 침착하게 득점에 성공합니다!!`);
                if (window.sound) window.sound.playGoal();
            } else {
                this.addLog(`❌ [패스 차단] 수비수의 발끝에 걸리며 찬스가 무산되었습니다.`);
            }
        }
    }

    processManagerMinute(m) {
        const mgr = this.manager;
        const teamOvr = mgr.getTeamOverall();
        const oppOvr = this.opponentClub.power;
        const diff = (teamOvr - oppOvr) / 100;

        if (Math.random() < 0.033) {
            const isOurGoal = Math.random() < (0.5 + diff * 0.45);
            if (isOurGoal) {
                if (this.isUserHome) this.homeScore++; else this.awayScore++;
                const starters = mgr.squad.filter(p => p.isStarter);
                const scorer = starters.length > 0 ? starters[Math.floor(Math.random() * starters.length)].name : '공격수';
                this.addLog(`⚽ [득점!] ${m}' 전술 지시에 따른 빠른 침투로 ${scorer} 선수가 골을 기록합니다! (${this.homeScore} : ${this.awayScore})`);
                if (window.sound) window.sound.playGoal();
            } else {
                if (this.isUserHome) this.awayScore++; else this.homeScore++;
                this.addLog(`🚨 [실점] ${m}' ${this.opponentClub.name}의 세트피스 헤더에 실점하고 맙니다. (${this.homeScore} : ${this.awayScore})`);
            }
        }
    }

    addLog(text) {
        this.events.unshift(text); // newest first
        if (this.callbacks.onEvent) {
            this.callbacks.onEvent(text, this.events);
        }
    }

    endMatch() {
        this.isRunning = false;
        clearTimeout(this.timer);
        if (window.sound) window.sound.playWhistle(true);

        const isUserHome = this.isUserHome;
        const userGoals = isUserHome ? this.homeScore : this.awayScore;
        const oppGoals = isUserHome ? this.awayScore : this.homeScore;
        const isWin = userGoals > oppGoals;
        const isDraw = userGoals === oppGoals;

        this.addLog(`[경기 종료] 최종 스코어 ${this.homeTeam.name} ${this.homeScore} : ${this.awayScore} ${this.awayTeam.name}`);

        let resultData = {
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            userGoals,
            oppGoals,
            isWin,
            isDraw,
            events: this.events
        };

        if (this.mode === 'player') {
            // Finalize player rating
            if (this.userMatchStats.minutesPlayed === 0) {
                this.userMatchStats.rating = 0;
            } else {
                let base = isWin ? 7.0 : (isDraw ? 6.5 : 6.0);
                let finalRating = base + (this.userMatchStats.goals * 1.2) + (this.userMatchStats.assists * 0.8);
                this.userMatchStats.rating = Math.min(10.0, Math.max(5.0, parseFloat(finalRating.toFixed(1))));
            }
            const isMom = isWin && (this.userMatchStats.goals >= 2 || (this.userMatchStats.goals >= 1 && this.userMatchStats.assists >= 1));
            this.userMatchStats.isMom = isMom;
            resultData.playerStats = this.userMatchStats;
        }

        if (this.callbacks.onFinish) {
            this.callbacks.onFinish(resultData);
        }
        if (this.finishResolve) {
            this.finishResolve(resultData);
        }
    }
}
