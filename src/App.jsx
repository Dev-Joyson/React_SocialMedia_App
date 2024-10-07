import About from "./Components/About";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import Missing from "./Components/Missing";
import Navbar from "./Components/Navbar";
import NewPost from "./Components/NewPost";
import PostPage from "./Components/PostPage";
import Home from "./Components/Home";
import { useEffect, useState } from "react";
import { format } from "date-fns"
import { Routes, Route, useNavigate } from "react-router-dom"
import api from "./api/posts"
import EditPost from "./Components/EditPost";

function App() {
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([])
  const [postBody, setPostBody] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts')
        setPosts(response.data)
      } catch (err) {
        if (err.response) {
          console.log(err.response.data)
          console.log(err.response.status)
          console.log(err.response.headers)
        } else {
          console.log(`Error: ${err.message}`)
        }
      }
    }
    fetchPosts()
  }, [])


  const handleSubmit = async (e) => {
    e.preventDefault()
    const id = posts.length ? (posts[posts.length - 1].id + 1) : 1;
    const datetime = format(new Date(), 'MMMM dd, yyyy pp')
    const newPost = {
      id,
      title: postTitle,
      datetime,
      body: postBody
    }
    try {
      const response = await api.post('/posts', newPost)
      const allPosts = [...posts, response.data]
      setPosts(allPosts)
      setPostTitle('')
      setPostBody('')
      navigate('/')
    } catch (err) {
      if (err.response) {
        console.log(err.response.data)
        console.log(err.response.status)
        console.log(err.response.headers)
      } else {
        console.log(`Error: ${err.message}`)
      }
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`)
      const postsList = posts.filter(post => post.id !== id);
      setPosts(postsList);
      navigate('/')
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }

  const handleEdit = async (id) => {
    const datetime = format(new Date(), 'MMMM dd, yyyy pp')
    const updatedPost = {
      id,
      title: editTitle,
      datetime,
      body: editBody
    }
    try {
      const response = await api.put(`/posts/${id}`, updatedPost)
      setPosts(posts.map(post => post.id === id ? { ...response.data } : post))
      setEditTitle('')
      setEditBody('')
      navigate('/')
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }

  useEffect(() => {
    const filteredResults = posts.filter((post) =>
      ((post.body).toLowerCase())
        .includes(search.toLowerCase()) ||
      ((post.title).toLowerCase()).includes(search.toLowerCase()))

    setSearchResults(filteredResults.reverse())
  }, [posts, search])

  return (
    <div className="App">
        <Header title="CJ Social Media" />
        <Navbar
          search={search}
          setSearch={setSearch}
        />
        <Routes>
          <Route path="/" element={<Home posts={searchResults} />} />
          <Route path="post">
            <Route index element={
              <NewPost
                handleSubmit={handleSubmit}
                postTitle={postTitle}
                setPostTitle={setPostTitle}
                postBody={postBody}
                setPostBody={setPostBody}
              />
            } />
            <Route path=":id" element={<PostPage
              posts={posts}
              handleDelete={handleDelete}
            />} />
          </Route>
          <Route path="/edit/:id" element={
            <EditPost
              posts={posts}
              handleEdit={handleEdit}
              editBody={editBody}
              setEditBody={setEditBody}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
            />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Missing />} />
        </Routes>
        <Footer />
    </div>
  );
}

export default App;
