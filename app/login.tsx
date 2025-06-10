import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
      <View style={styles.card}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Welcome back! Please login to your account.</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#b0b3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#b0b3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.signupButton}>
          <Text style={styles.signupText}>Don&apos;t have an account?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
  )
}

export default Login

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 50,
    paddingBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center', // Center contents vertically
    alignSelf: 'center',      // Center card horizontally
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2d3a4b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7a90',
    marginBottom: 30,
    marginTop: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: '#f4f6fb',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e4ed',
    fontSize: 16,
    color: '#222',
  },
  signupButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    marginBottom: 18,
  },
  signupText: {
    color: '#4f8cff',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#4f8cff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#4f8cff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
})