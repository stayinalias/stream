let torrentEngineClient = new WebTorrent();
const publicScrapeGateways = [
    "https://strem.fun",
    "https://elfhosted.com"
];
let lastDiscoveredMagnetLink = "";

// Handles high-performance view layer routing changes across tabs
function navigateDashboardTabs(targetTabId) {
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.add('view-hidden');
        panel.classList.remove('view-visible');
    });

    const activeNavButton = Array.from(document.querySelectorAll('.nav-link, .nav-tab')).find(btn => 
        btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${targetTabId}'`)
    );
    if (activeNavButton) activeNavButton.classList.add('active');

    const selectedView = document.getElementById(`${targetTabId}-viewport`);
    if (selectedView) {
        selectedView.classList.remove('view-hidden');
        selectedView.classList.add('view-visible');
    }
}

// Intercepts key release events to trigger search execution upon enter input
function evaluateSearchInputTrigger(eventInstance) {
    if (eventInstance.key === 'Enter') {
        executeCinemetaCatalogQuery();
    }
}

// Executes an unrestricted live keyword search via Stremio's Cinemeta directories
async function executeCinemetaCatalogQuery() {
    const searchString = document.getElementById('catalog-keyword-search').value.trim();
    const statusAlert = document.getElementById('search-status-alert');
    const gridRoot = document.getElementById('explore-grid-root');

    if (!searchString) {
        alert('Please append query text into the search engine panel.');
        return;
    }

    statusAlert.className = "ui-notification notification-warn";
    statusAlert.innerText = `Interrogating Cinemeta index databases for keyword phrase: "${searchString}"...`;
    gridRoot.innerHTML = "";

    try {
        const response = await fetch(`https://strem.io{encodeURIComponent(searchString)}.json`);
        const dataPayload = await response.json();

        if (dataPayload && dataPayload.metas && dataPayload.metas.length > 0) {
            statusAlert.className = "ui-notification notification-run";
            statusAlert.innerText = `Search engine completed. Found ${dataPayload.metas.length} directory layout matches.`;

            // Enable blur layer architecture container hooks
            gridRoot.className = "catalog-grid-mount explore-grid-active";

            dataPayload.metas.forEach(item => {
                if (!item.poster) return;
                const itemCard = document.createElement('div');
                itemCard.className = 'movie-discover-card animate__animated animate__fadeIn';
                
                // Track backend item structure formats mapping to movies vs series
                const verifiedType = item.type === "series" ? "series" : "movie";
                let interactionControlsHTML = `<button class="catalog-stream-btn" onclick="directRouteToStreamTab('${verifiedType}', '${item.id}')">Select Title</button>`;
                
                if (verifiedType === "series") {
                    interactionControlsHTML = `
                        <div class="tv-selector-row">
                            <select id="season-${item.id}" onchange="extendTelevisionEpisodeDropdownLimits('${item.id}')">
                                <option value="1">Season 1</option><option value="2">Season 2</option>
                            </select>
                            <select id="episode-${item.id}">
                                <option value="1">Episode 1</option><option value="2">Episode 2</option>
                            </select>
                        </div>
                        <button class="catalog-stream-btn tv-btn" onclick="parseTvControlsAndRoute('${item.id}')">Select Episode</button>
                    `;
                }

                itemCard.innerHTML = `<img src="${item.poster}" alt="${item.name}"><h4>${item.name}</h4><p>${item.year || 'N/A'}</p>${interactionControlsHTML}`;
                
                // Hot-swap backdrops dynamically during hover actions using blur nodes
                itemCard.addEventListener('mouseenter', () => {
                    const blurBackdrop = document.getElementById('dynamic-blur-backdrop');
                    if (blurBackdrop && item.poster) {
                        blurBackdrop.style.backgroundImage = `url('${item.poster}')`;
                        blurBackdrop.style.filter = "blur(35px) brightness(0.25)";
                    }
                });

                gridRoot.appendChild(itemCard);
            });
        } else {
            statusAlert.className = "ui-notification notification-neutral";
            statusAlert.innerText = "No database listings matched that search expression term.";
        }
    } catch (err) {
        statusAlert.className = "ui-notification notification-neutral";
        statusAlert.innerText = "Error executing catalog index query. Verify connection layers.";
        console.error(err);
    }
}

