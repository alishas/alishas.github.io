"use strict";
var locationMarker = null;
var map = "";
var myLocation="";
    function addMarker( latitude, longitude, label ){
        var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(
                latitude,
                longitude
            ),
            title: (label || "")
        });
        return( marker );
    }
    function updateMarker( marker, latitude, longitude, label ){
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
$(function(){
    $("#error").html("");  // clear the "Missing Javascript" error message

    var pod = crosscloud.connect();
    var myMessages = [];

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
                if (locationMarker){
                    updateMarker(
                    locationMarker,
                    position.coords.latitude,
                    position.coords.longitude,
                    pod.getUserId()
                );
                }
                else{
                    locationMarker = addMarker(
                    position.coords.latitude,
                    position.coords.longitude,
                    pod.getUserId()
                );
                }
                myLocation = {
                            _id: pod.getUserId()+"/r1", 
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
    var show = 5;
    var displayMap = function (items) {
        items.forEach(function(item) {
            addMarker(item.latitude,item.longitude,item._owner);
        });
    };

    pod.onLogin(function () {
        pod.query()
            .filter( { isLocation: true } )
            .onAllResults(displayMap)
            .start();
    });

});

