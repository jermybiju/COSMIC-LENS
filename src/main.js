
var API_KEY = import.meta.env.VITE_NASA_API_KEY
var API_URL = 'https://api.nasa.gov/planetary/apod'

var apodCard = document.getElementById('apodCard')

var datePicker = document.getElementById('datePicker')

var randomBtn = document.getElementById('randomBtn')

var todayBtn = document.getElementById('todayBtn')

var favBtn = document.getElementById('favBtn')

var prevBtn = document.getElementById('prevBtn')

var nextBtn = document.getElementById('nextBtn')

var shareBtn = document.getElementById('shareBtn')

var favoritesGrid = document.getElementById('favoritesGrid')

var currentApod = null
var favorites = JSON.parse(localStorage.getItem('apodFavorites')) || []


var now = new Date()
var today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0')

datePicker.value = today
datePicker.max = today

function fetchAPOD(date) {
    
apodCard.innerHTML = '<div class="loading"><div class="spinner"></div><p>fetching from NASA...</p><p style="font-size:11px;margin-top:4px;color:#666">this might take a sec</p></div>'

var url = API_URL + '?api_key=' + API_KEY + '&date=' + date

fetch(url)
.then(function(response) {

if (!response.ok) {
throw new Error('failed to fetch: ' + response.status)
}
return response.json()
})
.then(function(data) {
currentApod = data
renderApod(data)
updateFavButton()
})
.catch(function(error) {

apodCard.innerHTML = '<div class="loading"><p style="color:#ef4444">oops something went wrong</p><p style="font-size:12px;margin-top:8px">' + error.message + '</p></div>'
})
}

function renderApod(data) {

var mediaHTML = ''

if (data.media_type === 'video') {

mediaHTML = '<div class="apod-image-wrap"><iframe class="apod-video" src="' +
 data.url + '" allowfullscreen></iframe></div>'

} else {

var imgUrl = data.hdurl || data.url
mediaHTML = '<div class="apod-image-wrap"><img class="apod-image" src="' + 
imgUrl + '" alt="' + data.title + '"></div>'

}

var copyrightHTML = ''

if (data.copyright) {

copyrightHTML = '<p class="apod-copyright">© ' + data.copyright + '</p>'

}

var d = new Date(data.date + 'T00:00:00')

var niceDate = d.toLocaleDateString('en-US',
     { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

apodCard.innerHTML = mediaHTML + '<div class="apod-info"><p class="apod-date">' 
+ niceDate + '</p><h2 class="apod-title">' + data.title + '</h2><p class="apod-explanation">' + data.explanation + '</p>' + copyrightHTML + '</div>'
}


function updateFavButton() {

if (!currentApod) return

var isFav = false
for (var i = 0; i < favorites.length; i++) {

if (favorites[i].date === currentApod.date) {
isFav = true

break
}
}

if (isFav) {

favBtn.classList.add('active')
favBtn.textContent = '★'

} else {

favBtn.classList.remove('active')

favBtn.textContent = '☆'
}
}

function toggleFavorite() {

if (!currentApod) return


var foundIndex = -1
for (var i = 0; i < favorites.length; i++) {

if (favorites[i].date === currentApod.date) {

foundIndex = i
break
}
}


if (foundIndex > -1) {
favorites.splice(foundIndex, 1)

} else {
if (currentApod.media_type === 'video') {

alert('cant save videos, sorry!')

return
}
favorites.push({

date: currentApod.date,
title: currentApod.title,

url: currentApod.url
})
}

localStorage.setItem('apodFavorites', JSON.stringify(favorites))
updateFavButton()

renderFavorites()
}

function renderFavorites() {
if (favorites.length === 0) {
favoritesGrid.innerHTML = '<p class="empty-state">no favorites yet. click the star to save images you love.</p>'
return
}


var sorted = favorites.slice()

sorted.sort(function(a, b) {

if (a.date > b.date) return -1

if (a.date < b.date) return 1
return 0

})

favoritesGrid.innerHTML = ''

for (var i = 0; i < sorted.length; i++) {

;(function(fav) {
var card = document.createElement('div')

card.className = 'fav-card'
card.innerHTML = '<img src="' + fav.url + '" alt="' + fav.title + 
'" loading="lazy"><button class="fav-remove" data-date="' + fav.date + '">×</button><span class="fav-date">' + fav.date + '</span>'

card.addEventListener('click', function(e) {
if (e.target.classList.contains('fav-remove')) return
datePicker.value = fav.date

fetchAPOD(fav.date)
window.scrollTo({ top: 0, behavior: 'smooth' })
})

favoritesGrid.appendChild(card)
})(sorted[i])
}


var removeBtns = document.querySelectorAll('.fav-remove')
for (var j = 0; j < removeBtns.length; j++) {

removeBtns[j].addEventListener('click', function(e) {
e.stopPropagation()
var date = e.target.dataset.date

var newFavs = []
for (var k = 0; k < favorites.length; k++) {
if (favorites[k].date !== date) {
newFavs.push(favorites[k])
}

}
favorites = newFavs

localStorage.setItem('apodFavorites', JSON.stringify(favorites))
renderFavorites()

if (currentApod && currentApod.date === date) {

updateFavButton()
}
})
}
}



function getRandomDate() {

var start = new Date('1995-06-16').getTime()
var end = new Date().getTime()

var randomTime = start + Math.random() * (end - start)
var randomDate = new Date(randomTime)
return randomDate.getFullYear() + '-' + String(randomDate.getMonth() + 1).padStart(2, '0') + '-' + String(randomDate.getDate()).padStart(2, '0')
}

datePicker.addEventListener('change', function() {
fetchAPOD(datePicker.value)

})

randomBtn.addEventListener('click', function() {
var randomDate = getRandomDate()
datePicker.value = randomDate

fetchAPOD(randomDate)
})

todayBtn.addEventListener('click', function() {
datePicker.value = today
fetchAPOD(today)
})

favBtn.addEventListener('click', toggleFavorite)


function formatLocalDate(date) {

var y = date.getFullYear()

var m = String(date.getMonth() + 1).padStart(2, '0')

var d = String(date.getDate()).padStart(2, '0')
return y + '-' + m + '-' + d
}

prevBtn.addEventListener('click', function() {

var base = datePicker.value
if (!base) return

var current = new Date(base + 'T12:00:00')
current.setDate(current.getDate() - 1)

var newDate = formatLocalDate(current)
if (newDate < '1995-06-16') return
datePicker.value = newDate
fetchAPOD(newDate)

})


nextBtn.addEventListener('click', function() {
var base = datePicker.value
if (!base) return

var current = new Date(base + 'T12:00:00')
current.setDate(current.getDate() + 1)

var newDate = formatLocalDate(current)
if (newDate > today) return
datePicker.value = newDate
fetchAPOD(newDate)

})



shareBtn.addEventListener('click', function() {
if (!currentApod) return

var url = window.location.origin + window.location.pathname + '?date=' + currentApod.date
navigator.clipboard.writeText(url)
.then(function() {

shareBtn.textContent = 'copied!'
setTimeout(function() {
shareBtn.textContent = 'share'

}, 1500)
})
.catch(function() {
alert('couldnt copy link')
})
})



var urlParams = new URLSearchParams(window.location.search)

var urlDate = urlParams.get('date')
if (urlDate) {

datePicker.value = urlDate

fetchAPOD(urlDate)
} else {

fetchAPOD(today)
}

renderFavorites()