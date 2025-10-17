import { SlashCommandBuilder, EmbedBuilder } from "discord.js"

export const data = new SlashCommandBuilder().setName("12hr").setDescription("Send 12-hour response warning")

export async function execute(interaction) {
  if (!interaction.channel.name.startsWith("ticket-")) {
    return interaction.reply({ content: "❌ This command can only be used in ticket channels.", flags: 64 })
  }

  const embed = new EmbedBuilder()
    .setTitle("⚠️ 12 Hour Response Required")
    .setDescription(
      "This ticket requires a response within 12 hours. If no response is received, the ticket will be automatically closed.",
    )
    .setColor("#FF6B6B")
    .setTimestamp()

  await interaction.channel.send({ embeds: [embed] })
  await interaction.reply({ content: "✅ 12-hour warning sent!", flags: 64 })
}
