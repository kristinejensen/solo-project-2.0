var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = require('../modules/database-config');

//voluteer search query
router.get('/volunteer', function (req, res) {
  console.log('hit volunteer search route');
  console.log(req.query);
  pg.connect(connectionString, function (err, client, done){
    if(err){
      console.log('Error connecting to db to complete search', err);
      res.sendStatus(500);
    } else {
      var query = 'SELECT * FROM volunteers JOIN volunteer_causes ON volunteer_causes.volunteer_id=volunteers.id JOIN volunteer_skills ON volunteer_skills.volunteer_id=volunteer_causes.volunteer_id JOIN availability ON availability.volunteer_id=volunteer_skills.volunteer_id WHERE volunteers.id > 0 AND volunteer_skills.skill_id=$1 AND volunteer_causes.cause_id=$2';

      if(req.query.morning == 'true'){
        query += " AND availability.morning=true";
      }
      if(req.query.afternoon == 'true'){
        query += " AND availability.afternoon=true";
      }
      if(req.query.evening == 'true'){
        query += " AND availability.evening=true";
      }
      if(req.query.weekdays == 'true'){
        query += " AND availability.weekdays=true";
      }
      if(req.query.weekends == 'true'){
        query += " AND availability.weekends=true";
      }
      if(req.query.open == 'true'){
        query += " AND availability.open=true";
      }
      client.query(query, [req.query.skill, req.query.cause], function(err, result){
        done();
        if(err){
          console.log('Error completing db search query', err);
          res.sendStatus(500);
        }else{
          res.send(result.rows);
        }
      });
    } // end of else
}) //end of pg.connect
}); // end of router.get

module.exports = router;
