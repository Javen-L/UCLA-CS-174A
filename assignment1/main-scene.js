window.Cube = window.classes.Cube =
class Cube extends Shape                 // Here's a complete, working example of a Shape subclass.  It is a blueprint for a cube.
  { constructor()
      { super( "positions", "normals" ); // Name the values we'll define per each vertex.  They'll have positions and normals.

        // First, specify the vertex positions -- just a bunch of points that exist at the corners of an imaginary cube.
        this.positions.push( ...Vec.cast( [-1,-1,-1], [1,-1,-1], [-1,-1,1], [1,-1,1], [1,1,-1],  [-1,1,-1],  [1,1,1],  [-1,1,1],
                                          [-1,-1,-1], [-1,-1,1], [-1,1,-1], [-1,1,1], [1,-1,1],  [1,-1,-1],  [1,1,1],  [1,1,-1],
                                          [-1,-1,1],  [1,-1,1],  [-1,1,1],  [1,1,1], [1,-1,-1], [-1,-1,-1], [1,1,-1], [-1,1,-1] ) );
        // Supply vectors that point away from eace face of the cube.  They should match up with the points in the above list
        // Normal vectors are needed so the graphics engine can know if the shape is pointed at light or not, and color it accordingly.
        this.normals.push(   ...Vec.cast( [0,-1,0], [0,-1,0], [0,-1,0], [0,-1,0], [0,1,0], [0,1,0], [0,1,0], [0,1,0], [-1,0,0], [-1,0,0],
                                          [-1,0,0], [-1,0,0], [1,0,0],  [1,0,0],  [1,0,0], [1,0,0], [0,0,1], [0,0,1], [0,0,1],   [0,0,1],
                                          [0,0,-1], [0,0,-1], [0,0,-1], [0,0,-1] ) );

                 // Those two lists, positions and normals, fully describe the "vertices".  What's the "i"th vertex?  Simply the combined
                 // data you get if you look up index "i" of both lists above -- a position and a normal vector, together.  Now let's
                 // tell it how to connect vertex entries into triangles.  Every three indices in this list makes one triangle:
        this.indices.push( 0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
                          14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22 );
        // It stinks to manage arrays this big.  Later we'll show code that generates these same cube vertices more automatically.
      }
  }

window.Transforms_Sandbox = window.classes.Transforms_Sandbox =
class Transforms_Sandbox extends Tutorial_Animation   // This subclass of some other Scene overrides the display() function.  By only
{ display( graphics_state )                           // exposing that one function, which draws everything, this creates a very small code
                                                      // sandbox for editing a simple scene, and for experimenting with matrix transforms.
    { let model_transform = Mat4.identity();      // Variable model_transform will be a temporary matrix that helps us draw most shapes.
                                                  // It starts over as the identity every single frame - coordinate axes at the origin.
      graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
      /**********************************
      Start coding down here!!!!
      **********************************/         // From here on down it's just some example shapes drawn for you -- freely replace them
                                                  // with your own!  Notice the usage of the functions translation(), scale(), and rotation()
                                                  // to generate matrices, and the functions times(), which generates products of matrices.

      const blue = Color.of( 0,0,1,1 ), yellow = Color.of( 1,1, 0,1 );
   /*   
      model_transform = model_transform.times( Mat4.translation([ 0, 3, 20 ]) );
      this.shapes.box.draw( graphics_state, model_transform, this.plastic.override({ color: yellow }) );   // Draw the top box.

      const t = this.t = graphics_state.animation_time/1000;     // Find how much time has passed in seconds, and use that to place shapes.

      model_transform = model_transform.times( Mat4.translation([ 0, -2, 0 ]) );  // Tweak our coordinate system downward for the next shape.
      this.shapes.ball.draw( graphics_state, model_transform, this.plastic.override({ color: blue }) );    // Draw the ball.
      let new_model_transform = model_transform;
      for (let i = 0; i < 10; i++) {
        new_model_transform = new_model_transform.times( Mat4.translation([0, 2, 0]) );
        this.shapes.ball.draw( graphics_state, new_model_transform, this.plastic.override({ color: Color.of(1, 1, 1, 1)}) );

      }

      if( !this.hover )     // The first line below won't execute if the button on the page has been toggled:
        model_transform = model_transform.times( Mat4.rotation( t, Vec.of( 0,1,0 ) ) )  // Spin our coordinate frame as a function of time.
      model_transform   = model_transform.times( Mat4.rotation( 1, Vec.of( 0,0,1 ) ) )  // Rotate another axis by a constant value.
                                         .times( Mat4.scale      ([ 1,   2, 1 ]) )      // Stretch the coordinate frame.
                                         .times( Mat4.translation([ 0,-1.5, 0 ]) );     // Translate down enough for the two volumes to miss.
      this.shapes.box.draw( graphics_state, model_transform, this.plastic.override({ color: yellow }) );   // Draw the bottom box.
*/
      let modelTransform = Mat4.identity();
      modelTransform = modelTransform.times( Mat4.scale([1, 1, 1]) );
      const color1 = Color.of(1, 1, 1, 1);
      const color2 = Color.of(1, 1, 0, 1);
      const color3 = Color.of(0, 1, 1, 1);
      const color4 = Color.of(0.5, 1, 0.5, 1);
      const colors = [color1, color2, color3, color4, color1, color2, color3, color4]
      for (var i = 0; i < 8; i++) {
        modelTransform = modelTransform.times( Mat4.translation([ 0, 2, 0]));
        this.shapes.box.draw( graphics_state, modelTransform, this.plastic.override({ color: colors[i]}) );
      }



    }
}

