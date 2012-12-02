// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var spotifyLinks = {};

function getWikipediaInfo(request, tab, callback) {
  var match = /^(https?:\/\/.*?)\/wiki\/(.*)$/.exec(tab.url);
  if (!match) return;

  var host = match[1]
    , query = request.title.replace(/\s*\(.+\)$/, '');
  
  var xhr = new XMLHttpRequest();
  xhr.open("GET", host + "/w/api.php?format=json&action=query&titles=" + encodeURIComponent(request.title) + "&prop=revisions&rvprop=content", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;

    if (xhr.responseText.match(/Infobox musical artist/)) {
      callback(tab, 'artist', query);
    } else if (xhr.responseText.match(/Infobox album/)) {
      var ma = /Artist\s*=\s*\[\[(.+?)\]\]/.exec(xhr.responseText);
      callback(tab, 'album', query + (ma ? ' ' + ma[1] : ''));
    } else if (xhr.responseText.match(/Infobox single/)) {
      var mt = /Artist\s*=\s*\[\[(.+?)\]\]/.exec(xhr.responseText);
      callback(tab, 'track', query + (mt ? ' ' + mt[1] : ''));
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

function apply(tab, type, query) {
  if (type == 'artist' || type == 'band') applyArtist(tab, query);
    else if (type == 'album') applyAlbum(tab, query);
    else if (type == 'track' || type == 'song') applyTrack(tab, query);
}

function applyArtist(tab, query) {
  spotifyFind('artist', query, function(resp) {
    var artist = resp.artists[0];
    
    setPageAction(tab, artist.href, artist.name);
    
    spotifyFind('track', artist.name, function(resp) {
      var track
        , result = {};
      
      if (resp) {
        for (var i=0; i<resp.tracks.length; i++) {
          if (resp.tracks[i].artists[0].href == artist.href) {
            track = resp.tracks[i];
            break;
          };
        }

        result = { 'uri': track.href };
      }
      
      chrome.tabs.sendMessage(tab.id, result);
    });
  });
}

function applyAlbum(tab, query) {
  spotifyFind('album', query, function(resp) {
    var result = {};
    
    if (resp && resp.albums[0]) {
      var album = resp.albums[0];
    
      setPageAction(tab, album.href, album.name);
      result = { 'uri': album.href };
    }
    
    chrome.tabs.sendMessage(tab.id, result);
  });
}

function applyTrack(tab, query) {
  spotifyFind('track', query, function(resp) {
    var result = {};
    
    if (resp && resp.tracks[0]) {
      var track = resp.tracks[0];
    
      setPageAction(tab, track.href, track.name);
      result = { 'uri': track.href };
    }
    
    chrome.tabs.sendMessage(tab.id, result);
  });
}

function setPageAction(tab, href, title) {
    spotifyLinks[tab.id] = href;
    chrome.pageAction.setTitle({ 'tabId': tab.id, 'title': 'Listen to ' + title + ' on spotify'});
    chrome.pageAction.show(tab.id);  
}

chrome.pageAction.onClicked.addListener(function(tab) {
  if (spotifyLinks[tab.id]) {
    var w = window.open(spotifyLinks[tab.id], 'width=100,height=100', '_blank');
    setInterval(function() { w.close(); }, 200);
  }
});

// Called when a message is passed.  We assume that the content script
// wants to show the page action.
function onRequest(request, sender) {
  if (request.site == 'wikipedia') getWikipediaInfo(request, sender.tab, apply);
    else if (request.site == 'lastfm') apply(sender.tab, request.type, request.title);
};

// Listen for the content script to send a message to the background page.
chrome.extension.onMessage.addListener(onRequest);
