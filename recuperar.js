const MAX_POKEMON = 151;
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const notFoundMessage = document.querySelector("#not-found-message");

let allPokemons = [];

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
  .then((response) => response.json())
  .then((data) => {
    allPokemons = data.results;
    displayPokemons(allPokemons);
  })
  .catch((error) => {
    console.error("Failed to fetch Pokemon data:", error);
  });

async function fetchPokemonDataBeforeRedirect(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
        res.json()
      ),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
        res.json()
      ),
    ]);

    const types = pokemon.types.map((type) => type.type.name); // Obtendo os tipos do Pokémon

    return { pokemon, types };
  } catch (error) {
    console.error("Failed to fetch Pokemon data before redirect");
    return null;
  }
}

function displayPokemons(pokemons) {
  listWrapper.innerHTML = "";

  pokemons.forEach(async (pokemon) => {
    const pokemonID = pokemon.url.split("/")[6];
    const { pokemon: pokemonData, types } = await fetchPokemonDataBeforeRedirect(
      pokemonID
    );

    const listItem = document.createElement("div");
    listItem.className = "list-item";
    const typesHTML = types.map(type => `<span class="type ${type.toLowerCase()}">${type}</span>`).join(", ");
    listItem.innerHTML = `
        <div class="number-wrap">
            <p class="caption-fonts">#${pokemonID}</p>
        </div>
        <div class="img-wrap">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonID}.png" alt="${pokemonData.name}" />
        </div>
        <div class="name-wrap">
            <p class="body3-fonts">${pokemonData.name}</p>
            <p class="body3-fonts">${typesHTML}</p>
        </div>
    `;

    listItem.addEventListener("click", async () => {
      const success = await fetchPokemonDataBeforeRedirect(pokemonID);
      if (success) {
        window.location.href = `./detail.html?id=${pokemonID}`;
      }
    });

    listWrapper.appendChild(listItem);
  });
}

searchInput.addEventListener("keyup", handleSearch);

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  let filteredPokemons;

  filteredPokemons = allPokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().startsWith(searchTerm)
  );

  displayPokemons(filteredPokemons);

  if (filteredPokemons.length === 0) {
    notFoundMessage.style.display = "block";
  } else {
    notFoundMessage.style.display = "none";
  }
}

  
