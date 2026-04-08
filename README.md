# 🤫 Secret QR Messenger

A viral secret message platform where users create mysterious QR codes that reveal messages in a dramatic AI-style chat interface.

**Static site — runs entirely on GitHub Pages. No backend required.**

---

## 📁 Project Structure

```
secret-qr-messenger/
├── index.html          ← Main app (landing + chat reveal)
├── style.css           ← All styles
├── script.js           ← All logic
├── templates.json      ← Message templates data
├── headings.json       ← Viral heading options
├── README.md
└── assets/
    └── themes/         ← (Optional) poster background images
        ├── romantic.jpg
        ├── birthday.jpg
        ├── funny.jpg
        ├── wedding.jpg
        └── christmas.jpg
```

---

## 🚀 Deploy to GitHub Pages (Step-by-Step)

### Option A — New Repository

1. Go to [github.com](https://github.com) and click **New repository**
2. Name it: `secret-qr-messenger` (or any name)
3. Set it to **Public**
4. Click **Create repository**
5. Upload all project files (drag & drop in the GitHub UI or use Git)
6. Go to **Settings → Pages**
7. Under **Source**, select **Deploy from a branch**
8. Select **Branch: main**, **Folder: / (root)**
9. Click **Save**
10. Your site will be live at:
    ```
    https://YOUR-USERNAME.github.io/secret-qr-messenger/
    ```

### Option B — Using Git CLI

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/secret-qr-messenger.git
git push -u origin main
```

Then enable GitHub Pages in Settings → Pages.

---

## ⚙️ Configuration

### Google Analytics
In `index.html`, uncomment and update the GA block:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX'); // ← Replace with your GA4 ID
</script>
```

### Google AdSense
Replace the `<div class="ad-slot">` placeholders in `index.html` with your AdSense `<ins>` tags.

### Adsterra / PropellerAds
Paste their script tags inside the `.ad-slot` divs.

---

## 📱 How It Works

### Creating a Message
1. User clicks **Create a Secret Message**
2. Selects a template (Birthday, Love, Pranks, etc.)
3. Optionally enters recipient's name and their own alias
4. Chooses a viral heading caption
5. A shareable link is generated:
   ```
   https://yoursite.github.io/?t=1&r=Sarah&s=YourAdmirer&h=3
   ```
6. A QR poster is rendered on canvas — downloadable at 1080×1080
7. Share buttons for WhatsApp, Facebook, Telegram, Twitter, Copy Link

### Opening a Message (Reveal)
1. Recipient scans QR or taps the link
2. Dramatic chat sequence begins automatically
3. Bot asks for their name
4. If name matches → full message reveals with typing animation
5. If name doesn't match → friendly fallback message
6. "Guess Who" mode activates for romantic templates
7. Viral CTA shown at the end: "Create your own message"

---

## 🎨 Adding Poster Themes

Place background images in `assets/themes/`:
- `romantic.jpg` (1080×1080 px recommended)
- `birthday.jpg`
- `funny.jpg`
- `wedding.jpg`
- `christmas.jpg`

Then in `script.js`, update the `posterThemes` object to use `background-image` instead of solid colors.

---

## 📦 Adding New Templates

Edit `templates.json` — add an object to the array:

```json
{
  "id": 26,
  "category": "Workers Day",
  "title": "Happy Workers Day!",
  "tooltip": "A Workers Day message from someone who appreciates you",
  "messages": [
    "Today is Workers Day 💪",
    "And someone wants to celebrate YOU.",
    "You work hard every single day.",
    "You don't always hear this enough...",
    "But you are truly appreciated 🙏"
  ]
}
```

---

## 🌍 Regional Holidays (Nigeria & others)

Already included:
- Eid Mubarak
- Eid al-Kabir  
- Independence Day
- Workers Day
- Democracy Day
- Easter, Christmas, New Year

To add more, simply extend `templates.json` with new category names.

---

## 🔗 URL Parameters

| Param | Meaning | Example |
|-------|---------|---------|
| `t` | Template ID | `?t=1` |
| `r` | Recipient name | `&r=Sarah` |
| `s` | Sender alias | `&s=YourCrush` |
| `h` | Heading ID | `&h=3` |

If `r` is empty, **anyone** can unlock the message with any name.

---

## ✅ Tech Stack

- Pure HTML / CSS / JavaScript
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) via CDN
- HTML5 Canvas for poster generation
- `localStorage` for future feature extensions
- URL parameters for stateless message encoding
- Google Fonts (Playfair Display + DM Sans)

**No Node.js. No database. No backend. Works offline after first load.**
