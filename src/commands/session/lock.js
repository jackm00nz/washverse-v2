import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder().setName("lock").setDescription("Announce a session lock")

export async function execute(interaction) {
  // Check permissions
  if (!hasPermission(interaction.member, "CORPORATE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Corporate Staff or higher.",
      flags: 64,
    })
  }

  const embed = new EmbedBuilder()
    .setTitle("🔒 Session Locked")
    .setDescription("The session is now locked. No new participants may join at this time.")
    .setColor("#FF0000")
    .setTimestamp()

  const sessionChannel = interaction.guild.channels.cache.find((ch) => ch.name === "session-announcements")
  if (sessionChannel) {
    await sessionChannel.send({ embeds: [embed] })
  }

  await interaction.reply({ content: "✅ Session lock announced!", flags: 64 })
}
