import { createStore, combineReducers } from 'redux'
import { users } from './reducers/users'

const rootReducer = combineReducers({
    users:users
})

let preloadedState
const persistedTodosString = localStorage.getItem('todos')

if (persistedTodosString) {
  preloadedState = {
    todos: JSON.parse(persistedTodosString)
  }
}

export const store = createStore(rootReducer, preloadedState)