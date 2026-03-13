# FoundRae Product Knowledge Quiz

## Deploying to Netlify

### First time setup (5 minutes)

1. Go to [netlify.com](https://netlify.com) and create a free account
2. From your Netlify dashboard, click **"Add new site" → "Deploy manually"**
3. Drag and drop the entire `foundrae-quiz` folder onto the deploy area
4. Netlify will give you a live URL like `https://amazing-name-123.netlify.app`
5. Share that URL with your team — the quiz and leaderboard are live!

### Updating the quiz in future

1. Make changes to `index.html`
2. Go to your site in Netlify → **Deploys** tab → drag the folder again

### Custom domain (optional)

In Netlify: **Site settings → Domain management → Add custom domain**

---

## Project structure

```
foundrae-quiz/
├── index.html                        # The quiz (edit this to update questions/styling)
├── netlify.toml                      # Netlify config — don't edit
└── netlify/
    └── functions/
        └── leaderboard.mjs           # Serverless API for the shared leaderboard
```

## How the leaderboard works

Scores are stored in **Netlify Blobs** — Netlify's built-in key-value store.
Every user who takes the quiz reads from and writes to the same store,
so the leaderboard is shared across all users automatically.

No external database or accounts required.
