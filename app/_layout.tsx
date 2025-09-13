import { Stack } from "expo-router";
import { TaskProvider } from "../context/TaskContext";
import { Theme } from "../theme";

export default function RootLayout() {
  return (
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
            backgroundColor: Theme.light.colors.background,
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
          name="TaskDetailScreen"
          options={{
            headerShown: true,
            title: "Task Details",
            animation: "slide_from_right"
          }}
        />
      </Stack>
    </TaskProvider>
  );
}
