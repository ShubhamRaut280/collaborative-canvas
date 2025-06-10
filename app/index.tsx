import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const Home = () => {
    return (
        <View>
            <Text style={styles.text}>Welcome to the Home Page!</Text>
            <Link href="/login" style={{ textAlign: "center", fontSize: 18 }}>
                Go to Login
            </Link>
            {/* <Link href="/profile" style={{ textAlign: "center", fontSize: 18 }}>
                Go to Profile
            </Link> */}
        </View>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        margin: 20,
    },
});

export default Home;