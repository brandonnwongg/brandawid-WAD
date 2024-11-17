document.addEventListener("DOMContentLoaded", function () {
    const loginScreen = document.getElementById("login-screen");
    const mainScreen = document.getElementById("main-screen");
    const mainContainer = mainScreen.querySelector(".main-container"); 
    const loginForm = document.getElementById("loginForm");
    const headerText = mainScreen.querySelector("h1"); 

    let isLoggedIn = false;

    // Show the login screen and blur the main-container on page load
    if (!isLoggedIn) {
        loginScreen.style.display = "flex"; // Show login overlay
        mainContainer.classList.add("blurred"); // Apply blur effect to main container
        headerText.textContent = "Bitte Login, um Inhalt zu sehen";
    }

    // Handle login form submission
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission
        isLoggedIn = true; 

        // Hide login screen and remove blur from main-container
        loginScreen.style.display = "none";
        mainContainer.classList.remove("blurred"); // Remove blur effect
        headerText.textContent = "Willkommen zurück, User!";
    });
});

