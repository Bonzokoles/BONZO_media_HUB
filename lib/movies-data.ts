"use client";

import catalogData from "@/components/features/films/data/catalog/catalog_with_tmdb.json";

export interface MovieReview {
  style: string;
  content: string;
}

export interface Movie {
  id: string;
  tmdbId?: number;
  title: string;
  year: number | null;
  director: string;
  rating: number;
  runtime: number;
  genres: string[];
  cast: string[];
  keywords: string[];
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  reviews: { [key: string]: string };
  personalReview?: string | null;
}

// Movie collection from BONZO Film Vault
export const moviesCollection: Movie[] = [
  {
    id: "12_monkeys_1995",
    tmdbId: 63,
    title: "12 Monkeys",
    year: 1995,
    director: "Terry Gilliam",
    rating: 7.6,
    runtime: 129,
    genres: ["Science Fiction", "Thriller", "Mystery"],
    cast: [
      "Bruce Willis",
      "Madeleine Stowe",
      "Brad Pitt",
      "Christopher Plummer",
      "David Morse",
    ],
    keywords: [
      "time travel",
      "virus",
      "dystopia",
      "mental institution",
      "paradox",
    ],
    overview:
      "In the year 2035, convict James Cole reluctantly volunteers to be sent back in time to discover the origin of a deadly virus that wiped out nearly all of the earth's population and forced the survivors into underground communities.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gt3iyguaCIw8DpQZI1LIN5TohM2.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/mKIkGoyuR71qz6FdiEiOjxvBQcS.jpg",
    reviews: {
      akademicki:
        "12 malp Terry'ego Gilliama to dezorientujaca podroz w glab psychiki rozbitego swiata...",
      bukowski:
        "12 Malp to nie jest film dla tych, co lubia siedziec w kinie z popcornem...",
      thompson:
        "Nie da sie zaczac rozmowy o 12 Malp bez najpierw wcisniecia sie w opary absurdu...",
    },
    personalReview: null,
  },
  {
    id: "a_clockwork_orange_1971",
    tmdbId: 185,
    title: "A Clockwork Orange",
    year: 1971,
    director: "Stanley Kubrick",
    rating: 8.2,
    runtime: 137,
    genres: ["Science Fiction", "Crime", "Drama"],
    cast: [
      "Malcolm McDowell",
      "Patrick Magee",
      "Carl Duering",
      "Michael Bates",
    ],
    keywords: [
      "dystopia",
      "ultraviolence",
      "rehabilitation",
      "free will",
      "beethoven",
    ],
    overview:
      "In a near-future Britain, young Alexander DeLarge and his pals get their kicks beating and raping anyone they please. When not destroying the lives of others, Alex swoons to the music of Beethoven.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/4sHeTAp65WrSSuc05nRBKddhBxO.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/nLFxvLokHe3bQmrmAfljIfax2jQ.jpg",
    reviews: {
      akademicki:
        "Mechaniczna pomarancza Kubricka to symfonia dzikosci i suwerennosci...",
      bukowski:
        "Kubrick, ten stary cwaniak, otwiera swoj pieprzony show z twarza Alexa...",
      thompson:
        "Na milosc boska, Stanley Kubrick! Jakim demonicznym szalenstwem...",
    },
    personalReview: null,
  },
  {
    id: "blade_runner_1982",
    tmdbId: 78,
    title: "Blade Runner",
    year: 1982,
    director: "Ridley Scott",
    rating: 8.1,
    runtime: 117,
    genres: ["Science Fiction", "Drama", "Thriller"],
    cast: ["Harrison Ford", "Rutger Hauer", "Sean Young", "Daryl Hannah"],
    keywords: ["android", "dystopia", "neo-noir", "replicant", "los angeles"],
    overview:
      "In the smog-choked dystopian Los Angeles of 2019, blade runner Rick Deckard is called out of retirement to terminate a quartet of replicants who have escaped to Earth seeking their creator.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/eIi3klFf7mp3oL5EEF4mLIDs26r.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "blade_runner_2049",
    tmdbId: 335984,
    title: "Blade Runner 2049",
    year: 2017,
    director: "Denis Villeneuve",
    rating: 7.5,
    runtime: 164,
    genres: ["Science Fiction", "Drama"],
    cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas", "Jared Leto"],
    keywords: ["replicant", "dystopia", "memory", "identity", "sequel"],
    overview:
      "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/ilRyazdMJwN05exqhwK4tMKBYZs.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "pulp_fiction_1994",
    tmdbId: 680,
    title: "Pulp Fiction",
    year: 1994,
    director: "Quentin Tarantino",
    rating: 8.9,
    runtime: 154,
    genres: ["Thriller", "Crime"],
    cast: ["John Travolta", "Samuel L. Jackson", "Uma Thurman", "Bruce Willis"],
    keywords: [
      "non-linear",
      "hitman",
      "gangster",
      "dark comedy",
      "los angeles",
    ],
    overview:
      "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "no_country_for_old_men_2007",
    tmdbId: 6977,
    title: "No Country for Old Men",
    year: 2007,
    director: "Coen Brothers",
    rating: 8.1,
    runtime: 122,
    genres: ["Crime", "Drama", "Thriller"],
    cast: [
      "Javier Bardem",
      "Josh Brolin",
      "Tommy Lee Jones",
      "Woody Harrelson",
    ],
    keywords: ["serial killer", "texas", "cat and mouse", "fate", "nihilism"],
    overview:
      "Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and more than two million dollars in cash near the Rio Grande.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/bj1v6YKF8yHqA489VFfnQvOJpnc.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/gaGWvnXmPxgbhODlWwydXuVNKjS.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "the_big_lebowski_1998",
    tmdbId: 115,
    title: "The Big Lebowski",
    year: 1998,
    director: "Coen Brothers",
    rating: 8.1,
    runtime: 117,
    genres: ["Comedy", "Crime"],
    cast: ["Jeff Bridges", "John Goodman", "Julianne Moore", "Steve Buscemi"],
    keywords: [
      "bowling",
      "slacker",
      "kidnapping",
      "mistaken identity",
      "los angeles",
    ],
    overview:
      "Jeffrey 'The Dude' Lebowski, a Los Angeles slacker who only wants to bowl and drink White Russians, is mistaken for a millionaire, drawing him into a strange kidnapping case.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/9mprbw31MGdd66LR0AQKoDMoFRv.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/9mprbw31MGdd66LR0AQKoDMoFRv.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "fear_and_loathing_1998",
    tmdbId: 1235,
    title: "Fear and Loathing in Las Vegas",
    year: 1998,
    director: "Terry Gilliam",
    rating: 7.6,
    runtime: 118,
    genres: ["Adventure", "Comedy", "Drama"],
    cast: ["Johnny Depp", "Benicio del Toro", "Tobey Maguire", "Ellen Barkin"],
    keywords: [
      "drugs",
      "journalism",
      "las vegas",
      "hallucination",
      "road trip",
    ],
    overview:
      "Raoul Duke and his attorney Dr. Gonzo drive a red convertible across the Mojave desert to Las Vegas with a suitcase full of drugs to cover a motorcycle race.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/pPH6536caDJ5rMNJVuXJMkC6pPc.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/vW2p8uo6JtCAQXxDU8nL8kHIlHv.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "the_truman_show_1998",
    tmdbId: 37165,
    title: "The Truman Show",
    year: 1998,
    director: "Peter Weir",
    rating: 8.1,
    runtime: 103,
    genres: ["Comedy", "Drama"],
    cast: ["Jim Carrey", "Laura Linney", "Ed Harris", "Noah Emmerich"],
    keywords: [
      "reality tv",
      "simulation",
      "media satire",
      "surveillance",
      "freedom",
    ],
    overview:
      "Truman Burbank is the star of The Truman Show, a 24-hour-a-day reality TV show that broadcasts every aspect of his life without his knowledge.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/vuza0WtBNXc2b7zCPPVr8YlXkHu.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/tQkigP2fItdzJWvtIhBvnqLyT8O.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "la_haine_1995",
    tmdbId: 1116,
    title: "La Haine",
    year: 1995,
    director: "Mathieu Kassovitz",
    rating: 8.1,
    runtime: 98,
    genres: ["Crime", "Drama"],
    cast: ["Vincent Cassel", "Hubert Kounde", "Said Taghmaoui"],
    keywords: [
      "paris",
      "banlieue",
      "police brutality",
      "youth",
      "social commentary",
    ],
    overview:
      "24 hours in the lives of three young men in the French suburbs the day after a violent riot.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/4Bz6qTocjpKMiL6acq9iiPrRiPX.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/sdcf7sfdyLlFyPeLLfKXNKTyAVj.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "dark_city_1998",
    tmdbId: 11056,
    title: "Dark City",
    year: 1998,
    director: "Alex Proyas",
    rating: 7.6,
    runtime: 100,
    genres: ["Mystery", "Science Fiction", "Thriller"],
    cast: [
      "Rufus Sewell",
      "Kiefer Sutherland",
      "Jennifer Connelly",
      "William Hurt",
    ],
    keywords: ["memory", "noir", "aliens", "city", "identity"],
    overview:
      "A man struggles with memories of his past, which include a wife he cannot remember and a nightmarish childhood, while being hunted by mysterious beings known as the Strangers.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/xvzT3EjHdnPNiDwSHNJtbqWyIxS.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/4cHgPKAm3tWPKFq0b8E6nqYlQvR.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "dead_man_1995",
    tmdbId: 10006,
    title: "Dead Man",
    year: 1995,
    director: "Jim Jarmusch",
    rating: 7.6,
    runtime: 121,
    genres: ["Drama", "Fantasy", "Western"],
    cast: ["Johnny Depp", "Gary Farmer", "Crispin Glover", "Lance Henriksen"],
    keywords: ["native american", "journey", "death", "outlaw", "poetry"],
    overview:
      "On the run after murdering a man, accountant William Blake encounters a strange Native American named Nobody who prepares him for his journey into the spiritual world.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/sP4e7XKvJyJqQu6h4fKvZdR6qrK.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/nPTjj6ZfBXXBwOhd7iUy6tyuKWt.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "enemy_2013",
    tmdbId: 194662,
    title: "Enemy",
    year: 2013,
    director: "Denis Villeneuve",
    rating: 7.0,
    runtime: 91,
    genres: ["Mystery", "Thriller"],
    cast: [
      "Jake Gyllenhaal",
      "Melanie Laurent",
      "Sarah Gadon",
      "Isabella Rossellini",
    ],
    keywords: [
      "doppelganger",
      "identity",
      "spider",
      "subconscious",
      "paranoia",
    ],
    overview:
      "A man seeks out his exact look-alike after spotting him in a movie.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/mgsHq6FFrU1n3Wh8Pd5ykzAFDC3.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/qJsGSrKqhNNt3B3TyDw2b8WLQYS.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "sicario_2015",
    tmdbId: 273481,
    title: "Sicario",
    year: 2015,
    director: "Denis Villeneuve",
    rating: 7.6,
    runtime: 121,
    genres: ["Action", "Crime", "Drama"],
    cast: ["Emily Blunt", "Benicio del Toro", "Josh Brolin", "Victor Garber"],
    keywords: ["drug cartel", "mexico", "fbi", "border", "violence"],
    overview:
      "An idealistic FBI agent is enlisted by a government task force to aid in the escalating war against drugs at the border area between the U.S. and Mexico.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/uxmIlvprJADdZNYoaOQIrC3FE3p.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/3rO4gKyL3Fy7CedLqPRYeEpMJxU.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "gummo_1997",
    tmdbId: 32684,
    title: "Gummo",
    year: 1997,
    director: "Harmony Korine",
    rating: 6.5,
    runtime: 89,
    genres: ["Drama"],
    cast: ["Jacob Reynolds", "Nick Sutton", "Lara Tosh", "Jacob Sewell"],
    keywords: ["poverty", "small town", "experimental", "outsiders", "ohio"],
    overview:
      "Inhabitants of a small, tornado-devastated town in Ohio are portrayed in a surreal, documentary-style manner.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/1GbkNmhWUVqDpFVLTCQ6wGbhWzB.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/q7WgyKut1GmvTq29pfGvMS31AAH.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "holy_motors_2012",
    tmdbId: 89444,
    title: "Holy Motors",
    year: 2012,
    director: "Leos Carax",
    rating: 7.1,
    runtime: 115,
    genres: ["Drama", "Fantasy"],
    cast: ["Denis Lavant", "Edith Scob", "Eva Mendes", "Kylie Minogue"],
    keywords: ["performance", "surreal", "limousine", "paris", "identity"],
    overview:
      "From dawn to dusk, a man with a mysterious role travels through Paris in a large white limousine, visiting various appointments with unknown individuals.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/srQCVvCRqpU2OVOH3fFB4nKFLSf.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/xnVHNJgBcPh4AQXN1h8Wh0b7DF4.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "the_game_1997",
    tmdbId: 8699,
    title: "The Game",
    year: 1997,
    director: "David Fincher",
    rating: 7.7,
    runtime: 129,
    genres: ["Drama", "Mystery", "Thriller"],
    cast: [
      "Michael Douglas",
      "Sean Penn",
      "Deborah Kara Unger",
      "James Rebhorn",
    ],
    keywords: ["paranoia", "conspiracy", "birthday", "rich", "san francisco"],
    overview:
      "Wealthy financier Nicholas Van Orton gets a strange birthday present from wayward brother Conrad: a live-action game that consumes his life.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/euC4Jz6fhmsRNh0cVE1k97F6M12.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/81UQ9SfO9F69lJTVhsPjbmIbVNy.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "forrest_gump_1994",
    tmdbId: 13,
    title: "Forrest Gump",
    year: 1994,
    director: "Robert Zemeckis",
    rating: 8.8,
    runtime: 142,
    genres: ["Comedy", "Drama", "Romance"],
    cast: ["Tom Hanks", "Robin Wright", "Gary Sinise", "Sally Field"],
    keywords: ["vietnam", "running", "shrimp", "history", "destiny"],
    overview:
      "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/7c9UVPPiTPltouxRVY6N9uugaVA.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "gran_torino_2008",
    tmdbId: 12697,
    title: "Gran Torino",
    year: 2008,
    director: "Clint Eastwood",
    rating: 8.1,
    runtime: 116,
    genres: ["Drama"],
    cast: ["Clint Eastwood", "Bee Vang", "Ahney Her", "Christopher Carley"],
    keywords: ["veteran", "racism", "redemption", "gang", "detroit"],
    overview:
      "Disgruntled Korean War veteran Walt Kowalski sets out to reform his neighbor, Thao Lor, a Hmong teenager who tried to steal Kowalski's prized possession: a 1972 Gran Torino.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gITr9NX7KgrQwvP4uYxSs6rZV33.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/dOJ8A5mMtawQp8n0DqJVTGXqnvH.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "true_romance_1993",
    tmdbId: 10696,
    title: "True Romance",
    year: 1993,
    director: "Tony Scott",
    rating: 7.9,
    runtime: 119,
    genres: ["Crime", "Romance", "Thriller"],
    cast: [
      "Christian Slater",
      "Patricia Arquette",
      "Dennis Hopper",
      "Gary Oldman",
    ],
    keywords: ["cocaine", "mob", "elvis", "road trip", "violence"],
    overview:
      "In Detroit, a lonely pop culture geek marries a call girl, steals cocaine from her pimp, and tries to sell it in Hollywood.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/xBO8R3CZfrJ9rrwrZoJFsTh8fD4.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/5rAKc8tVVLUZDbQzqHmCMJwHZWh.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "lock_stock_1998",
    tmdbId: 100,
    title: "Lock, Stock and Two Smoking Barrels",
    year: 1998,
    director: "Guy Ritchie",
    rating: 8.2,
    runtime: 107,
    genres: ["Comedy", "Crime"],
    cast: ["Jason Flemyng", "Dexter Fletcher", "Nick Moran", "Jason Statham"],
    keywords: ["gangster", "london", "poker", "heist", "dark comedy"],
    overview:
      "A botched card game in London triggers four friends, thugs, weed-growers, hard gangsters, loan sharks and debt collectors to collide with each other in a series of unexpected events.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/8kSerJrhrJWKLk1LViesGcnrUPE.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/bZR0p8FTcRXb0kC0xR6AntFJq3c.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "vivarium_2019",
    tmdbId: 587966,
    title: "Vivarium",
    year: 2019,
    director: "Lorcan Finnegan",
    rating: 6.1,
    runtime: 97,
    genres: ["Horror", "Mystery", "Science Fiction"],
    cast: [
      "Jesse Eisenberg",
      "Imogen Poots",
      "Jonathan Aris",
      "Senan Jennings",
    ],
    keywords: ["suburbs", "trap", "alien", "nightmare", "monotony"],
    overview:
      "A young couple looking for the perfect home find themselves trapped in a mysterious labyrinth-like neighborhood of identical houses.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/myf3qCbvpa7nkVSdOjjdPfpOVP4.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/pGOLb66JbjJPXuJpmL7YtawXoMs.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "the_fisher_king_1991",
    tmdbId: 9443,
    title: "The Fisher King",
    year: 1991,
    director: "Terry Gilliam",
    rating: 7.5,
    runtime: 137,
    genres: ["Comedy", "Drama", "Fantasy"],
    cast: [
      "Robin Williams",
      "Jeff Bridges",
      "Amanda Plummer",
      "Mercedes Ruehl",
    ],
    keywords: ["redemption", "holy grail", "homeless", "radio", "new york"],
    overview:
      "A former radio DJ, suicidally despondent because of a tragic incident, finds redemption through a homeless man whose life he helps rebuild.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/1WHBhHqRLCmG8EkE1WDvV5CKK4T.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/t7gKSuNwJKyANVuD4PZT9pqLbqO.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "the_florida_project_2017",
    tmdbId: 438808,
    title: "The Florida Project",
    year: 2017,
    director: "Sean Baker",
    rating: 7.6,
    runtime: 111,
    genres: ["Drama"],
    cast: [
      "Brooklynn Prince",
      "Bria Vinaite",
      "Willem Dafoe",
      "Caleb Landry Jones",
    ],
    keywords: ["poverty", "childhood", "motel", "florida", "innocence"],
    overview:
      "Six-year-old Moonee and her mom spend their summer in a budget motel near Walt Disney World, and the staff there look after them.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gLqMSwn1pBXTTFA6eIpGHrhTAQa.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/oaLw49i5oWfBRzFLexmqxCyOXkl.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "upstream_color_2013",
    tmdbId: 176483,
    title: "Upstream Color",
    year: 2013,
    director: "Shane Carruth",
    rating: 6.7,
    runtime: 96,
    genres: ["Drama", "Science Fiction"],
    cast: ["Amy Seimetz", "Shane Carruth", "Andrew Sensenig", "Thiago Martins"],
    keywords: ["parasite", "identity", "connection", "experimental", "pig"],
    overview:
      "A woman is involuntarily drugged with a substance that makes her susceptible to suggestion, and finds herself drawn to a man who was drugged in the same way.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gT9FNBLwNK1Bau0nZ2MmFfvBDVl.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/gfFdP0p0r7fRPWCqvDQgIGQPlZm.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "jacobs_ladder_1990",
    tmdbId: 11612,
    title: "Jacob's Ladder",
    year: 1990,
    director: "Adrian Lyne",
    rating: 7.4,
    runtime: 113,
    genres: ["Drama", "Horror", "Mystery"],
    cast: ["Tim Robbins", "Elizabeth Pena", "Danny Aiello", "Matt Craven"],
    keywords: [
      "vietnam veteran",
      "hallucination",
      "purgatory",
      "ptsd",
      "conspiracy",
    ],
    overview:
      "Mourning his dead child, a haunted Vietnam War veteran attempts to discover his past while suffering from a severe case of dissociation.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/nUFFscQWBY1fcl2bC0JMwdZV6HX.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/y7mG1dWsM4K3Z6x8y4t8yCdLN4i.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "the_jacket_2005",
    tmdbId: 11358,
    title: "The Jacket",
    year: 2005,
    director: "John Maybury",
    rating: 7.1,
    runtime: 103,
    genres: ["Drama", "Fantasy", "Mystery"],
    cast: [
      "Adrien Brody",
      "Keira Knightley",
      "Kris Kristofferson",
      "Jennifer Jason Leigh",
    ],
    keywords: [
      "time travel",
      "asylum",
      "straitjacket",
      "experiment",
      "gulf war",
    ],
    overview:
      "A Gulf War veteran wrongly sent to a mental institution for insane criminals, where he becomes the object of a doctor's experiments.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/1vwP8pUGqWhPjNPCrKQYEJLHCfP.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/3ZrY5m0kOFB7AqYL8PYhbGgRX0z.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "k_pax_2001",
    tmdbId: 11398,
    title: "K-PAX",
    year: 2001,
    director: "Iain Softley",
    rating: 7.4,
    runtime: 120,
    genres: ["Drama", "Mystery", "Science Fiction"],
    cast: ["Kevin Spacey", "Jeff Bridges", "Mary McCormack", "Alfre Woodard"],
    keywords: ["alien", "psychiatrist", "mental hospital", "light", "identity"],
    overview:
      "A patient at a psychiatric hospital claims to be from a planet called K-PAX.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/6OPMBvJlwKY6ddLFwLyC4yjz6XN.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/8OvvhN5VrHk3vNk3i8WN0NRPXUK.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "devs_2020",
    tmdbId: 101352,
    title: "Devs",
    year: 2020,
    director: "Alex Garland",
    rating: 7.8,
    runtime: 52,
    genres: ["Drama", "Mystery", "Science Fiction", "Thriller"],
    cast: ["Sonoya Mizuno", "Nick Offerman", "Jin Ha", "Zach Grenier"],
    keywords: [
      "quantum computing",
      "determinism",
      "simulation",
      "silicon valley",
      "conspiracy",
    ],
    overview:
      "A young software engineer investigates the secret development division of her employer, which she believes is behind the disappearance of her boyfriend.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/mgOZSS2FFIGtfVeac1buBw3Cx5w.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/1eVsNPd5oBC1JcMJk6qn8XZZGmM.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "the_beach_2000",
    tmdbId: 8398,
    title: "The Beach",
    year: 2000,
    director: "Danny Boyle",
    rating: 6.6,
    runtime: 119,
    genres: ["Adventure", "Drama", "Romance"],
    cast: [
      "Leonardo DiCaprio",
      "Tilda Swinton",
      "Virginie Ledoyen",
      "Guillaume Canet",
    ],
    keywords: ["paradise", "thailand", "utopia", "backpacker", "isolation"],
    overview:
      "Twenty-something Richard travels to Thailand and finds himself in possession of a strange map. Rumours say it leads to a solitary beach paradise.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gGL8KlVT4TrZfJXaSR7LVGEXaXP.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/yPr0tJuZR0C9xyJXW7qQyjT9Jbs.jpg",
    reviews: {},
    personalReview: null,
  },
  {
    id: "you_were_never_really_here_2017",
    tmdbId: 446021,
    title: "You Were Never Really Here",
    year: 2017,
    director: "Lynne Ramsay",
    rating: 6.8,
    runtime: 89,
    genres: ["Crime", "Drama", "Mystery"],
    cast: [
      "Joaquin Phoenix",
      "Judith Roberts",
      "Ekaterina Samsonov",
      "John Doman",
    ],
    keywords: ["trauma", "hitman", "child trafficking", "ptsd", "brutality"],
    overview:
      "A traumatized veteran tracks down missing girls for a living. When a job spins out of control, his nightmares overtake him as a sinister conspiracy is uncovered.",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gJTsuH4cTdjBZ3P2X4nHE8wGx7n.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/7RTvOdvL08AUj2h9KxgPKhKX0dD.jpg",
    reviews: {},
    personalReview: null,
  },
];

