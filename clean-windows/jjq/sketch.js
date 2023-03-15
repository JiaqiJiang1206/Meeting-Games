let poseNet;
let pose;

let noseX;
let noseY;

let rightHandX;
let rightHandY;

let leftHandX;
let leftHandY;

var socket;
// let textures = [];

function preload() {
  leftBrush = loadImage('left.png');
  rightBrush = loadImage('right.png');
}

function setup() {
  ellipseMode(RADIUS);
  imageMode(CORNER);
  createCanvas(windowWidth, windowHeight);
  //socket = io.connect('http://localhost:3000');
  //准备camera
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  rectMode(CORNERS);// rect() 的前两个参数解读成形状其中一个角落的位置，而第三和第四个参数则被解读成对面角落的位置
}

function gotPoses(poses){
  if(poses.length > 0){
    pose = poses[0].pose;
  }
}

function modelLoaded(){
  console.log('poseNet ready');
}


function draw() {
  translate(video.width, 0);//视频左右翻转
  scale(-1, 1);
  background(0, 0, 0);
  image(video, 0, 0, width, width * video.height / video.width);
  translate(video.width, 0);//视频左右翻转
  scale(-1, 1);
  if(pose){
    noseX = pose.nose.x;
    noseY = pose.nose.y;
    rightHandX = pose.rightWrist.x;
    rightHandY = pose.rightWrist.y-200;
    leftHandX = pose.leftWrist.x;
    leftHandY = pose.leftWrist.y-200;
    // fill('red');
    // ellipse(noseX, noseY, 100);
    // fill('white');
  }

  // image(leftBrush, 0, 0, 200, 100);
  // image(rightBrush, width-200, 0, 200, 100);



}

