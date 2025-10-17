# WashVerse Discord Bot

A comprehensive Discord bot for managing the WashVerse ROBLOX car wash group.

## Features

### Server Administration
- `/timeout` - Timeout users with reason and proof
- `/warn` - Warn users with logging
- `/kick` - Kick users from the server
- `/ban` - Permanently ban users
- `/tempban` - Temporarily ban users
- `/chatlock` - Lock channels for 5 minutes
- `/modlogs` - View moderation history
- `/suggest` - Submit suggestions (all members)

### Group Administration (ROBLOX Integration)
- `/suspend` - Suspend users in the ROBLOX group (minimum 3 days)
- `/demote` - Demote users by one rank
- `/terminate` - Terminate users (rank to Customer)
- `/loa` - Assign Leave of Absence with automatic role management

### Verification
- `/verify` - Verify ROBLOX account via Bloxlink
- `/getroles` - Update Discord roles based on ROBLOX rank
- `/forceverify` - Manually verify a user

### Activity Management (Hyra Integration)
- `/myactivity` - View your own activity stats
- `/viewactivity` - View another user's activity
- `/setrequirement` - Set activity requirements per rank
- `/distribute` - Generate activity distribution reports

### Session Management
- `/training` - Announce training sessions
- `/log` - Request session logs
- `/viewlog` - View log requests
- `/lock` - Announce session lock
- `/conclude` - Announce session conclusion

### Support System
- `/createpanel` - Create support ticket panel
- `/claim` - Claim a ticket
- `/24hr` / `/12hr` - Send auto-close warnings
- `/close` - Close tickets with transcripts
- `/add` - Add users to tickets
- `/transfer` - Transfer tickets between departments

### Game Administration
- `/createban` - Create in-game bans (Discord-to-ROBLOX)
- `/createblacklist` - Permanent cross-game blacklist

## Setup Instructions

### Prerequisites
- Node.js 20 or higher
- Railway account
- Discord Bot Token
- ROBLOX account with group admin permissions
- ROBLOX group cookie

### Environment Variables

Set these in Railway:

\`\`\`
DISCORD_BOT_TOKEN=your_bot_token
GUILD_ID=your_discord_server_id
ROBLOX_COOKIE=your_roblox_cookie
ROBLOX_GROUP_ID=34217524
BLOXLINK_API_KEY=your_bloxlink_key (optional)
HYRA_API_URL=your_hyra_url
HYRA_API_KEY=your_hyra_key
\`\`\`

### Deployment to Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add all environment variables
4. Deploy!

The bot will automatically:
- Initialize the database
- Register slash commands
- Start scheduled tasks for LoA/suspension expiration
- Begin listening for commands

### Required Discord Roles

Create these roles in your Discord server:
- `Verified` - For verified members
- `Leave of Absence` - Auto-assigned during LoA

### Required Discord Channels

Create these channels:
- `#mod-logs` - For moderation logs
- `#suggestions` - For suggestions

## Database

The bot uses SQLite for data persistence. The database file is stored in `/data/washverse.db` and includes:
- Moderation logs
- Activity tracking
- Suspensions and LoAs
- Verifications
- Alliances
- Session logs
- Suggestions

## Support

For issues or questions, contact the WashVerse development team.
