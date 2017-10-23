let Statuses = {
  NONE:0,
  NCO: 1,
  RNT: 2,
  REP: 3,
  AVA: 4,
}
let Types = {
  empty: 0,
  staffWagon: 1,
  toilet: 2,
  container: 3,
  shed: 4,
  Flexi: 5,
  other: 6
}
const lots = [
  
]
for(let i=1; i<7; i++) {
  lots.push({
    id: i+'f',
    col: i,
    row: 'f',
    floors: [{
      floor: 0,
      individual: 'A1B2C3',
      type: Types.Flexi,
      status: Statuses.AVA
    },
    {
      
    },
    {
      
    },]
  })
}
for(let i=1; i<5; i++) {
  lots.push(
    {
      id:i+'d',
      col: i,
      row: 'd',
      floors: [{
        floor: 0,
        individual: 'F3C2E1',
        type: Types.toilet,
        status: Statuses.AVA
      },{},{}]
    }
  )
}
const getLots = () => {
  return {
    lots
  }
}
const updateLot = ({lot}) => {
  for(let i = 0; i < lots.length; i++) {
    if(lots[i].id == lot.id) {
      lots[i] = lot
    }
  }
  return {
    lots
  }
}
const removeLot = ({id, floor}) => {
  for (let lot of lots) {
    if(lot.id == id) {
      for(let i = 0; i < lot.floors.length; i++) {
        if(lot.floors[i].floor == floor) {
          lots.splice(i, 1)
        }
      }
    }
  }
}

// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var http = require('http').Server(app);
var db = require('./models/index.js')
db.sequelize.sync().then(()=>{
  
})

var bodyParser = require('body-parser');
var cors = require('cors')
var io = require('socket.io')(http)
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

var port = process.env.PORT || 8081;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});
router.get('/lots', function(req, res) {
  db.Lot.findAll({include: [{model: db.Floor, as: 'floors'}]}).then(Lots => {
    res.json(Lots);   
  })
  
});
router.post('/lots', function(req, res) {
  res.json({success: true})
  let promises = []
  console.log(req.body.lot)
  for(let i = 0; i < req.body.lot.floors.length; i++) {
    let f = req.body.lot.floors[i]
    let empty = (f.individual === null || typeof f.individual === 'undefined')
    && (f.type === null || typeof f.type === 'undefined')
    && (f.status === null || typeof f.status === 'undefined')
    promises.push(db.Floor.update(
      {
      floor: empty ? null : i,
      individual: f.individual || null,
      type: f.type || null,
      status: f.status || null
    }, {where: {id: f.id}}))
  }
  Promise.all(promises).then(() => {
    io.emit('update', { for: 'everyone' })
  })
  
});
function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}
router.get('/addLot/:r/:c', function(req, res) {
  if(isLetter(req.params.r) && !isNaN(Number(req.params.c))) {
    db.Lot.findOne({where:{col: req.params.c, row: req.params.r}}).then((lot)=>{
      if(!lot) {
        db.Lot.create({row: req.params.r, col: req.params.c}).then(newLot => {
          let promises = [
            db.Floor.create({LotId: newLot.id}),
            db.Floor.create({LotId: newLot.id}),
            db.Floor.create({LotId: newLot.id})
          ]
          Promise.all(promises).then(() => {
            io.emit('update', { for: 'everyone' })
          })
        })
      }
    })
    return res.json({success: true})
  }
  return res.json({success: false})
});
router.get('/removeLot/:r/:c', function(req, res) {
  if(isLetter(req.params.r) && !isNaN(Number(req.params.c))) {
    db.Lot.destroy({where:{col: Number(req.params.c), row: req.params.r}}).then(() => {
      io.emit('update', { for: 'everyone' })
      return res.json({success: false})
    })
    
  }
  return res.json({success: false})
});
// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(port);
console.log('Magic happens on port ' + port);
