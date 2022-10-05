// time input fields
let chkStartNow = document.getElementById("chkStartNow");
let chkStartPm = document.getElementById("chkStartPm");
let chkEndPm = document.getElementById("chkEndPm");
let inpStartHour = document.getElementById("inpStartHour");
let inpEndHour = document.getElementById("inpEndHour");
let inpStartMinute = document.getElementById("inpStartMinute");
let inpEndMinute = document.getElementById("inpEndMinute");

// option fields
let chkTheme = document.getElementById("chkTheme");
let inpColor = document.getElementById("inpColor");

// other elements
let htmlBody = document.getElementById("body");

// storage functions
function applyTheme() {
    chrome.storage.sync.get(["isDarkTheme"], ({ isDarkTheme }) => {
        if (isDarkTheme) {
            if (isDarkTheme === "y") {
                htmlBody.classList.remove("light");
                htmlBody.classList.add("dark");
                chkTheme.checked = true;
            } else {
                htmlBody.classList.remove("dark");
                htmlBody.classList.add("light");
                chkTheme.checked = false;
            }
        }
    });
}
function setTheme() {
    let isDarkTheme = chkTheme.checked;
    chrome.storage.sync.set({isDarkTheme: isDarkTheme ? "y" : "n"}, () => {
        console.log("Theme updated: Dark theme " + isDarkTheme);
    });
    if (isDarkTheme) {
        htmlBody.classList.remove("light");
        htmlBody.classList.add("dark");
    } else {
        htmlBody.classList.remove("dark");
        htmlBody.classList.add("light");
    }
}
function applyColor() {
    chrome.storage.sync.get(["color"], ({ color }) => {
        if (color) {
            inpColor.value = color;
        }
    });
}
function setColor() {
    let color = inpColor.value; // format: #123456
    chrome.storage.sync.set({color: color}, () => {
        console.log("Color saved to " + color);
    });
}

// event listeners
inpColor.addEventListener("change", () => {
    setColor();
});
chkTheme.addEventListener("click", () => {
    setTheme();
});

// initialization
applyTheme();
applyColor();