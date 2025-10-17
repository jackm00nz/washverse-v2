import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder().setName("viewalliances").setDescription("View all registered alliances")

export async function execute(interaction) {
  const alliances = db.prepare("SELECT * FROM alliances").all()

  if (alliances.length === 0) {
    return interaction.reply({ content: "📋 No alliances registered yet.", ephemeral: true })
  }

  const embed = new EmbedBuilder()
    .setTitle("🤝 Registered Alliances")
    .setColor("#4A90E2")
    .setDescription(`Total alliances: ${alliances.length}`)
    .setTimestamp()

  for (const alliance of alliances) {
    const channel = interaction.guild.channels.cache.get(alliance.channel_id)
    embed.addFields({
      name: alliance.group_name,
      value: `Group: ${alliance.group_link}\nChannel: ${channel ? channel.toString() : "Not set"}\nRepresentatives: ${alliance.representatives || "None"}`,
    })
  }

  await interaction.reply({ embeds: [embed], ephemeral: true })
}
