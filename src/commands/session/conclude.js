import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder().setName("conclude").setDescription("Announce session conclusion")

export async function execute(interaction) {
  // Check permissions
  if (!hasPermission(interaction.member, "CORPORATE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Corporate Staff or higher.",
      ephemeral: true,
    })
  }

  const embed = new EmbedBuilder()
    .setTitle("✅ Session Concluded")
    .setDescription("The session has concluded. Thank you to all participants!")
    .setColor("#00FF00")
    .setTimestamp()

  const sessionChannel = interaction.guild.channels.cache.find((ch) => ch.name === "session-announcements")
  if (sessionChannel) {
    await sessionChannel.send({ embeds: [embed] })
  }

  await interaction.reply({ content: "✅ Session conclusion announced!", ephemeral: true })
}
