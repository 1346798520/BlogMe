var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var cookie = require('cookies');
var ObjectId = require('mongodb').ObjectID;

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.cookies.username) {
    var user = req.cookies.username;
    res.redirect('userhome');
  }
  else {
    res.redirect("signin");
  }
});

module.exports = router;

router.get('/deletecookie', function(req, res){
  res.clearCookie('username');
  res.send('username Cookie Deleted');
});

/* cookie function test*/
/*
router.get('/listcookies', function(req, res){
  console.log("Cookies : ", req.cookies);
  res.send('Look in console for cookies');
});

router.get('/deletecookie', function(req, res){
  res.clearCookie('username');
  res.send('username Cookie Deleted');
});
*/

/* database reading test*/
/*
router.get('/thelist', function(req, res){
	var MongoClient = mongodb.MongoClient;
	var url = 'mongodb://localhost:27017/BlogMe' ;	// Define where the MongoDB server is
	MongoClient.connect(url, function (err, db) {	// Connect to the server
		if (err) {
			console.log('Unable to connect to the Server', err);
		} else {	// We are connected
  			console.log('Connection established to', url);
  	    	// Get the documents collection
  	    var collection = db.collection('users');
  			collection.find({}).toArray(function (err, result) {	// Find all users
      		if (err) {
        		res.send(err);
      		} else if (result.length) {
        		res.render('userlist', {
          			// Pass the returned database documents to Jade
          			"userlist" : result
        		});
      		} else {
        		res.send('No documents found');
      		}
  				db.close(); //Close connection
    	});
    } 	
  });	
});
*/


/* signin page */
router.get('/signin', function(req,res){
  res.render('signin');
});
//if psw does not match
router.get('/signin2', function (req,res){
  res.render('signin2');
});

/* if Forgot Password, get find_psw page */
router.get('/find_psw', function(req,res){
  res.render('find_psw');
});

/* Log in*/
router.post('/login', function(req, res) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/BlogMe';
  MongoClient.connect(url, function(err, db) {       // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } else {
      console.log('Connected to Server');
      var collection = db.collection('users'); // Get the documents collection
      // Get the input data 
      var user = req.body.username;
      var psw = req.body.psw;
      collection.find({"username" : user}).toArray( function (err, result) { 
        if(err){
          res.send(err);
        } else if(result.length) {
          console.log('find user: '+ user);
          collection.find({'username': user, 'psw': psw}).toArray(function (err, result) { 
            if(err){
              res.send(err);
            } else if (result.length) {
              console.log('match: '+user+psw);
              //store cookie
              res.cookie('username', user, {expire : new Date() + 99999});
              res.redirect('/userhome');
            } else {
              res.render('signin2');
            }
            db.close();
          });
        } else {
          res.send('user not ex');
        }
      });
    }
  });
});



/* Get User's home_page*/
router.get('/userhome', function(req,res){
  if(req.cookies.username) {
    var user = req.cookies.username;
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/BlogMe';  // Define where the MongoDB server is
    var bloglist = [];
    var followinglist;
    MongoClient.connect(url, function (err, db) { // Connect to the server
      if (err) {
        console.log('Unable to connect to the Server', err);
      } else {  // We are connected
        console.log('Connection established to', url);
        //get followings
        var col = db.collection('users');
        col.find({'username':user}).toArray(function(err,result){
          if (err) {
            res.send(err);
          } else if (result.length) {
            if (result[0].following.length){
              followinglist = result[0].following;
              // find followings' post
              var collection2 = db.collection('blogs');
              collection2.find({}).toArray(function (err2, result2) {  // Find all user's blog
                if (err2) {
                  res.send(err2);
                } else if (result2.length) {
                    for(var i = 0; i < result2.length; i++) {
                    console.log(result2[i].user);
                      if(followinglist.indexOf(result2[i].user) != -1)
                        bloglist.unshift(result2[i]);
                    }
                } else {
                    bloglist = null;
                }
                res.render('userhome', {
                  "username" : user,
                  "bloglist" : bloglist
                });
                db.close(); //Close connection
              }); 
            }
            else {
              console.log('no followings');
              followinglist = null;
              res.render('userhome', {
                  "username" : user,
                  "bloglist" : null
                });
                db.close(); //Close connection
            }
          } else {
            console.log('user not find');
          }
        });
        //get blogs
        
      }
    });
  }
  else {
    res.redirect("signin");
  }
});



