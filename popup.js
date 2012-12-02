function show() {
  var bg = chrome.extension.getBackgroundPage();

  chrome.tabs.getSelected(null,function(tab){
    var result = bg.spotifyResults[tab.id];
    var box = document.getElementById('spotifyBox');
    box.innerHTML = result && result.uri ? '<iframe src="https://embed.spotify.com/?uri=' + encodeURIComponent(result.uri) + '" width="300" ' + (result.uri.match(/^spotify:album/) ? 'height="380"' : 'height="80"') + ' frameborder="0" allowtransparency="true">' : '';
  });
}

window.onload = show;