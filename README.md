# 🎵 Discord Music Bot

A simple Discord music bot built with DisTube. Supports YouTube, Spotify links, and more.

## Commands

| Command | Description |
|---------|-------------|
| `!play <song>` | Play a song or add to queue |
| `!skip` | Skip current song |
| `!stop` | Stop and clear queue |
| `!pause` | Pause playback |
| `!resume` | Resume playback |
| `!queue` | Show current queue |
| `!volume <1-100>` | Set volume |
| `!nowplaying` | Show current song |
| `!shuffle` | Shuffle the queue |
| `!loop` | Toggle loop mode |
| `!help` | Show all commands |

## Deploy to Railway (24/7 Hosting)

### Step 1 — Create a Discord Bot
1. Go to https://discord.com/developers/applications
2. Click **New Application** → give it a name
3. Go to **Bot** tab → click **Reset Token** → copy the token
4. Under **Privileged Gateway Intents**, enable:
   - **Message Content Intent**
   - **Server Members Intent**
5. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Permissions: `Send Messages`, `Connect`, `Speak`, `Embed Links`
   - Open the URL and add bot to your server

### Step 2 — Push to GitHub
1. Create a new repository on https://github.com
2. Upload all these files to it (or use Git)

### Step 3 — Deploy on Railway
1. Go to https://railway.app and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your repository
4. Go to your service → **Variables** tab → add:
   - `DISCORD_TOKEN` = your bot token
   - `PREFIX` = `!` (or whatever prefix you want)
5. Railway will auto-deploy — your bot is now online 24/7! 🎉

## Local Development
```bash
npm install
cp .env.example .env
# Edit .env and add your DISCORD_TOKEN
npm start
```
