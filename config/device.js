import { getDeviceType } from "../lib/random_utils/device_type.js"

export const device = {
    dpr: (window.devicePixelRatio ?? 1),
    width: window.innerWidth * (window.devicePixelRatio ?? 1),
    height: window.innerHeight * (window.devicePixelRatio ?? 1),
    controls: getDeviceType()
}