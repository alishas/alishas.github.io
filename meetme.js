"use strict";
var locationMarker = null;
var map = "";
var myLocation="";
var pod="";
var markers=new Array();
var controlUI=new Array();
var controlText=new Array();
var count=0;

function HomeControl(controlDiv, map) {

  controlDiv.style.padding = '5px';

  for (var marker in markers){
    console.log(marker);
    if(marker.getTitle!=null){
        controlUI[marker] = document.createElement('div');
        controlUI[marker].className = "ui";
        controlUI[marker].id="UI"+marker;
        controlUI[marker].title="Click to zoom";
        controlDiv.appendChild(controlUI[marker]);

        controlText[marker] = document.createElement('div');
        controlText[marker].className="text";
        controlText[marker].id="Text"+marker;
        controlText[marker].innerHTML = marker;
        controlUI[marker].appendChild(controlText[marker]);

        (function(marker) {
                google.maps.event.addDomListener(controlText[marker], 'click', function() {
                  map.setCenter(markers[marker].getPosition());
                  map.setZoom(15);
                });

                google.maps.event.addDomListener(controlText[marker], 'mouseover', function() {
                  controlUI[marker].style.backgroundColor="rgb(195,195,195)";
                });

                google.maps.event.addDomListener(controlText[marker], 'mouseout', function() {
                  controlUI[marker].style.backgroundColor="white";
                });
        })(marker);

        
    }
  }
}

function addMarker( latitude, longitude, label, color ){
    markers[label] = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(
            latitude,
            longitude
        ),
       //  labelContent: label.substring(label.indexOf('/')+2,label.indexOf('.')),
       //  labelAnchor: new google.maps.Point(22, 0),
       //  labelClass: "labels", // the CSS class for the label
       //  labelStyle: {opacity: 0.75},
         icon:'http://maps.google.com/mapfiles/ms/icons/'+color+'-dot.png',
       //  draggable: true,
       // raiseOnDrag: true
    });

    if (color!='red'){
      markers[label].setTitle(label);
    }
    google.maps.event.addListener(markers[label], "click", function (e) {});
    return markers[label];
}

function updateMarker(latitude, longitude, label, color){
    if(markers[label]==null){
        addMarker(latitude,longitude,label,color);
    }
    else{
        markers[label].setPosition(
        new google.maps.LatLng(
            latitude,
            longitude
        )
        );
    }
}
//(label.substring(label.indexOf('/')+2,label.indexOf('.'))
    function meetWith(){
        var wantToMeet = {
                    _id: pod.getUserId()+"a1",
                    wantToMeet: "http://"+document.getElementById("meet_with").value+"/"
                  };
        pod.push(wantToMeet);
    }
$(function(){
    $("#error").html("");  // clear the "Missing Javascript" error message

    pod = crosscloud.connect();
    pod.requireLogin();
    pod.onLogin(function () {
        pod.query()
            .filter( { isLocation: true } )
            .on('AllResults',displayMap)
            .start();
    });

    var mapContainer = $( "#mapContainer" );
    if (navigator.geolocation) {
        
        navigator.geolocation.getCurrentPosition(
            function( position ){
                
                console.log( "Initial Position Found" );
                map = new google.maps.Map(
                mapContainer[ 0 ],
                {
                    zoom: 15,
                    center: new google.maps.LatLng(
                        position.coords.latitude,
                        position.coords.longitude
                    ),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                }
                );
                
                    updateMarker(
                    position.coords.latitude,
                    position.coords.longitude,
                    pod.getUserId(),
                    'blue'
                 );

                myLocation = {
                            _id: pod.getUserId()+"a1", 
                            isLocation: true,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            when: (new Date()).toISOString()
                          };
                pod.push(myLocation);
            },
            function( error ){
                console.log( "Something went wrong: ", error );
            },
            {
                timeout: (5 * 1000),
                maximumAge: (1000 * 60 * 15),
                enableHighAccuracy: true
            }
        );
        var positionTimer = navigator.geolocation.watchPosition(
            function( position ){
                console.log( "Newer Position Found" );
                updateMarker(
                    position.coords.latitude,
                    position.coords.longitude,
                    pod.getUserId(),
                    'blue'
                );
                myLocation = {
                            _id: pod.getUserId()+"a1", 
                            isLocation: true,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            when: (new Date()).toISOString()
                          };
                pod.push(myLocation);
            }
        );
        setTimeout(
            function(){
                navigator.geolocation.clearWatch( positionTimer );
            },
            (1000 * 60 * 5)
        );
    
    }
    var displayMap = function (items) {
        items.forEach(function(item) {
            var iMeet="";
            if(item._owner==pod.getUserId()){
                iMeet=item.wantToMeet;
            }
            if(item.wantToMeet==pod.getUserId()||item._owner==iMeet){
                updateMarker(item.latitude,item.longitude,item._owner,'green');
            }
            else if(item.isLocation==true){
                updateMarker(item.latitude,item.longitude,item._owner,'red');
            }
        });
        if (count==0){
          var homeControlDiv = document.createElement('div');
          var homeControl = new HomeControl(homeControlDiv, map);

          homeControlDiv.index = 1;
          map.controls[google.maps.ControlPosition.RIGHT].push(homeControlDiv);
        }
        count++;
    };

    // var panel = document.getElementById("legend");
    // document.body.style.backgroundColor = "white";
    // panel.style.backgroundColor = "white";
    // panel.style.padding = "1em";
    // panel.style.fontFamily = "Arial";

    

});