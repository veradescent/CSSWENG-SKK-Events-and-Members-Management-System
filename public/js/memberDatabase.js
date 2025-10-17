document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.querySelector("table tbody");
    const addBtn = document.getElementById("addBtn");
    const editBtn = document.getElementById("editBtn");
    const removeBtn = document.getElementById("removeBtn");
    const popup = document.getElementById("popupForm");
    const form = document.getElementById("memberForm");
    const cancelBtn = document.getElementById("cancelBtn");
    const popupTitle = document.getElementById("popupTitle");

    let selectedRow = null;
    let selectedId = null;
    let isEditing = false;

    tableBody.addEventListener("click", function(e) {
        const row = e.target.closest("tr");
        if (!row) return;
        if (selectedRow) selectedRow.classList.remove("table-active");
        selectedRow = row;
        selectedId = row.getAttribute("data-id"); //Mongo ID

        selectedRow.classList.add("table-active");

    });

    addBtn.addEventListener("click", function() {
        isEditing = false;
        form.reset();
        popupTitle.textContent = "Add Member";
        popup.style.display = "flex";
    });

    editBtn.addEventListener("click", function() {
        if (!selectedRow) {
            alert("Please select a row to edit.");
            return;
        }
        isEditing = true;
        popupTitle.textContent = "Edit Member";
        document.getElementById("name").value = selectedRow.cells[0].textContent;
        document.getElementById("area").value = selectedRow.cells[1].textContent;
        document.getElementById("sim").value = selectedRow.cells[2].textContent;
        document.getElementById("contact").value = selectedRow.cells[3].textContent;
        document.getElementById("email").value = selectedRow.cells[4].textContent;
        popup.style.display = "flex";
    });

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const area = document.getElementById("area").value.trim();
        const sim = document.getElementById("sim").value.trim();
        const contact = document.getElementById("contact").value.trim();
        const email = document.getElementById("email").value.trim();

        if (isEditing && selectedRow) {
            selectedRow.cells[0].textContent = name;
            selectedRow.cells[1].textContent = area;
            selectedRow.cells[2].textContent = sim;
            selectedRow.cells[3].textContent = contact;
            selectedRow.cells[4].textContent = email;
        } else {
            const newRow = tableBody.insertRow();
            const borderStyle = "border: 5px solid #bfbfc4;";
            const bgStyle = "background-color: #e9ecef;";
            newRow.insertCell(0).setAttribute("style", borderStyle + bgStyle);
            newRow.insertCell(1).setAttribute("style", borderStyle + bgStyle);
            newRow.insertCell(2).setAttribute("style", borderStyle + bgStyle);
            newRow.insertCell(3).setAttribute("style", borderStyle + bgStyle);
            newRow.insertCell(4).setAttribute("style", borderStyle + bgStyle);

            newRow.cells[0].textContent = name;
            newRow.cells[1].textContent = area;
            newRow.cells[2].textContent = sim;
            newRow.cells[3].textContent = contact;
            newRow.cells[4].textContent = email;
        }
        popup.style.display = "none";
    });

    removeBtn.addEventListener("click", async function() {
        if (!selectedRow || !selectedId) {
            alert("Please select a member to remove.");
            return;
        }
        if (confirm("Are you sure you want to remove this member?")) {
            // Delete from server (DB)
            const res = await fetch(`/member-database/${selectedId}`, { method: "DELETE" });

            if (res.ok) {
                // Remove from table (frontend)
                selectedRow.remove();
                selectedRow = null;
                selectedId = null;
            } else {
                alert("Failed to delete member.");
            }
        }
    });

    cancelBtn.addEventListener("click", function() {
        popup.style.display = "none";
    });
});
