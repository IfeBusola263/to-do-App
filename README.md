# 📋 To-Do App

A beautiful, feature-rich task management app built with React Native and Expo. Stay organized, set due dates, and never miss a task again!

## ✨ Features

- 📱 **Cross-platform**: Works on iOS, Android, and Web
- ✅ **Task Management**: Create, edit, delete, and complete tasks
- 🎤 **Voice-to-Task**: Speak your tasks and let App intelligently split them into separate items
- 📅 **Due Dates**: Set due dates with smart sorting and overdue detection
- 🔍 **Search & Filter**: Powerful search and filtering capabilities
- 🎨 **Beautiful Animations**: Smooth transitions and micro-interactions
- 💾 **Persistent Storage**: Your tasks are saved locally using AsyncStorage
- 🧪 **Well Tested**: Comprehensive unit tests for components and functions

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** (optional but recommended): `npm install -g @expo/cli`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/IfeBusola263/to-do-App.git
   cd to-do-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Voice Recognition (Optional)**
   
   For **real mobile speech recognition**, set up Google Cloud Speech-to-Text:
   
   ```bash
   # Get your API key from Google Cloud Console:
   # https://console.cloud.google.com/apis/credentials
   # Enable Speech-to-Text API for your project
   ```
   
   Then add your API key to `/config/speech.ts`:
   ```typescript
   googleCloudApiKey: 'your_actual_google_cloud_api_key_here'
   ```
   
   **Note**: Without API key, voice feature will use enhanced simulation on mobile. Web speech recognition works without any setup.

4. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

5. **Run on your device**
   - **iOS Simulator**: Press `i` in terminal or scan QR code with Camera app
   - **Android Emulator**: Press `a` in terminal or scan QR code with Expo Go app
   - **Physical Device**: Download Expo Go app and scan the QR code

## 📱 Usage Examples

### Creating Tasks with Voice Input

**🌐 Web**: Works immediately with real speech recognition (no setup required)
**📱 Mobile**: Requires Google Cloud API key for real speech recognition

1. Tap the **floating microphone button** at the bottom right
2. Speak naturally: *"Buy groceries and call mom then pick up dry cleaning"*
3. The app will intelligently split this into three separate tasks:
   - "Buy groceries"
   - "Call mom" 
   - "Pick up dry cleaning"
4. All tasks are automatically added to your list

**Setup for Mobile**: See installation step 3 for Google Cloud API key configuration.

### Creating Your First Task (Manual)
1. Open the app and tap the **"Add"** button in the header
2. Enter your task title and optional description
3. Set a due date (optional) using the date picker
4. Tap **"Add Task"** to save

### Managing Tasks
- **Complete a task**: Tap the checkbox next to any task
- **Edit a task**: Tap on a task to open the detail screen
- **Delete a task**: Tap the delete icon (🗑️) next to any task

### Search & Filter
- **Search**: Use the search bar to find tasks by title or description
- **Filter by status**: Use filter buttons (All, Active, Completed)
- **Filter by date**: Use date filters (Overdue, Due Today, Upcoming)

## 🛠️ Development

### Project Structure
```
to-do-App/
├── app/                    # Expo Router pages
│   ├── index.tsx          # Home screen
│   ├── add-task.tsx       # Add task modal
│   └── task/[id].tsx      # Task detail screen
├── components/            # Reusable UI components
├── context/              # React Context for state management
├── services/             # Storage and API services
├── theme/               # Design system and theming
├── types/              # TypeScript type definitions
├── utils/              # Helper functions and validators
└── tests/              # Unit tests
```

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator  
- `npm run web` - Run in web browser
- `npm test` - Run unit tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint code analysis

### Running Tests

