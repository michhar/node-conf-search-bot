module.exports = function() {
    
    var AzureSearch = require('azure-search');
    global.searchClient = AzureSearch({
        url: process.env.SEARCH_URL_DEV,
        key: process.env.SEARCH_KEY_DEV
    });
    global.month = 'June';

}



