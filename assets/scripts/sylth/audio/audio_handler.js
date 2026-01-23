export class AudioHandler {
    static sounds = new Map();
    static audioSettings = new Map(); // Store randomization settings per audio source

    /**
     * Configure pitch randomization for an audio source
     * @param {string} src - Path to audio file
     * @param {boolean} randomizePitch - Whether to randomize pitch
     * @param {number} pitchRange - How much to randomize (0.1 = ±10% variation)
     */
    static setPitchRandomization(src, randomizePitch = false, pitchRange = 0.1) {
        this.audioSettings.set(src, { randomizePitch, pitchRange });
    }

    /**
     * Play a sound or music file
     * @param {string} src - Path to audio file
     * @param {object} options
     */
    static play(src, {
        volume = 1,
        loop = false,
        rate = 1,
        startAt = 0,
        forceRestart = true
    } = {}) {
        let audio = this.sounds.get(src);

        if (!audio) {
            audio = new Audio(src);
            this.sounds.set(src, audio);
        }

        audio.volume = volume;
        audio.loop = loop;

        // Apply pitch randomization if enabled
        const settings = this.audioSettings.get(src);
        let finalRate = rate;
        if (settings && settings.randomizePitch) {
            const variation = (Math.random() - 0.5) * 2 * settings.pitchRange; // Random between -pitchRange and +pitchRange
            finalRate = rate * (1 + variation);
        }
        audio.playbackRate = finalRate;

        if (forceRestart) {
            audio.currentTime = startAt;
        }

        audio.play().catch(() => {
            /* ignored: user gesture restriction */
        });

        return audio;
    }

    static pause(src) {
        const audio = this.sounds.get(src);
        if (!audio) return;

        audio.pause();
    }

    static stopAll() {
        this.sounds.forEach(audio => {
            audio.pause();
        });
    }

    static resumeAll() {
        this.sounds.forEach(audio => {
            audio.play().catch(() => {
                /* ignored: user gesture restriction */
            });
        });
    }

    /**
     * Get pitch randomization settings for an audio source
     * @param {string} src - Path to audio file
     * @returns {object} Settings object with randomizePitch and pitchRange
     */
    static getPitchRandomization(src) {
        return this.audioSettings.get(src) || { randomizePitch: false, pitchRange: 0.1 };
    }
}
