import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hook/useDebounce";
import { getMediaSearch } from "../../services/tmdb/tmdb";
import type { MediaItemProps } from "../../types/Media/MediaItemProps";
import { SearchIcon, MenuIcon, XIcon, LogOutIcon } from "lucide-react";
import Logo from "../../assets/logo-cineexplorer-desktop.png";
import {
    logoutUserAuth,
    resendVerificationEmail,
} from "../../services/firebase/auth";
import { toast } from "sonner";

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<MediaItemProps[]>([]);
    const [searchFocus, setSearchFocus] = useState<boolean>(false);

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const { currentUser, firebaseUser } = useAuth();
    const location = useLocation();

    const showSearch: boolean =
        location.pathname !== "/login" &&
        location.pathname !== "/signup" &&
        location.pathname !== "/verify-email" &&
        location.pathname !== "/forgot-password";

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (debouncedSearchTerm.trim().length > 2) {
            const doSearch = async () =>
                setSearchResults(await getMediaSearch(debouncedSearchTerm));
            doSearch();
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add("overflow-hidden");
        }
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node)
            ) {
                setIsProfileMenuOpen(false); 
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCloseMenu = () => {
        setIsMenuOpen(false);
        setSearchTerm("");
    };

    const handleSearch = (value: boolean) => {
        setTimeout(() => setSearchFocus(value), 500);
    };

    const handleLogout = async () => {
        try {
            await logoutUserAuth();
            toast.success(
                <span className="font-bold text-[16px]">
                    Sessão encerrada!
                </span>,
                {
                    description: "Até a proxima.",
                    duration: 2000,
                }
            );
        } catch {
            toast.error(
                <span className="font-bold text-[16px]">Erro ao sair!</span>,
                {
                    description: "Tente novamente.",
                    duration: 2000,
                }
            );
        }
    };

    const handleResendEmail = async () => {
        try {
            await resendVerificationEmail();
            toast.success("E-mail de verificação reenviado!", {
                description: "Por favor, verifique sua caixa de entrada.",
            });
            setIsProfileMenuOpen(false);
        } catch (error) {
            toast.error("Erro ao reenviar e-mail.");
        }
    };

    return (
        <>
            <header
                className={`w-full fixed top-0 left-0 z-30 transition-all duration-300 ease-in-out pb-1 ${
                    isScrolled
                        ? "bg-slate-900 shadow-lg shadow-black"
                        : "bg-transparent"
                }`}
            >
                <nav className="container mx-auto py-6 px-6 flex items-center justify-between">
                    <div className="flex items-center md:gap-8 gap-5">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 cursor-pointer"
                        >
                            <MenuIcon className="text-slate-100 hover:text-sky-500 transition-all" />
                        </button>
                        <Link to="/" onClick={handleCloseMenu}>
                            <img
                                src={Logo}
                                className="md:h-16 h-14"
                                alt="CineExplorer Logo"
                            />
                        </Link>
                    </div>

                    {showSearch && (
                        <div className="hidden md:flex relative items-center gap-2">
                            <SearchIcon className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por um filme ou série..."
                                className="bg-transparent text-slate-100 focus:outline-none w-56 border-b-1 border-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => handleSearch(true)}
                                onBlur={() => handleSearch(false)}
                            />
                            {searchTerm &&
                                searchResults.length > 0 &&
                                searchFocus && (
                                    <div className="absolute top-full right-2 pr-4 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-800 rounded-lg shadow-xl">
                                        <ul>
                                            {searchResults.map((item) => (
                                                <li key={item.id}>
                                                    <Link
                                                        to={`/${item.media_type}/${item.id}`}
                                                        className="flex items-center gap-4 p-3 hover:bg-slate-700 transition-colors"
                                                    >
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                                            alt=""
                                                            className="w-10 h-14 object-cover rounded"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-slate-100">
                                                                {item.title ||
                                                                    item.name}
                                                            </p>
                                                            <p className="text-sm text-slate-400">
                                                                {item.media_type ===
                                                                "movie"
                                                                    ? "Filme"
                                                                    : "Série"}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                        </div>
                    )}

                    <div className="relative" ref={profileMenuRef}>
                        {currentUser ? (
                            <div className="relative md:mr-4">
                                <button
                                    className={`relative flex items-center gap-2 text-slate-100 cursor-pointer py-1 px-2 rounded-lg`}
                                    onClick={() =>
                                        setIsProfileMenuOpen(
                                            (prevState) => !prevState
                                        )
                                    }
                                >
                                    {isProfileMenuOpen && (
                                        <span className="absolute inset-0 ring-2 ring-sky-400 rounded-full animate-pulse"></span>
                                    )}

                                    <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-bold">
                                        {currentUser.name.charAt(0)}

                                        {!firebaseUser?.emailVerified && (
                                            <span
                                                className="absolute top-0 left-1.5 block h-3 w-3 rounded-full bg-yellow-400 ring-2 ring-slate-900"
                                                title="E-mail não verificado"
                                            ></span>
                                        )}
                                    </div>
                                    <span className="font-semibold">
                                        {currentUser.name}
                                    </span>
                                </button>

                                {isProfileMenuOpen && (
                                    <div className="mt-4 absolute top-full right-0 w-56 bg-slate-800 rounded-lg shadow-xl overflow-hidden">
                                        <div className="px-4 py-3 border-b border-slate-700">
                                            <p
                                                className="font-bold text-slate-100 truncate"
                                                title={currentUser.name}
                                            >
                                                {currentUser.name}
                                            </p>
                                            <p
                                                className="text-sm text-slate-400 truncate"
                                                title={currentUser.email ?? ""}
                                            >
                                                {currentUser.email}
                                            </p>
                                        </div>

                                        <ul className="py-2">
                                            {!firebaseUser?.emailVerified && (
                                                <li>
                                                    <button
                                                        onClick={
                                                            handleResendEmail
                                                        }
                                                        className="block w-full text-left px-4 py-2 text-yellow-400 hover:bg-slate-700 transition-colors cursor-pointer"
                                                    >
                                                        Verificar E-mail
                                                    </button>
                                                </li>
                                            )}

                                            <li>
                                                <Link
                                                    to="/"
                                                    className="block w-full text-left px-4 py-3 text-slate-100 hover:bg-slate-700 transition-colors"
                                                    onClick={() =>
                                                        setIsProfileMenuOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    Inicio
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    to="/myfavorites"
                                                    className="block w-full text-left px-4 py-3 text-slate-100 hover:bg-slate-700 transition-colors"
                                                    onClick={() =>
                                                        setIsProfileMenuOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    Meus Favoritos
                                                </Link>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={handleLogout}
                                                    className="cursor-pointer flex gap-2 w-full text-left px-4 py-3 text-red-400 hover:bg-slate-700 transition-colors"
                                                >
                                                    <LogOutIcon /> Sair
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-sky-600 text-white font-bold px-8 py-2 rounded-lg hover:bg-sky-700 transition-colors mr-4"
                            >
                                Entrar
                            </Link>
                        )}
                    </div>
                </nav>
            </header>

            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40"
                    onClick={handleCloseMenu}
                ></div>
            )}

            {/* SIDEBAR */}
            <div
                className={`
                fixed top-0 left-0 h-full w-4/5 max-w-xs bg-slate-900 shadow-xl z-50 p-6 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="flex items-center justify-between pb-6 border-b border-slate-700">
                    <h2 className="text-xl text-sky-500 font-bold">
                        Navegação
                    </h2>
                    <button onClick={handleCloseMenu}>
                        <XIcon className="text-slate-100 cursor-pointer hover:text-sky-500 transition-all" />
                    </button>
                </div>

                <div className="flex items-center gap-2 border border-slate-700 rounded-lg p-2 my-6">
                    <SearchIcon className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-transparent text-slate-100 w-full focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar ">
                    {searchResults.length > 0 ? (
                        <ul className="overflow-y-auto custom-scrollbar transition-all">
                            {searchResults.map((item) => (
                                <li key={item.id}>
                                    <Link
                                        to={`/${item.media_type}/${item.id}`}
                                        onClick={handleCloseMenu}
                                        className="flex items-center gap-4 p-3 hover:bg-slate-700 transition-colors rounded-lg"
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                            alt=""
                                            className="w-12 h-16 object-cover rounded"
                                        />
                                        <div>
                                            <p className="font-bold text-slate-100">
                                                {item.title || item.name}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                {item.media_type === "movie"
                                                    ? "Filme"
                                                    : "Série"}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className="flex flex-col gap-2 font-bold text-xl pt-8 flex-1  transition-all">
                            <li>
                                <NavLink
                                    to={"/"}
                                    className={({ isActive }) =>
                                        `block p-4 rounded-lg  transition-all ${
                                            isActive
                                                ? "bg-sky-600 text-white"
                                                : "text-slate-100 hover:bg-slate-700"
                                        }`
                                    }
                                    onClick={handleCloseMenu}
                                >
                                    Início
                                </NavLink>
                            </li>

                            {currentUser && (
                                <li>
                                    <NavLink
                                        to="/myfavorites"
                                        className={({ isActive }) =>
                                            `block p-4 rounded-lg ${
                                                isActive
                                                    ? "bg-sky-600 text-white"
                                                    : "text-slate-100 hover:bg-slate-700"
                                            }`
                                        }
                                        onClick={handleCloseMenu}
                                    >
                                        Meus Favoritos
                                    </NavLink>
                                </li>
                            )}

                            <li>
                                <a
                                    href={"/#movies"}
                                    className="block p-4 rounded-lg text-slate-100 hover:bg-slate-700  transition-all"
                                    onClick={handleCloseMenu}
                                >
                                    Filmes
                                </a>
                            </li>
                            <li>
                                <a
                                    href={"/#series"}
                                    className="block p-4 rounded-lg text-slate-100 hover:bg-slate-700  transition-all"
                                    onClick={handleCloseMenu}
                                >
                                    Séries
                                </a>
                            </li>
                            {/* Futuramente: <li><NavLink to={"/minha-lista"} ...>Minha Lista</NavLink></li> */}
                        </ul>
                    )}
                </div>

                {currentUser && (
                    <div className="mt-auto pt-6 border-t border-slate-700">
                        <button
                            className="w-full flex gap-2 cursor-pointer text-left p-4 rounded-lg text-red-400 hover:bg-slate-700 hover:text-red-500 transition-all"
                            onClick={handleLogout}
                        >
                            <LogOutIcon /> Sair
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
