import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { StyleSheet, Switch, Text, View } from 'react-native';

export default function App() {
  const {colorScheme, toggleColorScheme} = useColorScheme();
  return (
    <View className="flex-1 flex justify-center items-center dark:bg-neutral-900 space-y-6">
      <StatusBar style={colorScheme=="dark"? "light": "dark"} />
      <View className="flex-row justify-center items-center space-x-2">
        <Text className="text-xl dark:text-white">Dark Mode</Text>
        <Switch value={colorScheme=='dark'} onChange={toggleColorScheme} />
      </View>
      
      <Text className="mx-4 text-justify" style={colorScheme=='dark'? styles.textWhite: styles.textBlack}>
        Click here to change theme
      </Text>
      <View className="h-48 w-full bg-sky-400 dark:bg-emerald-400" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWhite: {
    color: 'white'
  },
  textBlack: {
    color: 'black'
  }
});
