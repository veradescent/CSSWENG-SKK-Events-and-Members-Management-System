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

// --- for custom invites ---
const customCheckbox = document.getElementById("custom");
const customSelect = document.getElementById("customSelect");
const sendAllCheckbox = document.getElementById("sendAll");

customCheckbox.addEventListener("change", () => {
    if (customCheckbox.checked) {
    sendAllCheckbox.checked = false;
    customSelect.style.display = "inline-block";
    } else {
    customSelect.style.display = "none";
    }
});

sendAllCheckbox.addEventListener("change", () => {
    if (sendAllCheckbox.checked) {
    customCheckbox.checked = false;
    customSelect.style.display = "none";
    }
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
    customSelect.style.display = "none";
    uploadedImage = "";
}

// --- Buttons functionality ---
document.getElementById("editBtn").addEventListener("click", async () => {
    const eventId = document.getElementById("eventId")?.value;
    if (!eventId) {
        alert("Missing event id. Cannot save edits.");
        return;
    }

    const payload = {
        title: document.getElementById("eventTitle").value,
        description: document.getElementById("eventDescription").value,
        attendees: document.getElementById("eventAttendees").value,
        type: document.getElementById("eventType").value,
        date: document.getElementById("eventDate").value,
        timeFrom: document.getElementById("eventTimeFrom").value,
        timeTo: document.getElementById("eventTimeTo").value,
    };

    // Basic validation
    if (!payload.title || !payload.date || !payload.timeFrom || !payload.timeTo) {
        alert("Please fill in Title, Date, Time From and Time To.");
        return;
    }

    try {
        const res = await fetch(`/editEvent/${eventId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok) {
            alert("✅ Event updated successfully!");
            window.location.href = "/";
        } else {
            console.error("Update failed:", data);
            alert(data?.message || "Failed to update event.");
        }
    } catch (err) {
        console.error(err);
        alert("An error occurred while updating the event.");
    }
});

document.getElementById("deleteBtn").addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const eventId = document.getElementById("eventId")?.value;
    if (!eventId) {
        alert("Missing event id. Cannot delete.");
        return;
    }

    try {
        const res = await fetch(`/editEvent/${eventId}`, { method: "DELETE" });
        if (res.ok) {
            alert("🗑️ Event deleted successfully!");
            window.location.href = "/";
        } else {
            const text = await res.text();
            alert("Failed to delete event: " + text);
        }
    } catch (err) {
        console.error(err);
        alert("An error occurred while deleting the event.");
    }
});

document.getElementById("cancelBtn").addEventListener("click", () => {
    if (confirm("Cancel and return to homepage?")) {
        window.location.href = "/";
    }
});
