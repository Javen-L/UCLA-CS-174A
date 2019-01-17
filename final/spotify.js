let me;
const client_id = 'b79659a2b57d46b3afa58019ea24210d';
const redirect_uri = 'http%3A%2F%2Flocalhost:8000';

let spotifyAPI;
let popup;
  
function login() {
  popup = window.open(`https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&redirect_uri=${redirect_uri}&show_dialog=true&scope=streaming user-read-birthdate user-read-email user-read-private`,"_self", 'width=800,height=600')
}


//call this when we have an auth token in url
window.spotifyCallback = (payload) => {  
  // Set up API wrapper   
  spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(payload);
  
  function clearSearchBar(){
    const dropdown = document.getElementById('dropdown');
    while(dropdown.firstChild){
      dropdown.removeChild(dropdown.firstChild);
    }
  }

  function getTrack(id){
    spotifyApi.getTrack(id)
    .then((res, err) => {
    })
  }

  function search(str){
    if(str == ''){
     clearSearchBar();
     return;
    }
    spotifyApi.searchTracks(str)
    .then(function(data) {
      const {items} = data.tracks;
      clearSearchBar();
      items.forEach(item => {
        const link = document.createElement('a');
        const artist = item.artists.length ? " - " + item.artists[0].name : "";
        link.innerHTML = item.name + artist;
        link.addEventListener('mousedown', function(){
            window.mainScene.shapes.cloudParticle.stopMorphing();
            spotifyApi.getAudioFeaturesForTrack(item.id, (err, res) => {
              const {tempo} = res;
              window.tempo = tempo;
              const {duration_ms} = res;
              track_duration = duration_ms / 1000;

              console.log(track_duration);
              console.log(window.tempo);

              window.mainScene.shapes.cloudParticle.changeInterval(60/tempo * 1000);
              window.mainScene.shapes.cloudParticle.startMorphing();

              window.play({
                playerInstance: player,
                spotify_uri: 'spotify:track:' + item.id,
              }, true);
              window.songPicked = true;
              window.songEnded = false;
              window.reset = true;
            });
        });
        dropdown.appendChild(link);
      });
    }, function(err) {
      console.error(err);
    });    
  }
  
  const debouncedSearch = (function(func){
    const interval = 250;
    let timeoutID;
    return function(str) {
      const _this = this;
      clearTimeout(timeoutID);
      timeoutID = setTimeout(function(){
        func.call(_this, str);
      }, interval);
    }
  })(search);

  // Update display to reflect authorized state
  document.getElementById('searchBar').style.display = 'block';
  document.getElementById('searchInput').addEventListener('input', function(e){
    debouncedSearch(this.value);
  });
  document.getElementById('searchInput').addEventListener('change', clearSearchBar);
  document.getElementById('login').innerHTML = 'Logged in';
  document.getElementById('login').style.cursor = 'auto';  

  // initialize web player
  window.onSpotifyWebPlaybackSDKReady = () => {
    window.player = new Spotify.Player({
      name: 'Rotisserie Spotify Player',
      getOAuthToken: cb => { cb(payload); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => {
      console.log(state);
      if(this.state && !this.state.paused && state.paused && state.position === 0) {
        console.log('Track ended');
        window.songEnded = true;
      }
      this.state = state;
    });



  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    window.mainScene.key_triggered_button( "Resume", [ "r" ], () => {
        window.player.resume();
        window.mainScene.shapes.cloudParticle.startMorphing();
        window.play_flag = true;
        window.paused = false;
    } );
    window.mainScene.key_triggered_button( "Pause", [ "l" ], () => {
      window.paused = true;
        window.player.pause();
        window.play_flag = false;
        window.pause = true;
        window.mainScene.shapes.cloudParticle.stopMorphing();
    } );
  });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();
    
  window.play = ({
    spotify_uri,
    playerInstance: {
      _options: {
        getOAuthToken,
        id
      }
    }}, pauseImmediately) => {
      getOAuthToken(access_token => {
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [spotify_uri] }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          },
        })
        .then((res, err) => {
          if(pauseImmediately){
            window.player.pause();
          }
        });
      });
    };
  };
  
}

window.noSpotify = () => { 
  window.spotify = false;
  if (!window.spotify) {
    window.mainScene.key_triggered_button( "Resume", ["r"], () => {
      window.play_flag = true;
      window.paused = false;
      window.mainScene.shapes.cloudParticle.startMorphing();
      window.defaultSong.play();
    });
      window.mainScene.key_triggered_button( "Pause", ["l"], () => {
      window.play_flag = false;
      window.paused = true;
      window.mainScene.shapes.cloudParticle.stopMorphing();
      console.log('paused');
      window.defaultSong.pause();
    });
  }
}

window.track1 = () => {
  window.songPicked = true;
  window.track = 1;
}

window.track2 = () => {
  window.songPicked = true;
  window.track = 2;
}

const AUTH_TOKEN = window.location.hash.substr(1).split('&')[0].split("=")[1];
if(AUTH_TOKEN == undefined){
  document.getElementById('login').addEventListener('mousedown', login);
  document.getElementById('spotify').addEventListener('mousedown', window.noSpotify); 
  document.getElementById('track1').addEventListener('mousedown', window.track1);
  document.getElementById('track2').addEventListener('mousedown', window.track2);
  document.getElementById('searchBar').style.display = 'none';
} else if (window.spotify) {
  window.spotifyCallback(AUTH_TOKEN);
  document.getElementById('spotify').style.display = 'none';
}