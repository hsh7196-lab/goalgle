/**
 * Goalgle Football Life Simulation - Global Expansion App Controller
 * With Nationality, Youth Academies, and Military Service System (KR)
 */

class AppController {
    constructor() {
        this.player = null;
        this.manager = null;
        this.mode = 'INTRO';
        this.selectedFocus = 'shooting';
        this.init();
    }

    init() {
        this.loadSave();
        this.bindEvents();
        if (!this.player && !this.manager) {
            this.setMode('INTRO');
        } else if (this.manager) {
            this.setMode('MANAGER');
        } else {
            this.setMode('PLAYER');
        }
    }

    saveState() {
        const state = {
            mode: this.mode,
            player: this.player,
            manager: this.manager
        };
        try {
            localStorage.setItem('goalgle_football_sim_global_save', JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save state', e);
        }
    }

    loadSave() {
        try {
            const raw = localStorage.getItem('goalgle_football_sim_global_save');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.player) {
                    this.player = new Player(parsed.player);
                }
                if (parsed.manager) {
                    this.manager = new Manager(this.player || { name: parsed.manager.name, age: parsed.manager.age, careerStats: { apps: 0, goals: 0, assists: 0, trophies: {}, awards: {} } }, parsed.manager.clubId);
                    Object.assign(this.manager, parsed.manager);
                }
                this.mode = parsed.mode || 'PLAYER';
            }
        } catch (e) {
            console.error('Failed to load save', e);
        }
    }

    resetSave() {
        localStorage.removeItem('goalgle_football_sim_global_save');
        this.player = null;
        this.manager = null;
        this.setMode('INTRO');
    }

    bindEvents() {
        // Mute button
        const muteBtn = document.getElementById('btn-mute');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const isMuted = window.sound.toggleMute();
                muteBtn.innerHTML = isMuted ? '🔇 음소거' : '🔊 사운드 ON';
            });
        }

        // Nationality dropdown change -> update Youth Academy options
        const selectNation = document.getElementById('select-nation');
        if (selectNation) {
            selectNation.addEventListener('change', (e) => {
                this.populateYouthOptions(e.target.value);
            });
            this.populateYouthOptions(selectNation.value || 'KR');
        }

        // New Game Creation
        const createForm = document.getElementById('form-create-player');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                window.sound.playClick();

                const name = document.getElementById('input-name').value.trim() || '김골글';
                const nationality = document.getElementById('select-nation').value;
                const youthId = document.getElementById('select-youth').value;
                const position = document.getElementById('select-pos').value;
                const traitId = document.getElementById('select-trait').value;

                this.player = new Player({
                    name,
                    nationality,
                    youthId,
                    position,
                    traitId
                });

                this.setMode('PLAYER');
                this.saveState();
            });
        }

        // 1-Year Fast Simulation Button
        const btnSimYear = document.getElementById('btn-sim-year');
        if (btnSimYear) {
            btnSimYear.addEventListener('click', () => this.handleSimulatePlayerYear());
        }

        // Retire Crossroads Modal Opener
        const btnRetire = document.getElementById('btn-open-retire');
        if (btnRetire) {
            btnRetire.addEventListener('click', () => this.showRetireChoiceModal());
        }

        // Focus Option Selection
        document.querySelectorAll('.btn-focus-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                window.sound.playClick();
                document.querySelectorAll('.btn-focus-option').forEach(b => {
                    b.classList.remove('border-emerald-500', 'bg-emerald-950/40');
                    b.classList.add('border-slate-800', 'bg-slate-900/60');
                });
                const target = e.currentTarget;
                target.classList.remove('border-slate-800', 'bg-slate-900/60');
                target.classList.add('border-emerald-500', 'bg-emerald-950/40');
                this.selectedFocus = target.dataset.focus;
            });
        });

        // 1-Year Manager Simulation Button
        const btnMgrSimYear = document.getElementById('btn-mgr-sim-year');
        if (btnMgrSimYear) {
            btnMgrSimYear.addEventListener('click', () => this.handleSimulateManagerYear());
        }

        // Manager Formations
        document.querySelectorAll('.btn-formation-select').forEach(btn => {
            btn.addEventListener('click', (e) => {
                window.sound.playClick();
                this.manager.formation = e.target.dataset.formation;
                this.updateManagerUI();
            });
        });
    }

    populateYouthOptions(nationCode) {
        const youthSelect = document.getElementById('select-youth');
        if (!youthSelect) return;

        youthSelect.innerHTML = '';
        GAME_DATA.youthAcademies.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y.id;
            opt.innerText = `${y.name} (${y.desc})`;
            if (nationCode === 'KR' && y.nation === 'KR') {
                opt.selected = true;
            }
            youthSelect.appendChild(opt);
        });
    }

    setMode(mode) {
        this.mode = mode;
        const screens = {
            INTRO: document.getElementById('screen-intro'),
            PLAYER: document.getElementById('screen-player'),
            MANAGER: document.getElementById('screen-manager'),
            PLAYER_ENDING: document.getElementById('screen-player-ending')
        };

        for (const [key, el] of Object.entries(screens)) {
            if (el) {
                if (key === mode) el.classList.remove('hidden');
                else el.classList.add('hidden');
            }
        }

        if (mode === 'PLAYER') this.updatePlayerUI();
        else if (mode === 'MANAGER') this.updateManagerUI();
        else if (mode === 'PLAYER_ENDING') this.renderPlayerEnding();

        this.saveState();
    }

    // ==========================================
    // Player Mode UI & Year Simulation
    // ==========================================
    updatePlayerUI() {
        if (!this.player) return;
        const p = this.player;
        const club = getClubById(p.clubId);
        const youth = getYouthById(p.youthId);
        const nationObj = GAME_DATA.nationalities.find(n => n.id === p.nationality) || GAME_DATA.nationalities[0];

        document.getElementById('header-player-name').innerText = p.name;
        document.getElementById('header-nation-badge').innerText = nationObj.name;
        document.getElementById('header-youth-name').innerText = `유스: ${youth.name.split('(')[0]}`;
        document.getElementById('header-age').innerText = `${p.age}세`;
        document.getElementById('header-season').innerText = `시즌 ${p.season}`;
        document.getElementById('header-club-name').innerText = club.name;
        document.getElementById('header-ovr-badge').innerText = `OVR ${p.getOverall()}`;

        // Wealth, Fame, Wage
        document.getElementById('header-wage').innerText = `주급 ${(p.wage / 10000).toLocaleString()}만원`;
        document.getElementById('header-wealth').innerText = `자산 ${(p.wealth / 100000000).toFixed(1)}억원`;
        document.getElementById('header-fame').innerText = `명성 ${p.fame}`;

        // Military Service Badge (KR only)
        const milBadge = document.getElementById('header-military-badge');
        if (milBadge) {
            if (p.nationality === 'KR') {
                milBadge.classList.remove('hidden');
                if (p.militaryStatus === 'PENDING') {
                    milBadge.innerHTML = '🪖 병역: 미필 (23세 이전 특례 필요)';
                    milBadge.className = 'px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold';
                } else if (p.militaryStatus === 'EXEMPT') {
                    milBadge.innerHTML = '🎖️ 병역: 체육요원 특례 (면제)';
                    milBadge.className = 'px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold';
                } else if (p.militaryStatus === 'ENLISTED') {
                    milBadge.innerHTML = '🎖️ 병역: 김천 상무 군 복무 중';
                    milBadge.className = 'px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold';
                } else if (p.militaryStatus === 'COMPLETED') {
                    milBadge.innerHTML = '✅ 병역: 병장 만기 전역 (군필)';
                    milBadge.className = 'px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold';
                }
            } else {
                milBadge.classList.add('hidden');
            }
        }

        // Stats
        document.getElementById('stat-sho').innerText = p.stats.sho;
        document.getElementById('stat-pas').innerText = p.stats.pas;
        document.getElementById('stat-dri').innerText = p.stats.dri;
        document.getElementById('stat-def').innerText = p.stats.def;
        document.getElementById('stat-phy').innerText = p.stats.phy;
        document.getElementById('stat-pac').innerText = p.stats.pac;
        document.getElementById('stat-mental').innerText = p.stats.mental;

        // Career Totals
        document.getElementById('career-apps').innerText = p.careerStats.apps;
        document.getElementById('career-goals').innerText = p.careerStats.goals;
        document.getElementById('career-assists').innerText = p.careerStats.assists;
        document.getElementById('trophy-ballon-count').innerText = p.careerStats.awards.ballon;
        document.getElementById('trophy-league-count').innerText = p.careerStats.trophies.league;
        document.getElementById('trophy-ucl-count').innerText = p.careerStats.trophies.ucl;

        this.renderPlayerHistoryFeed();
        this.drawRadarChart();
    }

    drawRadarChart() {
        const canvas = document.getElementById('radar-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        const center = size / 2;
        const radius = center - 28;

        ctx.clearRect(0, 0, size, size);

        const labels = ['슈팅(SHO)', '패스(PAS)', '드리블(DRI)', '수비(DEF)', '피지컬(PHY)', '스피드(PAC)'];
        const stats = [
            this.player.stats.sho,
            this.player.stats.pas,
            this.player.stats.dri,
            this.player.stats.def,
            this.player.stats.phy,
            this.player.stats.pac
        ];

        const numSides = 6;
        const angleStep = (Math.PI * 2) / numSides;

        // Web levels
        const levels = [0.25, 0.5, 0.75, 1.0];
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;

        levels.forEach(lvl => {
            ctx.beginPath();
            for (let i = 0; i < numSides; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const x = center + Math.cos(angle) * (radius * lvl);
                const y = center + Math.sin(angle) * (radius * lvl);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        });

        // Radial Spokes
        ctx.font = '10px Pretendard, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < numSides; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.lineTo(x, y);
            ctx.stroke();

            const lx = center + Math.cos(angle) * (radius + 16);
            const ly = center + Math.sin(angle) * (radius + 16);
            ctx.fillText(labels[i], lx, ly);
        }

        // Polygon
        ctx.beginPath();
        for (let i = 0; i < numSides; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const val = Math.min(99, Math.max(30, stats[i])) / 99;
            const x = center + Math.cos(angle) * (radius * val);
            const y = center + Math.sin(angle) * (radius * val);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    renderPlayerHistoryFeed() {
        const feed = document.getElementById('player-history-feed');
        if (!feed) return;

        if (this.player.history.length === 0) {
            feed.innerHTML = `
                <div class="text-center py-8 text-slate-500 text-xs">
                    아직 첫 시즌이 시작되지 않았습니다.<br>올해의 중점 훈련을 선택하고 [1년 시뮬레이션] 버튼을 누르세요!
                </div>
            `;
            return;
        }

        feed.innerHTML = [...this.player.history].reverse().map(h => `
            <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
                <div class="flex justify-between items-center">
                    <span class="font-black text-emerald-400">시즌 ${h.season} (${h.age}세)</span>
                    <span class="text-slate-400 font-semibold">${h.clubName} • 리그 ${h.leagueRank}위</span>
                </div>
                <div class="text-white font-bold">
                    ${h.apps}경기 ${h.goals}골 ${h.assists}도움 (평균 평점 ${h.avgRating})
                </div>
                <div class="flex flex-wrap gap-1 text-[11px] mt-1">
                    ${h.ballonRank === 1 ? '<span class="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">🏆 발롱도르 수상!</span>' : `<span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">발롱도르 ${h.ballonRank}위</span>`}
                    ${h.wonLeague ? '<span class="px-2 py-0.5 rounded bg-blue-600 text-white font-bold">🥇 리그 우승</span>' : ''}
                    ${h.wonUcl ? '<span class="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold">⭐ 챔피언스리그 제패</span>' : ''}
                    ${h.isGoldenBoot ? '<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">👟 득점왕</span>' : ''}
                </div>
                <div class="text-slate-400 text-[11px] pt-1 border-t border-slate-800/60">
                    ${h.growthLog}
                </div>
            </div>
        `).join('');
    }

    handleSimulatePlayerYear() {
        window.sound.playWhistle(false);

        // 1. Check Asian Games Military Exemption Event (KR only, Age 21~23, Pending)
        if (this.player.nationality === 'KR' && this.player.militaryStatus === 'PENDING' && (this.player.age === 21 || this.player.age === 22)) {
            this.showAsianGamesExemptionModal(() => {
                this.executeYearProgression();
            });
            return;
        }

        this.executeYearProgression();
    }

    // Asian Games Gold Medal Military Challenge Modal
    showAsianGamesExemptionModal(onFinished) {
        const modal = document.getElementById('modal-asian-games');
        modal.classList.remove('hidden');

        document.getElementById('btn-asian-shoot').onclick = () => {
            window.sound.playClick();
            const ovr = this.player.getOverall();
            const success = Math.random() < Math.max(0.45, ovr / 105);
            modal.classList.add('hidden');

            if (success) {
                if (window.sound) window.sound.playAward();
                this.player.militaryStatus = 'EXEMPT';
                this.player.careerStats.awards.asianGold = 1;
                this.player.fame += 200;
                this.showNotification('🥇 [병역특례 달성!!] 아시안게임 결승전 환상적인 결승골로 금메달 획득! 예술체육요원 병역특례(면제)를 쟁취했습니다!!', 'success');
            } else {
                this.showNotification('🥈 아쉬운 준우승으로 은메달에 그쳤습니다. 만 27세 상무 입대 대상이 유지됩니다.', 'warning');
            }
            onFinished();
        };

        document.getElementById('btn-asian-pass').onclick = () => {
            window.sound.playClick();
            const ovr = this.player.getOverall();
            const success = Math.random() < Math.max(0.42, (this.player.stats.pas + this.player.stats.mental) / 190);
            modal.classList.add('hidden');

            if (success) {
                if (window.sound) window.sound.playAward();
                this.player.militaryStatus = 'EXEMPT';
                this.player.careerStats.awards.asianGold = 1;
                this.player.fame += 180;
                this.showNotification('🥇 [병역특례 달성!!] 절묘한 스루패스로 연장 결승골을 어시스트하여 금메달 획득! 병역특례를 쟁취했습니다!!', 'success');
            } else {
                this.showNotification('🥈 상대 수비에 차단당하며 아쉽게 은메달에 머물렀습니다.', 'warning');
            }
            onFinished();
        };
    }

    executeYearProgression() {
        const seasonRecord = this.player.simulateYear(this.selectedFocus);

        if (seasonRecord.ballonRank === 1) {
            if (window.sound) window.sound.playAward();
            this.showBallonCelebrationModal(seasonRecord);
        } else {
            if (window.sound) window.sound.playGoal();
            this.showSeasonReportModal(seasonRecord);
        }

        this.updatePlayerUI();
        this.saveState();
    }

    showSeasonReportModal(record) {
        const modal = document.getElementById('modal-season-report');
        modal.classList.remove('hidden');

        document.getElementById('rep-season-title').innerText = `시즌 ${record.season} (${record.age}세) 결산`;
        document.getElementById('rep-apps').innerText = `${record.apps}경기`;
        document.getElementById('rep-goals').innerText = `${record.goals}골`;
        document.getElementById('rep-assists').innerText = `${record.assists}도움`;
        document.getElementById('rep-rating').innerText = record.avgRating;

        const ballonText = record.ballonRank === 1 
            ? '🏆 발롱도르 1위 수상!! 세계 축구 정점 등극!' 
            : `발롱도르 ${record.ballonRank}위 (수상자: ${record.ballonWinner})`;
        document.getElementById('rep-ballon-rank').innerText = ballonText;

        document.getElementById('rep-growth-text').innerText = record.growthLog;

        const offersContainer = document.getElementById('rep-transfer-offers');
        if (record.transferOffers && record.transferOffers.length > 0) {
            offersContainer.innerHTML = `
                <div class="font-bold text-slate-300 text-xs mb-2">📩 이적 제안서 도착</div>
                <div class="space-y-1.5">
                    ${record.transferOffers.map((off, idx) => `
                        <div class="p-2.5 bg-slate-900 rounded-lg border border-slate-700 flex justify-between items-center text-xs">
                            <div>
                                <span class="font-bold text-white">${off.club.name}</span>
                                <span class="text-slate-400 ml-2">주급 ${(off.wage/10000).toLocaleString()}만원</span>
                            </div>
                            <button class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold btn-accept-transfer" data-idx="${idx}">
                                이적
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            offersContainer.querySelectorAll('.btn-accept-transfer').forEach(b => {
                b.onclick = (e) => {
                    window.sound.playClick();
                    const off = record.transferOffers[parseInt(e.target.dataset.idx, 10)];
                    this.player.acceptTransfer(off);
                    this.showNotification(`${off.club.name}으로 이적을 완료했습니다!`, 'success');
                    offersContainer.innerHTML = `<div class="text-emerald-400 font-bold text-xs">${off.club.name} 입단 완료!</div>`;
                    this.updatePlayerUI();
                };
            });
        } else {
            offersContainer.innerHTML = `<div class="text-slate-500 text-xs">${this.player.militaryStatus === 'ENLISTED' ? '김천 상무 군 복무 중으로 이적이 제한됩니다.' : '현재 팀에 잔류하여 다음 시즌을 준비합니다.'}</div>`;
        }

        document.getElementById('btn-close-report').onclick = () => {
            window.sound.playClick();
            modal.classList.add('hidden');
        };
    }

    showBallonCelebrationModal(record) {
        const modal = document.getElementById('modal-ballon');
        modal.classList.remove('hidden');
        document.getElementById('ballon-recipient').innerText = this.player.name;
        document.getElementById('ballon-season-text').innerText = `시즌 ${record.season} 세계 최고의 축구선수 등극!`;

        document.getElementById('btn-ballon-close').onclick = () => {
            window.sound.playClick();
            modal.classList.add('hidden');
            this.showSeasonReportModal(record);
        };
    }

    // ==========================================
    // Retire Crossroads Modal
    // ==========================================
    showRetireChoiceModal() {
        window.sound.playClick();
        const modal = document.getElementById('modal-retire-crossroads');
        modal.classList.remove('hidden');

        document.getElementById('retire-preview-name').innerText = this.player.name;
        document.getElementById('retire-preview-stats').innerText = 
            `통산 ${this.player.careerStats.apps}경기 ${this.player.careerStats.goals}골 ${this.player.careerStats.assists}도움 • 발롱도르 ${this.player.careerStats.awards.ballon}회`;

        // Choice A: 선수 은퇴로 게임 종료 (명예의 전당)
        document.getElementById('btn-choose-retire-player').onclick = () => {
            window.sound.playClick();
            modal.classList.add('hidden');
            this.setMode('PLAYER_ENDING');
        };

        // Choice B: 감독으로 전직 (축구 인생 2막 시작)
        document.getElementById('btn-choose-become-manager').onclick = () => {
            window.sound.playClick();
            modal.classList.add('hidden');
            this.transitionToManagerMode();
        };

        document.getElementById('btn-cancel-retire').onclick = () => {
            window.sound.playClick();
            modal.classList.add('hidden');
        };
    }

    transitionToManagerMode() {
        if (window.sound) window.sound.playAward();
        this.manager = new Manager(this.player);
        this.showNotification(`축하합니다! ${this.player.name}님이 UEFA Pro 라이선스를 취득하고 ${getClubById(this.manager.clubId).name} 감독으로 부임했습니다!`, 'success');
        this.setMode('MANAGER');
    }

    // ==========================================
    // Player Ending (Hall of Fame)
    // ==========================================
    renderPlayerEnding() {
        const p = this.player;
        const hof = p.getHallOfFame();

        document.getElementById('ending-player-name').innerText = p.name;
        document.getElementById('ending-hof-tier').innerText = hof.title;
        document.getElementById('ending-hof-desc').innerText = hof.desc;

        document.getElementById('ending-total-apps').innerText = p.careerStats.apps;
        document.getElementById('ending-total-goals').innerText = p.careerStats.goals;
        document.getElementById('ending-total-assists').innerText = p.careerStats.assists;
        document.getElementById('ending-total-trophies').innerText = 
            p.careerStats.trophies.league + p.careerStats.trophies.ucl;
        document.getElementById('ending-ballon-count').innerText = p.careerStats.awards.ballon;
        document.getElementById('ending-total-wealth').innerText = `${(p.wealth / 100000000).toFixed(1)}억원`;

        const timelineEl = document.getElementById('ending-timeline-list');
        if (timelineEl) {
            timelineEl.innerHTML = p.history.map(h => `
                <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                        <span class="font-bold text-emerald-400">시즌 ${h.season} (${h.age}세)</span>
                        <span class="text-slate-300 ml-2">${h.clubName}</span>
                    </div>
                    <div class="text-slate-400">
                        ${h.apps}경기 ${h.goals}골 ${h.assists}도움 (평점 ${h.avgRating})
                        ${h.ballonRank === 1 ? '<span class="text-amber-400 font-bold ml-1">🏆발롱도르</span>' : ''}
                        ${h.wonLeague ? '<span class="text-blue-400 font-bold ml-1">🥇우승</span>' : ''}
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('btn-restart-game').onclick = () => {
            window.sound.playClick();
            this.resetSave();
        };
    }

    // ==========================================
    // Manager Mode UI
    // ==========================================
    updateManagerUI() {
        if (!this.manager) return;
        const m = this.manager;
        const club = getClubById(m.clubId);

        document.getElementById('mgr-header-name').innerText = `${m.name} 감독`;
        document.getElementById('mgr-header-club').innerText = club.name;
        document.getElementById('mgr-header-season').innerText = `시즌 ${m.season} (${m.age}세)`;
        document.getElementById('mgr-header-budget').innerText = `예산: ${(m.budget / 10000).toLocaleString()}만원`;

        document.getElementById('mgr-board-trust').innerText = `${m.boardTrust}%`;
        document.getElementById('mgr-tactics-rating').innerText = m.tacticsRating;
        document.getElementById('mgr-leadership').innerText = m.leadership;
        document.getElementById('mgr-trophies').innerText = m.managerStats.trophies.league + m.managerStats.trophies.ucl;

        const squadEl = document.getElementById('mgr-squad-list');
        if (squadEl) {
            squadEl.innerHTML = m.squad.map(p => `
                <div class="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                        <span class="px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300 mr-2">${p.pos}</span>
                        <span class="font-bold text-white">${p.name}</span>
                    </div>
                    <span class="font-extrabold text-emerald-400">OVR ${p.ovr}</span>
                </div>
            `).join('');
        }

        const marketEl = document.getElementById('mgr-market-list');
        if (marketEl) {
            marketEl.innerHTML = m.transferMarket.map(p => `
                <div class="p-2 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                        <span class="font-bold text-white">${p.name}</span>
                        <span class="text-slate-400 ml-1">OVR ${p.ovr} • ${(p.price/10000).toLocaleString()}만원</span>
                    </div>
                    <button class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold btn-mgr-buy" data-id="${p.id}">
                        영입
                    </button>
                </div>
            `).join('');

            marketEl.querySelectorAll('.btn-mgr-buy').forEach(b => {
                b.onclick = (e) => {
                    window.sound.playClick();
                    const res = m.buyPlayer(e.target.dataset.id);
                    this.showNotification(res.message, res.success ? 'success' : 'warning');
                    this.updateManagerUI();
                };
            });
        }

        const mHistoryEl = document.getElementById('mgr-history-feed');
        if (mHistoryEl) {
            mHistoryEl.innerHTML = [...m.history].reverse().map(h => `
                <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-indigo-400">시즌 ${h.season} (${h.age}세)</span>
                        <span class="text-slate-400 font-semibold">${h.clubName} • 리그 ${h.leagueRank}위 (${h.pts}점)</span>
                    </div>
                    <div class="text-white">
                        ${h.wins}승 ${h.draws}무 ${h.losses}패
                        ${h.wonLeague ? '<span class="text-amber-400 font-bold ml-1">🏆 리그 우승!</span>' : ''}
                        ${h.isCoachOfYear ? '<span class="text-teal-400 font-bold ml-1">🎖️ 올해의 감독상</span>' : ''}
                    </div>
                    <div class="text-[11px] text-slate-400">${h.boardEvaluation}</div>
                </div>
            `).join('');
        }
    }

    handleSimulateManagerYear() {
        window.sound.playWhistle(true);
        const record = this.manager.simulateManagerYear('tactics');

        if (record.wonLeague && window.sound) window.sound.playAward();
        else if (window.sound) window.sound.playGoal();

        this.showNotification(`시즌 ${record.season} 결산: 리그 ${record.leagueRank}위 (${record.wins}승 ${record.draws}무 ${record.losses}패) • ${record.wonLeague ? '🏆 우승 달성!' : '시즌 종료'}`, 'success');

        this.updateManagerUI();
        this.saveState();
    }

    showNotification(msg, type = 'info') {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;

        toast.innerText = msg;
        toast.className = `fixed bottom-6 right-6 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl z-50 transition-all duration-300 ${
            type === 'success' ? 'bg-emerald-600 text-white' :
            type === 'warning' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-100 border border-slate-700'
        }`;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3400);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
});
