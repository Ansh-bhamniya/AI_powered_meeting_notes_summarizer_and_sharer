# AI-Powered Meeting Notes Summarizer and Sharer

An intelligent web application that processes text transcripts (meeting notes, call transcripts) and generates structured summaries with action items using Google's Gemini AI model. Features user authentication, RAG (Retrieval-Augmented Generation) architecture, and email sharing capabilities.

<img width="2301" height="1210" alt="image" src="https://github.com/user-attachments/assets/69a070b1-141e-42f0-bf80-ab8c1a764567" />
Upload .txt file 
<img width="2301" height="1210" alt="image" src="https://github.com/user-attachments/assets/1206d325-33ff-4917-8802-7ce5c206f36f" />
recived Email
<img width="2301" height="1210" alt="image" src="https://github.com/user-attachments/assets/099e3272-4e7e-4bd4-a0d4-36c1b03caee9" />


## 🚀 Features

- **User Authentication**: Secure login system to manage user sessions
- **Text File Upload**: Support for .txt transcript files (meeting notes, call transcripts)
- **Custom Prompt Input**: Add personalized instructions (e.g., "Summarize in bullet points for executives")
- **Dual Summary Generation**:
  - **Short Summary**: Concise overview of the meeting/call
  - **Action Point Plan**: Detailed action items and next steps
- **RAG Architecture**: Advanced text chunking and vector database storage for better context understanding
- **Editable Summaries**: Modify generated summaries before sharing
- **Email Integration**: Send summaries directly via SMTP service to multiple recipients
- **Vector Database**: Efficient text storage and retrieval for enhanced AI responses

## 🏗️ Architecture

The application uses a sophisticated RAG (Retrieval-Augmented Generation) architecture:

1. **Text Processing**: Uploaded .txt files are chunked into manageable segments
2. **Vector Storage**: Text chunks are embedded and stored in a vector database
3. **AI Generation**: Gemini AI model generates summaries using retrieved context
4. **Email Service**: SMTP integration for sharing capabilities

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.8 or higher
- pip (Python package installer)
- Git

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Ansh-bhamniya/AI_powered_meeting_notes_summarizer_and_sharer.git
cd AI_powered_meeting_notes_summarizer_and_sharer
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Required Dependencies

```bash
# Install core packages
pip install -r requirements.txt

# Core dependencies include:
pip install streamlit
pip install google-generativeai
pip install langchain
pip install langchain-google-genai
pip install chromadb
pip install sentence-transformers
pip install python-dotenv
pip install smtplib-ssl
pip install email-validator
pip install streamlit-authenticator
pip install PyPDF2
pip install faiss-cpu
pip install tiktoken
```

### 4. Vector Database Dependencies

```bash
# For ChromaDB (recommended)
pip install chromadb

# Or for FAISS
pip install faiss-cpu

# For text embeddings
pip install sentence-transformers
pip install transformers
```

### 5. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Google Gemini API Configuration
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Email SMTP Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Authentication Settings
AUTH_SECRET_KEY=your_secret_key_for_auth

# Vector Database Configuration
VECTOR_DB_PATH=./vector_db
CHUNK_SIZE=500
CHUNK_OVERLAP=50

# Application Settings
MAX_FILE_SIZE=10MB
SUPPORTED_FORMATS=txt
```

### 6. Authentication Setup

```bash
# Generate authentication credentials
python setup_auth.py

# Or manually create user credentials in config.yaml
```

## 🚀 Quick Start

### Run the Application

```bash
# Start the Streamlit application
streamlit run app.py

# Access the application at http://localhost:8501
```

### Using the Application

1. **Login**: Authenticate using your credentials
2. **Upload Transcript**: Upload your .txt meeting notes or call transcript
3. **Add Custom Prompt**: Enter specific instructions for summarization
4. **Generate Summaries**:
   - Click "Generate Short Summary" for a concise overview
   - Click "Generate Action Point Plan" for detailed action items
5. **Edit**: Modify the generated summaries as needed
6. **Share**: Enter email addresses and send summaries via SMTP

## 📖 Usage Examples

### Custom Prompts

```
"Summarize in bullet points for executives"
"Highlight only action items and deadlines"
"Focus on technical decisions and next steps"
"Create a summary for team leads with responsibilities"
```

### Sample Workflow

```python
# Example of how the RAG system works internally:

