import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder()
  .setName("modlogs")
  .setDescription("View moderation logs for a user")
  .addUserOption((option) => option.setName("user").setDescription("The user to view logs for").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

export async function execute(interaction) {
  const user = interaction.options.getUser("user")

  const logs = db.prepare("SELECT * FROM mod_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10").all(user.id)

  if (logs.length === 0) {
    return interaction.reply({ content: `📋 No moderation logs found for ${user.tag}.`, ephemeral: true })
  }

  const embed = new EmbedBuilder()
    .setTitle(`📋 Moderation Logs for ${user.tag}`)
    .setColor("#3498DB")
    .setThumbnail(user.displayAvatarURL())
    .setDescription(`Showing last ${logs.length} log(s)`)

  for (const log of logs) {
    const moderator = await interaction.client.users.fetch(log.moderator_id).catch(() => null)
    const date = new Date(log.timestamp).toLocaleString()

    let value = `**Moderator:** ${moderator ? moderator.tag : "Unknown"}\n**Reason:** ${log.reason || "No reason provided"}`

    if (log.duration) {
      value += `\n**Duration:** ${log.duration}`
    }

    if (log.proof) {
      value += `\n**Proof:** ${log.proof}`
    }

    embed.addFields({
      name: `${log.action.toUpperCase()} - ${date}`,
      value,
    })
  }

  await interaction.reply({ embeds: [embed], ephemeral: true })
}
