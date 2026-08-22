const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
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

// Slash Commands
const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('VC me aakar gaana bajaye')
    .addStringOption(option => 
      option.setName('song')
        .setDescription('Gaane ka naam ya YouTube link')
        .setRequired(true)),
  new SlashCommandBuilder().setName('pause').setDescription('Gaana roke'),
  new SlashCommandBuilder().setName('resume').setDescription('Gaana firse chalaye'),
  new SlashCommandBuilder().setName('stop').setDescription('Music band karke VC chhod de'),
  new SlashCommandBuilder().setName('help').setDescription('Music commands dekhe')
].map(command => command.toJSON());

// Slash Commands Register
client.once('ready', async () => {
  console.log(`Bot Online: ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('Slash Commands Registered!');
  } catch (error) {
    console.error(error);
  }
});

// Interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFB6C1')
      .setTitle('🌸 cutie† | Music Commands')
      .setDescription('• `/play <song>` - VC me aakar gaana bajaye\n• `/pause` - Gaana roke\n• `/resume` - Gaana wapas chalaye\n• `/stop` - VC chhod kar band ho jaye');
    return await interaction.reply({ embeds: [helpEmbed] });
  }

  if (commandName === 'play') {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return await interaction.reply({ content: '❌ Pehle kisi Voice Channel (VC) me join ho jao!', ephemeral: true });
    }

    await interaction.deferReply();
    const query = interaction.options.getString('song');

    try {
      // 1. Bot VC Join Karega
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

      // 2. Song Search aur Stream
      const searchResults = await play.search(query, { limit: 1 });
      if (!searchResults || searchResults.length === 0) {
        return await interaction.editReply('❌ Koi gaana nahi mila!');
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
      await interaction.editReply('❌ VC join karne ya gaana chalane me problem aayi! Check permissions.');
    }
  }

  else if (commandName === 'pause') {
    player.pause();
    await interaction.reply('⏸️ Gaana pause ho gaya!');
  }

  else if (commandName === 'resume') {
    player.unpause();
    await interaction.reply('▶️ Gaana firse start ho gaya!');
  }

  else if (commandName === 'stop') {
    player.stop();
    if (connection) connection.destroy();
    await interaction.reply('⏹️ Music band ho gaya aur bot VC se nikal gaya.');
  }
});

client.login(process.env.DISCORD_TOKEN);
  
