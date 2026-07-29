const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// स्लैश कमांड्स की लिस्ट
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("बॉट का रिस्पॉन्स टाइम चेक करें"),
  new SlashCommandBuilder()
    .setName("hi")
    .setDescription("Cutie को हैलो बोलें!"),
  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("अपनी या किसी यूजर की प्रोफाइल फोटो देखें")
    .addUserOption((option) =>
      option.setName("user").setDescription("किसकी डीपी देखनी है?").setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("बॉट से कोई मैसेज बुलवाएं")
    .addStringOption((option) =>
      option.setName("message").setDescription("क्या बुलवाना है?").setRequired(true)
    ),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("All New Slash Commands Registered!");
  } catch (error) {
    console.error(error);
  }
});

// कमांड्स हैंडलर
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "ping") {
    await interaction.reply(`🏓 Pong! Latency is **${client.ws.ping}ms**.`);
  } else if (commandName === "hi") {
    await interaction.reply("Hello! I am Cutie 🤖, how can I help you today?");
  } else if (commandName === "avatar") {
    const targetUser = options.getUser("user") || interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Avatar`)
      .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
      .setColor("#FF69B4");

    await interaction.reply({ embeds: [embed] });
  } else if (commandName === "say") {
    const text = options.getString("message");
    await interaction.reply({ content: text });
  }
});

client.login(process.env.DISCORD_TOKEN);
