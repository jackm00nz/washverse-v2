import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder().setName("createpanel").setDescription("Create a support ticket panel")

export async function execute(interaction) {
  // Check permissions - only Administrative Staff and above
  if (!hasPermission(interaction.member, "ADMINISTRATIVE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Administrative Staff or higher.",
      ephemeral: true,
    })
  }

  const embed = new EmbedBuilder()
    .setTitle("🎫 Support Tickets")
    .setDescription(
      "Need help? Click the button below to create a support ticket.\n\n**Available Departments:**\n• Moderation\n• Human Resources\n• Communications\n• Development",
    )
    .setColor("#4A90E2")

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_create")
      .setLabel("Create Ticket")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🎫"),
  )

  await interaction.channel.send({ embeds: [embed], components: [row] })
  await interaction.reply({ content: "✅ Support panel created!", ephemeral: true })
}
