let torrentEngineClient = new WebTorrent();

function switchTab(targetTabId) {
    document.querySelectorAll('.nav-link').forEach(linkButton => {
        linkButton.classList.remove('active');
    });
    document.querySelectorAll('.tab-module').forEach(viewPanel => {
        viewPanel.classList.add('hidden-view');
        viewPanel.classList.remove('active-view', 'animate__fadeInRight');
    });
    event.currentTarget.classList.add('active');
    const selectedView = document.getElementById(`${targetTabId}-tab`);
    selectedView.classList.remove('hidden-view');
    void selectedView.offsetWidth; 
    selectedView.classList.add('active-view', 'animate__fadeInRight');
}

// Fetches full rich metadata catalogs via Stremio's Cinemeta pipeline
async function fetchCatalogMetadata(imdbId) {
    const cardWrapper = document.getElementById('meta-catalog-card');
    const titleNode = document.getElementById('meta-title');
    const descriptionNode = document.getElementById('meta-description');
    const posterNode = document.getElementById('meta-poster');
    const castNode = document.getElementById('meta-cast');

    try {
        // Fetch raw catalog entry by clean formatted IMDb index mapping rule
        const response = await fetch(`https://strem.io{imdbId}.json`);
        const resultData = await response.json();

        if (resultData && resultData.meta) {
            const movieInfo = resultData.meta;

            // Map variables dynamically into the frontend DOM elements
            titleNode.innerText = movieInfo.name || "Unknown Title";
            descriptionNode.innerText = movieInfo.description || "No overview summary layout available for this index record.";
            posterNode.src = movieInfo.poster || "";
            
            // Build text formatting wrapper array string for cast elements
            if (movieInfo.cast && movieInfo.cast.length > 0) {
                castNode.innerText = movieInfo.cast.slice(0, 5).join(', ');
            } else {
                castNode.innerText = "N/A";
            }

            // Expose the hidden card layout smoothly
            cardWrapper.className = "metadata-card-visible";
        }
    } catch (error) {
        console.error("Metadata Catalog Fetch Pipeline Failure: ", error);
    }
}

function startInlineStream() {
    const inputMagnetLink = document.getElementById('stream-magnet-input').value;
    const imdbIdValue = document.getElementById('imdb-id-input').value.trim();
    const infoMessageBox = document.getElementById('player-status-message');

    if (!inputMagnetLink || !inputMagnetLink.startsWith('magnet:?')) {
        alert('Please enter a valid cryptographic movie magnet streaming link.');
        return;
    }

    // Direct fire search metadata engine logic if a tracking parameter exists
    if (imdbIdValue) {
        fetchCatalogMetadata(imdbIdValue);
    }

    infoMessageBox.innerText = "Synchronizing streaming multi-servers and peer swarms... Fetching chunks.";

    torrentEngineClient.add(inputMagnetLink, function (torrentInstance) {
        const targetingMediaFile = torrentInstance.files.find(function (fileMetadata) {
            return fileMetadata.name.endsWith('.mp4') || fileMetadata.name.endsWith('.mkv') || fileMetadata.name.endsWith('.webm');
        });

        infoMessageBox.innerText = `Streaming Status: Active Stream Pipeline -> ${targetingMediaFile.name}`;
        targetingMediaFile.renderTo('#web-video-player');
    });
}

function triggerSafeDownload() {
    const sourceLink = document.getElementById('tunnel-magnet-input').value;
    const syncStatusBox = document.getElementById('download-status-box');

    if (!sourceLink || !sourceLink.startsWith('magnet:?')) {
        alert('Please specify a valid magnet path to process container remuxing.');
        return;
    }

    syncStatusBox.className = "status-alert running";
    syncStatusBox.innerText = "Tunnel Handshake Confirmed: Server sequential piece caching active. Mapping direct FFmpeg MP4 remux data packet straight to client browser thread...";
    window.location.href = `http://localhost:5000/api/tunnel-download?magnet=${encodeURIComponent(sourceLink)}`;
}
