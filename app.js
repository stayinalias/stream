// Controls sleek transition shifting mechanics with Animate.css
function switchTab(tabName) {
    // Deactivate current active button state
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Hide all view panel layers
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('animate__fadeInRight');
    });

    // Mark clicked menu item as active
    event.currentTarget.classList.add('active');

    // Reveal requested element module dynamically with side animation layer slide
    const targetContent = document.getElementById(`${tabName}-tab`);
    targetContent.classList.remove('hidden');
    // Force browser repaint to trigger entrance keyframe layout refresh cleanly
    void targetContent.offsetWidth; 
    targetContent.classList.add('animate__fadeInRight');
}

// Emulates initiating the backend remux safe download pipeline via browser triggers
function triggerSafeDownload() {
    const magnetLink = document.getElementById('magnet-input').value;
    const statusBox = document.getElementById('download-status');

    if (!magnetLink || !magnetLink.startsWith('magnet:?')) {
        alert('Please paste a valid cryptographic magnet link to invoke the stream tunnel.');
        return;
    }

    statusBox.className = "status-box active-run";
    statusBox.innerText = "Tunnel Initialized: Server sequential peer synchronization active. Processing FFmpeg stream container map directly to browser download thread...";
    
    // Points your frontend form submission directly to your running backend node address
    // Replace 'localhost' with your external VPS IP address if running Approach B
    window.location.href = `http://localhost:5000/api/tunnel-download?magnet=${encodeURIComponent(magnetLink)}`;
}
