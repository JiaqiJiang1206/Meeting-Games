
let mydiv;

let leftShoulderX;
let leftShoulderY;
let rightShoulderX;
let rightShoulderY;
let rightElbowX;
let rightElbowY;
let leftElbowX;
let leftElbowY;
let rightWristX;
let rightWristY;
let leftWristX;
let leftWristY;
let noseX;
let noseY;

let leftShoulderZ;
let rightShoulderZ;
let zLong;

let boomX;//左右肩膀处引线的x坐标
let boomY;//左右肩膀处引线的y坐标

let dis;//clienti（i！=0）左右肩膀之间的距离

let bulletY;//clienti（i！=0）中子弹的y坐标

let clientState = 0;//clienti（i！=0）中是否处于可判定状态的标志位
let client0State = [];//client0中各个炮塔是否处于可判定状态的标志位

let clientNumberString;//收到自己为第几号客户端的中间媒介

let clientNumber;//明确自己为第几号客户端
let clientNumbers;//客户端总数目
let bulletNumber = 0;//clienti（i！=0）中判定成功的子弹数目
let bulletNumber0 = [];//玩家0收到的各个玩家判定成功的子弹数目

let color = ['red', 'rgb(94,203,246)' , 'yellow', 'green'];
let colorAll = ['white'];

let virusHP = 100;

let button;
let gameState = 0; //游戏开始，游戏结束
let tower = [];//玩家0处的炮塔

let scores = 0;
let step;
let amount = 0;
var socket;

let x =[];//移动的子弹的x坐标
let y = [];//移动的子弹的y坐标
let towerReadyX = [];//可以发射子弹的炮塔的x坐标
let towerReadyY = [];//可以发射子弹的炮塔的y坐标

let shoulderDis = [];//记录clienti(i!=0)两个肩膀的距离
let colori = [];//发射的子弹的颜色要对应炮塔的颜色

let flag = [];
let myFont;

let playerState = 0;
let player0State = 0;

let showFlag = 0;
let boomFlag = 0;

let winSoundFlag = 0;

function preload() {
    // spritesheet = loadImage('flakes32.png');
    towerImg = loadImage('/image/tower.png');
    changtiao = loadImage('/image/changtiao.png');
    virus = loadImage('/image/walk.gif');
    virus2 = loadImage('/image/walk.gif');

    redFlag = loadImage('/image/redFlag.gif');
    blueFlag = loadImage('/image/blueFlag.gif');
    yellowFlag = loadImage('/image/yellowFlag.gif');
    greenFlag = loadImage('/image/greenFlag.gif');
    boom = loadImage('/image/boom.gif');

    //shoulder = loadImage('/image/shoulder.png');
    leftShoulder = loadImage('/image/leftShoulder.png');
    rightShoulder = loadImage('/image/rightShoulder.png');
    bomb = loadImage('/image/bomb.png');
    myFont = loadFont('ipix.ttf');
    //chineseFont = loadFont('ipix.ttf');
    torch = loadImage('/image/Torch.gif');
    sit = loadImage('/image/sit.gif');

    win = loadImage('/image/win.png');

    boomSound = createAudio('boomSound.mp3');
    winSound = createAudio('winSound.mp3');
}

