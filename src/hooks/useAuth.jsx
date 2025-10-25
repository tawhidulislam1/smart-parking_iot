import { useContext } from 'react';
import { AuthContext } from '../Provider/authProvider';

const useAuth = () => {
    const context = useContext(AuthContext);
    return context;
};

export default useAuth;
