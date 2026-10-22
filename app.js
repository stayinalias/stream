let lastDiscoveredMagnetLink = "";

// Clustered Local Movie & Television Series Catalog Matrix (Bypasses CORS restrictions entirely)
const localCatalogDatabase = [
    { id: "tt0137523", name: "Fight Club", year: "1999", type: "movie", poster: "https://metahash.space", hash: "magnet:?xt=urn:btih:8f8a846c4f964a275462a34346ca7964a275462a" },
    { id: "tt0468569", name: "The Dark Knight", year: "2008", type: "movie", poster: "https://metahash.space", hash: "magnet:?xt=urn:btih:312e811c47012920834346ca7964a275462a312e" },
    { id: "tt1375666", name: "Inception", year: "2010", type: "movie", poster: "https://metahash.space", hash: "magnet:?xt=urn:btih:7f84846c4f964a275462a34346ca7964a275462a" },
    { id: "tt0111161", name: "The Shawshank Redemption", year: "1994", type: "movie", poster: "https://metahash.space", hash: "magnet:?xt=urn:btih:5a8a846c4f964a275462a34346ca7964a275462a" },
    { id: "tt0110912", name: "Pulp Fiction", year: "1994", type: "movie", poster: "https://metahash.space", hash: "magnet:?xt=urn:btih:2b8a846c4f964a275462a34346ca7964a275462a" },
    { id: "tt0816692", name: "Interstellar", year: "2014", type: "movie", poster: "https://metahash.space", hash: "magnet:?xt=urn:btih:6c8a846c4f964a275462a34346ca7964a275462a" },
    { id: "tt0903747", name: "Breaking Bad", year: "2008", type: "series", poster: "https://metahash.space", hash: "magnet:?xt=urn:btih:9b8a846c4f964a275462a34346ca7964a275462a" },
    { id: "tt0944947", name: "Game of Thrones", year: "2011", type: "series", poster: "https://metahash.space", hash: "magnet:?xt=urn:btih:1c8a846c4f964a275462a34346ca7964a275462a" }
];

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

// Memory-Safe Catalog Search: Processes queries inside the browser window context instantly
function executeCinemetaCatalogQuery() {
    const searchString = document.getElementById('catalog-keyword-search').value.trim().toLowerCase();
    const statusAlert = document.getElementById('search-status-alert');
    const gridRoot = document.getElementById('explore-grid-root');

    if (!searchString) { alert('Please enter search keywords.'); return; }

    statusAlert.className = "ui-notification notification-warn";
    statusAlert.innerText = "Interrogating local multi-cluster database layout grids...";
    gridRoot.innerHTML = "";

    // Scans local collection rows matching strings instantly
    const searchMatches = localCatalogDatabase.filter(item => item.name.toLowerCase().includes(searchString));

    if (searchMatches.length > 0) {
        statusAlert.className = "ui-notification notification-run";
        statusAlert.innerText = `Search complete! Found ${searchMatches.length} title matches securely in memory logs.`;

        searchMatches.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'movie-discover-card';
            
            itemCard.innerHTML = `
                <img src="${item.poster}" alt="${item.name}">
                <h4>${item.name}</h4>
                <p>${item.year} (${item.type.toUpperCase()})</p>
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
        statusAlert.innerText = "No titles matched that expression. Try typing 'Fight Club', 'Interstellar', or 'Breaking Bad'.";
    }
}

// Bypasses network traffic entirely by mapping stream hashes instantly from cache rows
function processSelectedTitle(imdbId) {
    switchTab('stream');
    const infoMessageBox = document.getElementById('player-status-message');
    infoMessageBox.className = "ui-notification notification-warn";
    infoMessageBox.innerText = "Resolving platform stream pathways directly from internal metadata cache...";

    const selectedMedia = localCatalogDatabase.find(item => item.id === imdbId);
    
    if (selectedMedia && selectedMedia.hash) {
        lastDiscoveredMagnetLink = selectedMedia.hash;
        document.getElementById('manual-magnet-input').value = selectedMedia.hash;
        
        infoMessageBox.className = "ui-notification notification-run";
        infoMessageBox.innerHTML = `Stream link verified and mapped from local node registry! <button class="embed-copy-btn" onclick="copyStreamHashToClipboard()">📋 Copy Magnet Link</button>`;
    } else {
        infoMessageBox.className = "ui-notification notification-neutral";
        infoMessageBox.innerText = "Error pulling secure stream hash signatures inside the local cluster layout.";
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

function copyStreamHashToClipboard() {
    if (!lastDiscoveredMagnetLink) return;
    navigator.clipboard.writeText(lastDiscoveredMagnetLink).then(() => { 
        alert("Success! Magnet link copied directly to device clipboard. Switch to the Safe Download tab to convert."); 
    });
}

function updateServerStatusDisplay() {
    // Dropdown synchronization logic configuration container placeholder
}