window.Cube_Outline = window.classes.Cube_Outline =
class Cube_Outline extends Shape
  { constructor()
      { super( "positions", "colors" ); // Name the values we'll define per each vertex.
        // First, specify the vertex positions -- just a bunch of points that exist at the corners of an imaginary cube.
        this.positions.push( ...Vec.cast( [-1,-1,-1], [1,-1,-1], [-1,-1,1], [1,-1,1], [1,1,-1],  [-1,1,-1],  [1,1,1],  [-1,1,1],
                                          [-1,-1,-1], [-1,-1,1], [-1,1,-1], [-1,1,1], [1,-1,1],  [1,-1,-1],  [1,1,1],  [1,1,-1],
                                          [-1,-1,1],  [1,-1,1],  [-1,1,1],  [1,1,1], [1,-1,-1], [-1,-1,-1], [1,1,-1], [-1,1,-1], 
                                          [-1,-1,-1], [-1,1,-1], [-1,-1,1], [-1,1,1], [1,-1,-1], [1,1,-1], [1,1,1], [1,-1,1]) );

        const white = Color.of(1, 1, 1, 1);
        this.colors.push( white, white, white, white, white, white, white, white,
                          white, white, white, white, white, white, white, white,
                          white, white, white, white, white, white, white, white,
                          white, white, white, white, white, white, white, white );


        this.indexed = false;       // Do this so we won't need to define "this.indices".
      }
  }

