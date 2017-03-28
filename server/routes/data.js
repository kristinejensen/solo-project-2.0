var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = require('../modules/database-config');


//populates volunteer profile with existing user data || adds a new user to the db
router.get('/volunteer', function (req, res) {
  var userEmail = req.decodedToken.email;
  pg.connect(connectionString, function (err, client, done) {
    client.query('SELECT * FROM volunteers WHERE email=$1;', [userEmail], function (err, result) {
      done();
      if (err) {
        console.log('Error completing query', err);
        res.sendStatus(500);
      } else if (result.rows.length == 0) {
        pg.connect(connectionString, function (err, client, done) {
          client.query('INSERT INTO volunteers (email) VALUES ($1) RETURNING id;', [userEmail], function (err, result) {
            done();
            if (err) {
              console.log('Error inserting new volunteer user', err);
              res.sendStatus(500);
            } else {
              client.query('INSERT INTO volunteer_skills (volunteer_id, skill_id) VALUES ($1, $2), ($1, $2), ($1, $2) RETURNING volunteer_id;', [result.rows[0].id, 47],
              function (err, result) {
                if (err) {
                  console.log('Error adding default skills', err);
                  res.sendStatus(500);
                } else {
                  client.query('INSERT INTO volunteer_causes (volunteer_id, cause_id) VALUES ($1, $2), ($1, $2), ($1, $2) RETURNING volunteer_id;', [result.rows[0].volunteer_id, 23],
                  function(err, result){
                    if (err){
                      console.log('Error adding default causes', err);
                      res.sendStatus(500);
                    } else {
                      client.query('INSERT INTO availability (morning, afternoon, evening, weekdays, weekends, open, volunteer_id) VALUES ($1, $2, $3, $4, $5, $6, $7);', [false, false, false, false, false, false, result.rows[0].volunteer_id],
                      function(err, result){
                        if(err){
                          console.log('Error adding default availability', err);
                          res.sendStatus(500);
                        } else {
                          res.send({email: userEmail});
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        });
      } else {
        res.send(result.rows[0]);
      }
    });
  });
});

//populates volunteer profile with existing user data || adds a new user to the db
router.get('/volunteer/skills', function(req, res){
  console.log('get skills route hit');
  var userEmail = req.decodedToken.email;
  pg.connect(connectionString, function (err, client, done) {
    client.query('SELECT * FROM volunteers JOIN volunteer_skills ON volunteer_skills.volunteer_id=volunteers.id JOIN skills ON volunteer_skills.skill_id=skills.id WHERE email=$1;', [userEmail], function(err, result){
      done();
      if(err){
        ('Error completing get skills on page load query', err);
        res.sendStatus(500);
      } else {
        res.send(result.rows);
        console.log(result.rows);
      }
    });
  });
});

//clears "about me" section to prep for update
router.delete('/volunteer/aboutMe/:id', function (req, res) {
  var volunteerId = req.params.id;
  pg.connect(connectionString, function (err, client, done) {
    client.query('DELETE FROM volunteers WHERE id=$1;', [volunteerId], function (err, result) {
      done();
      if (err) {
        console.log('Error completing delete about me query', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
  });
});

//updates "about me" section
router.put('/volunteer/aboutMe/:id', function (req, res) {
  var volunteerId = req.params.id;
  var volunteerObject = req.body;
  pg.connect(connectionString, function (err, client, done) {
    client.query('INSERT INTO volunteers (name, email, linkedin, bio) VALUES ($1, $2, $3, $4);',
    [volunteerObject.name, volunteerObject.email, volunteerObject.linkedin, volunteerObject.bio], function (err, result) {
      done();
      if (err) {
        console.log('Error completing update about me query', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
  });
});

//updates skills section
router.put('/volunteer/skills/:id', function (req, res) {
  var volunteerId = req.params.id;
  var volunteerObject = req.body;
  pg.connect(connectionString, function (err, client, done) {
    client.query('UPDATE volunteer_skills SET volunteer_id=$1, skill_id=$2;',
    [volunteerId, volunteerObject.skillOne.id], function (err, result) {
      done();
      if (err) {
        console.log('Error updating skill one', err);
        res.sendStatus(500);
      } else {
        client.query('UPDATE volunteer_skills SET volunteer_id=$1, skill_id=$2;',
        [volunteerId, volunteerObject.skillTwo.id], function (err, result) {
          done();
          if (err) {
            console.log('Error updating skill two', err);
            res.sendStatus(500);
          } else {
            client.query('UPDATE volunteer_skills SET volunteer_id=$1, skill_id=$2;',
            [volunteerId, volunteerObject.skillThree.id], function (err, result) {
              done();
              if (err) {
                console.log('Error updating skill three', err);
                res.sendStatus(500);
              } else {
                res.sendStatus(200);
              }
            });
          }
        });
      }
    });
  })
});

// updates availability section
router.put('/volunteer/availability/:id', function (req, res) {
  var volunteerId = req.params.id;
  var availabilityObject = req.body;
  pg.connect(connectionString, function (err, client, done) {
    client.query('UPDATE availability SET morning=$1, afternoon=$2, evening=$3, weekdays=$4, weekends=$5, open=$6, volunteer_id=$7;',
    [availabilityObject.morning, availabilityObject.afternoon, availabilityObject.evening, availabilityObject.weekdays, availabilityObject.weekends, availabilityObject.open, volunteerId], function (err, result) {
      done();
      if (err) {
        console.log('Error updating availability', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
  });
});

//updates causes section
router.put('/volunteer/causes/:id', function (req, res) {
  var volunteerId = req.params.id;
  var volunteerObject = req.body;
  pg.connect(connectionString, function (err, client, done) {
    client.query('UPDATE volunteer_causes SET volunteer_id=$1, cause_id=$2;',
    [volunteerId, volunteerObject.causeOne.id], function (err, result) {
      done();
      if (err) {
        console.log('Error updating cause one', err);
        res.sendStatus(500);
      } else {
        client.query('UPDATE volunteer_causes SET volunteer_id=$1, cause_id=$2;',
        [volunteerId, volunteerObject.causeTwo.id], function (err, result) {
          done();
          if (err) {
            console.log('Error updating cause two', err);
            res.sendStatus(500);
          } else {
            client.query('UPDATE volunteer_causes SET volunteer_id=$1, cause_id=$2;',
            [volunteerId, volunteerObject.causeThree.id], function (err, result) {
              done();
              if (err) {
                console.log('Error updating cause three', err);
                res.sendStatus(500);
              } else {
                res.sendStatus(200);
              }
            });
          }
        });
      }
    });
  })
});

module.exports = router;
