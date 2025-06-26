import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth } from '../../firebaseConfig';
import { setData } from '../lib/models/db/userdata';
import Toast from 'react-native-toast-message';

const loginStrings = {
    title: 'Sign In',
    subtitle: 'Welcome back! Please login to your account.',
    buttonText: 'Login',
    extraButton: "Don't have an account?",
};

const registerStrings = {
    title: 'Create Account',
    subtitle: 'Join us today! Please register to create a new account.',
    buttonText: 'Create Account',
    extraButton: 'Already have an account?',
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pageTexts, setPageTexts] = useState(loginStrings);
    const [userName, setUserName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState<string>(''); // Add this state

    const validateCredentials = () => {
        if (!email || !password) {
            Toast.show({
                type: 'error',
                text1: 'Please fill in all fields.',
            })
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            Toast.show({
                type: 'error',
                text1: 'Please enter a valid email address.',
            })
            return false;
        }
        if (!isLogin && !userName) {
            Toast.show({
                type: 'error',
                text1: 'Please enter your name.',
            });
            return false;
        }
        return true;
    };

    const waitForVerification = async (user: any) => {
        setIsVerifying(true);
        setVerifyingEmail(user.email); // Set the email being verified

        const intervalId = setInterval(async () => {
            await user.reload();
            if (user.emailVerified) {
                clearInterval(intervalId);
                setIsVerifying(false);
                setVerifyingEmail('');
                Toast.show({
                    type: "success",
                    text1: 'Email verified! You can now log in.'
                });
                await signOut(auth); // force fresh login
                handleLogin(); // retry login
            }
        }, 3000); // check every 3 seconds

        // Store intervalId for cleanup if needed
        (waitForVerification as any).intervalId = intervalId;
    };

    const cancelVerification = async () => {
        setIsVerifying(false);
        setVerifyingEmail('');
        if ((waitForVerification as any).intervalId) {
            clearInterval((waitForVerification as any).intervalId);
        }
        await signOut(auth);
    };

    const handleNewUser = async (user: any) => {
        await updateProfile(user, { displayName: userName });
        await sendEmailVerification(user);
        waitForVerification(user);
    };

    const handleLogin = async () => {
        if (validateCredentials()) {
            setIsLoading(true);
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (!user.emailVerified) {
                    await sendEmailVerification(user);
                    await signOut(auth);
                    waitForVerification(user);
                    return;
                }

                Toast.show({
                    type: 'success'
                    , text1: `Welcome back! ${user.displayName}`
                });
                setData('userName', user.displayName || 'User');
                setData('userEmail', user.email || 'No email provided');
            } catch (error: any) {
                handleFirebaseErrorTypes(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRegister = async () => {
        if (validateCredentials()) {
            setIsLoading(true);
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await handleNewUser(user);
            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    Toast.show({
                        type: 'error',
                        text1: 'This email is already in use. Please try logging in.',
                    });
                } else {
                    Toast.show({
                        type: 'error',
                        text1: `Error: ${error.message}`,
                    });

                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleLoginSwitch = () => {
        setIsLogin(true);
        setPageTexts(loginStrings);
    };

    const handleRegisterSwitch = () => {
        setIsLogin(false);
        setPageTexts(registerStrings);
    };

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
                {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>{pageTexts.buttonText}</Text>}
            </TouchableOpacity>

            {/* Verification Modal */}
            <Modal visible={isVerifying} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={{ marginBottom: 10, fontSize: 16, fontWeight: '500' }}>
                            Waiting for Email Verification...
                        </Text>
                        <Text style={{ marginBottom: 10, fontSize: 14, color: '#4f8cff' }}>
                            Sent to: {verifyingEmail}
                        </Text>
                        <ActivityIndicator size="large" color="#4f8cff" />
                        <Text style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                            Check your inbox and click the link.
                        </Text>
                        <TouchableOpacity
                            style={{
                                marginTop: 22,
                                backgroundColor: '#e53e3e',
                                paddingVertical: 10,
                                paddingHorizontal: 24,
                                borderRadius: 8,
                            }}
                            onPress={cancelVerification}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Login;


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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
    },

})

function handleFirebaseErrorTypes(error: any) {
    if (error.code === 'auth/user-not-found') {
        Toast.show({
            type: 'error',
            text1: 'User not found. Please register.',
        });
    } else if (error.code === 'auth/wrong-password') {
        Toast.show({
            type: 'error',
            text1: 'Incorrect password. Please try again.',
        });
    } else {
        Toast.show({
            type: 'error',
            text1: `Error: ${error.message}`,
        });
    }
}
