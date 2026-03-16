var username;
var password;

document.getElementById("KinoFE").addEventListener("submit", function (event) {
    event.preventDefault();

    username = document.getElementById("username").value;
    password = document.getElementById("password").value;

    //

    login();
});

function login() {
    fetch(`${API_URL}/users/login`, {
        method: "POST",
        body: new URLSearchParams({
            username: username,
            password: password
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.username === "August" && data.password === "Admin") {
                window.location.href = "adminProfile.html";
            } else {
                window.location.href = "userProfile.html"
            }
        });



}