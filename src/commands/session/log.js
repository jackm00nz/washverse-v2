import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder()
  .setName("log")
  .setDescription("Request a log for a session")
  .addStringOption((option) => option.setName("role").setDescription("Role to log (e.g., Trainee)").setRequired(true))
  .addUserOption((option) => option.setName("host").setDescription("Session host").setRequired(true))

export async function execute(interaction) {
  const role = interaction.options.getString("role")
  const host = interaction.options.getUser("host")

  // Save log request to database
  db.prepare("INSERT INTO log_requests (requester_id, role, host_id, timestamp) VALUES (?, ?, ?, ?)").run(
    interaction.user.id,
    role,
    host.id,
    Date.now(),
  )

  const embed = new EmbedBuilder()
    .setTitle("📝 Log Request")
    .setColor("#FFA500")
    .addFields(
      { name: "Requested By", value: interaction.user.toString(), inline: true },
      { name: "Role", value: role, inline: true },
      { name: "Host", value: host.toString(), inline: true },
    )
    .setTimestamp()

  // Send to host's DMs
  try {
    await host.send({ embeds: [embed] })
    await interaction.reply({ content: `✅ Log request sent to ${host.tag}!`, flags: 64 })
  } catch (error) {
    console.error("Error sending log request:", error)
    await interaction.reply({
      content: "❌ Failed to send log request. The host may have DMs disabled.",
      flags: 64,
    })
  }
}
