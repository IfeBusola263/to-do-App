# 📋 To-Do App

A beautiful, feature-rich task management app built with React Native and Expo. Stay organized, set due dates, and never miss a task again!

## ✨ Features

- 📱 **Cross-platform**: Works on iOS, Android, and Web
- ✅ **Task Management**: Create, edit, delete, and complete tasks
- � **Due Dates**: Set due dates with smart sorting and overdue detection
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

3. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on your device**
   - **iOS Simulator**: Press `i` in terminal or scan QR code with Camera app
   - **Android Emulator**: Press `a` in terminal or scan QR code with Expo Go app
   - **Physical Device**: Download Expo Go app and scan the QR code

## 📱 Usage Examples

### Creating Your First Task
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
- `npm run lint` - Run ESLint code analysis

### Running Tests

This project includes comprehensive unit tests for components and utility functions:

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

Test files are located in the `tests/` directory and cover:
- ✅ TaskContext state management
- ✅ TaskItem component interactions
- ✅ TaskList sorting and filtering
- ✅ Form validation functions
- ✅ Search and filter components

## 🔧 Configuration

### Environment Setup

No environment variables are required for basic functionality. The app uses:
- **AsyncStorage** for local data persistence (no setup needed)
- **Expo Router** for navigation (configured automatically)

### Dependencies

Key dependencies and their versions:
- **React Native**: ^0.74.5
- **Expo**: ~51.0.28
- **Expo Router**: ~3.5.23
- **React Native Reanimated**: ~3.10.1
- **AsyncStorage**: ~1.23.1

For a complete list, see `package.json`.

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
