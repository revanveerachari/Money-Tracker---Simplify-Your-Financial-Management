document.getElementById('monkey-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const location = document.getElementById('location').value;
    const count = document.getElementById('count').value;

    addMonkeySighting(date, location, count);

    document.getElementById('monkey-form').reset();
});

document.getElementById('filter-date').addEventListener('input', filterSightings);
document.getElementById('search-location').addEventListener('input', filterSightings);
document.getElementById('clear-filters').addEventListener('click', clearFilters);
document.getElementById('download-pdf').addEventListener('click', downloadPDF);

// Load sightings from localStorage on page load
window.onload = loadSightings;

function addMonkeySighting(date, location, count) {
    const sightings = JSON.parse(localStorage.getItem("sightings")) || [];
    const newSighting = { date, location, count };
    sightings.push(newSighting);
    localStorage.setItem("sightings", JSON.stringify(sightings));
    loadSightings();

    addEventToCalendar(date, location, count);
}

function loadSightings() {
    const sightings = JSON.parse(localStorage.getItem("sightings")) || [];
    const table = document.getElementById('monkey-table').getElementsByTagName('tbody')[0];
    table.innerHTML = ''; // Clear previous rows

    sightings.forEach((sighting, index) => {
        const row = table.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        const cell4 = row.insertCell(3);

        cell1.innerHTML = sighting.date;
        cell2.innerHTML = sighting.location;
        cell3.innerHTML = sighting.count;
        cell4.innerHTML = `<button onclick="editSighting(${index})">Edit</button> <button onclick="deleteSighting(${index})">Delete</button>`;
    });
}

function deleteSighting(index) {
    const sightings = JSON.parse(localStorage.getItem("sightings")) || [];
    sightings.splice(index, 1);
    localStorage.setItem("sightings", JSON.stringify(sightings));
    loadSightings();
}

function editSighting(index) {
    const sightings = JSON.parse(localStorage.getItem("sightings")) || [];
    const sighting = sightings[index];

    document.getElementById('date').value = sighting.date;
    document.getElementById('location').value = sighting.location;
    document.getElementById('count').value = sighting.count;

    deleteSighting(index);
}

function filterSightings() {
    const filterDate = document.getElementById('filter-date').value;
    const searchLocation = document.getElementById('search-location').value.toLowerCase();
    const table = document.getElementById('monkey-table').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const dateCell = rows[i].cells[0].innerText;
        const locationCell = rows[i].cells[1].innerText.toLowerCase();

        if ((filterDate === "" || dateCell === filterDate) &&
            (searchLocation === "" || locationCell.includes(searchLocation))) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

function clearFilters() {
    document.getElementById('filter-date').value = "";
    document.getElementById('search-location').value = "";
    filterSightings();
}

function sortTable(columnIndex) {
    const table = document.getElementById('monkey-table').getElementsByTagName('tbody')[0];
    const rows = Array.from(table.getElementsByTagName('tr'));
    const isAscending = table.isAscending = !table.isAscending;

    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].innerText;
        const cellB = b.cells[columnIndex].innerText;

        if (columnIndex === 2) { // Monkey Count column
            return isAscending ? cellA - cellB : cellB - cellA;
        } else {
            return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
        }
    });

    rows.forEach(row => table.appendChild(row));
}

// Initialize FullCalendar
$(document).ready(function() {
    $('#calendar').fullCalendar({
        events: []
    });
});

function addEventToCalendar(date, location, count) {
    $('#calendar').fullCalendar('renderEvent', {
        title: `${count} ${location}`,
        start: date
    }, true);
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Money Tracker", 10, 10);

    const table = document.getElementById('monkey-table');
    const rows = table.getElementsByTagName('tr');
    let y = 20;

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;
        let rowText = '';
        for (let j = 0; j < cells.length - 1; j++) {
            rowText += cells[j].innerText + ' ';
        }
        doc.text(rowText, 10, y);
        y += 10;
    }

    doc.save('money-tracker.pdf');
}
