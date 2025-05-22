if (typeof AFRAME === 'undefined') {
  throw new Error('AFRAME not found.');
}

AFRAME.registerComponent('hover-sound', {
  init: function () {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.oscillator = null;

    this.el.addEventListener('mouseenter', (evt) => {
      this.el.setAttribute('material', 'color', 'lightseagreen');

      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          this.createOscillator();
        });
      } else {
        this.createOscillator();
      }
    });

    this.el.addEventListener('mouseleave', (evt) => {
      this.el.setAttribute('material', 'color', 'seagreen');

      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
    });
  },

  createOscillator: function () {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
    }
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.connect(this.audioContext.destination);
    oscillator.start();
    this.oscillator = oscillator;
  }
});

const createHoverSoundGrid = function() {
  const gridWidth = 7.5;
  const gridHeight = 5;
  const numRows = 5;
  const numCols = 5;
  const cellWidth = gridWidth / numCols;
  const cellHeight = gridHeight / numRows;
  
  // Create grid
  for(let i = 0; i < numCols; i++) {
    for(let j = 0; j < numRows; j++) {
      // Calculate position
      const x = (i * cellWidth) - 3;
      const y = (j * cellHeight) - 3;
      
      // Create plane element
      const plane = document.createElement('a-plane');
      plane.setAttribute('position', `${x} 0 ${y}`);
      plane.setAttribute('rotation', '-90 0 0');
      plane.setAttribute('width', cellWidth);
      plane.setAttribute('height', cellHeight);
      plane.setAttribute('material', 'color', 'seagreen');
      plane.setAttribute('hover-sound', '');
      
      // Add to scene
      document.querySelector('a-scene').appendChild(plane);
    }
  }
}
