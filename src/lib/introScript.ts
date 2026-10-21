// Sets data-intro on <html> for the home page intro (see intro.ts) before the
// first paint, so the header and the hero text never flash up before the intro
// takes over. It only guesses the render mode (see detectMode); the intro gate
// settles it once the page has hydrated. Kept apart from intro.ts so the
// server layout can inline it
export const introScript = `try{var p=location.pathname;if(/^\\/(ru|en)?\\/?$/.test(p)&&!location.hash&&innerWidth>=768&&localStorage.getItem("render-mode")!=="lite"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro=""}catch(e){}`;
