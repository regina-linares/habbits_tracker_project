const loadHabbitsFromJSONFile = async () => {
  await fetch("./../data/demo.json").then(res => res.json()).then(data => {
    habbits = data
    saveData()
  })
}

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
};

function loadData() {
  const habbitsString = localStorage.getItem("HABBIT_KEY");
  const habbitArray = JSON.parse(habbitsString);

  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
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
  rerenderMenu(activeHabbit);
  renderHead(activeHabbit);
  rerenderContent(activeHabbit);
}

/* work with days*/
function addDays(event) {
  const form = event.target;
  event.preventDefault();
  const data = new FormData(form);
  const comment = data.get("comment");
  form["comment"].classList.remove("error");
  if (!comment) {
    form["comment"].classList.add("error");
  }
  habbits = habbits.map(habbit => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment }])
      }
    }
    return habbit;
  });
  form["comment"].value = " ";
  rerender(globalActiveHabbitId);
  saveData();
}

function deleteDay(index) {
 habbits = habbits.map(habbit => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days.splice(index, 1);
      return {
        ...habbit,
        days: habbit.days
      };
    }
    return habbit;
 })
 rerender(globalActiveHabbitId);
 saveData();
}

/* init */
(() => {
  // loadHabbitsFromJSONFile();
  loadData();
  rerender(habbits[0].id);
})();
