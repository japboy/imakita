$(function() {
  $('#notice-wrapper').css({display: 'none'});

  var xhr = new XMLHttpRequest()
    , socket = io.connect('http://' + document.location.host);

  socket.on('notify', function(data){
    console.log('Received ' + data.screen_name + '\'s location.');
    var userElem = document.getElementById(data.user_id);

    $('#notice-wrapper').css({display: 'display'});

    if (data.attended) {
      userElem.innerText = data.attended;
    }
    else if (0 >= Math.round(data.distance / 1000)) {
      userElem.innerText = Math.round(data.distance) + 'm';
    }
    else {
      userElem.innerText = Math.round(data.distance / 1000) + 'km';
    }
  });

  $('#gps').on('click', function(event){
    navigator.geolocation.getCurrentPosition(function(pos){
      var lat = pos.coords.latitude
        , lon = pos.coords.longitude
        , request = 'latitude=' + encodeURIComponent(lat) +
            '&longitude=' + encodeURIComponent(lon);

      xhr.onreadystatechange = function() {
        if (4 === xhr.readyState && 200 === xhr.status) {
          console.log(xhr.responseText);
        }
      };

      xhr.open('POST', '/api/update/user/location', true);
      xhr.setRequestHeader('Content-Type',
                           'application/x-www-form-urlencoded;charset=UTF-8');
      xhr.send(request);
    });

    event.preventDefault();
  });
});
