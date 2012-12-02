var title = document.getElementById("firstHeading").firstChild.innerText;

chrome.extension.onMessage.addListener(function(response, sender) {
  if (!response.uri) return;

  var box = document.getElementsByClassName('infobox')[0];
  box.innerHTML = '<tr><td colspan="2"><iframe src="https://embed.spotify.com/?uri=' + encodeURIComponent(response.uri) + '" width="250" ' + (response.uri.match(/^spotify:album/) ? 'height="330"' : 'height="80"') + ' frameborder="0" allowtransparency="true"></iframe></td></tr>' + box.innerHTML;
});

chrome.extension.sendMessage({ 'site': 'wikipedia', 'title': title });