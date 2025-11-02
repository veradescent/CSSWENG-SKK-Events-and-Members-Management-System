let uploadedImage = "";

// --- Image Upload ---
document.getElementById("editImageBtn").addEventListener("click", () => {
    document.getElementById("eventImage").click();
});

document.getElementById("eventImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById("imagePreview");
            preview.style.backgroundImage = `url('${event.target.result}')`;
            preview.style.backgroundSize = "cover";
            preview.style.backgroundPosition = "center";
            preview.textContent = "";
            uploadedImage = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// --- Time validation ---
const currentDate = new Date();
currentDate.setMinutes(currentDate.getMinutes() - currentDate.getTimezoneOffset());
const timeFrom = document.getElementById("eventTimeFrom");
const timeTo = document.getElementById("eventTimeTo");

timeTo.addEventListener("change", () => {
    if (timeFrom.value && timeTo.value && timeTo.value <= timeFrom.value) {
        alert("End time must be after start time");
        timeTo.value = "";
    }
});

// --- Custom dropdown checklist functionality ---
const customCheckbox = document.getElementById("custom");
const sendAllCheckbox = document.getElementById("sendAll");
const customDropdownContainer = document.getElementById("customDropdownContainer");
const dropdownToggle = document.getElementById("dropdownToggle");
const dropdownMenu = document.getElementById("dropdownMenu");
const dropdownText = document.getElementById("dropdownText");
const selectedCount = document.getElementById("selectedCount");
const memberCheckboxes = document.querySelectorAll(".member-checkbox");
const dropdownItems = document.querySelectorAll(".dropdown-item-custom");

// Toggle custom dropdown visibility
customCheckbox.addEventListener("change", () => {
    if (customCheckbox.checked) {
        sendAllCheckbox.checked = false;
        customDropdownContainer.style.display = "inline-block";
    } else {
        customDropdownContainer.style.display = "none";
        dropdownMenu.classList.remove("show");
        // Uncheck all member checkboxes
        memberCheckboxes.forEach(cb => cb.checked = false);
        updateDropdownText();
    }
});

sendAllCheckbox.addEventListener("change", () => {
    if (sendAllCheckbox.checked) {
        customCheckbox.checked = false;
        customDropdownContainer.style.display = "none";
        dropdownMenu.classList.remove("show");
    }
});

// Toggle dropdown menu
dropdownToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("show");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (!customDropdownContainer.contains(e.target)) {
        dropdownMenu.classList.remove("show");
    }
});

// Update dropdown text based on selected members
function updateDropdownText() {
    const selected = Array.from(memberCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    if (selected.length === 0) {
        dropdownText.textContent = "Select members";
        selectedCount.textContent = "";
    } else if (selected.length === 1) {
        dropdownText.textContent = selected[0];
        selectedCount.textContent = "";
    } else {
        dropdownText.textContent = selected[0];
        selectedCount.textContent = `+${selected.length - 1} more`;
    }
}

// Handle checkbox changes
memberCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", updateDropdownText);
});

// Make clicking anywhere on the dropdown item toggle the checkbox
dropdownItems.forEach(item => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const checkbox = item.querySelector(".member-checkbox");
        checkbox.checked = !checkbox.checked;

        // Trigger change event to update the display
        checkbox.dispatchEvent(new Event('change'));
    });
});

// Prevent dropdown from closing when clicking inside
dropdownMenu.addEventListener("click", (e) => {
    e.stopPropagation();
});

// --- Used to clear the forms as a func ---
function clearForm() {
    document.querySelectorAll("input, select").forEach(el => {
        if (el.type === "checkbox") el.checked = false;
        else el.value = "";
    });
    const preview = document.getElementById("imagePreview");
    preview.style.backgroundImage = "";
    preview.textContent = "Sample Announcement Image\nand Captions";
    customDropdownContainer.style.display = "none";
    dropdownMenu.classList.remove("show");
    uploadedImage = "";
    updateDropdownText();
}

