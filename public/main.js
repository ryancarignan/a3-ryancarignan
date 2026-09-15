window.onload = async () => {
  loadVehicles();

  const submitButton = document.getElementById('submit-vehicle-button');
  submitButton.addEventListener('click', (event) => {
    event.preventDefault();
    submit();
  });

  const logoutButton = document.getElementById('logout-button');
  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    logout();
  });
};

const logout = async () => {
  const response = await fetch('/logout', {
    method: 'POST',
  });

  if (response.ok) {
    window.location.assign('/login/index.html');
  }
};

/* INTERACT WITH THE WEB PAGE ----------------------------- */

// Write the list of vehicles to the page
const displayVehicles = (vehicles) => {
  const vehicleListBlock = document.getElementById('vehicle-list-block');
  if (!vehicleListBlock) {
    showError('Cannot find vehicle list section on page.');
    return;
  }

  const existingVehicleList = document.getElementById('vehicle-list');
  if (existingVehicleList) {
    vehicleListBlock.removeChild(existingVehicleList);
  }

  const vehicleList = document.createElement('ul');
  vehicleList.id = 'vehicle-list';

  for (const v of vehicles) {
    const vehicleItem = document.createElement('li');
    vehicleItem.className = 'vehicle-item pure-g';
    vehicleItem.innerHTML = `<p style="text-align:center" class="pure-u-1-4">${v.year} ${v.model} (${v.mpg} MPG)</p><p style="text-align:center" class="pure-u-5-8">Estimated Value: $${v.val}</p>`;

    vehicleItem.addEventListener('click', (event) => {
      event.preventDefault();
      editVehicle(v, vehicleItem);
    });
    
    const vehicleItemDeleteButton = document.createElement('button');
    vehicleItemDeleteButton.type = 'button';
    vehicleItemDeleteButton.className = 'vehicle-item-delete-button pure-button button-delete pure-u-1-8';
    vehicleItemDeleteButton.innerText = 'Delete';
    vehicleItemDeleteButton.addEventListener('click', (event) => {
      event.preventDefault();
      deleteVehicle(v);
    });
    vehicleItem.appendChild(vehicleItemDeleteButton);

    vehicleList.appendChild(vehicleItem);
  }

  vehicleListBlock.appendChild(vehicleList);
};

// Submit the form to add a new vehicle
const submit = async () => {
  const yearInput = document.getElementById('year-input');
  const modelInput = document.getElementById('model-input');
  const mpgInput = document.getElementById('mpg-input');

  if (!yearInput || !modelInput || !mpgInput) {
    showError('Inputs not found.');
    return;
  }

  const yearVal = yearInput.value;
  const modelVal = modelInput.value;
  const mpgVal = mpgInput.value;

  if (!checkValues(yearVal, modelVal, mpgVal)) {
    showError('Invalid input value.');
    return;
  }

  const vehicle = {
    year: yearVal,
    model: modelVal,
    mpg: mpgVal,
  };

  if (!checkValues(vehicle.year, vehicle.model, vehicle.mpg)) {
    showError('Invalid form field(s) for vehicle addition.');
    return;
  }

  yearInput.value = '';
  modelInput.value = '';
  mpgInput.value = '';

  addVehicle(vehicle);
};

// Open edit form on a vehicle-item
const editVehicle = (oldVehicle, vehicleItemElement) => {
  const editForm = document.createElement('form');
  editForm.id = 'edit-form';
  editForm.className = 'pure-form pure-g';
  
  const createInput = (type, id, name) => {
    const label = document.createElement('label');
    label.className = 'pure-u-1-4';
    const input = document.createElement('input');
    input.type = type;
    input.required = true;
    input.id = `edit-${id}-input`;
    input.value = oldVehicle[id];
    label.innerText = `${name ?? id} `;
    label.appendChild(input);
    return { label, input };
  };

  const editYear = createInput('number', 'year', 'Year');
  const editModel = createInput('text', 'model', 'Model');
  const editMpg = createInput('number', 'mpg', 'MPG');

  editForm.appendChild(editYear.label);
  editForm.appendChild(editModel.label);
  editForm.appendChild(editMpg.label);

  const editCancelButton = document.createElement('button');
  editCancelButton.type = 'button';
  editCancelButton.className = 'pure-button button-cancel pure-u-1-8';
  editCancelButton.innerText = 'Cancel';
  editCancelButton.addEventListener('click', async (event) => {
    await loadVehicles();
  });
  editForm.appendChild(editCancelButton);

  const editSubmitButton = document.createElement('button');
  editSubmitButton.className = 'pure-button button-submit pure-u-1-8';
  editSubmitButton.innerText = 'Submit';
  editSubmitButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const vehicle = {
      _id: oldVehicle._id,
      year: editYear.input.value,
      model: editModel.input.value,
      mpg: editMpg.input.value,
    };
    if (!checkValues(vehicle.year, vehicle.model, vehicle.mpg)) {
      showError('Invalid form field(s) for vehicle edit.');
      return;
    }
    updateVehicle(vehicle);
  });
  editForm.appendChild(editSubmitButton);

  const vehicleItemEditElement = document.createElement('li');
  vehicleItemEditElement.className = 'vehicle-item editing';
  vehicleItemEditElement.appendChild(editForm);
  vehicleItemElement.replaceWith(vehicleItemEditElement);
  
  // document.onclick = async (event) => {
  //   if (document.getElementById('edit-form') && event.target !== editForm) {
  //     await loadVehicles();
  //   }
  // };
};

/* INTERACT WITH THE BACKEND ------------------------------ */

// Load existing vehicles list
const loadVehicles = async () => {
  const response = await fetch('/vehicles', {
    method: 'GET',
  });

  if (!response.ok) {
    showError('Failed to load vehicles.');
    return;
  }

  const vehicles = await response.json();
  displayVehicles(vehicles);
};

// Add a new vehicle to the list
const addVehicle = async (vehicle) => {
  const response = await fetch('/vehicles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    showError('Failed to add vehicle.');
    return;
  }

  loadVehicles();
};

// Update a vehicle
const updateVehicle = async (vehicle) => {
  const response = await fetch('/vehicles', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    showError('Failed to update vehicle.');
    return;
  }

  loadVehicles();
}

// Delete a vehicle
const deleteVehicle = async (vehicle) => {
  const response = await fetch('/vehicles', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    showError('Failed to delete vehicle.');
    return;
  }

  loadVehicles();
}

/* HELPERS ------------------------------------------------ */

const checkValues = (year, model, mpg) => {
  return (
    year && isFinite(Number(year)) && year >= 1885 &&
    model &&
    mpg && isFinite(Number(mpg)) && mpg > 0
  );
};

const showError = (str) => {
  window.alert('ERROR: ' + str);
};
