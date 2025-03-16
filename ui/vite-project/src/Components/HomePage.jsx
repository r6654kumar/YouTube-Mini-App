import { useEffect, useState } from 'react';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    fetch('http://localhost:5000/api/videos')
      .then(res => res.json())
      .then(data => {
        setVideos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  const updateTitle = async (videoId) => {
    const newTitle = prompt('Enter new title:');
    if (!newTitle) return;

    try {
      const res = await fetch('http://localhost:5000/api/update-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, newTitle }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const addComment = async (videoId) => {
    const commentText = prompt('Enter comment:');
    if (!commentText) return;

    try {
      const res = await fetch('http://localhost:5000/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, commentText }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  if (loading) return <p>Loading videos...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Uploaded Videos</h2>
      {videos.map(video => (
        <div key={video.videoId} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <h4>{video.title}</h4>
          <p>{video.description}</p>
          <button onClick={() => updateTitle(video.videoId)}>Update Title</button>
          <button onClick={() => addComment(video.videoId)}>Add Comment</button>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
