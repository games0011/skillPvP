﻿var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var path    = require('path');

app.use(express.static(path.join(__dirname,"public")));

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log("server on!: http://localhost:3000/");
});

var objects = {};

io.on('connection', function(socket){
  console.log('user connected: ', socket.id);
  objects[socket.id] = new UserObject();
  io.to(socket.id).emit('connected', GAME_SETTINGS);

  socket.on('disconnect', function(){
    delete objects[socket.id];
    console.log('user disconnected: ', socket.id);
  });
  socket.on('keydown', function(keyCode){
    objects[socket.id].keypress[keyCode]=true;
  });
  socket.on('keyup', function(keyCode){
    delete objects[socket.id].keypress[keyCode];
  });
});

var LEFT = 65, UP = 87, RIGHT = 68, DOWN = 83, ATTACK = 32, Defend = 16, SkillOne = 69, SkillTwo = 81; //움직이기는 wasd, 공격 : space, 방어 : (메이키메이키는 enter, 일반은 shift), 스킬1 : (메이키메이키는 왼_화살표, 일반은 E), 스킬2 : (메이키메이키는 오른_화살표, 일반은 Q)
var GAME_SETTINGS = {
  WIDTH : 1600, HEIGHT : 1000, BACKGROUND_COLOR : "#FFFFFF", STATUSBAR_WIDTH : 200, STATUSBAR_HEIGHT : 100
};

var update = setInterval(function(){
  var idArray=[];
  var statusArray={};
  for(var id in io.sockets.clients().connected){
    if(objects[id].keypress[LEFT])  {objects[id].status.x -= objects[id].status.speed; objects[id].status.seeing = 1;}
    if(objects[id].keypress[UP])    {objects[id].status.y -= objects[id].status.speed; objects[id].status.seeing = 3;}
    if(objects[id].keypress[RIGHT]) {objects[id].status.x += objects[id].status.speed; objects[id].status.seeing = 2;}
    if(objects[id].keypress[DOWN])  {objects[id].status.y += objects[id].status.speed; objects[id].status.seeing = 0;}
    if(objects[id].keypress[ATTACK]){objects[id].status.usingSkill = 1;}

    idArray.push(id);
    statusArray[id]=objects[id].status;
  }
  io.emit('update',idArray, statusArray);
  io.emit('healthupdate', idArray, statusArray);
},10);

function UserObject() {
  var color="#";
  var color_="#";
  for(var i = 0; i < 6; i++ ){
    color += (Math.floor(Math.random()*16)).toString(16);
    color_ += (Math.floor(Math.random()*16)).toString(16);
  }
  this.status = {};
  this.status.x = 20;
  this.status.y = 20;
  this.status.height = 20;
  this.status.width = 20;
  this.status.color = color;
  this.status.color_ = color_;
  this.keypress = [];
  this.status.health = 10;
  this.status.mana = 15;
  this.status.character = 0; //Fotia : 0, Nero : 1, Aeras : 2, Gi : 3, Fos : 4, Erebos : 5
  this.status.usingSkill = 0; //noSkill : 0, attacking : 1, Defending : 2, UsingSkillOne : 3, UsingSkillTwo : 4
  this.status.speed = 3;
  this.status.seeing = 0; //down = 0, left = 1, right = 2, up = 3
}