/* My_Blog */
router.get('/My_Blog', function(req, res){
  if(req.cookies.username) {
    var user = req.cookies.username;
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/BlogMe';  // Define where the MongoDB server is
    var bloglist,followinglist,followerlist;
    MongoClient.connect(url, function (err, db) { // Connect to the server
      if (err) {
        console.log('Unable to connect to the Server', err);
      } else {  // We are connected
        console.log('Connection established to', url);
        //get followings & followers
        var col = db.collection('users');
        col.find({'username':user}).toArray(function(err,result){
          if (err) {
            res.send(err);
          } else if (result.length) {
            if (result[0].following.length){
              followinglist = result[0].following;
            }
            else {
              console.log('no followings');
              followinglist = null;
            }
            if (result[0].follower.length){
              followerlist = result[0].follower;
            }
            else {
              console.log('no followers');
              followerlist = null;
            }

          } else {
            console.log('user not find');
          }
        });
        //get blogs
        var collection = db.collection('blogs');
        collection.find({'user' : user}).toArray(function (err, result) {  // Find all user's blog
          if (err) {
            res.send(err);
          } else if (result.length) {
              bloglist = result;
          } else {
              bloglist = null;
          }
          res.render('My_Blog', {
            "username" : user,
            "bloglist" : bloglist,
            "followinglist" : followinglist,
            "followerlist" : followerlist
          });
          db.close(); //Close connection
        }); 
      }
    });
  }
  else {
    res.redirect("signin");
  }
});

/* delete a blog */
router.get('/delblog', function(req, res){
  if(req.cookies.username) {
    var user = req.cookies.username;
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/BlogMe';
  /*href method*/
  /*  
    var user = req.param('user');
    var str = user.split(",deltitle=");
    user = str[0];
    var deltitle = str[1];
    // test param
    res.render('test', {
                // Pass null to Jade
                "user" : user,
                "deltitle" : deltitle
            });
  */
    var deltitle = req.param('deltitle');
    MongoClient.connect(url, function(err, db){       // Connect to the server
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        console.log('Connected to Server');
        var collection = db.collection('blogs'); // Get the documents collection
        // remove blog
        collection.remove({'user': user, 'title' : deltitle}, function (err, result){      // Insert the user data
          if (err) {
            console.log(err);
          } else {
            res.redirect("My_Blog");     // Redirect to the updated blog page
          }
          db.close();
        });
      }
    });
  }
  else {
    res.redirect("signin");
  }  
});

/* add a blog */
router.post('/addblog', function(req, res){
  if(req.cookies.username) {
    var username = req.cookies.username;
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/BlogMe';
    var date = new Date();
    MongoClient.connect(url, function(err, db){       // Connect to the server
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        console.log('Connected to Server');
        var collection = db.collection('blogs'); // Get the documents collection
        // Get the user data 
        var blog1 = {user: username, time: date.getTime(), title: req.body.title, content: req.body.content, like: [], share: []};
        collection.insert([blog1], function (err, result){      // Insert the blog
          if (err) {
            console.log(err);
          } else {
            res.redirect("My_Blog");     // Redirect to the updated blog page
          }
          db.close();
        });
      }
    });   
  }
  else {
    res.redirect("signin");
  }
});




/* Get sign up Page */
router.get('/signup', function(req, res){
  res.render('signup');
});
//if usr already exist
router.get('/signup2', function (req,res){
  res.render('signup2');
});

