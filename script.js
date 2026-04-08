/* ========================================
   SECRET QR MESSENGER — script.js
======================================== */

// ─── STATE ───
let templates = [];
let headings = [];
let selectedTemplate = null;
let selectedHeading = null;
let selectedPosterTheme = 'romantic';
let generatedLink = '';
let qrGenerated = false;

// ─── DOM REFS ───
const mainPage   = document.getElementById('main-page');
const chatPage   = document.getElementById('chat-page');
const chatBody   = document.getElementById('chat-body');
const chatInput  = document.getElementById('chat-input');
const chatSend   = document.getElementById('chat-send');
const templateGrid = document.getElementById('template-grid');
const trendingGrid = document.getElementById('trending-grid');
const categoryTabs = document.getElementById('category-tabs');

// ─── MODALS ───
const createModal   = document.getElementById('create-modal');
const previewModal  = document.getElementById('preview-modal');
const qrModal       = document.getElementById('qr-modal');

// ─── INIT ───
async function init() {
  await loadData();
  checkForMessageInURL();
  setupScrollObserver();
  renderTrending();
  renderCategoryTabs();
  renderTemplates();
}

async function loadData() {
  try {
    const [tRes, hRes] = await Promise.all([
      fetch('templates.json'),
      fetch('headings.json')
    ]);
    templates = await tRes.json();
    headings  = await hRes.json();
  } catch(e) {
    console.warn('Could not load JSON, using fallback.');
    templates = FALLBACK_TEMPLATES;
    headings  = FALLBACK_HEADINGS;
  }
}

// ─── FALLBACK DATA ───
const FALLBACK_TEMPLATES = [
  {id:1,category:"Birthday",title:"Secret Birthday Wish",tooltip:"Someone sent you a birthday surprise 🎂",messages:["Hey!! 🎉","Someone special asked me to deliver this...","You deserve the most magical birthday ever.","Smile 😊","Happy Birthday, superstar! 🎂"]},
  {id:2,category:"Love",title:"Someone Loves You",tooltip:"Someone secretly loves you ❤️",messages:["Hey 👀","Someone around you asked me to tell you something...","They have been thinking about you — a lot.","And yes... they love you ❤️"]},
  {id:3,category:"Encouragement",title:"Keep Going",tooltip:"Someone is cheering you on 💪",messages:["Hey, I know it's been tough.","Someone sees you fighting every day.","Don't give up.","You've got this 💪"]}
];
const FALLBACK_HEADINGS = [
  {id:1,text:"I saw a name in my contact list inside this QR code 👀 Unlock the message with your name.",emoji:"👀"},
  {id:2,text:"Someone in my contacts needs to see this message. Is it you?",emoji:"🤫"},
  {id:3,text:"A secret message is hidden inside this QR code. Only the right person can unlock it.",emoji:"🔐"}
];

// ─── TRENDING ───
const trendingData = [
  {icon:"👀",title:"Someone Secretly Likes You",desc:"This is going viral right now",badge:"🔥 HOT"},
  {icon:"😏",title:"Your Crush Sent This",desc:"Opens with a dramatic reveal",badge:"TRENDING"},
  {icon:"❤️",title:"Someone Noticed Your Smile",desc:"A sweet appreciation message",badge:"NEW"},
  {icon:"🎂",title:"Happy Birthday Secret",desc:"The most shared birthday message",badge:"🔥 HOT"},
  {icon:"🤫",title:"Anonymous Confession",desc:"Anonymous. Mysterious. Viral.",badge:"TRENDING"},
  {icon:"🌹",title:"Midnight Love Note",desc:"Romantic reveal at its finest",badge:"NEW"},
];

function renderTrending() {
  if (!trendingGrid) return;
  trendingGrid.innerHTML = trendingData.map(t => `
    <div class="trending-card" onclick="openCreateModal()">
      <div class="trending-badge">${t.badge}</div>
      <div class="trending-icon">${t.icon}</div>
      <h3>${t.title}</h3>
      <p>${t.desc}</p>
    </div>
  `).join('');
}

