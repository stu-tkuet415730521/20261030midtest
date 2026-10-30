const W = 900;
const H = 820;

let canvas;
let scaleFactor = 1;

let dragging = null;
let dragFrom = -1;
let submitted = false;
let score = 0;
let startTime;
let endTime;

const parts = [
  {
    name: "花",
    type: "flower",
    x: 450,
    y: 145,
    color: "#e85aad",
    description: "植物的生殖器官，可發育成果實和種子"
  },
  {
    name: "葉",
    type: "leaf",
    x: 330,
    y: 300,
    color: "#2f9e44",
    description: "主要進行光合作用，製造植物所需的養分"
  },
  {
    name: "莖",
    type: "stem",
    x: 450,
    y: 330,
    color: "#a0612d",
    description: "支持植物，並運送水分與養分"
  },
  {
    name: "果實",
    type: "fruit",
    x: 570,
    y: 255,
    color: "#f08c00",
    description: "通常由花的子房發育而成，可保護種子"
  },
  {
    name: "種子",
    type: "seed",
    x: 570,
    y: 385,
    color: "#8d5524",
    description: "含有胚，是植物繁殖與生長的起點"
  },
  {
    name: "根",
    type: "root",
    x: 450,
    y: 490,
    color: "#8d5524",
    description: "固定植物，吸收水分與礦物質"
  }
];

let cards = [];

function setup() {
  canvas = createCanvas(W, H);
  canvas.style("display", "block");
  canvas.style("margin", "0 auto");
  canvas.style("touch-action", "none");

  textFont("Arial, Microsoft JhengHei, sans-serif");

  cards = shuffle(parts.map((part, i) => ({
    name: part.name,
    type: part.type,
    color: part.color,
    homeX: 65 + (i % 3) * 270,
    homeY: 625 + floor(i / 3) * 55,
    x: 65 + (i % 3) * 270,
    y: 625 + floor(i / 3) * 55,
    w: 240,
    h: 40,
    target: -1,
    offsetX: 0,
    offsetY: 0
  })));

  startTime = millis();
  resizeGame();
}

function draw() {
  background("#f3f8f1");

  drawTitle();
  drawPlantArea();
  drawCards();
  drawSubmitButton();

  if (submitted) {
    drawResult();
  }
}

function drawTitle() {
  fill("#24432d");
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(30);
  text("植物構造拖曳配對", W / 2, 40);

  fill("#607568");
  textSize(16);
  text("將下方名稱拖曳到植物正確的部位", W / 2, 78);
}

function drawPlantArea() {
  fill("#ffffff");
  stroke("#c8d8c4");
  strokeWeight(2);
  rect(70, 105, 760, 480, 24);

  drawGround();
  drawPlant();

  for (let i = 0; i < parts.length; i++) {
    drawTarget(parts[i], i);

    let card = cards.find(item => item.target === i);

    if (card && card !== dragging) {
      drawPlacedLabel(card, parts[i]);
    }
  }
}

function drawGround() {
  noStroke();
  fill("#dcefcf");
  rect(90, 435, 720, 125, 18);

  stroke("#9bc58c");
  strokeWeight(3);
  line(90, 435, 810, 435);
}

