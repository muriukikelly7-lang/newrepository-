const tabs = document.querySelectorAll('.booking-tab');
const searchMessage = document.querySelector('.search-message');
const hero = document.querySelector('.hero');
const tripPills = document.querySelectorAll('.trip-pill');
const bookingPanels = document.querySelectorAll('.flight-panel, .booking-panel, .status-panel');
const bookingMessage = document.querySelector('.search-message');
const passengerField = document.querySelector('.passenger-field');
const passengerSummary = document.querySelector('.passenger-summary');
const passengerPopover = document.querySelector('.passenger-popover');
const heroTitle = document.querySelector('.hero-content h1');
const heroCopy = document.querySelector('.hero-copy');
const heroEyebrow = document.querySelector('.hero-content .eyebrow');
const heroCta = document.querySelector('.hero-cta');
const routeFares = {
  'nairobi|garissa': 7000,
  'nairobi|mandera': 6000,
  'nairobi|homabay': 7000,
  'nairobi|migori': 6000,
  'nairobi|kitale': 6000,
  'nairobi|kisumu': 6500,
  'nairobi|eldoret': 7000,
  'nairobi|lodwar': 11500,
  'nairobi|mombasa': 7000,
  'nairobi|kakamega': 7000
};
const heroSlides = [
  {
    image: 'https://skywardairlines.com/storage/2026/01/Malindi-Skyward-Airlines-001-1.jpg',
    title: 'Malindi, Now Daily',
    copy: 'Introducing our new morning departure from JKIA.'
  },
  {
    image: 'https://skywardairlines.com/storage/2026/02/Cheap-Flights-To-Garissa-Skyward-Airlines-006.jpg',
    title: 'Flights to Garissa',
    copy: 'Book your flight today for travel from August.<br>Flights operate every Monday, Wednesday, Friday & Sunday.'
  },
  {
    image: 'https://skywardairlines.com/storage/2026/02/Dar-Mobile-Slider-003.webp',
    title: 'Fly to Dar es Salaam',
    copy: 'Five times weekly, with more room to wander.'
  },
  {
    image: 'https://skywardairlines.com/storage/2026/01/Nairobi-Skyward-Airlines-01.jpg',
    title: 'Discover Nairobi',
    copy: 'Start your next story from the heart of Kenya.'
  }
];
let activeSlide = 0;
let slideTimer;

function normalizeLocation(value) {
  return value.toLowerCase().split('(')[0].trim();
}

function getRouteFare(departure, arrival) {
  const key = `${normalizeLocation(departure)}|${normalizeLocation(arrival)}`;
  return routeFares[key] || 7000;
}

function getPassengerCount() {
  const count = [...passengerPopover.querySelectorAll('.passenger-row output')]
    .reduce((total, output) => total + Number(output.value), 0);
  return Math.max(count, 1);
}

function updateNairobiTime() {
  const now = new Date();
  const timeElement = document.querySelector('.nairobi-time');
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).formatToParts(now);
  const hour = parts.find((part) => part.type === 'hour')?.value;
  const minute = parts.find((part) => part.type === 'minute')?.value;
  const period = parts.find((part) => part.type === 'dayPeriod')?.value.toUpperCase();
  timeElement.textContent = `${hour}:${minute} ${period}`;
  timeElement.dateTime = now.toISOString();
}

updateNairobiTime();
window.setInterval(updateNairobiTime, 60000);


function showSlide(index) {
  activeSlide = (index + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[activeSlide];
  hero.classList.add('is-changing');
  hero.style.backgroundImage = `url('${slide.image}')`;
  heroTitle.textContent = slide.title;
  heroCopy.innerHTML = slide.copy;
  heroCta.hidden = activeSlide !== 0;
  window.setTimeout(() => hero.classList.remove('is-changing'), 450);
}

function restartSlideTimer() {
  window.clearInterval(slideTimer);
  slideTimer = window.setInterval(() => showSlide(activeSlide + 1), 6000);
}

document.querySelector('.hero-arrow-left').addEventListener('click', () => {
  showSlide(activeSlide - 1);
  restartSlideTimer();
});

document.querySelector('.hero-arrow-right').addEventListener('click', () => {
  showSlide(activeSlide + 1);
  restartSlideTimer();
});

showSlide(0);
restartSlideTimer();

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => {
      item.classList.remove('selected');
      item.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('selected');
    tab.setAttribute('aria-selected', 'true');
    const selectedPanel = tab.dataset.tab;
    bookingPanels.forEach((panel) => {
      const shouldShow = selectedPanel === 'flights'
        ? panel.classList.contains('flight-panel')
        : panel.classList.contains(`${selectedPanel}-panel`);
      panel.hidden = !shouldShow;
    });
    bookingMessage.textContent = '';
  });
});

document.querySelectorAll('.panel-action').forEach((button) => {
  button.addEventListener('click', () => {
    bookingMessage.textContent = `${button.textContent} is ready. Enter your details to continue.`;
  });
});

