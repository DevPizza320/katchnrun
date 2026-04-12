export async function toggleFullscreen(el = document.documentElement) {
    try {
        if (!document.fullscreenElement) {
            // 1. Check if the element supports the API
            if (!el.requestFullscreen) {
                throw new Error("Fullscreen API not supported on this element.");
            }

            await el.requestFullscreen();

            // 2. Lock orientation only after entering fullscreen
            if (screen.orientation?.lock) {
                // Ignore errors here to prevent orientation failure from breaking the UI
                await screen.orientation.lock("landscape").catch(() => {
                    console.warn("Orientation lock failed or was denied.");
                });
            }
        } else {
            // 3. Ensure we can actually exit
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    } catch (err) {
        // 4. Handle permission denials (user blocked it) or technical errors
        console.error(`Fullscreen toggle failed: ${err.message}`);
    }
}