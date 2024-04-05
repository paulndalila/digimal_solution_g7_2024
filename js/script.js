var myCanvas = document.getElementById("myCanvas");
myCanvas.width = 500;
myCanvas.height = 340;

var ctx = myCanvas.getContext("2d");

function drawLine(ctx, startX, startY, endX, endY, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.restore();
}

function drawArc(ctx, centerX, centerY, radius, startAngle, endAngle, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.stroke();
  ctx.restore();
}

function drawPieSlice(
  ctx,
  centerX,
  centerY,
  radius,
  startAngle,
  endAngle,
  fillColor,
  strokeColor
) {
  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

class PieChart {
  constructor(options) {
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;
    this.titleOptions = options.titleOptions;
    this.totalValue = [...Object.values(this.options.data)].reduce((a, b) => a + b, 0);
    this.radius = Math.min(this.canvas.width / 2, this.canvas.height / 2) - options.padding;
  }

  drawSlices() {
    var colorIndex = 0;
    var startAngle = -Math.PI / 2;

    for (var categ in this.options.data) {
      var val = this.options.data[categ];
      var sliceAngle = (2 * Math.PI * val) / this.totalValue;

      drawPieSlice(
        this.ctx,
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.radius,
        startAngle,
        startAngle + sliceAngle,
        this.colors[colorIndex % this.colors.length]
      );

      startAngle += sliceAngle;
      colorIndex++;
    }

    if (this.options.doughnutHoleSize) {
      drawPieSlice(
        this.ctx,
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.options.doughnutHoleSize * this.radius,
        0,
        2 * Math.PI,
        "#FFF",
        "#FFF"
      );

      drawArc(
        this.ctx,
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.options.doughnutHoleSize * this.radius,
        0,
        2 * Math.PI,
        "#000"
      );
    }
  }

  drawLabels() {
    var colorIndex = 0;
    var startAngle = -Math.PI / 2;
    for (var categ in this.options.data) {
      var val = this.options.data[categ];
      var sliceAngle = (2 * Math.PI * val) / this.totalValue;
      var labelX =
        this.canvas.width / 2 +
        (this.radius / 2) * Math.cos(startAngle + sliceAngle / 2);
      var labelY =
        this.canvas.height / 2 +
        (this.radius / 2) * Math.sin(startAngle + sliceAngle / 2);

      if (this.options.doughnutHoleSize) {
        var offset = (this.radius * this.options.doughnutHoleSize) / 2;
        labelX =
          this.canvas.width / 2 +
          (offset + this.radius / 2) * Math.cos(startAngle + sliceAngle / 2);
        labelY =
          this.canvas.height / 2 +
          (offset + this.radius / 2) * Math.sin(startAngle + sliceAngle / 2);
      }

      var labelText = Math.round((100 * val) / this.totalValue);
      this.ctx.fillStyle = "black";
      this.ctx.font = "32px Khand";
      this.ctx.fillText(labelText + "%", labelX, labelY);
      startAngle += sliceAngle;
    }
  }

  drawTitle() {
    this.ctx.save();

    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = this.titleOptions.align;
    this.ctx.fillStyle = this.titleOptions.fill;
    this.ctx.font = `${this.titleOptions.font.weight} ${this.titleOptions.font.size} ${this.titleOptions.font.family}`;

    let xPos = this.canvas.width / 2;

    if (this.titleOptions.align == "left") {
      xPos = 10;
    }
    if (this.titleOptions.align == "right") {
      xPos = this.canvas.width - 10;
    }

    this.ctx.fillText(this.options.seriesName, xPos, this.canvas.height);

    this.ctx.restore();
  }

  drawLegend() {
    let pIndex = 0;
    let legend = document.querySelector("div[for='myCanvas']");
    let ul = document.createElement("ul");
    legend.append(ul);

    for (let ctg of Object.keys(this.options.data)) {
      let li = document.createElement("li");
      li.style.listStyle = "none";
      li.style.borderLeft =
        "20px solid " + this.colors[pIndex % this.colors.length];
      li.style.padding = "5px";
      li.textContent = ctg;
      ul.append(li);
      pIndex++;
    }
  }

  draw() {
    this.drawSlices();
    this.drawLabels();
    this.drawTitle();
    this.drawLegend();
  }
}

var myPiechart = new PieChart({
  canvas: myCanvas,
  seriesName: "Distribution Stats",
  padding: 40,
  data: {
    "Recieved": 16,
    "Not Recieved": 12,
    "Distributed": 18,
    "Distributing": 32,
    "Pending": 20
  },
  colors: ["red", "green","blue","orange","brown"],
  titleOptions: {
    align: "center",
    fill: "black",
    font: {
      weight: "bold",
      size: "18px",
      family: "Lato"
    }
  }
});

myPiechart.draw();
