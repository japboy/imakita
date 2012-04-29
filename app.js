/**
 * electric-robot-5813
 * TODO: タイムゾーンの設定どうするか
 * TODO: oauth の twitter 投稿とユーザー情報取得
 */

/**
 * Module dependencies.
 */

var components = require('./components/index')
  , twitter = components.twitter;

var models = require('./models/index')
  , db = models.mongoose
  , Events = models.models.Events;

var express = require('express')
  , routes = require('./routes/index')
  , app = module.exports = express.createServer();

var io = require('socket.io')
  , io = module.exports = io.listen(app)
  , sockets = {};

io.sockets.on('connection', function(socket){
  socket.setMaxListeners(30);
  sockets['temp'] = socket;
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { pretty: true });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'THIS IS MY FIRST NODE WEB APP YAY!' }));
  app.use(require('stylus').middleware({
    force: true
  , src: __dirname + '/public'
  , compress: true
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.set('host port', 3000);
  app.set('host name', 'localhost');
  app.set('db address', 'mongodb://localhost:27017/my_test');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.set('host port', process.env.PORT || 3000);
  app.set('host name', 'imakita.herokuapp.com');
  app.set('db address', process.env.MONGOHQ_URL);
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  Events.find({}, function(err, docs){
    res.render('index', { title: '出欠とる（＾ω＾）おっ', events: docs });
  });
});

app.get('/event', function(req, res){
  // Check if userid already exists or not
  Events.findOne({}, function(err, doc){
    if (err) {
      res.send(err);
    }

    var getData = function(user_id) {
      // TODO: 現在の全ユーザー情報を取得して render に渡す
      var attendees = []
        , current = 0
        , attendees_length = doc.attendees.length;

      for (var i = 0; i < attendees_length; i++) {
        attendees.push({
          user_id: doc.attendees[i].user_id
        , screen_name: doc.attendees[i].screen_name
        //, name: doc.attendees[i].name
        , distance: "行方不明..."  // TODO: 整形
        , attended: doc.attendees[i].attended || ""  // TODO: 欠席/未着/時間
        });

        var _distance = components.distance(
          doc.location.latitude
        , doc.location.longitude
        , doc.attendees[i].location.latitude
        , doc.attendees[i].location.longitude
        );

        if (doc.attendees[i].location.latitude) {
          if (doc.attendees[i].attended) {
            attendees[i].distance = '到着っ! @ ' + doc.attendees[i].attended;
          }
          else if (0 >= Math.round(_distance / 1000)) {
            attendees[i].distance = '会場まで' + Math.round(_distance) + 'm';
          }
          else {
            attendees[i].distance = '会場まで' + Math.round(_distance / 1000) + 'km';
          }
        }

        if (doc.attendees[i].attended) {
          current += 1;
        }
      }

      var data = {
        title: 'imakita'
      , name: doc.name
      , location: {
          latitude: doc.location.latitude
        , longitude: doc.location.longitude
        }
      , attendees: attendees
      , number: {
          max: attendees_length
        , current: current
        }
      , user: user_id || null
      , participated: null
      };

      return data;
    };

    // Twitter login first
    if (req.session && req.session.results) {
      // Check if userid already exists or not
      var exists = function(user_id, attendees){
        if (attendees) {
          var attendees_length = attendees.length;
          for (var i = 0; i < attendees_length; i++) {
            if (user_id === attendees[i]['user_id']) {
              return true;
            }
          }
        }
        return false;
      };

      if (exists(req.session.results.user_id, doc.attendees)) {
        data = getData(req.session.results.screen_name);
        data.loggedin = true;
        data.participated = true;
        res.render('event', data);
      } else {
        // TODO: 参加者じゃない旨を表示に変更
        data = getData(req.session.results.screen_name);
        data.loggedin = true;
        data.participated = false;
        res.render('event', data);
      }
    } else {
      data = getData();
      data.loggedin = false;
      data.participated = null;
      res.render('event', data);
    }
  });
});

app.get('/login', function(req, res){
  var oauth_token = req.query.oauth_token
    , oauth_verifier = req.query.oauth_verifier;

  if (oauth_token && oauth_verifier && req.session.oauth) {
    twitter.getOAuthAccessToken(
      oauth_token
    , null
    , oauth_verifier
    , function(error, oauth_access_token, oauth_access_token_secret, results) {
        if (error) {
        } else {
          req.session.regenerate(function() {
            req.session.results = results;
            res.redirect('/event');
          });
        }
      }
    );
  } else {
    twitter.getOAuthRequestToken(
      function(error, oauth_token, oauth_token_secret, results) {
        if (error) {
        } else {
          req.session.oauth = {
            oauth_token: oauth_token,
            oauth_token_secret: oauth_token_secret,
            request_token_results: results
          };
          res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token);
        }
      }
    );
  }
});

