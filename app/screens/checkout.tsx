import { auth } from "@/firebaseConfig";
import { useStripe } from "@stripe/stripe-react-native";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get('window');

export default function CheckoutScreen() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(true); // Start with loading true
    const [ready, setReady] = useState(false); // Track if payment sheet is ready
    const [amount, setAmount] = useState('29.99'); // Add amount state

    const API_URL = 'http://10.0.2.2:3000';

    useEffect(() => {
        (async () => {
            await initializePaymentSheet();
        })();
    }, [amount])


    const fetchPaymentSheetParams = useCallback(async () => {
        try {
            const requestBody = {
                amount: parseFloat(amount), // Send as number, not cents
            };

            console.log('Request body:', requestBody);

            const response = await fetch(`${API_URL}/payment-sheet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            
            const data = await response.json();

            console.log('Response status:', response.status, data.error || 'No error message');

            if (!response.ok) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Error : ' + data.error || 'Unable to connect to payment server. Please try again later.',
                });
                return {};
            }

            return {
                paymentIntent: data.paymentIntent,
                ephemeralKey: data.ephemeralKey,
                customer: data.customer,
            };
        } catch (error) {
            console.error('Error fetching payment sheet params:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Unable to connect to payment server, please try again later.',
            });
            return {};
        }
    }, [amount]);

    const initializePaymentSheet = useCallback(async () => {
        const {
            paymentIntent,
            ephemeralKey,
            customer,
        } = await fetchPaymentSheetParams();

        console.log('Payment Intent:', paymentIntent);
        console.log('Ephemeral Key:', ephemeralKey);
        console.log('Customer:', customer);

        if (!paymentIntent || !ephemeralKey || !customer) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to communicate with payment server. Please try again.',
            });
            return;
        }

        const { error } = await initPaymentSheet({
            merchantDisplayName: "Example, Inc.",
            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntent,
            // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
            //methods that complete payment after a delay, like SEPA Debit and Sofort.
            allowsDelayedPaymentMethods: true,
            defaultBillingDetails: {
                name: auth.currentUser?.displayName || 'Firebase User', // Will be replaced by Firebase data
            }
        });
        if (!error) {
            setLoading(false); // Set loading to false when ready
            setReady(true); // Payment sheet is ready
        }
    }, [fetchPaymentSheetParams, initPaymentSheet]);

    const openPaymentSheet = async () => {


        if (!ready) {
            Toast.show({
                type: 'info',
                text1: 'Info',
                text2: 'Payment sheet is not ready yet. Please wait.',
            });
            return;
        }
        console.log('Opening payment sheet...');
        const { error } = await presentPaymentSheet();

        if (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message,
            });
        } else {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Your payment is successfull!',
            });
        }
    };


    return (
        <>


            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Complete Your Purchase</Text>
                    <Text style={styles.subtitle}>Secure payment powered by Stripe</Text>
                </View>

                <View style={styles.paymentSection}>
                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>Subscription Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Subscription Amount</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.currencySymbol}>$</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    value={amount}
                                    onChangeText={setAmount}
                                    placeholder="29.99"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.priceCard}>
                        <Text style={styles.priceLabel}>Premium Subscription</Text>
                        <Text style={styles.priceAmount}>${amount}</Text>
                        <Text style={styles.priceDescription}>Monthly subscription with full access</Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.checkoutButton,
                        ]}
                        onPress={openPaymentSheet}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.checkoutButtonText,
                        ]}>Subscribe Now
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.securityInfo}>
                        <Text style={styles.securityText}>
                            🔒 Your payment information is secure and encrypted
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff', // White background
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a', // Dark text for light theme
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666666', // Gray for subtitle
        textAlign: 'center',
    },
    paymentSection: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    formCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    textInput: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: '#007AFF',
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    amountInputCard: {
        backgroundColor: '#f8f9fa', // Light gray card background
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    inputLabel: {
        fontSize: 16,
        color: '#1a1a1a',
        marginBottom: 12,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    currencySymbol: {
        fontSize: 20,
        color: '#007AFF', // Blue accent color
        fontWeight: 'bold',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 20,
        color: '#1a1a1a',
        paddingVertical: 16,
        fontWeight: '600',
    },
    priceCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        borderWidth: 2,
        borderColor: '#007AFF',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    priceLabel: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 8,
    },
    priceAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007AFF', // Blue accent for amount
    },
    priceDescription: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginTop: 4,
    },
    checkoutButton: {
        backgroundColor: '#007AFF', // iOS blue
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 24,
    },
    checkoutButtonDisabled: {
        backgroundColor: '#e9ecef',
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    checkoutButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    checkoutButtonTextDisabled: {
        color: '#6c757d',
    },
    securityInfo: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    securityText: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
    },
});