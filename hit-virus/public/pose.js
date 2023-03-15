let videoElement = document.getElementById('input_video');//document.getElementById(ID): 返回具有指定 ID 属性值的第一个对象的一个引用
let canvasElement = document.getElementById('output_canvas');
let canvasCtx = canvasElement.getContext('2d');

let HumanPose;

let loaded = false;

let showCamera = false; // whether to overlay camera view on pose detection canvas

let squatForDown = false; // whether down motion is triggered by squatting
let kickForLateral = false; // whether left/right motion is triggered by kicking

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    //console.log(results.poseLandmarks);
    // if (results.poseLandmarks) {
    //     for (i = 0; i < 11; i++) {
    //         results.poseLandmarks[i] = [NaN,NaN,NaN]; // remove facial landmarks
    //     }    
    // }

    // if (showCamera){
    //     canvasCtx.drawImage(
    //         results.image, 0, 0, canvasElement.width, canvasElement.height);    
    //     drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
    //         {color: '#FF147D', lineWidth: 10});
    // }
    // else{
    //     canvasCtx.rect(0, 0, canvasElement.width, canvasElement.height);
    //     canvasCtx.fillStyle = "#042736";
    //     canvasCtx.fill();
    //     drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
    //         {color: '#FF147D', lineWidth: 20});  
    //     // drawLandmarks(canvasCtx, results.poseLandmarks,
    //     //     {color: '#FF147D', lineWidth: 1});      
    // }
    canvasCtx.restore();

    // pose detection
    if (results.poseLandmarks){
        loaded = true;
        HumanPose = results.poseLandmarks;
        // let leftHand = results.poseLandmarks[15];
        // let leftShoulder = results.poseLandmarks[11];

        // let rightHand = results.poseLandmarks[16];
        // let rightShoulder = results.poseLandmarks[12];

        // let rightKnee = results.poseLandmarks[26];
        // let leftKnee = results.poseLandmarks[25];

        // let rightHip = results.poseLandmarks[24];
        // let leftHip = results.poseLandmarks[23];

    }
}

let pose = new Pose({locateFile: (file) => {
    console.log(file);
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});
pose.setOptions({
    modelComplexity: 0,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
pose.onResults(onResults);

function setPoseModelComplexity(complexity) {
    pose.setOptions({modelComplexity: complexity});
}

let camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();