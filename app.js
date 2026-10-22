let torrentEngineClient = new WebTorrent();

const publicScrapeGateways = [
    "https://torrentio.strem.fun/stream/",
    "https://comet.elfhosted.com/stream/"
];

let lastDiscoveredMagnetLink = "";

function switchTab(targetTabId) {
    document.querySelectorAll('.nav-link').forEach(linkButton => {
        linkButton.classList.remove('active');
    });

    document.querySelectorAll('.tab-module').forEach(viewPanel => {
        viewPanel.classList.add('hidden-view');
        viewPanel.classList.remove('active-view', 'animate__fadeInRight');
    });

    const activeNavButton = Array.from(document.querySelectorAll('.nav-link')).find(btn => 
        btn.getAttribute('onclick').includes(`'${targetTabId}'`)
    );
    if (activeNavButton) {
        activeNavButton.classList.add('active');
    }

    const selectedView = document.getElementById(`${targetTabId}-tab`);
    if (selectedView) {
        selectedView.classList.remove('hidden-view');
        void selectedView.offsetWidth;
        selectedView.classList.add('active-view', 'animate__fadeInRight');
    }
}

async function loadDiscoverCatalog() {
    const playerPanel = document.querySelector('.player-panel');
    if (!playerPanel) return;
    
    const catalogContainer = document.createElement('div');
    catalogContainer.className = 'discover-catalog-grid';
    catalogContainer.innerHTML = '<h3 class="catalog-heading">Trending Discover Catalog (Movies & TV Series)</h3><div class="movie-grid" id="grid-mount"></div>';
    playerPanel.appendChild(catalogContainer);

    const gridMount = document.getElementById('grid-mount');
    if (!gridMount) return;
    
    const trendingContentList = [
        { id: "tt0137523", type: "movie", title: "Fight Club", year: "1999", poster: "https://images.metahash.space/poster/v2/137523.jpg" },
        { id: "tt0468569", type: "movie", title: "The Dark Knight", year: "2008", poster: "https://images.metahash.space/poster/v2/468569.jpg" },
        { id: "tt0903747", type: "series", title: "Breaking Bad", year: "TV Show", poster: "https://images.metahash.space/poster/v2/903747.jpg" },
        { id: "tt0944947", type: "series", title: "Game of Thrones", year: "TV Show", poster: "https://images.metahash.space/poster/v2/944947.jpg" }
    ];

    trendingContentList.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'movie-discover-card animate__animated animate__fadeIn';
        
        let actionableControlsHTML = `<button class="catalog-stream-btn" onclick="autoScrapeAndPlay('${item.type}', '${item.id}')">Find Live Streams</button>`;
        
        if (item.type === "series") {
            actionableControlsHTML = `
                <div class="tv-selector-row">
                    <select id="season-select-${item.id}" onchange="updateEpisodeDropdown('${item.id}')">
                        <option value="1">Season 1</option>
                        <option value="2">Season 2</option>
                    </select>
                    <select id="episode-select-${item.id}">
                        <option value="1">Episode 1</option>
                        <option value="2">Episode 2</option>
                        <option value="3">Episode 3</option>
                    </select>
                </div>
                <button class="catalog-stream-btn tv-btn" onclick="triggerTvScrape('${item.id}')">Stream Episode</button>
            `;
        }

        itemCard.innerHTML = `
            <img src="${item.poster}" alt="${item.title}">
            <h4>${item.title}</h4>
            <p>${item.year}</p>
            ${actionableControlsHTML}
        `;
        gridMount.appendChild(itemCard);
    });
}

function triggerTvScrape(seriesImdbId) {
    const chosenSeason = document.getElementById(`season-select-${seriesImdbId}`).value;
    const chosenEpisode = document.getElementById(`episode-select-${seriesImdbId}`).value;
    autoScrapeAndPlay('series', seriesImdbId, chosenSeason, chosenEpisode);
}

function updateEpisodeDropdown(seriesId) {
    const epDropdown = document.getElementById(`episode-select-${seriesId}`);
    if (!epDropdown) return;
    epDropdown.innerHTML = "";
    
    for (let i = 1; i <= 5; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerText = `Episode ${i}`;
        epDropdown.appendChild(opt);
    }
}

