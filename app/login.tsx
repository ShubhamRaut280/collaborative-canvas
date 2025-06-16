import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';
import { setData, getData } from './db/userdata';


const loginStrings = {
    title: 'Sign In',
    subtitle: 'Welcome back! Please login to your account.',
    buttonText: 'Login',
    extraButton: "Don't have an account?",
}

const registerStrings = {
    title: 'Create Account',
    subtitle: 'Join us today! Please register to create a new account.',
    buttonText: 'Create Account',
    extraButton: "Already have an account?",
}
const Login = () => {


    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [pageTexts, setPageTexts] = useState(loginStrings)
    const [userName, setUserName] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    
   


    const validateCredentials = () => {
        // Basic validation logic
        if (!email || !password) {
            alert('Please fill in all fields.')
            return false
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            alert('Please enter a valid email address.')
            return false
        }
        if (!isLogin && !userName) {
            alert('Please fill in all fields.')
            return false
        }
        return true
    }

    const handleNewUser = async (user: any) => {
        if (userName) {
            setData('userName', userName);
            setData('userEmail', user.email);
            await updateProfile(user, { displayName: userName });
            alert('Registration successful! You can now log in.')

        } else {
            alert('Please enter your name.');
        }
    }

    const handleLogin = async () => {
        if (validateCredentials()) {
            setIsLoading(true)
            await signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    alert(`Welcome back! ${user.displayName}`);
                    setData('userName', user.displayName || 'User');
                    setData('userEmail', user.email || 'No email provided');
                })
                .catch((error) => {
                    alert(`Error: ${error.message}`);
                })
                .finally(() => setIsLoading(false));
        }
    }

    const handleRegister = async () => {
        if (validateCredentials()) {
            setIsLoading(true)
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                handleNewUser(auth.currentUser);
            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    alert('This email is already in use. Please try another one.')
                } else {
                    alert(`Error: ${error.message}`)
                }
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleLoginSwitch = () => {
        setIsLogin(true)
        setPageTexts(loginStrings)
    }

    const handleRegisterSwitch = () => {
        setIsLogin(false)
        setPageTexts(registerStrings)

    }

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{pageTexts.title}</Text>
            <Text style={styles.subtitle}>{pageTexts.subtitle}</Text>
            {!isLogin && (
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor="#b0b3b8"
                    value={userName}
                    onChangeText={setUserName}
                />
            )}
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
            <TouchableOpacity style={styles.signupButton} onPress={isLogin ? handleRegisterSwitch : handleLoginSwitch}>
                <Text style={styles.signupText}>{pageTexts.extraButton}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={isLogin ? handleLogin : handleRegister} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.buttonText}>{pageTexts.buttonText}</Text>
                )}
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