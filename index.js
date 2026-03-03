const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2409-FTB-ET-WEB-PT"; 
const API = BASE + COHORT;

let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) { console.error(e); }
}

async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) { console.error(e); }
}

async function addParty(party) {
  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(party),
    });
    const result = await response.json();
    
    await getParties(); 
  } catch (e) { console.error(e); }
}

async function deleteParty(id) {
  try {
    await fetch(API + "/events/" + id, { method: "DELETE" });
    selectedParty = null; 
    await getParties();
  } catch (e) { console.error(e); }
}

async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) { console.error(e); }
}

async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) { console.error(e); }
}


function NewPartyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <label>Name: <input type="text" name="name" required /></label>
    <label>Location: <input type="text" name="location" required /></label>
    <label>Date: <input type="datetime-local" name="date" required /></label>
    <label>Description: <textarea name="description"></textarea></label>
    <button type="submit">Add Party</button>
  `;

  $form.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const newParty = {
      name: $form.name.value,
      location: $form.location.value,
      date: new Date($form.date.value).toISOString(),
      description: $form.description.value,
    };

    await addParty(newParty);
  });

  return $form;
}

function PartyListItem(party) {
  const $li = document.createElement("li");
  if (party.id === selectedParty?.id) { $li.classList.add("selected"); }
  $li.innerHTML = `<a href="#selected">${party.name}</a>`;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");
  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);
  return $ul;
}

function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">${selectedParty.date.slice(0, 10)}</time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <button id="delete-btn">Delete Party</button>
    <h4>Guest List</h4>
    <GuestList></GuestList>
  `;

  $party.querySelector("#delete-btn").addEventListener("click", () => deleteParty(selectedParty.id));
  $party.querySelector("GuestList").replaceWith(GuestList());

  return $party;
}

function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find((rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id)
  );
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);
  return $ul;
}

function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner Admin</h1>
    <main>
      <section id="form-section">
        <h2>Create a New Party</h2>
        <NewPartyForm></NewPartyForm>
      </section>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("NewPartyForm").replaceWith(NewPartyForm());
  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
