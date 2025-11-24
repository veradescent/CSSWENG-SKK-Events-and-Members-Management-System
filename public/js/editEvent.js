(function () {
    let uploadedImage = "";

    // --- Image Upload ---
    const editImageBtn = document.getElementById("editImageBtn");
    const eventImageInput = document.getElementById("eventImage");
    const imagePreview = document.getElementById("imagePreview");
    if (editImageBtn && eventImageInput) {
        editImageBtn.addEventListener("click", () => eventImageInput.click());

        eventImageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (imagePreview) {
                        imagePreview.style.backgroundImage = `url('${event.target.result}')`;
                        imagePreview.style.backgroundSize = "cover";
                        imagePreview.style.backgroundPosition = "center";
                        imagePreview.textContent = "";
                    }
                    uploadedImage = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- for custom invites ---
    const customCheckbox = document.getElementById("custom");
    const customSelect = document.getElementById("customSelect");
    const sendAllCheckbox = document.getElementById("sendAll");
    if (customCheckbox) {
        customCheckbox.addEventListener("change", () => {
            if (customCheckbox.checked) {
                if (sendAllCheckbox) sendAllCheckbox.checked = false;
                if (customSelect) customSelect.style.display = "inline-block";
            } else {
                if (customSelect) customSelect.style.display = "none";
            }
        });
    }
    if (sendAllCheckbox) {
        sendAllCheckbox.addEventListener("change", () => {
            if (sendAllCheckbox.checked) {
                if (customCheckbox) customCheckbox.checked = false;
                if (customSelect) customSelect.style.display = "none";
            }
        });
    }
    
    // --- Buttons functionality ---
    const editBtn = document.getElementById("editBtn");
    if (editBtn) {
        editBtn.addEventListener("click", async () => {
            const eventId = document.getElementById("eventId")?.value;
            if (!eventId) {
                alert("Missing event id. Cannot save edits.");
                return;
            }

            const payload = {
                title: document.getElementById("eventTitle")?.value || '',
                description: document.getElementById("eventDescription")?.value || '',
                attendees: document.getElementById("eventAttendees")?.value || 0,
                type: document.getElementById("eventType")?.value || '',
                date: document.getElementById("eventDate") ? document.getElementById("eventDate").value : '',
                timeFrom: document.getElementById("eventTimeFrom") ? document.getElementById("eventTimeFrom").value : '',
                timeTo: document.getElementById("eventTimeTo") ? document.getElementById("eventTimeTo").value : '',
            };

            // If datetime-local inputs exist, prefer them and split into date/time parts
            const startEl = document.getElementById('startDateTime');
            const endEl = document.getElementById('endDateTime');
            if (startEl && startEl.value) {
                const parts = startEl.value.split('T');
                payload.date = parts[0] || payload.date;
                payload.timeFrom = parts[1] || payload.timeFrom;
            }
            if (endEl && endEl.value) {
                const parts = endEl.value.split('T');
                payload.timeTo = parts[1] || payload.timeTo;
            }

            // Basic validation
            if (!payload.title || !payload.date || !payload.timeFrom || !payload.timeTo) {
                alert("Please fill in Title, Start and End date/time fields.");
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
    }

    const deleteBtn = document.getElementById("deleteBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
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
    }

    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            if (confirm("Cancel and return to homepage?")) {
                window.location.href = "/";
            }
        });
    }
})();
