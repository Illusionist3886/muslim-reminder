var dhikrId = Math.floor(Math.random() * 1) + 1;

var notificationData = gtafs[dhikrId];

// console.log(notificationData)
$('.title').html(notificationData.pageTitle)
$('.top').html(notificationData.details[0].top)
$('.arabic').html(notificationData.details[0].arabic)
$('.translation').html(notificationData.details[0].translation)
$('.bottom').html(notificationData.details[0].bottom)
$('.reference').html(notificationData.details[0].reference)

ramandaCounter()

// notifyUser()

function notifyUser()
{
    var showNotification = {
        type: 'basic',
        iconUrl: 'icon/icon48.png',
        title: 'dsfdsf',
        message: "Wet your tounge with the remembrance of Allah"
    }
    
    const d = new Date();
    let time = d.getTime()
    remindDhikr = 'dhikr'+time
    chrome.notifications.create(remindDhikr,showNotification);
}

// https://dua.gtaf.org/api/en/details/260

// Ramadan Reminder
function ramandaCounter()
{
  // Set the date we're counting down to
var countDownDate = new Date("Apr 1, 2022 17:00:00").getTime();
// Update the count down every 1 second
var x = setInterval(function() {
  // Get today's date and time
  var now = new Date().getTime();
  // Find the distance between now and the count down date
  var distance = countDownDate - now;
  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  // Display the result in the element with id="demo"
  $("#demo").html(days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ");
}, 1000);
}