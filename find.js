const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const fetch = require("node-fetch");

async function fetchAndFormatSynonyms(wordToFind) {
  const prompt = `5 synonyms for "${wordToFind}" separated by |, and on 1 line, no additional text`;

  const response = await fetch("https://ai.hackclub.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  let aiResponseContent = await response
    .json()
    .then((data) => data.choices[0]?.message?.content);

  if (!aiResponseContent) {
    return [];
  }

  aiResponseContent = aiResponseContent.toLowerCase();
  aiResponseContent = aiResponseContent.replace(/[\r\n]+/g, " ").trim();
  aiResponseContent = aiResponseContent.replace(/[^a-z|\s-]/g, "");
  aiResponseContent = aiResponseContent.replace(/\s*\|\s*/g, "|");
  aiResponseContent = aiResponseContent.replace(/^\|+|\|+$/g, "");

  const synonymsArray = aiResponseContent
    .split("|")
    .filter((s) => s.trim() !== "");

  return synonymsArray;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("find")
    .setDescription("Find synonyms for a word")
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("The word you are looking synonyms for")
        .setRequired(true),
    ),
  async execute(interaction) {
    const wordToFind = interaction.options.getString("word");

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const synonyms = await fetchAndFormatSynonyms(wordToFind);
    if (synonyms.length === 0 || synonyms === null) {
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
      content: `Synonyms for **${wordToFind}**:`,
      components: [row],
    });
  },

  fetchAndFormatSynonyms: fetchAndFormatSynonyms,
};
