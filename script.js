let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

const alarm = document.getElementById("alarmSound");
const stopBtn = document.getElementById("stopBtn");

// Enable alarm after first user click
document.addEventListener("click", () => {
    alarm.play().then(() => {
        alarm.pause();
        alarm.currentTime = 0;
    }).catch(() => {});
}, { once: true });

// LIVE TIME WITH SECONDS
function updateTime() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');

    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;

    const timeBox = document.getElementById("currentTime");
    if (timeBox) {
        timeBox.innerHTML =
            `<b>Current Time:</b> ${timeString}<br><b>Date:</b> ${now.toDateString()}`;
    }
}
setInterval(updateTime, 1000);
updateTime();

// ADD MEDICINE
function addMedicine() {
    const name = document.getElementById("medName").value;
    const timeInput = document.getElementById("medTime").value;
    const day = document.getElementById("medDay").value;

    if (!name || !timeInput) {
        alert("Please fill all details");
        return;
    }

    let [hours, minutes] = timeInput.split(":");
    hours = parseInt(hours);

    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedTime = hours + ":" + minutes + " " + ampm;

    medicines.push({ name, time: formattedTime, day, taken: false });
    localStorage.setItem("medicines", JSON.stringify(medicines));

    displayMedicines();

    document.getElementById("medName").value = "";
    document.getElementById("medTime").value = "";
}

// DISPLAY MEDICINES
function displayMedicines() {
    const list = document.getElementById("medicineList");
    list.innerHTML = "";

    medicines.forEach((med, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${med.name}</strong><br>
            ${med.time} - ${med.day}<br>
            Status: ${med.taken ? "Taken" : "Pending"}<br>
            <button onclick="markTaken(${index})">Taken</button>
            <button onclick="deleteMedicine(${index})">Delete</button>
        `;
        list.appendChild(li);
    });
}

// DELETE
function deleteMedicine(index) {
    medicines.splice(index, 1);
    localStorage.setItem("medicines", JSON.stringify(medicines));
    displayMedicines();
}

// MARK TAKEN
function markTaken(index) {
    medicines[index].taken = true;
    localStorage.setItem("medicines", JSON.stringify(medicines));
    displayMedicines();
}

// ALARM & NOTIFICATION
setInterval(() => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes().toString().padStart(2, '0');

    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    const currentTime = hours + ":" + minutes + " " + ampm;

    medicines.forEach((med, index) => {
        if (!med.taken && med.time === currentTime) {

            if (alarm) {
                alarm.currentTime = 0;
                alarm.loop = true;
                alarm.volume = 0.5; // gentle ring
                alarm.play();
            }

            if (Notification.permission === "granted") {
                new Notification("Time to take " + med.name);
            }

            // Auto mark taken
            medicines[index].taken = true;
            localStorage.setItem("medicines", JSON.stringify(medicines));

            stopBtn.style.display = "block";
        }
    });
}, 1000);

function stopAlarm() {
    if (alarm) {
        alarm.pause();
        alarm.currentTime = 0;
        stopBtn.style.display = "none";
    }
}

// REQUEST NOTIFICATION
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// INITIAL LOAD
displayMedicines();
function showFullScreenAlert(medName) {
    const existing = document.getElementById("fullScreenAlert");
    if (existing) existing.remove();

    const div = document.createElement("div");
    div.id = "fullScreenAlert";
    div.style.position = "fixed";
    div.style.top = 0;
    div.style.left = 0;
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.backgroundColor = "rgba(0,0,0,0.85)";
    div.style.color = "white";
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.fontSize = "30px";
    div.style.zIndex = 9999;
    div.innerHTML = `
        <div style="text-align:center">
            <p>Time to take <b>${medName}</b></p>
            <button onclick="this.parentElement.parentElement.remove(); stopAlarm();" style="padding:15px 30px; font-size:20px; margin-top:20px;">OK</button>
        </div>
    `;
    document.body.appendChild(div);
}