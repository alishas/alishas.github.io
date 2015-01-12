"use strict";

$(function(){
    $("#error").html("");  // clear the "Missing Javascript" error message

    pod = crosscloud.connect();
    pod.requireLogin();
    pod.onLogin(function () {
        pod.query()
            .on('AllResults',displayResults)
            .start();
    });
}

var mainDiv = document.createElement('div');

var displayResults=function(items){
    items.forEach(function(item) {
        mainDiv.append(item);
    }
}