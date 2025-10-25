/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";

import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import App from '../firebase/firebase.init'



const auth = getAuth(App);
export const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };
    const logIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };
    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    };
    const updateUser = (name, PhotoUrl) => {
        setLoading(true);
        return updateProfile(auth.currentUser, {
            displayName: name, photoURL: PhotoUrl,
        });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser || null);
            setLoading(false);
            console.log("Current User:", currentUser);
        });

        return () => unsubscribe();
    }, []);

    const AuthInfo = {
        user,
        loading,
        setLoading,
        createUser,
        logIn,
        logOut,
        updateUser
    };
    return (
        <AuthContext.Provider value={AuthInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;