// --- Get selected members ---
function getSelectedMembers() {
    return Array.from(memberCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
}

const form = document.getElementById('eventForm');

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const eventData = {
        title: document.getElementById("eventTitle").value,
        description: document.getElementById("eventDescription").value,
        attendees: document.getElementById("eventAttendees").value,
        type: document.getElementById("eventType").value,
        date: document.getElementById("eventDate").value,
        timeFrom: document.getElementById("eventTimeFrom").value,
        timeTo: document.getElementById("eventTimeTo").value,
        sendAll: sendAllCheckbox.checked,
        customMembers: customCheckbox.checked ? getSelectedMembers() : [],
        image: uploadedImage
    };

    // console.log(`date: ${eventData.date}`);
    // console.log(`event duration: ${eventData.timeFrom} ~ ${eventData.timeTo}`);

    if (event.date === currentDate.toISOString().split("T")[0]) {
        const now = new Date();
        const [hours, minutes] = selectedTime.split(':');
        const selectedDateTime = new Date();
        selectedDateTime.setHours(hours, minutes, 0, 0);

        if (selectedDateTime < now) {
            alert('Please select a time in the future');
            return;
        }
    }

    const res = await fetch("/addEvent", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
    });

    const data = await res.json();

    if (res.ok) {
        alert(data.message);
    } else {
        console.error("Error: ", data.message);
        alert("Error: ", data.message);
    }

    // 2023-02-18T14:54:28.555Z
    // localStorage.setItem("savedEvent", JSON.stringify(eventData));
    // alert("✅ Event saved successfully!");
    // console.log("Saved event data:", eventData);
    // timeFrom.min = new Date().toLocaleTimeString('en-ph', {hour12: false});
    clearForm();
});

// --- Buttons functionality ---
// document.getElementById("saveBtn").addEventListener("click", async function() {
//     const eventData = {
//         title: document.getElementById("eventTitle").value,
//         description: document.getElementById("eventDescription").value,
//         attendees: document.getElementById("eventAttendees").value,
//         type: document.getElementById("eventType").value,
//         date: document.getElementById("eventDate").value,
//         timeFrom: document.getElementById("eventTimeFrom").value,
//         timeTo: document.getElementById("eventTimeTo").value,
//         sendAll: sendAllCheckbox.checked,
//         customMembers: customCheckbox.checked ? getSelectedMembers() : [],
//         image: uploadedImage
//     };
//
//     // console.log(`date: ${eventData.date}`);
//     // console.log(`event duration: ${eventData.timeFrom} ~ ${eventData.timeTo}`);
//
//     const res = await fetch("/addEvent", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(eventData),
//     });
//
//     const data = await res.json();
//
//     if (res.ok) {
//         alert(data.message);
//     } else {
//         console.error("Error: ", data.message);
//         alert("Error: ", data.message);
//     }
//
//     // 2023-02-18T14:54:28.555Z
//     // localStorage.setItem("savedEvent", JSON.stringify(eventData));
//     // alert("✅ Event saved successfully!");
//     // console.log("Saved event data:", eventData);
//     clearForm();
// });

// document.getElementById("deleteBtn").addEventListener("click", () => {
//     if (confirm("Are you sure you want to delete this event?")) {
//         localStorage.removeItem("savedEvent");
//         alert("🗑️ Event deleted successfully!");
//         clearForm();
//     }
// });

document.getElementById("cancelBtn").addEventListener("click", () => {
    if (confirm("Cancel and clear all fields?")) {
        clearForm();
    }
});

const eventDate = document.getElementById('eventDate');
// eventDate.setMinutes(today.getMinutes() - today.getTimezoneOffset()); // convert to UTC+8
eventDate.min = currentDate.toISOString().split("T")[0];


function updateTimeRestriction() {
    const selectedDate = eventDate.value;
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const todayString = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
    if (selectedDate === todayString) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        eventTimeFrom.min = `${hours}:${minutes}`;
    } else {
        eventTimeFrom.min = '';
    }
}

eventDate.addEventListener('change', updateTimeRestriction);

updateTimeRestriction();