window.Cube_Single_Strip = window.classes.Cube_Single_Strip =
class Cube_Single_Strip extends Shape
  { constructor()
      { super( "positions", "normals" );
        this.positions.push( ...Vec.cast( [-1,-1,-1], [1,-1,-1], [1,1,-1],  // back 
                                          [-1,-1,-1], [1,1,-1], [-1,1,-1],  // back
                                          [-1,-1,-1], [-1,1,-1], [-1,-1,1], // side 
                                          [-1,-1,1], [-1,1,-1], [-1,1,1],   // side
                                          [-1,1,-1], [-1,1,1], [1,1,-1],    // top
                                          [-1,1,1], [1,1,-1], [1,1,1],      // top
                                          [1,1,1], [-1,1,1], [-1,-1,1],     // front
                                          [-1,-1,1], [1,1,1], [1,-1,1],     // front
                                          [-1,-1,1], [-1,-1,-1], [1,-1,1],  // bottom
                                          [1,-1,1], [-1,-1,-1], [1,-1,-1],  // bottom
                                          [1,-1,-1], [1,1,-1], [1,1,1],     // side
                                          [1,1,1], [1,-1,1], [1,-1,-1]      // side
                                          ) );
        this.normals.push( ...Vec.cast( [-1,-1,-1], [1,-1,-1], [1,1,-1], 
                                        [-1,-1,-1], [1,1,-1], [-1,1,-1],
                                        [-1,-1,1], [-1,1,-1], [1, -1, 1],
                                        [-1,-1,1], [-1,1,-1], [-1,1,1],
                                        [-1,1,-1], [-1,1,1], [1,1,-1],
                                        [-1,1,1], [1,1,-1], [1,1,1],
                                        [1,1,1], [-1,1,1], [-1,-1,1],
                                        [-1,-1,1], [1,1,1], [1,-1,1],
                                        [-1,-1,1], [-1,-1,-1], [1,-1,1],
                                        [1,-1,1], [-1,-1,-1], [1,-1,-1],
                                        [1,-1,-1], [1,1,-1], [1,1,1],
                                        [1,1,1], [1,-1,1], [1,-1,-1]
                                        ) );
        this.indices.push(0, 1, 2, 
                          3, 4, 5, 
                          6, 7, 8, 
                          9, 10, 11, 
                          12, 13, 14, 
                          15, 16, 17, 
                          18, 19, 20, 
                          21, 22, 23,
                          24, 25, 26,
                          27, 28, 29,
                          30, 31, 32,
                          33, 34, 35
                          );
      }
  }

