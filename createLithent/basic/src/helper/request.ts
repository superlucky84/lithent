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

export async function fetchPokemonInfo(
  name: string
): Promise<{ info: Info; infoString: string }> {
  const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(
    response => response.json()
  );

  const result = makeInfoData(data);
  const resultString = makeDetailedInfoString(data);

  return { info: result, infoString: resultString };
}

function makeInfoData(data: {
  name: string;
  id: number;
  abilities: { ability: { name: string } }[];
  types: { type: { name: string } }[];
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
    types: data.types.map(typeInfo => typeInfo.type.name),
    abilities: data.abilities.map(abilityInfo => abilityInfo.ability.name),
    img:
      data.sprites.other.dream_world.front_default ||
      data.sprites.front_default,
    height: data.height,
    weight: data.weight,
  };
}

async function fetchPokemonInfos(
  pokemonArray: { name: string; url: string; info: Info; infoString: string }[]
) {
  const pokemonInfoPromises = pokemonArray.map(async pokemon => {
    const response = await fetch(pokemon.url);
    const data = await response.json();

    pokemon.info = makeInfoData(data);
    pokemon.infoString = makeSimpleInfoString(data);

    return pokemon;
  });

  const updatedPokemonArray = await Promise.all(pokemonInfoPromises);

  return updatedPokemonArray;
}

function makeSimpleInfoString(pokemon: {
  name: string;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  stats: { stat: { name: string }; base_stat: string }[];
  height: number;
  weight: number;
}) {
  const types = pokemon.types.map(typeInfo => typeInfo.type.name).join(', ');
  const abilities = pokemon.abilities
    .map(abilityInfo => abilityInfo.ability.name)
    .join(', ');
  const height = (pokemon.height / 10).toFixed(1);
  const weight = (pokemon.weight / 10).toFixed(1);

  return `Types      : ${types}
Abilities  : ${abilities}
Height     : ${height} m
Weight     : ${weight} kg
    `
    .replace(/\n/g, '<br>')
    .trim();
}

function makeDetailedInfoString(pokemon: {
  name: string;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  stats: { stat: { name: string }; base_stat: number }[];
  height: number;
  weight: number;
}) {
  const types = pokemon.types.map(typeInfo => typeInfo.type.name).join(', ');
  const abilities = pokemon.abilities
    .map(abilityInfo => abilityInfo.ability.name)
    .join(', ');
  const height = (pokemon.height / 10).toFixed(1);
  const weight = (pokemon.weight / 10).toFixed(1);

  const stats = pokemon.stats
    .map(
      statInfo =>
        `${statInfo.stat.name.padEnd(15)}: ${String(
          statInfo.base_stat
        ).padStart(3)}`
    )
    .join('\n');

  return `Name       : ${pokemon.name}
Types      : ${types}
Abilities  : ${abilities}
Height     : ${height} m
Weight     : ${weight} kg

===============
stat
===============
${stats}
  `
    .replace(/\n/g, '<br>')
    .trim();
}
