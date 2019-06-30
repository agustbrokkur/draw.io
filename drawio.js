window.drawio = {
  tempShapes: [],
  shapes: [],
  selectedShape: "rectangle",
  canvas: document.getElementById("my-canvas"),
  ctx: document.getElementById("my-canvas").getContext("2d"),
  selectedElement: null,
  availableShapes: {
    RECTANGLE: "rectangle",
    CIRCLE: "circle",
    LINE: "line",
    TEXT: "text",
    PAINT: "paint",
    MOVE: "move"
  },
};

localStorage

function getLineNumber() {
  var slider = document.getElementById("lineRange");
  var output = document.getElementById("line-value");
  output.innerHTML = slider.value;

  slider.oninput = function() {
    output.innerHTML = this.value;
  };
};

function getFontSize() {
  var slider = document.getElementById("fontRange");
  var output = document.getElementById("font-value");
  output.innerHTML = slider.value;

  slider.oninput = function() {
    output.innerHTML = this.value;
  };
};

// Checks to see if the mouse is inside the rectangle
// If both both values are negative, that means that the
// mouse is inside the rectangle
function insideRectangle(rect, mouse) {
  var betweenX = (mouse.offsetX - rect.position.x) * (mouse.offsetX - (rect.position.x + rect.width));
  var betweenY = (mouse.offsetY - rect.position.y) * (mouse.offsetY - (rect.position.y + rect.height));
  return betweenX < 0 && 0 > betweenY;
};

// Checks to see if the mouse is inside the cirlce
// First checks how far away from the center of the circle the x and y
// coordinates are and then squares the values to make them positive
// Then the pythagoras theorem is used to check if (A^2(x) + B^2(y)) < C^2(radius)
// the mouse is the distance from the center is less than the radius
function insideCircle(circ, mouse) {
  var locX = Math.pow((mouse.offsetX - circ.center.x), 2);
  var locY = Math.pow((mouse.offsetY - circ.center.y), 2);
  var radius = Math.sqrt(locX + locY, 2);
  return radius < circ.radius;
};

// Checks if the mouse is inside of the line
// Does this by finding the slope
// Then it finds if the slope is horizontal or vertical
// And calculates from there.
// Makes sure to not check outside the line with a boundry check.
function insideLine(points, mouse) {
  var m = (points.position.y - points.endPos.y) / (points.position.x - points.endPos.x);
  var n = (points.position.x - points.endPos.x) / (points.position.y - points.endPos.y);
  m = Math.abs(m) > Math.abs(n) ? n : m;

  if (m !== n) {
    var leftSide = (mouse.offsetY - points.position.y);
    var rightSide = (m * (mouse.offsetX - points.position.x));
    var boundryCheck = 0 > ((mouse.offsetX - points.position.x) * (mouse.offsetX - points.endPos.x));
  } else {
    var leftSide = (mouse.offsetX - points.position.x);
    var rightSide = (m * (mouse.offsetY - points.position.y));
    var boundryCheck = 0 > ((mouse.offsetY - points.position.y) * (mouse.offsetY - points.endPos.y));
  }

  var middle = Math.abs(rightSide - leftSide) <= points.lineWidth;
  return middle && boundryCheck;
};

// Checks if the mouse is inside the text
function insideText(texti, mouse) {
  var lines = texti.inputText.split('\n');
  var height = 0;
  var width = 0;

  for (var i = 0; i < lines.length; i++) {
    height = texti.position.y + (i * texti.fontSize);
    if (lines[i].length > width) {
      width = lines[i].length;
    }
  }

  height = (0.72 * texti.fontSize) * (lines.length);
  width = (0.45 * texti.fontSize) * (width);

  var betweenX = (mouse.offsetX - texti.position.x) * (mouse.offsetX - (texti.position.x + width));
  var betweenY = (mouse.offsetY - texti.position.y) * (mouse.offsetY - (texti.position.y - height));

  return betweenX < 0 && 0 > betweenY;
};

// Checks to see if any drawn object has been selected
function getMove(mouseEvent) {
  for (var i = drawio.shapes.length - 1; i >= 0; i--) {
    if (drawio.shapes[i].constructor.name == "Rectangle" &&
      insideRectangle(drawio.shapes[i], mouseEvent)) {
      drawio.selectedElement = drawio.shapes[i];
      break;
    } else if (drawio.shapes[i].constructor.name == "Circle" &&
      insideCircle(drawio.shapes[i], mouseEvent)) {
      drawio.selectedElement = drawio.shapes[i];
      break;
    } else if (drawio.shapes[i].constructor.name == "Line" &&
      insideLine(drawio.shapes[i], mouseEvent)) {
      drawio.selectedElement = drawio.shapes[i];
      break;
    } else if (drawio.shapes[i].constructor.name == "Text" &&
      insideText(drawio.shapes[i], mouseEvent)) {
      drawio.selectedElement = drawio.shapes[i];
      break;
    }
  }
};

