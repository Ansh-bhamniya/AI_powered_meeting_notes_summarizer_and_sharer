import { useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    // Initialize Firebase authentication and navigation
    const auth = getAuth();
    const navigate = useNavigate();
    
    // State variables for managing authentication state, email, password, and error messages
    const [authing, setAuthing] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const saveUserKeyToBackend = async (uid : string, token : string ) => {
      try {
        // console.log('Sending request with:', { uid, token }); 
        const res = await fetch('http://localhost:5001/api/register-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: uid, }),
          
        });
        // console.log('Response status:', res.status);
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.error || 'Failed to save API key');
        }
    
        // if (!res.ok) {
        //   const errorData = await res.json();
        //   throw new Error(errorData.error || 'Failed to save API key');
        // }
  
        const data = await res.json();
        // console.log('Response data:', data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    // Function to handle sign-in with Google
    const signInWithGoogle = async () => {
        setAuthing(true);
        
        try {
          const response = await signInWithPopup(auth, new GoogleAuthProvider());
          const token = await response.user.getIdToken();
          console.log('Firebase ID Token:', token);
          
          navigate('/Home');
        } catch (error) {
          console.log(error);
          setAuthing(false);
        }
      };

      
    // Function to handle sign-in with email and password
    const signInWithEmail = async () => {
        setAuthing(true);
        setError('');
        try {
          const response = await signInWithEmailAndPassword(auth, email, password);
          const token = await response.user.getIdToken();
          const uid = await response.user.uid;
          // Call your backend API to send uid and token here
          // console.log('maa chuda:', uid); // OhFtWiZdEdWP4yE2DuqnxaZgkUB2
          console.log('token is this:', token);
          await saveUserKeyToBackend(uid, token ,);
          navigate('/Home');
        } catch (err) {
          console.log(err);
          setAuthing(false);
        }
    }




    return (
        <div className='w-full h-screen flex'>
            {/* Left half of the screen - background styling */}
            <div className='w-1/2 h-full flex flex-col bg-[#282c34] items-center justify-center'>
            </div>

            {/* Right half of the screen - login form */}
            <div className='w-1/2 h-full bg-[#1a1a1a] flex flex-col p-20 justify-center'>
                <div className='w-full flex flex-col max-w-[450px] mx-auto'>
                    {/* Header section with title and welcome message */}
                    <div className='w-full flex flex-col mb-10 text-white'>
                        <h3 className='text-4xl font-bold mb-2'>Login</h3>
                        <p className='text-lg mb-4'>Welcome Back! Please enter your details.</p>
                    </div>

                    {/* Input fields for email and password */}
                    <div className='w-full flex flex-col mb-6'>
                        <input
                            type='email'
                            placeholder='Email'
                            className='w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                        <input
                            type='password'
                            placeholder='Password'
                            className='w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    {/* Button to log in with email and password */}
                    <div className='w-full flex flex-col mb-4'>
                        <button
                            className='w-full bg-transparent border border-white text-white my-2 font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer'
                            onClick={signInWithEmail}
                            disabled={authing}>
                            Log In With Email and Password
                        </button>
                    </div>

                    {/* Display error message if there is one */}
                    {error && <div className='text-red-500 mb-4'>{error}</div>}

                    {/* Divider with 'OR' text */}
                    <div className='w-full flex items-center justify-center relative py-4'>
                        <div className='w-full h-[1px] bg-gray-500'></div>
                        <p className='text-lg absolute text-gray-500 bg-[#1a1a1a] px-2'>OR</p>
                    </div>

                    {/* Button to log in with Google */}
                    <button
                        className='w-full bg-white text-black font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer mt-7'
                        onClick={signInWithGoogle}
                        disabled={authing}>
                        Log In With Google
                    </button>
                </div>

                {/* Link to sign up page */}
                <div className='w-full flex items-center justify-center mt-10'>
                    <p className='text-sm font-normal text-gray-400'>Don't have an account? <span className='font-semibold text-white cursor-pointer underline'><a href='/signup'>Sign Up</a></span></p>
                </div>
            </div>
        </div>
    );
}

export default Login;


/*
eyJhbGciOiJSUzI1NiIsImtpZCI6IjJiN2JhZmIyZjEwY2FlMmIxZjA3ZjM4MTZjNTQyMmJlY2NhNWMyMjMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbXljaGF0LTc5NGZiIiwiYXVkIjoibXljaGF0LTc5NGZiIiwiYXV0aF90aW1lIjoxNzU1MDQ3Nzg1LCJ1c2VyX2lkIjoibmJaUHZRbkkwTWJUQjJxQ1lLSXZTQ0R6d2UzMiIsInN1YiI6Im5iWlB2UW5JME1iVEIycUNZS0l2U0NEendlMzIiLCJpYXQiOjE3NTUwNDc3ODUsImV4cCI6MTc1NTA1MTM4NSwiZW1haWwiOiJ6YWxuaXphZGppdmRqYW5xdWpAbmVzb3BmLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJ6YWxuaXphZGppdmRqYW5xdWpAbmVzb3BmLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.ovztxP8ddNvtI71P06eFwC3lFhN0bu6qWVIPNns5Q40Zg07Q5VCYFSQVuJ9UzyJzMFXmCLrvtni3uEKfn0uO0kDXbELAM-dWKzL0mLLVtNpp9Zb-yNAAollWxNSN-Plhs-_qS45g83leXe-xae0An9koqX6UisKHlHzIQH9MHi9vjDE5H_j94fslvZfrYRTwib4TEEJHZ0ltUAKbeBnD5AT_E8WJjN09_fj_znmRqcJDd9bRaw1-HFbUmGFY5uFLpMxBiqA1ME3Cd5cygVbrPdAMzXQKMPLfGFxReLU3hOwJDW37Ql1kjGEe9iWp_BhGQWVAArCKyORSC5OxuGYaAw
*/