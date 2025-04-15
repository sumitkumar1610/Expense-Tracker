let travelPeopleCount = null;
const travelData = [];
const earners = [];
const householdSpendings = [];
let numEarners = 0;

function showSection(id) {
  document.querySelectorAll('.container > div').forEach(div => div.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  if (id === 'travel' && travelPeopleCount !== null) {
    const input = document.getElementById('travel-people-count');
    input.value = `Total: ${travelPeopleCount} people`;
    input.readOnly = true;
    input.style.backgroundColor = "#f0f0f0";
  }
}

document.getElementById('travel-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const peopleInput = document.getElementById('travel-people-count');
  const name = document.getElementById('travel-name').value;
  const amount = +document.getElementById('travel-amount').value;
  const currency = document.getElementById('travel-currency').value;
  const date = document.getElementById('travel-date').value;
  const desc = document.getElementById('travel-desc').value;

  if (travelPeopleCount === null) {
    const val = parseInt(peopleInput.value);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid number of people going on the trip.");
      return;
    }
    travelPeopleCount = val;
    peopleInput.value = `Total: ${val} people`;
    peopleInput.readOnly = true;
    peopleInput.style.backgroundColor = "#f0f0f0";
  }

  if (!name || isNaN(amount) || amount <= 0 || !desc || !date) {
    alert("Please fill all fields with valid data.");
    return;
  }

  travelData.push({ name, amount, date, desc, currency });
  updateTravelList();

  // Reset only inputs for each entry
  document.getElementById('travel-name').value = '';
  document.getElementById('travel-amount').value = '';
  document.getElementById('travel-currency').value = 'INR';
  document.getElementById('travel-date').value = '';
  document.getElementById('travel-desc').value = '';
});

function updateTravelList() {
  const list = document.getElementById('travel-list');
  list.innerHTML = '';
  travelData.forEach(e => {
    list.innerHTML += `<li>${e.date}: <strong>${e.name}</strong> spent ${e.currency} ${e.amount} on ${e.desc}</li>`;
  });
}

function calculateTravelSplit() {
  const totalPerPerson = {};
  let totalAmount = 0;
  travelData.forEach(e => {
    totalPerPerson[e.name] = (totalPerPerson[e.name] || 0) + e.amount;
    totalAmount += e.amount;
  });
  const names = Object.keys(totalPerPerson);
  const avg = totalAmount / names.length;
  const balances = names.map(n => ({ name: n, balance: +(totalPerPerson[n] - avg).toFixed(2) }));
  const result = [];
  while (true) {
    balances.sort((a, b) => a.balance - b.balance);
    const low = balances[0], high = balances[balances.length - 1];
    if (low.balance >= 0) break;
    const amount = Math.min(-low.balance, high.balance);
    result.push(`${low.name} pays ₹${amount.toFixed(2)} to ${high.name}`);
    low.balance += amount;
    high.balance -= amount;
  }
  document.getElementById('travel-result').innerHTML =
    `<h4>Total People: ${travelPeopleCount}</h4><h4>Settlement:</h4><ul>${result.map(r => `<li>${r}</li>`).join('')}</ul>`;
}

document.getElementById('household-form').addEventListener('submit', function (e) {
  e.preventDefault();
  if (numEarners === 0) {
    const input = document.getElementById('household-name').value;
    numEarners = parseInt(input);
    if (isNaN(numEarners) || numEarners < 1) {
      alert('Enter a valid number of earners.');
      return;
    }
    const form = document.getElementById('household-form');
    form.innerHTML = '';
    for (let i = 0; i < numEarners; i++) {
      form.innerHTML += `
        <input type="text" id="earner-name-${i}" placeholder="Earner ${i + 1} Name" required />
        <input type="number" id="earner-income-${i}" placeholder="Earner ${i + 1} Income" required />
      `;
    }
    form.innerHTML += `
      <h4>Add Household Expenses</h4>
      <input type="text" id="spending-desc" placeholder="Spent on" />
      <input type="number" id="spending-amount" placeholder="Amount" />
      <select id="spending-currency">
        <option value="INR" selected>INR (₹)</option>
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
      </select>
      <input type="date" id="spending-date" />
      <button type="button" onclick="addSpending()">Add Expense</button>
      <ul id="spending-list"></ul>
      <button type="submit">Calculate</button>
    `;
    return;
  }

  earners.length = 0;
  let totalIncome = 0;
  for (let i = 0; i < numEarners; i++) {
    const name = document.getElementById(`earner-name-${i}`).value;
    const income = parseFloat(document.getElementById(`earner-income-${i}`).value);
    earners.push({ name, income });
    totalIncome += income;
  }

  const totalSpent = householdSpendings.reduce((sum, s) => sum + s.amount, 0);
  const savings = totalIncome - totalSpent;

  const resultDiv = document.getElementById('household-result');
  resultDiv.innerHTML = `
    <h4>Household Summary:</h4>
    <ul>${earners.map(e => `<li>${e.name} earns ₹${e.income}</li>`).join('')}</ul>
    <p><strong>Total Income:</strong> ₹${totalIncome}</p>
    <p><strong>Total Spending:</strong> ₹${totalSpent}</p>
    <p><strong>Total Savings:</strong> ₹${savings}</p>
    <h4>Spendings:</h4>
    <ul>${householdSpendings.map(s => `<li>${s.date}: ${s.currency} ${s.amount} on ${s.desc}</li>`).join('')}</ul>
  `;

  document.getElementById('household-form').innerHTML = `
    <input type="number" id="household-name" placeholder="Number of Earners" required />
    <button type="submit">Next</button>
  `;
  numEarners = 0;
  householdSpendings.length = 0;
});

function addSpending() {
  const desc = document.getElementById('spending-desc').value.trim();
  const amount = parseFloat(document.getElementById('spending-amount').value);
  const currency = document.getElementById('spending-currency').value;
  const date = document.getElementById('spending-date').value;
  if (!desc || isNaN(amount) || amount <= 0 || !date) {
    alert("Please enter valid spending details.");
    return;
  }
  householdSpendings.push({ desc, amount, date, currency });
  const list = document.getElementById('spending-list');
  list.innerHTML = householdSpendings.map(s => `<li>${s.date}: ${s.currency} ${s.amount} on ${s.desc}</li>`).join('');
  document.getElementById('spending-desc').value = '';
  document.getElementById('spending-amount').value = '';
  document.getElementById('spending-date').value = '';
}
