
const http = require('http');
const fs = require('fs');
const PORT = 3000;

let mainPage = fs.readFileSync("./list.html", 'utf-8')
const addEdit = fs.readFileSync('./add-edit.html', 'utf-8');
const usersDataFile = './users.json';
let datas = JSON.parse(fs.readFileSync('./users.json', 'utf-8'))



// to update the list
function listUpdate(datas){
    
    let tableRow = '';  

    datas.forEach((user, index)=>{
        tableRow = tableRow + `
        <tr>
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.age}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>

            <td>
                <form action="/edit" method="get">
                    <input type="hidden" name="rowindex" value="${index}">
                    <button type="submit">Edit</button>
                </form>
            </td>

            <td>
                <form action="/delete" method="post">
                    <input type="hidden" name="rowindex" value="${index }">
                    <button type="submit">Delete</button>
                </form>
            </td>   
        </tr>
        `
    })

    mainPage = fs.readFileSync('./list.html', 'utf-8').replace('<tbody></tbody>', `<tbody>${tableRow}</tbody>`);
    return mainPage;
    
}



const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/delete') {
                let body = '';
        
                req.on('data', (chunk) => {
                    body += chunk;
                });
        
                req.on('end', () => {
                    try {
                        const formData = new URLSearchParams(body);
                        const rowToDelete = parseInt(formData.get('rowindex'));
        
                        if (!isNaN(rowToDelete) && rowToDelete >= 0 && rowToDelete < datas.length) {
                            datas.splice(rowToDelete, 1);
        
                            fs.writeFile(usersDataFile, JSON.stringify(datas, null, 2), (err) => {
                                if (err) {
                                    console.error(err);
                                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                                    res.end('Error deleting data');
                                } else {
                                    res.writeHead(302, { 'Location': '/' });
                                    res.end();
                                }
                            });
                        } else {
                            res.writeHead(400, { 'Content-Type': 'text/plain' });
                            res.end('Invalid row index');
                        }
                    } catch (error) {
                        console.error('Error deleting row:', error);
                        res.writeHead(400, { 'Content-Type': 'text/plain' });
                        res.end('Error deleting row');
                    }
                });
            }
    
    else if (req.method === 'GET' && (req.url === '/' || req.url === '/list')) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(listUpdate(datas));
        res.end();
    } 
    
    else if (req.method === 'GET' && req.url === '/add-edit') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(addEdit);
        res.end();
    } 
    
    else if (req.method === 'POST' && req.url === '/submit') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            try{
                
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
                fs.writeFile(usersDataFile, JSON.stringify(users,null,2), (err) => {
                    if (err) {
                        console.error(err);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error writing to file');
                    } else {
                        console.log('Data written to file');

                        datas = users;

                        res.writeHead(302, { 'Location': '/' }); // Redirect to list.html after successful submission
                        res.end();
                    }
                });
            }

            catch (error) {
                console.error('Error parsing JSON:', error);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Error deleting row');
            }
        });
    } 

    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Not Found');
    }

});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
