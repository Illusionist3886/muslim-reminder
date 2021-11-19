var dhikrs = [
    'Astagfirullah',
    'SubhanAllah',
    'Alhamdulillah'
];

var dhikr = dhikrs[Math.floor(Math.random() * dhikrs.length)]




var showNotification = {
    type: 'basic',
    iconUrl: 'icon/icon48.png',
    title: dhikr,
    message: "Wet your tounge with the remembrance of Allah"
}

chrome.notifications.create('remindDhikr',showNotification);

$("#notifyMe").html(dhikr)

// https://dua.gtaf.org/api/en/details/260