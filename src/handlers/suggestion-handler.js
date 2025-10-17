import { EmbedBuilder, PermissionFlagsBits } from "discord.js"
import { db } from "../database/init.js"

export async function handleSuggestionButton(interaction, args) {
  const action = args[0] // 'approve' or 'deny'

  // Check permissions (Devs & Owners only)
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Only Developers and Owners can approve/deny suggestions.",
      ephemeral: true,
    })
  }

  const message = interaction.message
  const embed = message.embeds[0]

  // Update suggestion status
  db.prepare("UPDATE suggestions SET status = ? WHERE message_id = ?").run(
    action === "approve" ? "approved" : "denied",
    message.id,
  )

  // Update embed
  const newEmbed = EmbedBuilder.from(embed)
    .setColor(action === "approve" ? "#00FF00" : "#FF0000")
    .addFields({ name: "Status", value: action === "approve" ? "✅ Approved" : "❌ Denied" })
    .setFooter({ text: `${action === "approve" ? "Approved" : "Denied"} by ${interaction.user.tag}` })

  await message.edit({ embeds: [newEmbed], components: [] })
  await interaction.reply({
    content: `✅ Suggestion ${action === "approve" ? "approved" : "denied"}.`,
    ephemeral: true,
  })
}
