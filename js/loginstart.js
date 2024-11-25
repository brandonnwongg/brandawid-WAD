document.addEventListener("DOMContentLoaded", function () {
    const loginScreen = document.getElementById("login-screen");
    const mainScreen = document.getElementById("main-screen");
    const mainContainer = mainScreen.querySelector(".main-container"); 
    const loginForm = document.getElementById("loginForm");
    const loginButton = document.getElementById("loginMainButton");
    const headerText = mainScreen.querySelector("h1"); 
    const addScreen = document.getElementById("add-screen");
    const addButton = document.getElementById("adminAddButton");

    const users = [
        { username: "admina", password: "password", role: "admin", name: "Mina" },
        { username: "normalo", password: "password", role: "non-admin", name: "Norman" }
    ];

    let isLoggedIn = false;
    let currentUser = null;

    addButton.style.display = "none";

    // Show the login screen and blur the main-container on page load
    if (!isLoggedIn) {
        loginScreen.style.display = "flex"; // Show login overlay
        mainContainer.classList.add("blurred"); // Apply blur effect to main container
        headerText.textContent = "Bitte Login";
    }

    // Handle login form submission
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        const username = document.getElementById("usernameID").value;
        const password = document.getElementById("passwordID").value;

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            isLoggedIn = true; 
            loginScreen.style.display = "none";
            mainContainer.classList.remove("blurred"); // Remove blur effect
            currentUser = user;

            if (user.role == "admin") {
            headerText.textContent = "Willkommen zurück, Mina!";
            addButton.style.display = "inline-block";
            } else if (user.role == "non-admin") {
            headerText.textContent = "Willkommen zurück, Norman!";
            addButton.style.display = "none";
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

    //Add button for admin
    addButton.addEventListener("click", function () {
        console.log("Add button clicked. Current user:", currentUser);
        if (currentUser && currentUser.role === "admin") {
            addScreen.style.display = "flex"; // Show the Add screen
            console.log("Add screen shown");
        } else {
            alert("You do not have permission to access this feature.");
        }
    });

    // Close the Add screen
    const closeButtonAdd = document.getElementById("closeButtonAddScreen")
    const closeButtonAddUpper = addScreen.querySelector(".close-button-add");
    closeButtonAdd.addEventListener("click", function () {
        addScreen.style.display = "none";
        console.log("Add screen closed");
    });
    closeButtonAddUpper.addEventListener("click", function () {
        addScreen.style.display = "none";
        console.log("Add screen closed");
    });

    const firstLocationButton = document.getElementById("firstLocation");
    const updateDeleteScreen = document.getElementById("update-delete-screen");
    const closeButtonFirstLocation = updateDeleteScreen.querySelector(".close-button");

});