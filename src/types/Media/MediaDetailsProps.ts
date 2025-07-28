export type Genre = {
    id: number;
    name: string;
};

export type CastMember = {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
};

export type Credits = {
    id: number;
    cast: CastMember[];
};

export type MediaDetailsProps = {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    release_date?: string; // filmes
    first_air_date?: string; // series
    runtime: number; // filmes
    number_of_seasons?: number; // series
    genres: Genre[];
    vote_average: number;
    tagline: string;
};

export type WatchProvider = {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}

export type WatchProviderCountryResults = {
  link: string;
  flatrate?: WatchProvider[]; // Assinatura
  rent?: WatchProvider[];     // Alugar
  buy?: WatchProvider[];      // Comprar
};

export type WatchProviderResponse = {
  id: number;
  results: {
    [countryCode: string]: WatchProviderCountryResults;
  };
};