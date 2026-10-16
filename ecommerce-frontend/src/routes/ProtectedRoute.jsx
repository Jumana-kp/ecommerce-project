import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router-dom";

const getAccessToken = () => {
    return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token")
    );
};

export default function ProtectedRoute() {
    const location = useLocation();

    const accessToken = getAccessToken();

    if (!accessToken) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname + location.search,
                }}
            />
        );
    }

    return <Outlet />;
}