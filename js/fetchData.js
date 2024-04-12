document.addEventListener("DOMContentLoaded", () => {  
 
  var token = localStorage.getItem('accessToken');
  //console.log(token)
  
  //var county = "";
  var villageCoordinates = [];

  // Function to construct URL with parameters
  function get_url(endpoint, params) {
    let url = new URL(`https://training.digimal.uonbi.ac.ke/api/${endpoint}`);
    url.search = new URLSearchParams(params).toString();
    return url;
  }

  // Function to fetch data and populate dropdown
  function fetchDataAndPopulateDropdown(endpoint, parentId, dropdownId, defaultOptionText) {
    // Fetch data from API
    fetch(get_url(endpoint, { parent_id: parentId }), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.json())
      .then(res => {
        if (res && res.message) {
          populateDropdown(dropdownId, res.message, defaultOptionText);
        }
      })
      .catch(error => console.error("Error fetching data:", error));
  }

  // Function to populate dropdown options
  function populateDropdown(dropdownId, data, defaultOptionText) {
    let dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = ''; // Clear existing options
    let defaultOption = document.createElement("option");
    defaultOption.text = defaultOptionText;
    defaultOption.value = "";
    dropdown.add(defaultOption);

    data.forEach(item => {
      let option = document.createElement("option");
      option.text = item.name;
      //console.log(data)
      //getVillageName(15802);
      if(dropdownId == 'village_select'){
        option.value = item.id;        
      }else{
        option.value = item.org_id;
      }
      dropdown.add(option);
    });

    dropdown.disabled = false;
  }


  //get location name
  function getLocation(org_id, distinct){
    fetch('https://training.digimal.uonbi.ac.ke/api/get_org_unit_with_children?org_id='+org_id, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => response.json())
        .then(res => {
          zoomIntoCounty(getFirstWordOfThePlace(res.message[0].name), distinct)
        })
        .catch(error => { console.log('error', error)});

  }

  // Event listener for county selection
  document.getElementById("county_select").addEventListener("change", (e) => {
    let parent_id = e.target.value;
    getLocation(parent_id, 'county')
    fetchDataAndPopulateDropdown("get_sub_counties_list", parent_id, "sub_county_select", "Sub_county");
  });

  // Event listener for sub-county selection
  document.getElementById("sub_county_select").addEventListener("change", (e) => {
      let parent_id = e.target.value;
      getLocation(parent_id, 'sub_county')
      fetchDataAndPopulateDropdown("get_sub_counties_list", parent_id, "ward_select", "Ward");
  });

  // Event listener for ward selection
  document.getElementById("ward_select").addEventListener("change", (e) => {
      let parent_id = e.target.value;
      getLocation(parent_id, 'ward')
      fetchDataAndPopulateDropdown("get_sub_counties_list", parent_id, "location_select", "Location");
  });

  // Event listener for location selection
  document.getElementById("location_select").addEventListener("change", (e) => {
      let parent_id = e.target.value;
      getLocation(parent_id, 'location')
      fetchDataAndPopulateDropdown("get_sub_counties_list", parent_id, "sub_location_select", "Sub Location");
  });

  // Event listener for sub-location selection
  document.getElementById("sub_location_select").addEventListener("change", (e) => {
      let parent_id = e.target.value;
      fetchDataAndPopulateDropdown("get_sub_counties_list", parent_id, "village_select", "Village");
  });

  // Event listener for village selection
  document.getElementById("village_select").addEventListener("change", (e) => {
    let village_id = e.target.value;    
    //console.log(village_id);  
    processVillage(village_id);    
  });
  
  //get village name
  function processVillage(village_id){
    fetch('https://training.digimal.uonbi.ac.ke/api/get_org_unit_with_children?id='+village_id, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => response.json())
        .then(res => {
          locate_village(res.message[0].name, res.message[0].org_id, res.message[0].parent_id)
        })
        .catch(error => { console.log('error', error)});
  }

  //locating the village with village name only in fetching request
  function locate_village_bb(villageName, org_id, parent_id){
    villageName = villageName.replace(/\bvillage\b/gi, '').trim();
    const words = villageName.split(' ');

      if (words.length >= 3) {
        villageName = words.slice(0, 2).join(' ');
      }

      if (villageName) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(villageName)}`)
          .then(response => response.json())
          .then(data => {
            const filteredAddresses = data.filter(element => {
              return element.display_name.includes("Kenya");
            });                   

            if (filteredAddresses.length > 0) {
              show_map_and_pin_location('village', villageName, filteredAddresses[0].lat, filteredAddresses[0].lon, org_id)
            } else {
              locate_village_b(villageName, org_id, parent_id);
            }

          })
          .catch(error => {           

            alert("The village was not found, Enter nearby locations manually on the search bar  i.e location, village:");
              console.error('Error fetching coordinates:', error);
          });
      } else {
          console.error('Village not found');
      }
  }

  function getFirstWordOfThePlace(sentence) {
    if(sentence.includes('Sub County')){
      console.log(sentence.replace(/\b(?:county|sub\scounty)\b/gi, '').trim())
      return sentence.replace(/\b(?:county|sub\scounty)\b/gi, '').trim();
    }else if(sentence.includes('County')){
      console.log(sentence.replace(/\bcounty\b/gi, '').trim())
      return sentence.replace(/\bcounty\b/gi, '').trim();
    }else if(sentence.includes('Ward')){
      console.log(sentence.replace(/\ward\b/gi, '').trim())
      return sentence.replace(/\ward\b/gi, '').trim();
    }else{
      var place = sentence.split(" ");
      return place[0];
    }
  }

  //locating a village with both sub-location and village name in fetching request
  async function locate_village(villageName, org_id, parent_id){
    // var parent_name = '';
    const county_id = document.getElementById('county_select').value

    var county_name = await returnLocationName(county_id);
    var parent_name = await returnLocationName(parent_id);

    //get sub county first name and remove 'county' from name
    parent_name = getFirstWordOfThePlace(parent_name);

    //get county first name and remove 'county' from name
    county_name = getFirstWordOfThePlace(county_name);

    villageName = villageName.replace(/\bvillage\b/gi, '').trim();

    newVillageName = getFirstWordOfThePlace(villageName);


    if (newVillageName) {

      //fetch from parent first
      var input_query1 = newVillageName+', '+parent_name;
      console.log('input_query1: '+input_query1)
      
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input_query1)}`)
        .then(response => response.json())
        .then(data => {
          
          const filteredAddresses = data.filter(element => {
            return element.display_name.includes("Kenya");
          });                   

          if (filteredAddresses.length > 0) {

            show_map_and_pin_location('village', villageName, filteredAddresses[0].lat, filteredAddresses[0].lon, org_id)
          } else {

            //fetch from county
            var input_query = newVillageName+', '+county_name;  
            console.log('input_query: '+input_query)
                
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input_query)}`)
              .then(response => response.json())
              .then(data => {
                
                const filteredAddresses = data.filter(element => {
                  return element.display_name.includes("Kenya");
                });                   

                if (filteredAddresses.length > 0) {
                  show_map_and_pin_location('village', villageName, filteredAddresses[0].lat, filteredAddresses[0].lon, org_id)
                } else {
                  //fetch from county
                  alert("The village was not found, login to pin point and add the new village:");
                }

              })
              .catch(error => {
                console.error('Error fetching coordinates:', error);
              });
          }

        })
        .catch(error => {
          console.error('Error fetching coordinates:', error);
        });
    } else {
      console.error('Error fetching coordinates:');
    }
    
  }

  // Get parent ID of Parent org id
  async function returnParentID(parent_org_Id) {
    try {
      const response = await fetch('https://training.digimal.uonbi.ac.ke/api/get_org_unit_with_children?org_id=' + parent_org_Id, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      return data.message[0].parent_id;
    } catch (error) {
      console.log('Error fetching location name:', error);
      throw error; // Re-throw the error for handling outside of this function if needed
    }
  }

  // Get location name by ID
  async function returnLocationName(org_Id) {
    try {
      const response = await fetch('https://training.digimal.uonbi.ac.ke/api/get_org_unit_with_children?org_id=' + org_Id, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      return data.message[0].name;
    } catch (error) {
      console.log('Error fetching location name:', error);
      //throw error; // Re-throw the error for handling outside of this function if needed
    }
  }

  // Process user based on level
  async function processUser(level, org_id, parent_id) {

    const locationName = await returnLocationName(org_id);
    const parent = await returnLocationName(parent_id);

    alert(`Level ${level} User: ${locationName}`);

    if (level === 1) {
      // National level

    } else if (level === 2) {
      //County level    
      getLocation(org_id, 'county');
      document.getElementById('county_select').innerHTML = `<option value="${org_id}">${locationName}</option>`; 
      fetchDataAndPopulateDropdown("get_sub_counties_list", org_id, "sub_county_select", "Sub_county");

    }else if(level === 3){
      //sub-county level    
      getLocation(parent_id, 'county')
      getLocation(org_id, 'sub_county')
      document.getElementById('county_select').innerHTML = `<option value="${parent_id}">${parent}</option>`; 
      document.getElementById('sub_county_select').innerHTML = `<option value="${org_id}">${locationName}</option>`; 
      fetchDataAndPopulateDropdown("get_sub_counties_list", org_id, "ward_select", "Ward");
      
    }else if(level === 4){
      //ward level   

      //get county-use the parent id of sub-county
      const county_org_id = await returnParentID(parent_id);
      const county_name = await returnLocationName(county_org_id);

      //zoom
      getLocation(county_org_id, 'County');
      getLocation(parent_id, 'sub_county')    
      getLocation(org_id, 'ward')

      //dropdown select
      document.getElementById('county_select').innerHTML = `<option value="${county_org_id}">${county_name}</option>`;
      document.getElementById('sub_county_select').innerHTML = `<option value="${parent_id}">${parent}</option>`; 
      document.getElementById('ward_select').innerHTML = `<option value="${org_id}">${locationName}</option>`;
      fetchDataAndPopulateDropdown("get_sub_counties_list", org_id, "location_select", "Location");

    }else if(level === 5){     
      
      //get county-use the parent id of sub-county
      // const county_org_id = await returnParentID(parent_id);
      // const county_name = await returnLocationName(county_org_id);

      // //zoom
      // getLocation(county_org_id, 'County');
      // getLocation(parent_id, 'sub_county')    
      // getLocation(org_id, 'ward')

      // //dropdown select
      // document.getElementById('county_select').innerHTML = `<option value="${county_org_id}">${county_name}</option>`;
      // document.getElementById('sub_county_select').innerHTML = `<option value="${parent_id}">${parent}</option>`; 
      // document.getElementById('ward_select').innerHTML = `<option value="${org_id}">${locationName}</option>`;

      //location level
      getLocation(parent_id, 'ward')
      document.getElementById('location_select').innerHTML = `<option value="${org_id}">${locationName}</option>`;
      fetchDataAndPopulateDropdown("get_sub_counties_list", org_id, "sub_location_select", "Sub_location");
      
    }else if(level === 6){
      alert('Level 6 User: Sub location');
      //sub-location level
    }else if(level === 7){
      alert('Level 7 User: Village');
      //village level
    }


  }

  ///load json and map all markers
  loadJSON(async function(jsonData) {
    //console.log(jsonData.data); 

    var markers = L.markerClusterGroup();

    // Iterate over JSON data and create markers
    jsonData.data.forEach( async function(location) {
        var myIcon = L.icon({
            iconUrl: './maps/images/pin24.png',
            iconRetinaUrl: './maps/images/pin48.png',
            iconSize: [29, 24],
            iconAnchor: [9, 21],
            popupAnchor: [0, -14],
        })    

        const villageName = await returnLocationName(location.org_id);
        //console.log(villageName)

        var Lpopup = '<div id="'+location.id+'"><b>Village: </b> '+villageName+' <br/><b>Distribution posts: </b> 0 <br/><b>Households: </b> 0 <br/><b>Latitude: </b>'+location.Latitude+'<br/><b>Longitude: </b>'+location.Longitude+'</div>'

        var marker = await L.marker([parseFloat(location.Latitude), parseFloat(location.Longitude)], {
          icon: myIcon,
          }).bindPopup(Lpopup);

        markers.addLayer(marker);
    });

    // Add marker cluster group to the map
    map.addLayer(markers);
  });


  // Function to handle button replacement
  function replaceButton() {
    const buttonsDiv = document.getElementById("buttons");
    const loginBtn = document.getElementById("loginBtn");
    if (isAuthenticated()) {
      // Replace "Login" button with "Logout" button
      closeForm();

      //fetch and display user levels
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData);

      console.log(user)

      processUser(user.level, user.org_Id, user.parent_Id);

      const logoutBtn = document.createElement("button");
      logoutBtn.textContent = "Logout";
      logoutBtn.classList.add("btn");
      logoutBtn.addEventListener("click", function() {

        localStorage.removeItem("user");
        location.reload();
      });

      buttonsDiv.replaceChild(logoutBtn, loginBtn);
    }else{
      //fetching and displaying counties
      fetch('https://training.digimal.uonbi.ac.ke/api/get_counties', {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => response.json())
        .then(res => {
          populateDropdown('county_select', res, 'County');              
        })
        .catch(error => console.error("Error fetching data:", error));
    }
  }

  // Call replaceButton function when the page loads
  replaceButton();
});