import { SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
  .setName("add")
  .setDescription("Add a user to the ticket")
  .addUserOption((option) => option.setName("user").setDescription("User to add").setRequired(true))

export async function execute(interaction) {
  if (!interaction.channel.name.startsWith("ticket-")) {
    return interaction.reply({ content: "❌ This command can only be used in ticket channels.", flags: 64 })
  }

  const user = interaction.options.getUser("user")

  try {
    await interaction.channel.permissionOverwrites.create(user, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    })

    await interaction.reply({ content: `✅ ${user.tag} has been added to the ticket.`, flags: 64 })
  } catch (error) {
    console.error("Error adding user to ticket:", error)
    await interaction.reply({ content: "❌ Failed to add user to ticket.", flags: 64 })
  }
}
