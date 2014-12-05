"use strict";
var locationMarker = null;
var map = "";
var myLocation="";
var pod="";

function addMarker( latitude, longitude, label,color ){
    var marker = new MarkerWithLabel({
        map: map,
        position: new google.maps.LatLng(
            latitude,
            longitude
        ),
        title: (label || ""),
        labelContent: label.substring(label.indexOf('/')+2,label.indexOf('.')),
        labelAnchor: new google.maps.Point(22, 0),
        labelClass: "labels", // the CSS class for the label
        labelStyle: {opacity: 0.75},
        icon:'http://maps.google.com/mapfiles/ms/icons/'+color+'-dot.png',
        draggable: true,
       raiseOnDrag: true
    });
    google.maps.event.addListener(marker, "click", function (e) {});
    return marker;

}

function updateMarker( marker, latitude, longitude, label ){
    if(marker==null){
        addMarker(latitude,longitude,label,"blue");
    }
    else{
        marker.setPosition(
        new google.maps.LatLng(
            latitude,
            longitude
        )
        );
        if (label){
        marker.setTitle( label );
        }
    }
}
//(label.substring(label.indexOf('/')+2,label.indexOf('.'))
    function meetWith(){
        var wantToMeet = {
                    _id: pod.getUserId()+"/r1", 
                    wantToMeet: document.getElementById("meet_with").value
                  };
        pod.push(wantToMeet);
    }
$(function(){
    $("#error").html("");  // clear the "Missing Javascript" error message

    pod = crosscloud.connect();

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
                    locationMarker,
                    position.coords.latitude,
                    position.coords.longitude,
                    pod.getUserId()
                 );
                
                
                myLocation = {
                            _id: pod.getUserId()+"/r100", 
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
                    locationMarker,
                    position.coords.latitude,
                    position.coords.longitude,
                    pod.getUserId()
                );
                myLocation = {
                            _id: pod.getUserId()+"/r1", 
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
            if (item.wantToMeet==pod.getUserId()||item._owner==iMeet){
                addMarker(item.latitude,item.longitude,item._owner,'green');
            }
            else if(item.isLocation==true){
                addMarker(item.latitude,item.longitude,item._owner,'red');
            }
        });
    };
    var panel = document.getElementById("legend");
    document.body.style.backgroundColor = "white";
    panel.style.backgroundColor = "white";
    panel.style.padding = "1em";
    panel.style.fontFamily = "Arial";

    pod.onLogin(function () {
        pod.query()
            .filter( { isLocation:true } )
            .onAllResults(displayMap)
            .start();
    });

});