import { api } from "./api";

import type { MediaItemProps } from "../../types/Media/MediaItemProps";
import type { MediaDetailsProps } from "../../types/Media/MediaDetailsProps";
import type { Credits } from "../../types/Media/MediaDetailsProps";
import type { VideoProps } from "../../types/Media/VideoProps";
import type { WatchProviderResponse } from "../../types/Media/MediaDetailsProps";

export const getTrendingMovies = async (): Promise<MediaItemProps[]> => {
    try {
        const response = await api.get("/trending/movie/week");

        return response.data.results;
    } catch (error) {
        console.error("Erro ao buscar os filmes em alta: ", error);
        return [];
    }
};

export const getPopularSeries = async (): Promise<MediaItemProps[]> => {
    try {
        const response = await api.get("/tv/popular");

        return response.data.results;
    } catch (error) {
        console.error("Erro ao buscar as medias populares: ", error);
        return [];
    }
};

export const getMediaTrailer = async (
    movieId: number,
    mediaType: string
): Promise<VideoProps[]> => {
    try {
        const response = await api.get(`/${mediaType}/${movieId}/videos`);
        return response.data.results;
    } catch (error) {
        console.error(`Erro ao buscar vídeos para o filme ${movieId}:`, error);
        return [];
    }
};

export function findBestTrailer(
    videos: VideoProps[],
    mediaType: "movie" | "tv"
): VideoProps | null {
    const youtubeTrailers = videos.filter(
        (v) => v.site === "YouTube" && v.type === "Trailer"
    );

    if (mediaType === "tv") {
        const seasonOneRegex = /temporada 1|season 1|1ª/i;

        const spoilerSeasonRegex = /temporada [2-9]|season [2-9]|[2-9]ª/i;

        const dubbedSeasonOne = youtubeTrailers.find(
            (v) =>
                v.official &&
                v.name.toLowerCase().includes("dublado") &&
                seasonOneRegex.test(v.name)
        );
        if (dubbedSeasonOne) return dubbedSeasonOne;

        const officialSeasonOne = youtubeTrailers.find(
            (v) => v.official && seasonOneRegex.test(v.name)
        );
        if (officialSeasonOne) return officialSeasonOne;

        const genericOfficialTrailer = youtubeTrailers.find(
            (v) => v.official && !spoilerSeasonRegex.test(v.name.toLowerCase())
        );

        if (genericOfficialTrailer) return genericOfficialTrailer;
    }

    const dubbedTrailer = youtubeTrailers.find(
        (v) => v.official && v.name.toLowerCase().includes("dublado")
    );
    if (dubbedTrailer) return dubbedTrailer;

    const officialPtTrailer = youtubeTrailers.find(
        (v) => v.official && v.iso_639_1 === "pt"
    );
    if (officialPtTrailer) return officialPtTrailer;

    const anyOfficialTrailer = youtubeTrailers.find((v) => v.official);
    if (anyOfficialTrailer) return anyOfficialTrailer;

    return youtubeTrailers.length > 0 ? youtubeTrailers[0] : null;
}

export const getMediaDetails = async (
    mediaId: number,
    mediatype: string
): Promise<MediaDetailsProps | null> => {
    try {
        const response = await api.get(`/${mediatype}/${mediaId}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao busca detalhes da midia ${mediaId}: ${error}`);
        return null;
    }
};

export const getMediaCredits = async (
    movieId: number,
    mediaType: string
): Promise<Credits | null> => {
    try {
        const response = await api.get(`/${mediaType}/${movieId}/credits`);
        return response.data;
    } catch (error) {
        console.error(
            `Erro ao buscar os creditos dos filme ${movieId}: ${error}`
        );
        return null;
    }
};

export const getMediaRecommendations = async (
    movieId: number,
    mediaType: string
): Promise<MediaItemProps[]> => {
    try {
        const response = await api.get(
            `/${mediaType}/${movieId}/recommendations`
        );
        return response.data.results.slice(0, 10);
    } catch (error) {
        console.error(
            `Erro ao buscar recomendações para o filme ${movieId}:`,
            error
        );
        return [];
    }
};

export const getMediaSearch = async (
    searchText: string
): Promise<MediaItemProps[]> => {
    try {
        const response = await api.get(`/search/multi`, {
            params: { query: searchText },
        });

        return response.data.results.filter(
            (item: MediaItemProps) =>
                (item.media_type === "movie" || item.media_type === "tv") &&
                item.poster_path
        );
    } catch (error) {
        console.error("Erro ao fazer busca:", error);
        return [];
    }
};

export const getMediaWatchProviders = async (
    mediaType: string,
    mediaId: number
): Promise<WatchProviderResponse | null> => {
    try {
        const response = await api.get(
            `/${mediaType}/${mediaId}/watch/providers`
        );
        return response.data;
    } catch (error) {
        return null;
    }
};
