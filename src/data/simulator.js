function rand(arr) {
  const item = arr[Math.floor(Math.random() * arr.length)];
  return typeof item === 'object' ? item.name : item;
}

function prob(p) {
  return Math.random() < p;
}

function simulateMatch(home, away, format) {
  const events = [];
  let goalsH = 0, goalsA = 0;
  const stats = {
    home: { possession: 50, shots: 0, corners: 0, fouls: 0 },
    away: { possession: 50, shots: 0, corners: 0, fouls: 0 }
  };

  const ratingDiff = ((home.rating || 80) - (away.rating || 80)) / 100;

  function simulateMinutes(from, to) {
    for (let min = from; min <= to; min++) {
      const isHome = prob(0.5 + ratingDiff * 0.3);
      const team = isHome ? home : away;
      const opponent = isHome ? away : home;
      const side = isHome ? 'home' : 'away';

      if (prob(0.08)) {
        const extraShots = Math.floor(Math.random() * 3)
        stats[side].shots += 1 + extraShots
        if (prob(0.30 + ratingDiff * 0.1)) {
          isHome ? goalsH++ : goalsA++;
          const scorer = rand(team.players);
          events.push({
            minute: min,
            type: 'goal',
            team: team.id,
            player: scorer,
            description: `GOL! ${scorer} marca para ${team.name}!`,
            score: `${goalsH}-${goalsA}`
          });
        }
      }

      if (prob(0.055)) {
        stats[side].fouls++;
        const fouler = rand(team.players);
        if (prob(0.22)) {
          const isRed = prob(0.12);
          events.push({
            minute: min,
            type: isRed ? 'red_card' : 'yellow_card',
            team: team.id,
            player: fouler,
            description: `Cartão ${isRed ? 'vermelho' : 'amarelo'} para ${fouler} (${team.name})`
          });
        } else {
          events.push({
            minute: min,
            type: 'foul',
            team: team.id,
            player: fouler,
            description: `Falta de ${fouler} em ${rand(opponent.players)}`
          });
        }
      }

      if (prob(0.035)) {
        stats[side].corners++;
        events.push({
          minute: min,
          type: 'corner',
          team: team.id,
          description: `Escanteio para ${team.name}`
        });
      }

      stats.home.possession = Math.min(72, Math.max(28,
        stats.home.possession + (Math.random() - 0.5) * 4
      ));
      stats.away.possession = 100 - stats.home.possession;
    }
  }

  function simulatePenalties() {
    const penH = [], penA = [];
    let round = 1;

    while (true) {
      const hScored = prob(0.75);
      const aScored = prob(0.75);
      penH.push(hScored);
      penA.push(aScored);

      events.push({
        minute: 120 + round,
        type: hScored ? 'penalty_goal' : 'penalty_miss',
        team: home.id,
        description: hScored
          ? `✅ Pênalti convertido por ${rand(home.players)} (${home.name})`
          : `❌ Pênalti defendido — ${home.name}`
      });

      events.push({
        minute: 120 + round,
        type: aScored ? 'penalty_goal' : 'penalty_miss',
        team: away.id,
        description: aScored
          ? `✅ Pênalti convertido por ${rand(away.players)} (${away.name})`
          : `❌ Pênalti defendido — ${away.name}`
      });

      const ph = penH.filter(Boolean).length;
      const pa = penA.filter(Boolean).length;
      const remaining = 5 - round;

      if (round >= 5) {
        if (ph !== pa) {
          const winner = ph > pa ? home : away;
          events.push({
            minute: 121 + round,
            type: 'penalty_winner',
            team: winner.id,
            description: `🏆 ${winner.name} venceu nos pênaltis! (${ph}-${pa})`,
            penaltyScore: `${ph}-${pa}`
          });
          return { penH, penA, winner: winner.id };
        }
      } else {
        if (ph - pa > remaining) {
          events.push({ minute: 121 + round, type: 'penalty_winner', team: home.id,
            description: `🏆 ${home.name} venceu nos pênaltis! (${ph}-${pa})`, penaltyScore: `${ph}-${pa}` });
          return { penH, penA, winner: home.id };
        }
        if (pa - ph > remaining) {
          events.push({ minute: 121 + round, type: 'penalty_winner', team: away.id,
            description: `🏆 ${away.name} venceu nos pênaltis! (${pa}-${ph})`, penaltyScore: `${pa}-${ph}` });
          return { penH, penA, winner: away.id };
        }
      }
      round++;
    }
  }

  // ─── Execução ─────────────────────────────────────────────
  events.push({ minute: 1, type: 'kickoff', description: 'Apito inicial!' });
  simulateMinutes(1, 45);
  events.push({ minute: 45, type: 'halftime', description: 'Intervalo — fim do 1° tempo' });
  simulateMinutes(46, 90);

  let penalties = null;

  if (format === '120' && goalsH === goalsA) {
    events.push({ minute: 90, type: 'extratime', description: 'Empate! Seguimos para a prorrogação' });
    simulateMinutes(91, 105);
    events.push({ minute: 105, type: 'halftime_extra', description: 'Intervalo — fim do 1° tempo extra' });
    simulateMinutes(106, 120);

    if (goalsH === goalsA) {
      events.push({ minute: 120, type: 'penalties_start', description: 'Empate! Partida vai para os pênaltis!' });
      penalties = simulatePenalties();
    }
  }

  let resultDesc;
  if (penalties) {
    const winner = penalties.winner === home.id ? home.name : away.name;
    resultDesc = `Fim de jogo — ${winner} venceu nos pênaltis!`;
  } else {
    resultDesc = goalsH > goalsA
      ? `Fim de jogo — ${home.name} venceu!`
      : goalsA > goalsH
        ? `Fim de jogo — ${away.name} venceu!`
        : 'Fim de jogo — Empate!';
  }

  events.push({ minute: 999, type: 'fulltime', description: resultDesc });

  return {
    home: { id: home.id, name: home.name, short: home.short, logo: home.logo },
    away: { id: away.id, name: away.name, short: away.short, logo: away.logo },
    score: { home: goalsH, away: goalsA },
    format,
    penalties,
    stats: {
      home: { ...stats.home, possession: Math.round(stats.home.possession) },
      away: { ...stats.away, possession: Math.round(stats.away.possession) }
    },
    events
  };
}

module.exports = { simulateMatch };