This project includes comprehensive unit tests for components and utility functions:

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report  
npm run test:coverage
```

## 🔧 Configuration

### Environment Setup

**Basic Functionality**: No environment variables required. The app uses:
- **AsyncStorage** for local data persistence (no setup needed)
- **Expo Router** for navigation (configured automatically)

**Voice Recognition Setup (Optional)**:

For **real mobile speech recognition**, configure Google Cloud Speech-to-Text:

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the **Speech-to-Text API**

2. **Get API Key**:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy your API key

3. **Configure API Key**:
   
   **Option A - Development (Quick)**: Edit `/config/speech.ts`:
   ```typescript
   googleCloudApiKey: 'your_actual_google_cloud_api_key_here'
   ```
   
   **Option B - Production (Recommended)**: Create `.env` file:
   ```env
   GOOGLE_CLOUD_API_KEY=your_actual_api_key_here
   GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
   ```

**Without API Key**: Voice feature works with enhanced simulation on mobile, real speech recognition on web.

### Dependencies

Key dependencies and their versions:
- **React Native**: 0.81.4
- **Expo**: ~54.0.6
- **Expo Router**: ~6.0.3
- **React Native Reanimated**: ~4.1.0
- **AsyncStorage**: 2.2.0
- **DateTimePicker**: ^8.4.4 (for date selection)
- **Expo Checkbox**: ~5.0.7 (for task completion)
- **Expo Speech**: ~13.0.0 (for voice-to-text conversion)
- **Expo Audio**: ~15.0.0 (for audio recording capabilities)
- **Safe Area Context**: ~5.6.0 (for device-safe layouts)

For a complete list, see `package.json`.

## 🎤 Voice-to-Task Technology

### Speech Recognition Implementation

We use a **hybrid approach** for optimal user experience across platforms:

**🌐 Web Platform**:
- Uses browser's **Web Speech API** (Chrome, Edge, Safari)
- **Real-time speech recognition** - no setup required
- Works **offline** on supported browsers
- **No API keys needed**

**� Mobile Platform**:
- **Real Speech Recognition**: Google Cloud Speech-to-Text API (requires API key)
- **Enhanced Simulation**: Realistic fallback when API key not configured
- **Automatic Fallback**: Graceful degradation for network issues

### Why This Architecture?

- **� Cross-Platform**: Consistent experience on all devices
- **🔒 Privacy-First**: Web speech stays in browser, mobile offers local fallback  
- **📶 Reliability**: Multiple fallback layers ensure voice feature always works
- **⚡ Performance**: Native speech engines where available
- **🎯 Developer-Friendly**: Easy setup with optional cloud enhancement

### Natural Language Parsing Approach

Our intelligent task parsing uses a **rule-based algorithm** with multiple strategies:

#### 1. **Conjunction Detection**
Splits tasks on coordinating conjunctions:
- `"Buy milk and walk dog"` → `["Buy milk", "Walk dog"]`
- `"Call mom then visit store"` → `["Call mom", "Visit store"]`

#### 2. **Action Verb Analysis** 
Identifies task boundaries by detecting action verbs:
- `"Schedule meeting, email client, finish report"` → 3 separate tasks

#### 3. **Punctuation Cues**
Uses commas and periods as split indicators:
- `"Book flight. Pack bags. Call taxi."` → 3 tasks

#### 4. **Context Preservation**
Maintains context for related sub-tasks:
- `"Buy groceries: milk, bread, and eggs"` → `["Buy groceries: milk, bread, and eggs"]` (kept as one task)

#### 5. **Fallback Strategy**
If parsing fails or is ambiguous, creates a single task with the full speech text to ensure no content is lost.

**Example Parsing Results:**
```
Input: "Buy provisions and call mom then schedule dentist appointment"
Output: 
  ✅ "Buy provisions"
  ✅ "Call mom" 
  ✅ "Schedule dentist appointment"

Input: "Remind me to pick up the kids from school at 3pm"
Output:
  ✅ "Pick up the kids from school at 3pm"
```

## 🐛 Troubleshooting

### Common Issues

**App won't start?**
- Ensure Node.js v18+ is installed
- Clear Metro cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Tasks not persisting?**
- Check device storage permissions
- Try clearing app data and restarting

**Animations not smooth?**
- Ensure you're running on a physical device for best performance
- Check React Native Reanimated installation

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository** and create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following our coding standards:
   - Use TypeScript for type safety
   - Follow the existing component patterns
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

4. **Submit a Pull Request** with:
   - Clear description of changes
   - Screenshots if UI changes
   - Test results

### Development Guidelines

- **Components**: Use functional components with hooks
- **Styling**: Follow the theme system in `theme/index.ts`
- **State Management**: Use React Context for global state
- **Testing**: Write tests for new components and functions
- **Animations**: Use React Native Reanimated for performance

## 📋 Roadmap

Future enhancements we're considering:
- 🌙 Dark/Light theme toggle
- 📂 Task categories and tags  
- 🔔 Push notifications for due dates
- 🧠 Advanced AI task parsing with machine learning
- ☁️ Cloud sync and backup
- 👥 Collaboration features
- 📊 Analytics and productivity insights

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Icons from [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- Animations powered by [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

## 🆘 Need Help?

- 📖 Check out the [issues](https://github.com/IfeBusola263/to-do-App/issues) for known problems
- 💬 Start a [discussion](https://github.com/IfeBusola263/to-do-App/discussions) for questions
- 📧 Reach out to the maintainers

---

**Happy task managing!** 🎉