# 1. Text chunking
chunks = text_splitter.split_text(uploaded_text)

# 2. Vector storage
vector_db.add_texts(chunks)

# 3. Retrieval and generation
relevant_chunks = vector_db.similarity_search(query)
summary = gemini_model.generate(prompt + relevant_chunks)
```

## 📁 Project Structure

```
AI_powered_meeting_notes_summarizer_and_sharer/
│
├── app.py                   # Main Streamlit application
├── auth/
│   ├── __init__.py
│   ├── authentication.py   # User authentication logic
│   └── config.yaml         # Auth configuration
│
├── models/
│   ├── __init__.py
│   ├── gemini_model.py     # Gemini AI integration
│   └── text_processor.py  # Text chunking and processing
│
├── database/
│   ├── __init__.py
│   ├── vector_db.py       # Vector database operations
│   └── embeddings.py      # Text embedding functions
│
├── utils/
│   ├── __init__.py
│   ├── email_service.py   # SMTP email functionality
│   ├── file_handler.py    # File upload and processing
│   └── helpers.py         # Utility functions
│
├── templates/             # HTML templates (if any)
├── static/               # CSS and static files
├── vector_db/            # Vector database storage
├── uploads/              # Temporary file storage
│
├── requirements.txt      # Python dependencies
├── .env.example         # Environment variables template
├── setup_auth.py        # Authentication setup script
├── config.yaml          # Application configuration
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## 🔑 API Keys and Configuration

### Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your `.env` file as `GOOGLE_API_KEY`

### Email Configuration (Gmail Example)
1. Enable 2-factor authentication on Gmail
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Add credentials to `.env` file

### Authentication Setup
```python
# Create user credentials
import streamlit_authenticator as stauth

# Generate hashed passwords
hashed_passwords = stauth.Hasher(['password123']).generate()

# Update config.yaml with user details
```

## 🛠️ Core Technologies

- **Frontend**: Streamlit for web interface
- **AI Model**: Google Gemini for text generation
- **Vector Database**: ChromaDB for text storage and retrieval
- **Authentication**: Streamlit-authenticator
- **Email**: SMTP for sharing functionality
- **Text Processing**: LangChain for chunking and processing
- **Embeddings**: Sentence-transformers for vector embeddings

## 🧪 Testing

```bash
# Test file upload functionality
python -m pytest tests/test_file_handler.py

# Test Gemini integration
python -m pytest tests/test_gemini_model.py

# Test vector database
python -m pytest tests/test_vector_db.py

# Test email service
python -m pytest tests/test_email_service.py
```

## 🚨 Troubleshooting

### Common Issues

**Gemini API Error:**
```bash
# Verify API key is set correctly
echo $GOOGLE_API_KEY

# Check API quota and billing
```

**Vector Database Issues:**
```bash
# Clear vector database
rm -rf ./vector_db
mkdir vector_db
```

**Email Sending Failed:**
```bash
# Check SMTP settings
# Verify app password for Gmail
# Ensure 2FA is enabled
```

**File Upload Problems:**
- Ensure file is .txt format
- Check file size limits
- Verify file encoding (UTF-8 recommended)

### Performance Optimization

- **Chunk Size**: Adjust `CHUNK_SIZE` for better context
- **Vector DB**: Use appropriate embedding model
- **Memory**: Monitor RAM usage with large files
- **API Limits**: Implement rate limiting for Gemini API

## 🔒 Security Features

- User authentication and session management
- Secure file upload handling
- Environment variable protection
- SMTP credential encryption
- Vector database access control

## 📧 Email Integration Details

The application supports:
- Multiple recipient addresses
- HTML formatted emails
- Attachment of original transcripts
- Custom email templates
- SMTP error handling and retries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Implement your changes
4. Add tests for new functionality
5. Commit changes (`git commit -m 'Add new feature'`)
6. Push to branch (`git push origin feature/new-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google AI for Gemini API
- Streamlit for the web framework
- LangChain for RAG implementation
- ChromaDB for vector database
- The open-source community

---

**Built with ❤️ by [Ansh Bhamniya](https://github.com/Ansh-bhamniya)**

*Transform your meeting transcripts into actionable insights with AI-powered summarization and seamless sharing capabilities.*
