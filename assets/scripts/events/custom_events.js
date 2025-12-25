const mainHidden = new CustomEvent('mainHidden');
const mainShown = new CustomEvent('mainShown');

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