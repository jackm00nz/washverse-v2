import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { getRobloxUser } from "../../utils/bloxlink-api.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder().setName("verify").setDescription("Verify your ROBLOX account")

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const robloxData = await getRobloxUser(interaction.user.id)

    if (!robloxData) {
      return interaction.editReply({
        content: "❌ Could not find your ROBLOX account. Please verify with Bloxlink first: https://blox.link/verify",
      })
    }

    // Save verification
    db.prepare(
      "INSERT OR REPLACE INTO verification (user_id, roblox_id, roblox_username, verified_at) VALUES (?, ?, ?, ?)",
    ).run(interaction.user.id, robloxData.robloxId, robloxData.robloxUsername, Date.now())

    // Assign verified role
    const verifiedRole = interaction.guild.roles.cache.find((r) => r.name === "Verified")
    if (verifiedRole) {
      const member = await interaction.guild.members.fetch(interaction.user.id)
      await member.roles.add(verifiedRole)
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ Verification Successful")
          .setDescription(`You have been verified as **${robloxData.robloxUsername}**`)
          .setColor("#00FF00")
          .setTimestamp(),
      ],
    })
  } catch (error) {
    console.error("Error verifying user:", error)
    await interaction.editReply({ content: "❌ Failed to verify. Please try again later." })
  }
}
