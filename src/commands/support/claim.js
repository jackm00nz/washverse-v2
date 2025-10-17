import { SlashCommandBuilder, EmbedBuilder } from "discord.js"

export const data = new SlashCommandBuilder().setName("claim").setDescription("Claim the current ticket")

export async function execute(interaction) {
  // Check if in a ticket channel
  if (!interaction.channel.name.startsWith("ticket-")) {
    return interaction.reply({ content: "❌ This command can only be used in ticket channels.", ephemeral: true })
  }

  const embed = new EmbedBuilder()
    .setTitle("✅ Ticket Claimed")
    .setDescription(`This ticket has been claimed by ${interaction.user.toString()}`)
    .setColor("#00FF00")
    .setTimestamp()

  await interaction.channel.send({ embeds: [embed] })
  await interaction.reply({ content: "✅ You have claimed this ticket!", ephemeral: true })
}