/* add a new user */
router.post('/adduser', function(req, res){
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/BlogMe';
  MongoClient.connect(url, function(err, db){       // Connect to the server
    if (err) {
      console.log('Unable to connect to the Server:', err);
    } 
    else {
      console.log('Connected to Server');
      var collection = db.collection('users'); // Get the documents collection
      var total_user = 0;
      collection.find({}).toArray( function (err, result) { // Find all users
        if (err) {
          res.send(err);
        } else if (result.length) {
          total_user = result.length;
        }
      });
      // Get the user data 
      var username = req.body.username;
      var psw = req.body.psw;
      collection.find({"username" : username}).toArray( function (err, result) { // Find all users
        if (err) {
          res.send(err);
        } else if (result.length) {
         //res.render().message('Username already exists');
         res.render('signup2');
          /*res.render('userlist', {
              // Pass the returned database documents to Jade
              "userlist" : result
          });*/
        } else {
          var user1 = {username: req.body.username, email: req.body.email,  psw: req.body.psw, phone: req.body.phone, state: req.body.state, gender: req.body.gender,
            following : [ ], follower : [ ], haslooked : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], tags : [ ], "blogs" : 0};
          collection.insert([user1], function (err, result){      // Insert the user data
            if (err) {
              console.log('Unable to insert:', err);
            }
            else {
              res.redirect("signin");      // Redirect to the updated user list
            }
            db.close();   //Close connection
          });
        } 
      });
    } 
  });
});


/* logout - del cookies*/
router.get('/logout', function(req,res){
  if(req.cookies.username) {
    res.clearCookie('username');
    res.redirect("signin");
  }
  else {
    res.redirect("signin");
  }
});

/* visit other's blog*/
router.get('/others_blog', function(req,res){
  if(req.cookies.username) {
    var user = req.cookies.username;
    var user2 = req.param('user2');
    var isfollowing = false;
    var bloglist;
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/BlogMe';
    MongoClient.connect(url, function(err, db){       // Connect to the server
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        var col = db.collection('blogs');
        col.find({'user' : user2}).toArray(function (err, result) {  // Find all user's blog
          console.log('finding blogs of' + user2);
          if (err) {
            res.send(err);
          } else if (result.length) {
              console.log('found');
              bloglist = result;
          } else {
              console.log('blogs not found')
              bloglist = null;
          }
        }); 
        var collection = db.collection('users');
        collection.find({'username':user}).toArray(function(err,result){
          if(err){
            console.log(err);
          } else if(result.length){
            for(var i=0; i<result[0].following.length;i++){
              console.log(result[0].following[i]+','+user2+','+isfollowing);
              if(result[0].following[i]==user2) {
                isfollowing = true;
                console.log('isfollowing is set to '+isfollowing);
                break;
              }
            }
            db.close();
          } else {
            res.send("who are you?");
          }
          console.log('isfollowing is now '+isfollowing);
          res.render("others_blog", {
            "username" : user,
            "username2" : user2,
            "isfollowing" : isfollowing,
            "bloglist" : bloglist
          });
        });
      }
    });
  }
  else {
    res.redirect("signin");
  }
});

/* follow a user */
router.get('/follow', function(req,res){
  if(req.cookies.username) {
    var user = req.cookies.username;
    var user2 = req.param('user2');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/BlogMe';
    MongoClient.connect(url, function(err, db){       // Connect to the server
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        var collection = db.collection('users');
        collection.find({'username':user}).toArray(function(err,result){
          if(err){
            console.log(err);
          } else if(result.length){
            collection.update({'username':user},{$push:{'following':user2}});
          } else {
            res.send("who are you?");
          }
        });
        collection.find({'username':user2}).toArray(function(err,result){
          if(err){
            console.log(err);
          } else if(result.length){
            collection.update({'username':user2},{$push:{'follower':user}});
          } else {
            res.send("who is he?");
          }
        });
      }
    });
    res.redirect("/others_blog?user2="+user2);
  }
  else {
    res.redirect("signin");
  }
});

/* disfollow a user */
router.get('/disfollow', function(req,res){
  if(req.cookies.username) {
    var user = req.cookies.username;
    var user2 = req.param('user2');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/BlogMe';
    MongoClient.connect(url, function(err, db){       // Connect to the server
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        var collection = db.collection('users');
        collection.find({'username':user}).toArray(function(err,result){
          if(err){
            console.log(err);
          } else if(result.length){
            collection.update({'username':user},{$pull:{'following':user2}});
          } else {
            res.send("who are you?");
          }
        });
        collection.find({'username':user2}).toArray(function(err,result){
          if(err){
            console.log(err);
          } else if(result.length){
            collection.update({'username':user2},{$pull:{'follower':user}});
          } else {
            res.send("who is he?");
          }
        });
      }
    });
    res.redirect("/others_blog?user2="+user2);
  }
  else {
    res.redirect("signin");
  }
});

