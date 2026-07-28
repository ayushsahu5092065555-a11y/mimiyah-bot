const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const { DisTube } = require("distube");
const { joinVoiceChannel } = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

// DisTube सेटिंग्स (नए v5 वर्ज़न के अनुसार)
const distube = new DisTube(client, {
  emitNewSongOnly: true,
});

// स्लैश कमांड्स
const commands = [
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("गाना बजाने के लिए (YouTube नाम या लिंक)")
    .addStringOption((option) =>
      option.setName("song").setDescription("गाने का नाम या लिंक").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("अगला गाना बजाओ"),
  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("म्यूजिक रोको"),
  new SlashCommandBuilder()
    .setName("twentyfour-seven")
    .setDescription("बॉट को वॉइस चैनल में 24/7 रखें"),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("Commands Registered!");
  } catch (error) {
    console.error(error);
  }
});

// कमांड्स हैंडलर
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options, member, guild, channel } = interaction;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: "❌ पहले किसी Voice Channel में जुड़ो!",
      ephemeral: true,
    });
  }

  if (commandName === "play") {
    const song = options.getString("song");
    await interaction.deferReply();
    try {
      await distube.play(voiceChannel, song, { textChannel: channel, member });
      await interaction.editReply(`🎶 **${song}** प्ले किया जा रहा है!`);
    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ गाना बजाने में दिक्कत आई!");
    }
  } else if (commandName === "skip") {
    try {
      await distube.skip(guild);
      await interaction.reply("⏭️ गाना स्किप कर दिया गया!");
    } catch (e) {
      await interaction.reply("❌ आगे कोई गाना नहीं है!");
    }
  } else if (commandName === "stop") {
    try {
      await distube.stop(guild);
      await interaction.reply("⏹️ म्यूजिक बंद कर दिया गया!");
    } catch (e) {
      await interaction.reply("❌ अभी कोई म्यूजिक नहीं चल रहा है!");
    }
  } else if (commandName === "twentyfour-seven") {
    try {
      joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });
      await interaction.reply(`🔒 बॉट अब **${voiceChannel.name}** में 24/7 रहेगा!`);
    } catch (e) {
      await interaction.reply("❌ कनेक्ट होने में दिक्कत आई!");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
