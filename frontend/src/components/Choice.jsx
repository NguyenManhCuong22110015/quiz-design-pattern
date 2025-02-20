import React from 'react'
import '../styles/Choice.css'
import { Link } from 'react-router-dom'

const Choice = ({img, name, link}) => {
  return (
    <Link to={link} className="choice-link">
      <div className="card bg-dark text-white ms-5 me-5 choice-card">
        <div className="card-body mt-5 mb-5">
            <div className="d-flex align-items-center justify-content-center">
                <img src={img} className="card-img-top" alt="..." style={{ height: "10vh", width: "5vw"}}/>
            </div>
            <div className="d-flex align-items-center justify-content-center">
                <h1>{name}</h1>
            </div>
        </div>
      </div>
    </Link>
  )
}

export default Choice