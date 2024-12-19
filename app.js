var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

var InitDemo = function () {
    console.log('This is working');

    var canvas = document.getElementById('game-surface');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert('Your browser does not support WebGL');
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    // Shader setup
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    // Vertices dengan lubang yang lebih kecil
    var boxVertices = 
    [ // X, Y, Z           R, G, B
        // Top outer (biru)
        -1.0, 1.0, -1.0,   0.0, 0.0, 1.0,    // 0
        -1.0, 1.0, 1.0,    0.0, 0.0, 1.0,    // 1
        1.0, 1.0, 1.0,     0.0, 0.0, 1.0,    // 2
        1.0, 1.0, -1.0,    0.0, 0.0, 1.0,    // 3
        
        // Top inner edge (hitam) - lubang diperkecil
        -0.3, 1.0, -0.2,   0.0, 0.0, 0.0,    // 4
        -0.3, 1.0, 0.2,    0.0, 0.0, 0.0,    // 5
        0.3, 1.0, 0.2,     0.0, 0.0, 0.0,    // 6
        0.3, 1.0, -0.2,    0.0, 0.0, 0.0,    // 7

        // Inner hole bottom (hitam)
        -0.3, 0.7, -0.2,   0.0, 0.0, 0.0,    // 8
        -0.3, 0.7, 0.2,    0.0, 0.0, 0.0,    // 9
        0.3, 0.7, 0.2,     0.0, 0.0, 0.0,    // 10
        0.3, 0.7, -0.2,    0.0, 0.0, 0.0,    // 11
        
        // Left
        -1.0, 1.0, 1.0,    0.0, 0.0, 1.0,    // 12
        -1.0, -1.0, 1.0,   0.0, 0.0, 1.0,    // 13
        -1.0, -1.0, -1.0,  0.0, 0.0, 1.0,    // 14
        -1.0, 1.0, -1.0,   0.0, 0.0, 1.0,    // 15

        // Right
        1.0, 1.0, 1.0,    0.0, 0.0, 1.0,     // 16
        1.0, -1.0, 1.0,   0.0, 0.0, 1.0,     // 17
        1.0, -1.0, -1.0,  0.0, 0.0, 1.0,     // 18
        1.0, 1.0, -1.0,   0.0, 0.0, 1.0,     // 19

        // Front
        1.0, 1.0, 1.0,    0.0, 0.0, 1.0,     // 20
        1.0, -1.0, 1.0,   0.0, 0.0, 1.0,     // 21
        -1.0, -1.0, 1.0,  0.0, 0.0, 1.0,     // 22
        -1.0, 1.0, 1.0,   0.0, 0.0, 1.0,     // 23

        // Back
        1.0, 1.0, -1.0,    0.0, 0.0, 1.0,    // 24
        1.0, -1.0, -1.0,   0.0, 0.0, 1.0,    // 25
        -1.0, -1.0, -1.0,  0.0, 0.0, 1.0,    // 26
        -1.0, 1.0, -1.0,   0.0, 0.0, 1.0,    // 27

        // Bottom
        -1.0, -1.0, -1.0,  0.0, 0.0, 1.0,    // 28
        -1.0, -1.0, 1.0,   0.0, 0.0, 1.0,    // 29
        1.0, -1.0, 1.0,    0.0, 0.0, 1.0,    // 30
        1.0, -1.0, -1.0,   0.0, 0.0, 1.0,    // 31
    ];

    // Indices untuk membuat faces
    var boxIndices =
    [
        // Top (dengan lubang)
        0, 1, 5,    0, 5, 4,  // Depan
        1, 2, 6,    1, 6, 5,  // Kanan
        2, 3, 7,    2, 7, 6,  // Belakang
        3, 0, 4,    3, 4, 7,  // Kiri

        // Inner hole walls (hitam)
        4, 5, 9,    4, 9, 8,  // Depan
        5, 6, 10,   5, 10, 9, // Kanan
        6, 7, 11,   6, 11, 10,// Belakang
        7, 4, 8,    7, 8, 11, // Kiri

       // Left
        13, 12, 14,
        14, 12, 15,

        // Right
        16, 17, 18,
        16, 18, 19,

        // Front
        21, 20, 22,
        23, 22, 20,

        // Back
        24, 25, 26,
        24, 26, 27,

        // Bottom
        29, 28, 30,
        30, 28, 31
    ];

    // Buffer setup
    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.useProgram(program);

    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function () {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        mat4.rotate(yRotationMatrix, identityMatrix, angle /1, [0, 1, 0]);
        mat4.rotate(xRotationMatrix, identityMatrix, angle /2, [1, 0, 0]);
        mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
};