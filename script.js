let allColors = [];
let currentPage = 0;
const perPage = 12;

const keywords = ['green', 'blue', 'yellow', 'red', 'orange', 'pink', 'purple', 'brown', 'gray', 'white', 'black'];

async function loadAllColors() {
  currentPage = 0;
  allColors = [];

  const fetches = keywords.map(async (keyword) => {
    const apiURL = `https://colormagic.app/api/palette/search?q=${keyword}`;
    const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(apiURL)}`;

    try {
      const response = await fetch(proxyURL);
      const result = await response.json();
      const palettes = JSON.parse(result.contents);
      const colors = palettes.flatMap(p =>
        p.colors.map(color => ({ color }))
      );
      allColors.push(...colors);
    } catch (err) {
      console.warn(`Erro ao carregar cores para "${keyword}":`, err);
    }
  });

  await Promise.all(fetches);
  showPage();
  showPage2();
}

function showPage() {
  const container = document.getElementById('color-display1');
  container.innerHTML = '';
  const start = currentPage * perPage;
  const pageColors = allColors.slice(start, start + perPage);

  pageColors.forEach(({ color }) => {
    const box = document.createElement('div');
    box.className = 'color-box';
    box.style.backgroundColor = color;
    box.title = color;
    box.innerText = color;
    box.onclick = () => {
      document.getElementById("sala1").style.backgroundColor = color;
    };
    container.appendChild(box);
  });
}

function showPage2() {
  const container = document.getElementById('color-display2');
  container.innerHTML = '';
  const start = currentPage * perPage;
  const pageColors = allColors.slice(start, start + perPage);

  pageColors.forEach(({ color }) => {
    const box = document.createElement('div');
    box.className = 'color-box';
    box.style.backgroundColor = color;
    box.title = color;
    box.innerText = color;
    box.onclick = () => {
      document.getElementById("sala2").style.backgroundColor = color;
    };
    container.appendChild(box);
  });
}

function nextPage1() {
  if ((currentPage + 1) * perPage < allColors.length) {
    currentPage++;
    showPage();
  }
}

function previousPage1() {
  if (currentPage > 0) {
    currentPage--;
    showPage();
  }
}

function nextPage2() {
  if ((currentPage + 1) * perPage < allColors.length) {
    currentPage++;
    showPage2();
  }
}

function previousPage2() {
  if (currentPage > 0) {
    currentPage--;
    showPage2();
  }
}

window.onload = loadAllColors;
