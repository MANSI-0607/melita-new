import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HashLink } from 'react-router-hash-link';
import { ArrowRight, Instagram } from 'lucide-react';
import derm from '@/assets/featues/der.png';
import vegan from '@/assets/featues/Vegan.png';
import indian from '@/assets/featues/Indian Skin.png';
import active from '@/assets/featues/Active.png';
import whitelogo from '@/assets/melita logo white.png';
import imgbg from '../assets/img1.png'
import { Link, useNavigate } from 'react-router-dom';
const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="w-full relative text-[#5D4E37]">
      {/* Features Bar */}
      <div
        className="hidden md:block absolute top-[6%] left-[55%] -translate-x-1/2 
                   w-[800px] h-[120px] bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imgbg})` }}
      >
        <div className="max-w-5xl
          mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
            <div className="flex flex-col items-center space-y-2">
              
               <img src={derm} alt="Dermatologically Tested" className="h-[40px] text-[#835339]" />
             
              <div className="text-[#1e4323] text-[12px] font-headingOne font-medium uppercase text-center">
                <p>DERMATOLOGICALLY</p>
                <p>TESTED</p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              
              <img src={vegan} alt="vegan" className="h-[40px] text-[#835339]" />
            
             <div className="text-[#1e4323] text-[12px] font-headingOne font-medium uppercase text-center">
               <p>VEGAN &</p>
               <p>CRUELTY FREE</p>
             </div>
           </div>
           <div className="flex flex-col items-center space-y-2">
              
              <img src={indian} alt="indian skin" className="h-[40px] text-[#835339]" />
            
             <div className="text-[#1e4323] text-[12px] font-headingOne font-medium uppercase text-center">
               <p>INDIAN SKIN</p>
               <p>FOCUSED</p>
             </div>
           </div>
           <div className="flex flex-col items-center space-y-2">
              
              <img src={active} alt="active" className="h-[40px] text-[#835339]" />
            
             <div className="text-[#1e4323] text-[12px] font-headingOne font-medium uppercase text-center">
               <p>ACTIVES AT</p>
               <p>OPTIMAL PERCENTAGE</p>
             </div>
           </div>
            
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="grid grid-cols-1 md:grid-cols-3">
      
        {/* Left Side - Darker Background */}
        <div className="bg-[#c1a88c] p-8 md:p-12">

            <div className="bg-beige-dark pb-[40px] md:pb-[90px]">
             <img  src={whitelogo} alt="logo" width={180}/>  </div>
              <h3 className="font-headingOne text-2xl font-semibold mb-4">GET IN TOUCH</h3>
              <p className="mb-2">Community@Melita.in</p>
              
              <div className="text-sm mb-10">
                <p>E&L Beauty Solutions Private Limited <br />
                152/20, 3/F Royal Space 5th Main <br />
                7th Sector, Madina Nagar, Hsr <br />
                Layout Bangalore, Karnataka, India <br />
                560102.</p>
              </div>
          

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <button className="w-full border border-beige rounded px-6 py-3 text-left flex justify-between items-center hover:bg-beige-dark hover:border-white">
               <span className='font-medium'>PHONE</span>
               <span className='text-xl'><ArrowRight/></span>
              </button>
              <button className="w-full border border-beige rounded px-6 py-3 text-left flex justify-between items-center hover:bg-beige-dark hover:border-white">
                <span className='font-medium'>EMAIL</span>
                <span className='text-xl'><ArrowRight/></span>
              </button>
              
              <Button className="w-full bg-[#835339] text-white py-3 rounded font-medium 
            hover:bg-white hover:border border-[#835339] hover:text-[#835339]">
                SUBSCRIBE
              </Button>
            </div>
          </div>
             {/* Right Side - Lighter Background */}
        <div className="col-span-2 bg-[#f0e4d4] pt-[40px] md:pt-[205px] px-12 grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-x-8">
          
            <div >
              <h3 className="font-headingOne text-xl font-semibold mb-6">EXPLORE</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-black-600 hover:text-black-800 hover:underline">Cleanser</a></li>
                <li><a href="#" className="text-black-600 hover:text-black-800 hover:underline">Essence</a></li>
                <li><a href="#" className="text-black-600 hover:text-black-800 hover:underline">Moisturizer</a></li>
                <li><a href="#" className="text-black-600 hover:text-black-800 hover:underline">Sunscreen</a></li>
                <li><a href="#" className="text-black-600 hover:text-black-800 hover:underline">Combo</a></li>
              </ul>
            </div>

            {/* Know More */}
            <div className="space-y-4">
              <h3 className="font-headingOne text-xl font-semibold mb-6">KNOW MORE</h3>
              <ul className="space-y-3">
                <li><Link to='/about'className="text-black-600 hover:text-black-800 hover:underline">About Us</Link></li>
                <li><Link to='/shop' className="text-black-600 hover:text-black-800 hover:underline">Shop</Link></li>
                <li><Link to='/blog'className="text-black-600 hover:text-black-800 hover:underline">Blogs</Link></li>
                <li><HashLink smooth to="/#skin-quiz" className="text-black-600 hover:text-black-800 hover:underline">Take a Test</HashLink></li>
                <li><HashLink smooth to="/#whyMelita" className="text-black-600 hover:text-black-800 hover:underline">Why Melita</HashLink></li>
                <li><HashLink smooth to="/#journeyphilosophy" className="text-black-600 hover:text-black-800 hover:underline">Our Journey <br/> & Philosophy</HashLink></li>
               
              </ul>
            </div>

            {/* Info */}
            <div>
              <h3 className="font-headingOne text-xl font-semibold mb-6">INFO</h3>
              <ul className="space-y-3">
                <li><Link to="/terms-conditions" className="text-black-600 hover:text-black-800 hover:underline">Terms & Conditions</Link></li>
                <li><Link to="/refund-returns" className="text-black-600 hover:text-black-800 hover:underline">Refund & Returns</Link></li>
                <li><Link to="/privacy-policy" className="text-black-600 hover:text-black-800 hover:underline">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
      
        </div>

     
      

      {/* Global Divider + Bottom Bar */}
      <div className="w-full">
        {/* Divider */}
      
        <div className="hidden md:block w-[calc(100%-8%)] h-[2px] bg-[#FFFFFF] absolute top-[calc(88%-1px)] left-[4%]"></div>
        {/* Bottom bar grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 py-6 bg-[#f0e4d4] md:py-0 md:bg-transparent">
          {/* Left: social */}
          <div className="bg-[#c1a88c] py-6 px-8 md:p-12">
            <div className='flex items-center'>
            <span className='mt-1 mr-2 pb-1 text-md text-gray-50'>Follow us on</span>
            <a href="https://instagram.com/Melita.luxuryskincare" target="_blank" rel='noopener noreferrer' className="text-[#333] hover:underline hover:text-[#8b5134] transition-colors duration-200 mr-1">melita.luxuryskincare</a>
            <a href="https://instagram.com/Melita.luxuryskincare" target="_blank" rel='noopener noreferrer' className="flex space-x-4 text-gray-50 hover:text-[#1e4323]">
              <Instagram className="w-5 h-5 opacity-90" />
            </a>
            </div>
           
          </div>
        
          {/* Right: copyright */}
          <div className='col-span-2 bg-[#f0e4d4] p-8 md:p-12
                flex justify-center md:justify-end items-center'>
            <p className="text-sm text-center md:text-right">© 2024 Melita. All Rights Reserved.</p>
          </div>
        </div>
      </div>
      
    </footer>
  );
};

export default Footer;