export const SET_SEARCH_PARAMS = 'SET_SEARCH_PARAMS';
export const SET_SEARCH_RESULT = 'SET_SEARCH_RESULT';

export const setSearchParams = searchParams => ({
  type: SET_SEARCH_PARAMS,
  payload: searchParams,
})

export const setSearchResult = searchResult => ({
  type: SET_SEARCH_RESULT,
  payload: searchResult,
})