/* disfollow a user */
router.get('/delfollowing', function(req,res){
  if(req.cookies.username) {
    var user = req.cookies.username;
    var user2 = req.param('user2');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/BlogMe';
    MongoClient.connect(url, function(err, db){       // Connect to the server
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        var collection = db.collection('users');
        collection.find({'username':user}).toArray(function(err,result){
          if(err){
            console.log(err);
          } else if(result.length){
            collection.update({'username':user},{$pull:{'following':user2}});
          } else {
            res.send("who are you?");
          }
        });
        collection.find({'username':user2}).toArray(function(err,result){
          if(err){
            console.log(err);
          } else if(result.length){
            collection.update({'username':user2},{$pull:{'follower':user}});
          } else {
            res.send("who is he?");
          }
        });
      }
    });
    res.redirect("/My_Blog");
  }
  else {
    res.redirect("signin");
  }
});



/* Like a post */
router.get('/showlike', function(req,res){
  if(req.cookies.username) {
    var user = req.cookies.username;
    var like_blog = req.param('like_blog');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/BlogMe';
    MongoClient.connect(url, function(err, db){       // Connect to the server
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        var collection = db.collection('blogs'); // Get the documents collection
        // Get the user data 
        collection.find({'_id':ObjectId(like_blog)}).toArray(function (err, result){      // Update the like count
          if (err) {
            console.log(err);
          } else if(result.length) {
            if(result[0].like.indexOf(user)==-1)
              collection.update(result[0],{$push:{'like':user}});
            res.redirect('/My_Blog');
          } else {
            res.send('can not find the blog');
          }
          db.close();
        });
      }
    });
  }
  else {
    res.redirect("signin");
  }   
})

/* Like a post */
router.get('/like', function(req,res){
  if(req.cookies.username) {
    var user = req.cookies.username;
    var like_blog = req.param('like_blog');
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/BlogMe';
    MongoClient.connect(url, function(err, db){       // Connect to the server
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        var collection = db.collection('blogs'); // Get the documents collection
        // Get the user data 
        collection.find({'_id':ObjectId(like_blog)}).toArray(function (err, result){      // Update the like count
          if (err) {
            console.log(err);
          } else if(result.length) {
            if(result[0].like.indexOf(user)==-1)
              collection.update(result[0],{$push:{'like':user}});
            res.redirect('/userhome');
          } else {
            res.send('can not find the blog');
          }
          db.close();
        });
      }
    });
  }
  else {
    res.redirect("signin");
  }   
})

/* About us page */
router.get('/about', function (req,res){
  if(req.cookies.username) {
    res.render('about');
  }
  else {
    res.redirect("signin");
  }
});

router.get('/search', function (req,res){
  if(req.cookies.username) {
    var usr = req.cookies.username;
    res.render('search',{'username':usr});
  }
  else {
    res.redirect("signin");
  }
});

router.post('/dosearch', function(req, res){
  if(req.cookies.username) {
    var usr = req.cookies.username;
    var sch = req.body.search_usr;
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/BlogMe';
    MongoClient.connect(url, function(err, db){       // Connect to the server
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } 
      else {
        console.log('Connected to Server');
        var collection = db.collection('users'); // Get the documents collection
        collection.find({'username':sch}).toArray( function (err, result) { // Find all users
          console.log('searching '+ sch);
          if (err) {
            res.send(err);
          } else if (result.length) {
            if(result[0].username == usr)
              res.redirect('/userhome');
            else
              res.render('search',{"result" : result, 'username' : usr});
          } else {
            res.render('search',{"result" : null, 'username' : usr});
          }
          db.close();
        });
      } 
    });
  }
  else {
    res.redirect("signin");
  }
});
