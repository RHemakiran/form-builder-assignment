import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreatePage from './pages/CreatePage';
import MyFormsPage from './pages/MyFormsPage';
import PreviewPage from './pages/PreviewPage';
import NavBar from './components/NavBar';

function App(){
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/create" />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/preview/:formId?" element={<PreviewPage />} />
        <Route path="/myforms" element={<MyFormsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

