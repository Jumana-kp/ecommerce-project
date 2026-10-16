import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
    loginUser,
    registerUser,
    logoutUser,
} from "../../services/authService";


const getStoredUser = () => {
    try {
        const user = localStorage.getItem("user");

        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};


const getStoredToken = (key) => {
    return localStorage.getItem(key);
};


const initialState = {
    user: getStoredUser(),
    accessToken: getStoredToken("access_token"),
    refreshToken: getStoredToken("refresh_token"),

    isAuthenticated: Boolean(
        getStoredToken("access_token")
    ),

    loading: false,
    error: null,
};


export const login = createAsyncThunk(
    "auth/login",

    async (userData, { rejectWithValue }) => {
        try {
            const response = await loginUser(userData);

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Login failed.",
                }
            );
        }
    }
);


export const register = createAsyncThunk(
    "auth/register",

    async (userData, { rejectWithValue }) => {
        try {
            const response = await registerUser(userData);

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Registration failed.",
                }
            );
        }
    }
);


export const logout = createAsyncThunk(
    "auth/logout",

    async (refreshToken, { rejectWithValue }) => {
        try {
            if (refreshToken) {
                await logoutUser(refreshToken);
            }

            return true;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Logout failed.",
                }
            );
        }
    }
);


const clearStoredAuth = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
};


const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },

        logoutLocally: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;

            clearStoredAuth();
        },
    },

    extraReducers: (builder) => {
        builder

            // LOGIN
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(login.fulfilled, (state, action) => {
    

    state.loading = false;
    state.error = null;

    state.user = action.payload.user;
    state.accessToken = action.payload.access;
    state.refreshToken = action.payload.refresh;
    state.isAuthenticated = true;

    localStorage.setItem(
        "access_token",
        action.payload.access
    );

    localStorage.setItem(
        "refresh_token",
        action.payload.refresh
    );

    localStorage.setItem(
        "user",
        JSON.stringify(action.payload.user)
    );
})

            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })


            // REGISTER
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(register.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })

            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // LOGOUT
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;

                clearStoredAuth();
            })

            .addCase(logout.rejected, (state, action) => {
                /*
                 * Even if the backend logout request fails,
                 * remove the local authentication.
                 */
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = action.payload;

                clearStoredAuth();
            });
    },
});


export const {
    clearAuthError,
    logoutLocally,
} = authSlice.actions;


export default authSlice.reducer;