function drawPlant() {
  let t = frameCount * 0.05;

  // 根部動畫
  stroke("#8d5524");
  strokeWeight(7);

  line(450, 420, 450, 500);
  line(450, 470, 405, 525);
  line(450, 470, 495, 525);
  line(450, 485, 430, 535);
  line(450, 485, 475, 535);

  // 根部閃動小圓點
  noStroke();
  fill("#c08457");

  for (let i = 0; i < 5; i++) {
    let x = 420 + i * 18;
    let y = 505 + sin(t + i) * 8;
    circle(x, y, 7);
  }

  // 莖部呼吸動畫
  let stemSize = 14 + sin(t * 2) * 2;

  stroke("#4d9a45");
  strokeWeight(stemSize);
  line(450, 420, 450, 190);

  // 葉片動畫
  noStroke();
  fill("#52b788");

  let leafMove = sin(t) * 4;

  push();
  translate(350, 285);
  rotate(radians(-8 + leafMove / 3));
  ellipse(0, 0, 150, 65);
  pop();

  push();
  translate(550, 325);
  rotate(radians(8 - leafMove / 3));
  ellipse(0, 0, 150, 65);
  pop();

  push();
  translate(350, 350);
  rotate(radians(-5 + leafMove / 3));
  ellipse(0, 0, 125, 58);
  pop();

  stroke("#2f7d32");
  strokeWeight(4);
  line(450, 320, 355, 285);
  line(450, 350, 550, 325);
  line(450, 370, 360, 350);

  // 果實跳動動畫
  let fruitSize = 52 + sin(t * 2) * 3;

  noStroke();
  fill("#f08c00");
  circle(570, 255, fruitSize);

  fill("#ffb703");
  circle(558, 244, 12);

  // 花朵旋轉動畫
  push();
  translate(450, 145);
  rotate(t * 0.25);

  fill("#e85aad");

  for (let i = 0; i < 5; i++) {
    let angle = TWO_PI * i / 5;
    ellipse(
      cos(angle) * 23,
      sin(angle) * 23,
      42,
      42
    );
  }

  fill("#ffd166");
  circle(0, 0, 28);
  pop();

  // 種子閃爍動畫
  let seedAlpha = 180 + sin(t * 3) * 60;

  fill(255, 243, 191, seedAlpha);
  stroke("#d59b36");
  strokeWeight(2);
  ellipse(570, 385, 78, 45);

  noStroke();
  fill("#8d5524");

  ellipse(555, 385, 18, 28);
  ellipse(580, 385, 18, 28);
  ellipse(605, 385, 18, 28);
}

function drawTarget(part, index) {
  let pulse = 52 + sin(frameCount * 0.06 + index) * 5;

  noFill();
  stroke(part.color);
  strokeWeight(2);
  circle(part.x, part.y, pulse);

  fill(part.color);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  text(index + 1, part.x, part.y);

  drawDescription(part);
}

function drawDescription(part) {
  let x;
  let y;

  if (part.type === "flower") {
    x = 545;
    y = 112;
  } else if (part.type === "leaf") {
    x = 105;
    y = 250;
  } else if (part.type === "stem") {
    x = 545;
    y = 320;
  } else if (part.type === "fruit") {
    x = 625;
    y = 220;
  } else if (part.type === "seed") {
    x = 625;
    y = 375;
  } else {
    x = 150;
    y = 490;
  }

  fill(255, 255, 255, 235);
  stroke(part.color);
  strokeWeight(1.5);
  rect(x, y, 190, 46, 8);

  fill("#435466");
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  text(part.description, x + 8, y + 5, 174, 36);
}

function drawPlacedLabel(card, part) {
  fill("#ffffff");
  stroke(card.color);
  strokeWeight(2);
  rect(part.x - 38, part.y - 14, 76, 28, 8);

  fill("#243447");
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(13);
  text(card.name, part.x, part.y);
}

function drawCards() {
  for (let card of cards) {
    if (card === dragging) continue;

    if (card.target === -1) {
      drawCard(card, card.x, card.y);
    }
  }

  if (dragging) {
    drawCard(
      dragging,
      mouseX / scaleFactor - dragging.offsetX,
      mouseY / scaleFactor - dragging.offsetY
    );
  }
}

function drawCard(card, x, y) {
  fill(card.color);
  stroke("#ffffff");
  strokeWeight(3);
  rect(x, y, card.w, card.h, 12);

  fill("#ffffff");
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  text(card.name, x + card.w / 2, y + card.h / 2);
}

