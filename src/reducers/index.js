import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import rtReducer from './data'

const rootReducer = (history) => combineReducers({
  data: rtReducer,
  router: connectRouter(history)
})

export default rootReducer