window.onload = () => {
  const loginButton = document.getElementById('login-button');
  loginButton.addEventListener('click', (event) => {
    event.preventDefault();
    login();
  });

  const createAccountButton = document.getElementById('create-account-button');
  createAccountButton.addEventListener('click', (event) => {
    event.preventDefault();
    createAccount();
  });
};

const login = async () => {
  const usernameInput = document.getElementById('username-input');
  const passwordInput = document.getElementById('password-input');

  const response = await fetch('/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      username: usernameInput.value,
      password: passwordInput.value,
    }),
  });

  if (response.ok) {
    window.location.assign('/index.html');
  } else {
    const preexistingErrorMsg = document.getElementById('error-msg');
    if (!preexistingErrorMsg) {
      const errorMsg = document.createElement('p');
      errorMsg.id = 'error-msg';
      errorMsg.innerText = 'Login unsuccessful; please check credentials.';
      document.body.appendChild(errorMsg);
    }
  }
};

const createAccount = async () => {
  const usernameInput = document.getElementById('username-input');
  const passwordInput = document.getElementById('password-input');

  const response = await fetch('/create-account', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      username: usernameInput.value,
      password: passwordInput.value,
    }),
  });

  if (response.ok) {
    window.location.assign('/index.html');
  } else {
    window.alert('ERROR: Account creation unsuccessful. Please try again.');
  }
};