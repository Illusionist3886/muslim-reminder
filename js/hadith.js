// Map collection name -> sunnah.com slug. Collections not on sunnah.com
// (e.g. Al-Hakim) are omitted and render as plain text.
var SUNNAH_SLUGS = {
  bukhari: "bukhari",
  muslim: "muslim",
  tirmidhi: "tirmidhi",
  "abu dawud": "abudawud",
  abudawud: "abudawud",
  "ibn majah": "ibnmajah",
  ibnmajah: "ibnmajah",
  "nasa'i": "nasai",
  nasai: "nasai",
};

// "Bukhari: 1; Muslim: 1907" -> linked spans pointing at sunnah.com.
function hadithRefToLinks(ref) {
  return String(ref || "")
    .split(";")
    .map(function (part) {
      var m = part.match(/^\s*(.+?):?\s*([0-9]+)\s*$/);
      var slug = m && SUNNAH_SLUGS[m[1].trim().toLowerCase()];
      if (!slug) {
        return part.trim();
      }
      var url = "https://sunnah.com/" + slug + ":" + m[2];
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + part.trim() + "</a>";
    })
    .join("; ");
}

// Motivation Wall hadith collection. Add more objects to grow the wall.
var hadiths = [
  {
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    english: "Actions are but by intention, and every man shall have only that which he intended.",
    reference: "Bukhari: 1; Muslim: 1907",
  },
  {
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    english: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    reference: "Bukhari: 6018; Muslim: 47",
  },
  {
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    english: "The Muslim is the one from whose tongue and hand the Muslims are safe.",
    reference: "Bukhari: 10; Muslim: 40",
  },
  {
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    english: "None of you truly believes until he loves for his brother what he loves for himself.",
    reference: "Bukhari: 13; Muslim: 45",
  },
  {
    arabic: "مَنْ لَا يَرْحَمُ النَّاسَ لَا يَرْحَمُهُ اللَّهُ",
    english: "He who does not show mercy to people, Allah will not show mercy to him.",
    reference: "Bukhari: 7376; Muslim: 2319",
  },
  {
    arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا",
    english: "Fear Allah wherever you are, and follow a bad deed with a good one to wipe it out.",
    reference: "Tirmidhi: 1987",
  },
  {
    arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ",
    english: "Cleanliness is half of faith.",
    reference: "Muslim: 223",
  },
  {
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    english: "Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise.",
    reference: "Muslim: 2699",
  },
  {
    arabic: "لَا تَغْضَبْ",
    english: "Do not become angry.",
    reference: "Bukhari: 6116",
  },
  {
    arabic: "مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ",
    english: "Part of a person's being a good Muslim is his leaving alone that which does not concern him.",
    reference: "Tirmidhi: 2317",
  },
  {
    arabic: "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ",
    english: "There are two blessings which many people lose: health and free time.",
    reference: "Bukhari: 6412",
  },
  {
    arabic: "مَنْ أَصْبَحَ مِنْكُمْ آمِنًا فِي سِرْبِهِ، مُعَافًى فِي جَسَدِهِ، عِنْدَهُ قُوتُ يَوْمِهِ، فَكَأَنَّمَا حِيزَتْ لَهُ الدُّنْيَا",
    english: "Whoever among you wakes up secure in his dwelling, healthy in his body, and has his food for the day, it is as if the whole world has been gathered for him.",
    reference: "Tirmidhi: 2346",
  },
  {
    arabic: "اغْتَنِمْ خَمْسًا قَبْلَ خَمْسٍ: شَبَابَكَ قَبْلَ هَرَمِكَ، وَصِحَّتَكَ قَبْلَ سَقَمِكَ، وَغِنَاكَ قَبْلَ فَقْرِكَ، وَفَرَاغَكَ قَبْلَ شُغْلِكَ، وَحَيَاتَكَ قَبْلَ مَوْتِكَ",
    english: "Take advantage of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your busyness, and your life before your death.",
    reference: "Al-Hakim: 7846",
  },
  {
    arabic: "قَسَمْتُ الصَّلَاةَ بَيْنِي وَبَيْنَ عَبْدِي نِصْفَيْنِ، وَلِعَبْدِي مَا سَأَلَ. إِذَا قَالَ: ﴿الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ﴾ قَالَ اللَّهُ: حَمِدَنِي عَبْدِي. وَإِذَا قَالَ: ﴿الرَّحْمَٰنِ الرَّحِيمِ﴾ قَالَ: أَثْنَى عَلَيَّ عَبْدِي. وَإِذَا قَالَ: ﴿مَالِكِ يَوْمِ الدِّينِ﴾ قَالَ: مَجَّدَنِي عَبْدِي. وَإِذَا قَالَ: ﴿إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ﴾ قَالَ: هَٰذَا بَيْنِي وَبَيْنَ عَبْدِي وَلِعَبْدِي مَا سَأَلَ. وَإِذَا قَالَ: ﴿اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ...﴾ قَالَ: هَٰذَا لِعَبْدِي وَلِعَبْدِي مَا سَأَلَ",
    english: "Allah said: I have divided the prayer between Myself and My servant into two halves, and My servant shall have what he asks for. When he says 'All praise is for Allah, Lord of the worlds,' Allah says: My servant has praised Me. When he says 'The Most Gracious, the Most Merciful,' Allah says: My servant has extolled Me. When he says 'Master of the Day of Judgement,' Allah says: My servant has glorified Me. When he says 'You alone we worship, and You alone we ask for help,' Allah says: This is between Me and My servant, and My servant shall have what he asks. When he says 'Guide us to the straight path...,' Allah says: This is for My servant, and My servant shall have what he asks for.",
    reference: "Muslim: 395",
  },
];