function drawSubmitButton() {
  fill(submitted ? "#a0aec0" : "#e8590c");
  noStroke();
  rect(W / 2 - 105, 755, 210, 45, 14);

  fill("#ffffff");
  textAlign(CENTER, CENTER);
  textSize(18);
  text("交卷看成績", W / 2, 778);
}

function mousePressed() {
  if (submitted) return;

  let mx = mouseX / scaleFactor;
  let my = mouseY / scaleFactor;

  if (
    mx > W / 2 - 105 &&
    mx < W / 2 + 105 &&
    my > 755 &&
    my < 800
  ) {
    submit();
    return;
  }

  for (let card of cards) {
    let x;
    let y;
    let width;
    let height;

    if (card.target === -1) {
      x = card.x;
      y = card.y;
      width = card.w;
      height = card.h;
    } else {
      let part = parts[card.target];

      x = part.x - 38;
      y = part.y - 14;
      width = 76;
      height = 28;
    }

    if (
      mx >= x &&
      mx <= x + width &&
      my >= y &&
      my <= y + height
    ) {
      dragging = card;
      dragFrom = card.target;

      card.offsetX = mx - x;
      card.offsetY = my - y;

      card.target = -1;
      return;
    }
  }
}

function mouseDragged() {
  if (!dragging) return;

  let mx = mouseX / scaleFactor;
  let my = mouseY / scaleFactor;

  dragging.x = mx - dragging.offsetX;
  dragging.y = my - dragging.offsetY;
}

function mouseReleased() {
  if (!dragging) return;

  let mx = mouseX / scaleFactor;
  let my = mouseY / scaleFactor;

  let target = -1;

  for (let i = 0; i < parts.length; i++) {
    if (
      dist(mx, my, parts[i].x, parts[i].y) < 55
    ) {
      target = i;
      break;
    }
  }

  if (target !== -1) {
    let oldCard = cards.find(card => card.target === target);

    if (oldCard && oldCard !== dragging) {
      if (dragFrom !== -1) {
        oldCard.target = dragFrom;
      } else {
        oldCard.target = -1;
        oldCard.x = oldCard.homeX;
        oldCard.y = oldCard.homeY;
      }
    }

    dragging.target = target;
  } else {
    dragging.target = -1;
    dragging.x = dragging.homeX;
    dragging.y = dragging.homeY;
  }

  dragging = null;
  dragFrom = -1;
}

function submit() {
  submitted = true;
  endTime = millis();
  score = 0;

  for (let card of cards) {
    if (
      card.target !== -1 &&
      card.type === parts[card.target].type
    ) {
      score++;
    }
  }
}

function drawResult() {
  fill(255, 255, 255, 248);
  stroke("#52606d");
  strokeWeight(2);
  rect(W / 2 - 290, 130, 580, 500, 20);

  fill("#243447");
  noStroke();
  textAlign(CENTER, CENTER);

  textSize(30);
  text("答題結果", W / 2, 175);

  textSize(22);
  text(`分數：${score} / 6`, W / 2, 220);

  let seconds = floor((endTime - startTime) / 1000);
  text(`用時：${seconds} 秒`, W / 2, 255);

  textAlign(LEFT, CENTER);
  textSize(17);

  for (let i = 0; i < parts.length; i++) {
    let card = cards.find(item => item.target === i);
    let correct = card && card.type === parts[i].type;

    fill(correct ? "#2f9e44" : "#e03131");

    text(
      `${i + 1}. ${parts[i].name}：${correct ? "答對" : "答錯"}`,
      W / 2 - 180,
      305 + i * 38
    );
  }
}

function resizeGame() {
  scaleFactor = min((windowWidth - 20) / W, 1);

  canvas.style("width", `${W * scaleFactor}px`);
  canvas.style("height", `${H * scaleFactor}px`);
}

function windowResized() {
  resizeGame();
}

function touchStarted() {
  mousePressed();
  return false;
}

function touchMoved() {
  mouseDragged();
  return false;
}

function touchEnded() {
  mouseReleased();
  return false;
}