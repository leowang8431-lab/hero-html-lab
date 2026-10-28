/* 名言数据与交互。使用普通脚本，双击 HTML 也可运行。 */
(() => {
  'use strict';

  const quotes = [
    { id: 'q01', text: '学而时习之，不亦说乎？', author: '孔子', source: '《论语·学而》', category: 'learning' },
    { id: 'q02', text: '知之为知之，不知为不知，是知也。', author: '孔子', source: '《论语·为政》', category: 'learning' },
    { id: 'q03', text: '学而不思则罔，思而不学则殆。', author: '孔子', source: '《论语·为政》', category: 'learning' },
    { id: 'q04', text: '温故而知新，可以为师矣。', author: '孔子', source: '《论语·为政》', category: 'learning' },
    { id: 'q05', text: '三人行，必有我师焉。', author: '孔子', source: '《论语·述而》', category: 'learning' },
    { id: 'q06', text: '敏而好学，不耻下问。', author: '孔子', source: '《论语·公冶长》', category: 'learning' },
    { id: 'q07', text: '天行健，君子以自强不息。', author: '《周易》', source: '《乾·象传》', category: 'courage' },
    { id: 'q08', text: '士不可以不弘毅，任重而道远。', author: '曾子', source: '《论语·泰伯》', category: 'courage' },
    { id: 'q09', text: '不以物喜，不以己悲。', author: '范仲淹', source: '《岳阳楼记》', category: 'courage' },
    { id: 'q10', text: '千磨万击还坚劲，任尔东西南北风。', author: '郑燮', source: '《竹石》', category: 'courage' },
    { id: 'q11', text: '长风破浪会有时，直挂云帆济沧海。', author: '李白', source: '《行路难·其一》', category: 'courage' },
    { id: 'q12', text: '会当凌绝顶，一览众山小。', author: '杜甫', source: '《望岳》', category: 'courage' },
    { id: 'q13', text: '千里之行，始于足下。', author: '老子', source: '《道德经·第六十四章》', category: 'action' },
    { id: 'q14', text: '不积跬步，无以至千里；不积小流，无以成江海。', author: '荀子', source: '《劝学》', category: 'action' },
    { id: 'q15', text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游', source: '《冬夜读书示子聿》', category: 'action' },
    { id: 'q16', text: '吾尝终日而思矣，不如须臾之所学也。', author: '荀子', source: '《劝学》', category: 'action' },
    { id: 'q17', text: '工欲善其事，必先利其器。', author: '孔子', source: '《论语·卫灵公》', category: 'action' },
    { id: 'q18', text: '欲穷千里目，更上一层楼。', author: '王之涣', source: '《登鹳雀楼》', category: 'action' }
  ];
  const labels = { learning: '关于学习', courage: '关于勇气', action: '关于行动' };
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
      favorite.setAttribute('aria-label', `${favorites.has(quote.id) ? '取消收藏' : '收藏'}：${quote.text}`);
      favorite.title = favorites.has(quote.id) ? '取消收藏' : '收藏名言';
      bottom.append(attribution, favorite);
      card.append(top, element('blockquote', '', quote.text), bottom);
      fragment.append(card);
    }
    if (shown.length === 0) {
      const empty = element('div', 'empty-state');
      empty.append(
        element('h3', '', activeFilter === 'favorites' && !query ? '还没有收藏的名言' : '没有找到相关名言'),
        element('p', '', activeFilter === 'favorites' && !query ? '点击名言卡片右下角的星星，把喜欢的一句留下来。' : '试试其他关键词，或切换到“全部”看看。')
      );
      fragment.append(empty);
    }
    grid.replaceChildren(fragment);
    if (count) count.textContent = `显示 ${shown.length} / ${quotes.length} 条名言`;
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
      button.setAttribute('aria-label', `${wasFavorite ? '收藏' : '取消收藏'}：${quote.text}`);
      button.title = wasFavorite ? '收藏名言' : '取消收藏';
    }
    announce(wasFavorite ? '已取消收藏。' : '已收藏这句名言。');
  });
  document.querySelector('#random-quote')?.addEventListener('click', pickQuote);
  document.querySelector('#copy-quote')?.addEventListener('click', async () => {
    const quote = quotes[featuredIndex];
    if (!quote) return;
    const text = `${quote.text}\n——${quote.author} ${quote.source}`;
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      announce('名言已复制。');
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
      announce(copied ? '名言已复制。' : '请选中横幅中的名言文字后复制。');
    }
  });

  pickQuote();
  renderQuotes();
})();
