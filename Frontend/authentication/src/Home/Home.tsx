import React, { useState, useEffect, useRef } from 'react';
import { FiMoreHorizontal, FiMail, FiSettings, FiLogOut, FiMessageSquare, FiUser, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import SettingsModal from './SettingModel';
import HomePointerAnimation from './HomePointerAnimation';

// Types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSummary {
  _id: string;
  title: string;
}

interface ChatResponse {
  success: boolean;
  chat: {
    _id: string;
    title: string;
    messages: { _id: string; text: string; sender: 'user' | 'assistant'; timestamp: string }[];
  };
  aiReply?: string;
}

const Home: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [recentChats, setRecentChats] = useState<ChatSummary[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [sidebarOpen , setSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user?.uid || '';
  const userEmail = user?.email || 'No Email';

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);


  // For auto-scrolling
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages, isLoading]);

  // Fetch recent chats
  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await user.getIdToken();
      try {
        const res = await fetch('http://localhost:5001/api/chats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.chats) {
          setRecentChats(data.chats);
        }
      } catch (error) {
        console.error('Error fetching recent chats:', error);
      }
    })();
  }, [user]);

  // Open existing chat
  const openChat = async (chatId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    try {
      const res = await fetch(`http://localhost:5001/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.chat) {
        setMessages(
          data.chat.messages.map((m: any) => ({
            id: m._id,
            text: m.text,
            sender: m.sender,
            timestamp: new Date(m.timestamp),
          }))
        );
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

// Send message
const handlePromptSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!prompt.trim()) return;

  const tempId = Date.now().toString();

  // 1️⃣ Add user's message instantly
  const userMessage: Message = {
    id: tempId,
    text: prompt,
    sender: 'user',
    timestamp: new Date()
  };

  // 2️⃣ Add AI typing placeholder instantly
  const typingMessageId = tempId + "-ai";
  setMessages(prev => [
    ...prev,
    userMessage,
    { id: typingMessageId, text: "...", sender: 'assistant', timestamp: new Date() }
  ]);

  const currentPrompt = prompt; // Store the prompt before clearing
  setPrompt('');
  setIsLoading(true);

  const token = await auth.currentUser?.getIdToken();

  try {
    const res = await fetch('http://localhost:5001/api/save-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        chatId: currentChatId || undefined,
        message: {
          sender: 'user',
          text: currentPrompt // Use stored prompt
        },
        title: currentPrompt // Use stored prompt
      })
    });

    const data = await res.json();

    if (!res.ok) {
      // 🔹 Fixed: Check for the correct error messages
      if (
        data.error.includes("NO_VALID_API_KEY") ||
        data.error.includes("API key not found")
      ) {
        // Remove typing placeholder and show settings modal
        setMessages(prev => prev.filter(msg => msg.id !== typingMessageId));
        setIsLoading(false);
        setShowSettingsModal(true);
        return; // Stop further execution
      }
      if (data.error.includes("INVALID_API_KEY")) {
        // Key is set but wrong — open modal with warning
        setMessages(prev => prev.filter(msg => msg.id !== typingMessageId));
        setIsLoading(false);
        alert("⚠️ The API key you entered is invalid. Please check and try again.");
        setShowSettingsModal(true);
        return;
      }



    }
    
    // 3️⃣ Set current chat if it's a new one
    if (!currentChatId && data.chat && data.chat._id) {
      setCurrentChatId(data.chat._id);
      setRecentChats(prev => [data.chat, ...prev]);
    }

    // 4️⃣ Replace typing placeholder with real AI reply
    if (data.aiReply) {
      const words = data.aiReply.split(' ');
      let index = 0;
    
      setMessages(prev =>
        prev.map(msg =>
          msg.id === typingMessageId
            ? { ...msg, text: '' }
            : msg
        )
      );

      const interval = setInterval(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === typingMessageId
              ? { ...msg, text: words.slice(0, index + 1).join(' ') }
              : msg
          )
        );
        index++;
        if (index >= words.length) {
          clearInterval(interval);
        }
      }, 50); // 50ms per word
    }
  } catch (error) {
    console.error('Error saving message:', error);

    // Replace typing with error message
    setMessages(prev =>
      prev.map(msg =>
        msg.id === typingMessageId
          ? { ...msg, text: "⚠️ Failed to get response" }
          : msg
      )
    );
  } finally {
    setIsLoading(false);
  }
};
  
  const handleDeleteChat =async(chatId:string)=>{
    if (!user) return;
    const token = await user.getIdToken();
    console.log("chat id using for backend req",chatId)
    console.log("type of chat id",typeof(chatId))
    const response:any=await fetch("http://localhost:5001/api/chats/del",{
      method:"POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'

       },
      
      body:JSON.stringify({
        chat_id:chatId
      })
      
    })
    console.log(await response.json()) ;
    
  }

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  const handleSaveApiKey = (apiKey: string) => {
    console.log('Save Api Key:', apiKey);
    setShowSettingsModal(false);
  };
    
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];          // get the first selected file
      setFileUploaded(true);          // mark as uploaded
  
      // Optional: store the file in state for later use
      // setUploadedFile(file);
  
      // Optional: upload to backend
      // const formData = new FormData();
      // formData.append("file", file);
      // fetch("/api/upload", {
      //   method: "POST",
      //   body: formData,
      // })
      // .then(res => res.json())
      // .then(data => console.log("Upload successful:", data))
      // .catch(err => console.error("Upload error:", err));
    } else {
      setFileUploaded(false); // reset if no file is selected
    }
  };
  

  const handleFileUpload = async () => {
    if (!selectedFile || !user) return;
  
    const token = await user.getIdToken();
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('chatId', currentChatId || ''); // send current chatId if exists
  
    try {
      const res = await fetch('http://localhost:5001/api/chats/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      const data = await res.json();
      if (res.ok && data.fileUrl) {
        setUploadedFilePath(data.fileUrl);
        alert('File uploaded successfully!');
      } else {
        alert('Failed to upload file');
        console.error(data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    }
  };
  
  ////
  return (
    <div className="home-container">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="sidebar">
          <div className="new-chat">
            <button onClick={handleNewChat} >
              <FiPlus /> New Chat
            </button>
  
            {/* Close Sidebar Button */}
            <button onClick={() => setSidebarOpen(false)} className="close-sidebar-btn">
              ✖
            </button>
          </div>
  
          {/* Recent Chats */}
          <div className="old-chats">
            {recentChats.map((chat) => {
              const shortTitle = chat.title.split(" ").slice(0, 4).join(" ");
              return (
                <div
                  key={chat._id}
                  onClick={() => openChat(chat._id)}
                  className="chat-item"
                >
                  <div className="chat-title">
                    <FiMessageSquare /> {shortTitle}
                  </div>
                  <FiTrash2
                    className="delete-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Delete chat:", chat._id);
                      handleDeleteChat(chat._id);
                    }}
                  />
                </div>
              );
            })}
          </div>
  
          {/* Bottom Left Icon */}
          <div className="bottom-left-icon" onClick={() => setShowMenu(!showMenu)}>
            <FiMoreHorizontal size={24} color="#111" />
            {showMenu && (
              <div className="popover-menu">
                <button>
                  <FiMail /> {userEmail}
                </button>
                <button onClick={() => setShowSettingsModal(true)}>
                  <FiSettings /> Settings
                </button>
                <button onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
  
      {/* Open Sidebar Button (when closed) */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} className="open-sidebar-btn">
          ☰ Open Sidebar
        </button>
      )}
  
      {/* Main Chat Area */}
      <div className="main-content">
        <div className="chat-rectangle">
          {messages.length === 0 ? (
            <div className="welcome-text">👋 Welcome! Start a new chat</div>
          ) : (
            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  <div className="message-avatar">
                    {msg.sender === "user" ? (
                      <FiUser />
                    ) : (
                      <div className="ai-avatar">AI</div>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{msg.text}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Suggestion Box */}
        <div className='bottom-section'>
          <div className="suggestion-row">
            {/* File Upload with Icon */}
            <label
              htmlFor="fileInput"
              className={`suggestion-box upload-btn ${fileUploaded ? 'uploaded' : ''}`}
            >
              {fileUploaded ? "File Uploaded ✅" : "File Upload"}
            </label>
            <input
              type="file"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={handleFileChange} // your function to handle upload
            />

            {/* Other Suggestions */}
            <div className="suggestion-box">Summarize in bullet points</div>
            <div className="suggestion-box">Make Action plan</div>
    </div>
        

  
        {/* Input */}
        <form className="prompt-input" onSubmit={handlePromptSubmit}>
          <div className='input-wrapper'>
          <input
            type="text"
            placeholder="Type your prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <span className="model-label">gpt-4o-mini</span>
          <button type="submit" className="submit-btn"> ➤</button>            
          </div>
          
        </form>            
          </div>
      </div>
  
      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          userId={userId}
          onSave={handleSaveApiKey}
        />
      )}
    </div>
  );
  

};

export default Home;

