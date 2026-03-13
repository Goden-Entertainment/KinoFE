document.getElementById("signOut").addEventListener("click", function () {
    fetch("http://localhost:8080/users/logout", { method: "POST" })
        .then(() => {
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
});