"use strict";
var locationMarker = null;
var map = "";
var myLocation="";
var pod="";
var markers=new Array();


/**
 * The HomeControl adds a control to the map that simply
 * returns the user to Chicago. This constructor takes
 * the control DIV as an argument.
 * @constructor
 */
function HomeControl(controlDiv, map, location) {

  // Set CSS styles for the DIV containing the control
  // Setting padding to 5 px will offset the control
  // from the edge of the map
  controlDiv.style.padding = '5px';

  // Set CSS for the control border
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = 'white';
  controlUI.style.borderStyle = 'solid';
  controlUI.style.borderWidth = '2px';
  controlUI.style.cursor = 'pointer';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to set the map to Home';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior
  var controlText = document.createElement('div');
  controlText.style.fontFamily = 'Arial,sans-serif';
  controlText.style.fontSize = '12px';
  controlText.style.paddingLeft = '4px';
  controlText.style.paddingRight = '4px';
  controlText.innerHTML = '<b>Home</b>';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to
  // Chicago
  google.maps.event.addDomListener(controlUI, 'click', function() {
    map.setCenter(location)
  });

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

    //if (color!='red'){
      markers[label].setTitle(label);
    //}
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
                    wantToMeet: document.getElementById("meet_with").value
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

                var homeControlDiv = document.createElement('div');
  var homeControl = new HomeControl(homeControlDiv, map, new google.maps.LatLng(
                        position.coords.latitude,
                        position.coords.longitude
                    ));

  homeControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(homeControlDiv);
                
                
                myLocation = {
                            //_id: pod.getUserId()+"/r100", 
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
                           // _id: myLocation._id, 
                            isLocation: true,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            when: (new Date()).toISOString()
                          };
                pod.push(myLocation);
                console.log("id "+myLocation._id);
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
          console.log("id "+item._id+ " owner "+item._owner);
            var iMeet="";
            if(item._owner==pod.getUserId()){
                iMeet=item.wantToMeet;
            }
            if (item.wantToMeet==pod.getUserId()||item._owner==iMeet){
                updateMarker(item.latitude,item.longitude,item._owner,'green');
            }
            else if(item.isLocation==true){
                updateMarker(item.latitude,item.longitude,item._owner,'red');
            }
        });
    };
    var panel = document.getElementById("legend");
    document.body.style.backgroundColor = "white";
    panel.style.backgroundColor = "white";
    panel.style.padding = "1em";
    panel.style.fontFamily = "Arial";

    

});