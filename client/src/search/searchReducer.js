import * as actions from '../actions/searchActions';

const initialState = {
  searchParams: '',
  searchResult: {}
}

export const searchReducer = function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_SEARCH_PARAMS:
      return { ...state, searchParams: action.payload };
    case actions.SET_SEARCH_RESULT:
      return { ...state, searchResult: action.payload };
    default:
      return state;
  }
};
