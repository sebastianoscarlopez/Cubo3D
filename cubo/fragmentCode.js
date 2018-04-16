export const fragmentCode = `
precision mediump float;
uniform sampler2D t;
varying vec2 uv;
void main(void) {
    gl_FragColor = vec4(0,0.5,0.1, 1.) + texture2D(t, uv);
}`;
