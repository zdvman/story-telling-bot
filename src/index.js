import "./style.css"; // Подключаем стили
import QRCode from "qrcode";

// Определяем URL API
const apiUrl = process.env.API_URL;

let userNameInput = ""; // Переменная для хранения имени пользователя
let currentPrompt = ""; // Переменная для хранения текущего промпта
let currentPoem = ""; // Переменная для хранения текущего стихотворения
let currentPoemStyle = ""; // Переменная для хранения стиля текущего стихотворения
let poemArray = []; // Массив для хранения стихотворений

// Получаем ссылки на элементы DOM
const nameSection = document.getElementById("nameSection");
const userName = document.getElementById("userName");
const saveBtn = document.getElementById("saveBtn");
const poetrySection = document.getElementById("poetrySection");
const greeting = document.getElementById("greeting");
const poetryForm = document.getElementById("poetryForm");
const poetryFormContainer = document.querySelector(".poetry-form-container");
const prompt = document.getElementById("prompt");
const storyOutput = document.getElementById("storyOutput");
const tellStoryBtn = document.getElementById("tellStory");
const finishBtn = document.getElementById("finishBtn");

document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.querySelector(".tooltip");
  const tooltipText = tooltip.querySelector(".tooltiptext");

  tooltip.addEventListener("click", (event) => {
    tooltipText.classList.toggle("show"); // Переключаем видимость окна
    event.stopPropagation(); // Останавливаем распространение события клика
  });

  // Закрываем окно при клике вне его и прокручиваем страницу вверх
  document.addEventListener("click", (event) => {
    if (!tooltip.contains(event.target)) {
      tooltipText.classList.remove("show");

      // Прокрутка страницы вверх
      document.body.scrollTop = 0; // Для Safari
      document.documentElement.scrollTop = 0; // Для Chrome, Firefox, IE и Opera
    }
  });

  // Альтернативный метод с focusout
  tooltip.addEventListener("focusout", () => {
    tooltipText.classList.remove("show");

    // Прокрутка страницы вверх
    document.body.scrollTop = 0; // Для Safari
    document.documentElement.scrollTop = 0; // Для Chrome, Firefox, IE и Opera
  });
});

// Обработчик события для сохранения имени
saveBtn.addEventListener("click", () => {
  console.log("saveBtn pressed");
  userNameInput = userName.value;
  console.log(userNameInput);
  if (userNameInput) {
    // Плавное скрытие секции nameSection
    nameSection.classList.remove("show");
    nameSection.classList.add("hide");
    poetryForm.value = ""; // Сброс значения формы

    setTimeout(() => {
      nameSection.style.display = "none"; // Полностью скрываем секцию после завершения анимации
      nameSection.classList.remove("hide");

      // Плавное отображение секции poetrySection
      poetrySection.style.display = "block";
      setTimeout(() => {
        poetrySection.classList.add("show"); // Активируем анимацию для показа
      }, 10); // Небольшая задержка для корректного применения display: block

      greeting.innerHTML = `Dear ${userNameInput},<br>Share your story with me 👂... <br>and I'll weave it into the fabric of poetry.`;
    }, 500); // Время задержки должно совпадать с длительностью анимации (0.5s в CSS)
  }
});

