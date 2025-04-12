import {useEffect, useState} from 'react'

import "../styles/Footer.css"

import ListQuizzByCate from '../components/Quizz/ListQuizzByCate'
import { getAll } from '../api/categoryyApi'

import ChoiceType from '../components/Main/ChoiceType'
import Footer from '../components/common/Footer'
import Chatbot from '../components/common/Chatbot'
import NavBar from '../layout/NavBar'


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
      <NavBar/>
      <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
      <ChoiceType />      
      </div>
      <div>
      {categories.map((category) => (
         <ListQuizzByCate category={category} key={category._id} />
        
      ))}
    </div>
    <Footer/>
    <Chatbot/>
    </div>
  )
}

export default MainPage
