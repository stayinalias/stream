let torrentEngineClient = new WebTorrent();
const publicScrapeGateways = [
    "https://strem.fun",
    "https://elfhosted.com"
];
let lastDiscoveredMagnetLink = "";

function switchTab(targetTabId) {
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.add('view-hidden');
        panel.classList.remove('view-visible');
    });

    const targetedBtn = document.getElementById(`btn-${targetTabId}`);
    if (targetedBtn) targetedBtn.classList.add('active');

    const selectedView = document.getElementById(`${targetTabId}-viewport`);
    if (selectedView) {
        selectedView.classList.remove('view-hidden');
        selectedView.classList.add('view-visible');
    }
}

function evaluateSearchInputTrigger(eventInstance) {
    if (eventInstance.key === 'Enter') executeCinemetaCatalogQuery();
}

async function executeCinemetaCatalogQuery() {
    const searchString = document.getElementById('catalog-keyword-search').value.trim();
    const statusAlert = document.getElementById('search-status-alert');
    const gridRoot = document.getElementById('explore-grid-root');

    if (!searchString) { alert('Please enter keywords.'); return; }

    statusAlert.className = "ui-notification notification-warn";
    statusAlert.innerText = `Searching Cinemeta catalog records for: "${searchString}"...`;
    gridRoot.innerHTML = "";

    try {
        const response = await fetch(`https://strem.io{encodeURIComponent(searchString)}.json`);
        const dataPayload = await response.json();

        if (dataPayload && dataPayload.metas && dataPayload.metas.length > 0) {
            statusAlert.className = "ui-notification notification-run";
            statusAlert.innerText = `Search engine completed. Found ${dataPayload.metas.length} matches.`;
            gridRoot.className = "catalog-grid-mount explore-grid-active";

            dataPayload.metas.forEach(item => {
                if (!item.poster) return;
                const itemCard = document.createElement('div');
                itemCard.className = 'movie-discover-card';
                const verifiedType = item.type === "series" ? "series" : "movie";
                let interactionControlsHTML = `<button class="catalog-stream-btn" onclick="directRouteToStreamTab('${verifiedType}', '${item.id}')">Select Title</button>`;
                
                if (verifiedType === "series") {
                    interactionControlsHTML = `
                        <div class="tv-selector-row">
                            <select id="season-${item.id}" onchange="extendTelevisionEpisodeDropdownLimits('${item.id}')"><option value="1">Season 1</option><option value="2">Season 2</option></select>
                            <select id="episode-${item.id}"><option value="1">Episode 1</option><option value="2">Episode 2</option></select>
                        </div>
                        <button class="catalog-stream-btn tv-btn" onclick="parseTvControlsAndRoute('${item.id}')">Select Episode</button>`;
                }

                itemCard.innerHTML = `<img src="${item.poster}" alt="${item.name}"><h4>${item.name}</h4><p>${item.year || 'N/A'}</p>${interactionControlsHTML}`;
                
                itemCard.addEventListener('mouseenter', () => {
                    const backdrop = document.getElementById('dynamic-blur-backdrop');
                    if (backdrop) {
                        backdrop.style.backgroundImage = `url('${item.poster}')`;
                        backdrop.style.filter = "blur(35px) brightness(0.25)";
                    }
                });
                gridRoot.appendChild(itemCard);
            });
        } else {
            statusAlert.className = "ui-notification notification-neutral";
            statusAlert.innerText = "No directory items matched that expression.";
        }
    } catch (err) { console.error(err); }
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

function directRouteToStreamTab(contentType, imdbId, season = null, episode = null) {
    switchTab('stream');
    const manualLinkInputBox = document.getElementById('manual-magnet-input');
    if (manualLinkInputBox) manualLinkInputBox.value = "";
    autoScrapeFromGateways(contentType, imdbId, season, episode);
}

async function autoScrapeFromGateways(contentType, imdbId, season = null, episode = null) {
    const infoMessageBox = document.getElementById('player-status-message');
    if (!infoMessageBox) return;
    infoMessageBox.className = "ui-notification notification-warn";
    infoMessageBox.innerText = `Contacting background aggregators...`;

    fetchTargetMetadataRecords(imdbId);
    updateServerStatusDisplay();

    let lookupToken = `movie/${imdbId}.json`;
    if (contentType === "series") { lookupToken = `series/${imdbId}:${season}:${episode}.json`; }

    for (let gateway of publicScrapeGateways) {
        try {
            const checkRes = await fetch(`${gateway}${lookupToken}`);
            const payload = await checkRes.json();
            if (payload && payload.streams && payload.streams.length > 0) {
                const targetTrack = payload.streams[0];
                let resolvedUri = targetTrack.url;
                if (targetTrack.infoHash) { resolvedUri = `magnet:?xt=urn:btih:${targetTrack.infoHash}`; }

                if (resolvedUri) {
                    lastDiscoveredMagnetLink = resolvedUri;
                    const linkInput = document.getElementById('manual-magnet-input');
                    if (linkInput) linkInput.value = resolvedUri;
                    infoMessageBox.className = "ui-notification notification-run";
                    infoMessageBox.innerHTML = `Stream resolved! <button class="embed-copy-btn" onclick="copyStreamHashToClipboard()">📋 Copy Magnet</button>`;
                    executeVideoPipeline(resolvedUri);
                    return;
                }
            }
        } catch (e) { console.warn(e); }
    }
    infoMessageBox.className = "ui-notification notification-neutral";
    infoMessageBox.innerText = "No stream paths responded.";
}

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

function hotSwapActiveStreamServerRoute() {
    updateServerStatusDisplay();
    const currentInputMagnet = document.getElementById('manual-magnet-input').value;
    if (currentInputMagnet && currentInputMagnet.startsWith('magnet:?')) executeVideoPipeline(currentInputMagnet);
}

function executeVideoPipeline(sourceUri) {
    const targetDiv = document.getElementById('webtor-player-target');
    const videoNode = document.getElementById('web-video-player');
    targetDiv.innerHTML = "";
    videoNode.style.display = "none";
    videoNode.src = "";

    if (sourceUri.startsWith('http')) {
        videoNode.style.display = "block";
        videoNode.src = sourceUri;
        return;
    }

    if (typeof webtor !== 'undefined') {
        window.webtor = window.webtor || [];
        window.webtor.push({ id: 'webtor-player-target', magnet: sourceUri, onready: function(e) {} });
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
    if (!link.startsWith('magnet:?')) return;
    lastDiscoveredMagnetLink = link;
    executeVideoPipeline(link);
}

function copyStreamHashToClipboard() {
    if (!lastDiscoveredMagnetLink) return;
    navigator.clipboard.writeText(lastDiscoveredMagnetLink).then(() => { alert("Link copied!"); });
}

async function fetchTargetMetadataRecords(imdbId) {
    const card = document.getElementById('meta-catalog-card');
    if (!card) return;
    try {
        const response = await fetch(`https://strem.io{imdbId}.json`);
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
if (!inputLink.startsWith('magnet:?')) return;
box.className = "ui-notification notification-run";
box.innerText = "Checking backend cluster environment instances...";
window.open(https://webtor.io, '_blank');
}
