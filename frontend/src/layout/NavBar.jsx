import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "../styles/Footer.css";
import "../styles/Index.css";
const NavBar = ({ auth, authUser }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="container ms-5 me-5">
    <nav className="navbar navbar-expand-md navbar-dark bg-light fixed-top  ">
      <Link className="navbar-brand" to="/">QUIZZ</Link>

      <button 
        className="navbar-toggler" 
        type="button" 
        data-toggle="collapse" 
        data-target="#navbarSupportedContent" 
        aria-controls="navbarSupportedContent" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse justify-content-end mt-2 mb-2" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
         
        </ul>

        <form className="form-inline my-2 my-lg-0">
          <input 
            id="searchInput" 
            className="form-control mr-sm-2" 
            style={{ border: "1px solid #000000 !important" }}
            type="search" 
            placeholder="Search" 
            aria-label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button id="search-icon" className="btn btn-outline-dark my-2 my-sm-0 ml-2" type="button">
            <FaSearch />
          </button>
        </form>

        <button className="btn btn-outline-success my-2 my-sm-0 ml-2" type="button">
          <Link to="/login" style={{ color: "black" }}>Log in</Link>
        </button>
      </div>
      
    </nav>
    </div>
  );
};

export default NavBar;
