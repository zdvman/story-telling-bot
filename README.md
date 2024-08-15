# Storytelling Bot

![image](https://github.com/user-attachments/assets/e7185d32-53d8-4715-b54a-db82fe12e895)

## Project Overview

The **Storytelling Bot** is a web-based application that generates AI-powered stories based on user prompts. Inspired by the style of ChatGPT, this bot utilizes the Claude API from Anthropic to generate creative responses in a conversational format. This project is a demonstration of integrating a modern AI API with a responsive frontend built using TypeScript, Webpack, and CSS.

## Features

- **AI-Generated Responses**: The bot uses the Claude API to generate stories or poems based on user input.
- **Responsive Design**: The application is fully responsive, adapting to both desktop and mobile devices.
- **Modern Frontend Stack**: Built with TypeScript and bundled using Webpack, ensuring a scalable and maintainable codebase.
- **Backend API Integration**: Includes an Express.js server to handle secure communication with the Claude API, keeping the API key secure on the server side.

## Technologies Used

- **Frontend**:
  - TypeScript
  - Webpack
  - HTML5
  - CSS3
- **Backend**:
  - Node.js
  - Express.js
  - Anthropic's Claude API
- **Development Tools**:
  - Webpack Dev Server
  - npm (Node Package Manager)
  - dotenv (for managing environment variables)

## Installation and Setup

To get started with this project locally, follow the steps below.

### Prerequisites

- Ensure you have **Node.js** and **npm** installed on your machine.
- Obtain a **Claude API key** from Anthropic by signing up at [Anthropic](https://www.anthropic.com/).

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/zdvman/story-telling-bot.git
   cd story-telling-bot
   ```

2. **Install Dependencies**:

   Install the necessary npm packages:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:

   Create a `.env` file in the root directory and add your Claude API key:

   ```plaintext
   ANTHROPIC_API_KEY=your-claude-api-key-here
   MODE=development
   ```

### Running the Application

#### Start the Backend Server

The backend server is built with Express.js and will handle API requests to the Claude API.

```bash
node server.js
```

The server will run on `http://localhost:3000`.

#### Start the Frontend

In a separate terminal window, start the Webpack Dev Server to serve the frontend:

```bash
npx webpack serve --open
```

The frontend will run on `http://localhost:8080` and will automatically open in your default web browser.

### Using the Application

1. Open the application in your web browser at `http://localhost:8080`.
2. Enter a prompt in the input field and click "Tell me a story!".
3. The bot will generate a story or poem based on your prompt and display it in the output area.

## Deployment

### Deploying to GitHub Pages

This project can be easily deployed using GitHub Pages. Follow these steps:

1. **Build the Project for Production**:

   Before deploying, make sure to build the project:

   ```bash
   npx webpack --config webpack.config.js
   ```

2. **Deploy to GitHub Pages**:

   If your repository is set up, you can deploy directly to GitHub Pages by pushing your code to the `gh-pages` branch or using a deployment tool. For automatic deployment, you can set up a GitHub Actions workflow.

### Deploying the Backend

For the backend, you'll need to deploy it on a platform like Heroku, AWS, or DigitalOcean. The deployment process will vary depending on the platform. Ensure that your `.env` file or environment variables are properly configured in your deployment environment.

## Project Structure

Here’s a brief overview of the project structure:

```
.
├── dist/                   # Compiled output (generated by Webpack)
│   ├── bundle.js           # Bundled JavaScript file
│   └── index.html          # Compiled HTML file
├── node_modules/           # Node.js packages (auto-generated)
├── src/                    # Source files
│   ├── bot.ts              # Backend logic to interact with Claude API
│   ├── index.ts            # Main TypeScript file (entry point for Webpack)
│   ├── style.css           # CSS styles for the frontend
│   └── index.html          # HTML template for the frontend
├── .env                    # Environment variables file
├── package-lock.json       # npm lock file
├── package.json            # npm configuration file
├── server.js               # Express server handling API requests
├── tsconfig.json           # TypeScript configuration file
└── webpack.config.js       # Webpack configuration file
```

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please fork the repository, create a new branch, and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries, please contact [via email](mailto:zuyevdmytro@gmail.com).