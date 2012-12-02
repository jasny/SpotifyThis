function spotifyWikipedia() {
  var name = document.getElementById("firstHeading").firstChild.innerText;
  
  chrome.extension.onMessage.addListener(function(response, sender) {
    var infobox = document.getElementsByClassName('infobox')[0];
    infobox.innerHTML = '<tr><td colspan="2"><iframe src="https://embed.spotify.com/?uri=' + encodeURIComponent(response.uri) + '" width="250" ' + (response.uri.match(/^spotify:album/) ? 'height="330"' : 'height="80"') + ' frameborder="0" allowtransparency="true"></iframe></td></tr>' + infobox.innerHTML;
  });

  chrome.extension.sendMessage({ 'type': 'wikipedia', 'title': name });
}

if (window.location.href.match(/^https?:\/\/\w+.wikipedia.org/)) {
  spotifyWikipedia();
}