// ─── CATEGORY TABS ───
function renderCategoryTabs() {
  if (!categoryTabs) return;
  const cats = ['All', ...new Set(templates.map(t => t.category))];
  categoryTabs.innerHTML = cats.map((c, i) =>
    `<button class="tab-btn${i===0?' active':''}" onclick="filterCategory('${c}', this)">${c}</button>`
  ).join('');
}

function filterCategory(cat, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.template-card').forEach(card => {
    card.style.display = (cat === 'All' || card.dataset.category === cat) ? 'block' : 'none';
  });
}

// ─── TEMPLATE GRID ───
function renderTemplates() {
  if (!templateGrid) return;
  templateGrid.innerHTML = templates.map(t => `
    <div class="template-card fade-up" data-category="${t.category}" data-id="${t.id}">
      <div class="template-card-cat">${t.category}</div>
      <h3>${t.title}</h3>
      <p class="template-card-tip">${t.tooltip}</p>
      <div class="template-card-actions">
        <button class="btn-sm btn-preview" onclick="openPreview(${t.id})">👁 Preview</button>
        <button class="btn-sm btn-qr" onclick="openQRFlow(${t.id})">🔗 Create QR</button>
      </div>
    </div>
  `).join('');
}

// ─── PREVIEW MODAL ───
function openPreview(id) {
  const t = templates.find(t => t.id === id);
  if (!t) return;
  selectedTemplate = t;
  document.getElementById('preview-title').textContent = t.title;
  document.getElementById('preview-messages').innerHTML = t.messages.map(m =>
    `<div class="chat-bubble" style="animation-delay:0s">${m}</div>`
  ).join('');
  openModal('preview-modal');
}

// ─── CREATE / QR FLOW ───
function openCreateModal(id) {
  // Populate template dropdown
  const sel = document.getElementById('create-template-select');
  if (sel && templates.length) {
    sel.innerHTML = templates.map(t =>
      `<option value="${t.id}">${t.category} — ${t.title}</option>`
    ).join('');
    if (id) sel.value = id;
  }
  // Populate heading options
  renderHeadingOptions();
  openModal('create-modal');
}

function openQRFlow(id) {
  openCreateModal(id);
}

function renderHeadingOptions() {
  const container = document.getElementById('heading-options');
  if (!container) return;
  const list = headings.length ? headings : FALLBACK_HEADINGS;
  container.innerHTML = list.map(h => `
    <button class="heading-opt" data-id="${h.id}" onclick="selectHeading(${h.id}, this)">
      ${h.emoji} ${h.text}
    </button>
  `).join('');
  // Auto-select first
  const first = container.querySelector('.heading-opt');
  if (first) { first.classList.add('selected'); selectedHeading = list[0]; }
}

function selectHeading(id, btn) {
  document.querySelectorAll('.heading-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedHeading = (headings.length ? headings : FALLBACK_HEADINGS).find(h => h.id === id);
}

function generateLink() {
  const templateId = document.getElementById('create-template-select').value;
  const recipientName = document.getElementById('recipient-name').value.trim();
  const senderName = document.getElementById('sender-name').value.trim();

  if (!templateId) { alert('Please select a message template.'); return; }

  const params = new URLSearchParams({
    t: templateId,
    r: recipientName || '',
    s: senderName || '',
    h: selectedHeading ? selectedHeading.id : 1
  });

  const baseURL = window.location.origin + window.location.pathname;
  generatedLink = `${baseURL}?${params.toString()}`;

  // Track QR generation
  if (typeof gtag !== 'undefined') {
    gtag('event', 'generate_qr', { template_id: templateId });
  }

  // Move to QR step
  document.getElementById('create-modal-step1').classList.add('hidden');
  document.getElementById('create-modal-step2').classList.remove('hidden');
  generateQRCode(generatedLink);
  renderPosterPreview();
}

// ─── QR CODE ───
function generateQRCode(url) {
  const container = document.getElementById('qrcode');
  container.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(container, {
      text: url,
      width: 200,
      height: 200,
      colorDark: '#e63e6d',
      colorLight: '#0a0a0f',
      correctLevel: QRCode.CorrectLevel.H
    });
  } else {
    container.innerHTML = `<p style="color:var(--text2);font-size:.85rem">QR library loading...</p>`;
  }
  qrGenerated = true;

  // Show link
  const linkBox = document.getElementById('generated-link');
  if (linkBox) linkBox.value = generatedLink;

  // Render share buttons
  renderShareButtons();
}

