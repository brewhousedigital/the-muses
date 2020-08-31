if(localStorage.getItem("theme") === null) {
    localStorage.setItem("theme", "dark");
}

let darkModeToggle = document.querySelector(".dark-mode-toggle");
let theme = localStorage.getItem("theme");
let body = document.querySelector("body");
body.className = "";

switch (theme) {
    case "light":
        darkModeToggle.innerText = "🌙";
        body.classList.add("light"); break;
    case "dark":
        darkModeToggle.innerText = "☀";
        body.classList.add("dark"); break;
    default:
        darkModeToggle.innerText = "🌙";
        body.classList.add("light");
}


darkModeToggle.addEventListener("click", function() {
    body.className = "";

    switch (theme) {
        case "light":
            darkModeToggle.innerText = "☀";
            localStorage.setItem("theme", "dark");
            body.classList.add("dark"); break;
        case "dark":
            darkModeToggle.innerText = "🌙";
            localStorage.setItem("theme", "light");
            body.classList.add("light"); break;
        default:
            darkModeToggle.innerText = "🌙";
            localStorage.setItem("theme", "light");
            body.classList.add("light");
    }

    theme = localStorage.getItem("theme");
});
