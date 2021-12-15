var dhikrs = [
    'Astagfirullah',
    'سُبْحَانَ اللّٰهِ',
    'اَللّٰهُ أَكْبَرُ',
    'رَبَّنَا لَا تُزِغۡ قُلُوۡبَنَا بَعۡدَ اِذۡ هَدَيۡتَنَا وَهَبۡ لَنَا مِنۡ لَّدُنۡكَ رَحۡمَةً‌ ۚاِنَّكَ اَنۡتَ الۡوَهَّابُ',
    'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّيْ كُنْتُ مِنَ الظَّالِمِيْنَ',
    'اَللّٰهُ، اَللّٰهُ رَبِّيْ لَا أُشْرِكُ بِهِ شَيْئًا',
    'اَللّٰهُمَّ إِنَّا نَجْعَلُكَ فِيْ نُحُوْرِهِم، وَنَعُوْذُ بِكَ مِنْ شُرُوْرِهِمْ',
    'حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيْلُ',
    'آمَنْتُ بِاللّٰهِ وَرُسُلِهِ',
    'اَللّٰهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلاً، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلاً'
];

var dhikr = dhikrs[Math.floor(Math.random() * dhikrs.length)]

$("#notifyMe").html(dhikr)

function notifyUser()
{
    var showNotification = {
        type: 'basic',
        iconUrl: 'icon/icon48.png',
        title: dhikr,
        message: "Wet your tounge with the remembrance of Allah"
    }
    
    const d = new Date();
    let time = d.getTime()
    remindDhikr = 'dhikr'+time
    chrome.notifications.create(remindDhikr,showNotification);
}
notifyUser()

// https://dua.gtaf.org/api/en/details/260