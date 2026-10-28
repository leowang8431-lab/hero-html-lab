/* 英雄记忆配对：四组人物、洗牌、翻牌锁定、计时与本地最佳记录。 */
(() => {
  'use strict';

  const board = document.querySelector('#game-board');
  if (!board) return;

  const characters = [
    { id: 'rocket', name: '火箭浣熊', image: 'assets/images/rocket.png' },
    { id: 'spider', name: '蜘蛛侠', image: 'assets/images/spider.png' },
    { id: 'strange', name: '奇异博士', image: 'assets/images/strange.png' },
    { id: 'thanos', name: '灭霸', image: 'assets/images/thanos.png' }
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
    if (bestDisplay) bestDisplay.textContent = best ? `${best.moves} 步 · ${formatTime(best.seconds)}` : '等待你的首场挑战';
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
      card.setAttribute('aria-label', `第 ${index + 1} 张牌，未翻开`);
      card.setAttribute('aria-pressed', 'false');
      const back = document.createElement('span');
      back.className = 'game-card-back';
      back.setAttribute('aria-hidden', 'true');
      const symbol = document.createElement('span');
      symbol.className = 'game-card-symbol';
      symbol.textContent = '</>';
      const label = document.createElement('span');
      label.className = 'game-card-label';
      label.textContent = 'HERO LAB';
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
      startButton.textContent = '开始挑战';
    }
    drawBoard();
    updateStats();
    say('准备好了吗？点击“开始挑战”，找出四组相同的英雄。');
  }

  function start() {
    if (running) return;
    if (matched.size === characters.length) reset();
    running = true;
    startTime = performance.now();
    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = '挑战进行中';
    }
    intervalId = setInterval(() => {
      if (timeDisplay) timeDisplay.textContent = formatTime(elapsed());
    }, 250);
    say('翻开两张牌，记住英雄的位置。配对成功的卡片会保持亮起。');
  }

  function setFlipped(index, flipped) {
    const card = board.querySelector(`[data-index="${index}"]`);
    if (!card) return;
    card.classList.toggle('is-flipped', flipped);
    card.setAttribute('aria-pressed', String(flipped));
    card.setAttribute('aria-label', flipped ? `第 ${index + 1} 张牌，${deck[index].name}` : `第 ${index + 1} 张牌，未翻开`);
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
    say(`挑战完成！你用 ${moves} 步找到了全部四组英雄。`);
    if (resultTitle) resultTitle.textContent = newBest ? '新纪录，英雄集结！' : '挑战成功，英雄集结！';
    if (resultDescription) resultDescription.textContent = `你用 ${formatTime(seconds)}、${moves} 步完成了四组配对。${moves === 4 ? '四步全中，记忆力满分！' : '再来一局，试试用更少的步数完成。'}`;
    if (result) result.hidden = false;
    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = '再挑战一次';
    }
  }

  board.addEventListener('click', event => {
    const card = event.target.closest('.game-card');
    if (!card || !board.contains(card)) return;
    if (!running) {
      if (matched.size < characters.length) say('先点击“开始挑战”，计时后再翻开卡片。');
      return;
    }
    const index = Number(card.dataset.index);
    const character = deck[index];
    if (locked || selected.includes(index) || matched.has(character.id)) return;
    setFlipped(index, true);
    selected.push(index);
    if (selected.length < 2) {
      say(`已翻开${character.name}，再找出另一张。`);
      return;
    }
    moves += 1;
    const [first, second] = selected;
    if (deck[first].id === deck[second].id) {
      matched.add(character.id);
      selected.forEach(selectedIndex => {
        const matchedCard = board.querySelector(`[data-index="${selectedIndex}"]`);
        matchedCard.classList.add('is-matched');
        matchedCard.setAttribute('aria-label', `第 ${selectedIndex + 1} 张牌，${deck[selectedIndex].name}，配对成功`);
        matchedCard.setAttribute('aria-disabled', 'true');
      });
      selected = [];
      updateStats();
      if (matched.size === characters.length) complete();
      else say(`配对成功！已找到 ${matched.size} / ${characters.length} 组英雄。`);
      return;
    }
    locked = true;
    updateStats();
    say('这两张不一样，记住位置，再试一次。');
    flipTimeout = setTimeout(() => {
      setFlipped(first, false);
      setFlipped(second, false);
      selected = [];
      locked = false;
      say('继续翻牌，寻找下一组相同的英雄。');
    }, 800);
  });

  startButton?.addEventListener('click', start);
  restartButton?.addEventListener('click', () => {
    reset();
    start();
  });
  reset();
})();
