const express = require('express');
const bodyParser = require('body-parser');

const Dishes = require('../models/dishes');
const Favorite = require('../models/favorites');
const User = require('../models/user');

const authenticate = require('../authenticate');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(authenticate.verifyUser, (req,res,next) => {
  Favorite.find({})
  .populate('user')
  .populate('dishes')
	.then((favorites) => {
		res.send(favorites);
	})
	.catch((err) => console.log(err));
})
.post(authenticate.verifyUser, (req,res,next) => {
  Favorite.findOne({user: req.user._id})
  .then((favorite) => {
    if(favorite){
      for (let i=0; i<req.body.length; i++){
        if(favorite.dishes.indexOf(req.body[i]._id) === -1)
          favorite.dishes.push(req.body[i]._id);
        else
          res.json("Dish " + req.body[i]._id + " already exists");
      }
      favorite.save()
      .then((favorite) => {
        Favorites.findById(favorite._id)
        .populate('user')
        .populate('dishes')
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        })
    })
    	.catch((err) => console.log(err));
    } else {
      Favorite.create({
        user: req.user._id,
        dishes: req.body 
      })
      .then((favorite) => {
        res.json(favorite);
      })
    	.catch((err) => console.log(err));
    }
  })
})
.put(authenticate.verifyUser, (req,res,next) => {
	res.statusCode = 403;
	res.end("PUT operation is not supoorted on /favorites");
})
.delete(authenticate.verifyUser, (req,res,next) => {
	Favorite.remove({})
	.then((resp) => {
		res.send(resp);
	})
	.catch((err) => console.log(err));
});


favoriteRouter.route('/:dishId')
.get(authenticate.verifyUser, (req,res,next) => {
	// res.statusCode = 403;
	// res.end("GET operation is not supoorted on /favorites/"+req.params.dishId);
  Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))

})
.post(authenticate.verifyUser, (req,res,next) => {
  Favorite.findOne({user: req.user._id})
  .then((favorite) => {
    if(favorite){
      if(favorite.dishes.indexOf(req.params.dishId) === -1) {
        favorite.dishes.push(req.params.dishId);
        favorite.save()
        .then((favorite) => {
          Favorites.findById(favorite._id)
          .populate('user')
          .populate('dishes')
          .then((favorite) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
          })
      })
        .catch((err) => console.log(err));
      } else {
        res.json("Dish " + req.params.dishId + " already exists");
      }
      
    } else {
      Favorite.create({
        user: req.user._id,
        dishes: req.params.dishId 
      })
      .then((favorite) => {
        Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
      })
    	.catch((err) => console.log(err));
    }
  })
})
.put(authenticate.verifyUser, (req,res,next) => {
	res.statusCode = 403;
	res.end("PUT operation is not supoorted on /favorites/"+req.params.dishId);
})
.delete(authenticate.verifyUser, (req,res,next) => {
	Favorite.findOne({user: req.user._id})
	.then((favorite) => {
    const index = favorite.dishes.indexOf(req.params.dishId);
    if(index === -1) {
      res.json("Dish " + req.params.dishId + " not found");
    } else {
      favorite.dishes.splice(index, 1);
      favorite.save()
      .then((favorite) => {
        Favorites.findById(favorite._id)
        .populate('user')
        .populate('dishes')
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        })
    })
      .catch((err) => console.log(err));
    }
    
  })
	.catch((err) => console.log(err));
});

module.exports = favoriteRouter;