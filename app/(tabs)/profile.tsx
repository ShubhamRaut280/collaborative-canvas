import { auth } from '@/firebaseConfig'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const Profile = () => {
  const user = auth.currentUser
  const navigation = useNavigation()

  const handleLogout = async () => {
    try {
      await auth.signOut()
      // Optionally navigate to login screen
      // navigation.replace('Login')
    } catch (e) {
      // handle error
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={
            user?.photoURL
              ? { uri: user.photoURL }
              : { uri: 'https://ui-avatars.com/api/?name=User&background=4287f5&color=fff&size=128' }
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.displayName || 'Anonymous'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf0fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: 320,
    borderRadius: 20,
    alignItems: 'center',
    padding: 32,
    shadowColor: '#4287f5',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 18,
    backgroundColor: '#dbeafe',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22223b',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 28,
  },
  logoutButton: {
    backgroundColor: '#4287f5',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 30,
    marginTop: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
})