const SpotifyWebApi = require('spotify-web-api-node'),
    config = require('./config.json'),
    fs = require('fs'),
    args = process.argv;

const spotifyApi = new SpotifyWebApi({
  clientId : config.spotify.clientID,
  clientSecret : config.spotify.clientSecret,
  redirectUri : config.spotify.callbackUrl,  
});

if(args[2] == "-geturl"){
  var authorizeURL = spotifyApi.createAuthorizeURL(config.spotify.scopes, "state");
  console.log("Please enter this URL into your browser and copy the callback code,\n Once done use '-code XXX' where XXX is your callback code to authenticate\n");
  console.log(authorizeURL);
}else if(args[2] == "-code" && args[3]){
  let code = args[3];
  spotifyApi.authorizationCodeGrant(code)
    .then(function(data) {

      fs.writeFile("accessTokens.json", JSON.stringify(data.body), function(err) {
          if(err) {
              return console.log(err);
          }
      }); 
      console.log('Retrieved token. It expires in ' + Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) + ' seconds!');
      console.log("Please Delete this script or rename it and don't run it again!")
  }, function(err) {
      console.log('Something went wrong when retrieving the access token!', err.message);
  });
}else{
  console.log("No Arguments passed\n Please use '-geturl' to get an authorisation URL\n once you have the callback code please use '-code XXX' where XXX is your callback code to authenticate");
}
