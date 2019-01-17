# Record Player - Rotisserie

## To Run
1. Type `open host.command` in terminal. <br>
2. Open `localhost:8000` in Google Chrome. <br>
3. Connect to Spotify using the 'Login' button in the lower right corner (must have a Spotify Premium account). Or click the 'Use without Spotify' button.
3. Open the record player by clicking the opaque box. 
4. Move needle into place by clicking needle head. Needle will lower until it detects contact with the vinyl. <br>
5. If connected with Spotify, search for and select a song. <b> The search functionality only works when the application is connected to Spotify </b>
6. If using without Spotify, the record player will automatically play a song.
7. Control song with keys indicated in control panel.

## Dev Environment
`open host.command`

### Summary:
A record player that allows you to search for songs and play them through the Spotify API. Background elements react dynamically to song attributes and controls (tempo, play/pause).

### Advanced Topics:
● Clouds and shadows of clouds <br>
● Collision of the record needle with the record at the beginning of the song <br>
● Use morph targets to animate objects in the background <br>
● Picking the clear box to open the record player and the needle to allow user to choose a song <br>

### Contributions:
Bryan: Morph targets, Spotify API integration <br>
Michael: Clouds and cloud shadows <br>
Baolinh: Color picking, finalize flow <br>
Katie: Collision detection, finalize flow <br>
Karen: Created record player, integrate movements with song
