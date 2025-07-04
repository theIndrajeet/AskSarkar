# Ask Sarkar - RTI Application Generator

A free, open-source web application that helps Indian citizens file RTI (Right to Information) applications effortlessly. Built with React and powered by AI.

## Features

- 🤖 **AI-Powered Assistant**: Chat with an intelligent assistant that helps draft RTI applications
- 📝 **Manual Form Mode**: Step-by-step form for traditional RTI filing
- 🌐 **Bilingual Support**: Available in English and Hindi
- 📄 **PDF Generation**: Generate FORM-A compliant RTI applications
- 🏛️ **PIO Database**: Auto-lookup of Public Information Officers by state/department
- 💯 **Free & Open Source**: No fees, no hidden charges
- 🔒 **Privacy First**: All processing happens in your browser

## Tech Stack

- React + Vite
- Tailwind CSS
- Google Gemini AI
- jsPDF for document generation
- i18next for internationalization

## Local Development

```bash
# Clone the repository
git clone https://github.com/theIndrajeet/AskSarkar.git
cd AskSarkar/ask-sarkar

# Install dependencies
npm install

# Create .env file and add your Gemini API key (optional)
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env

# Run development server
npm run dev
```

## Deployment

The app can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages.

### Deploy to Netlify

1. Fork this repository
2. Connect your GitHub account to Netlify
3. Import the project with these settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `ask-sarkar`
4. Add environment variable: `VITE_GEMINI_API_KEY`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Credits

Built with ❤️ to empower Indian citizens with the Right to Information.
