const monthYear = document.getElementById("monthYear");
const dates = document.getElementById("dates");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentDate = new Date();

dates.innerHTML = '';

function renderCalendar() {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();

    let datesHTML = '';

    let dateCols = '';
    let dateRow = '';
    let colCount = 0;

    monthYear.textContent = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    for(let i = firstDayIndex; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 0 - i + 1);
        dateCols += `<div class="border col">${prevDate.getDate()}</div>`;
        colCount++;
        if(colCount === 7) {
            dateRow = `<div class="row">${dateCols}</div>`;
            datesHTML += dateRow;
            colCount = 0;
            dateCols = '';
        }
    }

    for(let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        dateCols += `<div class="border col">${i}</div>`;
        colCount++;
        if(colCount === 7) {
            dateRow = `<div class="row">${dateCols}</div>`;
            datesHTML += dateRow;
            colCount = 0;
            dateCols = '';
        }
    }

    for(let i = 1; i <= 7 - lastDayIndex; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        dateCols += `<div class="border col">${nextDate.getDate()}</div>`;
        colCount++;
        if(colCount === 7) {
            dateRow = `<div class="row">${dateCols}</div>`;
            datesHTML += dateRow;
            colCount = 0;
            dateCols = '';
        }
    }

    dates.innerHTML = datesHTML;
}

prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();