tellStoryBtn?.addEventListener("click", async () => {
  if (poetryForm.value === "" || prompt.value === "") {
    storyOutput.innerText = "Please enter a prompt and select a poetry form.";
    return;
  }
  if (
    currentPrompt !== "" &&
    currentPoemStyle !== "" &&
    currentPrompt === prompt.value &&
    currentPoemStyle === poetryForm.value
  ) {
    // Если текущий промпт и стиль стихотворения совпадают с новыми значениями - не отправляем запрос
    storyOutput.innerText =
      "Change the prompt or poetry form to generate a new poem.";
    return;
  }
  if (currentPoem !== "" && currentPoemStyle !== "" && currentPrompt !== "") {
    poemArray.push({
      text: currentPoem,
      style: currentPoemStyle,
      prompt: currentPrompt,
    });
    currentPoem = "";
    currentPoemStyle = "";
    currentPrompt = "";
  }
  currentPoemStyle = poetryForm.value;
  currentPrompt = prompt.value;
  if (currentPrompt && currentPoemStyle && storyOutput) {
    storyOutput.innerText = "Generating your poem...";

    try {
      const response = await fetch(`${apiUrl}/api/get-poem`, {
        // Полный URL с портом
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptInput: currentPrompt,
          poetryChoice: currentPoemStyle,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.content) {
        // If data.content exists - save it to array of poems
        currentPoem = data.content;
      }
      storyOutput.innerText = data.content || "Sorry, no response generated.";
    } catch (error) {
      storyOutput.innerText = "Sorry, something went wrong. Please try again.";
      console.error("Error:", error);
    }
  }
});

// Обработчик события для завершения сессии
finishBtn?.addEventListener("click", async () => {
  if (currentPoem !== "" && currentPoemStyle !== "" && currentPrompt !== "") {
    poemArray.push({
      text: currentPoem,
      style: currentPoemStyle,
      prompt: currentPrompt,
    });
    currentPoem = "";
    currentPoemStyle = "";
    currentPrompt = "";
  }

  if (userNameInput && poemArray.length > 0) {
    try {
      const response = await fetch(`${apiUrl}/api/save-poems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: userNameInput,
          poems: poemArray,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save poems to database.");
      }

      const result = await response.json();
      console.log("Poems saved successfully:", result);

      // Генерация URL для страницы с поэмами
      const poemsPageUrl = `${apiUrl}/api/poems/${result._id}`;

      // Запрос на генерацию QR-кода
      const qrCodeResponse = await fetch(
        `${apiUrl}/api/generate-qr/${result._id}`
      );
      const qrCodeData = await qrCodeResponse.json();

      if (qrCodeData.qrCode) {
        // Создаем элемент всплывающего окна
        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.padding = "20px";
        popup.style.backgroundColor = "#fff";
        popup.style.border = "1px solid #ccc";
        popup.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
        popup.style.borderRadius = "10px";
        popup.style.zIndex = "1000";
        popup.style.textAlign = "center";
        popup.style.maxWidth = "90%";
        popup.style.width = "400px";
        popup.style.boxSizing = "border-box";

        popup.innerHTML = `
           <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Scan this QR code to view your poems:</h2>
           <img src="${qrCodeData.qrCode}" alt="QR Code" style="margin-bottom: 1rem;">
           <p><strong>Or visit this URL:</strong> <br><br><a href="${poemsPageUrl}" target="_blank" style="color: #007bff; text-decoration: none;">Your page with poems</a></p>
           <button id="closePopup" style="margin-top: 1rem; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
         `;

        // Добавляем обработчик для закрытия всплывающего окна
        document.body.appendChild(popup);
        document.getElementById("closePopup").addEventListener("click", () => {
          document.body.removeChild(popup);
        });
      }
      // Очистка массива после успешного сохранения
      poemArray = [];
      userNameInput = "";
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Плавное скрытие секции poetrySection
  poetrySection.classList.remove("show");
  poetrySection.classList.add("hide");

  setTimeout(() => {
    poetrySection.style.display = "none"; // Полностью скрываем секцию после завершения анимации
    poetrySection.classList.remove("hide");

    // Плавное отображение секции nameSection
    nameSection.style.display = "block";
    setTimeout(() => {
      nameSection.classList.add("show"); // Активируем анимацию для показа
    }, 10); // Небольшая задержка для корректного применения display: block

    // Сброс значений
    userName.value = "";
    prompt.value = "";
    storyOutput.innerText = "";
    poetryForm.value = "";
  }, 500); // Время задержки должно совпадать с длительностью анимации (0.5s в CSS)
});
