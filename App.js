/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
	PixelRatio,
  Platform,
  Text,
  View
} from 'react-native';

import cubo from './cubo.json';
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-native";
import { WebGLView } from "react-native-webgl";

import {addDraw, createProgram} from './glsl_helpers';

import {rotateZ, rotateX, rotateY} from './rotation';
import vertexCode from './vertexCode';
import fragmentCode from './fragmentCode';
//var vertCode = require('webpack-glsl!./vertex');


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  onContextCreate = (gl) => {
    const rngl = gl.getExtension("RN");

      var shaderProgram = createProgram(gl, vertexCode, fragmentCode);

      addDraw(gl, cubo);

       /*==================== MATRIX =====================*/

       var canvas = {
        width: PixelRatio.getPixelSizeForLayoutSize(300),
        height: PixelRatio.getPixelSizeForLayoutSize(300)
      }
      function get_projection(angle, a, zMin, zMax) {
          var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
          return [
             0.5/ang, 0 , 0, 0,
             0, 0.5*a/ang, 0, 0,
             0, 0, -(zMax+zMin)/(zMax-zMin), -1,
             0, 0, (-2*zMax*zMin)/(zMax-zMin), 0 
          ];
       }
    
       var proj_matrix = get_projection(40, canvas.width/canvas.height, 1, 100);

       var mov_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
       var view_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

       // translating z
       view_matrix[14] = view_matrix[14]-3;//zoom

       /*================= Drawing ===========================*/
       var time_old = 0;
    
       var animate = function(time) {

          var dt = time-time_old;
          rotateZ(mov_matrix, dt*0.005);//time
          rotateY(mov_matrix, dt*0.002);
          rotateX(mov_matrix, dt*0.003);
          time_old = time;

          gl.enable(gl.DEPTH_TEST);
          gl.depthFunc(gl.LEQUAL);
          gl.clearColor(0.5, 0.5, 0.5, 0.9);
          gl.clearDepth(1.0);

          gl.viewport(0.0, 0.0, canvas.width, canvas.height);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
          gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
          gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubo.buffers.indices);
          gl.drawElements(gl.TRIANGLES, cubo.indices.data.length, gl.UNSIGNED_SHORT, 0);
      
          requestAnimationFrame(animate);
          gl.flush();
          rngl.endFrame();
       }

      /** Textures */
      
      const tLocation = gl.getUniformLocation(shaderProgram, "t");
      rngl
        .loadTexture({
          image: "http://www8.oca.com.ar/SigmaWebApi/texture_cube.png",
          yflip: false 
        })
        .then(({ texture }) => {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.uniform1i(tLocation, 0);
          animate(0);
        });
 
        /* ====== Associating attributes to vertex shader =====*/
        var Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
        var Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
        var Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");
 
        gl.bindBuffer(gl.ARRAY_BUFFER, cubo.buffers.vertices);
        var position = gl.getAttribLocation(shaderProgram, "position");
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(position);

        var a_uv = gl.getAttribLocation(shaderProgram, "a_uv");
        gl.vertexAttribPointer(a_uv, 3, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(a_uv);
        
        gl.useProgram(shaderProgram);
 
  };

  render() {
    return (
      /**** Three*/
      <WebGLView
        style={{ width: 300, height: 300 }}
        onContextCreate={this.onContextCreate}
      />
    );
  }
}
