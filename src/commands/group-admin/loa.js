import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js"
import { db } from "../../database/init.js"

export const data = new SlashCommandBuilder()
  .setName("loa")
  .setDescription("Assign a Leave of Absence to a user")
  .addUserOption((option) => option.setName("user").setDescription("The user to assign LoA").setRequired(true))
  .addStringOption((option) => option.setName("start_date").setDescription("Start date (YYYY-MM-DD)").setRequired(true))
  .addStringOption((option) => option.setName("end_date").setDescription("End date (YYYY-MM-DD)").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("Reason for LoA").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export async function execute(interaction) {
  const user = interaction.options.getUser("user")
  const startDateStr = interaction.options.getString("start_date")
  const endDateStr = interaction.options.getString("end_date")
  const reason = interaction.options.getString("reason")

  await interaction.deferReply({ flags: 64 })

  try {
    const startDate = new Date(startDateStr).getTime()
    const endDate = new Date(endDateStr).getTime()

    if (isNaN(startDate) || isNaN(endDate)) {
      return interaction.editReply({ content: "❌ Invalid date format. Use YYYY-MM-DD." })
    }

    if (endDate <= startDate) {
      return interaction.editReply({ content: "❌ End date must be after start date." })
    }

    // Get ROBLOX username
    const verification = db.prepare("SELECT * FROM verification WHERE user_id = ?").get(user.id)
    if (!verification) {
      return interaction.editReply({ content: "❌ User is not verified. Please verify them first." })
    }

    // Assign LoA role
    const member = await interaction.guild.members.fetch(user.id)
    const loaRole = interaction.guild.roles.cache.find((r) => r.name === "Leave of Absence")

    if (!loaRole) {
      return interaction.editReply({ content: "❌ Leave of Absence role not found. Please create it first." })
    }

    await member.roles.add(loaRole)

    // Save to database
    db.prepare("INSERT INTO loa (user_id, roblox_username, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)").run(
      user.id,
      verification.roblox_username,
      startDate,
      endDate,
      reason,
    )

    // Generate HR letter for start
    const hrLetter = `Dear ${verification.roblox_username},

Your Leave of Absence request has been approved.

**Start Date:** ${startDateStr}
**End Date:** ${endDateStr}
**Reason:** ${reason}

During your leave, you will not be required to meet activity requirements. Your Leave of Absence role has been assigned and will be automatically removed on ${endDateStr}.

Best regards,
WashVerse Human Resources`

    // Send letter to HR member's DMs
    await interaction.user.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📋 HR Letter - Leave of Absence")
          .setDescription("Please send this message to the user:")
          .addFields({ name: "Letter", value: hrLetter })
          .setColor("#3498DB")
          .setTimestamp(),
      ],
    })

    await interaction.editReply({
      content: `✅ Leave of Absence assigned to ${user.tag}. HR letter sent to your DMs.`,
    })
  } catch (error) {
    console.error("Error assigning LoA:", error)
    await interaction.editReply({ content: "❌ Failed to assign Leave of Absence." })
  }
}
