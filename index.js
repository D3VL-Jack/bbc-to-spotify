/*
*	BBC Radio players to Spotify playlists
*   V1.0 - 06/03/2018
*   Developed By Jack Rogers
*	https://voidtyphoon.co.uk/
*/

// Constants
const SpotifyWebApi = require('spotify-web-api-node'),
	  config = require('./config.json'),
	  https = require('https'),
	  fs = require('fs');

// Globals
let tokenExpirationEpoch,
	accessToken,
	refreshToken,
	debug = config.debug,
	lastTrackName= {};
	
// Get Formatted Date Now 
function formattedDate() {
let	epoch = Date.now(),
	date = new Date(epoch),
	year = date.getFullYear(),
	month = date.getMonth() + 1,
	day = date.getDate(),
 	hours = date.getHours(),
 	minutes = date.getMinutes(),
 	seconds = date.getSeconds();

	return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
}

// Start Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId : config.spotify.clientID,
  clientSecret : config.spotify.clientSecret,
  redirectUri : config.spotify.callbackUrl,  
});

// Get stored AccessTokens from file
fs.readFile("accessTokens.json", 'utf8', function(err, contents) {
	let json = JSON.parse(contents);
    spotifyApi.setAccessToken(json['access_token']);
    spotifyApi.setRefreshToken(json['refresh_token']);
    refreshToken = json['refresh_token'];
    tokenExpirationEpoch = 32;
});

// Update SPotify OAuth token
function updateToken(){
	spotifyApi.refreshAccessToken().then(function(data) {
		
		console.log('The access token has been refreshed');
	   	
	   	spotifyApi.setAccessToken(data.body['access_token']);
	   	spotifyApi.setRefreshToken(data.body['refresh_token']);

	   	if(data.body.refresh_token === undefined){
	   		data.body.refresh_token = refreshToken;
	   	}

	   	tokenExpirationEpoch = (new Date().getTime() / 1000) + data.body['expires_in'];

		fs.writeFile("accessTokens.json", JSON.stringify(data.body), function(err) {
		    if(err) {
		        return console.log(err);
		    }
		}); 
	 	
	}, function(err) {
		if(debug)console.log('Could not refresh access token', err);
	});
	
}


// Check Token Time Left
setInterval(function() {
  if (Math.floor((tokenExpirationEpoch - new Date().getTime() / 1000)) < 30) {
    updateToken();
  }
}, 1000);

// Add track to spotify Playlist
function addTrack(trackName, radioCode){

	let playlistID;
	console.log("[" + radioCode + " | " + formattedDate() + "] " + "searching for " + trackName);
  	spotifyApi.searchTracks(trackName).then(function(data) {
	    let spotifyURI = data.body.tracks.items[0].uri;
	    
		spotifyApi.removeTracksFromPlaylist(config.spotify.ownerID, config.bbc[radioCode], [{uri:spotifyURI}], {}).then(function(data) {
		    
		    spotifyApi.addTracksToPlaylist(config.spotify.ownerID, config.bbc[radioCode], [spotifyURI]).then(function(data) {
			    console.log("[" + radioCode + " | " + formattedDate() + "] " + 'Added track ' + trackName + ' To Playlist ' + config.bbc[radioCode]);
			}, function(err) {
			    if(debug)console.log('Something went wrong!', err);
			});

		}, function(err) {
			if(debug)console.log('Something went wrong!', err);
		});

	}, function(err) {
	    if(debug)console.log('Something went wrong!', err);
	    updateToken();
	});
}

function goCheck(radioCode){
	console.log("[" + radioCode + " | " + formattedDate() + "] " + "Checked for song.");

	https.get('https://polling.bbc.co.uk/radio/nhppolling/' + radioCode, (res) => {

		let responseString = "";
		res.on("data", function(chunk) {
		    responseString += chunk;
		});
		res.on("end", function () {
			responseString = responseString.substr(1);
			responseString = responseString.substr(0, responseString.length-1);
			responseJson = JSON.parse(responseString);

			let artist = responseJson.packages.richtracks[0].artist,
				title = responseJson.packages.richtracks[0].title,
				now_playing = responseJson.packages.richtracks[0].is_now_playing,
				clean_artist = artist.replace(/ *\([^)]*\) */g, " ").trim(),
				clean_title = title.replace(/ *\([^)]*\) */g, " ").trim(),
				search_query = clean_artist + " " + clean_title;


			if(now_playing == true){					
				// playing now
				if(lastTrackName[radioCode] !== search_query){
					lastTrackName[radioCode] = search_query;
					addTrack(search_query, radioCode);
				}else{
					console.log("[" + radioCode + " | " + formattedDate() + "] " + "Track Exists");
				}
			}else if(now_playing == false){
				// recently played
				console.log("[" + radioCode + " | " + formattedDate() + "] " + "Song not new");
			}else{
				console.log("[" + radioCode + " | " + formattedDate() + "] " + "Song error");
			}
		});

	}).on('error', (e) => {
	  console.error(e);
	});
}

setTimeout(function(){setInterval(function(){goCheck("bbc_radio_one")}, 25000)},0);
setTimeout(function(){setInterval(function(){goCheck("bbc_radio_two")}, 25000)},5000);
setTimeout(function(){setInterval(function(){goCheck("bbc_radio_three")}, 25000)},10000);
setTimeout(function(){setInterval(function(){goCheck("bbc_radio_four")}, 25000)},15000);
setTimeout(function(){setInterval(function(){goCheck("bbc_6music")}, 25000)},20000);

// DO NOT DO THIS BUT I DID HAHAHA
process.on('uncaughtException', function(err) {
  console.log(formattedDate() + ' Caught exception: ' + err);
});