// 1. Validation
export const isLetter = (c) => /^[a-z]$/i.test(c);
export const isAlphanumeric = (s) => /^[a-z0-9]+$/i.test(s);
export const isBlank = (s) => !s || !s.trim();

// 2. Formatting
export const capitalize = (s) => s ? s[0].toUpperCase() + s.slice(1) : "";
export const toTitleCase = (s) => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
export const toCamelCase = (s) => s.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (m, i) => +m === 0 ? "" : i === 0 ? m.toLowerCase() : m.toUpperCase()).replace(/\s+/g, '');

// 3. Manipulation
export const reverse = (s) => [...s].reverse().join("");
export const truncate = (s, len = 20) => s.length > len ? s.slice(0, len) + "..." : s;
export const clean = (s) => s.replace(/[^a-z0-0 ]/gi, "");
export const countWords = (s) => s.trim() ? s.trim().split(/\s+/).length : 0;
