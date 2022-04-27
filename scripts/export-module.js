const fs = require('fs');

fs.readFile('src/index.d.ts', 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }

    fs.appendFile("lib/typings.d.ts", data, (err) => {
        if (err) {
            console.log(err);
            return
        }
    })
})
