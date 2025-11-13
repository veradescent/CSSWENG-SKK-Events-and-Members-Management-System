document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ calendarApp.js loaded");
  const containerRef = document.getElementById("calendar-app");
  if (!containerRef) {
    console.error("❌ Missing #calendar-app container!");
    return;
  }

  // Fetch events from backend (API)
  async function fetchEvents(startDate, endDate) {
    const url = `/api/events?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) {
            console.error("Failed to load events");
            return [];
        }

        return data.events; // array of events from API
    } catch (err) {
        console.error("Fetch error:", err);
        return [];
    }
  }

  // Handlebars templates
  const monthViewTemplate = Handlebars.compile(`
    <div class="grid grid-cols-7 bg-[#7CB342]">
      {{#each weekDays}}
        <div class="py-3 text-center border-r border-gray-400 last:border-r-0 font-semibold text-gray-900">{{this}}</div>
      {{/each}}
    </div>
    {{#each weeks}}
      <div class="grid grid-cols-7">
        {{#each this}}
          <div 
            class="calendar-day border-r border-b border-gray-400 p-3 h-24 relative cursor-pointer hover:bg-opacity-80 transition-colors {{bgClass}}" 
            data-year="{{year}}" data-month="{{month}}" data-day="{{day}}">
            <span class="{{textClass}}">{{day}}</span>
            {{#if events.length}}
              <div class="mt-1 space-y-1">
                {{#each events}}
                  <div class="event-badge bg-[#7CB342] text-white px-2 py-0.5 rounded text-xs inline-block cursor-pointer hover:bg-[#689F38] transition-colors truncate" data-event-id="{{id}}">
                    {{title}}
                  </div>
                {{/each}}
              </div>
            {{/if}}
          </div>
        {{/each}}
      </div>
    {{/each}}
  `);

  // state
  let currentDate = new Date();
  let currentView = "month";
  const weekDays = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // events will be loaded from backend; structure: { id, title, description, startISO, endISO, date: Date, time }
  let events = [];

  const isToday = (y, m, d) => {
    const t = new Date();
    return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
  };

  // get events for a specific day (matching by start date)
  const getEventsForDay = (y, m, d) =>
    events.filter(e => {
      if (!e.date) return false;
      return e.date.getFullYear() === y && e.date.getMonth() === m && e.date.getDate() === d;
    });

  const getMonthData = date => {
    const y = date.getFullYear(), m = date.getMonth();
    return {
      firstDay: new Date(y, m, 1).getDay(),
      daysInMonth: new Date(y, m + 1, 0).getDate(),
      daysInPrevMonth: new Date(y, m, 0).getDate(),
      y, m
    };
  };

  // renderMonthView remains synchronous; it uses `events` array already populated
  function renderMonthView() {
    const { firstDay, daysInMonth, daysInPrevMonth, y, m } = getMonthData(currentDate);
    const weeks = [];
    let dayCounter = 1, nextMonthDay = 1;

    for (let r = 0; r < 5; r++) {
      const week = [];
      for (let c = 0; c < 7; c++) {
        const idx = r * 7 + c;
        if (idx < firstDay) {
          week.push({ day: daysInPrevMonth - firstDay + idx + 1, year: y, month: m - 1, bgClass: "bg-gray-200", textClass: "text-gray-400", events: [] });
        } else if (dayCounter <= daysInMonth) {
          const ev = getEventsForDay(y, m, dayCounter);
          const t = isToday(y, m, dayCounter);
          week.push({ day: dayCounter++, year: y, month: m, bgClass: t ? "bg-blue-100" : "bg-gray-100", textClass: t ? "text-blue-600 font-bold" : "text-gray-800", events: ev });
        } else {
          week.push({ day: nextMonthDay++, year: y, month: m + 1, bgClass: "bg-gray-200", textClass: "text-gray-400", events: [] });
        }
      }
      weeks.push(week);
    }
    return monthViewTemplate({ weeks, weekDays });
  }

  // render is async so we can fetch events first
  async function render() {
    const cal = document.getElementById("calendar-container");
    if (!cal) {
      console.error("❌ Missing #calendar-container element!");
      return;
    }
    const name = monthNames[currentDate.getMonth()];
    const display = document.getElementById("display-text");
    if (display) display.textContent = `${name} ${currentDate.getFullYear()}`;

    // build start & end range for current month in YYYY-MM-DD format
    const { daysInMonth } = getMonthData(currentDate);
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth() + 1; // 1-based month
    const start = `${y}-${String(m).padStart(2, '0')}-01`;
    const end = `${y}-${String(m).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    // fetch events for the month and convert to Date objects
    try {
      const fetched = await fetchEvents(start, end);
      // API returns events with fields: id, title, description, start (Manila ISO), end (Manila ISO), etc.
      events = fetched.map(ev => {
        // Prefer ev.start (string). Convert to Date safely.
        const startISO = ev.start || ev.startUTC || ev.startDateTime || ev.start; // defensive
        const parsedDate = startISO ? new Date(startISO) : null;
        // build a simple time string for display (if start present)
        let time = "";
        if (parsedDate && ev.end) {
          const endDate = new Date(ev.end);
          // show times in local time; adjust as needed
          time = `${parsedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        } else if (parsedDate) {
          time = parsedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
        return {
          id: ev.id || ev._id,
          title: ev.title || ev.eventName || 'Untitled',
          description: ev.description || ev.eventDescription || '',
          startISO,
          endISO: ev.end || ev.endUTC || ev.endDateTime || null,
          date: parsedDate,
          time
        };
      });
    } catch (err) {
      console.error("Could not load events for month:", err);
      events = [];
    }

    cal.innerHTML = renderMonthView();
    attachEventListeners();
    console.log("📅 Calendar rendered successfully");
  }

  function attachEventListeners() {
    document.querySelectorAll(".calendar-day").forEach(el => {
      el.addEventListener("click", () => {
        const y = +el.dataset.year, m = +el.dataset.month, d = +el.dataset.day;
        showCreateDialog(new Date(y, m, d));
      });
    });
    document.querySelectorAll(".event-badge").forEach(el => {
      el.addEventListener("click", e => {
        e.stopPropagation();
        const ev = events.find(ev => String(ev.id) === String(el.dataset.eventId));
        if (ev) showEventDialog(ev);
      });
    });
  }

  function showEventDialog(event) {
    const modal = document.getElementById("event-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.querySelector("#event-title").textContent = event.title;
    modal.querySelector("#event-date").textContent = event.date ? event.date.toDateString() : "TBD";
    modal.querySelector("#event-time").textContent = event.time || "TBD";
    modal.querySelector("#event-description").textContent = event.description || "";
  }

  function showCreateDialog(date) {
    const modal = document.getElementById("create-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.dataset.date = date;
    modal.querySelector("#create-date").textContent = date.toDateString();
  }
async function normalizeTimeRange(timeStr) {
  const parts = timeStr.split('-').map(p => p.trim());
  function to24(s) {
    const d = new Date(`1970-01-01 ${s}`);
    if (!isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    }
    if (/^\d{1,2}:\d{2}$/.test(s)) return s;
    return null;
  }
  return {
    from: to24(parts[0]),
    to: parts[1] ? to24(parts[1]) : null
  };
}

async function handleCreateEventClick() {
  const modal = document.getElementById('create-modal');
  const titleEl = document.getElementById('new-event-title');
  const timeEl = document.getElementById('new-event-time');
  const descEl = document.getElementById('new-event-description');
  const imgInput = document.getElementById('new-event-image');

  let selectedDate = new Date(modal.dataset.date);
  if (isNaN(selectedDate.getTime())) selectedDate = new Date();
  const yyyy = selectedDate.getFullYear();
  const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const dd = String(selectedDate.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const title = titleEl.value.trim();
  const timeRaw = timeEl.value.trim();
  const desc = descEl.value.trim();

  if (!title) return alert('Please enter a title.');

  const times = await normalizeTimeRange(timeRaw);

  // 1) Upload image if present
  let imagePath = null;
  if (imgInput && imgInput.files && imgInput.files.length > 0) {
    const fd = new FormData();
    fd.append('image', imgInput.files[0]);
    const resUpload = await fetch('/api/upload-image', {
      method: 'POST',
      body: fd
    });
    const jUpload = await resUpload.json();
    if (!jUpload.success) return alert("Image upload failed: " + (jUpload.message || 'Server error'));
    imagePath = jUpload.path;
  }

  // 2) Create the event
  const payload = {
    title,
    description: desc,
    date: dateStr,
    timeFrom: times.from || "00:00",
    timeTo: times.to || "23:59",
    expectedAttendees: 0,
    type: "General",
    imagePath
  };

  const resEvent = await fetch('/api/events', {
    method: 'POST',
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });

  const jEvent = await resEvent.json();
  if (!jEvent.success) return alert("Event creation failed: " + (jEvent.message || 'Server error'));

  alert("Event created!");
  modal.classList.add('hidden');

  titleEl.value = "";
  timeEl.value = "";
  descEl.value = "";
  if (imgInput) imgInput.value = "";
  const preview = document.getElementById("new-event-image-preview");
  if (preview) preview.classList.add("hidden");

  await render();
}

// Bind create button
const createBtn = document.getElementById('create-event-btn');
if (createBtn) {
  createBtn.onclick = (e) => { e.preventDefault(); handleCreateEventClick(); };
}

// Image preview
const imgInputEl = document.getElementById('new-event-image');
if (imgInputEl) {
  imgInputEl.addEventListener('change', () => {
    const preview = document.getElementById('new-event-image-preview');
    if (!imgInputEl.files || !imgInputEl.files[0]) {
      preview.classList.add('hidden');
      return;
    }
    preview.src = URL.createObjectURL(imgInputEl.files[0]);
    preview.classList.remove('hidden');
  });
}
  document.getElementById("prev-btn").onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); render(); };
  document.getElementById("next-btn").onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); render(); };
  document.querySelectorAll(".view-btn").forEach(b => b.addEventListener("click", () => { currentView = b.dataset.view; render(); }));
  document.getElementById("close-event-modal").onclick = () => document.getElementById("event-modal").classList.add("hidden");
  document.getElementById("close-create-modal").onclick = () => document.getElementById("create-modal").classList.add("hidden");
  document.getElementById("cancel-create-btn").onclick = () => document.getElementById("create-modal").classList.add("hidden");

  // initial render
  render();
});
