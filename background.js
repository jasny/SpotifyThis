var spotifyResults = {};

function getWikipediaInfo(url, request, callback) {
  var match = /^(https?:\/\/.*?)\/wiki\/(.*)$/.exec(url);
  if (!match) return;

  var host = match[1]
    , query = request.title.replace(/\s*\(.+\)$/, '');
  
  var xhr = new XMLHttpRequest();
  xhr.open("GET", host + "/w/api.php?format=json&action=query&titles=" + encodeURIComponent(request.title) + "&prop=revisions&rvprop=content", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;

    if (xhr.responseText.match(/Infobox musical artist/i)) {
      callback('artist', query);
    } else if (xhr.responseText.match(/Infobox album/i)) {
      var ma = /Artist\s*=\s*\[\[(.+?)\]\]/.exec(xhr.responseText);
      callback('album', query + (ma ? ' ' + ma[1] : ''));
    } else if (xhr.responseText.match(/Infobox single/i)) {
      var mt = /Artist\s*=\s*\[\[(.+?)\]\]/.exec(xhr.responseText);
      callback('track', query + (mt ? ' ' + mt[1] : ''));
    }
  }
  xhr.send();
}

function spotifyFind(type, query, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "http://ws.spotify.com/search/1/" + type + ".json?q=" + encodeURIComponent(query), true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;
    
    var resp;
    if (xhr.status == 200) resp = JSON.parse(xhr.responseText);
    callback(resp);
  }
  xhr.send();
}

function spotifyLookup(uri, extras, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "http://ws.spotify.com/lookup/1/.json?uri=" + uri + (extras ? '&extras=' + extras : ''), true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;
    
    var resp;
    if (xhr.status == 200) resp = JSON.parse(xhr.responseText);
    callback(resp);
  }
  xhr.send();
}

function apply(type, query, callback) {
  if (type) type = type.replace(/^music\./, '');
  
  if (type == 'artist' || type == 'band') applyArtist(query, callback);
    else if (type == 'album') applyAlbum(query, callback);
    else if (type == 'track' || type == 'song') applyTrack(query, callback);
    else callback({});
}

function applyArtist(query, callback) {
  spotifyFind('artist', query, function(resp) {
    var result = resp.artists[0];
    
    spotifyFind('track', result.name, function(resp) {
      if (resp) {
        for (var i=0; i < resp.tracks.length; i++) {
          if (resp.tracks[i].artists[0].href == result.href) {
            result.uri = resp.tracks[i].href;
            break;
          };
        }
      }
      
      callback(result);
    });
  });
}

function applyAlbum(query, callback) {
  spotifyFind('album', query, function(resp) {
    var result = {};
    
    if (resp && resp.albums[0]) {
      result = resp.albums[0];
      result.uri = resp.albums[0].href;
    }
    
    callback(result);
  });
}

function applyTrack(query, callback) {
  spotifyFind('track', query, function(resp) {
    var result = {};
    
    if (resp && resp.tracks[0]) {
      result = resp.tracks[0];
      result.uri = resp.tracks[0].href;
    }
    
    callback(result);
  });
}

function setPageAction(tabId, result) {
    spotifyResults[tabId] = result;
    
    if (result.uri) {
      chrome.pageAction.setTitle({ 'tabId': tabId, 'title': 'Listen to ' + result.name + ' on spotify'});
      chrome.pageAction.show(tabId);
    }
}

/*chrome.pageAction.onClicked.addListener(function(tab) {
  if (spotifyResults[tab.id]) {
    var w = window.open(spotifyResults[tab.id], 'width=100,height=100', '_blank');
    setInterval(function() { w.close(); }, 200);
  }
});*/

function onRequest(request, sender, sendResponse) {
  if (request.site == 'wikipedia') {
    getWikipediaInfo(sender.tab.url, request, function(type, name) {
      apply(type, name, function(result) {
        chrome.tabs.sendMessage(sender.tab.id, result);
      });
    });
  } else if (request.site == 'lastfm') {
    apply(request.type, request.title, function(result) {
      chrome.tabs.sendMessage(sender.tab.id, result);
    });
  } else if (request.site == '*') {
    apply(request.type, request.title, function(result) {
      setPageAction(sender.tab.id, result);
    });
  }
  
  sendResponse({});
};

// Listen for the content script to send a message to the background page.
chrome.extension.onMessage.addListener(onRequest);
