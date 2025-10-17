import { REST, Routes } from "discord.js"
import { readdirSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function registerCommands(client) {
  const commands = []
  const commandsPath = join(__dirname, "../commands")
  const commandFolders = readdirSync(commandsPath)

  for (const folder of commandFolders) {
    const folderPath = join(commandsPath, folder)
    const commandFiles = readdirSync(folderPath).filter((file) => file.endsWith(".js"))

    for (const file of commandFiles) {
      const filePath = join(folderPath, file)
      const command = await import(`file://${filePath}`)

      if ("data" in command) {
        commands.push(command.data.toJSON())
      }
    }
  }

  const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN)

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    const data = await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), {
      body: commands,
    })

    console.log(`Successfully reloaded ${data.length} application (/) commands.`)
  } catch (error) {
    console.error("Error registering commands:", error)
  }
}
