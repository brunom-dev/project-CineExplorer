// src/components/WatchProviders.tsx

import type { WatchProviderResponse } from "../../types/Media/MediaDetailsProps";

type WatchProvidersProps = {
    providers: WatchProviderResponse | null;
};

export const WatchProviders = ({ providers }: WatchProvidersProps) => {
    const providersInBrazil = providers?.results?.BR;

    if (
        !providersInBrazil ||
        (!providersInBrazil.flatrate &&
            !providersInBrazil.rent &&
            !providersInBrazil.buy)
    ) {
        return (
            <div className="mt-6">
                <h3 className="text-xl font-bold text-sky-500">
                    Onde Assistir
                </h3>
                <p className="text-slate-400 mt-2 text-sm">
                    Informação de streaming não disponível para esta mídia no
                    seu país.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-sky-500 mb-4">
                Onde Assistir
            </h3>
            <div className="md:flex gap-10">
                {providersInBrazil.flatrate && (
                    <div className="mb-4">
                        <h4 className="text-slate-300 font-semibold mb-2">
                            Streaming
                        </h4>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {providersInBrazil.flatrate.map((provider) => (
                                <a
                                    href={providersInBrazil.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={provider.provider_id}
                                    title={provider.provider_name}
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                        alt={provider.provider_name}
                                        className="w-12 h-12 rounded-lg"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {providersInBrazil.rent && (
                    <div className="mb-4">
                        <h4 className="text-slate-300 font-semibold mb-2">
                            Alugar
                        </h4>
                        <div className="flex flex-wrap gap-4  justify-center">
                            {providersInBrazil.rent.map((provider) => (
                                <a
                                    href={providersInBrazil.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={provider.provider_id}
                                    title={provider.provider_name}
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                        alt={provider.provider_name}
                                        className="w-12 h-12 rounded-lg"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {providersInBrazil.buy && (
                    <div>
                        <h4 className="text-slate-300 font-semibold mb-2">
                            Comprar
                        </h4>
                        <div className="flex flex-wrap gap-4 md:justify-start justify-center">
                            {providersInBrazil.buy.map((provider) => (
                                <a
                                    href={providersInBrazil.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={provider.provider_id}
                                    title={provider.provider_name}
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                        alt={provider.provider_name}
                                        className="w-12 h-12 rounded-lg"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
