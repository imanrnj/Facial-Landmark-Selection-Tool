const image = document.getElementById('image');
const canvas = document.getElementById('canvas');
const areasList = document.getElementById('areas-list');
const addAreaBtn = document.getElementById('add-area-btn');
const ctx = canvas.getContext('2d');

let landmarks = [];
let areas = [];
let activeAreaId = null;

const areaColors = [
    'rgba(255, 87, 34, 0.5)',  // Deep Orange
    'rgba(33, 150, 243, 0.5)', // Blue
    'rgba(76, 175, 80, 0.5)',  // Green
    'rgba(255, 235, 59, 0.5)', // Yellow
    'rgba(156, 39, 176, 0.5)', // Purple
];

const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults(onResults);

const processImage = () => {
    canvas.width = image.width;
    canvas.height = image.height;
    faceMesh.send({ image: image });
};

if (image.complete) {
    processImage();
} else {
    image.onload = processImage;
}

function onResults(results) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        landmarks = results.multiFaceLandmarks[0];
        drawLandmarks(landmarks);
        redrawCanvas();
    }
}

function drawLandmarks(landmarksToDraw) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    for (let i = 0; i < landmarksToDraw.length; i++) {
        const landmark = landmarksToDraw[i];
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}

canvas.addEventListener('click', (event) => {
    if (!activeAreaId) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedLandmarkIndex = findClickedLandmark(x, y);

    if (clickedLandmarkIndex !== -1) {
        toggleLandmarkSelection(clickedLandmarkIndex);
        redrawCanvas();
        updateAreasList();
    }
});

function findClickedLandmark(x, y) {
    for (let i = 0; i < landmarks.length; i++) {
        const landmark = landmarks[i];
        const landmarkX = landmark.x * canvas.width;
        const landmarkY = landmark.y * canvas.height;
        const distance = Math.sqrt(Math.pow(x - landmarkX, 2) + Math.pow(y - landmarkY, 2));
        if (distance <= 5) return i;
    }
    return -1;
}

function toggleLandmarkSelection(index) {
    const area = areas.find(a => a.id === activeAreaId);
    if (!area) return;

    const landmarkIndex = area.landmarks.indexOf(index);
    if (landmarkIndex > -1) {
        area.landmarks.splice(landmarkIndex, 1);
    } else {
        area.landmarks.push(index);
    }
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLandmarks(landmarks);
    drawAllAreas();
    highlightAllSelectedLandmarks();
}

function drawAllAreas() {
    for (const area of areas) {
        if (area.landmarks.length > 2) {
            ctx.beginPath();
            const firstLandmark = landmarks[area.landmarks[0]];
            ctx.moveTo(firstLandmark.x * canvas.width, firstLandmark.y * canvas.height);
            for (let i = 1; i < area.landmarks.length; i++) {
                const landmark = landmarks[area.landmarks[i]];
                ctx.lineTo(landmark.x * canvas.width, landmark.y * canvas.height);
            }
            ctx.closePath();
            ctx.fillStyle = area.color;
            ctx.fill();
        }
    }
}

function highlightAllSelectedLandmarks() {
    for (const area of areas) {
        ctx.fillStyle = area.color.replace('0.5', '1'); // Make color solid for points
        for (const index of area.landmarks) {
            const landmark = landmarks[index];
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

function updateAreasList() {
    areasList.innerHTML = '';
    areas.forEach(area => {
        const areaItem = document.createElement('div');
        areaItem.className = 'area-item';
        areaItem.style.borderLeftColor = area.color;
        if (area.id === activeAreaId) {
            areaItem.classList.add('active');
        }

        const areaIndices = document.createElement('div');
        areaIndices.className = 'area-indices';
        const sortedLandmarks = [...area.landmarks].sort((a, b) => a - b);
        areaIndices.textContent = `[${sortedLandmarks.join(', ')}]`;
        areaItem.appendChild(areaIndices);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'area-item-buttons';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = `<svg fill="#2196F3" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
        copyBtn.onclick = (e) => {
            e.stopPropagation();
            const indicesText = `[${sortedLandmarks.join(', ')}]`;
            navigator.clipboard.writeText(indicesText).then(() => {
                showToast('Copied to clipboard!');
            });
        };
        buttonContainer.appendChild(copyBtn);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-area-btn';
        removeBtn.innerHTML = `<svg fill="#f44336" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
        removeBtn.onclick = () => removeArea(area.id);
        buttonContainer.appendChild(removeBtn);
        
        areaItem.appendChild(buttonContainer);

        areaItem.onclick = (e) => {
            if (!buttonContainer.contains(e.target)) {
                setActiveArea(area.id);
            }
        };

        areasList.appendChild(areaItem);
    });
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function addArea() {
    const newArea = {
        id: Date.now(),
        landmarks: [],
        color: areaColors[areas.length % areaColors.length]
    };
    areas.push(newArea);
    setActiveArea(newArea.id);
}

function removeArea(id) {
    areas = areas.filter(a => a.id !== id);
    if (activeAreaId === id) {
        // If the active area is deleted, make the last one active, or none if list is empty
        setActiveArea(areas.length > 0 ? areas[areas.length - 1].id : null);
    }
    redrawCanvas();
    updateAreasList();
}

function setActiveArea(id) {
    activeAreaId = id;
    updateAreasList();
}

// The '+' button now always adds a new area.
addAreaBtn.addEventListener('click', addArea);

const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
        redrawCanvas();
    }
});

resizeObserver.observe(image);