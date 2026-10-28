/* 名言数据与交互。使用普通脚本，双击 HTML 也可运行。 */
(() => {
  'use strict';

  const quotes = [
    { id: 'q01', text: 'Is it not a pleasure to learn and practice what you have learned?', author: 'Confucius', source: 'The Analects, 1.1', category: 'learning' },
    { id: 'q02', text: 'To know what you know and admit what you do not know: that is understanding.', author: 'Confucius', source: 'The Analects, 2.17', category: 'learning' },
    { id: 'q03', text: 'Learning without thinking leaves you confused; thinking without learning puts you at risk.', author: 'Confucius', source: 'The Analects, 2.15', category: 'learning' },
    { id: 'q04', text: 'Review what you have learned and gain new insight, and you can become a teacher.', author: 'Confucius', source: 'The Analects, 2.11', category: 'learning' },
    { id: 'q05', text: 'When three of us walk together, at least one can be my teacher.', author: 'Confucius', source: 'The Analects, 7.22', category: 'learning' },
    { id: 'q06', text: 'Be diligent and eager to learn, and unashamed to ask those below you.', author: 'Confucius', source: 'The Analects, 5.15', category: 'learning' },
    { id: 'q07', text: 'As heaven moves with vigor, a noble person strives without ceasing.', author: 'The Book of Changes', source: 'Qian: Commentary on the Images', category: 'courage' },
    { id: 'q08', text: 'A scholar must be broad-minded and resolute, for the burden is heavy and the road is long.', author: 'Zengzi', source: 'The Analects, 8.7', category: 'courage' },
    { id: 'q09', text: 'Do not rejoice because of outward things, or grieve because of your own circumstances.', author: 'Fan Zhongyan', source: 'A Record of Yueyang Tower', category: 'courage' },
    { id: 'q10', text: 'Through a thousand trials and ten thousand blows, I stand firm, whatever winds may come.', author: 'Zheng Xie', source: 'Bamboo and Rock', category: 'courage' },
    { id: 'q11', text: 'The day will come to ride the wind and cleave the waves; I will raise my sail and cross the vast sea.', author: 'Li Bai', source: 'The Hard Road, No. 1', category: 'courage' },
    { id: 'q12', text: 'One day I shall reach the summit and see all the other mountains small below.', author: 'Du Fu', source: 'Gazing at Mount Tai', category: 'courage' },
    { id: 'q13', text: 'A journey of a thousand li begins with a single step.', author: 'Laozi', source: 'Dao De Jing, Chapter 64', category: 'action' },
    { id: 'q14', text: 'Without gathering small steps, you cannot travel a thousand li; without gathering small streams, there can be no rivers or seas.', author: 'Xunzi', source: 'Encouraging Learning', category: 'action' },
    { id: 'q15', text: 'What you learn from books is still shallow; to understand it fully, you must put it into practice.', author: 'Lu You', source: 'Reading on a Winter Night: To My Son Ziyu', category: 'action' },
    { id: 'q16', text: 'I once spent all day thinking; it was less useful than a brief moment of learning.', author: 'Xunzi', source: 'Encouraging Learning', category: 'action' },
    { id: 'q17', text: 'To do good work, a craftsman must first sharpen his tools.', author: 'Confucius', source: 'The Analects, 15.10', category: 'action' },
    { id: 'q18', text: 'To see a thousand li into the distance, climb one floor higher.', author: 'Wang Zhihuan', source: 'Climbing Stork Tower', category: 'action' }
  ];
  const labels = { learning: 'Learning', courage: 'Courage', action: 'Action' };
  const storageKey = 'hero-lab-favorite-quotes-v1';
  const grid = document.querySelector('#quotes-grid');
  const featuredText = document.querySelector('#featured-quote');
  const featuredAuthor = document.querySelector('#featured-author');
  const search = document.querySelector('#quote-search');
  const count = document.querySelector('#quote-count');
  const feedback = document.querySelector('#quote-feedback');
  const filterButtons = document.querySelectorAll('[data-quote-filter]');
  let activeFilter = 'all';
  let featuredIndex = -1;
  let feedbackTimer;
  let favorites = new Set();

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(stored)) {
      favorites = new Set(stored.filter(id => quotes.some(quote => quote.id === id)));
    }
  } catch (_) {
    // 浏览器禁止本地存储时，本次会话仍能收藏。
  }

  function announce(message) {
    if (!feedback) return;
    clearTimeout(feedbackTimer);
    feedback.textContent = message;
    feedbackTimer = setTimeout(() => { feedback.textContent = ''; }, 3500);
  }

  function pickQuote() {
    // 从其他 17 条中选择，避免连续点击时展示相同内容。
    const next = featuredIndex < 0
      ? Math.floor(Math.random() * quotes.length)
      : (featuredIndex + 1 + Math.floor(Math.random() * (quotes.length - 1))) % quotes.length;
    featuredIndex = next;
    const quote = quotes[next];
    if (featuredText) featuredText.textContent = quote.text;
    if (featuredAuthor) featuredAuthor.textContent = `${quote.author} · ${quote.source}`;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderQuotes() {
    if (!grid) return;
    const query = (search ? search.value : '').trim().toLocaleLowerCase();
    const shown = quotes.filter(quote => {
      const matchesFilter = activeFilter === 'all'
        || (activeFilter === 'favorites' ? favorites.has(quote.id) : quote.category === activeFilter);
      const matchesQuery = `${quote.text} ${quote.author} ${quote.source}`.toLocaleLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
    const fragment = document.createDocumentFragment();
    for (const quote of shown) {
      const card = element('article', 'quote-card');
      card.dataset.category = quote.category;
      const top = element('div', 'quote-card-top');
      top.append(
        element('span', 'quote-index', String(quotes.indexOf(quote) + 1).padStart(2, '0')),
        element('span', 'quote-category', labels[quote.category])
      );
      const bottom = element('div', 'quote-card-bottom');
      const attribution = element('div', 'quote-attribution');
      attribution.append(
        element('p', 'quote-author', quote.author),
        element('p', 'quote-source', quote.source)
      );
      const favorite = element('button', 'favorite-button', favorites.has(quote.id) ? '★' : '☆');
      favorite.type = 'button';
      favorite.dataset.id = quote.id;
      favorite.setAttribute('aria-pressed', String(favorites.has(quote.id)));
      favorite.setAttribute('aria-label', `${favorites.has(quote.id) ? 'Remove favorite' : 'Save favorite'}: ${quote.text}`);
      favorite.title = favorites.has(quote.id) ? 'Remove favorite' : 'Save quote';
      bottom.append(attribution, favorite);
      card.append(top, element('blockquote', '', quote.text), bottom);
      fragment.append(card);
    }
    if (shown.length === 0) {
      const empty = element('div', 'empty-state');
      empty.append(
        element('h3', '', activeFilter === 'favorites' && !query ? 'No favorites yet' : 'No quotes found'),
        element('p', '', activeFilter === 'favorites' && !query ? 'Select the star on a quote to save it here.' : 'Try another keyword or select All to browse the full collection.')
      );
      fragment.append(empty);
    }
    grid.replaceChildren(fragment);
    if (count) count.textContent = `Showing ${shown.length} / ${quotes.length} quotes`;
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.quoteFilter;
      filterButtons.forEach(item => {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      renderQuotes();
    });
  });
  if (search) search.addEventListener('input', renderQuotes);
  if (grid) grid.addEventListener('click', event => {
    const button = event.target.closest('.favorite-button');
    if (!button || !grid.contains(button)) return;
    const id = button.dataset.id;
    const wasFavorite = favorites.has(id);
    if (wasFavorite) favorites.delete(id);
    else favorites.add(id);
    try { localStorage.setItem(storageKey, JSON.stringify([...favorites])); } catch (_) { /* 会话内保留 */ }
    if (activeFilter === 'favorites' && wasFavorite) {
      renderQuotes();
      const nextButton = grid.querySelector('.favorite-button');
      if (nextButton) nextButton.focus();
      else document.querySelector('[data-quote-filter="favorites"]')?.focus();
    } else {
      button.textContent = wasFavorite ? '☆' : '★';
      button.setAttribute('aria-pressed', String(!wasFavorite));
      const quote = quotes.find(item => item.id === id);
      button.setAttribute('aria-label', `${wasFavorite ? 'Save favorite' : 'Remove favorite'}: ${quote.text}`);
      button.title = wasFavorite ? 'Save quote' : 'Remove favorite';
    }
    announce(wasFavorite ? 'Quote removed from favorites.' : 'Quote saved to favorites.');
  });
  document.querySelector('#random-quote')?.addEventListener('click', pickQuote);
  document.querySelector('#copy-quote')?.addEventListener('click', async () => {
    const quote = quotes[featuredIndex];
    if (!quote) return;
    const text = `${quote.text}\n——${quote.author} ${quote.source}`;
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      announce('Quote copied.');
    } catch (_) {
      // file:// 或旧浏览器使用选择并复制的兼容路径。
      const field = element('textarea', 'copy-fallback');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.append(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { /* 展示手动复制提示 */ }
      field.remove();
      document.querySelector('#copy-quote')?.focus();
      announce(copied ? 'Quote copied.' : 'Please select the featured quote text and copy it manually.');
    }
  });

  pickQuote();
  renderQuotes();
})();