function setup() {
    textFont(myFont);
    flag.push(redFlag, blueFlag, yellowFlag, greenFlag);
    ellipseMode(RADIUS);
    imageMode(CORNER);
    createCanvas(windowWidth, windowHeight);
    socket = io.connect('http://localhost:8080');
    // socket = io.connect('http://10.27.122.110:3000/');
    // socket = io.connect('http://10.12.19.75:3000/');
    //准备camera
    video = createCapture(VIDEO);
    video.size(windowWidth, windowHeight);
    video.hide();
    colorAll.push(color);
    
    rectMode(CORNERS);// rect() 的前两个参数解读成形状其中一个角落的位置，而第三和第四个参数则被解读成对面角落的位置

    let body=document.getElementById("body");
    mydiv=document.createElement("div");
    body.appendChild(mydiv);//把div作为body的子元素

    bulletY = height/2;

    //明确自己是第几号客户端
    socket.on('clientState', function (clientState){
        clientNumberString = clientState;//收到自己为第几号客户端
        clientNumber = parseInt(clientNumberString);
    })

    //这里应该不需要，在用到的地方用push就可以
    for(let i = 0; i < 100; i++){
        bulletNumber0[i] = 0;
        client0State[i] = 0;
    }

    //接收客户端的数量并初始化炮塔
    socket.on('clientNumbers', function (clientNumbersServer){
        clientNumbers = clientNumbersServer;//接收目前有多少个客户端
        //console.log(clientNumbers);
        for(let i = 1; i < clientNumbers; i++){//初始化客户端
            let clientX = [];
            let clientY = [];
            //let bulletColor = [];
            clientX[i] = width/clientNumbers*i + 1;
            // if(clientX[i] > width/2)
            clientY[i] = height/1.35;
            if(i == clientNumber){
                bulletNumber0[i] = 0;
            }
            //bulletColor[i] = color[i-1];
            tower[i] = new Tower(i, clientX[i], clientY[i], bulletNumber0[i], color[(i-1)%4], shoulderDis[i]);
        }
    })

    //加分函数
    socket.on('addBullet0', function(clientNum){
        for(let i = 1; i < clientNumbers; i++){
            if(i == clientNum){
                bulletNumber0[i]++;
                tower[i].number = bulletNumber0[i];
                console.log(tower[i].number);
            }
        }
    })

    //减分函数
    socket.on('reduceBullet0', function(clientNum){
        bulletNumber--;
    })

    //接收来自客户端的肩膀距离
    socket.on('dis0', function(b){
        //console.log(b);
        shoulderDis[b[0]] = b[1];//把第i个客户端的肩膀距离放入数组的i位置
        for(let i = 1; i < shoulderDis.length; i++){
            // console.log('第'+i+'个客户端肩膀距离为'+shoulderDis[i]);
            tower[i].shoulderDis = shoulderDis[i];
        }

    })

    setInterval(function(){
        if(showFlag == 1){
            //image(bomb, (rightShoulderX+leftShoulderX)/2, (rightShoulderY+leftShoulderY)/2, 150, 150)
            showFlag = 0;
        }
    }, 1500)

}


//按下按键用于调试
// function keyPressed(){
//     socket.emit('addBullet', clientNumber);//把自己的客户端号送给服务端，以表示一次加弹药
// }

