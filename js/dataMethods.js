//display table data
function putTableIDStats(type, location, lat, lon, id){
    document.getElementById('stats').style.display = 'block';
    const table_stats = document.getElementById('stats_table');
    table_stats.innerHTML = '<tr> <th></th> <th></th> </tr> <tr> <td>'
        +type
        +':</td> <td>'
        +location
        +'</td> </tr> <tr> <td>Latitude:</td> <td><input type="text" id="lat" value='
        +lat
        +' readonly/></td> </tr> <tr> <td>Longitude:</td> <td><input type="text" id="lon" value='
        +lon
        +' readonly/></td> </tr><tr> <td id="head_id">Id:</td> <td><input type="text" id="v_id" value='
        +id
        +' readonly/></td> </tr>';

}

//function to zoom in by selection
function zoomIntoCounty(theLocation, distinct){
    var zoom_level = 10;

    if(distinct === 'county'){
        zoom_level = 10;
    }else if(distinct === 'sub_county'){
        zoom_level = 12;
    }else if(distinct === 'ward'){
        zoom_level = 14;
    }else if(distinct === 'location'){
        zoom_level = 15;
    }else{
        zoom_level = 16;
    }

    console.log(theLocation)

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(theLocation)}`)
    .then(response => response.json())
    .then(data => {
      const filteredAddresses = data.filter(element => {
        return element.display_name.includes("Kenya");
      });                   

        if (filteredAddresses.length > 0) {
            map.setView([filteredAddresses[0].lat, filteredAddresses[0].lon], zoom_level);
        } else {
            console.log('.')
        }

    })
    .catch(error => {           

      alert("The village was not found, Enter nearby locations manually on the search bar  i.e location, village:");
        console.error('Error fetching coordinates:', error);
    });
    
}

//show details on the dashboard
function putTableStats(type, location, lat, lon){
    document.getElementById('stats').style.display = 'block';
    const table_stats = document.getElementById('stats_table');
    table_stats.innerHTML = '<tr> <th></th> <th></th> </tr> <tr> <td>'
        +type
        +':</td> <td>'
        +location
        +'</td> </tr> <tr> <td>Latitude:</td> <td><input type="text" id="lat" value='
        +lat
        +' readonly/></td> </tr> <tr> <td>Longitude:</td> <td><input type="text" id="lon" value='
        +lon
        +' readonly/></td> </tr>';

}

//showAndMarkLocation
async function show_map_and_pin_location(type, location, lat, lon, id){
    var myIcon = L.icon({
        iconUrl: './maps/images/pin24.png',
        iconRetinaUrl: './maps/images/pin48.png',
        iconSize: [29, 24],
        iconAnchor: [9, 21],
        popupAnchor: [0, -14],
    })                            
    
    map.setView([lat, lon], 16);

    var popup = '<div id="marker_popup"><b>'+type+': </b>'+location + '<br/><b>Latitude: </b>'+lat+'<br/><b>Longitude: </b>'+lon+'<br/><button onClick="postData()" class="post_btn">Post Geocodes</button></div>';

    //check village, add details without post geo button if it exists+
    const village_marker_exists = await getCoordinatesByOrgId(id);

    if(village_marker_exists !=null){
        popup = '<div id="marker_popup"><b>'+type+': </b>'+location + '<br/><b>Latitude: </b>'+lat+'<br/><b>Longitude: </b>'+lon+'</div>';
    }

    var m = L.marker([lat, lon], {
    icon: myIcon,
    }).bindPopup(popup).addTo(map);
    m.openPopup();
       
    if(id === undefined || id === null || id === ''){
        putTableStats(type, location, lat, lon)
    }else{        
        putTableIDStats(type, location, lat, lon, id)
    }
}

//post to json server
function postData(){
    const lat = document.getElementById('lat').value;
    const long = document.getElementById('lon').value;

    if(document.getElementById('v_id')){
        const id = document.getElementById('v_id').value
        fetch('http://localhost:3000/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
    
            body: JSON.stringify({ 
                org_id: id,
                Latitude: lat,
                Longitude: long
            }),
        })
        .then(response => response.json())
        .then(data => alert('Successfully posted the co-ordinates!'))
        .catch(error => alert('Error:'+ error));

    }else{

        alert('Cannot post coordinates for a region that is not a village!')
    }
}

//post to json server
function postUserNData(){
    const lat = document.getElementById('lat').value;
    const long = document.getElementById('lon').value;

    if(document.getElementById('v_id')){
        const id = document.getElementById('v_id').value

        //fetch and display user levels
        const userData = localStorage.getItem("user");
        const user = JSON.parse(userData);

        fetch('http://localhost:3000/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
    
            body: JSON.stringify({ 
                org_id: id,
                Latitude: lat,
                Longitude: long,
                chp_id: user.user_id
            }),
        })
        .then(response => response.json())
        .then(data => alert('Successfully posted the co-ordinates!'))
        .catch(error => alert('Error:'+ error));

    }else{

        alert('Cannot post coordinates for a region that is not a village!')
    }
}

//check if org_id exists and returns geocodes if true
async function getCoordinatesByOrgId(org_id) {
    try {
        const response = await fetch('http://localhost:3000/data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const entry = data.find(entry => entry.org_id === org_id);
        if (entry) {
            return { lat: entry.Latitude, long: entry.Longitude };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

//get first word in a sentence or phrase
function getFirstWordOfThePlace(sentence) {
    if (sentence.includes('Sub County')) {
        return sentence.replace(/\b(?:county|sub county)\b/gi, '').trim();
    } else if (sentence.includes('County')) {
        return sentence.replace(/\bcounty\b/gi, '').trim();
    } else if (sentence.includes('Ward')) {
        return sentence.replace(/\bward\b/gi, '').trim();
    } else {
        var place = sentence.split(" ");
        return place[0];
    }
}

//Full screen view of the map
function fullScreenView(){
    document.getElementById('map').requestFullscreen();
}

//when my account is clicked, open login form
function openForm(){
    document.getElementById('login-container').style.display = 'flex';
}

//when exit button is clicked
function closeForm(){
    document.getElementById('login-container').style.display = 'none';
}

// Function to check if the user is authenticated
function isAuthenticated() {
    // Check if the user information exists in local storage
    return localStorage.getItem("user") !== null;
}

// Function to load JSON file
function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'json-server/db.json', true); // Replace 'your_file_path.json' with the path to your JSON file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(JSON.parse(xobj.responseText));
        }
    };
    xobj.send(null);
}

//events after the new village button is clicked
//close village popup
document.getElementById('close_village_popup').addEventListener('click', function(){
    document.getElementById('add_village_popup').style.display = 'none';
        
    //Supposed to show button
    if (isAuthenticated()) {
        document.getElementById('add_village_btn').style.display = 'block';
    }
})

function add_new_village_fun(village, org_id) {
    // Disable the default double-click zoom behavior
    map.doubleClickZoom.disable();
    
    // Variables to hold the marker and circle references
    let marker;
    let circle;

    // Add an event listener for double-click
    map.on('dblclick', function(e) {
        // Get the coordinates where the double-click occurred
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;

        if (marker) {
            // Update the existing marker's position and popup content
            marker.setLatLng([lat, lng])
                  .getPopup()
                  .setContent(show_marker_dragged_info(lat,lng,village,org_id));
            marker.openPopup(); // Ensure the popup is opened after updating

            // Update the existing circle's position
            circle.setLatLng([lat, lng]);
        } else {
            // Create a new marker at the double-clicked location
            marker = L.marker([lat, lng], { draggable: true }).addTo(map)
                .bindPopup(show_marker_dragged_info(lat,lng,village,org_id))
                .openPopup();

            // Create a new circle around the marker
            circle = L.circle([lat, lng], {
                color: 'red', // Circle color
                fillColor: '#30f', // Fill color
                fillOpacity: 0.2, // Fill opacity
                radius: 200 // Radius in meters
            }).addTo(map);

            // Add an event listener for the marker's dragend event
            marker.on('drag', function(e) {
                var newLat = e.target.getLatLng().lat;
                var newLng = e.target.getLatLng().lng;

                marker.getPopup().setContent(show_marker_dragged_info(newLat, newLng,village,org_id));
            });

            // Add an event listener for the marker's dragend event
            marker.on('dragend', function(e) {
                var newLat = e.target.getLatLng().lat;
                var newLng = e.target.getLatLng().lng;
                
                // Update the popup content with the new coordinates
                marker.getPopup().setContent(show_marker_dragged_info(newLat, newLng,village,org_id));
                marker.openPopup(); // Ensure the popup is opened after updating

                // Update the circle's position
                circle.setLatLng([newLat, newLng]);
            });
        }
    });
}

function show_marker_dragged_info(Latitudes, Longitudes, theVillage, Org_id){
    putTableIDStats('Village', theVillage, Latitudes, Longitudes, Org_id)
    let theStringElement = `<h3>Drag me to ${theVillage} village</h3> <p><b>Latitude: </b>${Latitudes}</p><p><b>Longitude: </b>${Longitudes}</p> <button onclick="postUserNData()" class="add_village_coordinates_btn">Submit ${theVillage}'s Geocodes</button>`;
    // $('#map_hover_lat_lng').html(`Lat: ${Latitudes} Lng: ${Longitudes}`);
    return theStringElement;
}


// document.getElementById('add_village_btn').addEventListener('click', function(){
//     document.getElementById('map').style.cursor = 'progress';
//     if (isAuthenticated()) {
//         add_new_village_fun();
//     }
// })