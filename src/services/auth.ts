import { useState, useEffect } from "react";
import { createAuth0Client } from "@auth0/auth0-spa-js";
import type { Auth0Client, User } from "@auth0/auth0-spa-js";
import { useNavigate } from "react-router-dom";

// Replace with your Auth0 credentials
const domain = "yashdhokane.us.auth0.com";
const clientId = "pT6QzsDerLyYLIjJljXOAoMWf4yspmyD";

let auth0Client: Auth0Client | null = null;

const initAuth0 = async () => {
  if (!auth0Client) {
    auth0Client = await createAuth0Client({
      domain,
      clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
      cacheLocation: "localstorage",
    });
  }
  return auth0Client;
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const client = await initAuth0();

        // Check if the user was redirected after login
        if (window.location.search.includes("code=")) {
          await client.handleRedirectCallback();
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          const authenticated = await client.isAuthenticated();
          if (authenticated) {
            const userProfile = await client.getUser();
            setUser(userProfile);
            setIsAuthenticated(true);

            // Navigate to /exams after successful login
            navigate("/exams");
          }
        } else {
          const authenticated = await client.isAuthenticated();
          setIsAuthenticated(authenticated);

          if (authenticated) {
            const userProfile = await client.getUser();
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error("Error initializing Auth0", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [navigate]);

  const login = async () => {
    try {
      const client = await initAuth0();
      await client.loginWithRedirect();
    } catch (error) {
      console.error("Login error", error);
    }
  };

  const logout = async () => {
    try {
      const client = await initAuth0();
      await client.logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
};
