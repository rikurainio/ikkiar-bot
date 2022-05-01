const { SlashCommandBuilder } = require('@discordjs/builders');

const QUOTES = [
    "Minulla ei ole mitään peliriippuvuutta, USKO SE JO!!",
    "Voi perhanan perhana sun kanssas!",
    "JA NYT SINÄ PIDÄT TURPAS KIINNI!",
    "Mul on velkoja.",
    "LATAALATAALATAALATAA NOIN NOIN!!",
    "Haluutsä turpaas?",
    "Punanen, sehän on tunnetusti rakkauden väri!",
    "Mee vaikka jonku homon kans naimisiin, hankkikaa lapsia ja tehkää vielä niistäkin homoja!",
    "Ovi auki!! Ovi auki, tai tapahtuu hirveitä!!",
    "Mitä ihmettä se sua liikuttaa!?",
    "Luuseri mä oon ja sillä selvä",
    "Kyllähän mulla leikkaa omassakin nupissa.",
    "Nyt on Laitelan laiva uponnut..",
    "Sopii yrittää.. vai menikö homolta pupu pöksyyn.",
    "Sinne vaan.. muiden pervojen sekaan juhlimaan!",
    "Noniin! Aaaa! Chajajajajajajaja!!",
    "Noo, täähän oli vasta... alkulämmittelyä.",
    "Ih-hah-haa, ih-hah-haa, heevoohirrnaAHH..",
    "Mulla vaan jotenki päässä naksahti..",
    "Mulla vaan jotenki pimeni päässä..",
    "Laitetaan kaikki punaselle."
]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ismo')
		.setDescription('Ikkiar digs out one of his favorite ismo quotes'),
        
	async execute(interaction) {
        let messageContent = ''

        const max = QUOTES.length
        const random = Math.floor(Math.random() * max)
        messageContent = QUOTES[random]
        await interaction.reply(messageContent)
	},
};