const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) {
        return;
      }
      await command.execute(interaction);
      return;
    }

    if (!interaction.isButton()) {
      return;
    }
    const clickedWord = interaction.customId;

    await interaction.deferUpdate();

    const findCommand = interaction.client.commands.get("find");
    if (!findCommand || !findCommand.fetchAndFormatSynonyms) {
      return;
    }

    const synonyms = await findCommand.fetchAndFormatSynonyms(
      interaction.customId,
    );
    if (synonyms === null || synonyms.length === 0) {
      return;
    }

    const buttonsLimit = 5;
    const synonymsToDisplay = synonyms.slice(0, buttonsLimit);
    const row = new ActionRowBuilder();

    synonymsToDisplay.forEach((synonym) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(synonym)
          .setLabel(synonym.charAt(0).toUpperCase() + synonym.slice(1))
          .setStyle(ButtonStyle.Primary),
      );
    });

    if (row.components.length === 0) {
      return;
    }

    await interaction.editReply({
      content: `Synonyms for **${clickedWord}**:`,
      components: [row],
    });
  },
};
