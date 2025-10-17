import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { setRank } from "../../utils/roblox-api.js"
import { createHyraLog } from "../../utils/hyra-api.js"

export const data = new SlashCommandBuilder()
  .setName("terminate")
  .setDescription("Terminate a user in the ROBLOX group")
  .addStringOption((option) => option.setName("username").setDescription("ROBLOX username").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Reason for termination").setRequired(true))
  .addStringOption((option) => option.setName("proof").setDescription("Proof (link or description)").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction) {
  const username = interaction.options.getString("username")
  const reason = interaction.options.getString("reason")
  const proof = interaction.options.getString("proof")

  await interaction.deferReply({ flags: 64 })

  try {
    // Set rank to Customer
    await setRank(username, "Customer")

    // Create Hyra log
    await createHyraLog("terminate", username, reason, proof, interaction.user.tag)

    // Generate HR letter
    const hrLetter = `Dear ${username},

This letter is to inform you that your employment with WashVerse has been terminated.

**Reason:** ${reason}
**Evidence:** ${proof}

You have been ranked as Customer and are no longer part of the staff team. If you believe this decision was made in error, you may appeal through the proper channels.

Best regards,
WashVerse Human Resources`

    // Send letter to command runner's DMs
    await interaction.user.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📋 HR Letter - Termination")
          .setDescription("Please send this message to the terminated user:")
          .addFields({ name: "Letter", value: hrLetter })
          .setColor("#FF0000")
          .setTimestamp(),
      ],
    })

    await interaction.editReply({
      content: `✅ ${username} has been terminated. HR letter sent to your DMs.`,
    })
  } catch (error) {
    console.error("Error terminating user:", error)
    await interaction.editReply({ content: "❌ Failed to terminate user. Please check the username and try again." })
  }
}
