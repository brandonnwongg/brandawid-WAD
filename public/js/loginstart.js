document.addEventListener("DOMContentLoaded", function () {
    const loginScreen = document.getElementById("login-screen");
    const mainScreen = document.getElementById("main-screen");
    const mainContainer = mainScreen.querySelector(".main-container");
    const loginForm = document.getElementById("loginForm");
    const loginButton = document.getElementById("loginMainButton");
    const headerText = mainScreen.querySelector("h1");
    const addScreen = document.getElementById("add-screen");
    const addButton = document.getElementById("adminAddButton");
    const updateDeleteScreen = document.getElementById("update-delete-screen");

    const locationList = document.getElementById("loaction-list");

    let isLoggedIn = false;
    let currentUser = null;
    let selectedLocation = null; // Variable to store the selected location details

    addButton.style.display = "none";
    updateDeleteScreen.style.display = "none"; // Initially hide the update screen

    // Show the login screen and blur the main-container on page load
    if (!isLoggedIn) {
        loginScreen.style.display = "flex"; // Show login overlay
        mainContainer.classList.add("blurred"); // Apply blur effect to main container
        headerText.textContent = "Bitte Login";
    }
    
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();
    
        const username = document.getElementById("usernameID").value;
        const password = document.getElementById("passwordID").value;
    
        fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(user => {
            // Assume response contains the user object without the password
            isLoggedIn = true;
            loginScreen.style.display = "none";
            mainContainer.classList.remove("blurred");
            currentUser = user;
    
            if (user.role === "admin") {
                headerText.textContent = "Willkommen zurück, Mina!";
                addButton.style.display = "inline-block"; // Show the Add button for Admin
                updateButton.style.display = "inline-block"; // Show the Update button for Admin
                deleteButton.style.display = "inline-block"; // Show the Delete button for Admin
            } else {
                headerText.textContent = "Willkommen zurück, Norman!";
                addButton.style.display = "none"; // Hide the Add button for non-admin
                updateButton.style.display = "none"; // Hide the Update button for non-admin
                deleteButton.style.display = "none"; // Hide the Delete button for non-admin
            }
    
            loginButton.value = "LOGOUT";
        })
        .catch(error => {
            console.error('Failed to login:', error);
            alert("Wrong username/password. Try again");
        });
    });
    
    loginButton.addEventListener("click", function (event) {
        if (isLoggedIn && loginButton.value === "LOGOUT") {
            event.preventDefault();

            isLoggedIn = false;
            currentUser = null;
            loginScreen.style.display = "flex"; // Show login screen again
            mainContainer.classList.add("blurred"); // Blur the main container
            headerText.textContent = "Bitte Login";

            loginButton.value = "LOGIN";
            alert("Logged out");
        }
    });


    // Add button for admin
    addButton.addEventListener("click", function () {
        if (currentUser && currentUser.role === "admin") {
            resetAddForm();  // Reset the add form before showing
            addScreen.style.display = "flex"; // Show the Add screen
        } else {
            alert("You do not have permission to access this feature.");
        }
    });

    // Close the Add screen
    const closeButtonAdd = document.getElementById("closeButtonAddScreen");
    const closeButtonAddUpper = addScreen.querySelector(".close-button-add");
    closeButtonAdd.addEventListener("click", function () {
        addScreen.style.display = "none";
    });
    closeButtonAddUpper.addEventListener("click", function () {
        addScreen.style.display = "none";
    });

    // Function to reset the Add form
    function resetAddForm() {
        const addForm = document.querySelector(".addForm");
        addForm.reset();  // Reset all form fields

        // Clear the image preview if any
        const previewImage = document.getElementById("previewIMG");
        previewImage.src = "";  // Clear image preview

        // Deselect all checkboxes
        const checkboxes = document.querySelectorAll("input[name='tags']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset the subtags dropdown
        document.getElementById("subtags").value = "mangelhaft";  // Set default value
    }

    // Handle Save/Submit button click in Add Screen
    const addForm = document.querySelector(".addForm");
    addForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form from refreshing the page

        // Get the values from the form
        const locationName = document.getElementById("locationName").value;
        const street = document.getElementById("street").value;
        const zip = document.getElementById("zip").value;
        const city = document.getElementById("city").value;
        const description = document.getElementById("description").value;

        // Get selected tags
        const selectedTags = Array.from(document.querySelectorAll("input[name='tags']:checked")).map(tag => tag.value);

        // Get selected subtag
        const subtag = document.getElementById("subtags").value;

        // Get the uploaded image
        const previewIMG = document.getElementById("previewIMG").src;

        // Construct the address to search via Geocoding API
        const fullAddress = `${street}, ${city}, ${zip}`;

        // Geocoding request to Nominatim API
        const geocodingUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&addressdetails=1`;

        fetch(geocodingUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0 && data[0].address && data[0].address.postcode === zip) {
                    const address = data[0].address;

                    // Check if the location is in Berlin
                    if (address.city === "Berlin" || address.state === "Berlin") {
                        const lat = parseFloat(data[0].lat).toFixed(8);  // Round latitude to 8 decimal places
                        const lon = parseFloat(data[0].lon).toFixed(8);  // Round longitude to 8 decimal places

                        // Location exists and is in Berlin, proceed to add the location
                        const newLocation = document.createElement("li");
                        const newLocationButton = document.createElement("button");
                        newLocationButton.type = "button";

                        newLocationButton.innerHTML = `
                            <img src="${previewIMG}" alt="${locationName} Image"><br>
                            <strong>Location</strong> ${locationName}<br>
                            <strong>Straße</strong> ${street}<br>
                            <strong>PLZ</strong> ${zip}<br>
                            <strong>Tags</strong> ${selectedTags.join(", ")}<br>
                            <strong>Subtags</strong> ${subtag}<br>
                            <strong>Latitude</strong> ${lat}<br>
                            <strong>Longitude</strong> ${lon}<br>
                            <strong>Description</strong> ${description}<br>
                        `;
                        //<strong>Description</strong> ${description}<br>
                        const payload = {
                            location: locationName,
                            description: description,
                            straße: street,
                            plz: zip,
                            tags: selectedTags,
                            subtags: subtag,
                            longitude: lon,
                            latitude: lat,
                        };

                        // POST request to server to add location
                        fetch('http://localhost:8000/loc', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        })
                        .then(res => res.json())
                        .then(result => {
                            console.log("Location saved in database")
                            addScreen.style.display = "none"; // Close the Add screen after submission
                        })
                        .catch(error => {
                            console.error("Error adding location:", error);
                            alert("Fehler beim Hinzufügen der Location. Bitte versuchen Sie es später erneut.");
                        });

                        newLocation.appendChild(newLocationButton);
                        locationList.insertBefore(newLocation, locationList.lastElementChild); // Insert before the 'Add' button
                
                        addScreen.style.display = "none"; // Close the Add screen after submission
                    } else {
                        // Location is not in Berlin, show error
                        alert("Die angegebene Location muss in Berlin liegen. Andere Bundesländer werden nicht akzeptiert.");
                    }
                } else {
                    // Location does not exist or postcode mismatch, show error
                    alert("Die angegebene Location konnte nicht gefunden werden oder die PLZ stimmt nicht überein. Bitte überprüfen Sie die Adresse.");
                }
            })
            .catch(error => {
                // Error occurred in fetching geocoding data
                console.error("Fehler bei der Geocoding-Anfrage:", error);
                alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
            });
    });

// Locations logic: Open update screen when a location is clicked
locationList.addEventListener("click", function (event) {
    let button = event.target.closest('button');
    //if (event.target.tagName === "BUTTON") {
    if (button) {
        // Save the clicked location to the selectedLocation variable
        selectedLocation = event.target;
        const locationId = button.getAttribute('data-id');
        updateDeleteScreen.setAttribute('data-id', locationId);
        console.log('Location selected with ID: ', locationId);

        // Extract the location details from the selected location
        const locationName = selectedLocation.querySelector("strong") ? selectedLocation.querySelector("strong").nextSibling.textContent.trim() : '';
        const description = selectedLocation.querySelector("strong:nth-of-type(1)") ? selectedLocation.querySelector("strong:nth-of-type(1)").nextSibling.textContent.trim() : '';
        const street = selectedLocation.querySelector("strong:nth-of-type(2)") ? selectedLocation.querySelector("strong:nth-of-type(2)").nextSibling.textContent.trim() : '';
        const zip = selectedLocation.querySelector("strong:nth-of-type(3)")? selectedLocation.querySelector("strong:nth-of-type(3)").nextSibling.textContent.trim() : '';
        const tags = selectedLocation.querySelector("strong:nth-of-type(4)")? selectedLocation.querySelector("strong:nth-of-type(4)").nextSibling.textContent.trim().split(", ") : '';
        const subtag = selectedLocation.querySelector("strong:nth-of-type(5)")? selectedLocation.querySelector("strong:nth-of-type(5)").nextSibling.textContent.trim() : '';
        const latitude = selectedLocation.querySelector("strong:nth-of-type(6)")? selectedLocation.querySelector("strong:nth-of-type(6)").nextSibling.textContent.trim() : '';
        const longitude = selectedLocation.querySelector("strong:nth-of-type(7)")? selectedLocation.querySelector("strong:nth-of-type(7)").nextSibling.textContent.trim() : '';
        const imageSrc = selectedLocation.querySelector("img").getAttribute("src");
        // Populate the update screen with the selected location details
        updateDeleteScreen.querySelector("#locationName").value = locationName;
        //updateDeleteScreen.querySelector("#description").value = description;
        updateDeleteScreen.querySelector("#street").value = street;
        updateDeleteScreen.querySelector("#zip").value = zip;
        updateDeleteScreen.querySelector("#city").value = "Berlin"; // Since city is fixed as "Berlin" 
        updateDeleteScreen.querySelector("#subtags").value = subtag;
        updateDeleteScreen.querySelector("#updateIMG").src = imageSrc;
        updateDeleteScreen.querySelector("#updateIMG").alt = `${locationName} Image`;
        // Populate longitude and latitude as readonly
        updateDeleteScreen.querySelector("#longitude").value = longitude;
        updateDeleteScreen.querySelector("#latitude").value = latitude;

        // Update the image in the update screen
        // Populate tags checkboxes
        const checkboxes = updateDeleteScreen.querySelectorAll("input[name='tags']");
        checkboxes.forEach(checkbox => {
            if (tags.includes(checkbox.value)) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        });

        // Show the update screen
        updateDeleteScreen.style.display = "flex";
    }
});



// Update button logic
const updateButton = updateDeleteScreen.querySelector("input[value='update']");
updateButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the form from submitting

    const locationId = updateDeleteScreen.getAttribute('data-id');
    // Perform the Geocoding update process
    const locationName = updateDeleteScreen.querySelector("#locationName").value;
    const street = updateDeleteScreen.querySelector("#street").value;
    const zip = updateDeleteScreen.querySelector("#zip").value;
    const city = updateDeleteScreen.querySelector("#city").value;
    const description = updateDeleteScreen.querySelector("#description").value; // Description
    const subtag = updateDeleteScreen.querySelector("#subtags").value; // Subtag

    // Get the uploaded image
    const updateIMG = document.getElementById("updateIMG").src;

    // Get selected tags
    const selectedTags = Array.from(updateDeleteScreen.querySelectorAll("input[name='tags']:checked")).map(tag => tag.value);

    const fullAddress = `${street}, ${city}, ${zip}`;

    const geocodingUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&addressdetails=1`;

    fetch(geocodingUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0 && data[0].address && data[0].address.postcode === zip) {
                const address = data[0].address;
                if (address.city === "Berlin" || address.state === "Berlin") {
                    const lat = parseFloat(data[0].lat).toFixed(8);
                    const lon = parseFloat(data[0].lon).toFixed(8);

                    // Update the location in the list
                    selectedLocation.innerHTML = `
                        <img src="${updateIMG}" alt="${locationName} Image"><br>
                        <strong>Location</strong> ${locationName}<br>
                        <strong>Straße</strong> ${street}<br>
                        <strong>PLZ</strong> ${zip}<br>
                        <strong>Tags</strong> ${selectedTags.join(", ")}<br>
                        <strong>Subtags</strong> ${subtag}<br>
                        <strong>Longitude</strong> ${lon}<br>
                        <strong>Latitude</strong> ${lat}<br>
                        <strong>Description</strong> ${description}<br>
                    `;

                    const updateData = {
                        location: locationName,
                        description: description,
                        straße: street,
                        plz: zip,
                        tags: selectedTags,
                        subtags: subtag,
                        longitude: lon,
                        latitude: lat,
                    };
                    
                    // POST request to server to add location
                    fetch(`http://localhost:8000/loc/${locationId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updateData)
                    })
                    .then(res => res.json())
                    .then(result => {
                        console.log('Location changed successfully in database');
                        addScreen.style.display = "none"; // Close the Add screen after submission
                    })
                    .catch(error => {
                        console.error("Error changing location:", error);
                        alert("Error changing location. Try Later");
                    });

                    updateDeleteScreen.style.display = "none"; // Close the update screen after updating
                } else {
                    alert("Die angegebene Location muss in Berlin liegen. Andere Bundesländer werden nicht akzeptiert.");
                }
            } else {
                alert("Die angegebene Location konnte nicht gefunden werden oder die PLZ stimmt nicht überein. Bitte überprüfen Sie die Adresse.");
            }
        })
        .catch(error => {
            console.error("Fehler bei der Geocoding-Anfrage:", error);
            alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
        });
});

const deleteButton = updateDeleteScreen.querySelector("input[value='delete']");
deleteButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission

    const locationId = updateDeleteScreen.getAttribute('data-id');

    if (locationId) {
        // Perform the DELETE request to the backend
        fetch(`http://localhost:8000/loc/${locationId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete location');
            }
            return response.json();
        })
        .then(data => {
            console.log('Location sucessfully deleted from database');

            const listItem = selectedLocation.closest("li"); // Find the parent <li>
            if (listItem) {
                listItem.remove(); // Remove the <li> element
                updateDeleteScreen.style.display = "none"; // Close the update screen
                selectedLocation = null; // Clear the selected location reference
            } else {
                console.error("List item not found.");
            }
        })
        .catch(error => {
            console.error("Error deleting location:", error);
            alert("Error deleting location. Try again later.");
        });
    } else {
        console.error("No location selected for deletion or locationId missing.");
    }
});

    // Cancel button logic
    const cancelButton = updateDeleteScreen.querySelector("input[value='cancel']");
    cancelButton.addEventListener("click", function (event) {
        event.preventDefault();
        updateDeleteScreen.style.display = "none"; // Close the update screen
    });

    document.getElementById("uploadButton").addEventListener("change", function (event) {
        const file = event.target.files[0]; // Get the selected file
    
        if (file) {
            const reader = new FileReader(); // Create a FileReader to read the file
    
            reader.onload = function (e) {
                // Set the preview image src to the file's data URL
                document.getElementById("previewIMG").src = e.target.result;
            };
    
            reader.readAsDataURL(file); // Read the file as a data URL
        } else {
            // If no file is selected, reset the preview image
            document.getElementById("previewIMG").src = "";
        }
    });
    
    // Handle image upload in the Update Screen
document.querySelector("#update-delete-screen #uploadButton").addEventListener("change", function (event) {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
        const reader = new FileReader(); // Create a FileReader to read the file

        reader.onload = function (e) {
            // Set the update image src to the file's data URL
            const updateIMG = document.getElementById("updateIMG");
            updateIMG.src = e.target.result; // Update the image source
            updateIMG.alt = "Uploaded Image Preview"; // Update the alt text
        };

        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        // If no file is selected, reset the update image to a default state
        const updateIMG = document.getElementById("updateIMG");
        updateIMG.src = "default.png"; // Replace "default.png" with your default image path
        updateIMG.alt = "Default Image";
    }
});

});

