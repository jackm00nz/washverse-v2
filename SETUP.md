# Railway Deployment Guide

## Step 1: Prepare Your Bot

1. Create a Discord application at https://discord.com/developers/applications
2. Create a bot and copy the token
3. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent

## Step 2: Get ROBLOX Cookie

1. Log into ROBLOX in your browser
2. Open Developer Tools (F12)
3. Go to Application > Cookies > https://www.roblox.com
4. Copy the `.ROBLOSECURITY` cookie value

⚠️ **IMPORTANT**: Keep this cookie secure! It provides full access to your ROBLOX account.

## Step 3: Deploy to Railway

1. Go to https://railway.app
2. Create a new project
3. Select "Deploy from GitHub repo"
4. Connect this repository
5. Railway will auto-detect the Dockerfile

## Step 4: Add Environment Variables

In Railway project settings, add these variables:

\`\`\`
DISCORD_BOT_TOKEN=your_discord_bot_token
GUILD_ID=your_discord_server_id
ROBLOX_COOKIE=_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_YOUR_COOKIE_HERE
ROBLOX_GROUP_ID=34217524
HYRA_API_URL=your_hyra_api_url
HYRA_API_KEY=your_hyra_api_key
\`\`\`

Optional:
\`\`\`
BLOXLINK_API_KEY=your_bloxlink_api_key
\`\`\`

## Step 5: Add Bot to Server

1. Go to Discord Developer Portal
2. Select your application
3. Go to OAuth2 > URL Generator
4. Select scopes: `bot`, `applications.commands`
5. Select permissions: `Administrator` (or specific permissions)
6. Copy the generated URL and open it in your browser
7. Add the bot to your WashVerse server

## Step 6: Create Required Roles & Channels

### Roles:
- `Verified`
- `Leave of Absence`

### Channels:
- `#mod-logs`
- `#suggestions`

## Step 7: Deploy

Click "Deploy" in Railway. The bot will:
- Build the Docker image
- Start the bot
- Initialize the database
- Register slash commands

## Monitoring

Check Railway logs to ensure:
- ✅ Bot logged in successfully
- ✅ Database initialized
- ✅ Commands registered
- ✅ ROBLOX authenticated

## Troubleshooting

**Bot not responding to commands:**
- Check that slash commands are registered (wait 1-2 minutes after deployment)
- Verify bot has proper permissions in Discord

**ROBLOX commands failing:**
- Verify ROBLOX_COOKIE is correct and not expired
- Ensure the bot account has admin permissions in the group

**Database errors:**
- Railway automatically creates a persistent volume for `/data`
- If issues persist, check Railway logs

## Updating the Bot

1. Push changes to GitHub
2. Railway will automatically redeploy
3. Database persists between deployments
