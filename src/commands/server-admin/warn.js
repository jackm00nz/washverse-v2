import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("Warn a user")
  .addUserOption((option) => option.setName("user").setDescription("The user to warn").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Reason for warning").setRequired(true))
  .addStringOption((option) => option.setName("proof").setDescription("Proof (link or description)").setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

export async function execute(interaction) {
  const user = interaction.options.getUser("user")
  const reason = interaction.options.getString("reason")
  const proof = interaction.options.getString("proof") || "No proof provided"

  try {
    // Log to database
    db.prepare(
      "INSERT INTO mod_logs (user_id, moderator_id, action, reason, proof, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(user.id, interaction.user.id, "warn", reason, proof, Date.now())

    // Send to mod logs channel
    const modLogChannel = interaction.guild.channels.cache.find((ch) => ch.name === "mod-logs")
    if (modLogChannel) {
      const embed = new EmbedBuilder()
        .setTitle("⚠️ User Warned")
        .setColor("#FFFF00")
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
          { name: "Reason", value: reason },
          { name: "Proof", value: proof },
        )
        .setTimestamp()

      await modLogChannel.send({ embeds: [embed] })
    }

    // Try to DM the user
    try {
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("⚠️ Warning Received")
            .setDescription(`You have been warned in WashVerse.`)
            .addFields({ name: "Reason", value: reason }, { name: "Moderator", value: interaction.user.tag })
            .setColor("#FFFF00")
            .setTimestamp(),
        ],
      })
    } catch (error) {
      console.log("Could not DM user")
    }

    await interaction.reply({ content: `✅ ${user.tag} has been warned.`, flags: 64 })
  } catch (error) {
    console.error("Error warning user:", error)
    await interaction.reply({ content: "❌ Failed to warn user.", flags: 64 })
  }
}
