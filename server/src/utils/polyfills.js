// Polyfills for PDF parsing libraries that expect a browser environment in Node.js
if (typeof global.DOMMatrix === "undefined") {
    global.DOMMatrix = class DOMMatrix {
        constructor() {
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        }
    };
}

if (typeof global.ImageData === "undefined") {
    global.ImageData = class ImageData {
        constructor() {}
    };
}

if (typeof global.Path2D === "undefined") {
    global.Path2D = class Path2D {
        constructor() {}
    };
}

console.log("Browser polyfills (DOMMatrix, ImageData, Path2D) initialized.");
