// config.js - Keep this separate and add to .gitignore
import { GoogleGenerativeAI } from "@google/generative-ai";

 


const genAI = new GoogleGenerativeAI("AIzaSyBV98k7ZuLCe-4YiYMdo7qXlcBbzMRAFNA"); // Replace with your actual key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // or "gemini-1.5-pro"

document.addEventListener('DOMContentLoaded', function() {
    const chatWidget = document.getElementById('chatbot-widget');
    const closeButton = document.getElementById('close-chatbot');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.querySelector('#chatbot-widget input');
    const sendButton = document.querySelector('#chatbot-widget button');
    const chatLoading = document.getElementById('chat-loading');
    
    // Toggle chatbot visibility
    closeButton.addEventListener('click', () => {
        chatWidget.classList.add('hidden');
    });
    
    // Initialize chat history
    const chatHistory = [
        { role: "model", parts: [{ text: "Hi there! 👋 How can I help you today?" }] }
    ];
    
    // Function to add a message to the chat
    function addMessage(role, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'mb-4';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = role === 'user' 
            ? 'bg-primary text-white rounded-lg p-3 max-w-xs ml-auto'
            : 'bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs';
        
        bubbleDiv.innerHTML = `<p>${text}</p>`;
        messageDiv.appendChild(bubbleDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to call Gemini API
    async function callGemini(message) {
        chatLoading.classList.remove('hidden');
        
        // Add user message to history
        chatHistory.push({ role: "user", parts: [{ text: message }] });
        
        try {
            // Start a chat session (or continue existing one)
            const chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                },
            });
            
            // Send message and get response
            const result = await chat.sendMessage(message);
            const response = await result.response;
            const assistantMessage = response.text();
            
            addMessage('model', assistantMessage);
            chatHistory.push({ role: "model", parts: [{ text: assistantMessage }] });
            
        } catch (error) {
            console.error('Error calling Gemini:', error);
            addMessage('model', "Sorry, I'm having trouble connecting. Please try again later.");
        } finally {
            chatLoading.classList.add('hidden');
        }
    }
    
    // Handle send button click
    sendButton.addEventListener('click', sendMessage);
    
    // Handle Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage('user', message);
            chatInput.value = '';
            callGemini(message);
        }
    }
    
    // Optional: Add a toggle button to show/hide the chatbot
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '<i class="fas fa-robot"></i>';
    toggleButton.className = 'fixed bottom-8 right-8 bg-primary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-secondary transition-colors';
    toggleButton.addEventListener('click', () => {
        chatWidget.classList.toggle('hidden');
    });
    document.body.appendChild(toggleButton);
});