app.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.send('Session cleared.');
  });
});

app.get('/api/get/users', function(req, res){
  Events.findOne({}, function(err, doc){
    if (err) {
      res.send(err);
    }

    var attendees = []
      , attendees_length = doc.attendees.length;

    for (var i = 0; i < attendees_length; i++) {
      attendees.push({
        user_id: doc.attendees[i].user_id
      , screen_name: doc.attendees[i].screen_name
      //, name: doc.attendees[i].name
      , distance: null
      , attended: doc.attendees[i].attended || null
      });

      if (doc.attendees[i].location.latitude) {
        attendees[i].distance = components.distance(
          doc.location.latitude
        , doc.location.longitude
        , doc.attendees[i].location.latitude
        , doc.attendees[i].location.longitude
        );
      }
    }

    var data = {};

    data['name'] = doc.name;
    data['location'] = {
      latitude: doc.location.latitude
    , longitude: doc.location.longitude
    };
    data['attendees'] = attendees;

    res.send(data);
  });
});

app.post('/api/update/user/location', function(req, res){
  Events.findOne({}, function(err, doc){
    if (err) {
      res.send(err);
    }

    var date = (new Date)
      , distance = components.distance(
          doc.location.latitude
        , doc.location.longitude
        , req.body.latitude
        , req.body.longitude
        )
      , data = {
          user_id: req.session.results.user_id
        , screen_name: req.session.results.screen_name
        , distance: distance
      };

    // TODO: 期間外は弾く
    // TODO: 会場内で 51m (WLAN) 52-58m (GPS) だったので修正が必要
    if (30 >= Math.round(distance)) {
      data['attended'] = date;
    }

    if (sockets.temp) {
      sockets.temp.emit('notify', data);
    }

    var attendees_length = doc.attendees.length;

    for (var i = 0; i < attendees_length; i++) {
      // TODO: duration 外は弾く
      if (!doc.attendees[i].attended &&
          req.session.results.user_id === doc.attendees[i].user_id) {
        doc.attendees[i].location.latitude = req.body.latitude;
        doc.attendees[i].location.longitude = req.body.longitude;
        doc.attendees[i].modified = date;

        if (30 >= Math.round(distance)) {
          doc.attendees[i].attended = date;
        }
      }
    }

    doc.markModified('attendees');

    doc.save(function(err){
      if (err) { res.send(err) };
    });

    res.send(req.session.results.screen_name + '\'s updated position sent.');
  });
});

app.post('/api/update/event/location', function(req, res){
  Events.findOne({}, function(err, doc){
    if (err) {
      res.send(err);
    }

    doc.location.latitude = req.body.latitude;
    doc.location.longitude = req.body.longitude;
    doc.modified = (new Date);

    doc.markModified('attendees');

    doc.save(function(err){
      if (err) { res.send(err) };
    });

    res.send('Location update sent.');
  });
});

app.get('/api/create/event', function(req, res){
  Events.find({}, function(err, docs){
    if (0 === docs.length) {
      var p4d = new Events()
        , date = (new Date)
        // TODO: 参加者は 30 人なので確認して追加
        // TODO: フルネーム取得して表示
        , attendees = [
            {
              user_id: '16665319'
            , screen_name: 'japboy'
            , created: date
            }
          , {
              user_id: '5652122'
            , screen_name: 'ken_c_lo'
            , created: date
            }
          ];

      p4d.name = '第2回デザイナー x エンジニアハッカソン';
      p4d.address = '東京都千代田区麹町三丁目６番地 住友不動産麹町ビル３号館 KDDIウェブコミュニケーションズ様 6Fセミナールーム';
      p4d.duration.start = (new Date('2012-04-29T09:30'))
      p4d.duration.end = (new Date('2012-04-29T20:00'))
      p4d.attendees = attendees;
      p4d.location.latitude = '35.68497';
      p4d.location.longitude = '139.738388300';
      p4d.created = date;

      p4d.save(function(err){
        if (err) {
          res.send(err);
        }
        else {
          res.send('Test event created.');
        }
      });
    } else {
      res.send('Test event already exists.');
    }
  });
});

db.connect(app.set('db address'));

app.listen(app.set('host port'), app.set('host address'), function(){
  console.log(
    "Express server listening on %s:%d in %s mode"
  , app.address().address
  , app.address().port
  , app.settings.env
  );
});
