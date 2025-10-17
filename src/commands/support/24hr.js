import { SlashCommandBuilder, EmbedBuilder } from "discord.js"

export const data = new SlashCommandBuilder().setName("24hr").setDescription("Send 24-hour response warning")

export async function execute(interaction) {
  if (!interaction.channel.name.startsWith("ticket-")) {
    return interaction.reply({ content: "❌ This command can only be used in ticket channels.", ephemeral: true })
  }

  const embed = new EmbedBuilder()
    .setTitle("⚠️ 24 Hour Response Required")
    .setDescription(
      "This ticket requires a response within 24 hours. If no response is received, the ticket will be automatically closed.",
    )
    .setColor("#FFA500")
    .setTimestamp()

  await interaction.channel.send({ embeds: [embed] })
  await interaction.reply({ content: "✅ 24-hour warning sent!", ephemeral: true })
}