async function autoScrapeAndPlay(contentType, imdbId, season = null, episode = null) {
    const infoMessageBox = document.getElementById('player-status-message');
    if (!infoMessageBox) return;
    
    infoMessageBox.className = "status-alert waiting";
    infoMessageBox.innerText = `Contacting background aggregator plugins... Scanning swarm paths.`;

    fetchCatalogMetadata(imdbId);

    let queryToken = `movie/${imdbId}.json`;
    if (contentType === "series") {
        queryToken = `series/${imdbId}:${season}:${episode}.json`;
    }

    for (let gate of publicScrapeGateways) {
        try {
            const fetchUrl = `${gate}${queryToken}`;
            const checkRes = await fetch(fetchUrl);
            const dataPayload = await checkRes.json();

            if (dataPayload && dataPayload.streams && dataPayload.streams.length > 0) {
                const baselineTargetStream = dataPayload.streams[0];
                
                let streamUri = baselineTargetStream.url;
                if (baselineTargetStream.infoHash) {
                    streamUri = `magnet:?xt=urn:btih:\${baselineTargetStream.infoHash}`;
                }

                if (streamUri) {
                    lastDiscoveredMagnetLink = streamUri;
                    
                    infoMessageBox.className = "status-alert running";
                    infoMessageBox.innerHTML = `
                        Stream located via plugin! 
                        <button class="embed-copy-btn" onclick="copyStreamHashToClipboard()">📋 Copy Magnet Link</button>
                    `;
                    
                    executeVideoPipeline(streamUri);
                    return;
                }
            }
        } catch (e) {
            console.warn("Plugin query node hop timed out, checking backup path...", e);
        }
    }
    
    infoMessageBox.className = "status-alert info";
    infoMessageBox.innerText = "No direct streams answered from this addon node. Try copying a manual magnet link source link.";
}

function copyStreamHashToClipboard() {
    if (!lastDiscoveredMagnetLink) {
        alert("No active magnet reference located inside system memory states.");
        return;
    }
    
    navigator.clipboard.writeText(lastDiscoveredMagnetLink).then(() => {
        alert("Success! Magnet link copied directly to your device clipboard. You can now paste this target into the Safe Download Tunnel tab.");
    }).catch(err => {
        console.error("Clipboard routing restriction thrown: ", err);
    });
}

function executeVideoPipeline(sourceUri) {
    const infoMessageBox = document.getElementById('player-status-message');
    
    if (torrentEngineClient.torrents.length > 0) {
        torrentEngineClient.torrents.forEach(t => t.destroy());
        torrentEngineClient = new WebTorrent();
    }

    if (sourceUri.startsWith('http')) {
        document.getElementById('web-video-player').src = sourceUri;
        return;
    }

    torrentEngineClient.add(sourceUri, function (torrentInstance) {
        const targetingMediaFile = torrentInstance.files.find(function (fileMetadata) {
            return fileMetadata.name.endsWith('.mp4') || fileMetadata.name.endsWith('.mkv') || fileMetadata.name.endsWith('.webm');
        });
        if (infoMessageBox && targetingMediaFile) {
            infoMessageBox.innerText = `Streaming Status: Playing live video swarm -> \${targetingMediaFile.name}`;
        }
        targetingMediaFile.renderTo('#web-video-player');
    });
}

async function fetchCatalogMetadata(imdbId) {
    const cardWrapper = document.getElementById('meta-catalog-card');
    const titleNode = document.getElementById('meta-title');
    const descriptionNode = document.getElementById('meta-description');
    const posterNode = document.getElementById('meta-poster');
    const castNode = document.getElementById('meta-cast');

    if (!cardWrapper || !titleNode || !descriptionNode || !posterNode || !castNode) return;

    try {
        const response = await fetch(`https://v3-cinemeta.strem.io/meta/movie/\${imdbId}.json`);
        const resultData = await response.json();

        if (resultData && resultData.meta) {
            const movieInfo = resultData.meta;
            titleNode.innerText = movieInfo.name || "Unknown Title";
            descriptionNode.innerText = movieInfo.description || "No overview summary layout available for this index record.";
            posterNode.src = movieInfo.poster || "";
            if (movieInfo.cast && movieInfo.cast.length > 0) {
                castNode.innerText = movieInfo.cast.slice(0, 5).join(', ');
            } else {
                castNode.innerText = "N/A";
            }
            cardWrapper.className = "metadata-card-visible";
        }
    } catch (error) {
        console.error("Metadata Catalog Fetch Pipeline Failure: ", error);
    }
}

function startInlineStream() {
    const inputMagnetLink = document.getElementById('stream-magnet-input').value;
    const imdbIdValue = document.getElementById('imdb-id-input').value.trim();

    if (!inputMagnetLink || !inputMagnetLink.startsWith('magnet:?')) {
        alert('Please enter a valid cryptographic movie magnet streaming link.');
        return;
    }
    if (imdbIdValue) { fetchCatalogMetadata(imdbIdValue); }
    lastDiscoveredMagnetLink = inputMagnetLink;
    executeVideoPipeline(inputMagnetLink);
}

function triggerSafeDownload() {
    const sourceLink = document.getElementById('tunnel-magnet-input').value;
    const syncStatusBox = document.getElementById('download-status-box');
    if (!syncStatusBox) return;
    
    if (!sourceLink || !sourceLink.startsWith('magnet:?')) {
        alert('Please specify a valid magnet path to process container remuxing.');
        return;
    }
    syncStatusBox.className = "status-alert running";
    syncStatusBox.innerText = "Tunnel Handshake Confirmed: Server sequential piece caching active. Mapping direct FFmpeg MP4 remux data packet straight to client browser thread...";
    window.location.href = `http://localhost:5000/api/tunnel-download?magnet=\${encodeURIComponent(sourceLink)}`;
}

window.onload = function() {
    loadDiscoverCatalog();
};
