import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
export default function ThemeToggle(){
 const [dark,setDark]=useState(()=>localStorage.getItem('frontdesk-theme')==='dark');
 useEffect(()=>{document.documentElement.classList.toggle('dark',dark);localStorage.setItem('frontdesk-theme',dark?'dark':'light')},[dark]);
 return <button type="button" className="theme-toggle" onClick={()=>setDark(v=>!v)} aria-label={dark?'Switch to light mode':'Switch to dark mode'} title={dark?'Light mode':'Dark mode'}>{dark?<Sun size={18}/>:<Moon size={18}/>}<span className="hidden sm:inline">{dark?'Light':'Dark'} mode</span></button>
}
