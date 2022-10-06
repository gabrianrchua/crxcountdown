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
let btnStartTimer = document.getElementById("btnStartTimer");
let divErrMsg = document.getElementById("divErrMsg");

// other vars
let curTab;
let curColor;

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
            curColor = color;
        }
    });
}
function setColor() {
    curColor = inpColor.value; // format: #123456
    chrome.storage.sync.set({color: curColor}, () => {
        console.log("Color saved to " + curColor);
    });
}
function showError(msg) {
    divErrMsg.innerText = msg;
    setTimeout(() => {
        divErrMsg.innerText = "";
    }, 2000);
}
function startTimerInTab(startTime, endTime, color) {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // if bar already exists, destroy and recreate
    const oldBar = document.querySelector("[crxcountdown='']");
    if (oldBar) {
        clearInterval(parseInt(oldBar.getAttribute("crxcountdown-timer")));
        oldBar.remove();
    }

    const outerBar = document.createElement("div");
    const bar = document.createElement("div");

    // style outer bar
    outerBar.style.backgroundColor = "#777777";
    outerBar.style.position = "fixed";
    outerBar.style.top = 0;
    outerBar.style.left = 0;
    outerBar.style.right = 0;
    outerBar.style.zIndex = 1024;
    outerBar.style.height = "6px";
    outerBar.setAttribute("crxcountdown", "");

    // style inner bar
    let now = new Date();
    let initPercent = ((1 - ((endDate - now) / (endDate - startDate))) * 100) + "%";

    bar.style.backgroundColor = color;
    bar.style.width = initPercent;
    bar.style.height = "100%";
    bar.setAttribute("crxcountdown-bar", "");

    outerBar.appendChild(bar);
    document.body.appendChild(outerBar);

    const interval = setInterval(() => {
        const now = new Date();
        const bar = document.querySelector("[crxcountdown='']");
        const endTime = new Date(parseInt(bar.getAttribute("crxcountdown-end")));
        const startTime = new Date(parseInt(bar.getAttribute("crxcountdown-start")));
        const msGap = endTime - startTime;
        const msNow = endTime - now;
        if (msNow <= 0) {
            // stop timer
            console.log("Timer stopped!");
            clearInterval(parseInt(bar.getAttribute("crxcountdown-timer")));
            bar.remove();
            // display done graphic
            return;
        }
        
        /*const mins = Math.floor((msNow / 1000) / 60);
        const secs = Math.floor((msNow / 1000) % 60);
        const timerString = String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
        */
        
        const percentComplete = (1 - (msNow / msGap)) * 100;
        const percentString = (Math.round(percentComplete * 10) / 10) + "%"
        document.querySelector("[crxcountdown-bar='']").style.width = percentString;
        
        //document.title = timerString + " (" + percentString + ") | CGCountdown";
        //spanPercent.innerText = percentString;
    }, 1000);

    outerBar.setAttribute("crxcountdown-timer", interval);
    outerBar.setAttribute("crxcountdown-start", startDate.getTime());
    outerBar.setAttribute("crxcountdown-end", endDate.getTime());
}

// event listeners
inpColor.addEventListener("change", () => {
    setColor();
});
chkTheme.addEventListener("click", () => {
    setTheme();
});
btnStartTimer.addEventListener("click", () => {
    // gather inputs
    const startNow = chkStartNow.checked;
    const startHour = parseInt(inpStartHour.value);
    const startMinute = parseInt(inpStartMinute.value);
    const startPm = chkStartPm.checked;
    const endHour = parseInt(inpEndHour.value);
    const endMinute = parseInt(inpEndMinute.value);
    const endPm = chkEndPm.checked;

    // validate inputs
    if (!startNow) {
        // validate start time too
        if (Number.isNaN(startHour) || Number.isNaN(startMinute)) {
            showError("The start time fields are invalid or empty!");
            return;
        }
        if (startHour <= 0 || startHour > 12 || startMinute < 0 || startMinute > 59) {
            showError("Start time is out of bounds!");
            return;
        }
    }
    if (Number.isNaN(endHour) || Number.isNaN(endMinute)) {
        showError("The end time fields are invalid or empty!");
        return;
    }
    if (endHour <= 0 || endHour > 12 || endMinute < 0 || endMinute > 59) {
        showError("End time is out of bounds!");
        return;
    }
    
    // ensure end time is after start time
    const now = new Date();
    let startTime, endTime; // Date objects
    if (startNow) {
        startTime = now;
    } else {
        if (startPm && startHour != 12) {
            startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour + 12, startMinute);
        } else {
            startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
        }
    }
    if (endPm && endHour != 12) {
        endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour + 12, endMinute);
    } else {
        endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);
    }
    if (endTime - startTime <= 0) {
        showError("End time must be after start time!");
        return;
    }

    // inject the code
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                func: startTimerInTab,
                args: [startTime.getTime(), endTime.getTime(), curColor]
            }, () => {
                console.log("Timer injected!");
            }
        );
    });
});

// initialization
applyTheme();
applyColor();