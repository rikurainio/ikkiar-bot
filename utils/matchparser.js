const fs = require('fs')

const matchParser = (file) => {
    let json;

    fs.writeFile('match.rofl', file, function(err){
        if(err) return console.log(err);
    })
    console.log((fs.existsSync('match.rofl') ? 'exists' : 'does not'));
    var lineReader = require('readline').createInterface({
        input: fs.createReadStream('./match.rofl'),
    });
    var linecounter = 0;
    var match = [];
    lineReader.on('line', function (line) {
        console.log(linecounter);
        linecounter++
        if (line.includes('{'))  {
            match.push(line);
            lineReader.close();
    }
    });
    lineReader.on('close', function () {
        match = match.toString();
        match = match.substring(match.indexOf('{gameLength'), match.indexOf('}]"}')) + '}]"}'
        json = JSON.parse(match);
       // console.log(json);
        process.exit(0);
    });
    return json
}

const matchParserKEKW = (file) => {
    console.log(file.length)
    var match = file.toString()
    match = match.substring(match.indexOf("{\"gameLength"), match.indexOf('}]"}')) + '}]"}'
    return JSON.parse(match);
}

module.exports = { matchParser, matchParserKEKW }