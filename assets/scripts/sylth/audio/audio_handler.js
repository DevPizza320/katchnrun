export class AudioHandler {
    static sounds = new Map();

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
        audio.playbackRate = rate;

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
            audio.currentTime = 0;
        });
    }

    static resumeAll() {
        this.sounds.forEach(audio => {
            audio.play().catch(() => {
                /* ignored: user gesture restriction */
            });
        });
    }

    static setVolume(src, volume) {
        const audio = this.sounds.get(src);
        if (audio) audio.volume = volume;
    }
}
