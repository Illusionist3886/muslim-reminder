var dhikrId = Math.floor(Math.random() * dhikrs.length) + 1;

// var notificationData = gtafs[dhikrId];
var notificationData = dhikrs[dhikrId];

// $('.title').html(notificationData.pageTitle)
// $('.top').html(notificationData.details[0].top)
// $('.arabic').html(notificationData.details[0].arabic)
// $('.translation').html(notificationData.details[0].translation)
// $('.bottom').html(notificationData.details[0].bottom)
// $('.reference').html(notificationData.details[0].reference)



$('.title').html(notificationData.title)
// $('.top').html(notificationData.details[0].top)
$('.arabic').html(notificationData.arabic)
$('.translation').html(notificationData.english)
// $('.bottom').html(notificationData.details[0].bottom)
$('.reference').html(notificationData.reference)

ramandaCounter()
deedsPresent()


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

function deedsPresent()
{
  const deedsDate = new Date();
  let deedsDay = deedsDate.getDay();
  if(deedsDay==1 || deedsDay==4)
  {
    $("#deedsBox").removeClass("hidden")
    $("#deedsBox").addClass("animate-pulse")
    $("#deeds").html("Your deeds will be presented before Allah TODAY");
  }
}

$("#showBookmarkForm").click(function(){
  $("#deedsBox").removeClass("animate-pulse")
  $("#bookmark-modal").removeClass("hidden")
  $("#bookmark-form").removeClass("hidden")
})

$("#bookmark-modal").click(showHideModal());


function showHideModal()
{
  $("#bookmark-modal").click(function(){
    $("#deedsBox").addClass("animate-pulse")
    $("#bookmark-modal").addClass("hidden")
    $("#bookmark-form").addClass("hidden")
  })
}
// chrome.storage.sync.remove('bookmarks')

$("#addBookmark").click(function(){
  showHideModal();

  let newBookmark = {
    'name': ""+$("#bookmarkname").val()+"",
    'icon': ""+$("#bookmarkiconurl").val()+"",
    'url': ""+$("#bookmarkurl").val()+"",
  }
  // console.log(newBookmark)
  chrome.storage.sync.get(['bookmarks'], function(result) {
    let bookmarks = result.bookmarks
    bookmarks.push(newBookmark)
    chrome.storage.sync.set({bookmarks: bookmarks}, function() {
    })
  })

  


})

// var bookmarks = [{
//                 'name' : 'Google',
//                 'icon'  : 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
//                 'url' : 'https://google.com'

//               },
//               {
//                 'name' : 'Gmail',
//                 'icon'  : 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png',
//                 'url' : 'https://gmail.com'
//               }
//           ];
var bookmarks = []
chrome.storage.sync.set({bookmark: bookmarks}, function() {
  console.log('Value is set to ' + bookmarks);

});

chrome.storage.sync.get(['bookmarks'], function(result) {
  console.log(result.bookmarks);
  // chrome.storage.sync.remove(result.bookmarks)
  $.each(result.bookmarks, function(index, bookmark)
  {
    printBookmarks(bookmark)
  })
});

function printBookmarks(item)
{
      let bookmarkPrint = `<a href="${item.url}" class="w-20 flex items-center flex-col hover:bg-gray-300 my-2 transition-all duration-200 ease-linear rounded-md p-2">
        <div class="rounded-full bg-gray-200 h-10 w-10 p-2">
            <img src="${item.icon}" alt="" srcset="">
        </div>
        <div class="text-center font-bold">
            ${item.name}
        </div>
      </a>`
      $("#shortcuts").prepend(bookmarkPrint)
}