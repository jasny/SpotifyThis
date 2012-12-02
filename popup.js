function show() {
  var bg = chrome.extension.getBackgroundPage();

  chrome.tabs.getSelected(null,function(tab){
    var result = bg.spotifyResults[tab.id];
    var box = document.getElementById('spotifyBox');
    
    var content;    
    if (result && result.uri) {
      content = '<iframe src="https://embed.spotify.com/?uri=' + encodeURIComponent(result.uri) + '" width="300" ' + (result.uri.match(/^spotify:album/) ? 'height="380"' : 'height="80"') + ' frameborder="0" allowtransparency="true">';
      if (result.href.match(/^spotify:artist/)) content = content + '<div><a href="' + result.href + '"><b>Show ' + result.name + ' in Spotify</b></a></div>';      
    }
    box.innerHTML = content;
  });
}

window.onload = show;