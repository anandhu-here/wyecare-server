import { LOGIN_FAILED, LOGIN_SUCCESS } from "../types";

const initialState = {
    userInfo:null
}

export const users = (state=initialState, action) =>{
    switch (action.type) {
        case LOGIN_SUCCESS:
            return{
                ...state,
                userInfo:action.payload
            }
            break;
        case LOGIN_FAILED:
            return{
                ...state,
                userInfo:null
            }
            break;
    
        default:
            return{
                ...state,
                userInfo:null
            }
    }
}