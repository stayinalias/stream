let webTorrentClient = new WebTorrent();

function startInlineStream() {
    const magnetLink = document.getElementById('stream-magnet-input').value;
    const statusText = document.getElementById('player-status');
    const videoPlayer = document.getElementById('web-video-player');

    if (!magnetLink || !magnetLink.startsWith('magnet:?')) {
        alert('Please enter a valid movie magnet streaming link.');
        return;
    }

    statusText.innerText = "Connecting to streaming multi-servers and swarms... Please wait.";

    // Start streaming directly onto the web interface
    webTorrentClient.add(magnetLink, function (torrent) {
        // Automatically isolate the largest media file container
        const file = torrent.files.find(function (file) {
            return file.name.endsWith('.mp4') || file.name.endsWith('.mkv') || file.name.endsWith('.webm');
        });

        statusText.innerText = `Streaming active: ${file.name} | Fetching sequential fragments...`;
        
        // Instruct WebTorrent engine to stream chunks into our HTML5 video object container
        file.renderTo('#web-video-player');
    });
}

// Keep your existing switchTab and triggerSafeDownload functions beneath this code block...
