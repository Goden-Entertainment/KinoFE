document.getElementById("signOut").addEventListener("click", function () {
    fetch("http://51.120.3.91:8080/users/logout", { method: "POST" })
        .then(() => {
            localStorage.removeItem("user");
            window.location.href = "index.html";
        });
});