function parseTvControlsAndRoute(seriesId) {
    const s = document.getElementById(`season-${seriesId}`).value;
    const e = document.getElementById(`episode-${seriesId}`).value;
    directRouteToStreamTab('series', seriesId, s, e);
}

function extendTelevisionEpisodeDropdownLimits(seriesId) {
    const epDrop = document.getElementById(`episode-${seriesId}`);
    if (!epDrop) return;
    epDrop.innerHTML = "";
    for (let idx = 1; idx <= 6; idx++) {
        let nodeOpt = document.createElement('option'); nodeOpt.value = idx; nodeOpt.innerText = `Episode ${idx}`;
        epDrop.appendChild(nodeOpt);
    }
}

// Redirects client inputs across tabs and instantly initializes multi-server scraping sweeps
function directRouteToStreamTab(contentType, imdbId, season = null, episode = null) {
    navigateDashboardTabs('stream');
    const manualLinkInputBox = document.getElementById('manual-magnet-input');
    if (manualLinkInputBox) manualLinkInputBox.value = "";
    autoScrapeFromGateways(contentType, imdbId, season, episode);
}

async function autoScrapeFromGateways(contentType, imdbId, season = null, episode = null) {
    const infoMessageBox = document.getElementById('player-status-message');
    if (!infoMessageBox) return;
    
    infoMessageBox.className = "ui-notification notification-warn";
    infoMessageBox.innerText = `Routing parameter hooks to public torrent scraper networks...`;

    fetchTargetMetadataRecords(imdbId);
    updateServerStatusDisplay(); // Execute smart connection indicator updates

    let lookupToken = `movie/${imdbId}.json`;
    if (contentType === "series") { lookupToken = `series/${imdbId}:${season}:${episode}.json`; }

    for (let gateway of publicScrapeGateways) {
        try {
            const checkRes = await fetch(`${gateway}${lookupToken}`);
            const payload = await checkRes.json();
            if (payload && payload.streams && payload.streams.length > 0) {
                const targetTrack = payload.streams[0]; // Isolate top stream
                let resolvedUri = targetTrack.url;
                if (targetTrack.infoHash) { resolvedUri = `magnet:?xt=urn:btih:${targetTrack.infoHash}`; }

                if (resolvedUri) {
                    lastDiscoveredMagnetLink = resolvedUri;
                    const linkInput = document.getElementById('manual-magnet-input');
                    if (linkInput) linkInput.value = resolvedUri;

                    infoMessageBox.className = "ui-notification notification-run";
                    infoMessageBox.innerHTML = `Active stream pipeline resolved! <button class="embed-copy-btn" onclick="copyStreamHashToClipboard()">📋 Copy Magnet Link</button>`;
                    executeVideoPipeline(resolvedUri);
                    return;
                }
            }
        } catch (e) { console.warn("Scraper node hop dropped target stream: ", e); }
    }
    infoMessageBox.className = "ui-notification notification-neutral";
    infoMessageBox.innerText = "No pre-configured direct stream paths responded. Paste an active link file manually above.";
}

// Coordinates live status lights dynamically to reflect real-time link selections
function updateServerStatusDisplay() {
    const selectorElement = document.getElementById('server-gateway-selector');
    const indicatorDot = document.getElementById('active-route-indicator');
    if (!selectorElement || !indicatorDot) return;

    const selectedOptionNode = selectorElement.options[selectorElement.selectedIndex];
    const targetStatusColor = selectedOptionNode.getAttribute('data-status') || "green";

    indicatorDot.className = "status-marker-dot"; 
    if (targetStatusColor === "green") indicatorDot.classList.add('marker-green');
    if (targetStatusColor === "orange") indicatorDot.classList.add('marker-orange');
    if (targetStatusColor === "red") indicatorDot.classList.add('marker-red');
}