function draw() {

    translate(video.width, 0);//视频左右翻转
    scale(-1, 1);
    background(0, 0, 0);
    image(video, 0, 0, width, width * video.height / video.width);
    translate(video.width, 0);//视频左右翻转
    scale(-1, 1);

    poseReady();//定位肩膀关键点

    if(virusHP > 0){

    

    if(clientNumber == 0){

        //玩家0的游戏引导
        // if(player0State == 0){    
        //     textFont(chineseFont);
        //     textSize(64);
        //     fill('green');
        //     textWrap(WORD);
        //     text('用火把可以点燃炮弹，试试吧', 60,200);

        //     if(towerShoulderDis == 1){
        //         player0State = 1;
        //     }
        // }

        //画出病毒
        fill('purple');
        // fill(94, 203, 246);
        //ellipse(width/2, height/5, 80);
        image(virus2, width/2-100, height/5-180, 250, 250);
        textSize(70);
        text('HP:' + virusHP, width/1.7+50, height/9+10);//病毒剩余血量

        //画出鼻子上的标引线
        boomX = noseX;
        boomY = noseY;
        // ellipse(boomX, boomY, 50);
        translate(video.width, 0);//视频左右翻转
        scale(-1, 1);
        image(torch, boomX-100, boomY-100, 200, 200);
        translate(video.width, 0);//视频左右翻转
        scale(-1, 1);
        //画出炮塔的位置
        for(let i = 1; i < clientNumbers; i++){
            tower[i].towerPosition();
            panDing();
        }
        //画出从炮塔到病毒的子弹
        for(let i = 0; i < towerReadyX.length; i++){
            drawEllipse(towerReadyX[i], towerReadyY[i]-100, width/2, height/5, i);
            
        }

        //肩膀触碰子弹以开始游戏

    }else{
        if(showFlag == 1){
            image(bomb, (rightShoulderX+leftShoulderX)/2, (rightShoulderY+leftShoulderY)/2, 150, 150)
            //showFlag = 0;
        }
        if(playerState == 0){
            //玩家1及之后玩家的游戏引导
            //textFont(chineseFont);
            // rectMode(CORNER)
            // noFill();
            // rect(windowWidth/2, 50, windowWidth/3, 40)
            textSize(64);
            fill('green');
            // textWrap(WORD);
            text('ROTATE YOUR SHOULDERS ', 60,300);
            text('RIGHT AND LEFT', 60, 450);
            // textFont('Helvetica');
            // textStyle(BOLD);
            // textSize(86);
            text('('+bulletNumber + '  5)', 60, 600);
            textFont('Helvetica');
            textStyle(BOLD);
            textSize(90);
            text('/', 150, 600);
            textSize(64);
            tint(255, 167);
            textFont('myFont');
            textSize(64);
            image(sit, windowWidth-400, windowHeight -420, 250, 250)
            noTint();
            dis = zLong;
            if(HumanPose){
                // if(bulletNumber == 1){//(dis > 100 & clientState == 0){
                //     rectMode(CORNERS)
                //     fill('green');
                //     rect(windowWidth/2, 50, windowWidth/2+windowWidth/15, 90)
                // }
                // if(bulletNumber == 2){//(dis > 100 & clientState == 0){
                //     rectMode(CORNERS)
                //     fill('green');
                //     rect(windowWidth/2, 50, windowWidth/2+windowWidth*2/15, 90)
                // }
                // if(bulletNumber == 3){//(dis > 100 & clientState == 0){
                //     rectMode(CORNERS)
                //     fill('green');
                //     rect(windowWidth/2, 50, windowWidth/2+windowWidth*3/15, 90)
                // }
                // if(bulletNumber == 4){//(dis > 100 & clientState == 0){
                //     rectMode(CORNERS)
                //     fill('green');
                //     rect(windowWidth/2, 50, windowWidth/2+windowWidth*4/15, 90)
                // }
                if(bulletNumber == 5){//(dis > 100 & clientState == 0){
                    // rectMode(CORNERS)
                    // fill('green');
                    // rect(windowWidth/2, 50, windowWidth/2+windowWidth*5/15, 90)
                    playerState = 1;
                }
            }
            
        }
        
        textFont(myFont);
        if(HumanPose){
            //显示玩家名称
            for(let i = 1; i < clientNumbers; i++){
                if(i == clientNumber){
                    textSize(64);
                    fill(color[(i-1)%4]);
                    text('Player'+i, 65, 100)
                    // console.log(i);
                }
            }
            
            dis = zLong;
            let clientNumberDis = [clientNumber, dis];
            socket.emit('dis',clientNumberDis);
            //距离小于某一个值记为一次判定成功
            if(dis > 100 & clientState == 0){
                
                
                //delayTime(0.5);
                showFlag = 1;
                for (let i = 1; i < clientNumbers; i++){
                    fill(color[i-1]%4);
                }
                bulletY-=5;
                //ellipse(width/2, bulletY, 50);
                //if(bulletY < 0){
                bulletY = height/2;
                clientState = 1;
                bulletNumber++;
                // console.log('add');
                socket.emit('addBullet', clientNumber);//把自己的客户端号送给服务端，以表示一次加弹药
                //}
            }else if(showFlag == 0){
               // showFlag = 0;
                //画出左右肩膀的位置
                // fill('red');
                // ellipse(leftShoulderX, leftShoulderY, 50);
                translate(video.width, 0);//视频左右翻转
                scale(-1, 1);
                image(rightShoulder, leftShoulderX-50, leftShoulderY-100, 150, 150);
                //console.log(leftShoulderX);
                // fill('white');
                // ellipse(rightShoulderX, rightShoulderY, 50);
                image(leftShoulder, rightShoulderX-50, rightShoulderY-100, 150, 150);
                //计算左右肩膀的距离
                // dis = dist(leftShoulderX, leftShoulderY, rightShoulderX, rightShoulderY);
                translate(video.width, 0);//视频左右翻转
                scale(-1, 1);
            }
            if(dis < 50 & clientState == 1){
                clientState = 0;
                showFlag = 0
            }
        }
    }
    }else{
        
        if(winSoundFlag == 0){
            winSound.play();
            winSoundFlag++;
        }
        image(win, windowWidth/2.5, 50, 300, 300);
        fill('yellow')
        text('Congratulations', windowWidth/5, 400)
        text('You have defeated the virus', windowWidth/20, 500)
        
    }

}

