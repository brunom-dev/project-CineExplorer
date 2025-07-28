import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";

import type {
    FavoriteItemProps,
    MediaItemProps,
} from "../../types/Media/MediaItemProps.ts";
import type {
    MediaDetailsProps,
    Genre,
    Credits,
    WatchProviderResponse,
} from "../../types/Media/MediaDetailsProps.ts";

import { MediaCard } from "../../components/MediaCard/index";
import { ModalTrailer } from "../../components/ModalTrailer";
import { CastCard } from "../../components/CastCard";

import {
    getMediaDetails,
    getMediaTrailer,
    findBestTrailer,
    getMediaCredits,
    getMediaRecommendations,
    getMediaWatchProviders,
} from "../../services/tmdb/tmdb.ts";
import { SkeletonCard } from "../../components/SkeletonCard";
import { AlertTriangleIcon } from "lucide-react";
import { Spinner } from "../../components/Spinner";
import { FavoriteButton } from "../../components/FavoriteButton/index.tsx";
import { WatchProviders } from "../../components/WatchProviders/index.tsx";

export function MediaDetailsPage() {
    const location = useLocation();
    const { id } = useParams();

    const mediaType = location.pathname.startsWith("/movie") ? "movie" : "tv";

    const [details, setDetails] = useState<MediaDetailsProps | null>(null);
    const [credits, setCredits] = useState<Credits | null>(null);
    const [watchProviders, setWatchProviders] =
        useState<WatchProviderResponse | null>(null);
    const [recommendations, setRecommendations] = useState<MediaItemProps[]>(
        []
    );
    const [trailerKey, setTrailerKey] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (id) {
                const movieId = parseInt(id, 10);
                setDetails(null);
                setTrailerKey(null);
                setCredits(null);
                setIsLoading(true);
                setWatchProviders(null);

                const [
                    detailsResponse,
                    videosResponse,
                    creditsResponse,
                    recommendationsResponse,
                    watchProvidersResponse,
                ] = await Promise.all([
                    getMediaDetails(movieId, mediaType),
                    getMediaTrailer(movieId, mediaType),
                    getMediaCredits(movieId, mediaType),
                    getMediaRecommendations(movieId, mediaType),
                    getMediaWatchProviders(mediaType, movieId),
                ]);

                setDetails(detailsResponse);
                setCredits(creditsResponse);
                setRecommendations(recommendationsResponse);
                setWatchProviders(watchProvidersResponse);

                const bestTrailer = findBestTrailer(videosResponse, mediaType);
                if (bestTrailer) {
                    setTrailerKey(bestTrailer.key);
                }
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id, mediaType]);

    if (isLoading) {
        return (
            <>
                <div className="flex min-h-screen items-center justify-center md:hidden">
                    <Spinner />
                </div>

                <div className="bg-slate-950 min-h-screen mt-15 w-full hidden md:block">
                    <div className="container md:px-10 px-20 py-24 relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="w-full md:w-1/4 flex-shrink-0">
                            <div className="aspect-[3/4] w-full bg-slate-800 rounded-xl animate-pulse"></div>
                        </div>

                        <div className="w-full md:w-2/3 animate-pulse">
                            <div className="h-12 w-3/4 bg-slate-700 rounded-lg"></div>
                            <div className="h-6 w-1/2 bg-slate-700 rounded-md mt-4"></div>
                            <div className="h-20 w-full bg-slate-700 rounded-md mt-6"></div>
                            <div className="h-12 w-48 bg-slate-700 rounded-lg mt-8"></div>
                        </div>
                    </div>

                    <main className="mt-2 mb-10 px-10">
                        <div className="">
                            <div className="h-8 w-64 bg-slate-700 rounded-md animate-pulse mb-6"></div>
                            <div className="flex overflow-x-auto gap-4 py-4">
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="w-36 flex-shrink-0"
                                    >
                                        <div className="h-44 w-full bg-slate-800 rounded-lg animate-pulse"></div>
                                        <div className="h-4 w-28 bg-slate-700 rounded-md mt-2 mx-auto"></div>
                                        <div className="h-3 w-20 bg-slate-700 rounded-md mt-1 mx-auto"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-12">
                            <div className="h-8 w-72 bg-slate-700 rounded-md animate-pulse mb-6"></div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <SkeletonCard key={index} />
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </>
        );
    }

    if (!details) {
        return (
            <div className="bg-slate-950 flex  min-h-screen">
                <div className="container mx-auto px-6 py-24 flex justify-center items-center">
                    <div className="bg-slate-800 p-8 rounded-xl shadow-lg text-center max-w-lg">
                        <AlertTriangleIcon className="h-20 w-20 mx-auto text-sky-600" />

                        <h2 className="text-3xl font-bold text-slate-100 mt-6">
                            Cena Cortada
                        </h2>
                        <p className="text-slate-400 mt-2">
                            O filme que você busca pode não existir ou o rolo se
                            perdeu. Vamos voltar ao lobby e escolher outro
                            sucesso!
                        </p>

                        <div className="mt-8">
                            <Link
                                to="/"
                                className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
                            >
                                Voltar para o Início
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const backdropUrl = `https://image.tmdb.org/t/p/original${details.backdrop_path}`;
    const posterUrl = `https://image.tmdb.org/t/p/w500${details.poster_path}`;

    const releaseDate =
        "release_date" in details
            ? details.release_date
            : details.first_air_date;

    const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

    const formattedRuntime =
        "runtime" in details && details.runtime > 0
            ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
            : null;

    const mediaItem: FavoriteItemProps = {
        id: details.id,
        name: details.name,
        title: details.title,
        media_type: mediaType,
    };

    return (
        <div className="min-h-[90vh] text-white">
            <section className="relative w-full pt-20 flex justify-center">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: `url(${backdropUrl})` }}
                ></div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50"></div>

                <div className="container md:px-10 px-20 py-24 relative z-10 flex flex-col md:flex-row gap-10">
                    <figure className="w-full md:w-1/4">
                        <img
                            src={posterUrl}
                            alt={`Pôster de ${details.title}`}
                            className="rounded-xl shadow-2xl w-full"
                            loading="lazy"
                        />
                    </figure>

                    <div className="w-full md:w-2/3 text-center md:text-left text-slate-100">
                        <div className="flex gap-3 items-center relative md:justify-start justify-center">
                            <h1 className="text-4xl lg:text-5xl font-bold  mt-5 relative text-center">
                                {mediaType === "movie"
                                    ? details.title
                                    : details.name}{" "}
                                ({year})

                            </h1>

                            <div className="mt-5">
                                <FavoriteButton
                                    mediaItem={mediaItem}
                                    absoluteProp={false}
                                 />
                            </div>

                        </div>

                        {details.tagline && (
                            <p className="text-slate-300 italic mt-2 text-lg">
                                "{details.tagline}"
                            </p>
                        )}

                        <div className="flex items-center justify-center md:justify-start flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-slate-300">
                            {"runtime" in details && details.runtime > 0 && (
                                <>
                                    <span>{formattedRuntime}</span>
                                </>
                            )}

                            {"number_of_seasons" in details && (
                                <>
                                    <span>
                                        {details.number_of_seasons} Temporada(s)
                                    </span>
                                </>
                            )}

                            {details.genres.length > 0 && <span>•</span>}
                            <div className="flex gap-2 flex-wrap justify-center">
                                {details.genres.map((genre: Genre) => (
                                    <span
                                        key={genre.id}
                                        className="bg-slate-700 px-3 py-1 rounded-full"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-xl font-bold text-sky-500">
                                Sinopse
                            </h3>
                            <p className="text-slate-200 mt-2">
                                {details.overview}
                            </p>
                        </div>

                        <div className="mt-4">
                            <button
                                className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg disabled:bg-slate-700 disabled:cursor-not-allowed cursor-pointer"
                                onClick={() => setIsModalOpen(true)}
                                disabled={!trailerKey}
                            >
                                ▶{" "}
                                {trailerKey
                                    ? "Assistir Trailer"
                                    : "Trailer Indisponível"}
                            </button>
                        </div>

                        <WatchProviders providers={watchProviders} />
                    </div>
                </div>
            </section>

            {credits && credits.cast.length > 0 && (
                <section className="mt-0 mb-10 px-10" data-aos="fade-up">
                    <h2 className="text-2xl md:text-3xl text-slate-100 font-bold mb-3">
                        Elenco Principal
                    </h2>

                    <div className="flex overflow-x-auto gap-4 py-4">
                        {credits.cast.slice(0, 15).map((member) => (
                            <CastCard key={member.id} member={member} />
                        ))}
                    </div>
                </section>
            )}

            {recommendations && recommendations.length > 0 && (
                <section className="mt-16 px-10" data-aos="fade-up">
                    <h2 className="text-2xl md:text-3xl text-slate-100 font-bold mb-6">
                        Você também pode gostar
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-16">
                        {recommendations.map((movie) => (
                            <MediaCard
                                key={movie.id}
                                {...movie}
                                media_type={mediaType}
                            />
                        ))}
                    </div>
                </section>
            )}

            <ModalTrailer
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                videoKey={trailerKey}
            />
        </div>
    );
}