// Executes manually selected drop-down switches during active video rendering loops
function hotSwapActiveStreamServerRoute() {
    updateServerStatusDisplay();
    const currentInputMagnet = document.getElementById('manual-magnet-input').value;
    const msgBox = document.getElementById('player-status-message');

    if (currentInputMagnet && currentInputMagnet.startsWith('magnet:?')) {
        msgBox.className = "ui-notification notification-warn";
        msgBox.innerText = "Playback server route hot-swap invoked. Re-establishing secure streaming socket connections...";
        executeVideoPipeline(currentInputMagnet);
    }
}

function executeVideoPipeline(sourceUri) {
    const targetDiv = document.getElementById('webtor-player-target');
    const videoNode = document.getElementById('web-video-player');

    targetDiv.innerHTML = "";videoNode.style.display = "none";
videoNode.src = "";
if (sourceUri.startsWith('http')) {
videoNode.style.display = "block";
videoNode.src = sourceUri;
return;
}
if (typeof webtor !== 'undefined') {
window.webtor = window.webtor || [];
window.webtor.push({
id: 'webtor-player-target',
magnet: sourceUri,
onready: function(e) { console.log('Cloud tunnel network initialized.'); }
});
} else {
videoNode.style.display = "block";
if (torrentEngineClient.torrents.length > 0) {
torrentEngineClient.torrents.forEach(t => t.destroy());
torrentEngineClient = new WebTorrent();
}
torrentEngineClient.add(sourceUri, function (torrent) {
const mediaAssetFile = torrent.files.find(f => f.name.endsWith('.mp4') || f.name.endsWith('.mkv'));
mediaAssetFile.renderTo('#web-video-player');
});
}
}
function initializeManualStreamPipeline() {
const link = document.getElementById('manual-magnet-input').value;
if (!link.startsWith('magnet:?')) { alert('Please target a valid cryptographically hashed magnet link parameter.'); return; }
lastDiscoveredMagnetLink = link;
executeVideoPipeline(link);
}
function copyStreamHashToClipboard() {
if (!lastDiscoveredMagnetLink) return;
navigator.clipboard.writeText(lastDiscoveredMagnetLink).then(() => {
alert("Link cached! Switch tabs to 'Safe Download' and paste it inside the processing pipeline tool box.");
});
}
async function fetchTargetMetadataRecords(imdbId) {
const card = document.getElementById('meta-catalog-card');
if (!card) return;
try {
const response = await fetch(https://strem.io{imdbId}.json);
const res = await response.json();
if (res && res.meta) {
document.getElementById('meta-title').innerText = res.meta.name || "Media File";
document.getElementById('meta-description').innerText = res.meta.description || "Overview parameters loading...";
document.getElementById('meta-poster').src = res.meta.poster || "";
document.getElementById('meta-cast').innerText = res.meta.cast ? res.meta.cast.slice(0, 4).join(', ') : "N/A";
card.className = "metadata-card-visible";
}
} catch (e) { console.error(e); }
}
function triggerSafeDownloadTunnelPipeline() {
const inputLink = document.getElementById('tunnel-magnet-input').value;
const box = document.getElementById('download-status-box');
if (!inputLink.startsWith('magnet:?')) { alert('Please declare a functional source link.'); return; }
box.className = "ui-notification notification-run";
box.innerText = "Handshake Confirmed: Checking microservice environment instances... Initializing background conversion arrays.";
const localEndpointUrl = http://localhost:5000/api/tunnel-download?magnet=${encodeURIComponent(inputLink)};
fetch(http://localhost:5000/api/tunnel-download, { mode: 'no-cors' })
.then(() => { window.location.href = localEndpointUrl; })
.catch(() => {
window.open(https://webtor.io, '_blank');
box.className = "ui-notification notification-neutral";
box.innerText = "Local cluster node offline. Relaying stream conversion container rules directly to external processing server configurations.";
});
}
window.onload = function() {
console.log("METASTREAM Core Engine UI Layer Successfully Connected.");
};
