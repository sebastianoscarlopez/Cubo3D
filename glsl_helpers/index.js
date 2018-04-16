export {rotateZ, rotateX, rotateY} from './rotation';
export function createProgram(gl, vertexCode, fragmentCode){
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertexCode);
    gl.compileShader(vertShader);

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragmentCode);
    gl.compileShader(fragShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    return shaderProgram;
}

export function addDraw(gl, shaderProgram, draw){
    let buffers = {};
    Object.entries(draw).forEach(
        ([key, value]) => {
            buffers[key] = gl.createBuffer();
            let buffer = buffers[key];
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

            let data;
            switch(value.type)
            {
                case "Float32Array":
                    data = new Float32Array(value.data);
                    break;
                case "Uint16Array":
                    data = new Uint16Array(value.data);
                    break;
            }
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

            if(value.attribute != undefined)
            {
                var attribute = gl.getAttribLocation(shaderProgram, value.attribute);
                gl.vertexAttribPointer(attribute, value.dimension, gl.FLOAT, false,0,0) ;
                gl.enableVertexAttribArray(attribute);
            }
        }
    );
    return {
      model: [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1],
      buffers
    };
}
