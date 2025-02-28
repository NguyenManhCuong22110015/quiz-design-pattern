import {useEffect} from 'react'
import Navbar from '../layout/NavBar'
import Choice from '../components/Choice'
import "../styles/Footer.css"
import fight from "/imgs/swords.png"
import partners from "/imgs/partners.png"
import CheckAuth from '../components/common/CheckAuth'
const token = localStorage.getItem('token');

const MainPage = () => {
 
  return (
    <div className="container">
      <Navbar/>
      <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        
            <Choice img={fight} name = {"Challenge"} link={"/"}/>
            <Choice  img={partners} name = {"Room"} link={"/room/list"}/>


      </div>
    </div>
  )
}

export default MainPage
