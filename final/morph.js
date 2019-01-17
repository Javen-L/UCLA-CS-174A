window.Morph_Cube = window.classes.Morph_Cube =
class Morph_Cube extends Shape    // Same as cube except it passes an extra buffer target_positions
{ constructor()  
    { super( "positions", "normals", "texture_coords", "target_positions" );
      this.morph_amplitude = 0;
      this.isMorphing = false;
      for( var i = 0; i < 3; i++ )                    
        for( var j = 0; j < 2; j++ )
        { var square_transform = Mat4.rotation( i == 0 ? Math.PI/2 : 0, Vec.of(1, 0, 0) )
                         .times( Mat4.rotation( Math.PI * j - ( i == 1 ? Math.PI/2 : 0 ), Vec.of( 0, 1, 0 ) ) )
                         .times( Mat4.translation([ 0, 0, 1 ]) );
          Square.insert_transformed_copy_into( this, [], square_transform );
        }

        // Create windmill geometry for target positions
        var num_blades = 8;
        // Keep positions, normals, indices and texture coords for windmill separately within same class
        this.windmillData = {
          positions: [],
          normals: [],
          texture_coords: [],
          indices: [],  
        };
        for( var i = 0; i < num_blades; i++ )     // A loop to automatically generate the triangles.
        {                                                                                   // Rotate around a few degrees in the
          var spin = Mat4.rotation( i * 2*Math.PI/num_blades, Vec.of( 0,1,0 ) );            // XZ plane to place each new point.
          var newPoint  = spin.times( Vec.of( 1,0,0,1 ) ).to3();   // Apply that XZ rotation matrix to point (1,0,0) of the base triangle.
          this.windmillData.positions.push( newPoint,                           // Store this XZ position.                  This is point 1.
                               newPoint.plus( [ 0,1,0 ] ),         // Store it again but with higher y coord:  This is point 2.
                                        Vec.of( 0,0,0 )    );      // All triangles touch this location.       This is point 3.

                        // Rotate our base triangle's normal (0,0,1) to get the new one.  Careful!  Normal vectors are not points; 
                        // their perpendicularity constraint gives them a mathematical quirk that when applying matrices you have
                        // to apply the transposed inverse of that matrix instead.  But right now we've got a pure rotation matrix, 
                        // where the inverse and transpose operations cancel out.
          var newNormal = spin.times( Vec.of( 0,0,1 ).to4(0) ).to3();  
          this.windmillData.normals       .push( newNormal, newNormal, newNormal          );
          this.windmillData.texture_coords.push( ...Vec.cast( [ 0,0 ], [ 0,1 ], [ 1,0 ] ) );
          this.windmillData.indices       .push( 3*i, 3*i + 1, 3*i + 2                    ); // Procedurally connect the 3 new vertices into triangles.
        }
        this.target_positions = this.windmillData.positions;
        this.intervalID = null;
        //default
        this.morphInterval = 1000;
    }
  
  startMorphing(){
    console.log('started morphing');
    this.intervalID = setInterval(()=>{this.morph()}, this.morphInterval);
  }

  stopMorphing(){
    clearInterval(this.intervalID);
  }

  changeInterval(val){
    this.morphInterval = val;
  }

  // Morphs cube into windmill
  morph() {
    this.isMorphing = true;
    var _this = this;
    var cur = {amplitude : this.morph_amplitude};
    var target = {amplitude : this.morph_amplitude == 0 ? 1 : 0};
    var tween = new TWEEN.Tween(cur).to(target, this.morphInterval-10);
    tween.easing(TWEEN.Easing.Elastic.Out);
   
    tween.onUpdate(function(){
      _this.morph_amplitude = cur.amplitude;
    });
    tween.onComplete(function(){
      _this.isMorphing = false;
    })
    tween.start();
    // might need this later on if we're shading extra stuff with windmill clouds
//     this.normals = this.windmillData.normals;
//     this.texture_coords = this.windmillData.texture_coords;
//     this.indices = this.windmillData.indices;
  }
}

