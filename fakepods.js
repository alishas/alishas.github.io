"use strict";

var etag=null;

function podURL() {
	// temporary hack until we have a nice way for users to select their pod
	return "http://"+document.getElementById("podurl").value+".fakepods.com";
	//return document.getElementById("podurl").value
}


function reload() {

	var request = new XMLHttpRequest();

	// just fetch everything, for now, since queries don't work yet
	request.open("GET", podURL()+"/_active", true);
	if (etag !== null) {
		request.setRequestHeader("Wait-For-None-Match", etag);
	}

	request.onreadystatechange = function() {
		if (request.readyState==4 && request.status==200) {
    		handleResponse(request.responseText);
    	}
 	}

	request.send();
}

function handleResponse(responseText) {
	var responseJSON = JSON.parse(responseText);
	etag = responseJSON._etag;
	var all = responseJSON._members;
	var messages = [];
	for (var i=0; i<all.length; i++) {
		var item = all[i];
		console.log(item);
		console.log(item._owner);
		// consider the 'text' property to be the essential one
		if (item._owner==podURL()) {
			messages.push(item)
		}
	}
	
	// not being clever, just remove and re-create the whole "out" element
	var out = document.getElementById("out")
	while(out.firstChild) { out.removeChild(out.firstChild) }

		var message = messages[0];
		out.innerHTML = document.getElementById("podurl").value+"'s favorite food is: "+message.food+" and favorite color is: "+message.color+".";
	
	// wait for 100ms then reload when there's new data.  If data
	// comes faster than that, we don't really want it.
}


function newmsg() {
    var friendUrl = "http://"+document.getElementById("friendurl").value+".fakepods.com";
    var favFood = document.getElementById("favfood").value;
    var favColor = document.getElementById("favcolor").value;
	document.getElementById("friendurl").value = "";
	document.getElementById("favfood").value = "";
	document.getElementById("favcolor").value = "";
    if (favFood&&favColor&&friendUrl) {
     	var request = new XMLHttpRequest();
	    request.open("POST", friendUrl);
    	request.onreadystatechange = function() {
            if (request.readyState==4 && request.status==201) {
				// why does this always print null, even though it's not?
				// console.log("Location:", request.getResponseHeader("Location"));
     		}
		}
		request.setRequestHeader("Content-type", "application/json");
		var content = JSON.stringify({food:favFood, color:favColor, time:Date.now()});
		request.send(content);
	} 
}