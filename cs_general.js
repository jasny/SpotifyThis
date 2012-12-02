var type, title;
var meta = document.getElementsByTagName('meta');

var preview = document.getElementsByClassName('track-preview')[0];
if (preview) preview.style.display = 'none';

for (var i=0; i < meta.length; i++) {
  if (meta[i].getAttribute('property') == 'og:type') type = meta[i].getAttribute('content');
    else if (meta[i].getAttribute('property') == 'og:title') title = meta[i].getAttribute('content')
}

chrome.extension.sendMessage({ 'site' : '*', 'type': type, 'title': title });