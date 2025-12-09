import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // Real-time search
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        placeholder="Search restaurants, cuisines..."
        value={query}
        onChange={handleChange}
        className="search-input"
      />
      <button type="submit" className="search-button">
        🔍 Search
      </button>
    </form>
  );
}

export default SearchBar;