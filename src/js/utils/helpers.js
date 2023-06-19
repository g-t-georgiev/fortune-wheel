/**
 * Abstact class serving as a static helper methods library.
 */
export class Polygon {
    /**
     * Returns polygon side length depending on the radius and sides count, 
     * according to the forumula: 2r sin(π/n)
     * @param {number} n number of sides
     * @param {number} r inner radius
     */
    static getSideLen(n, r) {
        if (isNaN(r)) {
            throw new TypeError('Radius value should be a number.');
        }
    
        if (isNaN(n)) {
            throw new TypeError('Sides count value should be a number.');
        }
    
        return (2 * r) * Math.sin(Math.PI / n);
    }
}

/**
 * Returns a random number between the interval of a min and max value.
 * The min and max tresholds are inclusive.
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
export function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min) // min and max inclusive
}

/**
 * Flips direction of x value.
 * @param {number} x 
 * @returns 
 */
export function flip(x) {
    return 1 - x;
}

/**
 * Interpolates between start and end value over a set time index from 0 to 1.
 * @param {number} a start value
 * @param {number} b end value
 * @param {number} t time progress [0..1]
 * @returns 
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Calculates gradually increasing easing factor index.
 * @param {number} t time progress [0..1]
 * @param {number} exponent exponent factor
 * @returns 
 */
export function easeIn(t, exponent = 1) {
    // console.log(`Time progression: `, t);
    let easingFactor = (t) ** exponent;
    // console.log('Easing factor:', easingFactor);
    return easingFactor;
}

/**
 * Calculates gradually decreasing easing factor index.
 * @param {number} t time progress [0..1]
 * @param {number} exponent exponent factor
 * @returns 
 */
export function easeOut(t, exponent = 1) {
    t = flip(t);
    // console.log(`Time progression: `, t);
    let easingFactor = flip((t) ** exponent);
    // console.log('Easing factor:', easingFactor);
    return easingFactor;
}

/**
 * Calculats gradually increasing and decreasing easing factor index. 
 * If the exponent factors are omitted, the default behavior is linear.
 * If only the one exponent is passed it is used for both easing-in and easing-out effect.
 * Otherwise, the first exponent is used for the ease-in and the secont for the ease-out effect.
 * @param {number} t time progress
 * @param {number} exponent1 exponent factor 1
 * @param {number} [exponent2] exponent factor 2
 */
export function easeInOut(t, exponent1 = 1, exponent2) {
    return lerp(easeIn(t, exponent1), easeOut(t, exponent2 ?? exponent1), t);
}