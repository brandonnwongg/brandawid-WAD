document.addEventListener("DOMContentLoaded", function () {
    const loginScreen = document.getElementById("login-screen");
    const mainScreen = document.getElementById("main-screen");
    const mainContainer = mainScreen.querySelector(".main-container");
    const loginForm = document.getElementById("loginForm");
    const loginButton = document.getElementById("loginMainButton");
    const headerText = mainScreen.querySelector("h1");
    const addScreen = document.getElementById("add-screen");
    const addButton = document.getElementById("adminAddButton");
    const updateButton = document.getElementById("updateButton");
    const updateDeleteScreen = document.getElementById("update-delete-screen");

    const locationList = document.getElementById("loaction-list");

    const users = [
        { username: "admina", password: "password", role: "admin", name: "Mina" },
        { username: "normalo", password: "password", role: "non-admin", name: "Norman" }
    ];

    let isLoggedIn = false;
    let currentUser = null;

    addButton.style.display = "none";
    updateButton.style.display = "none"; // Initially hide the update button
    updateDeleteScreen.style.display = "none"; // Hide the update screen initially

    // Show the login screen and blur the main-container on page load
    if (!isLoggedIn) {
        loginScreen.style.display = "flex"; // Show login overlay
        mainContainer.classList.add("blurred"); // Apply blur effect to main container
        headerText.textContent = "Bitte Login";
    }

    // Handle login form submission
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("usernameID").value;
        const password = document.getElementById("passwordID").value;

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            isLoggedIn = true;
            loginScreen.style.display = "none";
            mainContainer.classList.remove("blurred");
            currentUser = user;

            if (user.role == "admin") {
                headerText.textContent = "Willkommen zurück, Mina!";
                addButton.style.display = "inline-block";
                updateButton.style.display = "inline-block"; // Show the update button for admin
            } else if (user.role == "non-admin") {
                headerText.textContent = "Willkommen zurück, Norman!";
                addButton.style.display = "none";
                updateButton.style.display = "none"; // Keep update button hidden for non-admin
            }
            loginButton.value = "LOGOUT";
        } else {
            alert("Wrong username/password. Try again");
        }
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
                            <strong>Location</strong> ${locationName}<br><br>
                            <strong>Straße</strong> ${street}<br><br>
                            <strong>PLZ</strong> ${zip}<br><br>
                            <strong>Tags</strong> ${selectedTags.join(", ")}<br><br>
                            <strong>Subtags</strong> ${subtag}<br><br>
                            <strong>Latitude</strong> ${lat}<br><br>
                            <strong>Longitude</strong> ${lon}
                        `;

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

    // Locations and Update button logic
    const locationButtons = locationList.querySelectorAll("button");

    locationButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            if (currentUser && currentUser.role === "admin") {
                updateButton.style.display = "inline-block"; // Show update button for admin when a location is clicked
            } else {
                updateButton.style.display = "none"; // Hide update button for non-admin
            }
        });
    });

    // Handle the Update button click
    updateButton.addEventListener("click", function () {
        updateDeleteScreen.style.display = "flex"; // Show the update screen
    });

    // Close the Update screen
    const closeButtonUpdate = updateDeleteScreen.querySelector(".close-button");
    closeButtonUpdate.addEventListener("click", function () {
        updateDeleteScreen.style.display = "none"; // Close the update screen
    });
});
