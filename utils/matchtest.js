var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream("./utils/r.rofl"),
});
var lineCounter = 0; var match = [];
lineReader.on('line', function (line) {
    lineCounter++;
    if (lineCounter === 2) match.push(line);
    if (lineCounter === 2) { lineReader.close(); }
});
lineReader.on('close', function () {
    match = match.toString();
    match = match.substring(match.indexOf('{'), match.indexOf('}]"}')) + '}]"}'
    //console.log(match);
    var json = JSON.parse(match);
    console.log(json);
    process.exit(0);
});