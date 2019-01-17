window.Assignment_Two_Test = window.classes.Assignment_Two_Test =
class Assignment_Two_Test extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = /*Mat4.inverse( */context.globals.graphics_state.camera_transform /*)*/;

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { torus:  new Torus( 15, 15 ),
                         torus2: new ( Torus.prototype.make_flat_shaded_version() )( 15, 15 ),
                         sphere: new Subdivision_Sphere(4),
                         planet1: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )(2),
                         planet2: new Subdivision_Sphere(3),
                         moon: new Subdivision_Sphere(1),
                       }
        this.submit_shapes( context, shapes );
                                     
                                     // Make some Material objects available to you:
        this.materials =
          { test:     context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient:.2 } ),
            ring:     context.get_instance( Ring_Shader  ).material(),
            sun:      context.get_instance( Phong_Shader ).material( Color.of( 1,0,0,1 ), { ambient: 1 } ), 
          }

        this.lights = [ new Light( Vec.of( 5,-10,5,1 ), Color.of( 0, 1, 1, 1 ), 1000 ) ];
      }
    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { this.key_triggered_button( "View solar system",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "Attach to planet 1", [ "1" ], () => this.attached = () => this.planet_1 );
        this.key_triggered_button( "Attach to planet 2", [ "2" ], () => this.attached = () => this.planet_2 ); this.new_line();
        this.key_triggered_button( "Attach to planet 3", [ "3" ], () => this.attached = () => this.planet_3 );
        this.key_triggered_button( "Attach to planet 4", [ "4" ], () => this.attached = () => this.planet_4 ); this.new_line();
        this.key_triggered_button( "Attach to planet 5", [ "5" ], () => this.attached = () => this.planet_5 );
        this.key_triggered_button( "Attach to moon",     [ "m" ], () => this.attached = () => this.moon     );
      }
    display( graphics_state )
      { 

        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        let radius = 2 + 1*Math.sin(2*Math.PI/5*t);
        let color = 0.5 + 0.5*Math.sin(2*Math.PI/5*t);

        let sun_transform = Mat4.identity();
        let sun_color = Color.of( color, 0, 1-color, 1 );
        
        sun_transform = sun_transform.times( Mat4.scale([radius, radius, radius]) );
        graphics_state.lights = [ new Light( Vec.of(0,0,0,1), sun_color, 10**radius) ];
        
        this.shapes.sphere.draw( graphics_state, sun_transform, this.materials.sun.override( {color: sun_color} ) );

        // Planet 1
        let planet_1_transform = Mat4.identity();
        planet_1_transform = planet_1_transform.times( Mat4.rotation(t, Vec.of(0,1,0)) );
        planet_1_transform = planet_1_transform.times( Mat4.translation([5,0,0]) );
        planet_1_transform = planet_1_transform.times( Mat4.rotation(t, Vec.of(0,1,0)) );
        this.shapes.planet1.draw( graphics_state, planet_1_transform, this.materials.test.override( {color: Color.of(57/255, 65/255, 82/255, 1),
                                                                                                    ambient: 0,
                                                                                                    specularity: 0,
                                                                                                    diffusivity: 1} ) );

        // Planet2
        let planet_2_transform  = Mat4.identity();
        planet_2_transform = planet_2_transform.times( Mat4.rotation(t/1.2, Vec.of(0,1,0)) );
        planet_2_transform = planet_2_transform.times( Mat4.translation([8,0,0]) );
        planet_2_transform = planet_2_transform.times( Mat4.rotation(t/1.2, Vec.of(0,1,0)) );
        this.shapes.planet2.draw( graphics_state, planet_2_transform, this.materials.test.override( {color: Color.of(28/255, 53/255, 50/255, 1),
                                                                                                    specularity: 1,
                                                                                                    diffusivity: 0.2,
                                                                                                    gouraud: (t%2==0)} ) );

        // Planet3
        let planet_3_transform = Mat4.identity();
        planet_3_transform = planet_3_transform.times( Mat4.rotation(t/1.4, Vec.of(0,1,0)) );
        planet_3_transform = planet_3_transform.times( Mat4.translation([11,0,0]) );   
        planet_3_transform = planet_3_transform.times( Mat4.rotation(t/1.4, Vec.of(1,1,1)) );
                                                                                                 
        let ring_transform = planet_3_transform;
        ring_transform = ring_transform.times( Mat4.scale([.9, .9, 0.1]) );    

        this.shapes.sphere.draw( graphics_state, planet_3_transform, this.materials.test.override( {color: Color.of(104/255, 58/255, 9/255, 1),
                                                                                                   specularity: 1,
                                                                                                   diffusivity: 1}) );
                                                                                 
        this.shapes.torus.draw( graphics_state, ring_transform, this.materials.test.override( {color: Color.of(104/255, 58/255, 9/255, 1),
                                                                                               specularity: 1,
                                                                                               diffusivity: 1}) );

        // Planet4
        let planet_4_transform  = Mat4.identity();
        planet_4_transform  = planet_4_transform .times( Mat4.rotation(t/1.67, Vec.of(0,1,0)) );
        planet_4_transform  = planet_4_transform .times( Mat4.translation([14,0,0]) );
        planet_4_transform = planet_4_transform.times( Mat4.rotation(t/1.67, Vec.of(0,1,0)) );   
        this.shapes.sphere.draw( graphics_state, planet_4_transform , this.materials.test.override( {color: Color.of(29/255, 40.4/255, 62.7/255, 1),
                                                                                                   specularity: 1, }) );
        let moon = planet_4_transform ;
        moon = moon.times( Mat4.rotation(t/1.2, Vec.of(0,1,0)) );
        moon = moon.times( Mat4.translation([2,0,0]) );
        moon = moon.times( Mat4.scale([0.75, 0.75, 0.75]) );
        this.shapes.moon.draw( graphics_state, moon, this.materials.test.override( {color: Color.of(75.5/255, 30.2/255, 56.1/255, 1),
                                                                                              specularity: 1,}) );

        this.planet_1 = Mat4.inverse(planet_1_transform.times( Mat4.translation([0,0,5])));
        this.planet_2 = Mat4.inverse(planet_2_transform.times( Mat4.translation([0,0,5])));
        this.planet_3 = Mat4.inverse(planet_3_transform.times( Mat4.translation([0,0,5])));
        this.planet_4 = Mat4.inverse(planet_4_transform.times( Mat4.translation([0,0,5])));
        this.moon = Mat4.inverse(moon.times( Mat4.translation([0,0,5])));
        if (this.attached != null) {
          graphics_state.camera_transform = this.attached();
          graphics_state.camera_transform = this.attached().map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) );
        }
      }
  }


// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             // names.  Map those names onto the arrays we'll pull them from.  This determines
                                                  // which kinds of Shapes this Shader is compatible with.  Thanks to this function, 
                                                  // Vertex buffers in the GPU can get their pointers matched up with pointers to 
                                                  // attribute names in the GPU.  Shapes and Shaders can still be compatible even
                                                  // if some vertex data feilds are unused. 
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        { 
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    }
}

window.Grid_Sphere = window.classes.Grid_Sphere =
class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at 
  { constructor( rows, columns, texture_range )             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
      { super( "positions", "normals", "texture_coords" );
        

                      // TODO:  Complete the specification of a sphere with lattitude and longitude lines
                      //        (Extra Credit Part III)
      } }