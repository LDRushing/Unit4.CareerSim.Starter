import { useContext } from 'react';
import TokenContext from "./TokenContext.js"

export default function useToken() {
    return useContext (TokenContext)
};