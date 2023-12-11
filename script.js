
const http = require('http');
const fs = require('fs');
const PORT = 3000;

const addEdit = fs.readFileSync('./add-edit.html', 'utf-8');
const list = fs.readFileSync('./list.html', 'utf-8');
const usersDataFile = './users.json';

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/list')) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(list);
        res.end();
    } else if (req.method === 'GET' && req.url === '/add-edit') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(addEdit);
        res.end();
    } else if (req.method === 'POST' && req.url === '/submit') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            const formData = JSON.parse(body);

            // Read existing user data
            let users = [];
            if (fs.existsSync(usersDataFile)) {
                const data = fs.readFileSync(usersDataFile, 'utf-8');
                users = JSON.parse(data);
            }

            // Add new form data to users
            users.push(formData);

            // Write updated user data back to the file
            fs.writeFile(usersDataFile, JSON.stringify(users), (err) => {
                if (err) {
                    console.error(err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error writing to file');
                } else {
                    console.log('Data written to file');
                    res.writeHead(302, { 'Location': '/list' }); // Redirect to list.html after successful submission
                    res.end();
                }
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


