
const API_KEY = import.meta.env.VITE_NASA_API_KEY
const API_URL = 'https://api.nasa.gov/planetary/apod'


const apodCard = document.getElementById('apodCard')

const datePicker = document.getElementById('datePicker')

const randomBtn = document.getElementById('randomBtn')

const todayBtn = document.getElementById('todayBtn')

const favBtn = document.getElementById('favBtn')

const prevBtn = document.getElementById('prevBtn')

const nextBtn = document.getElementById('nextBtn')

const shareBtn = document.getElementById('shareBtn')
const favoritesGrid = document.getElementById('favoritesGrid')


let currentApod = null

let favorites = JSON.parse(localStorage.getItem('apodFavorites')) || []

const today = new Date().toISOString().split('T')[0]

datePicker.value = today
datePicker.max = today

async function fetchAPOD(date) {

showLoading()
try {

const url = `${API_URL}?api_key=${API_KEY}&date=${date}`
const response = await fetch(url)

if (!response.ok) throw new Error('failed to fetch: ' + response.status)
const data = await response.json()
currentApod = data
renderApod(data)
updateFavButton()
} 
catch (error) {
showError(error.message)

}
}

function showLoading() {

apodCard.innerHTML = '<div class="loading"><div class="spinner"></div><p>fetching from NASA...</p><p style="font-size:11px;margin-top:4px;color:#666">this might take a sec</p></div>'
}

function showError(message) {

apodCard.innerHTML = '<div class="loading"><p style="color:#ef4444">oops something went wrong</p><p style="font-size:12px;margin-top:8px">' + message + '</p></div>'
}

function renderApod(data) {

const isVideo = data.media_type === 'video'
let mediaHTML = ''

if (isVideo) {

mediaHTML = '<div class="apod-image-wrap"><iframe class="apod-video" src="' + data.url + '" allowfullscreen></iframe></div>'
} else {

mediaHTML = '<div class="apod-image-wrap"><img class="apod-image" src="' + (data.hdurl || data.url) + '" alt="' + data.title + '"></div>'
}
const copyright = data.copyright ? '<p class="apod-copyright">© ' + data.copyright + '</p>' : ''
apodCard.innerHTML = mediaHTML + '<div class="apod-info"><p class="apod-date">' + formatDate(data.date) + '</p><h2 class="apod-title">' + data.title + '</h2><p class="apod-explanation">' + data.explanation + '</p>' + copyright + 
'</div>'
}

function formatDate(dateStr) {

const d = new Date(dateStr + 'T00:00:00')
return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}



function updateFavButton() {

if (!currentApod) return
const isFav = favorites.some(f => f.date === currentApod.date)

favBtn.classList.toggle('active', isFav)
favBtn.textContent = isFav ? '★' : '☆'

}

function toggleFavorite() {
if (!currentApod) return

const isFav = favorites.some(f => f.date === currentApod.date)
if (isFav) {

favorites = favorites.filter(f => f.date !== currentApod.date)
} else {


if (currentApod.media_type === 'video') { alert('cant save videos, sorry!'); return }
favorites.push({ date: currentApod.date, title: currentApod.title, url: currentApod.url })
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
favoritesGrid.innerHTML = ''

const sorted = [...favorites].sort((a, b) => b.date.localeCompare(a.date))
sorted.forEach(fav => {

const card = document.createElement('div')
card.className = 'fav-card'

card.innerHTML = '<img src="' + fav.url + '" alt="' + fav.title + '" loading="lazy"><button class="fav-remove" data-date="' + fav.date + '">×</button><span class="fav-date">' + fav.date + '</span>'
card.addEventListener('click', (e) => {

if (e.target.classList.contains('fav-remove')) return
datePicker.value = fav.date

fetchAPOD(fav.date)
window.scrollTo({ top: 0, behavior: 'smooth' })

})
favoritesGrid.appendChild(card)

})
document.querySelectorAll('.fav-remove').forEach(btn => {
btn.addEventListener('click', (e) => {

e.stopPropagation()

const date = e.target.dataset.date

favorites = favorites.filter(f => f.date !== date)

localStorage.setItem('apodFavorites', JSON.stringify(favorites))
renderFavorites()

if (currentApod && currentApod.date === date) updateFavButton()
})
})
}

function getRandomDate() {


const start = new Date('1995-06-16').getTime()
const end = new Date().getTime()

return new Date(start + Math.random() * (end - start)).toISOString().split('T')[0]
}

datePicker.addEventListener('change', () => fetchAPOD(datePicker.value))


randomBtn.addEventListener('click', () => {
const randomDate = getRandomDate()

datePicker.value = randomDate
fetchAPOD(randomDate)
})


todayBtn.addEventListener('click', () => {

datePicker.value = today
fetchAPOD(today)

})
favBtn.addEventListener('click', toggleFavorite)


renderFavorites()
fetchAPOD(today)


function formatLocalDate(date) {

const y = date.getFullYear()
const m = String(date.getMonth() + 1).padStart(2, '0')
const d = String(date.getDate()).padStart(2, '0')
return y + '-' + m + '-' + d

}


prevBtn.addEventListener('click', () => {
if (!currentApod) return
const current = new Date(currentApod.date + 'T12:00:00')
current.setDate(current.getDate() - 1)
const newDate = formatLocalDate(current)


if (newDate < '1995-06-16') return
datePicker.value = newDate
fetchAPOD(newDate)

})



nextBtn.addEventListener('click', () => {
if (!currentApod) return

const current = new Date(currentApod.date + 'T12:00:00')
current.setDate(current.getDate() + 1)

const newDate = formatLocalDate(current)

if (newDate > today) return
datePicker.value = newDate
fetchAPOD(newDate)
})



shareBtn.addEventListener('click', () => {
if (!currentApod) return
const url = window.location.origin + window.location.pathname + '?date=' + currentApod.date


navigator.clipboard.writeText(url).then(() => {
shareBtn.textContent = 'copied!'
setTimeout(() => { shareBtn.textContent = 'share' }, 1500)
}).catch(() => {
alert('couldnt copy link')
})
})

const urlParams = new URLSearchParams(window.location.search)
const urlDate = urlParams.get('date')
if (urlDate) {

datePicker.value = urlDate
fetchAPOD(urlDate)
}