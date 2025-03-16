import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaEdit, FaCommentDots, FaTrash } from 'react-icons/fa';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    fetch('http://localhost:5000/api/videos')
      .then(res => res.json())
      .then(async data => {
        setVideos(data);
        const commentsObj = {};
        for (let video of data) {
          const res = await fetch(`http://localhost:5000/api/comments/${video.videoId}`);
          const commentsData = await res.json();
          commentsObj[video.videoId] = commentsData;
        }
        setComments(commentsObj);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, [navigate]);

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

      setVideos(prev =>
        prev.map(v => (v.videoId === videoId ? { ...v, title: newTitle } : v))
      );
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

      const res2 = await fetch(`http://localhost:5000/api/comments/${videoId}`);
      const updatedComments = await res2.json();
      setComments(prev => ({ ...prev, [videoId]: updatedComments }));
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const deleteComment = async (commentId, videoId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/comment/${commentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      alert(data.message);

      const res2 = await fetch(`http://localhost:5000/api/comments/${videoId}`);
      const updatedComments = await res2.json();
      setComments(prev => ({ ...prev, [videoId]: updatedComments }));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-3xl text-gray-600 mr-2" />
        <p className="text-lg text-gray-700">Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 md:px-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Uploaded Videos</h2>

      {videos.length === 0 ? (
        <div className="text-center mt-10">
          <p className="text-xl text-gray-600">No videos found. Upload some videos on your YouTube Channel to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {videos.map(video => (
            <div key={video.videoId} className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="text-xl font-semibold text-gray-800 mb-2">{video.title}</h4>
              <p className="text-gray-600 mb-4">{video.description}</p>

              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => updateTitle(video.videoId)}
                  className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  <FaEdit className="mr-2" />
                  Update Title
                </button>

                <button
                  onClick={() => addComment(video.videoId)}
                  className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  <FaCommentDots className="mr-2" />
                  Add Comment
                </button>
              </div>

              <h5 className="text-lg font-medium text-gray-700 mb-2">Your Comments:</h5>
              {(comments[video.videoId] || []).length === 0 ? (
                <p className="text-gray-500 italic ml-2">No comments yet.</p>
              ) : (
                <div className="space-y-2 ml-2">
                  {(comments[video.videoId] || []).map(comment => (
                    <div
                      key={comment.id}
                      className="flex items-center justify-between bg-gray-100 p-3 rounded"
                    >
                      <p className="text-gray-700">{comment.text}</p>
                      <button
                        onClick={() => deleteComment(comment.id, video.videoId)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
