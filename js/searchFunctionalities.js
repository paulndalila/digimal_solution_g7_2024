const locationInput = document.getElementById("search");
const resultsList = document.getElementById("resultsList");

//search button
document.getElementById("search_query_btn").addEventListener("click", (e) => {
  const address_query = document.getElementById("search").value
  if (address_query) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address_query)}`)
    .then(response => response.json())
    .then(data => {
      const filteredAddresses = data.filter(element => {
        return element.display_name.includes("Kenya");
      });                   

        if (filteredAddresses.length > 0) {
            show_map_and_pin_location('location', address_query, filteredAddresses[0].lat, filteredAddresses[0].lon)
        } else {
            alert("The village was not found, Enter nearby locations manually on the search bar  i.e location, village:");
        }

    })
    .catch(error => {
        console.error('Error fetching coordinates:', error);
    });
  } else {
    alert("The village was not found, Enter nearby locations manually on the search bar  i.e location, village:");
  }
  
});

locationInput.addEventListener("input", function() {
    const villageName = this.value.trim();        
    if (villageName.length > 0) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(villageName)}`)
            .then(response => response.json())
            .then(data => {
                resultsList.innerHTML = "";

                const filteredAddresses = data.filter(element => {
                  return element.display_name.includes("Kenya");
                });  

                filteredAddresses.forEach(element => {
                  console.log(element.display_name)
                    const li = document.createElement("li");
                    li.textContent = `${element.display_name}`;
                    li.addEventListener("click", function() {                    
                      show_map_and_pin_location('location', villageName, element.lat, element.lon)
                    });
                    resultsList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error fetching coordinates:', error);
            });
    } else {
      resultsList.innerHTML = "...."; 
    }
});