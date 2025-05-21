# AI RegEx Generator

A web application that uses local AI to generate and manage regular expressions.

## Features

- **Natural Language to Regex Conversion**: Describe what you want to match in plain language, and the application will generate a regular expression for you.
- **Local AI Processing**: Uses [Ollama](https://ollama.ai/) to run AI models locally on your machine.
- **Pattern Testing**: Test your regex patterns against example text to see what they match.
- **Pattern Library**: Save, organize, and manage your regex patterns for future use.
- **Dark/Light Mode**: Automatically adapts to your system preferences.

## Project Structure

```
airegulerexpression/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── HomePage.tsx  # Generator page
│   │   ├── Navigation.tsx 
│   │   └── RegexLibrary.tsx 
│   ├── stores/           # State management
│   │   └── regexStore.ts # Zustand store for patterns
│   ├── utils/            # Utility functions
│   │   ├── helpers.ts    # Helper functions
│   │   └── ollamaClient.ts # Interface with Ollama
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles with Tailwind
├── cypress/              # End-to-end tests
│   ├── e2e/              # Test specs
│   │   ├── *.cy.ts       # Cypress test files
│   │   ├── *.feature     # Cucumber feature files
│   │   └── step_definitions/ # Cucumber step definitions
│   ├── fixtures/         # Test data
│   └── support/          # Custom commands and utilities
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── jest.config.js        # Jest configuration
└── README.md             # Project documentation
```

## Requirements

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Ollama](https://ollama.ai/) running locally

## Setup

1. **Install dependencies**:

```bash
npm install
```

2. **Make sure Ollama is installed and running**:

Download and install Ollama from [https://ollama.ai/](https://ollama.ai/), then run it locally.

3. **Pull the required model**:

```bash
ollama pull llama3
```

4. **Start the development server**:

```bash
npm run dev
```

5. **Open your browser**:

Navigate to [http://localhost:3000](http://localhost:3000) to use the application.

## Testing

The project includes comprehensive testing:

1. **Unit Tests**:

```bash
npm test
```

2. **End-to-End Tests**:

```bash
npm run e2e
```

Or to open the Cypress test runner:

```bash
npm run cypress:open
```

3. **BDD Tests with Cucumber**:

The project includes Cucumber integration for behavior-driven development testing.
Feature files are written in Gherkin syntax for better readability and collaboration.

```bash
npm run cucumber
```

### Testing Notes

- The Cucumber integration uses `@badeball/cypress-cucumber-preprocessor` and `@bahmutov/cypress-esbuild-preprocessor` to process `.feature` files.
- Step definitions are located in `cypress/e2e/step_definitions/`.
- Tests have been optimized to avoid DOM detachment issues by:
  - Breaking up chained commands (e.g., separating `clear()` and `type()` operations)
  - Using `{ force: true }` for input interactions to handle React's re-rendering
  - Adding small delays with `cy.wait()` for stability in dynamic components
  - Simplifying complex test scenarios that were prone to timing issues

## How to Use

1. **Generate a Regular Expression**:
   - Describe what you want to match in the text area (e.g., "Match all email addresses")
   - Click "Generate Pattern"
   - The AI will generate a regular expression based on your description

2. **Test the Pattern**:
   - Enter some test text in the test area
   - Click "Test Pattern" to see what the regex matches

3. **Save to Library**:
   - Give your pattern a name
   - Add tags (optional)
   - Click "Save Pattern"

4. **Manage Your Patterns**:
   - Go to the Library page to view all your saved patterns
   - Search, edit, or delete patterns as needed

## Technology Stack

- **Frontend**: React, TypeScript
- **Routing**: React Router
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **AI**: Ollama (local AI model)
- **Testing**: 
  - Unit Testing: Jest, React Testing Library
  - E2E Testing: Cypress
  - BDD Testing: Cucumber with Cypress

## Customization

- **Change the AI Model**: Edit the `DEFAULT_MODEL` in `src/utils/ollamaClient.ts` to use a different Ollama model.
- **Adjust the UI**: Modify the Tailwind classes in the component files or update the theme in `tailwind.config.js`.

## License

MIT 