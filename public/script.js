// Vid inicio, 
//3 veces prueba 1, 
//video 2, 
//3 veces prueba dos,
//video 3, 
//3 veces prueba 3.
//Finalizar
//Con cada vez que se hace cada prueba aparece el boton de iniciar 
//para que el aspirante pueda preparar la prueba.

//el boton verde al inicio activa start moment, se reproduce el video cuando este finalice se einicia el momento local, 
//cuando el momento local se repita 3 veces se avanza al sigueinte momento global

// Our input frames will come from here.
const videoElement =
  document.getElementsByClassName('input_video')[0];
const canvasElement =
  document.getElementsByClassName('output_canvas')[0];
const controlsElement =
  document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');

const videoScreen = document.getElementById("videoScreen");
const startButton = document.getElementById("iniciar");
const stopButton = document.getElementById("terminar");
var momentIndex = 0;
var localMomentIndex = 0;
var started = [false, false, false];
var videoUrl = ["v1.mp4", "v2.mp4", "v3.mp4"];
var enInicio = true;
var startButtonIsEnabled = false;
var stopButtonIsEnabled = false;
var enMomentoGlobalFinal = false;
var pruebaFinalizada = false;

var tiempos = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
var t0 = 0.0;
var timeIndex = 0;
// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new FPS();


// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';

  document.querySelector('.message').style.display = "none";
  prepareTest();
};
function prepareTest(params) {
  startButton.style.display = "flex";
  startButtonIsEnabled = true;
  videoScreen.load();
}


function checkOnHandEnter(results) {//1
  const handLandmarks = results.multiHandLandmarks[0];
  if (handLandmarks[16].x > 0.85 && handLandmarks[16].y < 0.2 && startButtonIsEnabled) {
    // console.log("tocando verdeeeeeeeeeee");
    if (enInicio) {
      startMoment();
    } else {
      startLocalMoment();
    }
  } else if (handLandmarks[16].x < 0.2 && handLandmarks[16].y < 0.2 && stopButtonIsEnabled) {
    registrarTiempo();
    prepareLocalmoment();
  }
}


function startMoment() {//Se inicia elprimer video y la primer etapa
  // console.log("strtMoment antes de if");
  if (!started[momentIndex]) {
    //console.log("starMmoment en if Momentndex:", momentIndex);
    started[momentIndex] = true;
    startButton.style.display = "none";
    videoScreen.style.display = "block";
    startButtonIsEnabled = false;
    videoScreen.play();
    videoScreen.muted = false;
    enInicio = false;
  }

}

function director(params) {//Comprueba la finalización del video
  //console.log(momentIndex); 
  //console.log("director antes de if");
  if (videoScreen.ended && started[momentIndex] && momentIndex < videoUrl.length && !enMomentoGlobalFinal) {
    //console.log("director en if");
    hideVideoScreen();
    setNextMoment();
    prepareLocalmoment();
  }
}

function startLocalMoment(params) {
  //hace el conteo regresivo e incia el contador

  if (localMomentIndex < 3) {
    //console.log("startlm en index, lmi:", localMomentIndex);
    //contador
    t0 = new Date().getSeconds();
    //console.log(tiempos);
    localMomentIndex++;
    startButton.style.display = "none";
    startButtonIsEnabled = false;
    stopButton.style.display = "flex";
    stopButtonIsEnabled = true;
  } else {
    // console.log("startlm en else");
    // console.log("siguiente global moment");
    nextMoment();
    localMomentIndex = 0;
  }
}



function registrarTiempo(start) {
  tiempos[timeIndex] = new Date().getSeconds() - t0;
  console.log(timeIndex);
  timeIndex++;
  console.log(tiempos);
  
}

function prepareLocalmoment(params) {
  if (localMomentIndex < 3) {
    
    startButton.style.display = "flex";
    startButtonIsEnabled = true;
    stopButton.style.display = "none";
    stopButtonIsEnabled = false;
  } else if (enMomentoGlobalFinal) {
    finalizarPrueba();
  }
  else {
    startLocalMoment();//Se pasa a el siguiente momento global
  }

}