document.querySelector('.swap-button').addEventListener('click', () => {
  const fields = document.querySelectorAll('.location-field input');
  const from = fields[0].value;
  fields[0].value = fields[1].value;
  fields[1].value = from;
});

const flightModal = document.querySelector('.flight-modal');
const flightSummary = document.querySelector('.flight-summary');
const flightDetailsForm = document.querySelector('.flight-details-form');
const flightMessage = document.querySelector('.flight-message');
const flightClose = document.querySelector('.flight-close');
const flightResults = document.querySelector('.flight-results');
const selectedFlight = document.querySelector('.selected-flight');
const seatStep = document.querySelector('.seat-step');
const modalSeatGrid = document.querySelector('.modal-seat-grid');
const modalSeatMessage = document.querySelector('.modal-seat-message');
const modalWhatsappButton = document.querySelector('.modal-whatsapp-button');
const reservedSeats = new Set(['4B', '5C', '6B', '7A', '8D']);
let passengerDetails;
let selectedSeats = [];
let passengerCount = 1;

for (let row = 1; row <= 8; row += 1) {
  for (const column of ['A', 'B', 'C', 'D']) {
    const seatCode = `${row}${column}`;
    const seat = document.createElement('button');
    seat.type = 'button';
    seat.className = `modal-seat${reservedSeats.has(seatCode) ? ' reserved' : ''}`;
    seat.textContent = seatCode;
    seat.dataset.seat = seatCode;
    seat.disabled = reservedSeats.has(seatCode);
    seat.setAttribute('aria-label', `${seatCode}${seat.disabled ? ', reserved' : ', available'}`);
    modalSeatGrid.append(seat);
  }
}

document.querySelector('.search-button').addEventListener('click', () => {
  const locations = [...document.querySelectorAll('.location-field input')].map((input) => input.value.trim());
  if (!locations[0] || !locations[1]) {
    searchMessage.textContent = 'Enter a departure and arrival airport first.';
    return;
  }
  const dates = [...document.querySelectorAll('.date-field input')].map((input) => input.value);
  const fare = getRouteFare(locations[0], locations[1]);
  const passengerCount = getPassengerCount();
  const totalFare = fare * passengerCount;
  const formattedFare = `KSh ${totalFare.toLocaleString('en-KE')}`;
  flightSummary.textContent = `${locations[0]} to ${locations[1]} for ${passengerCount} passenger${passengerCount === 1 ? '' : 's'}${dates[0] ? `, departing ${dates[0]}` : ''}${dates[1] ? ` and returning ${dates[1]}` : ''}.`;
  const resultPrices = [...document.querySelectorAll('.flight-result')].map((result) => result.querySelectorAll('strong')[2]);
  resultPrices[0].textContent = `From ${formattedFare}`;
  resultPrices[1].textContent = `From KSh ${(totalFare + (1500 * passengerCount)).toLocaleString('en-KE')}`;
  flightMessage.textContent = '';
  seatStep.hidden = true;
  modalWhatsappButton.hidden = true;
  selectedSeats = [];
  modalSeatGrid.querySelectorAll('.modal-seat').forEach((item) => item.classList.remove('selected'));
  document.querySelector('.flight-dialog h2').textContent = 'Choose your flight';
  flightResults.hidden = false;
  flightDetailsForm.hidden = true;
  flightModal.hidden = false;
});

flightClose.addEventListener('click', () => {
  flightModal.hidden = true;
});

document.querySelectorAll('.result-book-button').forEach((button) => {
  button.addEventListener('click', () => {
    const result = button.closest('.flight-result');
    selectedFlight.textContent = `Selected: ${result.querySelectorAll('strong')[1].textContent}, ${result.querySelectorAll('strong')[2].textContent}.`;
    document.querySelector('.flight-dialog h2').textContent = 'Complete your booking enquiry';
    flightResults.hidden = true;
    flightDetailsForm.hidden = false;
  });
});

flightDetailsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!flightDetailsForm.reportValidity()) return;
  const details = new FormData(flightDetailsForm);
  passengerDetails = Object.fromEntries(details);
  passengerCount = getPassengerCount();
  flightDetailsForm.hidden = true;
  seatStep.hidden = false;
  document.querySelector('.flight-dialog h2').textContent = 'Choose your seat';
  modalSeatMessage.textContent = `Select ${passengerCount} seat${passengerCount === 1 ? '' : 's'} to continue.`;
  modalWhatsappButton.hidden = true;
});

