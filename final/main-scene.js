let good_guy_duration = 105.808;
let good_guy_tempo = 66.786;

let pet_cemetery_duration = 60;
let pet_cemetery_tempo = 149.972;

let track_duration = 269;
let track_tempo = 65.832;
 
window.playDefaultSongs = () => {
    if (window.track == 1) {
        track_duration = pet_cemetery_duration;
        window.tempo = pet_cemetery_tempo;
        window.defaultSong = document.getElementById("petcemetery");
    } else if (window.track == 2) {
        track_duration = good_guy_duration;
        window.tempo = good_guy_tempo;
        window.defaultSong = document.getElementById("goodguy");
    }
    window.defaultSong.play();
    window.mainScene.shapes.cloudParticle.changeInterval(60/window.tempo * 1000);
    window.mainScene.shapes.cloudParticle.startMorphing();
    window.defaultSong.onended = () => {
        window.songEnded = true;
    }
}

window.Rotisserie_Record_Player = window.classes.Rotisserie_Record_Player =
class Rotisserie_Record_Player extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,9,15 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

        this.r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, this.r, .1, 1000 );

        window.track = 1;
        window.defaultSong = document.getElementById("petcemetery");
        window.playNeedle = false;

        // shadow mapping setup
        this.webgl_manager = context;      // Save off the Webgl_Manager object that created the scene.
        this.scratchpad = document.createElement('canvas');
        this.scratchpad_context = this.scratchpad.getContext('2d');     // A hidden canvas for re-sizing the real canvas to be square.
        this.scratchpad.width   = 256;
        this.scratchpad.height  = 256;
        this.shadowTexture = new Texture ( context.gl, "", false, false );        // Initial image source: Blank gif file
        this.shadowTexture.image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        // picking setup
        this.webgl_manager = context;      // Save off the Webgl_Manager object that created the scene.
        this.scratchpad = document.createElement('canvas');
        this.scratchpad_context = this.scratchpad.getContext('2d');     // A hidden canvas for re-sizing the real canvas to be square.
        this.scratchpad.width   = 256;
        this.scratchpad.height  = 256;
        this.pickingTexture = new Texture ( context.gl, "", false, false );        // Initial image source: Blank gif file
        this.pickingTexture.image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        window.play_flag = false;
        window.songPicked = false;
        this.collided = false;
        window.paused = false;

        const shapes = { box:   new Cube(),
                         axis:  new Axis_Arrows(),
                         torus:  new TorusModified( 20, 60 ),
                         sphere: new Subdivision_Sphere( 3 ),
                         cylinder: new Capped_Cylinder(30, 30),
                         cloudParticle: new Morph_Cube(),
                         lid: new Open_Face_Cube()
                       }

        window.cloud = shapes.cloudParticle;
        
        this.submit_shapes( context, shapes );

        this.materials =
          {
            basic: context.get_instance( Funny_Shader ).material( Color.of( 1,0,0,1 )),
            phong: context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ) ),
            cloud: context.get_instance( Morph_Shader).material( Color.of( .1,.1,.1,.6 ), { ambient: .8, diffusivity: .5, specularity: .2, morph_amplitude: 0, color: Color.of(.9, .88, .95, 1) } ),
            texture: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance( "assets/noCYg90.jpg", false ) } ),
            glass: context.get_instance(Phong_Shader).material(Color.of(1,1,1,0.4)),
            shadows: context.get_instance( Shadow_Shader ).material( Color.of( 0,0,0,1 ), { ambient: .8, shadow: this.shadowTexture, texture: context.get_instance( "assets/noCYg90.jpg", false ) } ),
            recordBaseTexture: context.get_instance( Shadow_Shader ).material( Color.of( 0,0,0,1 ), { ambient: 1, texture: context.get_instance( "assets/noCYg90.jpg", false ) } ),
            record: context.get_instance( Phong_Shader ).material( Color.of( 0,0,0,1 ), {ambient: 1, texture: context.get_instance( "assets/record.png", false ) } ),
          }

        const sunLight = new Light( Vec.of( 0,20,0,.2 ), Color.of( 1,1,0,1 ), 10000 );

        this.lights = [ sunLight, new Light( Vec.of( -5,5,5,1 ), Color.of( 1,1,1,1 ), 100000 ) ];

        this.audio_t = 0;

        // initialize recordBase
        this.recordBase = Mat4.identity().times(Mat4.translation([0,0,0]));
        // scale the recordBase to be a flat, rectangular object
        this.recordBase = this.recordBase.times(Mat4.scale([3.5,.3, 3.5]));

        // initialize recordState
        this.recordState = Mat4.identity();
        // generic scaling (placeholder)
        this.recordState = this.recordState.times(Mat4.scale([1.5,.1, 1.5]));
        // move record above the recordBase
        this.recordState = this.recordState.times(Mat4.translation([0,5,0]));
        // rotate record so it is parallel to the horizontal
        this.recordState = this.recordState.times(Mat4.rotation( 10, Vec.of( .4,1,1 ) ));

        window.lid_open = false;
        // save the position of the top of the vinyl
        this.vinyl_position = this.recordState;

        this.initialize_clouds();

        window.spotify = true;

        this.armState = Mat4.identity();
        this.needleState = Mat4.identity();
        this.pausedState = Mat4.identity();
        this.startState = Mat4.identity();
        this.hasBeenPaused = false;
        window.collision = false;

        window.mainScene = this;
        window.track = 1;
        window.tempo = 0;

        window.songStarted = false;

        window.songEnded = false;
      }
    initialize_clouds() 
      {
        // array of array of particle states
        this.cloudStates = [];

        // nested loop to create list of list particleStates for the clouds
        for (let i = 0; i < 20; ++ i) {
            const particleStates = [];

            // choose a general "base state" for this grouping of cloudParticles
            const range_x = 20;
            const range_y = 12;
//             const range_z = 
            const base_y = (2*Math.random()-1)*range_y;
//             const base_z = (2*Math.random()-1)*range - 3;
            const base_z = -5;
            const base_x = (2*Math.random()-1)*range_x;
            const particleBaseState = Mat4.identity().times(Mat4.translation([base_x,base_y,base_z]));

            // choose the number of particles in this particular cloud
            const numParticlesInCloud = Math.floor(Math.random()*3 + 3)

            // randomize the scale, rot, and translation of the cloudParticles around
            // this general "base state" to create a cloud.
            for (let j = 0; j < numParticlesInCloud; ++j) {
                let particleState = particleBaseState;

                // randomly generate scale, translation, and rot variables
                const scale_x = Math.random()*.3 + .4;
                const scale_y = Math.random()*.3 + .4;
                const scale_z = Math.random()*.3 + .4;

                const scale_factor = Math.random()*.6+.08;

                const translate_x = (2*Math.random()-1)*.16 + j-.4;
                const translate_y = (2*Math.random()-1)*.8;
                const translate_z = (2*Math.random()-1)*.8;

                const rotation_x = Math.random()*.02 - .01;
                const rotation_y = Math.random()*.02 - .01;
                const rotation_z = Math.random()*.02 - .01;


                // apply the effects onto the particleState
                particleState = particleState.times(Mat4.translation([translate_x, translate_y, translate_z]));
                particleState = particleState.times(Mat4.scale([scale_factor, scale_factor, scale_factor]));
                particleState = particleState.times(Mat4.rotation(.4, Vec.of(rotation_x, rotation_y, rotation_z)));
                // particleState = particleState.times(Mat4.rotation([rotation_x, rotation_y, rotation_z]));

                // append this particle into the current "cloud", or "particle states"
                particleStates.push(particleState)
            }

            // append the grouping of clouds into the cloudState 
            this.cloudStates.push(particleStates);

        }
      }
    make_control_panel()
      { 
        this.new_line();
        this.key_triggered_button( "Open/close lid", [ "o" ], () => window.lid_open = !window.lid_open);
/*
                this.result_img = this.control_panel.appendChild( Object.assign( document.createElement( "img" ), 
                { style:"width:200px; height:" + 200 * this.aspect_ratio + "px" } ) );
                */
      }

    display( graphics_state )
      { 
        const previousCameraState = graphics_state.camera_transform;

        // make the camera look from the "sun's" POV
        graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,25,0,.8 ), Vec.of( 1,0,0 ), Vec.of( 0,1,5 ) );
        graphics_state.lights = [];

        this.drawClouds( graphics_state);

        // get the shadow mapping
        this.calculateShadowMap( graphics_state );
        
        // reset camera state
        graphics_state.lights = this.lights;
        graphics_state.camera_transform = previousCameraState;
        this.drawScene( graphics_state );

      }
    drawScene( graphics_state ) {
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        // draw the record base
        let liftedRecordBase = this.recordBase.times(Mat4.translation([0,1,0]));
        liftedRecordBase = liftedRecordBase.times(Mat4.scale([.99,.01,.99]))
        this.shapes.box.draw(graphics_state, liftedRecordBase, this.materials.shadows);

        this.shapes.box.draw(graphics_state, this.recordBase, this.materials.recordBaseTexture);

        // rotate record as a function of time 
        if (window.songPicked && !window.paused && !window.songEnded && window.collision) {
            console.log('rotating');
            this.recordState = this.recordState.times( Mat4.rotation( dt, Vec.of( 0,0,1 ) ) );        
        }
        // search bar does not show up until the needle hits the record.
        var search = document.getElementById('searchBar');
        var login = document.getElementById('login');
        var defaultTracks = document.getElementById('default-tracks');

        if (window.collision && window.spotify) {
            search.style.display = 'block';
        }
        else {
            search.style.display = 'none';
        }

        if (!window.spotify) {
            login.style.display = 'none';
            defaultTracks.style.display = 'block';
        }
        if (window.songPicked) {
            defaultTracks.style.display = 'none';
        }

        // draw the record
        // this.shapes.torus.draw(graphics_state, this.recordState, this.materials.phong.override({color: Vec.of(0.2,0.2,0.2,1)}));
        this.shapes.torus.draw(graphics_state, this.recordState, this.materials.record);
        this.drawClouds(graphics_state);
        this.drawArm(graphics_state, t, dt, false);

        this.lid_state = Mat4.identity().times(Mat4.translation(Vec.of(0,0.8,0))).times(Mat4.scale(Vec.of(3.5,.5,3.5)))
        this.lid_state = window.lid_open ? this.lid_state.times(Mat4.scale(Vec.of(2/7,2,2/7))).times(Mat4.translation(Vec.of(0,-0.5,-3.5))).times(Mat4.rotation(-Math.PI/3, Vec.of(1,0,0))).times(Mat4.translation(Vec.of(0,0.5,3.5))).times(Mat4.scale(Vec.of(3.5,.5,3.5))) : this.lid_state

        this.shapes.lid.draw(graphics_state, this.lid_state, this.materials.glass);


        TWEEN.update();
    }

    calculateShadowMap( graphics_state ) {
        this.scratchpad_context.drawImage( this.webgl_manager.canvas, 0, 0, 256, 256 );
        this.shadowTexture.image.src = this.scratchpad.toDataURL("image/png");
		// Clear the canvas and start over, beginning scene 2:
        this.webgl_manager.gl.clear( this.webgl_manager.gl.COLOR_BUFFER_BIT | this.webgl_manager.gl.DEPTH_BUFFER_BIT);

    }

    drawClouds( graphics_state )
      {
        // draw the clouds
        this.cloudStates.forEach(cloud => {
            cloud.forEach(particle => {
                this.shapes.cloudParticle.draw(graphics_state, particle, this.materials.cloud.override({morph_amplitude: window.cloud.morph_amplitude, }));
            })
        }) 
      }
    detect_collision( vinyl_top_y_coord, needle_bottom_y_coord ) {
        if (needle_bottom_y_coord - vinyl_top_y_coord <= 0.6) {
          window.collision = true;
          // this.collided = true;
        }
    }
    drawArm( graphics_state, t, dt, pickingMode )
    {
      this.needleHolder = Mat4.identity().times(Mat4.translation(Vec.of(3.0, 0.5, -1.8)))
      this.needleHolder = this.needleHolder.times(Mat4.scale(Vec.of(0.3, 0.8, 0.3)))
      this.needleHolder = this.needleHolder.times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0)))
      this.shapes.cylinder.draw(graphics_state, this.needleHolder, this.materials.phong.override({color: Vec.of(0, 0, 0, 1)}))
      
      const angle = 0.75, a = 0, b = -angle/2, w = (2*Math.PI*dt)/track_duration
      const rotation_function = a+b*Math.sin(w*t)

      if (window.reset) {
        this.rotateState = Mat4.identity()
        this.rotateState = this.rotateState.times(Mat4.translation(Vec.of(3.0,.72,-1.8)))
        window.reset = false;
      }
      if (window.play_flag) { // User hit play
        if (window.collision) {
          // Start rotating along vinyl
          if (window.songPicked && !window.songEnded) {
            if (this.hasBeenPaused) {
              window.mainScene.shapes.cloudParticle.changeInterval(60/window.tempo * 1000)
              window.mainScene.shapes.cloudParticle.startMorphing()
            }
            this.rotateState = this.rotateState.times(Mat4.rotation(-0.65/track_duration*dt, Vec.of(0,1,0)))
          } else if (window.songEnded) {
            console.log("song ended");
            window.mainScene.shapes.cloudParticle.stopMorphing()
          }

          // play song if not in spotify mode
          if (!window.spotify) {
            if(window.songPicked && !window.songEnded && !window.songStarted) {
                window.playDefaultSongs();
                window.songStarted = true;
            }
//            window.songPicked = true;
          }

        } else {
          // Translate needle downwards until collision is detected
          this.rotateState = this.rotateState.times(Mat4.translation(Vec.of(0, -0.005, 0)))
        }

        this.pausedState = this.rotateState
      } else if (window.paused) {
          console.log("song paused");
        this.rotateState = this.pausedState;
        window.mainScene.shapes.cloudParticle.stopMorphing();
      }
      else {
        this.rotateState = Mat4.identity()
        this.rotateState = this.rotateState.times(Mat4.translation(Vec.of(3.0,1.0,-1.8)))
      }

      // scale to draw arm base
      let armBaseState = window.play_flag || window.paused ? this.rotateState.times(Mat4.rotation(-2/9, Vec.of(0, 1, 0))) : this.rotateState
      armBaseState = armBaseState.times(Mat4.scale(Vec.of(0.2,0.1,0.3)))
      this.shapes.box.draw(graphics_state, armBaseState, this.materials.phong.override({color: Vec.of(0,0,0,1)}))
      // scale back
      armBaseState = armBaseState.times(Mat4.scale(Vec.of(5,10,10/3)))

      // translate to middle of arm base
      let armState = armBaseState
      armState = armState.times(Mat4.translation(Vec.of(0,0,1.2)));

      // scale down to draw arm
      armState = armState.times(Mat4.scale(Vec.of(0.04,0.04,3.0)));
      this.shapes.cylinder.draw(graphics_state, armState, this.materials.phong.override({color: Vec.of(0.8, 0.8, 0.8, 1)}));

      // scale back
      armState = armState.times(Mat4.scale(Vec.of(25,25,1/3)))

      // translate to other end of arm
      let needleBaseState = armState
      needleBaseState = needleBaseState.times(Mat4.translation(Vec.of(0,0,1.5)))

      // scale to draw needle base
      needleBaseState = needleBaseState.times(Mat4.scale(Vec.of(0.1,0.1,0.3)))
      // draw needle base
      if (pickingMode) {
        this.shapes.box.draw(graphics_state, needleBaseState, this.materials.basic );
      } else {
        this.shapes.box.draw(graphics_state, needleBaseState, this.materials.phong.override({color: Vec.of(0,0,0,1)}));
      }
      // scale back
      needleBaseState = needleBaseState.times(Mat4.scale(Vec.of(10,10,10/3)))

      // rotate to draw needle perpendicular
      let needleState = needleBaseState
      needleState = needleState.times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0)))
      needleState = needleState.times(Mat4.translation(Vec.of(0,0.1,0.12)))
      // scale to draw needle
      needleState = needleState.times(Mat4.scale(Vec.of(0.008,0.008,0.1)));

      this.shapes.box.draw(graphics_state, needleState, this.materials.phong.override({color: Vec.of(0.8, 0.8, 0.8, 1)}));
      // translate to bottom of needle
      let tempArmState = needleState.times(Mat4.translation(Vec.of(0, 0.1, 0, 0)));

      this.detect_collision(this.vinyl_position.times(Vec.of(0, 1, 0, 0))[1], tempArmState[1][3]);
    }
  }

class Texture_Scroll_X extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec4 tex_color = texture2D( texture, f_tex_coord );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}

class Texture_Rotate extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER ********* 
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #7.
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          vec4 tex_color = texture2D( texture, f_tex_coord );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}