export class Vec2d{
    x:number;
    y:number;
    constructor(x:number,y:number){
        this.x=x;
        this.y=y;
    }
    
    /**
     * rotate vector around point
     *
     * @param {number} angle in degrees
     * @param {Vec2d} [center=null] optional center
     * @returns {Vec2d} rotated point 
     */
    rotateMatrix(angle:number,center:Vec2d | null =null) {
        let vec = this as Vec2d;
        angle = angle % 360;
        if(angle==0) return vec;
        if(center!=null) vec = vec.base(center);
        let radians = (Math.PI / 180) * angle;
        let cos = Math.cos(radians);
        let sin = Math.sin(radians);
        let nx = (sin * (vec.y)) + (cos * (vec.x))
        let ny = (cos * (vec.y)) - (sin * (vec.x));
        let resultVec=new Vec2d(nx, ny);
        if(center!=null) resultVec = resultVec.rebase(center);
        return resultVec
    }
    
    /**
     * calculating the distance between the to vectors
     *
     * @param {Vec2d} point vec compared to;
     * @returns {number} distance between the vectors
     */
    getDistance(point:Vec2d){
        return this.base(point).mag();
    }
    
    /**
     * moving the vector back to the basis
     *
     * @param {Vec2d} from the actal base of the vector
     * @returns {Vec2d}
     */
    base(from:Vec2d){
        return new Vec2d(from.x-this.x,from.y-this.y);
    }

    /**
     * moving the vector back to the original basis
     *
     * @param {Vec2d} to the original base of the vector
     * @returns {Vec2d}
     */
    rebase(to:Vec2d){
        return new Vec2d(to.x+this.x,to.y+this.y);
    }

    
    /**
     * Dot (scalar) product of the context vector with a given vector
     *
     * @param {Vec2d} v given vector
     * @returns {number} dot product
     */
    dotProduct(v:Vec2d){
       return this.x * v.x + this.y * v.y;
    }

    
    /**
     * returns the angle between the context vector and a given vector
     *
     * @param {Vec2d} v given vector
     * @returns {number} the angle in degrees
     */
    angle(v:Vec2d){
        return Math.acos(this.dotProduct(v) / (this.mag() * v.mag()))*(180/Math.PI);
    }

    
    /**
     * Cross product of the context vector with a given vector
     *
     * @param {Vec2d} v given vector
     * @returns {number} the size of the enclosed area by the vectors
     */
    crossProduct(v:Vec2d){
        return  v.x * this.y - v.y * this.x
    }

    
    /**
     * Multiply the vector by n
     *
     * @param {Number} n amount
     * @returns {Vec2d} multiplied vector
     */
    mult(n:number){
        return new Vec2d(this.x*n, this.y*n);
    }
    
    /**
     * Normal vector of the contexts vector
     *
     * @returns {Vec2d} the normal vector
     */
    normal(){
        return new Vec2d((-1)*this.y, this.x).unit();
    }

    /**
     * Unit vector of the contexts vector
     *
     * @returns {Vec2d} the unit vector
     */
    unit(){
        if(this.mag() === 0){
            return new Vec2d(0,0);
        } else {
            return new Vec2d(this.x/this.mag(), this.y/this.mag());
        }
    }

    
    /**
     * Magnitude (length) of the vector
     *
     * @returns {number} Magnitude of the vector
     */
    mag(){
        return Math.sqrt(this.x**2 + this.y**2);
    }
    
    /**
     * sum of the context vector with a given vector
     *
     * @param {Vec2d} v given vector
     * @returns {Vec2d} summed vector
     */
    add(v:Vec2d){
        return new Vec2d(this.x+v.x,this.y+v.y);
    }
     /**
     * diff of the context vector with a given vector
     *
     * @param {Vec2d} v given vector
     * @returns {Vec2d} diff vector
     */
    subtr(v:Vec2d){
        return new Vec2d(this.x-v.x,this.y-v.y);
    }
    equal(v:Vec2d){
        return this.x==v.x && this.y==v.y
    }
    
    /**
     * display the vector on the canvas
     *
     * @param {*} ctx canvas
     * @param {string} color color of the
     * @param {Vec2d} start origo of the vector
     * @param {number} n display scale
     */
}
