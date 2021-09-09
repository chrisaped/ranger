import { connect } from 'react-redux';
import { setSearchParams } from '../actions/searchActions';
import { searchComponent } from './searchComponent';

const mapStateToProps = state => {
  return {
    searchParams: state.search.searchParams,
    searchResult: state.search.searchResult
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setSearchParams: payload => dispatch(setSearchParams(payload)),
  }
};

export const Search = connect(mapStateToProps, mapDispatchToProps)(searchComponent);
