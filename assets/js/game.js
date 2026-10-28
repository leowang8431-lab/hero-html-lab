/* 英雄记忆配对：四组人物、洗牌、翻牌锁定、计时与本地最佳记录。 */
(() => {
  'use strict';

  const board = document.querySelector('#game-board');
  if (!board) return;

  const characters = [
    { id: 'rocket', name: 'Rocket', image: 'assets/images/rocket.png' },
    { id: 'spider', name: 'Spider-Man', image: 'assets/images/spider.png' },
    { id: 'strange', name: 'Doctor Strange', image: 'assets/images/strange.png' },
    { id: 'thanos', name: 'Thanos', image: 'assets/images/thanos.png' }
  ];
  const storageKey = 'hero-lab-memory-best-v1';
  const startButton = document.querySelector('#start-game');
  const restartButton = document.querySelector('#restart-game');
  const timeDisplay = document.querySelector('#game-time');
  const movesDisplay = document.querySelector('#game-moves');
  const pairsDisplay = document.querySelector('#game-pairs');
  const bestDisplay = document.querySelector('#game-best');
  const message = document.querySelector('#game-message');
  const result = document.querySelector('#game-result');
  const resultTitle = document.querySelector('#result-title');
  const resultDescription = document.querySelector('#result-description');
  let deck = [];
  let selected = [];
  let matched = new Set();
  let moves = 0;
  let running = false;
  let locked = false;
  let startTime = 0;
  let intervalId;
  let flipTimeout;
  let best = null;

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && Number.isInteger(saved.moves) && saved.moves >= 4 && Number.isFinite(saved.seconds) && saved.seconds >= 0) best = saved;
  } catch (_) { /* 无存储权限时仍可正常游戏 */ }

  function say(text) {
    if (message) message.textContent = text;
  }

  function elapsed() {
    return running ? Math.floor((performance.now() - startTime) / 1000) : 0;
  }

  function formatTime(seconds) {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function updateStats() {
    if (movesDisplay) movesDisplay.textContent = String(moves);
    if (pairsDisplay) pairsDisplay.textContent = String(matched.size);
    if (bestDisplay) bestDisplay.textContent = best ? `${best.moves} moves · ${formatTime(best.seconds)}` : 'Complete a game to set your first record';
  }

  function shuffledDeck() {
    const cards = characters.flatMap(character => [
      { ...character, key: `${character.id}-a` },
      { ...character, key: `${character.id}-b` }
    ]);
    // Fisher–Yates 洗牌，让每一局都有新的排列。
    for (let index = cards.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [cards[index], cards[swapIndex]] = [cards[swapIndex], cards[index]];
    }
    return cards;
  }

  function drawBoard() {
    const fragment = document.createDocumentFragment();
    deck.forEach((character, index) => {
      const card = document.createElement('button');
      card.className = 'game-card';
      card.type = 'button';
      card.dataset.index = String(index);
      card.setAttribute('aria-label', `Card ${index + 1}, face down`);
      card.setAttribute('aria-pressed', 'false');
      const back = document.createElement('span');
      back.className = 'game-card-back';
      back.setAttribute('aria-hidden', 'true');
      const symbol = document.createElement('span');
      symbol.className = 'game-card-symbol';
      symbol.textContent = '</>';
      const label = document.createElement('span');
      label.className = 'game-card-label';
      label.textContent = 'HERO HOME';
      back.append(symbol, label);
      const front = document.createElement('span');
      front.className = 'game-card-front';
      front.setAttribute('aria-hidden', 'true');
      const image = document.createElement('img');
      image.src = character.image;
      image.alt = '';
      image.draggable = false;
      const name = document.createElement('span');
      name.textContent = character.name;
      front.append(image, name);
      card.append(back, front);
      fragment.append(card);
    });
    board.replaceChildren(fragment);
  }

  function reset() {
    clearInterval(intervalId);
    clearTimeout(flipTimeout);
    selected = [];
    matched = new Set();
    moves = 0;
    running = false;
    locked = false;
    deck = shuffledDeck();
    if (timeDisplay) timeDisplay.textContent = '00:00';
    if (result) result.hidden = true;
    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = 'Start game';
    }
    drawBoard();
    updateStats();
    say('Ready? Select Start game and find all four matching pairs.');
  }

  function start() {
    if (running) return;
    if (matched.size === characters.length) reset();
    running = true;
    startTime = performance.now();
    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = 'Game in progress';
    }
    intervalId = setInterval(() => {
      if (timeDisplay) timeDisplay.textContent = formatTime(elapsed());
    }, 250);
    say('Turn over two cards and remember their positions. Matching pairs stay face up.');
  }

  function setFlipped(index, flipped) {
    const card = board.querySelector(`[data-index="${index}"]`);
    if (!card) return;
    card.classList.toggle('is-flipped', flipped);
    card.setAttribute('aria-pressed', String(flipped));
    card.setAttribute('aria-label', flipped ? `Card ${index + 1}, ${deck[index].name}` : `Card ${index + 1}, face down`);
  }

  function complete() {
    const seconds = elapsed();
    running = false;
    clearInterval(intervalId);
    if (timeDisplay) timeDisplay.textContent = formatTime(seconds);
    const newBest = !best || moves < best.moves || (moves === best.moves && seconds < best.seconds);
    if (newBest) {
      best = { moves, seconds };
      try { localStorage.setItem(storageKey, JSON.stringify(best)); } catch (_) { /* 会话内保留 */ }
    }
    updateStats();
    say(`Game complete! You found all four pairs in ${moves} moves.`);
    if (resultTitle) resultTitle.textContent = newBest ? 'New personal best!' : 'All heroes matched!';
    if (resultDescription) resultDescription.textContent = `You matched all four pairs in ${formatTime(seconds)} and ${moves} moves. ${moves === 4 ? 'A perfect four-move game!' : 'Play again and try to finish in fewer moves.'}`;
    if (result) result.hidden = false;
    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = 'Play again';
    }
  }

  board.addEventListener('click', event => {
    const card = event.target.closest('.game-card');
    if (!card || !board.contains(card)) return;
    if (!running) {
      if (matched.size < characters.length) say('Select Start game before turning over a card.');
      return;
    }
    const index = Number(card.dataset.index);
    const character = deck[index];
    if (locked || selected.includes(index) || matched.has(character.id)) return;
    setFlipped(index, true);
    selected.push(index);
    if (selected.length < 2) {
      say(`You found ${character.name}. Find the other matching card.`);
      return;
    }
    moves += 1;
    const [first, second] = selected;
    if (deck[first].id === deck[second].id) {
      matched.add(character.id);
      selected.forEach(selectedIndex => {
        const matchedCard = board.querySelector(`[data-index="${selectedIndex}"]`);
        matchedCard.classList.add('is-matched');
        matchedCard.setAttribute('aria-label', `Card ${selectedIndex + 1}, ${deck[selectedIndex].name}, matched`);
        matchedCard.setAttribute('aria-disabled', 'true');
      });
      selected = [];
      updateStats();
      if (matched.size === characters.length) complete();
      else say(`A match! You have found ${matched.size} / ${characters.length} pairs.`);
      return;
    }
    locked = true;
    updateStats();
    say('These cards do not match. Remember their positions and try again.');
    flipTimeout = setTimeout(() => {
      setFlipped(first, false);
      setFlipped(second, false);
      selected = [];
      locked = false;
      say('Keep going! Find the next matching pair.');
    }, 800);
  });

  startButton?.addEventListener('click', start);
  restartButton?.addEventListener('click', () => {
    reset();
    start();
  });
  reset();
})();