export const reviewStyles = [
  { id: "akademicki", name: "AKADEMICKI", description: "Analiza akademicka" },
  {
    id: "bukowski",
    name: "BUKOWSKI",
    description: "Styl Charlesa Bukowskiego",
  },
  { id: "thompson", name: "THOMPSON", description: "Styl Hunter S. Thompsona" },
  {
    id: "gombrowicz",
    name: "GOMBROWICZ",
    description: "Styl Witolda Gombrowicza",
  },
  { id: "mrozek", name: "MROZEK", description: "Styl Slawomira Mrozka" },
];

export const allGenres = [
  "All",
  "Science Fiction",
  "Thriller",
  "Drama",
  "Crime",
  "Comedy",
  "Horror",
  "Mystery",
  "Action",
  "Romance",
  "Fantasy",
  "Adventure",
  "Western",
];

// Map category names to icons and slugs
const categoryMeta: Record<string, { icon: string; slug: string }> = {
  "Psychodeliczne, ale bez horroru": { icon: "🌀", slug: "psycho" },
  "Czułe o miłości, ale bez kiczu": { icon: "🌹", slug: "milosc" },
  "Urban Decay": { icon: "🏚", slug: "urban" },
  "Kino o outsiderach": { icon: "👤", slug: "outsiderzy" },
  "Brudna, uliczna poezja": { icon: "📜", slug: "poezja" },
  "Senne i eteryczne": { icon: "🌙", slug: "senne" },
  "Kino o życiu": { icon: "🎞", slug: "zycie" },
};

// Transform catalog data from JSON
export const katalogCategories = catalogData.categories.map((cat, idx) => ({
  id: idx + 1,
  name: cat.category,
  slug:
    categoryMeta[cat.category]?.slug ||
    cat.category.toLowerCase().replace(/\s+/g, "-"),
  icon: categoryMeta[cat.category]?.icon || "🎬",
  films: cat.films.map((film) => ({
    title: film.title,
    year: film.year,
    tmdb_id: film.tmdb_id,
    poster: film.poster,
    backdrop: film.backdrop,
    overview: film.overview,
    rating: film.rating,
    genres: film.genres,
    director: film.director,
    runtime: film.runtime,
    streaming: film.streaming,
    mood: film.mood,
  })),
  filmTitles: cat.films.map((f) =>
    f.year ? `${f.title} (${f.year})` : f.title,
  ),
}));
