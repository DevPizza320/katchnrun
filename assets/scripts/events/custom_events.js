const mainHidden = new CustomEvent('mainHidden');
const mainShown = new CustomEvent('mainShown');

const portrait = window.matchMedia("(orientation: portrait)");
const targetNode = document.querySelector("main");

const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
      // Use checkVisibility() for a modern, comprehensive check (available since March 2024)
      if (!targetNode.checkVisibility()) {
        document.dispatchEvent(mainHidden);
      } else if (targetNode.checkVisibility()) {
        document.dispatchEvent(mainShown);
      }
    }
  }
});

// Start observing changes to the style attribute
observer.observe(targetNode, { attributes: true });

document.addEventListener("mainHidden", () => {
    document.querySelector(".home_animation").style.display = "none";
});

document.addEventListener("mainShown", () => {
    document.querySelector(".home_animation").style.display = "block";
});

const portraitMode = new CustomEvent("portraitMode");
const landscapeMode = new CustomEvent("landscapeMode");
portrait.addEventListener("change", function(e) {
    if (e.matches) {
        document.dispatchEvent(portraitMode);
    } else {
        document.dispatchEvent(landscapeMode);
    }
});