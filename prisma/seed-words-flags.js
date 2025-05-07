const { PrismaClient } = require("../src/generated/prisma/client");
const prisma = new PrismaClient();

// Utility function to shuffle an array (Fisher-Yates shuffle)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Utility function to generate options with no repetition
function generateOptions(word) {
  const letters = word.toUpperCase().split('');
  const uniqueLetters = [...new Set(letters)]; // Ensure no duplicate letters from the word
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableDistractors = alphabet.filter(l => !uniqueLetters.includes(l));
  const distractors = shuffle(availableDistractors).slice(0, 8 - uniqueLetters.length);
  const options = shuffle([...uniqueLetters, ...distractors]).slice(0, 8); // Ensure exactly 8 unique options
  return options;
}

// Function to select random subset
function getRandomSubset(array, count) {
  const shuffled = shuffle([...array]);
  return shuffled.slice(0, count);
}

async function main() {
  // Delete all existing words linked to FlagsGame
  await prisma.word.deleteMany({
    where: { gameId: (await prisma.game.findUnique({ where: { name: "FlagsGame" } })).id },
  });

  // Fetch the FlagsGame
  const game = await prisma.game.findUnique({
    where: { name: "FlagsGame" },
  });

  if (!game) {
    throw new Error("FlagsGame not found. Please seed the game first.");
  }

  // Define all countries by continent
  const allCountries = [
    // America (52 countries from previous image)
    { answer: "ANGUILLA", image: "/images/flags/America/Anguilla.png", continent: "America" },
    { answer: "ANTIGUAANDBARBUDA", image: "/images/flags/America/Antigua and Barbuda.png", continent: "America" },
    { answer: "ARGENTINA", image: "/images/flags/America/Argentina.png", continent: "America" },
    { answer: "ARUBA", image: "/images/flags/America/Aruba.png", continent: "America" },
    { answer: "BARBADOS", image: "/images/flags/America/Barbados.png", continent: "America" },
    { answer: "BELIZE", image: "/images/flags/America/Belize.png", continent: "America" },
    { answer: "BERMUDA", image: "/images/flags/America/Bermuda.png", continent: "America" },
    { answer: "BOLIVIA", image: "/images/flags/America/Bolivia.png", continent: "America" },
    { answer: "BONAIRE", image: "/images/flags/America/Bonaire.png", continent: "America" },
    { answer: "BRAZIL", image: "/images/flags/America/Brazil.png", continent: "America" },
    { answer: "BRITISHVIRGINISLANDS", image: "/images/flags/America/British Virgin Islands.png", continent: "America" },
    { answer: "CANADA", image: "/images/flags/America/Canada.png", continent: "America" },
    { answer: "CAYMANISLANDS", image: "/images/flags/America/Cayman Islands.png", continent: "America" },
    { answer: "CHILE", image: "/images/flags/America/Chile.png", continent: "America" },
    { answer: "COLOMBIA", image: "/images/flags/America/Colombia.png", continent: "America" },
    { answer: "COSTARICA", image: "/images/flags/America/Costa Rica.png", continent: "America" },
    { answer: "CUBA", image: "/images/flags/America/Cuba.png", continent: "America" },
    { answer: "CURACAO", image: "/images/flags/America/Curaçao.png", continent: "America" },
    { answer: "DOMINICA", image: "/images/flags/America/Dominica.png", continent: "America" },
    { answer: "DOMINICANREPUBLIC", image: "/images/flags/America/Dominican Republic.png", continent: "America" },
    { answer: "ECUADOR", image: "/images/flags/America/Ecuador.png", continent: "America" },
    { answer: "ELSALVADOR", image: "/images/flags/America/El Salvador.png", continent: "America" },
    { answer: "FALKLANDISLANDS", image: "/images/flags/America/Falkland Islands.png", continent: "America" },
    { answer: "GREENLAND", image: "/images/flags/America/Greenland.png", continent: "America" },
    { answer: "GRENADA", image: "/images/flags/America/Grenada.png", continent: "America" },
    { answer: "GUATEMALA", image: "/images/flags/America/Guatemala.png", continent: "America" },
    { answer: "GUYANA", image: "/images/flags/America/Guyana.png", continent: "America" },
    { answer: "HAITI", image: "/images/flags/America/Haiti.png", continent: "America" },
    { answer: "HONDURAS", image: "/images/flags/America/Honduras.png", continent: "America" },
    { answer: "JAMAICA", image: "/images/flags/America/Jamaica.png", continent: "America" },
    { answer: "MEXICO", image: "/images/flags/America/Mexico.png", continent: "America" },
    { answer: "MONTSERRAT", image: "/images/flags/America/Montserrat.png", continent: "America" },
    { answer: "NICARAGUA", image: "/images/flags/America/Nicaragua.png", continent: "America" },
    { answer: "PANAMA", image: "/images/flags/America/Panama.png", continent: "America" },
    { answer: "PARAGUAY", image: "/images/flags/America/Paraguay.png", continent: "America" },
    { answer: "PERU", image: "/images/flags/America/Peru.png", continent: "America" },
    { answer: "PUERTORICO", image: "/images/flags/America/Puerto Rico.png", continent: "America" },
    { answer: "SABA", image: "/images/flags/America/Saba.png", continent: "America" },
    { answer: "SAINTKITTSANDNEVIS", image: "/images/flags/America/Saint Kitts and Nevis.png", continent: "America" },
    { answer: "SAINTLUCIA", image: "/images/flags/America/Saint Lucia.png", continent: "America" },
    { answer: "SAINTVINCENTANDTHEGRENADINES", image: "/images/flags/America/Saint Vincent and the Grenadines.png", continent: "America" },
    { answer: "SINTEUSTATIUS", image: "/images/flags/America/Sint Eustatius.png", continent: "America" },
    { answer: "SINTMAARTEN", image: "/images/flags/America/Sint Maarten.png", continent: "America" },
    { answer: "SOUTHGEORGIAANDTHESOUTHSANDWICHISLANDS", image: "/images/flags/America/South Georgia and the South Sandwich Islands.png", continent: "America" },
    { answer: "SURINAME", image: "/images/flags/America/Suriname.png", continent: "America" },
    { answer: "THEBAHAMAS", image: "/images/flags/America/The Bahamas.png", continent: "America" },
    { answer: "TRINIDADANDTOBAGO", image: "/images/flags/America/Trinidad and Tobago.png", continent: "America" },
    { answer: "TURKSANDCAICOSISLANDS", image: "/images/flags/America/Turks and Caicos Islands.png", continent: "America" },
    { answer: "USVIRGINISLANDS", image: "/images/flags/America/U.S. Virgin Islands.png", continent: "America" },
    { answer: "URUGUAY", image: "/images/flags/America/Uruguay.png", continent: "America" },
    { answer: "USA", image: "/images/flags/America/USA.png", continent: "America" },
    { answer: "VENEZUELA", image: "/images/flags/America/Venezuela.png", continent: "America" },
    // Africa (47 countries from previous image)
    { answer: "ALGERIA", image: "/images/flags/Africa/Algeria.png", continent: "Africa" },
    { answer: "ANGOLA", image: "/images/flags/Africa/Angola.png", continent: "Africa" },
    { answer: "BENIN", image: "/images/flags/Africa/Benin.png", continent: "Africa" },
    { answer: "BOTSWANA", image: "/images/flags/Africa/Botswana.png", continent: "Africa" },
    { answer: "BURKINAFSO", image: "/images/flags/Africa/Burkina Faso.png", continent: "Africa" },
    { answer: "BURUNDI", image: "/images/flags/Africa/Burundi.png", continent: "Africa" },
    { answer: "CAMEROON", image: "/images/flags/Africa/Cameroon.png", continent: "Africa" },
    { answer: "CAPEVERDE", image: "/images/flags/Africa/Cape Verde.png", continent: "Africa" },
    { answer: "CENTRALAFRICANREPUBLIC", image: "/images/flags/Africa/Central African Republic.png", continent: "Africa" },
    { answer: "CHAD", image: "/images/flags/Africa/Chad.png", continent: "Africa" },
    { answer: "COMOROS", image: "/images/flags/Africa/Comoros.png", continent: "Africa" },
    { answer: "DEMOCRATICREPUBLICOFTHECONGO", image: "/images/flags/Africa/Democratic Republic of the Congo.png", continent: "Africa" },
    { answer: "DJIBOUTI", image: "/images/flags/Africa/Djibouti.png", continent: "Africa" },
    { answer: "EGYPT", image: "/images/flags/Africa/Egypt.png", continent: "Africa" },
    { answer: "EQUATORIALGUINEA", image: "/images/flags/Africa/Equatorial Guinea.png", continent: "Africa" },
    { answer: "ERITREA", image: "/images/flags/Africa/Eritrea.png", continent: "Africa" },
    { answer: "ESWATINI", image: "/images/flags/Africa/Eswatini.png", continent: "Africa" },
    { answer: "ETHIOPIA", image: "/images/flags/Africa/Ethiopia.png", continent: "Africa" },
    { answer: "GABON", image: "/images/flags/Africa/Gabon.png", continent: "Africa" },
    { answer: "GAMBIA", image: "/images/flags/Africa/Gambia.png", continent: "Africa" },
    { answer: "GHANA", image: "/images/flags/Africa/Ghana.png", continent: "Africa" },
    { answer: "GUINEA", image: "/images/flags/Africa/Guinea.png", continent: "Africa" },
    { answer: "GUINEABISSAU", image: "/images/flags/Africa/Guinea-Bissau.png", continent: "Africa" },
    { answer: "IVORYCOAST", image: "/images/flags/Africa/Ivory Coast.png", continent: "Africa" },
    { answer: "KENYA", image: "/images/flags/Africa/Kenya.png", continent: "Africa" },
    { answer: "LESOTHO", image: "/images/flags/Africa/Lesotho.png", continent: "Africa" },
    { answer: "LIBERIA", image: "/images/flags/Africa/Liberia.png", continent: "Africa" },
    { answer: "LIBYA", image: "/images/flags/Africa/Libya.png", continent: "Africa" },
    { answer: "MADAGASCAR", image: "/images/flags/Africa/Madagascar.png", continent: "Africa" },
    { answer: "MALAWI", image: "/images/flags/Africa/Malawi.png", continent: "Africa" },
    { answer: "MALI", image: "/images/flags/Africa/Mali.png", continent: "Africa" },
    { answer: "MAURITANIA", image: "/images/flags/Africa/Mauritania.png", continent: "Africa" },
    { answer: "MAURITIUS", image: "/images/flags/Africa/Mauritius.png", continent: "Africa" },
    { answer: "MOROCCO", image: "/images/flags/Africa/Morocco.png", continent: "Africa" },
    { answer: "MOZAMBIQUE", image: "/images/flags/Africa/Mozambique.png", continent: "Africa" },
    { answer: "NAMIBIA", image: "/images/flags/Africa/Namibia.png", continent: "Africa" },
    { answer: "NIGER", image: "/images/flags/Africa/Niger.png", continent: "Africa" },
    { answer: "NIGERIA", image: "/images/flags/Africa/Nigeria.png", continent: "Africa" },
    { answer: "REPUBLICOFTHECONGO", image: "/images/flags/Africa/Republic of the Congo.png", continent: "Africa" },
    { answer: "RWANDA", image: "/images/flags/Africa/Rwanda.png", continent: "Africa" },
    { answer: "SAHRAWIARABDEMOCRATICREPUBLIC", image: "/images/flags/Africa/Sahrawi Arab Democratic Republic.png", continent: "Africa" },
    { answer: "SAOTOMEANDPRINCIPE", image: "/images/flags/Africa/São Tomé and Príncipe.png", continent: "Africa" },
    { answer: "SENEGAL", image: "/images/flags/Africa/Senegal.png", continent: "Africa" },
    { answer: "SEYCHELLES", image: "/images/flags/Africa/Seychelles.png", continent: "Africa" },
    { answer: "SIERRALEONE", image: "/images/flags/Africa/Sierra Leone.png", continent: "Africa" },
    { answer: "SOMALIA", image: "/images/flags/Africa/Somalia.png", continent: "Africa" },
    { answer: "SOUTHAFRICA", image: "/images/flags/Africa/South Africa.png", continent: "Africa" },
    { answer: "SOUTHSUDAN", image: "/images/flags/Africa/South Sudan.png", continent: "Africa" },
    { answer: "SUDAN", image: "/images/flags/Africa/Sudan.png", continent: "Africa" },
    { answer: "TANZANIA", image: "/images/flags/Africa/Tanzania.png", continent: "Africa" },
    { answer: "TOGO", image: "/images/flags/Africa/Togo.png", continent: "Africa" },
    { answer: "TUNISIA", image: "/images/flags/Africa/Tunisia.png", continent: "Africa" },
    { answer: "UGANDA", image: "/images/flags/Africa/Uganda.png", continent: "Africa" },
    { answer: "ZAMBIA", image: "/images/flags/Africa/Zambia.png", continent: "Africa" },
    { answer: "ZIMBABWE", image: "/images/flags/Africa/Zimbabwe.png", continent: "Africa" },
    // Asia (41 countries from previous image)
    { answer: "AFGHANISTAN", image: "/images/flags/Asia/Afghanistan.png", continent: "Asia" },
    { answer: "ARMENIA", image: "/images/flags/Asia/Armenia.png", continent: "Asia" },
    { answer: "AZERBAIJAN", image: "/images/flags/Asia/Azerbaijan.png", continent: "Asia" },
    { answer: "BAHRAIN", image: "/images/flags/Asia/Bahrain.png", continent: "Asia" },
    { answer: "BANGLADESH", image: "/images/flags/Asia/Bangladesh.png", continent: "Asia" },
    { answer: "BHUTAN", image: "/images/flags/Asia/Bhutan.png", continent: "Asia" },
    { answer: "BRUNEI", image: "/images/flags/Asia/Brunei.png", continent: "Asia" },
    { answer: "CAMBODIA", image: "/images/flags/Asia/Cambodia.png", continent: "Asia" },
    { answer: "CHINA", image: "/images/flags/Asia/China.png", continent: "Asia" },
    { answer: "CYPRUS", image: "/images/flags/Asia/Cyprus.png", continent: "Asia" },
    { answer: "EGYPT", image: "/images/flags/Asia/Egypt.png", continent: "Asia" },
    { answer: "GEORGIA", image: "/images/flags/Asia/Georgia.png", continent: "Asia" },
    { answer: "INDIA", image: "/images/flags/Asia/India.png", continent: "Asia" },
    { answer: "INDONESIA", image: "/images/flags/Asia/Indonesia.png", continent: "Asia" },
    { answer: "IRAN", image: "/images/flags/Asia/Iran.png", continent: "Asia" },
    { answer: "IRAQ", image: "/images/flags/Asia/Iraq.png", continent: "Asia" },
    { answer: "ISLAMICEMIRATEOFAFGHANISTAN", image: "/images/flags/Asia/Islamic Emirate of Afghanistan.png", continent: "Asia" },
    { answer: "ISRAEL", image: "/images/flags/Asia/Israel.png", continent: "Asia" },
    { answer: "JAPAN", image: "/images/flags/Asia/Japan.png", continent: "Asia" },
    { answer: "JORDAN", image: "/images/flags/Asia/Jordan.png", continent: "Asia" },
    { answer: "KAZAKHSTAN", image: "/images/flags/Asia/Kazakhstan.png", continent: "Asia" },
    { answer: "KUWAIT", image: "/images/flags/Asia/Kuwait.png", continent: "Asia" },
    { answer: "KYRGYZSTAN", image: "/images/flags/Asia/Kyrgyzstan.png", continent: "Asia" },
    { answer: "LAOS", image: "/images/flags/Asia/Laos.png", continent: "Asia" },
    { answer: "LEBANON", image: "/images/flags/Asia/Lebanon.png", continent: "Asia" },
    { answer: "MALAYSIA", image: "/images/flags/Asia/Malaysia.png", continent: "Asia" },
    { answer: "MALDIVES", image: "/images/flags/Asia/Maldives.png", continent: "Asia" },
    { answer: "MONGOLIA", image: "/images/flags/Asia/Mongolia.png", continent: "Asia" },
    { answer: "MYANMAR", image: "/images/flags/Asia/Myanmar.png", continent: "Asia" },
    { answer: "NEPAL", image: "/images/flags/Asia/Nepal.png", continent: "Asia" },
    { answer: "NORTHKOREA", image: "/images/flags/Asia/North Korea.png", continent: "Asia" },
    { answer: "OMAN", image: "/images/flags/Asia/Oman.png", continent: "Asia" },
    { answer: "PAKISTAN", image: "/images/flags/Asia/Pakistan.png", continent: "Asia" },
    { answer: "PALESTINE", image: "/images/flags/Asia/Palestine.png", continent: "Asia" },
    { answer: "PHILIPPINES", image: "/images/flags/Asia/Philippines.png", continent: "Asia" },
    { answer: "QATAR", image: "/images/flags/Asia/Qatar.png", continent: "Asia" },
    { answer: "SAUDIARABIA", image: "/images/flags/Asia/Saudi Arabia.png", continent: "Asia" },
    { answer: "SINGAPORE", image: "/images/flags/Asia/Singapore.png", continent: "Asia" },
    { answer: "SOUTHKOREA", image: "/images/flags/Asia/South Korea.png", continent: "Asia" },
    { answer: "SRILANKA", image: "/images/flags/Asia/Sri Lanka.png", continent: "Asia" },
    { answer: "SYRIA", image: "/images/flags/Asia/Syria.png", continent: "Asia" },
    { answer: "TAIWAN", image: "/images/flags/Asia/Taiwan.png", continent: "Asia" },
    { answer: "TAJIKISTAN", image: "/images/flags/Asia/Tajikistan.png", continent: "Asia" },
    { answer: "THAILAND", image: "/images/flags/Asia/Thailand.png", continent: "Asia" },
    { answer: "TIMORLESTE", image: "/images/flags/Asia/Timor-Leste.png", continent: "Asia" },
    { answer: "TURKEY", image: "/images/flags/Asia/Turkey.png", continent: "Asia" },
    { answer: "TURKMENISTAN", image: "/images/flags/Asia/Turkmenistan.png", continent: "Asia" },
    { answer: "UNITEDARABEMIRATES", image: "/images/flags/Asia/United Arab Emirates.png", continent: "Asia" },
    { answer: "UZBEKISTAN", image: "/images/flags/Asia/Uzbekistan.png", continent: "Asia" },
    { answer: "VIETNAM", image: "/images/flags/Asia/Vietnam.png", continent: "Asia" },
    { answer: "YEMEN", image: "/images/flags/Asia/Yemen.png", continent: "Asia" },
    // Europe (42 countries from the image)
    { answer: "ALANDISLANDS", image: "/images/flags/Europe/Åland Islands.png", continent: "Europe" },
    { answer: "ALBANIA", image: "/images/flags/Europe/Albania.png", continent: "Europe" },
    { answer: "ANDORRA", image: "/images/flags/Europe/Andorra.png", continent: "Europe" },
    { answer: "AUSTRIA", image: "/images/flags/Europe/Austria.png", continent: "Europe" },
    { answer: "BELARUS", image: "/images/flags/Europe/Belarus.png", continent: "Europe" },
    { answer: "BELGIUM", image: "/images/flags/Europe/Belgium.png", continent: "Europe" },
    { answer: "BOSNIAANDHERZEGOVINA", image: "/images/flags/Europe/Bosnia and Herzegovina.png", continent: "Europe" },
    { answer: "BULGARIA", image: "/images/flags/Europe/Bulgaria.png", continent: "Europe" },
    { answer: "CROATIA", image: "/images/flags/Europe/Croatia.png", continent: "Europe" },
    { answer: "CYPRUS", image: "/images/flags/Europe/Cyprus.png", continent: "Europe" },
    { answer: "CZECHREPUBLIC", image: "/images/flags/Europe/Czech Republic.png", continent: "Europe" },
    { answer: "DENMARK", image: "/images/flags/Europe/Denmark.png", continent: "Europe" },
    { answer: "ESTONIA", image: "/images/flags/Europe/Estonia.png", continent: "Europe" },
    { answer: "FAROEISLANDS", image: "/images/flags/Europe/Faroe Islands.png", continent: "Europe" },
    { answer: "FINLAND", image: "/images/flags/Europe/Finland.png", continent: "Europe" },
    { answer: "FRANCE", image: "/images/flags/Europe/France.png", continent: "Europe" },
    { answer: "GERMANY", image: "/images/flags/Europe/Germany.png", continent: "Europe" },
    { answer: "GIBRALTAR", image: "/images/flags/Europe/Gibraltar.png", continent: "Europe" },
    { answer: "GREECE", image: "/images/flags/Europe/Greece.png", continent: "Europe" },
    { answer: "GUERNSEY", image: "/images/flags/Europe/Guernsey.png", continent: "Europe" },
    { answer: "HUNGARY", image: "/images/flags/Europe/Hungary.png", continent: "Europe" },
    { answer: "ICELAND", image: "/images/flags/Europe/Iceland.png", continent: "Europe" },
    { answer: "IRELAND", image: "/images/flags/Europe/Ireland.png", continent: "Europe" },
    { answer: "ISLEOFMAN", image: "/images/flags/Europe/Isle of Man.png", continent: "Europe" },
    { answer: "ITALY", image: "/images/flags/Europe/Italy.png", continent: "Europe" },
    { answer: "JERSEY", image: "/images/flags/Europe/Jersey.png", continent: "Europe" },
    { answer: "KOSOVO", image: "/images/flags/Europe/Kosovo.png", continent: "Europe" },
    { answer: "LATVIA", image: "/images/flags/Europe/Latvia.png", continent: "Europe" },
    { answer: "LIECHTENSTEIN", image: "/images/flags/Europe/Liechtenstein.png", continent: "Europe" },
    { answer: "LITHUANIA", image: "/images/flags/Europe/Lithuania.png", continent: "Europe" },
    { answer: "LUXEMBOURG", image: "/images/flags/Europe/Luxembourg.png", continent: "Europe" },
    { answer: "MALTA", image: "/images/flags/Europe/Malta.png", continent: "Europe" },
    { answer: "MOLDOVA", image: "/images/flags/Europe/Moldova.png", continent: "Europe" },
    { answer: "MONACO", image: "/images/flags/Europe/Monaco.png", continent: "Europe" },
    { answer: "MONTENEGRO", image: "/images/flags/Europe/Montenegro.png", continent: "Europe" },
    { answer: "NETHERLANDS", image: "/images/flags/Europe/Netherlands.png", continent: "Europe" },
    { answer: "NORTHMACEDONIA", image: "/images/flags/Europe/North Macedonia.png", continent: "Europe" },
    { answer: "NORWAY", image: "/images/flags/Europe/Norway.png", continent: "Europe" },
    { answer: "POLAND", image: "/images/flags/Europe/Poland.png", continent: "Europe" },
    { answer: "PORTUGAL", image: "/images/flags/Europe/Portugal.png", continent: "Europe" },
    { answer: "ROMANIA", image: "/images/flags/Europe/Romania.png", continent: "Europe" },
    { answer: "RUSSIA", image: "/images/flags/Europe/Russia.png", continent: "Europe" },
    { answer: "SANMARINO", image: "/images/flags/Europe/San Marino.png", continent: "Europe" },
    { answer: "SERBIA", image: "/images/flags/Europe/Serbia.png", continent: "Europe" },
    { answer: "SLOVAKIA", image: "/images/flags/Europe/Slovakia.png", continent: "Europe" },
    { answer: "SLOVENIA", image: "/images/flags/Europe/Slovenia.png", continent: "Europe" },
    { answer: "SPAIN", image: "/images/flags/Europe/Spain.png", continent: "Europe" },
    { answer: "SWEDEN", image: "/images/flags/Europe/Sweden.png", continent: "Europe" },
    { answer: "SWITZERLAND", image: "/images/flags/Europe/Switzerland.png", continent: "Europe" },
    { answer: "UKRAINE", image: "/images/flags/Europe/Ukraine.png", continent: "Europe" },
    { answer: "UNITEDKINGDOM", image: "/images/flags/Europe/United Kingdom.png", continent: "Europe" },
    { answer: "VATICANCITY", image: "/images/flags/Europe/Vatican City.png", continent: "Europe" },
  ];

  // Select random subsets (12 from each continent)
  const americaCountries = getRandomSubset(
    allCountries.filter(c => c.continent === "America"),
    12
  );
  const africaCountries = getRandomSubset(
    allCountries.filter(c => c.continent === "Africa"),
    12
  );
  const asiaCountries = getRandomSubset(
    allCountries.filter(c => c.continent === "Asia"),
    12
  );
  const europeCountries = getRandomSubset(
    allCountries.filter(c => c.continent === "Europe"),
    12
  );

  // Combine all selected countries
  const selectedCountries = [...americaCountries, ...africaCountries, ...asiaCountries, ...europeCountries];

  // Shuffle the selected countries for random level assignment
  const shuffledCountries = shuffle(allCountries);

  // Generate word data with levels
  const wordData = shuffledCountries.map((country, index) => ({
    answer: country.answer,
    image: country.image,
    options: generateOptions(country.answer),
    level: index + 1, // Levels 1 to 48
    gameId: game.id,
  }));

  // Seed the words
  await prisma.word.createMany({
    data: wordData,
    skipDuplicates: true,
  });

  console.log("Flag words seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding flag words:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });