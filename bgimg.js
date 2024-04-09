
const backgrounds = [
    '7.jpg',
    '8.jpg',
    '9.jpg',
    '10.jpg',
    '11.jpg'
];

let currentBackgroundIndex = 0;
const backgroundContainer = document.getElementById('backgroundContainer');

function changeBackground() {
    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
    const newBackground = backgrounds[currentBackgroundIndex];
    backgroundContainer.style.backgroundImage = `url('${newBackground}')`;
}
