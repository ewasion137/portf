/* Pure browser bridge replacing Electron IPC */
(function() {
    const fileStore = new Map();
    let trackListCallback = null;

    const filePicker = document.createElement('input');
    filePicker.type = 'file';
    filePicker.webkitdirectory = true;
    filePicker.multiple = true;
    filePicker.style.display = 'none';
    document.body.appendChild(filePicker);

    filePicker.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        fileStore.clear();
        const folderMap = new Map();
        const validExts = ['.mp3', '.wav', '.ogg', '.flac'];

        for (const file of files) {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            if (!validExts.includes(ext)) continue;

            const path = file.webkitRelativePath || file.name;
            fileStore.set(path, file);

            const parts = path.split('/');
            const folder = parts.length > 1 ? parts[parts.length - 2] : 'Root';

            if (!folderMap.has(folder)) {
                folderMap.set(folder, []);
            }

            folderMap.get(folder).push({
                name: file.name.replace(/\.[^/.]+$/, ''),
                path: path
            });
        }

        const result = Array.from(folderMap, ([folder, tracks]) => ({ folder, tracks }));
        if (trackListCallback) {
            trackListCallback(result);
        }
    });

    window.electronAPI = {
        selectFolder: () => {
            filePicker.click();
        },

        onReceiveTracks: (cb) => {
            trackListCallback = cb;
        },

        onGlobalCommand: (cb) => {
            window.addEventListener('message', (e) => {
                if (e.data && e.data.type === 'zenith-cmd') {
                    cb(e.data.command);
                }
            });
        },

        getAudioData: async (filePath) => {
            const file = fileStore.get(filePath);
            if (!file) return null;
            const buffer = await file.arrayBuffer();
            return new Uint8Array(buffer);
        },

        getTrackMetadata: async (filePath) => {
            const file = fileStore.get(filePath);
            return {
                title: file ? file.name.replace(/\.[^/.]+$/, '') : filePath,
                artist: 'Local Audio',
                album: 'Local Storage',
                year: null,
                picture: null
            };
        },

        getTrackSettings: (trackPath) => {
            try {
                const raw = localStorage.getItem(`zenith_track:${trackPath}`);
                return raw ? JSON.parse(raw) : {};
            } catch (e) {
                return {};
            }
        },

        saveTrackSettings: ({ trackPath, settings }) => {
            try {
                localStorage.setItem(`zenith_track:${trackPath}`, JSON.stringify(settings));
            } catch (e) {}
        },

        getSavedWebTracks: () => {
            try {
                const raw = localStorage.getItem('zenith_web_tracks');
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                return [];
            }
        },

        saveWebTracks: (tracks) => {
            try {
                localStorage.setItem('zenith_web_tracks', JSON.stringify(tracks));
            } catch (e) {}
        },

        initDiscordRPC: async () => ({ success: false, error: 'Disabled in Web' }),
        updateDiscordRPC: () => {},
        clearDiscordRPC: () => {},

        minimize: () => {
            const frame = document.getElementById('zenith-window-container');
            if (frame) frame.classList.toggle('window-minimized');
        },

        maximize: () => {
            const frame = document.getElementById('zenith-window-container');
            if (frame) frame.classList.toggle('window-maximized');
        },

        close: () => {
            const frame = document.getElementById('zenith-window-container');
            if (frame) frame.classList.add('window-hidden');
        }
    };
})();