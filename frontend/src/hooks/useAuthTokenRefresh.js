
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Helper: check if JWT token is expired
function isTokenExpired(token) {
    if (!token) return true;
    try {
        const [, payload] = token.split(".");
        const { exp } = JSON.parse(atob(payload));
        return Date.now() >= exp * 1000; // exp is in seconds, Date.now is ms
    } catch {
        return true;
    }
}

export default function useAuthTokenRefresh(intervalMinutes = 4) {
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(async () => {
            const accessToken = localStorage.getItem("access_token");
            const refreshToken = localStorage.getItem("refresh_token");

            if (!refreshToken) return;

            // Only refresh if access token is missing or expired
            if (!accessToken || isTokenExpired(accessToken)) {
                try {
                    const response = await fetch("http://localhost:8000/api/token/refresh/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ refresh: refreshToken }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        localStorage.setItem("access_token", data.access);

                        // If backend rotates refresh tokens, save the new one too
                        if (data.refresh) {
                            localStorage.setItem("refresh_token", data.refresh);
                        }

                        console.log("Token refreshed successfully");
                    } else {
                        console.error("Failed to refresh token");
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("refresh_token");
                        navigate("/login");
                    }
                } catch (err) {
                    console.error("Error refreshing token", err);
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    navigate("/login");
                }
            }
        }, intervalMinutes * 60 * 1000); // check every few minutes

        return () => clearInterval(interval); // Cleanup on unmount
    }, [intervalMinutes, navigate]);
}
