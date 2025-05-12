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

document.addEventListener('DOMContentLoaded', () => {
    if (typeof jQuery !== 'undefined') {
        $(document).foundation();
    } else {
        console.warn('jQuery não está carregado. Foundation não será inicializado.');
    }
    fetchPaints();
    setupFilterToggle();
    resetFilters();
});

function fetchPaints() {
    fetch('paints.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar paints.json: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Dados carregados:', data);
            window.paintsData = data;
            populateFilters(data);
            applyFilters();
        })
        .catch(error => console.error('Erro ao carregar paints.json:', error));
}

function populateFilters(data) {
    const marcas = [...new Set(data.map(p => p.marca))].sort();
    const acabamentos = [...new Set(data.map(p => p.acabamento))].sort();
    const unidades = [...new Set(data.map(p => p.unidade_tamanho))].sort();
    const cores = [...new Set(data.map(p => p.cor_base))].sort();

    const marcaSelect = document.getElementById('filter-marca');
    marcas.forEach(marca => {
        const option = document.createElement('option');
        option.value = marca;
        option.textContent = marca;
        marcaSelect.appendChild(option);
    });

    const acabamentoSelect = document.getElementById('filter-acabamento');
    acabamentos.forEach(acabamento => {
        const option = document.createElement('option');
        option.value = acabamento;
        option.textContent = acabamento;
        acabamentoSelect.appendChild(option);
    });

    const unidadeSelect = document.getElementById('filter-unidade');
    unidades.forEach(unidade => {
        const option = document.createElement('option');
        option.value = unidade;
        option.textContent = unidade;
        unidadeSelect.appendChild(option);
    });

    const corSelect = document.getElementById('filter-cor');
    cores.forEach(cor => {
        const option = document.createElement('option');
        option.value = cor;
        option.textContent = cor;
        corSelect.appendChild(option);
    });
}

function setupFilterToggle() {
    const toggleButton = document.getElementById('toggle-filters');
    const filtersContent = document.getElementById('filters-content');
    if (toggleButton && filtersContent) {
        toggleButton.addEventListener('click', () => {
            filtersContent.classList.toggle('active');
        });
    } else {
        console.warn('Elementos toggle-filters ou filters-content não encontrados.');
    }
}

function applyFilters() {
    console.log('Aplicando filtros');
    const searchTerm = document.getElementById('search-bar').value.toUpperCase();
    const marcaFilter = document.getElementById('filter-marca').value;
    const acabamentoFilter = document.getElementById('filter-acabamento').value;
    const unidadeFilter = document.getElementById('filter-unidade').value;
    const corFilter = document.getElementById('filter-cor').value;
    const priceMin = parseFloat(document.getElementById('filter-price-min').value) || 0;
    const priceMax = parseFloat(document.getElementById('filter-price-max').value) || Infinity;

    const filtered = window.paintsData.filter(paint => {
        return (
            (!searchTerm || paint.marca.toUpperCase().includes(searchTerm)) &&
            (!marcaFilter || paint.marca === marcaFilter) &&
            (!acabamentoFilter || paint.acabamento === acabamentoFilter) &&
            (!unidadeFilter || paint.unidade_tamanho === unidadeFilter) &&
            (!corFilter || paint.cor_base === corFilter) &&
            (paint.valor >= priceMin && paint.valor <= priceMax)
        );
    });

    console.log('Produtos filtrados:', filtered);
    displayPaints(filtered);
}

function displayPaints(paints) {
    const paintsBody = document.getElementById('paintsBody');
    if (!paintsBody) {
        console.error('Elemento #paintsBody não encontrado no DOM.');
        return;
    }
    console.log('Exibindo produtos:', paints);
    paintsBody.innerHTML = '';

    paints.forEach(paint => {
        const card = document.createElement('div');
        card.className = 'cell';
        card.innerHTML = `
            <div class="card">
                <div class="card-divider">
                    <h4>${paint.marca}</h4>
                </div>
                <div class="card-image">
                  <img src="${paint.image}" alt="${paint.descricao}">
                </div>
                <div class="card-section">
                    <p><strong>Descrição:</strong> ${paint.descricao}</p>
                    <p><strong>Acabamento:</strong> ${paint.acabamento}</p>
                    <p><strong>Unidade:</strong> ${paint.unidade_tamanho}</p>
                    <p><strong>Cor/Base:</strong> ${paint.cor_base}</p>
                    <p><strong>Valor:</strong> R$ ${paint.valor.toFixed(2)}</p>
                </div>
            </div>
        `;
        paintsBody.appendChild(card);
    });
}


function popularFiltros() {
    const marcaSelect = document.getElementById('filter-marca');
    const acabamentoSelect = document.getElementById('filter-acabamento');
    const unidadeSelect = document.getElementById('filter-unidade');
    const corSelect = document.getElementById('filter-cor');

    const marcas = [...new Set(window.paintsData.map(paint => paint.marca))];
    const acabamentos = [...new Set(window.paintsData.map(paint => paint.acabamento))];
    const unidades = [...new Set(window.paintsData.map(paint => paint.unidade_tamanho))];
    const cores = [...new Set(window.paintsData.map(paint => paint.cor_base))];

    marcas.forEach(marca => {
        const option = document.createElement('option');
        option.value = marca;
        option.textContent = marca;
        marcaSelect.appendChild(option);
    });

    acabamentos.forEach(acabamento => {
        const option = document.createElement('option');
        option.value = acabamento;
        option.textContent = acabamento;
        acabamentoSelect.appendChild(option);
    });

    unidades.forEach(unidade => {
        const option = document.createElement('option');
        option.value = unidade;
        option.textContent = unidade;
        unidadeSelect.appendChild(option);
    });

    cores.forEach(cor => {
        const option = document.createElement('option');
        option.value = cor;
        option.textContent = cor;
        corSelect.appendChild(option);
    });
}

function resetFilters() {
    const searchBar = document.getElementById('search-bar');
    const marcaSelect = document.getElementById('filter-marca');
    const acabamentoSelect = document.getElementById('filter-acabamento');
    const unidadeSelect = document.getElementById('filter-unidade');
    const corSelect = document.getElementById('filter-cor');
    const priceMin = document.getElementById('filter-price-min');
    const priceMax = document.getElementById('filter-price-max');
    
    if (searchBar) searchBar.value = '';
    if (marcaSelect) marcaSelect.value = '';
    if (acabamentoSelect) acabamentoSelect.value = '';
    if (unidadeSelect) unidadeSelect.value = '';
    if (corSelect) corSelect.value = '';
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';

    applyFilters();
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.paintsData) {
        popularFiltros();
        applyFilters();
    } else {
        console.error('paintsData não está definido. Verifique o carregamento do JSON.');
    }

    document.getElementById('clear-filters').addEventListener('click', () => {
        resetFilters();
    });
});