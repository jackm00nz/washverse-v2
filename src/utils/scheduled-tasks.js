import cron from "node-cron"
import { db } from "../database/init.js"
import { restoreRankAfterSuspension } from "./roblox-api.js"

export function startScheduledTasks(client) {
  // Check for expired LoAs every hour
  cron.schedule("0 * * * *", async () => {
    const now = Date.now()
    const expiredLoas = db.prepare("SELECT * FROM loa WHERE end_date <= ? AND active = 1").all(now)

    for (const loa of expiredLoas) {
      try {
        const user = await client.users.fetch(loa.user_id)
        const guild = client.guilds.cache.get(process.env.GUILD_ID)
        const member = await guild.members.fetch(loa.user_id)

        // Remove LoA role
        const loaRole = guild.roles.cache.find((r) => r.name === "Leave of Absence")
        if (loaRole && member.roles.cache.has(loaRole.id)) {
          await member.roles.remove(loaRole)
        }

        // Send DM notification
        await user.send({
          content: `🔔 **Leave of Absence Expired**\n\nYour Leave of Absence for WashVerse has expired. Welcome back! Please resume your duties.`,
        })

        // Mark as inactive
        db.prepare("UPDATE loa SET active = 0 WHERE id = ?").run(loa.id)
      } catch (error) {
        console.error(`Error processing expired LoA for user ${loa.user_id}:`, error)
      }
    }
  })

  // Check for expired suspensions every hour
  cron.schedule("0 * * * *", async () => {
    const now = Date.now()
    const expiredSuspensions = db.prepare("SELECT * FROM suspensions WHERE end_date <= ? AND active = 1").all(now)

    for (const suspension of expiredSuspensions) {
      try {
        await restoreRankAfterSuspension(suspension.roblox_username, suspension.original_rank)
        db.prepare("UPDATE suspensions SET active = 0 WHERE id = ?").run(suspension.id)
        console.log(`Restored rank for ${suspension.roblox_username}`)
      } catch (error) {
        console.error(`Error restoring rank for ${suspension.roblox_username}:`, error)
      }
    }
  })

  // Weekly alliance check-in (every Monday at 9 AM)
  cron.schedule("0 9 * * 1", async () => {
    const alliances = db.prepare("SELECT * FROM alliances").all()
    const guild = client.guilds.cache.get(process.env.GUILD_ID)

    for (const alliance of alliances) {
      if (alliance.channel_id) {
        try {
          const channel = await guild.channels.fetch(alliance.channel_id)
          await channel.send({
            content: `📋 **Weekly Alliance Check-In**\n\nHello ${alliance.group_name} representatives! This is your weekly check-in. Please confirm your alliance status and share any updates.`,
          })
        } catch (error) {
          console.error(`Error sending check-in to ${alliance.group_name}:`, error)
        }
      }
    }
  })

  console.log("Scheduled tasks configured")
}
