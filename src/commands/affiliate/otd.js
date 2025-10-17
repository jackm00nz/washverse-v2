import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder().setName("otd").setDescription("Post 'Of the Day' from Trello queue")

export async function execute(interaction) {
  if (!hasPermission(interaction.member, "ADMINISTRATIVE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Administrative Staff or higher.",
      flags: 64,
    })
  }

  await interaction.deferReply({ flags: 64 })

  // TODO: Integrate with Trello API to fetch queue
  // For now, send a placeholder message

  const otdChannel = interaction.guild.channels.cache.find((ch) => ch.name === "of-the-day")

  if (!otdChannel) {
    return interaction.editReply({ content: "❌ 'of-the-day' channel not found." })
  }

  // Check if there's content in queue (placeholder logic)
  const hasQueue = false // This would check Trello

  if (!hasQueue) {
    // Send message to Communications Leads
    const commsLeadRole = interaction.guild.roles.cache.find((role) => role.name === "Communications Lead")
    if (commsLeadRole) {
      const commsLeads = commsLeadRole.members
      for (const [, member] of commsLeads) {
        try {
          await member.send({
            content: "⚠️ The 'Of the Day' queue is empty! Please add content to the Trello board.",
          })
        } catch (error) {
          console.error(`Failed to notify ${member.user.tag}:`, error)
        }
      }
    }

    return interaction.editReply({ content: "⚠️ No content in queue. Communications Leads have been notified." })
  }

  // Post OTD (placeholder)
  const embed = new EmbedBuilder()
    .setTitle("⭐ Of the Day")
    .setDescription("Today's featured content!")
    .setColor("#FFD700")
    .setTimestamp()

  await otdChannel.send({ embeds: [embed] })
  await interaction.editReply({ content: "✅ Of the Day posted!" })
}
