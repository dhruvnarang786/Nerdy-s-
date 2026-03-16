
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AuthProvider } from '@/lib/AuthContext';
import { Home } from '@/pages/Home';
import { Trending } from '@/pages/Trending';
import { Favorites } from '@/pages/Favorites';
import { AiRecommend } from '@/pages/AiRecommend';
import { BookDetails } from '@/pages/BookDetails';
import { SearchResults } from '@/pages/SearchResults';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Journal } from '@/pages/Journal';
import { UserProfile } from '@/pages/UserProfile';
import { Community } from '@/pages/Community';
import { ReadingDNA } from '@/pages/ReadingDNA';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/ai-recommend" element={<AiRecommend />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/user/:username" element={<UserProfile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/:slug" element={<Community />} />
            <Route path="/dna" element={<ReadingDNA />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
