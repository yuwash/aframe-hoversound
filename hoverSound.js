if (typeof AFRAME === 'undefined') {
  throw new Error('AFRAME not found.');
}

AFRAME.registerComponent('hover-sound', {
  init: function () {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const beatRateBPM = 96;
    this.buffer = this.createBeatBuffer(beatRateBPM);
    this.bufferSource = null;

    this.el.addEventListener('mouseenter', (evt) => {
      this.el.setAttribute('material', 'color', 'lightseagreen');

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          this.startBeat();
        });
      } else {
        this.startBeat();
      }
    });

    this.el.addEventListener('mouseleave', (evt) => {
      this.el.setAttribute('material', 'color', 'seagreen');
      this.stopBeat();
    });
  },

  createBeatBuffer: function(beatRateBPM) {
    const audioContext = this.audioContext;
    const beatDuration = 60 / beatRateBPM;
    const sampleRate = audioContext.sampleRate;
    const bufferSize = Math.round(sampleRate * beatDuration);
    const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    const clickDuration = 0.1; // 100ms
    const clickSamples = Math.round(sampleRate * clickDuration);

    for (let i = 0; i < bufferSize; i++) {
      if (i < clickSamples) {
        data[i] = Math.sin(2 * Math.PI * 1000 * i / sampleRate);
      } else {
        data[i] = 0;
      }
    }
    return buffer;
  },

  startBeat: function() {
    if (this.bufferSource) {
      this.bufferSource.stop();
      this.bufferSource.disconnect();
    }
    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.buffer = this.buffer;
    this.bufferSource.loop = true;
    this.bufferSource.connect(this.audioContext.destination);
    this.bufferSource.start();
  },

  stopBeat: function() {
    if (this.bufferSource) {
      this.bufferSource.stop();
      this.bufferSource.disconnect();
      this.bufferSource = null;
    }
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
