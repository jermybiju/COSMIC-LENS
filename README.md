# Cosmic Lens

A daily astronomy image viewer that pulls from NASA's Astronomy Picture of the Day (APOD) API.

 **Live:** [https://jermybiju.github.io/COSMIC-LENS/](https://jermybiju.github.io/COSMIC-LENS/)

 ## What it does

shows NASA's picture of the day. you can browse any past image going back to June 1995, hit random for a surprise from the archive, jump between days with the arrow buttons, or use keyboard left/right. 
there's a share button that copies a link with the specific date so sending it to someone shows the same image. you can also save favorites and they stay in localStorage.

works on mobile too.

## Why I built this

made it for the Stardance "Give Your Website a Pulse" mission. wanted something people would actually open every day, and NASA gives their images away for free with a public API so it felt like a good match

## Tech used

- Vite for building
- vanilla JavaScript
- custom CSS with a starfield background

- ## Setup
- Node.js 20+ and a free NASA API key from [api.nasa.gov](https://api.nasa.gov).
1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and paste API key in there
4. Run `npm run dev` and open the URL shown in terminal

## What was tricky

1. Getting the API key to work with Vite. The `.env` variable needs a `VITE_` prefix or it won't be exposed to the browser.
2. Timezone bug in prev/next navigation. `toISOString()` uses UTC, and since I'm in IST it was jumping 2 days back. Fixed with a local date helper.
3. Tried adding a download button but hit a CORS issue. Browsers block downloading images from external domains. Removed it instead of shipping a broken feature

## Contact

- GitHub: [@jermybiju](https://github.com/jermybiju)
- Email: [jermybiju@gmail.com](mailto:jermybiju@gmail.com)
- Instagram: [@jermy.biju](https://instagram.com/jermy.biju)

## Built by

Jermy Biju - Stardance WebOS Challenge
