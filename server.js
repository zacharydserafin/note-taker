const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;
const uuid = require('./helpers/uuid');
const fs = require('fs');

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, '/public/notes.html')));

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
        } else {
            res.status(200).json(data);
            return;
        }
    });  
});

app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                const parsedNotes = JSON.parse(data);
                parsedNotes.push(newNote);
                const newJSON = JSON.stringify(parsedNotes, null, 4);

                fs.writeFile('./db/db.json', newJSON, 
                    (writeErr) =>
                        writeErr
                            ? console.error(writeErr)
                            : console.info('Successfully wrote to db.json')
                );
            }
        });
        const response = {
            status: 'success',
            body: newNote,
        };
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting note');
    }
});

app.delete('/api/notes/:id', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
            return;
        } else {
            const notes = JSON.parse(data);
            const newNotes = JSON.stringify(notes.filter(note => note.id !== req.params.id), null, 4);
            
            fs.writeFile('./db/db.json', newNotes, 
                    (writeErr) =>
                        writeErr
                            ? console.error(writeErr)
                            : console.info('Successfully rewrote db.json')
            );
            res.status(200).send();
        }
    });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.listen(PORT, () => 
    console.log(`Listening at http://localhost:${PORT}!`)
);