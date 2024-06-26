async function loadHabbitsFromJSONFile() {
  await fetch("./../data/demo.json")
    .then((res) => res.json())
    .then((data) => {
      habbits = data;
      saveData();
    });
};

let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";
let globalActiveHabbitId;

/* page */
const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".title"),
    progressPercent: document.querySelector(".progress__percent span"),
    progressCoverBar: document.querySelector(".progress__cover-bar"),
  },
  content: {
    daysContainer: document.getElementById("days"),
    nextDay: document.querySelector(".habbits__day"),
  },
  popup: {
    index: document.getElementById("add-habbit-popup"),
    iconField: document.querySelector('.popup__form input[name="icon"]'),
  },
};

async function loadData() {
  const habbitsString = localStorage.getItem("HABBIT_KEY");
  const habbitArray = JSON.parse(habbitsString);

  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
    if (!habbits.length) await loadHabbitsFromJSONFile();
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function togglePopup() {
  if (page.popup.index.classList.contains("cover--hidden")) {
    page.popup.index.classList.remove("cover--hidden");
  } else {
    page.popup.index.classList.add("cover--hidden");
  }
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = "";
  }
}

function validateAndGetFormData(form, fields) {
  const formData = new FormData(form);
  const res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove("error");
    if (!fieldValue) {
      form[field].classList.add("error");
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return;
  }
  return res;
}
/* render */

function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
      const element = document.createElement("button");
      element.setAttribute("menu-habbit-id", habbit.id);
      element.classList.add("menu__item");
      element.addEventListener("click", () => rerender(habbit.id));
      element.innerHTML = `<img src="./assets/images/${habbit.icon}.svg" />`;
      if (activeHabbit.id === habbit.id) {
        element.classList.add("menu__item--active");
      }
      page.menu.appendChild(element);
      continue;
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add("menu__item--active");
    } else {
      existed.classList.remove("menu__item--active");
    }
  }
}

function renderHead(activeHabbit) {
  page.header.h1.innerText = activeHabbit.name;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0);
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

function rerenderContent(activeHabbit) {
  page.content.daysContainer.innerHTML = " ";
  for (const index in activeHabbit.days) {
    const element = document.createElement("div");
    element.classList.add("habbits__item");
    element.innerHTML = `<div class="habbits__day"> День ${
      Number(index) + 1
    }</div>
      <div class="habbits__item-right">
          <div class="habbits__comment">${
            activeHabbit.days[index].comment
          }</div>
          <button class="habbits__delete" onclick='deleteDay(${index})'>
              <img src="./assets/images/delete.svg" alt="">
          </button>
      </div>`;
    page.content.daysContainer.appendChild(element);
  }
  page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId;
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
  if (!activeHabbit) {
    return;
  }
  document.location.replace(document.location.pathname + '#' + activeHabbitId);
  rerenderMenu(activeHabbit);
  renderHead(activeHabbit);
  rerenderContent(activeHabbit);
}

/* work with days*/
function addDays(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ['comment']);
  if(!data) {
    return
  }
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: data.comment }]),
      };
    }
    return habbit;
  });
  resetForm(event.target, ['comment'])
  rerender(globalActiveHabbitId);
  saveData();
}

function deleteDay(index) {
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days.splice(index, 1);
      return {
        ...habbit,
        days: habbit.days,
      };
    }
    return habbit;
  });
  rerender(globalActiveHabbitId);
  saveData();
}
// working with habbits

function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector(".icon.icon--active");
  activeIcon.classList.remove("icon--active");
  context.classList.add("icon--active");
}

function addHabbit(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ["name", 'icon', 'target']);
  if (!data) {
    return;
  }
  const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0)
  habbits.push({
    id: maxId + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: []

  });
  resetForm(event.target, ["name", "target"]);
  togglePopup();
  saveData();
  rerender(maxId + 1);
}

/* init */
(async () => {
  await loadData();
  const hashId = Number(document.location.hash.replace('#', ''));
  const urlHabbitId = habbits.find(habbits => habbits.id == hashId)?.id;
  if (urlHabbitId) {
  rerender(urlHabbitId);
  } else {
    rerender(habbits[0].id)
  }
})();
