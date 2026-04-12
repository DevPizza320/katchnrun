export async function fetchJSON(url) {
    try {
        const res = await fetch(url);

        // 1. Check if the response was successful (status 200-299)
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        // 2. Parse the body as JSON
        return await res.json();
    } catch (error) {
        // 3. Handle network errors, parsing errors, or HTTP errors
        console.error("Error while fetching JSON:", error.message);
        
        return {}; 
    }
}
