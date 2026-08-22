const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const player = createAudioPlayer();
let connection = null;

const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('VC me aakar gaana bajaye')
    .addStringOption(option => 
      option.setName('song')
        .setDescription('Gaane ka naam')
        .setRequired(true)),
  new SlashCommandBuilder().setName('pause').setDescription('Gaana roke'),
  new SlashCommandBuilder().setName('resume').setDescription('Gaana firse chalaye'),
  new SlashCommandBuilder().setName('stop').setDescription('Music band karke VC chhod de'),
  new SlashCommandBuilder().setName('help').setDescription('Commands list dekhe')
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`Bot Online: ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Commands synced successfully!');
  } catch (err) {
    console.error(err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // Discord ke 3-second timeout ko rokne ke liye
  await interaction.deferReply().catch(() => {});

  const { commandName } = interaction;

  if (commandName === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFB6C1')
      .setTitle('🌸 cutie† | Music Commands')
      .setDescription('• `/play <song>` - VC me gaana chalaye\n• `/pause` - Gaana roke\n• `/resume` - Gaana wapas chalaye\n• `/stop` - VC chhod kar nikle');
    return await interaction.editReply({ embeds: [helpEmbed] });
  }

  if (commandName === 'play') {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return await interaction.editReply('❌ Pehle kisi Voice Channel (VC) me join ho jao!');
    }

    const query = interaction.options.getString('song');

    try {
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 15_000);

      const searchResults = await play.search(query, { limit: 1 });
      if (!searchResults || searchResults.length === 0) {
        return await interaction.editReply('❌ Gaana nahi mila!');
      }

      const songInfo = searchResults[0];
      const stream = await play.stream(songInfo.url);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);
      connection.subscribe(player);

      await interaction.editReply(`🎶 **Playing:** \`${songInfo.title}\` in **${voiceChannel.name}** 🎧`);
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Audio load nahi ho payi. Dobara try karo!');
    }
  }

  else if (commandName === 'pause') {
    player.pause();
    await interaction.editReply('⏸️ Gaana pause ho gaya!');
  }

  else if (commandName === 'resume') {
    player.unpause();
    await interaction.editReply('▶️ Gaana firse shuru ho gaya!');
  }

  else if (commandName === 'stop') {
    player.stop();
    if (connection) {
      connection.destroy();
      connection = null;
    }
    await interaction.editReply('⏹️ Bot VC se nikal gaya!');
  }
});

client.login(process.env.DISCORD_TOKEN);
