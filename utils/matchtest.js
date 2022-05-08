var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream("./match.rofl"),
});
var lineCounter = 0; var match = [];
lineReader.on('line', function (line) {
    //lineCounter++;
    if (line.includes('{')) 
    {
        match.push(line);
        lineReader.close();
    }
});
lineReader.on('close', function () {
    match = match.toString();
    match = match.substring(match.indexOf('{'), match.indexOf('}]"}')) + '}]"}'
    //console.log(match);
    var json = JSON.parse(match);
    console.log(json);
    process.exit(0);
});