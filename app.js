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

async function executeCinemetaCatalogQuery() {
    const searchString = document.getElementById('catalog-keyword-search').value.trim();
    const statusAlert = document.getElementById('search-status-alert');
    const gridRoot = document.getElementById('explore-grid-root');

    if (!searchString) { alert('Please enter search keywords.'); return; }

    statusAlert.className = "ui-notification notification-warn";
    statusAlert.innerText = "Searching global databases... Please wait.";
    gridRoot.innerHTML = "";

    try {
        const response = await fetch(`https://strem.io{encodeURIComponent(searchString)}.json`);
        const dataPayload = await response.json();

        if (dataPayload && dataPayload.metas && dataPayload.metas.length > 0) {
            statusAlert.className = "ui-notification notification-run";
            statusAlert.innerText = `Search complete. Found ${dataPayload.metas.length} matches.`;

            dataPayload.metas.forEach(item => {
                if (!item.poster) return;
                const itemCard = document.createElement('div');
                itemCard.className = 'movie-discover-card';
                
                itemCard.innerHTML = `
                    <img src="${item.poster}" alt="${item.name}">
                    <h4>${item.name}</h4>
                    <p>${item.year || 'N/A'}</p>
                    <button class="catalog-stream-btn" onclick="processSelectedTitle('${item.id}')">Select Title</button>
                `;
                
                itemCard.addEventListener('mouseenter', () => {
                    const backdrop = document.getElementById('dynamic-blur-backdrop');
                    if (backdrop) {
                        backdrop.style.backgroundImage = `url('${item.poster}')`;
                        backdrop.style.filter = "blur(30px) brightness(0.2)";
                    }
                });
                gridRoot.appendChild(itemCard);
            });
        } else {
            statusAlert.className = "ui-notification notification-neutral";
            statusAlert.innerText = "No titles matched that expression.";
        }
    } catch (err) {
        statusAlert.className = "ui-notification notification-neutral";
        statusAlert.innerText = "Error fetching data. Check your connection rules.";
    }
}

async function processSelectedTitle(imdbId) {
    switchTab('stream');
    const infoMessageBox = document.getElementById('player-status-message');
    infoMessageBox.className = "ui-notification notification-warn";
    infoMessageBox.innerText = "Resolving platform stream pathways...";

    try {
        const response = await fetch(`https://strem.fun{imdbId}.json`);
        const payload = await response.json();
        
        if (payload && payload.streams && payload.streams.length > 0) {
            const topStream = payload.streams[0];
            let resolvedUri = topStream.url;
            if (topStream.infoHash) {
                resolvedUri = `magnet:?xt=urn:btih:${topStream.infoHash}`;
            }

            if (resolvedUri) {
                lastDiscoveredMagnetLink = resolvedUri;
                document.getElementById('manual-magnet-input').value = resolvedUri;
                infoMessageBox.className = "ui-notification notification-run";
                infoMessageBox.innerText = "Stream link extracted successfully! Click button below to stream.";
            }
        } else {
            infoMessageBox.className = "ui-notification notification-neutral";
            infoMessageBox.innerText = "No stream links found for this title.";
        }
    } catch (e) {
        infoMessageBox.className = "ui-notification notification-neutral";
        infoMessageBox.innerText = "Failed to contact scraper nodes.";
    }
}

function initializeManualStreamPipeline() {
    const link = document.getElementById('manual-magnet-input').value;
    if (!link) { alert('No stream link available.'); return; }
    
    if (link.startsWith('http')) {
        window.open(link, '_blank');
    } else if (link.startsWith('magnet:?')) {
        window.open(`https://webtor.io{link}`, '_blank');
    }
}

function triggerSafeDownloadTunnelPipeline() {
    const inputLink = document.getElementById('tunnel-magnet-input').value;
    if (!inputLink.startsWith('magnet:?')) { alert('Please insert a valid magnet link.'); return; }
    window.open(`https://webtor.io{inputLink}`, '_blank');
}

function updateServerStatusDisplay() {
    // Dropdown structural placeholder
}
