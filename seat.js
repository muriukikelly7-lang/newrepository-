const detailsForm = document.querySelector('.details-form');
const detailsPanel = document.querySelector('.details-panel');
const seatPanel = document.querySelector('.seat-panel');
const seats = document.querySelectorAll('.seat.available');
const message = document.querySelector('.selection-message');
const whatsappButton = document.querySelector('.whatsapp-button');
let passengerDetails;

detailsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!detailsForm.reportValidity()) return;
  passengerDetails = Object.fromEntries(new FormData(detailsForm));
  detailsPanel.hidden = true;
  seatPanel.hidden = false;
  message.textContent = 'Details confirmed. Select an available seat.';
  seatPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

seats.forEach((seat) => {
  seat.setAttribute('aria-pressed', 'false');
  seat.addEventListener('click', () => {
    seats.forEach((item) => {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed', 'false');
    });
    seat.classList.add('selected');
    seat.setAttribute('aria-pressed', 'true');
    message.textContent = `Seat ${seat.dataset.seat} selected.`;
    const bookingMessage = [
      'Hello Safarilink, I would like to confirm my booking.',
      `Name: ${passengerDetails.name}`,
      `Phone: ${passengerDetails.phone}`,
      `Email: ${passengerDetails.email}`,
      'Route: Nairobi to Bungoma',
      'Departure: 04:50 PM',
      `Seat: ${seat.dataset.seat}`
    ].join('\n');
    whatsappButton.href = `https://wa.me/254755528986?text=${encodeURIComponent(bookingMessage)}`;
    whatsappButton.hidden = false;
  });
});
