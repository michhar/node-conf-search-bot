module.exports = function() {    

    global.performSearch = function(name, callback) {
        searchClient.search('mladsidxer1', {search: name, $top: 5}, function(err, results) {
            if (err) {
                callback(err);
            } else if (results && results.length > 0) {                
                callback(null, results);
            } else {
                callback();
            }
        });
    }

    global.getEventsByTrack = function(track, day, callback) {
        searchClient.search('mladsidxer1' , {$filter: "track eq '" + track + "' and day eq '" + day +"'", $orderby: "id" }, function(err, results) {
            if (err) {
                callback(err, null);
            } else if (results && results.length > 0) {                
                callback(null, results);
            } else {
                callback();
            }
        });
    }

    global.getTrackFacets = function(day, callback) {
        var request = require('request');
        var apiKey = process.env.SEARCH_KEY_DEV ? process.env.SEARCH_KEY_DEV : "";

        var options = {  
            method: 'GET',
            uri: 'https://mlads-search-dev.search.windows.net/indexes/mladsidxer1/docs?api-version=2016-09-01&search=*&$filter=day eq \'' + day + '\'&facet=track',
            headers: {'Content-type': 'application/json', 'api-key': apiKey}
        }

        request(options,  function (error, response, body) {
            if (!error) {
                var result = JSON.parse(body);
                // callback(null, result);
                if(result && result['@search.facets'] && result['@search.facets'].track){
                    callback(null, result['@search.facets'].track);
                }
            } else {
                callback(error, null);
            }
        })
    }
}