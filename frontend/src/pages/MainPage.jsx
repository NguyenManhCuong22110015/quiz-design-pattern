import {useEffect, useState} from 'react'
import Navbar from '../layout/NavBar'
import Choice from '../components/Choice'
import "../styles/Footer.css"
import fight from "/imgs/swords.png"
import partners from "/imgs/partners.png"
import CheckAuth from '../components/common/CheckAuth'
import QuizzCard from '../components/Quizz/QuizzCard'
import ListQuizzByCate from '../components/Quizz/ListQuizzByCate'
import { getAll } from '../api/categoryAPI'

import ChoiceType from '../components/Main/ChoiceType'


const token = localStorage.getItem('token');

const MainPage = () => {
 
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAll()
        
        const jsonData = JSON.stringify(data)
        setCategories(data)
        console.log("data: " + data)
        
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }
  , [])

  return (
    <div className="container">
      <Navbar/>
      <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        
      <ChoiceType />      
      </div>
      <div>
      {categories.map((category) => (
         <ListQuizzByCate category={category} key={category._id} />
        
      ))}
    </div>
    </div>
  )
}

export default MainPage
