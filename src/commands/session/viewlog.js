import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export async function execute(interaction) {
  const logs = db
    .prepare("SELECT * FROM log_requests WHERE host_id = ? ORDER BY timestamp DESC LIMIT 10")
    .all(interaction.user.id)

  if (logs.length === 0) {
    return interaction.reply({ content: "📝 You have no log requests.", ephemeral: true })
  }

  const embed = new EmbedBuilder()
    .setTitle("📝 Your Log Requests")
    .setColor("#4A90E2")
    .setDescription(`You have ${logs.length} recent log request(s)`)
    .setTimestamp()

  for (const log of logs) {
    const requester = await interaction.client.users.fetch(log.requester_id)
    embed.addFields({
      name: `${log.role}`,
      value: `Requested by: ${requester.tag}\nTime: <t:${Math.floor(log.timestamp / 1000)}:R>`,
    })
  }

  await interaction.reply({ embeds: [embed], ephemeral: true })
}

export const data = new SlashCommandBuilder().setName("viewlog").setDescription("View log requests for your sessions")
