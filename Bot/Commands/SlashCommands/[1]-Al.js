const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require("node:fs");

module.exports = {
    name: "al",
    commandData: new SlashCommandBuilder().setName("al").setDescription(`E-Devlet hesabi çikarir.`).addNumberOption(o => o.setName("sayi").setDescription("Kaç tane hesap çikarilacak?").setRequired(true)),
    async execute(client, int, embed) {

        let sayi = int.options.getNumber("sayi");
        if(sayi <= 0) return await int.followUp({ content: "Lütfen geçerli bir sayı giriniz.", ephemeral: true });

        const loglar = fs.readFileSync("./Checker/Edevlet/loglar.txt", "utf-8").split("\n");
        const usedLoglar = fs.readFileSync("./Checker/Edevlet/used.txt", "utf-8").split("\n");

        const hesaplar = loglar.filter(x => !usedLoglar.includes(x));
        if(!hesaplar.length > 0) return await int.followUp({ content: `Live hesap kalmadi.`, ephemeral: true });

        fs.writeFileSync("./Checker/Edevlet/used.txt", hesaplar.slice(0, sayi).concat(usedLoglar).join("\n"), "utf-8");

        const txt = new AttachmentBuilder(Buffer.from(hesaplar.slice(0, sayi).join("\n"), "utf-8"), { name: `${hesaplar.slice(0, sayi).length} E-Devlet.txt` });

        return await int.followUp({ content: `**${hesaplar.slice(0, sayi).length}** Hesap çiakrildi. Kalan live stogu: **${hesaplar.length - hesaplar.slice(0, sayi).length}**`, files: [txt], ephemeral: true });

    }
};