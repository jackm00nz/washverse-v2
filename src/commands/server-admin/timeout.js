import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder()
  .setName("timeout")
  .setDescription("Timeout a user")
  .addUserOption((option) => option.setName("user").setDescription("The user to timeout").setRequired(true))
  .addStringOption((option) =>
    option.setName("duration").setDescription("Duration (e.g., 10m, 1h, 1d)").setRequired(true),
  )
  .addStringOption((option) => option.setName("reason").setDescription("Reason for timeout").setRequired(true))
  .addStringOption((option) => option.setName("proof").setDescription("Proof (link or description)").setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

export async function execute(interaction) {
  const user = interaction.options.getUser("user")
  const duration = interaction.options.getString("duration")
  const reason = interaction.options.getString("reason")
  const proof = interaction.options.getString("proof") || "No proof provided"

  const member = await interaction.guild.members.fetch(user.id)

  // Parse duration
  const durationMs = parseDuration(duration)
  if (!durationMs) {
    return interaction.reply({ content: "❌ Invalid duration format. Use formats like: 10m, 1h, 1d", flags: 64 })
  }

  try {
    await member.timeout(durationMs, reason)

    // Log to database
    db.prepare(
      "INSERT INTO mod_logs (user_id, moderator_id, action, reason, proof, duration, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(user.id, interaction.user.id, "timeout", reason, proof, duration, Date.now())

    // Send to mod logs channel
    const modLogChannel = interaction.guild.channels.cache.find((ch) => ch.name === "mod-logs")
    if (modLogChannel) {
      const embed = new EmbedBuilder()
        .setTitle("⏱️ User Timed Out")
        .setColor("#FFA500")
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Duration", value: duration, inline: true },
          { name: "Reason", value: reason },
          { name: "Proof", value: proof },
        )
        .setTimestamp()

      await modLogChannel.send({ embeds: [embed] })
    }

    await interaction.reply({ content: `✅ ${user.tag} has been timed out for ${duration}.`, flags: 64 })
  } catch (error) {
    console.error("Error timing out user:", error)
    await interaction.reply({ content: "❌ Failed to timeout user.", flags: 64 })
  }
}

function parseDuration(duration) {
  const regex = /^(\d+)([smhd])$/
  const match = duration.match(regex)

  if (!match) return null

  const value = Number.parseInt(match[1])
  const unit = match[2]

  const multipliers = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  }

  return value * multipliers[unit]
}
