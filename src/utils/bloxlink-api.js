import axios from "axios"
import { db } from "../database/init.js"

export async function getBloxlinkUser(discordId) {
  try {
    const response = await axios.get(
      `https://api.blox.link/v4/public/guilds/${process.env.GUILD_ID}/discord-to-roblox/${discordId}`,
      {
        headers: {
          Authorization: process.env.BLOXLINK_API_KEY || "",
        },
      },
    )

    return response.data
  } catch (error) {
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}

export async function getRobloxUser(discordId) {
  const bloxlinkData = await getBloxlinkUser(discordId)

  if (!bloxlinkData) {
    return null
  }

  return {
    robloxId: bloxlinkData.robloxID,
    robloxUsername: bloxlinkData.robloxUsername || bloxlinkData.robloxID,
  }
}

export async function updateUserRoles(member) {
  try {
    const robloxData = await getRobloxUser(member.id)

    if (!robloxData) {
      throw new Error("User is not verified")
    }

    // Fetch group rank from ROBLOX API
    const groupId = process.env.ROBLOX_GROUP_ID
    const response = await axios.get(`https://groups.roblox.com/v1/users/${robloxData.robloxId}/groups/roles`)

    const groupData = response.data.data.find((g) => g.group.id === Number.parseInt(groupId))

    if (!groupData) {
      throw new Error("User is not in the group")
    }

    const rankName = groupData.role.name

    // Map ROBLOX ranks to Discord roles
    const roleMapping = {
      Chairman: "Chairman",
      President: "President",
      "Senior Vice President": "Senior Vice President",
      "Vice President": "Vice President",
      "Chief Staffing Officer": "Chief Staffing Officer",
      "Chief Operations Officer": "Chief Operations Officer",
      "Chief Communications Officer": "Chief Communications Officer",
      "Corporate Director": "Corporate Director",
      Officer: "Officer",
      "Corporate Associate": "Corporate Associate",
    }

    const discordRoleName = roleMapping[rankName]

    if (discordRoleName) {
      const role = member.guild.roles.cache.find((r) => r.name === discordRoleName)

      if (role) {
        await member.roles.add(role)
      }
    }

    return true
  } catch (error) {
    console.error("Error updating user roles:", error)
    throw error
  }
}

export async function forceVerifyUser(userId, robloxUsername, guild) {
  try {
    // Fetch ROBLOX user ID from username
    const response = await axios.post("https://users.roblox.com/v1/usernames/users", {
      usernames: [robloxUsername],
    })

    if (!response.data.data || response.data.data.length === 0) {
      throw new Error("ROBLOX user not found")
    }

    const robloxId = response.data.data[0].id

    // Save to database
    db.prepare(
      "INSERT OR REPLACE INTO verification (user_id, roblox_id, roblox_username, verified_at) VALUES (?, ?, ?, ?)",
    ).run(userId, robloxId.toString(), robloxUsername, Date.now())

    // Update roles
    const member = await guild.members.fetch(userId)
    await updateUserRoles(member)

    return true
  } catch (error) {
    console.error("Error force verifying user:", error)
    throw error
  }
}
