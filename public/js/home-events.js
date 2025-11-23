document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("event-preview-container");

  try {
    const res = await fetch("/events/preview");
    const data = await res.json();

    if (!data.success) {
      container.innerHTML = "Failed to load events.";
      return;
    }

    const html = data.events.map(ev => `
      <div class="event-card">
        <div class="event-date">${ev.date}</div>
        <div class="event-title">${ev.title}</div>
        <div class="event-desc">${ev.description}</div>
      </div>
    `).join("");

    container.innerHTML = html || "No upcoming events.";
  } catch (err) {
    console.error(err);
    container.innerHTML = "Error loading events.";
  }
});
