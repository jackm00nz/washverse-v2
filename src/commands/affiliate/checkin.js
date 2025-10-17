import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder()
  .setName("checkin")
  .setDescription("Send weekly alliance check-in to all representatives")

export async function execute(interaction) {
  if (!hasPermission(interaction.member, "ADMINISTRATIVE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Administrative Staff or higher.",
      flags: 64,
    })
  }

  await interaction.deferReply({ flags: 64 })

  const alliances = db.prepare("SELECT * FROM alliances WHERE channel_id IS NOT NULL").all()

  const embed = new EmbedBuilder()
    .setTitle("📋 Weekly Alliance Check-In")
    .setDescription(
      "This is your weekly check-in for the alliance. Please respond with:\n\n• Current status of the alliance\n• Any updates or concerns\n• Activity level\n\nThank you for your continued partnership!",
    )
    .setColor("#4A90E2")
    .setTimestamp()

  let sentCount = 0

  for (const alliance of alliances) {
    const channel = interaction.guild.channels.cache.get(alliance.channel_id)
    if (channel) {
      try {
        await channel.send({ embeds: [embed] })
        sentCount++
      } catch (error) {
        console.error(`Failed to send check-in to ${alliance.group_name}:`, error)
      }
    }
  }

  await interaction.editReply({ content: `✅ Check-in sent to ${sentCount} alliance channels!` })
}
