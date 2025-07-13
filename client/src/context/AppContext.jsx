import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext()

export const AppProvider = ({ children })=>{

    const [isAdmin, setIsAdmin] = useState(null)
    const [shows, setShows] = useState([])
    const [showsError, setShowsError] = useState("");
    const [favoriteMovies, setFavoriteMovies] = useState([])

    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

    const {user} = useUser()
    const {getToken} = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const fetchIsAdmin = async ()=>{
        try {
            const {data} = await axios.get('/api/admin/is-admin', {headers: {Authorization: `Bearer ${await getToken()}`}})
            setIsAdmin(data.isAdmin)

            if(!data.isAdmin && location.pathname.startsWith('/admin')){
                navigate('/')
                toast.error('You are not authorized to access admin dashboard')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchShows = async ()=>{
        try {
            const { data } = await axios.get('/api/show/all')
            if(data.success && data.shows.length > 0){
                setShows(data.shows)
                setShowsError("")
            }else{
                // Fallback: fetch from backend TMDB proxy endpoint
                const { data: tmdbData } = await axios.get('/api/show/tmdb-now-playing');
                if (tmdbData.success && tmdbData.movies.length > 0) {
                  setShows(tmdbData.movies.map(movie => ({
                    ...movie,
                    _id: movie.id,
                    genres: movie.genre_ids ? movie.genre_ids.map(id => ({ id, name: "" })) : [],
                    casts: [],
                    showPrice: 10,
                    runtime: movie.runtime || 120
                  })));
                  setShowsError("");
                } else {
                  setShowsError("No movies available.");
                }
            }
        } catch (error) {
            setShowsError("Failed to load movies. Please try again later.")
            console.error(error)
        }
    }

    const fetchFavoriteMovies = async ()=>{
        try {
            const { data } = await axios.get('/api/user/favorites', {headers: {Authorization: `Bearer ${await getToken()}`}})

            if(data.success){
                setFavoriteMovies(data.movies)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(()=>{
        fetchShows()
    },[])

    useEffect(()=>{
        if(user){
            fetchIsAdmin()
            fetchFavoriteMovies()
        }
    },[user])

    const value = {
        axios,
        fetchIsAdmin,
        user, getToken, navigate, isAdmin, shows, 
        showsError,
        favoriteMovies, fetchFavoriteMovies, image_base_url
    }

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    )
}

export const useAppContext = ()=> useContext(AppContext)