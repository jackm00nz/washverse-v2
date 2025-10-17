import { SlashCommandBuilder, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"
import { hasPermission } from "../../utils/permissions.js"

export const data = new SlashCommandBuilder()
  .setName("assignrep")
  .setDescription("Assign a representative to an alliance")
  .addUserOption((option) => option.setName("user").setDescription("User to assign").setRequired(true))
  .addStringOption((option) => option.setName("group").setDescription("Group name").setRequired(true))

export async function execute(interaction) {
  if (!hasPermission(interaction.member, "ADMINISTRATIVE_STAFF")) {
    return interaction.reply({
      content: "❌ You do not have permission to use this command. Required rank: Administrative Staff or higher.",
      flags: 64,
    })
  }

  const user = interaction.options.getUser("user")
  const groupName = interaction.options.getString("group")

  // Get alliance from database
  const alliance = db.prepare("SELECT * FROM alliances WHERE group_name = ?").get(groupName)

  if (!alliance) {
    return interaction.reply({ content: `❌ Alliance "${groupName}" not found.`, flags: 64 })
  }

  // Update representatives
  const currentReps = alliance.representatives ? alliance.representatives.split(", ") : []
  if (!currentReps.includes(user.tag)) {
    currentReps.push(user.tag)
  }

  db.prepare("UPDATE alliances SET representatives = ? WHERE group_name = ?").run(currentReps.join(", "), groupName)

  // Send info to representative
  const embed = new EmbedBuilder()
    .setTitle("🤝 Representative Assignment")
    .setDescription(`You have been assigned as a representative for **${groupName}**`)
    .addFields(
      { name: "Group Link", value: alliance.group_link },
      { name: "Server Link", value: alliance.server_link || "Not provided" },
    )
    .setColor("#00FF00")
    .setTimestamp()

  try {
    await user.send({ embeds: [embed] })
  } catch (error) {
    console.error("Error sending DM:", error)
  }

  await interaction.reply({ content: `✅ ${user.tag} assigned as representative for ${groupName}!`, flags: 64 })
}