window.Morph_Shader = window.classes.Morph_Shader =
class Morph_Shader extends Phong_Shader {
    //override
    material( color, properties )     // Define an internal class "Material" that stores the standard settings found in Phong lighting.
    { return new class Material       // Possible properties: ambient, diffusivity, specularity, smoothness, gouraud, texture.
        { constructor( shader, color = Color.of( 0,0,0,1 ), ambient = 0, diffusivity = 1, specularity = 1, smoothness = 40, morph_amplitude = 0)
            { Object.assign( this, { shader, color, ambient, diffusivity, specularity, smoothness, morph_amplitude } );  // Assign defaults.
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
    //override
    vertex_glsl_code()           // Use same logic as phong vertex shader, except displace vertices with morph targets
    { return `
        attribute vec3 object_space_pos, normal, target_pos;
        attribute vec2 tex_coord;

        uniform mat4 camera_transform, camera_model_transform, projection_camera_model_transform;
        uniform mat3 inverse_transpose_modelview;
        uniform float morph_amplitude;

        void main()
        { 
          vec3 morphed_pos = object_space_pos + (target_pos - object_space_pos) * morph_amplitude;
          gl_Position = projection_camera_model_transform * vec4(morphed_pos, 1.0);     // The vertex's final resting place (in NDCS).
          N = normalize( inverse_transpose_modelview * normal );                             // The final normal vector in screen space.
          f_tex_coord = tex_coord;                                         // Directly use original texture coords and interpolate between.
          
          if( COLOR_NORMALS )                                     // Bypass all lighting code if we're lighting up vertices some other way.
          { VERTEX_COLOR = vec4( N[0] > 0.0 ? N[0] : sin( animation_time * 3.0   ) * -N[0],             // In "normals" mode, 
                                 N[1] > 0.0 ? N[1] : sin( animation_time * 15.0  ) * -N[1],             // rgb color = xyz quantity.
                                 N[2] > 0.0 ? N[2] : sin( animation_time * 45.0  ) * -N[2] , 1.0 );     // Flash if it's negative.
            return;
          }
                                                  // The rest of this shader calculates some quantities that the Fragment shader will need:
          vec3 screen_space_pos = ( camera_model_transform * vec4(morphed_pos, 1.0) ).xyz;
          E = normalize( -screen_space_pos );

          for( int i = 0; i < N_LIGHTS; i++ )
          {            // Light positions use homogeneous coords.  Use w = 0 for a directional light source -- a vector instead of a point.
            L[i] = normalize( ( camera_transform * lightPosition[i] ).xyz - lightPosition[i].w * screen_space_pos );
            H[i] = normalize( L[i] + E );
            
            // Is it a point light source?  Calculate the distance to it from the object.  Otherwise use some arbitrary distance.
            dist[i]  = lightPosition[i].w > 0.0 ? distance((camera_transform * lightPosition[i]).xyz, screen_space_pos)
                                                : distance( attenuation_factor[i] * -lightPosition[i].xyz, morphed_pos.xyz );
          }

          if( GOURAUD )                   // Gouraud shading mode?  If so, finalize the whole color calculation here in the vertex shader, 
          {                               // one per vertex, before we even break it down to pixels in the fragment shader.   As opposed 
                                          // to Smooth "Phong" Shading, where we *do* wait to calculate final color until the next shader.
            VERTEX_COLOR      = vec4( shapeColor.xyz * ambient, shapeColor.w);
            VERTEX_COLOR.xyz += phong_model_lights( N );
          }
        }`;
    }
    
    //override
    map_attribute_name_to_buffer_name( name )                 // Use same attributes as phong, except add a target position 
    {                                                        
      return { object_space_pos: "positions", normal: "normals", tex_coord: "texture_coords", target_pos: "target_positions" }[ name ]; }
    update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
    {                              // First, send the matrices to the GPU, additionally cache-ing some products of them we know we'll need:
      this.update_matrices( g_state, model_transform, gpu, gl );
      gl.uniform1f ( gpu.animation_time_loc, g_state.animation_time / 1000 );

      if( g_state.gouraud === undefined ) { g_state.gouraud = g_state.color_normals = false; }    // Keep the flags seen by the shader 
      gl.uniform1i( gpu.GOURAUD_loc,        g_state.gouraud || material.gouraud );                // program up-to-date and make sure 
      gl.uniform1i( gpu.COLOR_NORMALS_loc,  g_state.color_normals );                              // they are declared.

      gl.uniform4fv( gpu.shapeColor_loc,     material.color       );    // Send the desired shape-wide material qualities 
      gl.uniform1f ( gpu.ambient_loc,        material.ambient     );    // to the graphics card, where they will tweak the
      gl.uniform1f ( gpu.diffusivity_loc,    material.diffusivity );    // Phong lighting formula.
      gl.uniform1f ( gpu.specularity_loc,    material.specularity );
      gl.uniform1f ( gpu.smoothness_loc,     material.smoothness  );
      gl.uniform1f ( gpu.morph_amplitude_loc,     material.morph_amplitude  );

      if( material.texture )                           // NOTE: To signal not to draw a texture, omit the texture parameter from Materials.
      { gpu.shader_attributes["tex_coord"].enabled = true;
        gl.uniform1f ( gpu.USE_TEXTURE_loc, 1 );
        gl.bindTexture( gl.TEXTURE_2D, material.texture.id );
      }
      else  { gl.uniform1f ( gpu.USE_TEXTURE_loc, 0 );   gpu.shader_attributes["tex_coord"].enabled = false; }

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