window.Assignment_One_Scene = window.classes.Assignment_One_Scene =
class Assignment_One_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   )
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) );
        const r = context.width/context.height;
        context.globals.graphics_state.    camera_transform = Mat4.translation([ 5,-10,-30 ]);  // Locate the camera here (inverted matrix).
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { 'box': new Cube(),               // At the beginning of our program, load one of each of these shape
                       'strip': new Cube_Single_Strip(),  // definitions onto the GPU.  NOTE:  Only do this ONCE per shape
                     'outline': new Cube_Outline() }      // design.  Once you've told the GPU what the design of a cube is,
        this.submit_shapes( context, shapes );            // it would be redundant to tell it again.  You should just re-use
                                                          // the one called "box" more than once in display() to draw
                                                          // multiple cubes.  Don't define more than one blueprint for the
                                                          // same thing here.

                                     // Make some Material objects available to you:
        this.clay   = context.get_instance( Phong_Shader ).material( Color.of( .9,.5,.9, 1 ), { ambient: .4, diffusivity: .4 } );
        this.white  = context.get_instance( Basic_Shader ).material();
        this.plastic = this.clay.override({ specularity: .6 });

        this.lights = [ new Light( Vec.of( 0,5,5,1 ), Color.of( 1, .4, 1, 1 ), 100000 ) ];
        this.sway = true;
        this.outline = false;
        this.currentPalette = -1;
        this.colorSet;

        this.set_colors();
      }
    set_colors() {
      if (this.currentPalette == 3) {
        this.currentPalette = 0;
      } else {
        this.currentPalette++;
      }
      let palette0 = [Color.of(202/255, 207/255, 214/255, 1), 
                      Color.of(213/255, 229/255, 227/255, 1), 
                      Color.of(160/255, 216/255, 203/255, 1),
                      Color.of(79/255, 117/255, 99/255, 1),
                      Color.of(45/255, 51/255, 23/255, 1),
                      Color.of(146/255, 189/255, 163/255, 1),
                      Color.of(161/255, 186/255, 137/255, 1),
                      Color.of(118/255, 137/255, 72/255, 1),
                     ];
      let palette1 = [Color.of(89/255, 95/255, 114/255, 1),
                      Color.of(87/255, 93/255, 144/255, 1),
                      Color.of(132/255, 160/255, 24/255, 1),
                      Color.of(195/255, 211/255, 80/255, 1),
                      Color.of(230/255, 241/255, 74/255, 1),
                      Color.of(250/255, 223/255, 99/255, 1),
                      Color.of(195/255, 211/255, 80/255, 1),
                      Color.of(242/255, 239/255, 234/255, 1),
                     ];
      let palette2 = [Color.of(58/255, 64/255, 90/255, 1),
                      Color.of(125/255, 147/255, 138/255, 1),
                      Color.of(173/255, 160/255, 166/255, 1),
                      Color.of(210/255, 203/255, 203/255, 1),
                      Color.of(193/255, 197/255, 193/255, 1),
                      Color.of(104/255, 142/255, 196/255, 1),
                      Color.of(221/255, 166/255, 166/255, 1),
                      Color.of(249/255, 231/255, 231/255, 1),
                     ];
      let palette3 = [Color.of(53/255, 30/255, 41/255, 1),
                      Color.of(161/255, 61/255, 99/255, 1),
                      Color.of(109/255, 211/255, 206/255, 1),
                      Color.of(200/255, 233/255, 160, 1),
                      Color.of(247/255, 162/255, 120/255, 1),
                      Color.of(197/255, 239/255, 203/255, 1),
                      Color.of(239/255, 170/255, 196/255, 1),
                      Color.of(107/255, 113/255, 126/255, 1),
                     ];

      this.colorSet = [palette0, palette1, palette2, palette3];
      }
    make_control_panel()             // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { this.key_triggered_button( "Change Colors", [ "c" ], this.set_colors );    // Add a button for controlling the scene.
        this.key_triggered_button( "Outline",       [ "o" ], () => {
          this.outline = !this.outline;
          } );
        this.key_triggered_button( "Sit still",     [ "m" ], () => {
          this.sway = !this.sway;
          } );
      }
    draw_box( graphics_state, model_transform, box_num )
      {
        const t = this.t = graphics_state.animation_time/1000;      // Time in seconds.

        // First box should be still.
        if (box_num != 0) {
            model_transform = model_transform.times( Mat4.translation([0, 2.5, 0]) );
     
          // Need to move the axis of rotation to the corner of the box.
          model_transform = model_transform.times( Mat4.translation([1, -1, 0]) );
          
          // Used the a+bsin(wt) equation.
          // a shifted the "graph" up half the amplification we want
          // b is the amplication we want, which is 1/2 of 0.04*Math.PI
          // w is the period we want, which is 3 times back and forth per second
          const angle = 0.04*Math.PI;

          if (this.sway) {
            model_transform = model_transform.times( Mat4.rotation((-(angle/2)+(angle/2*Math.sin(2*Math.PI*3*t))), Vec.of(0, 0, 1)) );
          } else {
            model_transform = model_transform.times( Mat4.rotation(-angle, Vec.of(0, 0, 1)) );
          }


          // EXTRA CREDIT II, want to rotate, then scale to prevent shearing
          model_transform = model_transform.times( Mat4.scale([1, 1.5, 1]) );
      
          // After rotating, move the axis back to the correct position before drawing the box.
          model_transform = model_transform.times( Mat4.translation([-1, 1, 0]) );
          if (!this.outline) {
            this.shapes.box.draw(graphics_state, model_transform, this.plastic.override({ color: this.colorSet[this.currentPalette][box_num] }) );
          } else {
            this.shapes.outline.draw(graphics_state, model_transform, this.white, "LINES" );
          }
        }
        model_transform = model_transform.times( Mat4.scale([1, (2/3), 1]) );
        return model_transform;
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.

        let model_transform = Mat4.identity();

        model_transform = model_transform.times( Mat4.scale([1, 1.5, 1]) );
        this.shapes.strip.draw(graphics_state, model_transform, this.plastic.override({ color: this.colorSet[this.currentPalette][0] }), "TRIANGLE_STRIP" );
        model_transform = model_transform.times( Mat4.scale([1, (2/3), 1]) );

        for (let i = 1; i < 8; i++) {
          model_transform = this.draw_box( graphics_state, model_transform, i );
        } 
      }
  }
