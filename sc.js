document.addEventListener("DOMContentLoaded", () => {
  const pokemonID = new URLSearchParams(window.location.search).get("id");
  if (!pokemonID) {
    window.location.href = "./index.html";
    return;
  }

  const id = parseInt(pokemonID, 10);
  loadPokemon(id);
});

async function loadPokemon(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json()
      ),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
        res.json()
      ),
    ]);

    displayPokemonDetails(pokemon, pokemonSpecies);

    return true;
  } catch (error) {
    console.error("An error occurred while fetching Pokemon data:", error);
    return false;
  }
}

async function displayPokemonDetails(pokemon, pokemonSpecies) {
  const { name, id, types, weight, height, abilities } = pokemon;
  const capitalizePokemonName = capitalizeFirstLetter(name);

  document.querySelector(".name").textContent = capitalizePokemonName;
  document.querySelector(".pokemon-id").textContent = `#${String(id).padStart(3, "0")}`;

  const imageElement = document.querySelector(".pokemon-image");
  imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
  imageElement.alt = name;

  const typeWrapper = document.querySelector(".power-wrapper");
  typeWrapper.innerHTML = "";
  types.forEach(({ type }) => {
    createAndAppendElement(typeWrapper, "p", {
      className: `body3-fonts type ${type.name}`,
      textContent: type.name,
    });
  });

  document.querySelector(".weight").textContent = `Weight: ${weight / 10} kg`;
  document.querySelector(".height").textContent = `Height: ${height / 10} m`;

  const abilitiesWrapper = document.querySelector(".abilities");
  abilitiesWrapper.textContent = `Abilities: ${abilities.map(({ ability }) => ability.name).join(", ")}`;

  // Obter detalhes de todas as próximas evoluções (se houver)
  const nextEvolutionsDetails = await getNextEvolutionsDetails(pokemonSpecies);
  if (nextEvolutionsDetails.length > 0) {
    displayNextEvolutions(nextEvolutionsDetails);
  } else {
    // Se não houver próximas evoluções, ocultar a seção
    document.querySelector(".evolution-wrapper").style.display = "none";
  }

  setTypeBackgroundColor(pokemon);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function createAndAppendElement(parent, tag, options = {}) {
  const element = document.createElement(tag);
  Object.keys(options).forEach((key) => {
    element[key] = options[key];
  });
  parent.appendChild(element);
  return element;
}

async function getNextEvolutionsDetails(pokemonSpecies) {
  if (!pokemonSpecies.evolution_chain) {
    return [];
  }

  const evolutionChainUrl = pokemonSpecies.evolution_chain.url;
  const response = await fetch(evolutionChainUrl);
  const data = await response.json();

  const evolutions = [];
  let currentChain = data.chain;

  // Percorre todas as evoluções anteriores
  while (currentChain && currentChain.evolves_to.length > 0) {
    const nextEvolutions = currentChain.evolves_to;
    for (const evolution of nextEvolutions) {
      const speciesName = evolution.species.name;
      const speciesId = await getPokemonIdByName(speciesName);
      const speciesDetails = await getPokemonById(speciesId);
      evolutions.push(speciesDetails);
    }
    currentChain = nextEvolutions[0]; // Move para a próxima cadeia de evolução
  }

  return evolutions;
}

function displayNextEvolutions(evolutions) {
  const evolutionWrapper = document.querySelector(".evolution-details");
  evolutionWrapper.innerHTML = "";

  evolutions.forEach(evolution => {
    const evolutionDiv = document.createElement("div");
    evolutionDiv.classList.add("evolution-item");

    const evolutionName = document.createElement("p");
    evolutionName.textContent = `Name: ${evolution.name}`;
    evolutionDiv.appendChild(evolutionName);

    const evolutionImage = document.createElement("img");
    evolutionImage.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${evolution.id}.svg`;
    evolutionImage.alt = evolution.name;
    evolutionDiv.appendChild(evolutionImage);

    evolutionWrapper.appendChild(evolutionDiv);
  });
}

async function getPokemonIdByName(name) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = await response.json();
  return data.id;
}

async function getPokemonById(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await response.json();
  return data;
}

function setTypeBackgroundColor(pokemon) {
  const mainType = pokemon.types[0].type.name;
  const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
  };

  const color = typeColors[mainType];
  if (color) {
    const elements = document.querySelectorAll(".power-wrapper, .detail-main");
    elements.forEach((element) => {
      element.style.backgroundColor = color;
      element.style.borderColor = color;
    });
  }
}
