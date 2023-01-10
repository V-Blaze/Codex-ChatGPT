import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

const loader = (elem) => {
  elem.textContent = '';

  loadInterval = setInterval(() => {
    elem.textContent += '.';

    if (elem.textContent === '...') {
      elem.textContent = '';
    }
  }, 300)
}

const typeText = (element, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++
    } else {
      clearInterval(interval);
    }
  }, 20)
}

const generateUID = () => {
  const timeStamp = Date.now();
  const randNumber = Math.random();
  const hexaDecimalString = randNumber.toString(16);

  return `id-${timeStamp}-${hexaDecimalString}`;
}

const chatStrip = (isAi, value, uniqueId) => {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>  
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

const handeSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  chatContainer.innerHTML += chatStrip(false, data.get('prompt'));

  form.reset();

  const uniqueId = generateUID();
  chatContainer.innerHTML += chatStrip(true, ' ', uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  const response = await fetch('https://codex-gpt-ncgr.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = 'Somthing went wrong'
  }
}

form.addEventListener('submit', handeSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handeSubmit(e);
  }
});