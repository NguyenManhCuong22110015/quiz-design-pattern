import React, { useEffect, useState } from 'react'
import NavBar from '../layout/NavBar'
import HeroSection from '../components/Main/HeroSection'
import DailyChallengesSection from '../components/Main/DailyChallengesSection'
import CategoriesSection from '../components/Main/CategoriesSection'
import FeaturesSection from '../components/Main/FeaturesSection'
import GameDemoSection from '../components/Main/GameDemoSection'
import CTASection from '../components/Main/CTASection'
import Footer from '../components/Main/Footer'
import "./../styles/DailyChallengesSection.css";
import { use } from 'react'
import { getChallengesQuiz } from '../api/quizzApi'

import Chatbot from '../components/common/Chatbot'


const MainPa = () => {

  const [challenges,setChallenges] = useState([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await getChallengesQuiz();
        console.log(response)
      
        const data = await response;
        setChallenges(data);
        console.log(challenges)
      } catch (error) {
        console.error('Error fetching challenges:', error);
      }
    };

    fetchChallenges();  
  }, [])


  return (
    <div className="bg-gray-50 font-sans text-gray-800">
        <NavBar/>
        <HeroSection/>
        <FeaturesSection />
        <DailyChallengesSection challenges={challenges} />
      <CategoriesSection  />
      <GameDemoSection />
      <CTASection />
      <Footer />
      <Chatbot/>
    </div>
  )
}

export default MainPa