// ─── POSTER ───
const posterThemes = {
  romantic: { emoji:'❤️', bg:'#1a0010', accent:'#e63e6d', label:'Romantic' },
  birthday: { emoji:'🎂', bg:'#0a0a1a', accent:'#f5c842', label:'Birthday' },
  funny:    { emoji:'😂', bg:'#001a10', accent:'#4dff91', label:'Funny' },
  wedding:  { emoji:'💍', bg:'#0a0010', accent:'#c9b8ff', label:'Wedding' },
  christmas:{ emoji:'🎄', bg:'#001500', accent:'#ff4444', label:'Christmas' },
};

function selectPosterTheme(theme, btn) {
  document.querySelectorAll('.poster-theme-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedPosterTheme = theme;
  renderPosterPreview();
}

function renderPosterPreview() {
  const canvas = document.getElementById('poster-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 540; canvas.height = 540; // display size (1080x1080 @ 2x)

  const theme = posterThemes[selectedPosterTheme] || posterThemes.romantic;
  const tmpl  = templates.find(t => t.id == document.getElementById('create-template-select').value) || templates[0];

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, 540, 540);

  // Gradient overlay
  const grad = ctx.createRadialGradient(270, 270, 0, 270, 270, 300);
  grad.addColorStop(0, theme.accent + '33');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 540, 540);

  // Border
  ctx.strokeStyle = theme.accent + '66';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 500, 500);

  // Top emoji + title
  ctx.font = '48px serif';
  ctx.textAlign = 'center';
  ctx.fillText(theme.emoji, 270, 90);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px serif';
  ctx.fillText(tmpl ? tmpl.title : 'Secret Message', 270, 140);

  // QR placeholder area (white box)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(170, 170, 200, 200, 12);
  ctx.fill();

  // Draw QR into poster
  const qrCanvas = document.querySelector('#qrcode canvas');
  if (qrCanvas) {
    ctx.drawImage(qrCanvas, 175, 175, 190, 190);
  } else {
    ctx.fillStyle = theme.accent;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QR CODE', 270, 275);
  }

  // CTA text
  ctx.fillStyle = '#ffffffcc';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Scan to reveal a secret message', 270, 410);

  // Heading text (truncated)
  const heading = selectedHeading ? selectedHeading.text : 'Someone left you a message 👀';
  ctx.fillStyle = theme.accent;
  ctx.font = '13px sans-serif';
  ctx.fillText(truncate(heading, 55), 270, 440);

  // Branding
  ctx.fillStyle = '#ffffff55';
  ctx.font = '12px sans-serif';
  ctx.fillText('SecretQR.app', 270, 510);
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n-1) + '…' : str;
}

function downloadPoster() {
  renderPosterPreview();
  setTimeout(() => {
    const canvas = document.getElementById('poster-canvas');
    const link = document.createElement('a');
    link.download = 'secret-qr-poster.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, 100);
}

// ─── SHARE BUTTONS ───
function renderShareButtons() {
  const container = document.getElementById('share-buttons');
  if (!container || !generatedLink) return;
  const heading = selectedHeading ? selectedHeading.text : 'I left a secret message for you 👀';
  const encoded = encodeURIComponent(heading + '\n' + generatedLink);
  const linkEnc = encodeURIComponent(generatedLink);

  container.innerHTML = `
    <button class="share-btn share-wa" onclick="window.open('https://wa.me/?text=${encoded}','_blank')">
      📲 WhatsApp
    </button>
    <button class="share-btn share-fb" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${linkEnc}','_blank')">
      👍 Facebook
    </button>
    <button class="share-btn share-tg" onclick="window.open('https://t.me/share/url?url=${linkEnc}&text=${encodeURIComponent(heading)}','_blank')">
      ✈️ Telegram
    </button>
    <button class="share-btn share-tw" onclick="window.open('https://twitter.com/intent/tweet?text=${encoded}','_blank')">
      🐦 Twitter / X
    </button>
    <button class="share-btn share-copy" onclick="copyLink()">
      🔗 Copy Link
    </button>
  `;
}

function copyLink() {
  navigator.clipboard.writeText(generatedLink).then(() => {
    const btn = document.querySelector('.share-copy');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '🔗 Copy Link', 2000); }
  });
}

