import { useStripe } from "@stripe/stripe-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

export default function CheckoutScreen() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);

    const API_URL = 'https://localhost:3000'; // Replace with your server URL

    const fetchPaymentSheetParams = async () => {
        const response = await fetch(`${API_URL}/payment-sheet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Fetching payment sheet params...');
        const { paymentIntent, ephemeralKey, customer } = await response.json();
        console.log('Payment sheet params fetched:', { paymentIntent, ephemeralKey, customer });

        return {
            paymentIntent,
            ephemeralKey,
            customer,
        };
    };

    const initializePaymentSheet = useCallback(async () => {
        const {
            paymentIntent,
            ephemeralKey,
            customer,
        } = await fetchPaymentSheetParams();

        const { error } = await initPaymentSheet({
            merchantDisplayName: "Example, Inc.",
            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntent,
            // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
            //methods that complete payment after a delay, like SEPA Debit and Sofort.
            allowsDelayedPaymentMethods: true,
            defaultBillingDetails: {
                name: 'Jane Doe',
            }
        });
        if (!error) {
            setLoading(true);
        }
    }, [initPaymentSheet]);

    const openPaymentSheet = async () => {
        console.log('Opening payment sheet...');
        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
            Alert.alert('Success', 'Your order is confirmed!');
        }
    };

    useEffect(() => {
        initializePaymentSheet();
    }, [initializePaymentSheet]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Complete Your Purchase</Text>
                    <Text style={styles.subtitle}>Secure payment powered by Stripe</Text>
                </View>
                
                <View style={styles.paymentSection}>
                    <View style={styles.priceCard}>
                        <Text style={styles.priceLabel}>Total Amount</Text>
                        <Text style={styles.priceAmount}>$9.99</Text>
                    </View>
                    
                    <TouchableOpacity
                        style={[
                            styles.checkoutButton,
                            !loading && styles.checkoutButtonDisabled
                        ]}
                        disabled={!loading}
                        onPress={openPaymentSheet}
                        activeOpacity={0.8}
                    >
                        <Text style={[
                            styles.checkoutButtonText,
                            !loading && styles.checkoutButtonTextDisabled
                        ]}>
                            {!loading ? 'Proceed to Payment' : 'Loading...'}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafb',
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
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    paymentSection: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    priceCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    priceAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    checkoutButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 24,
    },
    checkoutButtonDisabled: {
        backgroundColor: '#E5E5E7',
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    checkoutButtonTextDisabled: {
        color: '#A1A1AA',
    },
    securityInfo: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    securityText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});