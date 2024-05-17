const { EmbedBuilder } = require("discord.js");
const config = require("../Settings/config");

module.exports = {
    name: "interactionCreate",
    async execute(int) {

        const client = int.client;
        let embed = new EmbedBuilder()
        .setTitle("E-Devlet Bot")
        .setFooter({ text: "E-Devlet Bot" })

        if(int.isChatInputCommand()) {

            await int.deferReply({ ephemeral: true });

            const command = client.slashCommands.get(int.commandName);
            if(!command) return;

            if(!config.owners.includes(int.user.id)) return await int.followUp({ content: "Bu komutu kullanmak için gerekli yetkiye sahip değilsin.", ephemeral: true });

            try {
                await command.execute(client, int, embed);
            } catch (error) {
                embed.setDescription(`Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz. Hata: ${error.message}`)
                await int.followUp({ embeds: [embed], ephemeral: true });
            }

        }

    }
};