import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder()
  .setName("viewrepresentatives")
  .setDescription("View all assigned representatives")

export async function execute(interaction) {
  const alliances = db.prepare("SELECT * FROM alliances WHERE representatives IS NOT NULL").all()

  if (alliances.length === 0) {
    return interaction.reply({ content: "📋 No representatives assigned yet.", ephemeral: true })
  }

  const embed = new EmbedBuilder().setTitle("👥 Alliance Representatives").setColor("#4A90E2").setTimestamp()

  for (const alliance of alliances) {
    embed.addFields({
      name: alliance.group_name,
      value: `Representatives: ${alliance.representatives}`,
    })
  }

  await interaction.reply({ embeds: [embed], ephemeral: true })
}