// ─── MODAL HELPERS ───
function openModal(id) {
  const overlay = document.getElementById(id + '-overlay') || document.getElementById(id);
  if (overlay) overlay.classList.add('open');
}
function closeModal(id) {
  const overlay = document.getElementById(id + '-overlay') || document.getElementById(id);
  if (overlay) overlay.classList.remove('open');
  // Reset create modal steps
  if (id.includes('create')) {
    document.getElementById('create-modal-step1')?.classList.remove('hidden');
    document.getElementById('create-modal-step2')?.classList.add('hidden');
  }
}

// ─── URL CHECK — REVEAL MODE ───
function checkForMessageInURL() {
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get('t');
  if (!templateId) return;

  // Hide main page, show chat
  mainPage.style.display = 'none';
  chatPage.classList.add('active');

  const recipientName = params.get('r') || '';
  const senderName    = params.get('s') || '';
  const headingId     = parseInt(params.get('h')) || 1;

  // Track message view
  if (typeof gtag !== 'undefined') {
    gtag('event', 'message_view', { template_id: templateId });
  }

  startReveal(templateId, recipientName, senderName, headingId);
}

// ─── CHAT REVEAL ───
let chatState = 'intro'; // intro | awaiting_name | revealed | guess_who
let revealTemplate = null;
let revealRecipient = '';
let guessWhoMode = false;

async function startReveal(templateId, recipientName, senderName, headingId) {
  revealTemplate = templates.find(t => t.id == templateId);
  if (!revealTemplate && templates.length === 0) {
    await loadData();
    revealTemplate = templates.find(t => t.id == templateId);
  }
  revealRecipient = recipientName.toLowerCase().trim();
  guessWhoMode = revealTemplate && ['Flirts','Secret Admirer','Love','Romantic'].includes(revealTemplate.category);

  // Dramatic intro sequence
  await addBubble("👀 Someone left you a secret message...", 600);
  await addBubble("Checking if the message is for you...", 1800);
  await addBubble("Analyzing... 🔍", 2800);
  await addBubble("Verifying receiver identity...", 3800);
  await addBubble("Almost there...", 4600);
  if (recipientName) {
    await addBubble(`Please type your name to unlock the message 👇`, 5600);
  } else {
    await addBubble(`What's your name? Type it below to reveal your message 👇`, 5600);
  }
  chatState = 'awaiting_name';
  chatInput.disabled = false;
  chatInput.focus();
}

