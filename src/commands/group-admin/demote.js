import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { demoteUser } from "../../utils/roblox-api.js"
import { createHyraLog } from "../../utils/hyra-api.js"

export const data = new SlashCommandBuilder()
  .setName("demote")
  .setDescription("Demote a user in the ROBLOX group")
  .addStringOption((option) => option.setName("username").setDescription("ROBLOX username").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Reason for demotion").setRequired(true))
  .addStringOption((option) => option.setName("proof").setDescription("Proof (link or description)").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction) {
  const username = interaction.options.getString("username")
  const reason = interaction.options.getString("reason")
  const proof = interaction.options.getString("proof")

  await interaction.deferReply({ ephemeral: true })

  try {
    // Demote user in ROBLOX group
    await demoteUser(username)

    // Create Hyra log
    await createHyraLog("demote", username, reason, proof, interaction.user.tag)

    // Generate HR letter
    const hrLetter = `Dear ${username},

This letter is to inform you that you have been demoted in WashVerse.

**Reason:** ${reason}
**Evidence:** ${proof}

We expect you to learn from this experience and improve your performance. If you have any questions, please contact Human Resources.

Best regards,
WashVerse Human Resources`

    // Send letter to command runner's DMs
    await interaction.user.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📋 HR Letter - Demotion")
          .setDescription("Please send this message to the demoted user:")
          .addFields({ name: "Letter", value: hrLetter })
          .setColor("#FFA500")
          .setTimestamp(),
      ],
    })

    await interaction.editReply({
      content: `✅ ${username} has been demoted. HR letter sent to your DMs.`,
    })
  } catch (error) {
    console.error("Error demoting user:", error)
    await interaction.editReply({ content: "❌ Failed to demote user. Please check the username and try again." })
  }
}
