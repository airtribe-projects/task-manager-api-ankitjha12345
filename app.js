const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

let taskData = JSON.parse(fs.readFileSync('task.json'));
let tasks = taskData.tasks;

const { body, validationResult } = require('express-validator');


//get all task here
app.get('/tasks', (req, res) => {
    res.json(tasks);
})

//get trask by id
app.get('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if(!task) return res.status(400).json({'Message': 'Task Not Found'});
    res.json(task);
});

//create new task

app.post('tasks',[
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  ], (req, res)=> {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newTask = {
        id : tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        title:  req.body.title,
        description : req.body.description,
        completed : req.body.completed || false
    }
    tasks.push(newTask);
    res.status(201).json({newTask});
});

// Delete task 

app.delete('/tasks/:id', (req, res) => {
    const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
    if(index === -1) return res.status(404).json({message: 'Task not found'});

    const deleted = tasks.splice(index, 1)
    res.json(deleted[0]);
});


//updat the task

app.put('tasks/:id',[
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  ], (req, res) => {

    const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
    if(index === -1) return res.status(404).json({message: 'Task not found'});

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    
    const updateTask = {...tasks[index], ...req.body };
    tasks[index] = updateTask;
    res.json(updateTask);
}); 


app.get('/', (req, res) => {
    console.log(taskData);
    res.send("Check the console for task data");
});

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});



module.exports = app;