import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder()
  .setName("suggest")
  .setDescription("Submit a suggestion")
  .addStringOption((option) => option.setName("suggestion").setDescription("Your suggestion").setRequired(true))

export async function execute(interaction) {
  const suggestion = interaction.options.getString("suggestion")
  const suggestionsChannel = interaction.guild.channels.cache.find((ch) => ch.name === "suggestions")

  if (!suggestionsChannel) {
    return interaction.reply({ content: "❌ Suggestions channel not found.", flags: 64 })
  }

  const embed = new EmbedBuilder()
    .setTitle("💡 New Suggestion")
    .setDescription(suggestion)
    .setColor("#3498DB")
    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
    .setTimestamp()

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("suggestion_approve")
      .setLabel("Approve")
      .setStyle(ButtonStyle.Success)
      .setEmoji("✅"),
    new ButtonBuilder().setCustomId("suggestion_deny").setLabel("Deny").setStyle(ButtonStyle.Danger).setEmoji("❌"),
  )

  const message = await suggestionsChannel.send({ embeds: [embed], components: [row] })

  // Add reactions for voting
  await message.react("👍")
  await message.react("👎")

  // Save to database
  db.prepare("INSERT INTO suggestions (user_id, suggestion, message_id, timestamp) VALUES (?, ?, ?, ?)").run(
    interaction.user.id,
    suggestion,
    message.id,
    Date.now(),
  )

  await interaction.reply({ content: "✅ Your suggestion has been submitted!", flags: 64 })
}
