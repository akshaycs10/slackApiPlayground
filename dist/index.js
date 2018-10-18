/**
 *  Server
 *  @file: index.js
 *  @author: Akshay Kumar <ak.4akshay@gmail.com>
 *
 *  @description: Main server file for starting the slack push cron-job service
 *      Run with 'nodemon index.js'
 */

require('dotenv').config()
var request = require('request-promise');
var fs = request('fs');
var async = require('async');
var CronJob = require('cron').CronJob;
var config = require('./config.json');
var express = require('express');
var app = express();
var https = require('https');
var sslOptions = {
   key: fs.readFileSync('/opt/epaas/certs/key', 'utf8'),
   cert: fs.readFileSync('/opt/epaas/certs/cert', 'utf8'),
   ca: fs.readFileSync('/opt/epaas/certs/ca', 'utf8'),
   passphrase: fs.readFileSync('/opt/epaas/certs/pass', 'utf8'),
   requestCert: true, 
   rejectUnauthorized: false 
 };

var server = https.createServer(sslOptions, app);
server.listen(config.healthCheckPort, () => console.log(`Example app listening on port ${config.healthCheckPort}!`))

app.get('/health', function(req, res) {
  res.send('HealthCheckResponse:ok').status(200);
});
/**time format syntax
Seconds: 0-59
Minutes: 0-59
Hours: 0-23
Day of Month: 1-31
Months: 0-11 (Jan-Dec)
Day of Week: 0-6 (Sun-Sat)
timezone supported: http://momentjs.com/timezone/
**/
new CronJob(config.cronTime, onTick, null, true, config.cronJobTimeZone);

//cron-job to be called onTick
function onTick() {
  console.log('******* You will see this message on Cron-Job start ********');
  getWorkspaceUserList();
}

//gets users list of a workspace
function getWorkspaceUserList() {
  var options = {
    uri: config.getUserEndpoint,
    qs: {
      token: process.env.apptoken // -> uri + '?access_token=xxxxx%20xxxxx'
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
  };
  request(options)
    .then(function(users) {
      if (users && users.members && users.members.length > 0) {
        console.log('getWorkspaceUserList: Users list', users.members.length);
        pushMessageToAll(users.members);
      } else {
        console.warn('getWorkspaceUserList: usersList<1, response:', users)
        return;
      }

    })
    .catch(function(err) {
      // API call failed...
      console.error('getWorkspaceUserList: UsersList fetch failed:', err);
    });
}

//pushed messages to all in usersList
function pushMessageToAll(usersList) {
  async.eachLimit(usersList, config.usersBatchLength, function(user, callback) {
      console.log('pushMessageToAll: user name/real_name/id ==>', user.name, user.real_name, user.id);
      var options = {
        uri: config.postMessageEndpoint,
        qs: {
          token: process.env.apptoken, // -> uri + '?access_token=xxxxx%20xxxxx'
          channel: user.id, //user channel id	
          text: config.postMessageContent
          // as_user: true //uncomment when msg context: APP. Otherwise bot.
        },
        headers: {
          'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
      };
      request(options)
        .then(function(response) {
          console.log('pushMessageToAll: send msg response:', response);
          callback();
        })
        .catch(function(err) {
          // API call failed...
          console.error('pushMessageToAll: send msg failed:', err);
          callback(err);
        });
    },
    //final callback
    function(error, results) {
      if (error) {
        console.error("pushMessageToAll: final callback, error:", error);
      } else {
        console.log("pushMessageToAll: final callback, Cron-Job completed, sent messages to users:",usersList.length);
      }
    });
}

process.on('unhandledRejection', function(error) {
  // Will print "unhandledRejection err is not defined"
  console.error('unhandledRejection:', error.message);
});
process.on('uncaughtException', function(err) {
  console.error('unhandledRejection:', err);
})
