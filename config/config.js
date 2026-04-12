import { device } from "./device.js";
import { game } from "./game.js";
import { options } from "./options.js";

const deepFreeze = (obj) => {
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
};

const base = {
    device: device,
    game: game,
    options: options
}

export const config = base;