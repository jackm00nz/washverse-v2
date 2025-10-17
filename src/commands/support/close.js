import { SlashCommandBuilder, EmbedBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
  .setName("close")
  .setDescription("Close the current ticket")
  .addStringOption((option) => option.setName("reason").setDescription("Reason for closing").setRequired(true))

export async function execute(interaction) {
  // Check if in a ticket channel
  if (!interaction.channel.name.startsWith("ticket-")) {
    return interaction.reply({ content: "❌ This command can only be used in ticket channels.", flags: 64 })
  }

  const reason = interaction.options.getString("reason")

  const embed = new EmbedBuilder()
    .setTitle("🔒 Ticket Closed")
    .setDescription(`This ticket has been closed by ${interaction.user.toString()}`)
    .addFields({ name: "Reason", value: reason || "No reason provided", inline: false })
    .setColor("#FF0000")
    .setTimestamp()

  await interaction.channel.send({ embeds: [embed] })
  await interaction.reply({ content: "✅ Ticket will be deleted in 5 seconds...", flags: 64 })

  // Delete channel after 5 seconds
  setTimeout(async () => {
    await interaction.channel.delete()
  }, 5000)
}
