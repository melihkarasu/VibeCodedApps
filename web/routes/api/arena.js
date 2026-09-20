const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 2. Kültür Arenası (Trivia & 1v1 Düello) API Endpoints
// =============================================================
const arenaRooms = new Map();
const arenaLeaderboard = [
  { name: 'Melih Karasu', avatar: 'https://avatars.githubusercontent.com/u/144457496?v=4', level: 5, games: 18, xp: 2850 },
  { name: 'Kültür Kâşifi', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=explorer', level: 4, games: 14, xp: 2150 },
  { name: 'Tarih Bilgesi', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=historian', level: 3, games: 11, xp: 1720 },
  { name: 'Coğrafya Avcısı', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=geography', level: 3, games: 9, xp: 1480 },
  { name: 'Meraklı Gezgin', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=traveler', level: 2, games: 6, xp: 950 }
];

router.post('/arena/rooms', (req, res) => {
  const { category, difficulty, questions, creator } = req.body;
  const code = 'ARENA-' + Math.floor(1000 + Math.random() * 9000);
  const room = {
    code: code,
    category: category || 'all',
    difficulty: difficulty || 'medium',
    questions: questions || [],
    creator: {
      name: creator?.name || 'Melih Karasu',
      avatar: creator?.avatar || 'https://avatars.githubusercontent.com/u/144457496?v=4',
      score: undefined
    },
    opponent: null,
    status: 'waiting',
    createdAt: Date.now()
  };
  arenaRooms.set(code, room);
  res.json({ success: true, room: room });
});

router.get('/arena/rooms/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = arenaRooms.get(code);
  if (!room) return res.status(404).json({ success: false, error: 'Oda bulunamadı' });
  res.json({ success: true, room: room });
});

router.post('/arena/rooms/:code/submit', (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = arenaRooms.get(code);
  if (!room) return res.status(404).json({ success: false, error: 'Oda bulunamadı' });

  const { player } = req.body;
  if (!player) return res.status(400).json({ success: false, error: 'Oyuncu bilgisi eksik' });

  if (room.creator.name === player.name) {
    room.creator.score = player.score;
  } else {
    room.opponent = {
      name: player.name,
      avatar: player.avatar,
      score: player.score
    };
    room.status = 'completed';
  }

  res.json({ success: true, room: room });
});

router.get('/arena/leaderboard', (req, res) => {
  res.json(arenaLeaderboard);
});

module.exports = router;