//每个玩家对应的炮塔的类
class Tower{
    constructor(i, x, y, number, color, shoulderDis) {
        this.i = i;//炮塔归属于第几个玩家
        this.x = x;//炮塔的x位置坐标
        this.y = y;//炮塔的y位置坐标
        this.number = number;//炮塔剩余的子弹数目
        this.color = color;//弹药的颜色
        this.shoulderDis = shoulderDis;//肩膀的距离
    }
    // image
    //炮塔的位置
    towerPosition(){

        image(flag[(this.i-1)%4], this.x+80, this.y-130, 100, 150);

        image(towerImg, this.x-40, this.y-40, 200, 200);
        fill(this.color);
        textSize(32);
        text('x'+this.number, this.x+30, this.y-50);//写出炮弹个数
        image(bomb, this.x-25, this.y-110, 70, 70);
        //rect(this.x-30, this.y+20, this.x+70, this.y+40);//

        fill('black')
        textSize(25);
        text('player'+this.i, this.x-5, this.y+100);
        textSize(64);
        if(this.shoulderDis < 50){
            this.shoulderDis = 50;
        }
        if(this.shoulderDis > 100){
            this.shoulderDis = 100;
        }
        //fill('white');
        // let w = 96-4*this.shoulderDis/25;
        // let w = 204 - 17*this.shoulderDis/50;
        let w = 1.7*this.shoulderDis - 85;

        image(changtiao, this.x-34+w, this.y+130+20, 190-2*w, 40);//原来40前面那个数是200

        image(leftShoulder, this.x-72+30+w, this.y+112+20, 60, 60)//玩家左肩膀
        image(rightShoulder, this.x+125-w, this.y+112+20, 60, 60)//玩家右肩膀

        

    }
    //计算并比较鼻子和炮塔的距离
    towerShoulderDis(){
        this.dis = dist(windowWidth - this.x, this.y, boomX, boomY);
        if(this.dis < 150 & this.number > 0){
            // this.number--;
            return 1;
        }
        else if(this.dis > 200){
            return 2;
        }else{
            return 0;
        }
    }
}


//从一个点以直线方式移动到另一个点
function drawEllipse(x1, y1, x2, y2, i){
   
    let fenShu = 50;
    step = (x2-x1)/fenShu;//步长

    if(y[i]>height/5+10){
        image(bomb, x[i], y[i], 70, 70)
    }
    if(y[i] > y2){
        x[i]+=step;
        y[i] = (y2-y1)/(x2-x1)*(x[i]-x1)+y1;
    }
    //if(y[i] < y2+2){
        if(boomFlag == 0){
            boomSound.play();
            boomFlag = 1;
        }
        
    //}
}

//使用BlazePose定位身体关键点
function poseReady(){
    if(HumanPose){
        //console.log(HumanPose);
        leftShoulderX = HumanPose[11].x * windowWidth;
        leftShoulderY = HumanPose[11].y * windowHeight;
        rightShoulderX = HumanPose[12].x * windowWidth;
        rightShoulderY = HumanPose[12].y * windowHeight;

        leftShoulderZ = HumanPose[11].z;
        rightShoulderZ = HumanPose[12].z;
        zLong = rightShoulderZ - leftShoulderZ;
        if(zLong < 0){
            zLong*=(-200);
        }else{
            zLong*=200
        }
        //console.log('zLong: '+ zLong);
        //console.log('right: '+rightShoulderZ*(-100));
        
        noseX = HumanPose[0].x * windowWidth;
        noseY = HumanPose[0].y * windowHeight;
        //console.log(noseX);
    }
    
    
}

//判定鼻子和炮塔的距离成功后进行的操作
function panDing(){
    for(let i = 1; i < clientNumbers; i++) {
        if (tower[i].towerShoulderDis() == 1 && client0State[i] == 0) {
            boomFlag = 0;
            virusHP--;
            scores++;
            tower[i].number--;
            bulletNumber0[i]--;
            client0State[i] = 1;
            socket.emit('reduceBullet', i);//把减少弹药的客户端号传给服务器，表示该客户端减少一个弹药
            towerReadyX.push(tower[i].x);//记录要发射子弹的炮塔的x坐标，大于等于0就需要画drawEllipse
            towerReadyY.push(tower[i].y);
            x.push(tower[i].x);
            y.push(tower[i].y);
            colori.push(i);

        } else if (tower[i].towerShoulderDis() == 2 && client0State[i] == 1) {
            client0State[i] = 0;
        }
    }
}