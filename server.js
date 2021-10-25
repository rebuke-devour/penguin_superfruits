//////////////////////////
// Import Dependencies //
////////////////////////

require('dotenv').config() //
const express = require('express')
const morgan = require('morgan')
const methodOverride = require('method-override')
const path = require('path')
const mongoose  = require('mongoose')


////////////////////////////
// Establish DB Connection//
//////////////////////////

const DATABASE_URL = process.env.DATABASE_URL
const CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

// ======= Connect to Mongo ==//
mongoose.connect(DATABASE_URL, CONFIG)

mongoose.connection
.on('open', ()=> console.log('Connected to Mongo'))
.on('close', ()=> console.log('Disconected from Mongo'))
.on('error', (error)=> console.log(error))

///////////////////////////////////////////
// Create our Fruits Model
///////////////////////////////////////////
// destructuring Schema and model from mongoose
const {Schema, model} = mongoose 

// make a fruits schema
const fruitSchema = new Schema({
    name: String,
    color: String,
    readyToEat: Boolean
})

// Make the Fruit Model
const Fruit = model("Fruit", fruitSchema)

// log the model to make sure it exists
// console.log(Fruit)

/////////////////////////////////
// Create our app with object, configure liquid
/////////////////////////////////
// import liquid
const app = require("liquid-express-views")(express(), {root: [path.resolve(__dirname, 'views/')]})

// construct an absolute path to our views folder
const viewsFolder = path.resolve(__dirname, "views/")
console.log(viewsFolder)

////////////////////////////
//  M I D D L E W A R E  //
//////////////////////////

// logging
app.use(morgan("tiny"))
// ability to override request methods
app.use(methodOverride("_method"))
// ability to parse urlencoded from for submission
app.use(express.urlencoded({extended: true}))
// setup our public folder to serve files statically
app.use(express.static("public"))


/////////////////////////
// R O U T I N G   //
///////////////////////
app.get('/',(req,res)=>{
    res.send('Server is running...')
})

/////////////////
// Fruits Route //
/////////////////

app.get("/fruits/seed", (req, res) => {
    // array of starter fruits
    const startFruits = [
      { name: "Orange", color: "orange", readyToEat: false },
      { name: "Grape", color: "purple", readyToEat: false },
      { name: "Banana", color: "orange", readyToEat: false },
      { name: "Strawberry", color: "red", readyToEat: false },
      { name: "Coconut", color: "brown", readyToEat: false },
    ];
  
    // Delete all fruits
    Fruit.deleteMany({}).then((data) => {
      // Seed Starter Fruits
      Fruit.create(startFruits).then((data) => {
        // send created fruits as response to confirm creation
        res.json(data);
      });
    });
  });
// ============== Index Route 

app.get('/fruits', (req,res)=>{
    Fruit.find({})
    // Render Template
    .then((fruits) => {
        res.render('fruits/index.liquid', {fruits})
    })
    .catch((error)=> {
        res.json({ error });
    })
})

// ===================New Route
app.get("/fruits/new", (req, res) => {
    res.render("fruits/new.liquid");
  });


// ==================Create Route
// create route
app.post("/fruits", (req, res) => {
    // check if the readyToEat property should be true or false
    req.body.readyToEat = req.body.readyToEat === "on" ? true : false;
    // create the new fruit
    Fruit.create(req.body)
      .then((fruits) => {
        // redirect user to index page if successfully created item
        res.redirect("/fruits");
      })
      // send error as json
      .catch((error) => {
        console.log(error);
        res.json({ error });
      });
  });

// ================ Edit Route
app.get('/fruits/:id/edit', (req,res)=>{
    const id = req.params.id;
    Fruit.findById(id)
    .then((fruit)=>{
        res.render('fruits/edit.liquid', { fruit });
    })
    .catch((error)=>{
        console.log(error);
        res.json({error})
    })
})
// ================ Update Route
app.put("/fruits/:id", (req, res) => {
    // get the id from params
    const id = req.params.id;
    // check if the readyToEat property should be true or false
    req.body.readyToEat = req.body.readyToEat === "on" ? true : false;
    // update the fruit
    Fruit.findByIdAndUpdate(id, req.body, { new: true })
      .then((fruit) => {
        // redirect to main page after updating
        res.redirect("/fruits");
      })
      // send error as json
      .catch((error) => {
        console.log(error);
        res.json({ error });
      });
  });

// ================== D E S T R O Y

app.delete("/fruits/:id", (req, res) => {
    // get the id from params
    const id = req.params.id;
    // delete the fruit
    Fruit.findByIdAndRemove(id)
      .then((fruit) => {
        // redirect to main page after deleting
        res.redirect("/fruits");
      })
      // send error as json
      .catch((error) => {
        console.log(error);
        res.json({ error });
      });
  });




// ================ Show Route
app.get('/fruits/:id', (req,res)=>{
    const id = req.params.id;
    Fruit.findById(id)
    .then((fruit)=> {
        res.render('fruits/show.liquid', {fruit})
    })
    .catch((error)=> {
        console.log(error);
        res.json({ error});
    })
})

// ====================




// Listeners //
const PORT = process.env.PORT // grabbing the port number from env
app.listen(PORT, () =>  console.log(`Listening on port ${PORT}`))