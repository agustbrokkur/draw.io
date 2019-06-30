/*
  Define the shapes
*/

function Shape(position) {
  this.position = position;
};

Shape.prototype.render = function() {};

Shape.prototype.move = function(position) {
  this.position = position;
};

Shape.prototype.resize = function() {};

// Sub-objects:
//------------------------------------------------------------------------------
// Rectangle:
function Rectangle(position, width, height, color, lineWidth, objectFilled) {
  Shape.call(this, position);
  this.width = width;
  this.height = height;
  this.color = color;
  this.lineWidth = lineWidth;
  this.objectFilled = objectFilled;
};

// Assign the prototype
Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.render = function() {
  // Render a rectangle
  drawio.ctx.fillStyle = this.color;
  drawio.ctx.lineWidth = this.lineWidth;

  if(this.objectFilled) {
    drawio.ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  } else {
    drawio.ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }
};

Rectangle.prototype.move = function(position) {
  this.position.x = position.x - (this.width / 2);
  this.position.y = position.y - (this.height / 2);
};

Rectangle.prototype.resize = function(x, y) {
  this.width = x - this.position.x;
  this.height = y - this.position.y;
};
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Circle:
function Circle(position, width, height, radius, color, lineWidth, objectFilled) {
  Shape.call(this, position);
  this.width = width;
  this.height = height;
  this.radius = radius;
  this.color = color;
  this.lineWidth = lineWidth;
  this.objectFilled = objectFilled;

  this.center = {
    x: this.position.x,
    y: this.position.y
  };
};

// Assign the prototype
Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.render = function() {
  // Render a circle
  drawio.ctx.fillStyle = this.color;
  drawio.ctx.lineWidth = this.lineWidth;

  drawio.ctx.beginPath();
  drawio.ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
  drawio.ctx.closePath();
  if(this.objectFilled) {
    drawio.ctx.fill();
  } else {
    drawio.ctx.stroke();
  }
};

Circle.prototype.move = function(position) {
  this.center = position;
};

Circle.prototype.resize = function(x, y) {
  this.width = (x - this.position.x) / 2;
  this.height = (y - this.position.y) / 2;
  this.center.x = (x + this.position.x) / 2;
  this.center.y = (y + this.position.y) / 2;

  let z = Math.pow(this.width, 2) + Math.pow(this.height, 2);
  this.radius = Math.sqrt(z);
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// Line:
function Line(position, color, lineWidth) {
  Shape.call(this, position);
  this.color = color;
  this.lineWidth = lineWidth;
  this.endPos = {
    x: this.position.x,
    y: this.position.y
  };
};

// Assign the prototype
Line.prototype = Object.create(Shape.prototype);
Line.prototype.constructor = Line;

Line.prototype.render = function() {
  // Render a Line
  drawio.ctx.fillStyle = this.color;
  drawio.ctx.lineWidth = this.lineWidth;

  drawio.ctx.beginPath();
  drawio.ctx.moveTo(this.position.x, this.position.y);
  drawio.ctx.lineTo(this.endPos.x, this.endPos.y);
  drawio.ctx.closePath();
  drawio.ctx.stroke();
};

Line.prototype.move = function(position) {
  this.endPos.x += position.x - this.position.x;
  this.endPos.y += position.y - this.position.y;
  this.position = position;
};

Line.prototype.resize = function(x, y) {
  this.endPos.x = x;
  this.endPos.y = y;
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// Text:
function Text(position, color, objectFilled, inputText, fontSize) {
  Shape.call(this, position);
  this.color = color;
  this.objectFilled = objectFilled;
  this.inputText = inputText;
  this.fontSize = fontSize;
};

Text.prototype = Object.create(Shape.prototype);
Text.prototype.constructor = Text;

Text.prototype.render = function() {
  // Render the text
  drawio.ctx.fillStyle = this.color;
  drawio.ctx.font = this.fontSize.toString() + "px Arial";
  var lines = this.inputText.split('\n');

  if(this.objectFilled) {
    for(var i = 0; i < lines.length; i++) {
      drawio.ctx.fillText(lines[i], this.position.x, this.position.y + (i * this.fontSize));
    }
  } else {
    //(this.position.y + this.fontSize)
    for(var i = 0; i < lines.length; i++) {
      drawio.ctx.strokeText(lines[i], this.position.x, (this.position.y + this.fontSize) * (i + 1));
    }
  }
};

Text.prototype.move = function(position) {
  this.position = position;
  //console.log(position);
}

Text.prototype.resize = function(x, y) {
  this.position.x = x;
  this.position.y = y;
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// Paint:
function Paint(position, color, lineWidth) {
  Shape.call(this, position);
  this.color = color;
  this.lineWidth = lineWidth;
  this.endPos = {
    x: this.position.x,
    y: this.position.y
  };
  this.list = [];
};

Paint.prototype = Object.create(Shape.prototype);
Paint.prototype.constructor = Paint;

Paint.prototype.render = function() {
  // Render the paintbrush
  drawio.ctx.fillStyle = this.color;
  drawio.ctx.lineWidth = this.lineWidth;

  drawio.ctx.beginPath();
  for(var i = 0; i < this.list.length; i++) {
    drawio.ctx.moveTo(this.list[i][0].x, this.list[i][0].y);
    drawio.ctx.lineTo(this.list[i][1].x, this.list[i][1].y);
  }
  drawio.ctx.closePath();
  drawio.ctx.stroke();
};

Paint.prototype.resize = function(x, y) {
  this.list.push([
    n = { x: this.position.x, y: this.position.y },
    m = { x: this.endPos.x, y: this.endPos.y }
  ]);
  this.position.x = this.endPos.x;
  this.position.y = this.endPos.y;
  this.endPos.x = x;
  this.endPos.y = y;
}
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// Move:
