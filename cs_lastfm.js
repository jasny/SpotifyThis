var type, title;
var meta = document.getElementsByTagName('meta');

var preview = document.getElementsByClassName('track-preview')[0];
if (preview) preview.style.display = 'none';

for (var i=0; i < meta.length; i++) {
  if (meta[i].getAttribute('property') == 'og:type') type = meta[i].getAttribute('content');
    else if (meta[i].getAttribute('property') == 'og:title') title = meta[i].getAttribute('content')
}

chrome.extension.onMessage.addListener(function(response, sender) {
  if (!response.uri) {
    // If not found try again without 'Featuring' or '(special info)'
    if (title.match(/\(.+\)$|\sfeaturing\s/i)) chrome.extension.sendMessage({ 'site': 'lastfm', 'type': type, 'title': title.replace(/(\s*\(.+\)$|\s+featuring\s.+?(–|$))/i, '') });
      else if (preview) preview.style.display = 'block';
    return;
  }

  var place = document.getElementsByClassName('user-actions')[0];
  var box = place.parentNode.insertBefore(document.createElement('div'), place);
  box.innerHTML = '<iframe src="https://embed.spotify.com/?uri=' + encodeURIComponent(response.uri) + '" width="300" ' + (response.uri.match(/^spotify:album/) ? 'height="380"' : 'height="80"') + ' frameborder="0" allowtransparency="true">';
});

chrome.extension.sendMessage({ 'site': 'lastfm', 'type': type, 'title': title });