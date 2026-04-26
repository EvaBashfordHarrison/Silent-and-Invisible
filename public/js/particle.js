class Particle {
  constructor(x, y, xSpeed, ySpeed, col, diam) {
    this.x = x;
    this.y = y;
    this.diam = diam;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.col = col;
    this.stuck = false;
    this.stuckX = 0;
    this.stuckY = 0;
  }
  
  magnet(textPoints) {
    for (let i = 0; i < textPoints.length; i+=2) {
      let d = dist(this.x, this.y, textPoints[i].x, textPoints[i].y);
      
      if (d < 20) {
        let ax = (textPoints[i].x - this.x) * 0.05;
        let ay = (textPoints[i].y - this.y) * 0.05;
        this.xSpeed += ax;
        this.ySpeed += ay;
        
        // dampen 
        this.xSpeed *= 0.95;
        this.ySpeed *= 0.95;

        if (d < 2) {
          this.stuck = true;
          this.stuckX = textPoints[i].x;
          this.stuckY = textPoints[i].y;
        }
      }
    } 
  }

  move() {
    
    if (this.stuck) {
      this.x = this.stuckX; 
      this.y = this.stuckY;
      this.xSpeed = 0;
      this.ySpeed = 0;
      return;
    }

    this.x += this.xSpeed;
    if (this.x < 0 || this.x > width) {
      this.xSpeed *= -1;
    }

    this.y += this.ySpeed;
    if (this.y < 0 || this.y > height) {
      this.ySpeed *= -1;
    }
  }

    display() {

      // Settings for the quad shape 
      let centerX = this.x;
      let centerY = this.y;
      let r = this.diam * 0.6; // Radius of the shape 
      let c = r * 0.4;
      fill(this.col, 100, 100, 50);

      // Begin drawing the closed shape
      beginShape();
      vertex(centerX, centerY - r);
      
      // 4 Bezier Curves forming the 4 quadrants
      bezierVertex(centerX + c, centerY - r, centerX + r, centerY - c, centerX + r, centerY); // Top-Right
      bezierVertex(centerX + r, centerY + c, centerX + c, centerY + r, centerX, centerY + r); // Bottom-Right
      bezierVertex(centerX - c, centerY + r, centerX - r, centerY + c, centerX - r, centerY); // Bottom-Left
      bezierVertex(centerX - r, centerY - c, centerX - c, centerY - r, centerX, centerY - r); // Top-Left
      
      endShape(CLOSE);
    }
}