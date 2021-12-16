var dhikrId = Math.floor(Math.random() * 328) + 1;

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

// https://dua.gtaf.org/api/en/details/260