"use strict";

$(function(){
    $("#error").html("");  // clear the "Missing Javascript" error message

    var pod = crosscloud.connect();
    pod.requireLogin();
    pod.onLogin(function () {
        pod.query()
            .on('AllResults',displayResults)
            .start();
    });
});


var displayResults=function(items){
    $("#main").innerHTML=items;
};