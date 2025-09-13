import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TaskProvider } from "../context/TaskContext";
import { Theme } from "../theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TaskProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Theme.light.colors.surface,
            },
            headerTintColor: Theme.light.colors.primary,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            headerShadowVisible: true,
            contentStyle: {
              backgroundColor: Theme.light.colors.surface,
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              title: "Tasks"
            }}
          />
          <Stack.Screen
            name="add-task"
            options={{
              presentation: "modal",
              headerShown: false,
              title: "Add Task"
            }}
          />
          <Stack.Screen
            name="task/[id]"
            options={{
              headerShown: false,
              title: "Task Details",
              animation: "slide_from_right"
            }}
          />
        </Stack>
      </TaskProvider>
    </SafeAreaProvider>
  );
}
