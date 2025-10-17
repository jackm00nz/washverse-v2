import { Client, GatewayIntentBits, Partials, Collection } from "discord.js"
import { config } from "dotenv"
import { initDatabase } from "./database/init.js"
import { registerCommands } from "./utils/register-commands.js"
import { loadCommands } from "./utils/load-commands.js"
import { startScheduledTasks } from "./utils/scheduled-tasks.js"

config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
})

client.commands = new Collection()

client.once("clientReady", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`)

  // Initialize database
  initDatabase()
  console.log("✅ Database initialized")

  // Load commands
  await loadCommands(client)
  console.log("✅ Commands loaded")

  // Register slash commands
  await registerCommands(client)
  console.log("✅ Slash commands registered")

  // Start scheduled tasks
  startScheduledTasks(client)
  console.log("✅ Scheduled tasks started")
})

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName)

    if (!command) return

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error)
      const reply = {
        content: "❌ There was an error executing this command.",
        flags: 64, // Ephemeral flag
      }

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply)
        } else {
          await interaction.reply(reply)
        }
      } catch (replyError) {
        console.error("Failed to send error message:", replyError)
      }
    }
  } else if (interaction.isButton()) {
    // Handle button interactions (suggestions, tickets, etc.)
    const [action, ...args] = interaction.customId.split("_")

    try {
      if (action === "suggestion") {
        const { handleSuggestionButton } = await import("./handlers/suggestion-handler.js")
        await handleSuggestionButton(interaction, args)
      } else if (action === "ticket") {
        const { handleTicketButton } = await import("./handlers/ticket-handler.js")
        await handleTicketButton(interaction, args)
      }
    } catch (error) {
      console.error("Error handling button interaction:", error)
      try {
        await interaction.reply({
          content: "❌ An error occurred while processing this action.",
          flags: 64, // Ephemeral flag
        })
      } catch (replyError) {
        console.error("Failed to send button error message:", replyError)
      }
    }
  }
})

client.login(process.env.DISCORD_BOT_TOKEN)
