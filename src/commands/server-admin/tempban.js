import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder()
  .setName("tempban")
  .setDescription("Temporarily ban a user from the server")
  .addUserOption((option) => option.setName("user").setDescription("The user to ban").setRequired(true))
  .addStringOption((option) =>
    option.setName("duration").setDescription("Duration (e.g., 1d, 7d, 30d)").setRequired(true),
  )
  .addStringOption((option) => option.setName("reason").setDescription("Reason for ban").setRequired(true))
  .addStringOption((option) => option.setName("proof").setDescription("Proof (link or description)").setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)

export async function execute(interaction) {
  const user = interaction.options.getUser("user")
  const duration = interaction.options.getString("duration")
  const reason = interaction.options.getString("reason")
  const proof = interaction.options.getString("proof") || "No proof provided"

  try {
    // Try to DM before banning
    try {
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("🔨 Temporarily Banned from WashVerse")
            .setDescription(`You have been temporarily banned from the WashVerse Discord server.`)
            .addFields(
              { name: "Duration", value: duration },
              { name: "Reason", value: reason },
              { name: "Moderator", value: interaction.user.tag },
            )
            .setColor("#FF4500")
            .setTimestamp(),
        ],
      })
    } catch (error) {
      console.log("Could not DM user")
    }

    await interaction.guild.members.ban(user, { reason: `[TEMP BAN - ${duration}] ${reason}` })

    // Log to database
    db.prepare(
      "INSERT INTO mod_logs (user_id, moderator_id, action, reason, proof, duration, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(user.id, interaction.user.id, "tempban", reason, proof, duration, Date.now())

    // Send to mod logs channel
    const modLogChannel = interaction.guild.channels.cache.find((ch) => ch.name === "mod-logs")
    if (modLogChannel) {
      const embed = new EmbedBuilder()
        .setTitle("🔨 User Temporarily Banned")
        .setColor("#FF4500")
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

    await interaction.reply({
      content: `✅ ${user.tag} has been temporarily banned for ${duration}.\n⚠️ Note: You will need to manually unban them after the duration expires.`,
      ephemeral: true,
    })
  } catch (error) {
    console.error("Error temp banning user:", error)
    await interaction.reply({ content: "❌ Failed to temporarily ban user.", ephemeral: true })
  }
}
