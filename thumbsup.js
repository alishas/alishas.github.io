var ids = [];
var json;

function getIDs(){
	var request = new XMLHttpRequest();
	request.open("GET", "http://172.16.2.194:8080/dvr/playList?action=get", true);
	request.onreadystatechange = function() {
		if (request.readyState==4 && request.status==200) {
    		json = request.responseText;
    	}
 	}
 	request.send();

 	console.log(json);
}
	
