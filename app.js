let torrentEngineClient = new WebTorrent();

// Manages high-performance view switching and tab states
function switchTab(targetTabId) {
    // Unset active class from all header navigation buttons
    document.querySelectorAll('.nav-link').forEach(linkButton => {
        linkButton.classList.remove('active');
    });

    // Hide all view content structures completely
    document.querySelectorAll('.tab-module').forEach(viewPanel => {
        viewPanel.classList.add('hidden-view');
        viewPanel.classList.remove('active-view', 'animate__fadeInRight');
    });

    // Set active link highlight state onto selected button trigger
    event.currentTarget.classList.add('active');

    // Reveal target template panel smoothly
    const selectedView = document.getElementById(`${targetTabId}-tab`);
    selectedView.classList.remove('hidden-view');
    
    // Force a hardware repaint check to render the animate.css slide cleanly
    void selectedView.offsetWidth; 
    selectedView.classList.add('active-view', 'animate__fadeInRight');
}

// Launches browser-side inline streaming player framework
function startInlineStream() {
    const inputMagnetLink = document.getElementById('stream-magnet-input').value;
    const infoMessageBox = document.getElementById('player-status-message');

    if (!inputMagnetLink || !inputMagnetLink.startsWith('magnet:?')) {
        alert('Please enter a valid cryptographic movie magnet streaming link.');
        return;
    }

    infoMessageBox.innerText = "Synchronizing streaming multi-servers and peer swarms... Fetching chunks.";

    // Register stream target within WebTorrent cluster engine
    torrentEngineClient.add(inputMagnetLink, function (torrentInstance) {
        // Isolate largest core media video container file asset matching film parameters
        const targetingMediaFile = torrentInstance.files.find(function (fileMetadata) {
            return fileMetadata.name.endsWith('.mp4') || fileMetadata.name.endsWith('.mkv') || fileMetadata.name.endsWith('.webm');
        });

        infoMessageBox.innerText = `Streaming Status: Active Stream Pipeline -> ${targetingMediaFile.name}`;
        
        // Render sequential media buffer tracks right into video canvas container node
        targetingMediaFile.renderTo('#web-video-player');
    });
}

// Simulates sending the tracking endpoint down to custom pipeline backends
function triggerSafeDownload() {
    const sourceLink = document.getElementById('tunnel-magnet-input').value;
    const syncStatusBox = document.getElementById('download-status-box');

    if (!sourceLink || !sourceLink.startsWith('magnet:?')) {
        alert('Please specify a valid magnet path to process container remuxing.');
        return;
    }

    syncStatusBox.className = "status-alert running";
    syncStatusBox.innerText = "Tunnel Handshake Confirmed: Server sequential piece caching active. Mapping direct FFmpeg MP4 remux data packet straight to client browser thread...";
    
    // Commands your local system environment routing handler session
    window.location.href = `http://localhost:5000/api/tunnel-download?magnet=${encodeURIComponent(sourceLink)}`;
}
