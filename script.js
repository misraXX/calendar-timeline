async function render() {
  const res = await fetch('https://script.google.com/macros/s/AKfycbySEee02uqMKRC0sfKjmFkTZCTPSd6J2snnCTJceBnvCTvENgtG5kHkmeqlBLOWePc/exec');
  const events = await res.json();

  const output = document.getElementById('output');
  const liveNow = document.getElementById('liveNow');

  const startBase = new Date();
  startBase.setDate(startBase.getDate() - 1);
  startBase.setHours(0, 0, 0, 0);
  const endLimit = new Date(startBase.getTime() + 48 * 60 * 60 * 1000);

  const filtered = events.filter(e => new Date(e.start) >= startBase && new Date(e.start) < endLimit);

  // 🔴 LIVE中カード（上部）
  filtered.filter(e => !e.end).forEach(e => {
    const card = createCard(e, true);
    card.style.height = '100px';
    card.style.position = 'relative';
    liveNow.appendChild(card);
  });

  // 📅 タイムライン
  const timeline = document.createElement('div');
  timeline.className = 'timeline';

  const timeLabels = document.createElement('div');
  timeLabels.className = 'time-labels';

  for (let h = 0; h <= 48; h++) {
    const time = new Date(startBase.getTime() + h * 60 * 60 * 1000);
    const hour = time.getHours().toString().padStart(2, '0');
    const label = document.createElement('div');
    label.className = 'time-label';
    label.textContent = hour === '00' ? `${time.getMonth() + 1}/${time.getDate()}` : `${hour}:00`;
    timeLabels.appendChild(label);
  }

  const cardsArea = document.createElement('div');
  cardsArea.className = 'cards-area';

  const slots = [];
  const sorted = [...filtered].sort((a, b) => new Date(a.start) - new Date(b.start));

  for (const e of sorted) {
    const start = new Date(new Date(e.start).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    const end = e.end
      ? new Date(new Date(e.end).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }))
      : new Date();
  
    const top = Math.floor((start - startBase) / 60000);
    const height = Math.max(100, Math.floor((end - start) / 60000));
  
    let slot = 0;
    while (slots[slot] && new Date(slots[slot]) > start) slot++;
    slots[slot] = end;
  
    const card = createCard(e);
    card.style.top = `${top}px`;
    card.style.left = `${slot * 200}px`;
    card.style.height = `${height}px`;
    cardsArea.appendChild(card);

function createCard(e, isLiveNow = false) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.backgroundColor = e.color || '#fff';

  const iconArea = document.createElement('div');
  iconArea.className = 'card-icon-area';

  const icon = document.createElement('img');
  icon.src = e.icon;
  icon.alt = 'icon';
  icon.className = 'icon';

  const siteLink = document.createElement('a');
  siteLink.href = e.url;
  siteLink.target = '_blank';
  siteLink.className = 'site-icon-link';

  const siteIcon = document.createElement('img');
  siteIcon.src = e.site === 'Twitch'
    ? 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png'
    : 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32';
  siteLink.appendChild(siteIcon);

  iconArea.appendChild(icon);
  iconArea.appendChild(siteLink);

  const content = document.createElement('div');
  content.className = 'card-content';

  if (!e.end) {
    const liveLabel = document.createElement('div');
    liveLabel.className = 'live-label';
    liveLabel.textContent = 'LIVE中';
    content.appendChild(liveLabel);
  }

  const name = document.createElement('div');
  name.className = 'card-name';
  name.textContent = e.name;

  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = e.title;

  content.appendChild(name);
  content.appendChild(title);

  card.appendChild(iconArea);
  card.appendChild(content);
  return card;
}

render();