modalSeatGrid.addEventListener('click', (event) => {
  const seat = event.target.closest('.modal-seat:not(.reserved)');
  if (!seat) return;
  const seatCode = seat.dataset.seat;
  const seatIndex = selectedSeats.indexOf(seatCode);
  if (seatIndex >= 0) {
    selectedSeats.splice(seatIndex, 1);
    seat.classList.remove('selected');
  } else if (selectedSeats.length < passengerCount) {
    selectedSeats.push(seatCode);
    seat.classList.add('selected');
  }
  if (selectedSeats.length < passengerCount) {
    const remaining = passengerCount - selectedSeats.length;
    modalSeatMessage.textContent = `Select ${remaining} more seat${remaining === 1 ? '' : 's'}.`;
    modalWhatsappButton.hidden = true;
    return;
  }
  modalSeatMessage.textContent = `Seats selected: ${selectedSeats.join(', ')}.`;
  const specialRequest = passengerDetails.specialRequest?.trim() || 'None';
  const idNumber = passengerDetails.idNumber?.trim() || 'Not provided';
  const message = [
    'Hello Skyward, I would like to confirm my booking.',
    flightSummary.textContent,
    `Name: ${passengerDetails.name}`,
    `Phone: ${passengerDetails.phone}`,
    `Email: ${passengerDetails.email}`,
    `ID/Passport: ${idNumber}`,
    `Seats: ${selectedSeats.join(', ')}`,
    `Special request: ${specialRequest}`
  ].join('\n');
  modalWhatsappButton.href = `https://wa.me/254755528986?text=${encodeURIComponent(message)}`;
  modalWhatsappButton.hidden = false;
});

document.querySelector('.menu-button').addEventListener('click', () => {
  const nav = document.querySelector('.main-nav');
  const menuButton = document.querySelector('.menu-button');
  const isOpen = nav.classList.toggle('open');
  nav.style.display = isOpen ? 'flex' : '';
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelector('.language-button').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const isSwahili = button.dataset.language === 'sw';
  button.dataset.language = isSwahili ? 'en' : 'sw';
  button.firstChild.textContent = isSwahili ? 'EN ' : 'SW ';
  searchMessage.textContent = isSwahili ? 'English selected.' : 'Kiswahili selected.';
});

document.querySelector('.quick-tile-active').addEventListener('click', () => {
  hero.classList.toggle('booking-open');
});

document.querySelector('.book-now-button').addEventListener('click', () => {
  hero.classList.add('booking-open');
  document.querySelector('.booking-tab[data-tab="flights"]').click();
  const bookingShell = document.querySelector('.booking-shell');
  bookingShell.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => document.querySelector('.location-field input').focus(), 350);
});

heroCta.addEventListener('click', (event) => {
  event.preventDefault();
  hero.classList.add('booking-open');
  document.querySelector('.booking-tab[data-tab="flights"]').click();
  document.querySelector('.booking-shell').scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => document.querySelector('.location-field input').focus(), 350);
});

const signupModal = document.querySelector('.signup-modal');
const signupForm = document.querySelector('.signup-form');
const newsletterForm = document.querySelector('.newsletter-form');
document.querySelector('.signup-button').addEventListener('click', () => {
  signupModal.hidden = false;
});
document.querySelector('.signup-close').addEventListener('click', () => {
  signupModal.hidden = true;
});
document.querySelector('.account-button').addEventListener('click', () => {
  signupModal.hidden = false;
});
signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  signupForm.querySelector('.signup-message').textContent = 'Thanks. Your account request is ready.';
});
newsletterForm.addEventListener('submit', (event) => {
  event.preventDefault();
  signupModal.hidden = false;
});

document.querySelector('.quick-tile:not(.quick-tile-active)').addEventListener('click', () => {
  searchMessage.textContent = 'Your booking details will appear here.';
  hero.classList.remove('booking-open');
});

document.querySelector('.chat-bubble').addEventListener('click', () => {
  const message = encodeURIComponent('Hello Skyward, I need help with my booking.');
  window.location.href = `https://wa.me/254755528986?text=${message}`;
});

passengerSummary.addEventListener('click', () => {
  passengerPopover.hidden = !passengerPopover.hidden;
});

passengerPopover.querySelectorAll('.passenger-row').forEach((row) => {
  const output = row.querySelector('output');
  row.querySelectorAll('button').forEach((button) => button.addEventListener('click', (event) => event.stopPropagation()));
  row.querySelector('button[aria-label^="Remove"]').addEventListener('click', () => {
    output.value = Math.max(row.dataset.passenger === 'adults' ? 1 : 0, Number(output.value) - 1);
  });
  row.querySelector('button[aria-label^="Add"]').addEventListener('click', () => {
    output.value = Number(output.value) + 1;
  });
});

passengerPopover.querySelector('.passenger-accept').addEventListener('click', (event) => {
  event.stopPropagation();
  const values = Object.fromEntries([...passengerPopover.querySelectorAll('.passenger-row')].map((row) => [row.dataset.passenger, Number(row.querySelector('output').value)]));
  passengerSummary.value = `${values.adults + values.children + values.infants} passenger${values.adults + values.children + values.infants === 1 ? '' : 's'}`;
  passengerField.querySelector('span').textContent = `${values.adults} Adult, ${values.infants} Infant, ${values.children} Children`;
  passengerPopover.hidden = true;
});

tripPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    tripPills.forEach((item) => item.classList.remove('active'));
    pill.classList.add('active');
    document.querySelector('.return-field').hidden = pill.textContent.trim() === 'One-way';
  });
});