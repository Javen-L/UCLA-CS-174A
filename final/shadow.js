
window.Shadow_Shader = window.classes.Shadow_Shader =
class Shadow_Shader extends Phong_Shader
{
  material( color, properties )     // Define an internal class "Material" that stores the standard settings found in Phong lighting.
  { return new class Material       // Possible properties: ambient, diffusivity, specularity, smoothness, gouraud, texture.
      { constructor( shader, color = Color.of( 0,0,0,1 ), ambient = 0, diffusivity = 1, specularity = 1, smoothness = 40, shadow = undefined )
          { Object.assign( this, { shader, color, ambient, diffusivity, specularity, smoothness, shadow } );  // Assign defaults.
            Object.assign( this, properties );                                                        // Optionally override defaults.
          }
        override( properties )                      // Easily make temporary overridden versions of a base material, such as
          { const copied = new this.constructor();  // of a different color or diffusivity.  Use "opacity" to override only that.
            Object.assign( copied, this );
            Object.assign( copied, properties );
            copied.color = copied.color.copy();
            if( properties[ "opacity" ] != undefined ) copied.color[3] = properties[ "opacity" ];
            return copied;
          }
      }( this, color );
  }
    shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
        const int N_LIGHTS = 2;             // We're limited to only so many inputs in hardware.  Lights are costly (lots of sub-values).
        uniform float ambient, diffusivity, specularity, smoothness, animation_time, attenuation_factor[N_LIGHTS];
        uniform bool GOURAUD, COLOR_NORMALS, USE_TEXTURE, SHADOW;               // Flags for alternate shading methods
        uniform vec4 lightPosition[N_LIGHTS], lightColor[N_LIGHTS], shapeColor;
        varying vec3 N, E;                    // Specifier "varying" means a variable's final value will be passed from the vertex shader 
        varying vec2 f_tex_coord;             // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the 
        varying vec4 VERTEX_COLOR;            // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 L[N_LIGHTS], H[N_LIGHTS];
        varying float dist[N_LIGHTS];
        
        vec3 phong_model_lights( vec3 N )
          { vec3 result = vec3(0.0);
            for(int i = 0; i < N_LIGHTS; i++)
              {
                float attenuation_multiplier = 1.0 / (1.0 + attenuation_factor[i] * (dist[i] * dist[i]));
                float diffuse  =      max( dot(N, L[i]), 0.0 );
                float specular = pow( max( dot(N, H[i]), 0.0 ), smoothness );

                result += attenuation_multiplier * ( shapeColor.xyz * diffusivity * diffuse + lightColor[i].xyz * specularity * specular );
              }
            return result;
          }
        `;
    }
 
    fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {                            // A fragment is a pixel that's overlapped by the current triangle.
                                 // Fragments affect the final image or get discarded due to depth.
      return `
        uniform sampler2D texture, shadow;
        varying vec2 f_sha_coord;

        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec4 tex_color = texture2D( texture, f_tex_coord );                         // Sample the texture image in the correct place.
                                                                   // Compute an initial (ambient) color:
          vec4 shadow_color = texture2D( shadow, f_tex_coord);
          if( SHADOW )
           {
              if ( shadow_color.x == 0.2 && shadow_color.y == 0.8 && shadow_color.z == 1.0)
              {
                gl_FragColor = vec4( tex_color.xyz, tex_color.w );
              }
              else {
                gl_FragColor = vec4( ( shadow_color.xyz ) , shadow_color.w * 0.8 ); 
              }
           }
          else if ( USE_TEXTURE )
           {
             gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w );
           }
          else {
            gl_FragColor = vec4( tex_color.xyz * ambient, shapeColor.w );
          }
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
    update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
    {                              // First, send the matrices to the GPU, additionally cache-ing some products of them we know we'll need:
      this.update_matrices( g_state, model_transform, gpu, gl );
      gl.uniform1f ( gpu.animation_time_loc, g_state.animation_time / 1000 );

      if( g_state.gouraud === undefined ) { g_state.gouraud = g_state.color_normals = false; }    // Keep the flags seen by the shader 
      gl.uniform1i( gpu.GOURAUD_loc,        g_state.gouraud || material.gouraud );                // program up-to-date and make sure 
      gl.uniform1i( gpu.COLOR_NORMALS_loc,  g_state.color_normals );                              // they are declared.


      const textures = [];
      let textureIndex = 0;

      // set the shadow for Phong Shader
      if (material.shadow ) 
        { 
          gpu.shader_attributes["tex_coord"].enabled = true;
          g_state.shadow = true;
           
//           gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, material.shadow.id);
          textures.push(material.shadow.id);
          //gl.bindTexture( gl.TEXTURE_2D, material.shadow.id );

          gl.uniform1i(gpu.shadow_loc, textureIndex++);  // texture unit 0
        }
      else 
        { 
         g_state.shadow = false; 
        }

      gl.uniform1i( gpu.SHADOW_loc, g_state.shadow);

      gl.uniform4fv( gpu.shapeColor_loc,     material.color       );    // Send the desired shape-wide material qualities 
      gl.uniform1f ( gpu.ambient_loc,        material.ambient     );    // to the graphics card, where they will tweak the
      gl.uniform1f ( gpu.diffusivity_loc,    material.diffusivity );    // Phong lighting formula.
      gl.uniform1f ( gpu.specularity_loc,    material.specularity );
      gl.uniform1f ( gpu.smoothness_loc,     material.smoothness  );
//       gl.uniform1f ( gpu.shadow_loc,         material.shadow      );

      if( material.texture )                           // NOTE: To signal not to draw a texture, omit the texture parameter from Materials.
      { gpu.shader_attributes["tex_coord"].enabled = true;
        gl.uniform1f ( gpu.USE_TEXTURE_loc, 1 );

        
//         gl.bindTexture( gl.TEXTURE_2D, material.texture.id );
//         gl.activeTexture(gl.TEXTURE1);



        gl.bindTexture(gl.TEXTURE_2D, material.texture.id);
        textures.push(material.texture.id);
        window.gl = gl;
        gl.uniform1i(gpu.texture_loc, textureIndex);

      }
      else  { gl.uniform1f ( gpu.USE_TEXTURE_loc, 0 );   gpu.shader_attributes["tex_coord"].enabled = false; }

      textureIndex = 0;

      if (material.shadow) {
          gl.activeTexture(gl.TEXTURE0 + textureIndex);
          gl.bindTexture(gl.TEXTURE_2D, textures[textureIndex++]);
      }

      if (material.texture) {
        gl.activeTexture(gl.TEXTURE0 + textureIndex);
        gl.bindTexture(gl.TEXTURE_2D, textures[textureIndex]);
      }



      if( !g_state.lights.length )  return;
      var lightPositions_flattened = [], lightColors_flattened = [], lightAttenuations_flattened = [];
      for( var i = 0; i < 4 * g_state.lights.length; i++ )
        { lightPositions_flattened                  .push( g_state.lights[ Math.floor(i/4) ].position[i%4] );
          lightColors_flattened                     .push( g_state.lights[ Math.floor(i/4) ].color[i%4] );
          lightAttenuations_flattened[ Math.floor(i/4) ] = g_state.lights[ Math.floor(i/4) ].attenuation;
        }
      gl.uniform4fv( gpu.lightPosition_loc,       lightPositions_flattened );
      gl.uniform4fv( gpu.lightColor_loc,          lightColors_flattened );
      gl.uniform1fv( gpu.attenuation_factor_loc,  lightAttenuations_flattened );
    }
}