async function addBubble(text, delay = 0, type = 'bot', skipTyping = false) {
  return new Promise(resolve => {
    setTimeout(async () => {
      if (!skipTyping && type === 'bot') {
        // Show typing indicator
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatBody.appendChild(typing);
        chatBody.scrollTop = chatBody.scrollHeight;
        await wait(1200);
        typing.remove();
      }
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble${type === 'user' ? ' user' : ''}${type === 'reveal' ? ' reveal' : ''}`;
      bubble.textContent = text;
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
      resolve();
    }, delay);
  });
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function handleChatSend() {
  const val = chatInput.value.trim();
  if (!val) return;
  chatInput.value = '';

  if (chatState === 'awaiting_name') {
    await addBubble(val, 0, 'user', true);
    const inputName = val.toLowerCase().trim();
    const match = !revealRecipient || inputName === revealRecipient ||
                  revealRecipient.includes(inputName) || inputName.includes(revealRecipient);

    if (match) {
      chatState = 'revealed';
      await addBubble(`Identity confirmed ✅`, 400);
      await addBubble(`Unlocking your message... 🔓`, 1600);

      const msgs = revealTemplate ? revealTemplate.messages : ["This message was made just for you ❤️"];
      for (let i = 0; i < msgs.length; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble reveal';
        bubble.textContent = msgs[i];
        chatBody.appendChild(bubble);
        chatBody.scrollTop = chatBody.scrollHeight;
        await wait(i === 0 ? 2200 : 1400);
      }

      if (guessWhoMode) {
        await wait(1600);
        showGuessWho();
      } else {
        await wait(2000);
        showViralCTA();
      }

    } else {
      chatState = 'revealed';
      await addBubble("Hmm... The name doesn't quite match 🤔", 400);
      await addBubble("But the sender said: you're still a wonderful person 💛", 1800);
      await addBubble("Maybe this message reached exactly who it was meant for 😉", 3200);
      await wait(4000);
      showViralCTA();
    }
    chatInput.disabled = true;
  }
}

function showGuessWho() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="chat-bubble" style="animation-delay:0s">Now for the fun part... 😏<br><br>Can you guess who sent this?</div>
    <div class="guess-options mt-16">
      <button class="guess-btn" onclick="handleGuess('A close friend', this)">👫 Close Friend</button>
      <button class="guess-btn" onclick="handleGuess('A classmate', this)">🎓 Classmate</button>
      <button class="guess-btn" onclick="handleGuess('A coworker', this)">💼 Coworker</button>
      <button class="guess-btn" onclick="handleGuess('A secret admirer', this)">❤️ Secret Admirer</button>
    </div>
  `;
  chatBody.appendChild(container);
  chatBody.scrollTop = chatBody.scrollHeight;
}

async function handleGuess(guess, btn) {
  btn.closest('.guess-options').querySelectorAll('.guess-btn').forEach(b => b.disabled = true);
  await addBubble(guess, 0, 'user', true);
  const responses = [
    `Interesting choice... ${guess}? 👀`,
    `You might be right. Or you might be completely wrong 😂`,
    `The mystery remains... but what matters is — someone cares about you 💛`,
  ];
  for (const r of responses) {
    await addBubble(r, 0);
    await wait(1400);
  }
  showViralCTA();
}

async function showViralCTA() {
  await wait(600);
  const cta = document.createElement('div');
  cta.className = 'viral-cta';
  cta.innerHTML = `
    <h3>Want to send a secret message too? 🤫</h3>
    <p>Create your own viral QR message in seconds. It's free.</p>
    <button class="btn-primary" onclick="goToMain()">✨ Create Your Own Message</button>
  `;
  chatBody.appendChild(cta);
  chatBody.scrollTop = chatBody.scrollHeight;

  // Ad slot after reveal
  const ad = document.createElement('div');
  ad.className = 'ad-slot mt-16';
  ad.innerHTML = '<!-- Ad: After Reveal --><span>Advertisement</span>';
  chatBody.appendChild(ad);
}

function goToMain() {
  window.location.href = window.location.pathname;
}

// ─── SCROLL OBSERVER ───
function setupScrollObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // Re-observe after template render
  setTimeout(() => {
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
  }, 500);
}

// ─── EVENT LISTENERS ───
document.addEventListener('DOMContentLoaded', () => {
  init();

  if (chatSend) chatSend.addEventListener('click', handleChatSend);
  if (chatInput) chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleChatSend(); });

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
});

// ─── EXPOSE GLOBALS ───
window.openCreateModal    = openCreateModal;
window.openQRFlow         = openQRFlow;
window.openPreview        = openPreview;
window.closeModal         = closeModal;
window.filterCategory     = filterCategory;
window.selectHeading      = selectHeading;
window.selectPosterTheme  = selectPosterTheme;
window.generateLink       = generateLink;
window.downloadPoster     = downloadPoster;
window.copyLink           = copyLink;
window.handleGuess        = handleGuess;
window.goToMain           = goToMain;
window.handleChatSend     = handleChatSend;
