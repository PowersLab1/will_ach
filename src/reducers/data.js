const initialState = {
  responses_P :[],
  responses_P_rating :[],
  responses_q_1 :[],
  responses_q_2 :[],
  responses_tt_1 :[],
  responses_tt_2 :[],
  responses_tt_3 :[],
  responses_tt_4 :[],

  response_time_P :[],
  response_time_P_rating :[],
  response_time_q_1 :[],
  response_time_q_2 :[],
  response_time_tt_1 :[],
  response_time_tt_2 :[],
  response_time_tt_3 :[],
  response_time_tt_4 :[],

  ratings_P_rating: [],
  ratings_tt_1: [],
  ratings_tt_2: [],
  ratings_tt_3: [],
  ratings_tt_4: [],

  contrast_P :[],
  contrast_P_rating :[],
  contrast_q_1 :[],
  contrast_q_2 :[],
  contrast_tt_1 :[],
  contrast_tt_2 :[],
  contrast_tt_3 :[],
  contrast_tt_4 :[],
  test: 1,

  trial1Struct: {
    intensities: [],
    parameters: [],
    beta: 0,
  }

}

const rtReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'ADD_ARRAY':
        return state + 1

      //responses
      case 'ADD_RESPONSE_P':
        return {
          ...state,
          responses_P: [...state.responses_P, action.payload]
        }
      case 'ADD_RESPONSE_P_RATING':
        return {
          ...state,
          responses_P_rating: [...state.responses_P_rating, action.payload]
      }
      case 'ADD_RESPONSE_Q_1':
        return {
          ...state,
          responses_q_1: [...state.responses_q_1, action.payload]
        }
      case 'ADD_RESPONSE_Q_2':
        return {
          ...state,
          responses_q_2: [...state.responses_q_2, action.payload]
        }
      case 'ADD_RESPONSE_TT_1':
        return {
          ...state,
          responses_tt_1: [...state.responses_tt_1, action.payload]
        }
      case 'ADD_RESPONSE_TT_2':
        return {
          ...state,
          responses_tt_2: [...state.responses_tt_2, action.payload]
        }
      case 'ADD_RESPONSE_TT_3':
        return {
          ...state,
          responses_tt_3: [...state.responses_tt_3, action.payload]
        }
      case 'ADD_RESPONSE_TT_4':
        return {
          ...state,
          responses_tt_4: [...state.responses_tt_4, action.payload]
        }

      // response times
        case 'ADD_RESPONSE_TIME_P':
          return {
            ...state,
            response_time_P: [...state.response_time_P, action.payload]
          }
        case 'ADD_RESPONSE_TIME_P_RATING':
          return {
            ...state,
            response_time_P_rating: [...state.response_time_P_rating, action.payload]
        }
        case 'ADD_RESPONSE_TIME_Q_1':
          return {
            ...state,
            response_time_q_1: [...state.response_time_q_1, action.payload]
          }
        case 'ADD_RESPONSE_TIME_Q_2':
          return {
            ...state,
            response_time_q_2: [...state.response_time_q_2, action.payload]
          }
        case 'ADD_RESPONSE_TIME_TT_1':
          return {
            ...state,
            response_time_tt_1: [...state.response_time_tt_1, action.payload]
          }
        case 'ADD_RESPONSE_TIME_TT_2':
          return {
            ...state,
            response_time_tt_2: [...state.response_time_tt_2, action.payload]
          }
        case 'ADD_RESPONSE_TIME_TT_3':
          return {
            ...state,
            response_time_tt_3: [...state.response_time_tt_3, action.payload]
          }
        case 'ADD_RESPONSE_TIME_TT_4':
          return {
            ...state,
            response_time_tt_4: [...state.response_time_tt_4, action.payload]
          }

        //ratings
        case 'ADD_RATING_P_RATING':
          return {
            ...state,
            ratings_P_rating: [...state.ratings_P_rating, action.payload]
          }
        case 'ADD_RATING_TT_1':
          return {
            ...state,
            rating_tt_1: [...state.ratings_tt_1, action.payload]
          }
        case 'ADD_RATING_TT_2':
          return {
            ...state,
            rating_tt_2: [...state.ratings_tt_2, action.payload]
          }
        case 'ADD_RATING_TT_3':
          return {
            ...state,
            rating_tt_3: [...state.ratings_tt_3, action.payload]
          }
        case 'ADD_RATING_TT_4':
          return {
            ...state,
            rating_tt_4: [...state.ratings_tt_4, action.payload]
          }

          //contrasts
          case 'ADD_CONTRAST_P':
            return {
              ...state,
              contrast_P: [...state.contrast_P, action.payload]
            }
          case 'ADD_CONTRAST_P_RATING':
            return {
              ...state,
              contrast_P_rating: [...state.contrast_P_rating, action.payload]
            }
          case 'ADD_CONTRAST_Q_1':
            return {
              ...state,
              contrast_q_1: [...state.contrast_q_1, action.payload]
            }
          case 'ADD_CONTRAST_Q_2':
            return {
              ...state,
              contrast_q_2: [...state.contrast_q_2, action.payload]
            }
          case 'ADD_CONTRAST_TT_1':
            return {
              ...state,
              contrast_tt_1: [...state.contrast_tt_1, action.payload]
            }
          case 'ADD_CONTRAST_TT_2':
            return {
              ...state,
              contrast_tt_2: [...state.contrast_tt_2, action.payload]
            }
          case 'ADD_CONTRAST_TT_3':
            return {
              ...state,
              contrast_tt_3: [...state.contrast_tt_3, action.payload]
            }
          case 'ADD_CONTRAST_TT_4':
            return {
              ...state,
              contrast_tt_4: [...state.contrast_tt_4, action.payload]
            }


      case 'ADD_OBJ':
        return {
          ...state,
          trial1Struct: action.payload,
        }
      default:
        return state
    }
  }

  export default rtReducer
