var key = import.meta.env.VITE_NASA_API_KEY
var url = 'https://api.nasa.gov/planetary/apod'

var card = document.getElementById('apodCard')
var dateInput = document.getElementById('datePicker')
var randomBtn = document.getElementById('randomBtn')
var todayBtn = document.getElementById('todayBtn')
var prevBtn = document.getElementById('prevBtn')
var nextBtn = document.getElementById('nextBtn')
var shareBtn = document.getElementById('shareBtn')
var favBtn = document.getElementById('favBtn')
var favGrid = document.getElementById('favoritesGrid')

var current = null
var favs = JSON.parse(localStorage.getItem('favs')) || []

var d = new Date()
var todayStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())

dateInput.value = todayStr
dateInput.max = todayStr

function pad(n) {
if (n < 10) return '0' + n
return '' + n
}

function load(date) {
card.innerHTML = '<div class="loading">loading...</div>'

fetch(url + '?api_key=' + key + '&date=' + date)
.then(function(r) {
if (!r.ok) throw new Error('error ' + r.status)
return r.json()
})
.then(function(data) {
current = data
show(data)
checkStar()
})
.catch(function(err) {
card.innerHTML = '<div class="loading">couldnt load this one, try another date</div>'
})
}

function show(data) {
var media = ''

if (data.media_type == 'video') {
media = '<iframe class="apod-video" src="' + data.url + '" allowfullscreen></iframe>'
} else {
var img = data.hdurl || data.url
media = '<img class="apod-image" src="' + img + '" alt="' + data.title + '">'
}

var dd = new Date(data.date + 'T00:00:00')
var nice = dd.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

var copy = ''
if (data.copyright) {
copy = '<p class="apod-copyright">© ' + data.copyright + '</p>'
}

card.innerHTML = media + '<div class="apod-info">' +
'<p class="apod-date">' + nice + '</p>' +
'<h2 class="apod-title">' + data.title + '</h2>' +
'<p class="apod-explanation">' + data.explanation + '</p>' +
copy + '</div>'
}

function checkStar() {
if (!current) return
var found = false
for (var i = 0; i < favs.length; i++) {
if (favs[i].date == current.date) {
found = true
break
}
}
if (found) {
favBtn.classList.add('active')
favBtn.textContent = '★'
} else {
favBtn.classList.remove('active')
favBtn.textContent = '☆'
}
}

function toggleFav() {
if (!current) return

var idx = -1
for (var i = 0; i < favs.length; i++) {
if (favs[i].date == current.date) {
idx = i
break
}
}

if (idx > -1) {
favs.splice(idx, 1)
} else {
if (current.media_type == 'video') {
alert('cant save videos')
return
}
favs.push({
date: current.date,
title: current.title,
url: current.url
})
}

localStorage.setItem('favs', JSON.stringify(favs))
checkStar()
showFavs()
}

function showFavs() {
if (favs.length == 0) {
favGrid.innerHTML = '<div class="empty-state">no favorites yet. click the star to save one.</div>'
return
}

var sorted = favs.slice()
sorted.sort(function(a, b) {
return b.date.localeCompare(a.date)
})

favGrid.innerHTML = ''

for (var i = 0; i < sorted.length; i++) {
makeCard(sorted[i])
}

var rem = document.querySelectorAll('.fav-remove')
for (var j = 0; j < rem.length; j++) {
rem[j].onclick = function(e) {
e.stopPropagation()
var dt = this.getAttribute('data-date')
var nf = []
for (var k = 0; k < favs.length; k++) {
if (favs[k].date != dt) nf.push(favs[k])
}
favs = nf
localStorage.setItem('favs', JSON.stringify(favs))
showFavs()
if (current && current.date == dt) checkStar()
}
}
}

function makeCard(fav) {
var el = document.createElement('div')
el.className = 'fav-card'
el.innerHTML = '<img src="' + fav.url + '" alt="' + fav.title + '" loading="lazy">' +
'<button class="fav-remove" data-date="' + fav.date + '">×</button>' +
'<span class="fav-date">' + fav.date + '</span>'

el.onclick = function(e) {
if (e.target.className == 'fav-remove') return
dateInput.value = fav.date
load(fav.date)
window.scrollTo(0, 0)
}

favGrid.appendChild(el)
}

function getRandom() {
var start = new Date('1995-06-16').getTime()
var now = Date.now()
var t = start + Math.random() * (now - start)
var r = new Date(t)
return r.getFullYear() + '-' + pad(r.getMonth() + 1) + '-' + pad(r.getDate())
}

function moveDay(n) {
var base = dateInput.value
if (!base) return
var dt = new Date(base + 'T12:00:00')
dt.setDate(dt.getDate() + n)
var y = dt.getFullYear()
var m = pad(dt.getMonth() + 1)
var day = pad(dt.getDate())
var newDate = y + '-' + m + '-' + day

if (newDate < '1995-06-16') return
if (newDate > todayStr) return

dateInput.value = newDate
load(newDate)
}

dateInput.onchange = function() {
load(this.value)
}

randomBtn.onclick = function() {
var r = getRandom()
dateInput.value = r
load(r)
}

todayBtn.onclick = function() {
dateInput.value = todayStr
load(todayStr)
}

prevBtn.onclick = function() {
moveDay(-1)
}

nextBtn.onclick = function() {
moveDay(1)
}

favBtn.onclick = toggleFav

shareBtn.onclick = function() {
if (!current) return
var link = window.location.origin + window.location.pathname + '?date=' + current.date
navigator.clipboard.writeText(link).then(function() {
shareBtn.textContent = 'copied'
setTimeout(function() {
shareBtn.textContent = 'share'
}, 1200)
})
}

document.onkeydown = function(e) {
if (e.target.tagName == 'INPUT') return
if (e.key == 'ArrowLeft') prevBtn.click()
if (e.key == 'ArrowRight') nextBtn.click()
}

var params = new URLSearchParams(window.location.search)
var uDate = params.get('date')

if (uDate) {
dateInput.value = uDate
load(uDate)
} else {
load(todayStr)
}

showFavs()