$(function() {
  // Document is loaded and parsed
  function drawCanvas() {
    if (drawio.selectedElement) {
      drawio.selectedElement.render();
    }
    for (var i = 0; i < drawio.shapes.length; i++) {
      drawio.shapes[i].render();
    }
  };


  $(".icon").on("click", function() {
    $(".icon").removeClass("selected");
    $(this).addClass("selected");
    drawio.selectedShape = $(this).data("shape");
  });

  // Mousedown
  $("#my-canvas").on("mousedown", function(mouseEvent) {
    drawio.tempShapes = []
    var colour = document.getElementById("color-select").value;
    var lineWidth = document.getElementById("line-value").innerHTML;
    var objectFilled = document.getElementById("fill").checked === true;

    var inputText = document.getElementById("text-select").value;
    var fontSize = document.getElementById("font-value").innerHTML;

    switch (drawio.selectedShape) {
      case drawio.availableShapes.RECTANGLE:
        drawio.selectedElement = new Rectangle({
          x: mouseEvent.offsetX,
          y: mouseEvent.offsetY
        }, 0, 0, colour, lineWidth, objectFilled);
        break;
      case drawio.availableShapes.CIRCLE:
        drawio.selectedElement = new Circle({
          x: mouseEvent.offsetX,
          y: mouseEvent.offsetY
        }, 0, 0, 0, colour, lineWidth, objectFilled);
        break;
      case drawio.availableShapes.LINE:
        drawio.selectedElement = new Line({
          x: mouseEvent.offsetX,
          y: mouseEvent.offsetY
        }, colour, lineWidth);
        break;
      case drawio.availableShapes.TEXT:
        drawio.selectedElement = new Text({
          x: mouseEvent.offsetX,
          y: mouseEvent.offsetY
        }, colour, objectFilled, inputText, fontSize);
        break;
      case drawio.availableShapes.PAINT:
        drawio.selectedElement = new Paint({
          x: mouseEvent.offsetX,
          y: mouseEvent.offsetY
        }, colour, lineWidth);
        break;
      case drawio.availableShapes.MOVE:
        //drawio.selectedElement
        getMove(mouseEvent);
        break;
    }
  });

  // Mousemove
  $("#my-canvas").on("mousemove", function(mouseEvent) {
    if (drawio.selectedShape == drawio.availableShapes.MOVE && drawio.selectedElement) {
      switch(drawio.selectedElement.constructor.name) {
        case "Rectangle":
          drawio.selectedElement.move({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
          drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
          drawCanvas();
          break;
        case "Circle":
          drawio.selectedElement.move({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
          drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
          drawCanvas();
          break;
        case "Line":
          drawio.selectedElement.move({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
          drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
          drawCanvas();
          break;
        case "Text":
          drawio.selectedElement.move({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
          drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
          drawCanvas();
          break;
      }
    } else if (drawio.selectedElement) {
      drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
      drawio.selectedElement.resize(mouseEvent.offsetX, mouseEvent.offsetY);
      drawCanvas();
    }
  });

  // Mouseup
  $("#my-canvas").on("mouseup", function() {
    if (drawio.selectedElement !== null) {
      drawio.shapes.push(drawio.selectedElement);
      console.log(drawio.shapes);
    }
    drawio.selectedElement = null;
  });

  // Undo last action
  $(".redo").click(function() {
    if (drawio.tempShapes.length > 0) {
      let y = drawio.tempShapes.pop();
      drawio.shapes.push(y);

      // Cleans the canvas to show the change
      drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
      drawCanvas();
    }
  });

  $(".undo").click(function() {
    if (drawio.shapes.length > 0) {
      let x = drawio.shapes.pop();
      drawio.tempShapes.push(x);

      // Cleans the canvas to show the change
      drawio.ctx.clearRect(0, 0, drawio.canvas.width, drawio.canvas.height);
      drawCanvas();
    }
  });

  // Other functions
  getLineNumber();
  getFontSize();


});
