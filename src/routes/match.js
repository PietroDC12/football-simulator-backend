const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { simulateMatch } = require('../data/simulator');

// ─── Lista todos os campeonatos ───────────────────────────
router.get('/competitions', async (req, res) => {
  try {
    const competitions = await prisma.competition.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { teams: true } } }
    });

    res.json(competitions.map(c => ({
      id: c.id,
      name: c.name,
      logo: c.logo,
      teamCount: c._count.teams
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar campeonatos' });
  }
});

// ─── Times de um campeonato ───────────────────────────────
router.get('/competitions/:id/teams', async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: { competitionId: req.params.id },
      orderBy: { name: 'asc' }
    });

    if (!teams.length)
      return res.status(404).json({ error: 'Nenhum time encontrado para este campeonato' });

    res.json(teams.map(t => ({
      id: t.id,
      name: t.name,
      short: t.short,
      logo: t.logo
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar times' });
  }
});

// ─── Simula uma partida ───────────────────────────────────
router.post('/match', async (req, res) => {
  try {
    const { homeTeamId, awayTeamId, format } = req.body;

    if (!homeTeamId || !awayTeamId)
      return res.status(400).json({ error: 'Informe homeTeamId e awayTeamId' });

    if (homeTeamId === awayTeamId)
      return res.status(400).json({ error: 'Os times precisam ser diferentes' });

    // Busca os dois times com jogadores
    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findUnique({
        where: { id: homeTeamId },
        include: { players: true }
      }),
      prisma.team.findUnique({
        where: { id: awayTeamId },
        include: { players: true }
      })
    ]);

    if (!homeTeam)
      return res.status(404).json({ error: 'Time da casa não encontrado' });
    if (!awayTeam)
      return res.status(404).json({ error: 'Time visitante não encontrado' });

    if (!homeTeam.players.length || !awayTeam.players.length)
      return res.status(400).json({ error: 'Um dos times não possui jogadores cadastrados' });

    const validFormat = ['90', '120'].includes(format) ? format : '90';
    const result = simulateMatch(homeTeam, awayTeam, validFormat);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao simular partida' });
  }
});

module.exports = router;