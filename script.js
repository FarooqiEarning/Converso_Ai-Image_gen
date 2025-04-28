document.addEventListener('DOMContentLoaded', () => {
    const API_ENDPOINT = 'https://inferrence.mcpcore.xyz/v1/images/generations';
    const API_KEY = 'sk-mcpcore_e7f6YrK9p2Lm8xZq!WbT5sJn3gDv6c';

    // DOM Elements
    const promptInput = document.getElementById('prompt');
    const modelSelect = document.getElementById('model');
    const sizeSelect = document.getElementById('size');
    const generateButton = document.getElementById('generate');
    const outputCard = document.querySelector('.output-card');
    const generatedImage = document.getElementById('generated-image');
    const downloadButton = document.getElementById('download');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const errorMessage = document.querySelector('.error-message');

    // Event Listeners
    generateButton.addEventListener('click', generateImage);
    downloadButton.addEventListener('click', downloadImage);

    async function generateImage() {
        const prompt = promptInput.value
        const model = modelSelect.value;
        const size = sizeSelect.value;

        if (!prompt) {
            showError('Please enter a prompt');
            return;
        }

        // Show loading state
        outputCard.classList.remove('hidden');
        loadingSpinner.classList.remove('hidden');
        generatedImage.src = '';
        errorMessage.classList.add('hidden');

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    'model': model,
                    'prompt':prompt,
                    'size':size
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            if (!data || !data.data || !data.data[0] || !data.data[0].url) {
                throw new Error('Invalid response format from API');
            }

            // Fetch the image as a blob to prevent direct URL exposure
            const imageResponse = await fetch(data.data[0].url);
            const imageBlob = await imageResponse.blob();
            const imageUrl = URL.createObjectURL(imageBlob);

            // Display the image
            generatedImage.src = imageUrl;
            generatedImage.onload = () => {
                loadingSpinner.classList.add('hidden');
                downloadButton.classList.remove('hidden');
            };

        } catch (error) {
            console.error('Error:', error);
            showError('Failed to generate image. Please try again.');
            loadingSpinner.classList.add('hidden');
        }
    }

    async function downloadImage() {
        try {
            const response = await fetch(generatedImage.src);
            const blob = await response.blob();
            
            // Create a download link
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `generated-image-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading image:', error);
            showError('Failed to download image. Please try again.');
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
}); 
