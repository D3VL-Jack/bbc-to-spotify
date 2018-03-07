
# BBC 2 Spotify
Live Spotify Playlists

BBC Radio 1 - https://open.spotify.com/user/21lvb7uflc7e6d3emm5ax4xra/playlist/4yxWI341vNLgg7yPOdTXUJ

BBC Radio 2 - https://open.spotify.com/user/21lvb7uflc7e6d3emm5ax4xra/playlist/2DkBpp9Un3bUd7aXr3PtYF

BBC Radio 3 - https://open.spotify.com/user/21lvb7uflc7e6d3emm5ax4xra/playlist/5R8xNup4Tv68Wl7DFzPoyE

BBC Radio 4 - https://open.spotify.com/user/21lvb7uflc7e6d3emm5ax4xra/playlist/5051zG2jH6tn5fjysAnE8y

BBC Radio 6 - https://open.spotify.com/user/21lvb7uflc7e6d3emm5ax4xra/playlist/3wX697KEo5NauXCg5w3fZo

# Installation 
1) Goto https://beta.developer.spotify.com/dashboard/applications and make an app.
2) Set the callback URL to http://localhost/callback
3) Enter the Spotify App details into `config.example.json` and rename it to `config.json`
4) in your terminal run `npm install` to install the dependencies 
5) Run the Setup Script
	1) Run `node setup.js -get url` to get your OAuth URL, Copy it into your browser and allow the app access.
	2) After allowing access, Your URL will redirect to something similar to `http://localhost/callback?code=AQBhTMafcqLlAO4MgHsC...nSBIXgjmdWA&state=state` Copy the `code` parameter
	3) Run `node setup.js -code XXX` paste your code in place of the `XXX`
	4) Rename or Delete setup.js and do not run it again without restarting the main script

6) Make your Spotify Playlists and enter the ID's into your config.json file
7) Run `node index.js` to execute the program
