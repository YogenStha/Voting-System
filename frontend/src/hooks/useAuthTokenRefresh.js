import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function useAuthTokenRefresh(intervalMinutes = 4) {
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(async () => {
            const refresh_token = localStorage.getItem("refresh_token");
            if (!refresh_token) return;

            const response = await fetch("http://localhost:8000/api/token/refresh/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh: refresh_token }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("access_token", data.access);
                console.log("Token refreshed successfully");
            } else {
                console.error("Failed to refresh token");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                navigate('/login'); // Redirect to login if token refresh fails
            }
        }, intervalMinutes * 60 * 1000);

        return () => clearInterval(interval); // Cleanup on unmount

    }, [intervalMinutes, navigate]);
}