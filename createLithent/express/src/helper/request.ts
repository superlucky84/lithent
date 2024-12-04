export type Info = {
  id: number;
  weight: number;
  height: number;
  img: string;
  name: string;
  types: string[];
  abilities: string[];
};

export async function fetchTypeList() {
  const result = await fetch('https://pokeapi.co/api/v2/type?limit=100').then(
    response => response.json()
  );

  return result.results.filter(
    (item: { name: string; url: string }) =>
      !['stellar', 'unknown', 'shadow'].includes(item.name)
  );
}

export async function fetchMonsterListByType(type: string) {
  const result = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
    .then(response => response.json())
    .then(data => {
      return data.pokemon
        .map(
          (pokemon: { pokemon: { name: string; url: string }[] }) =>
            pokemon.pokemon
        )
        .filter(
          (_item: { name: string; url: string }[], index: number) => index < 36
        );
    });

  const data = await fetchPokemonInfos(result);

  return data;
}

function makeInfoData(data: {
  name: string;
  id: number;
  abilities: { ability: { name: string } }[];
  types: { name: string }[];
  sprites: {
    other: { dream_world: { front_default: string } };
    front_default: string;
  };
  height: number;
  weight: number;
}) {
  return {
    id: data.id,
    name: data.name,
    types: data.types.map((typeInfo: any) => typeInfo.type.name),
    abilities: data.abilities.map(
      (abilityInfo: any) => abilityInfo.ability.name
    ),
    img:
      data.sprites.other.dream_world.front_default ||
      data.sprites.front_default,
    height: data.height,
    weight: data.weight,
  };
}

export async function fetchPokemonInfo(name: string) {
  const result = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
    .then(response => response.json())
    .then(data => makeInfoData(data));

  return result;
}

async function fetchPokemonInfos(
  pokemonArray: { name: string; url: string; info: Info }[]
) {
  const pokemonInfoPromises = pokemonArray.map(async pokemon => {
    const response = await fetch(pokemon.url);
    const data = await response.json();

    pokemon.info = makeInfoData(data);

    return pokemon;
  });

  const updatedPokemonArray = await Promise.all(pokemonInfoPromises);

  return updatedPokemonArray;
}
