// Define action types related to Aggregator directly within the reducer file
export const SET_AGGREGATOR_INSTANCE = 'SET_AGGREGATOR_INSTANCE';
export const FETCH_AGGREGATOR_DATA_REQUEST = 'FETCH_AGGREGATOR_DATA_REQUEST';
export const FETCH_AGGREGATOR_DATA_SUCCESS = 'FETCH_AGGREGATOR_DATA_SUCCESS';
export const FETCH_AGGREGATOR_DATA_FAILURE = 'FETCH_AGGREGATOR_DATA_FAILURE';
export const UPDATE_AGGREGATOR_DATA = 'UPDATE_AGGREGATOR_DATA';
export const SET_PRICE = 'SET_PRICE'; // Add action type for setting price

// Define setAggregator action creator
export const setAggregator = (aggregatorInstance) => ({
  type: SET_AGGREGATOR_INSTANCE,
  payload: aggregatorInstance
});

// Define setPrice action creator
export const setPrice = (price) => ({
  type: SET_PRICE,
  payload: price
});

// Initial state for the aggregator reducer
const initialState = {
  aggregatorInstance: null,
  data: null,
  isLoading: false,
  error: null,
  price: 0 // Add price to the initial state
};

// Aggregator reducer function
const aggregatorReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_AGGREGATOR_INSTANCE:
      return {
        ...state,
        aggregatorInstance: action.payload
      };
    case FETCH_AGGREGATOR_DATA_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case FETCH_AGGREGATOR_DATA_SUCCESS:
      return {
        ...state,
        isLoading: false,
        data: action.payload,
        error: null
      };
    case FETCH_AGGREGATOR_DATA_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case UPDATE_AGGREGATOR_DATA:
      return {
        ...state,
        data: action.payload
      };
    case SET_PRICE:
      return {
        ...state,
        price: action.payload
      };
    default:
      return state;
  }
};

export default aggregatorReducer;
