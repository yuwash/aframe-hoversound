if (typeof AFRAME === 'undefined') {
  throw new Error('AFRAME not found.');
}

AFRAME.registerComponent('hover-sound', {
  schema: {
    i: {type: 'number'},
    j: {type: 'number'},
    beatSource: {},  // Shared object, no serialization possible.
  },
  init: function () {
    const beatRateBPM = 50 + (this.data.j * 25); // Varies from 50 to 150 BPM
    const soundFrequency = 500 + (this.data.i * 250); // Varies from 500 to 1500 Hz
    const beatSource = this.data.beatSource;
    const buffer = beatSource.createBeatBuffer(beatRateBPM, soundFrequency);

    this.el.addEventListener('mouseenter', (evt) => {
      this.el.setAttribute('material', 'color', 'lightseagreen');
      beatSource.resumeBeat(buffer);
    });

    this.el.addEventListener('mouseleave', (evt) => {
      this.el.setAttribute('material', 'color', 'seagreen');
      beatSource.stopBeat();
    });
  }
});

class BeatSource {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.bufferSource = null;
  }

  createBeatBuffer(beatRateBPM, soundFrequency) {
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
        data[i] = Math.sin(2 * Math.PI * soundFrequency * i / sampleRate);
      } else {
        data[i] = 0;
      }
    }
    return buffer;
  }

  startBeat(buffer) {
    if (this.bufferSource) {
      this.bufferSource.stop();
      this.bufferSource.disconnect();
    }
    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.buffer = buffer;
    this.bufferSource.loop = true;
    this.bufferSource.connect(this.audioContext.destination);
    this.bufferSource.start();
  }

  resumeBeat(buffer){
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.startBeat(buffer);
      });
    } else {
      this.startBeat(buffer);
    }
  }

  stopBeat() {
    if (this.bufferSource) {
      this.bufferSource.stop();
      this.bufferSource.disconnect();
      this.bufferSource = null;
    }
  }
}

const createHoverSoundGrid = function() {
  const gridWidth = 7.5;
  const gridHeight = 5;
  const numRows = 5;
  const numCols = 5;
  const cellWidth = gridWidth / numCols;
  const cellHeight = gridHeight / numRows;
  const beatSource = new BeatSource();
  
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
      
      // Add custom attributes
      // Attach hover-sound mixin
      const hoverSoundData = {i, j, beatSource};
      plane.setAttribute('hover-sound', hoverSoundData);
      
      // Add to scene
      document.querySelector('a-scene').appendChild(plane);
    }
  }
};
