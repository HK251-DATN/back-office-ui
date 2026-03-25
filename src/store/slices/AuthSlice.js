import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getUserInfo } from "../../services/userService";

// Helper function to safely parse JSON from localStorage
const getFromStorage = (key, isJSON = true) => {
    try {
        const item = localStorage.getItem(key);
        return isJSON ? JSON.parse(item) : item;
    } catch {
        return null;
    }
};

const initialState = {
    user: getFromStorage('user'),
    token: getFromStorage('token', false),
    role: getFromStorage('role'), // roles is likely an array
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null
}

export const login = createAsyncThunk(
    'auth/login',
    async (credetials, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:9000/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credetials)
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.message);
            }

            let data = await response.json();

            const getUserRes = await getUserInfo(data.detail.user.id, data.detail.accessToken);

            if (getUserRes.status !== 200) {
                console.log("get user info fail");
                // const error = await response.json();
                // console.log(error);
                // Set info to the basic user info stored in identity
                localStorage.setItem('user', JSON.stringify(data.detail.user));
            } else {
                console.log("get user info success");

                console.log('user: ', getUserRes.data.detail);

                // Set info to the user info stored in back-office (more detail)
                localStorage.setItem('user', JSON.stringify(getUserRes.data.detail));

                data.detail.user = getUserRes.data.detail
            }

            localStorage.setItem('token', data.detail.accessToken);

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    })

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.message);
            }

            const data = await response.json();

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            // Optional: call logout endpoint
            await fetch('/api/auth/logout', { method: 'POST' });

            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            return null;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Check if user is already logged in (on app load)
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (!token || !user) {
                return rejectWithValue('No stored credentials');
            }

            // Optional: verify token with backend
            const response = await fetch('/api/auth/verify', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return rejectWithValue('Invalid token');
            }

            return {
                user: JSON.parse(user),
                token
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// The slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Synchronous actions
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                console.log("action: ", action)
                console.log("state: ", state)
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.detail.user;
                state.token = action.payload.detail.accessToken;
                state.role = action.payload.detail.roles;
                state.error = null;

                // ✅ CRITICAL: Persist to localStorage
                localStorage.setItem('user', JSON.stringify(action.payload.detail.user));
                localStorage.setItem('token', action.payload.detail.accessToken);
                localStorage.setItem('role', JSON.stringify(action.payload.detail.roles)); // Note: roles is array
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Login failed';
            })

            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.role = action.payload.user.role;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Registration failed';
            })

            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.role = null;
                state.error = null;
            })

            // Check Auth
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.role = action.payload.user.role;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.role = null;
            });
    },
});

export const { clearError, updateUser } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectUserRole = (state) => state.auth.role;

export default authSlice.reducer;