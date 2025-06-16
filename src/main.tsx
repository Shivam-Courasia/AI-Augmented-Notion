import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'aframe'
import 'aframe-extras';

createRoot(document.getElementById("root")!).render(<App />);
