class Source {
    //constructor creating ray object
    constructor(x, y, n) {
        this.pos = createVector(x, y);
        this.nrays = n;
        this.rays = [];
        this.rays_length = [];
        //push rays into ray array
        for (let i = 0; i < n; i++) {
            this.rays.push(2 * Math.PI * i / n);
            this.rays_length.push(150);
        }

    }

    //draw the rays representing hours
    //userMouseAngle is the angle of the user's mouse with respect to ray source
    drawHourRays(userMouseAngle) {
        for (let i = 0; i <= this.nrays / 2; i++) {
            stroke(255, 255, 0);
            strokeWeight(1);

            let end_y = this.pos.y + cos(this.rays[i]) * this.rays_length[i];

            let end_xRight = this.pos.x + sin(this.rays[i]) * this.rays_length[i];
            let end_xLeftt = this.pos.x - sin(this.rays[i]) * this.rays_length[i];

            //if ray matches users mouse position highlight this ray to make the respective latitude more obvious to the user
            if (userMouseAngle == i) {
                stroke(255, 255, 255);
                strokeWeight(3);
            }


            line(this.pos.x, this.pos.y, end_xRight, end_y);
            line(this.pos.x, this.pos.y, end_xLeftt, end_y);
            this.rays[i] = this.rays[i];
        }
    }


    //update the ray source position
    update(x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }


    //loop through the csv and update the length of the rays
    update_length(hoursColumn) {
        //initialise latitude to south pole
        let latitude = -90;

        //loop through all values passed in hoursColumn array
        //increase latitude with every loop
        for (let i in hoursColumn) {

            let daylightamount = hoursColumn[i];

            this.rays_length[i] = map(daylightamount, 0, 24, 98, 200);
            latitude++;
        }
    }
}