function prepareLocalmomentVideo(params) {
  if (localMomentIndex < 3) {
    // tiempos[timeIndex] = new Date().getSeconds() - t0;
    // timeIndex++;
    // console.log(tiempos);
    startButton.style.display = "flex";
    startButtonIsEnabled = true;
    stopButton.style.display = "none";
    stopButtonIsEnabled = false;
  } else if (enMomentoGlobalFinal) {
    finalizarPrueba();
  }
  else {
    startLocalMoment();//Se pasa a el siguiente momento global
  }

}

function finalizarPrueba(params) {
  pruebaFinalizada = true;
  stopButton.style.display = "none";
  stopButtonIsEnabled = false;
  document.querySelector('.messageFinal').style.display = "block";
  saveData();
}




function nextMoment() {
  // console.log("nextMoment");
  if (!started[momentIndex]) {
    started[momentIndex] = true;
    stopButton.style.display = "none";
    stopButtonIsEnabled = false;
    videoScreen.style.display = "block";
    videoScreen.play();
    videoScreen.muted = false;
  }

}

function hideVideoScreen(params) {
  // console.log("hidevs");
  if (started[momentIndex]) {
    videoScreen.style.display = "none";
  }
}
function setNextMoment(params) {
  // console.log("setnextmoment");
  if (momentIndex < videoUrl.length - 1) {
    momentIndex++;
    videoScreen.setAttribute("src", "v" + (momentIndex + 1).toString() + ".mp4")
    videoScreen.load();
    videoScreen.pause();
  } else {
    enMomentoGlobalFinal = true;
  }
}


function onResults(results) {
  // Hide the spinner.
  document.body.classList.add('loaded');
  director();
  // Update the frame rate.
  fpsControl.tick();
  
  // Draw the overlays.
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks && results.multiHandedness) {
    checkOnHandEnter(results);

    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === 'Right';
      const landmarks = results.multiHandLandmarks[index];
      drawConnectors(
        canvasCtx, landmarks, HAND_CONNECTIONS,
        { color: isRightHand ? '#00FF00' : ' #5100d3' });
      drawLandmarks(canvasCtx, landmarks, {
        color: isRightHand ? '#00FF00' : ' #5100d3',
        fillColor: isRightHand ? ' #5100d3' : '#00FF00'
      });
    }
  }
  canvasCtx.restore();
}

saveData = () =>{
  
  const data = {
      t1: tiempos[0],
      t2: tiempos[1],
      t3: tiempos[2],
      t4: tiempos[3],
      t5: tiempos[4],
      t6: tiempos[5],
      t7: tiempos[6],
      t8: tiempos[7],
      t9: tiempos[8]
  };
 
  const options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  };
  
  fetch('/api', options);
}


const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
  }
});
hands.onResults(onResults);

/**
 * Instantiate a camera. We'll feed each frame we receive into the solution.
 */
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});
camera.start();

// Present a control panel through which the user can manipulate the solution
// options.
new ControlPanel(controlsElement, {
  selfieMode: true,
  maxNumHands: 2,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
})
  .add([
    new StaticText({ title: 'MediaPipe Hands' }),
    fpsControl,
    new Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new Slider(
      { title: 'Max Number of Hands', field: 'maxNumHands', range: [1, 4], step: 1 }),
    new Slider({
      title: 'Min Detection Confidence',
      field: 'minDetectionConfidence',
      range: [0, 1],
      step: 0.01
    }),
    new Slider({
      title: 'Min Tracking Confidence',
      field: 'minTrackingConfidence',
      range: [0, 1],
      step: 0.01
    }),
  ])
  .on(options => {
    videoElement.classList.toggle('selfie', options.selfieMode);
    hands.setOptions(options);
  });
  // console.log(startButton.po);

  