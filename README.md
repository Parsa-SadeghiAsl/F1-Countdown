# F1 Countdown 🏎️

A sleek and modern React Native application for Formula 1 fans. Never miss a session with a real-time countdown to the next race, qualifying, sprint, or practice, all displayed in your local time.



## 📖 About The Project

F1 Countdown is a mobile app built for Android that fetches the official Formula One race calendar and displays all upcoming events. The main feature is a prominent countdown timer that always points to the very next F1 session on the calendar, whether it's Free Practice 1 or the Grand Prix itself. The app automatically handles time zone conversions and fetches the next season's schedule once the current one is complete, ensuring you're always up-to-date.

## ✨ Features

* **Real-Time Countdown:** A live countdown to the next upcoming F1 session.
* **Full Season Schedule:** Fetches the complete calendar, including Practice (FP1, FP2, FP3), Qualifying, Sprint, and Race events.
* **Local Time Zone Conversion:** All session times are automatically converted and displayed in your device's local time.
* **Dynamic Year Handling:** Automatically fetches next year's schedule when the current season concludes.


## 🛠️ Tech Stack

* **Framework:** [React Native](https://reactnative.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **UI Components:** [React Native Paper](https://reactnativepaper.com/)
* **Data Fetching:** [Axios](https://axios-http.com/)
## 📊 API

This project uses the free and open-source F1 schedule database provided by [sportstimes/f1 on GitHub](https://github.com/sportstimes/f1).

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Ensure you have a React Native development environment set up on your machine.
* [React Native Environment Setup Guide](https://reactnative.dev/docs/environment-setup)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/f1-countdown.git](https://github.com/your-username/f1-countdown.git)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd f1-countdown
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```

### Running the App

1.  **Start the Metro server:**
    ```sh
    npx react-native start
    ```
2.  **Run on an Android Emulator or Device:**
    (In a new terminal window)
    ```sh
    npx react-native run-android
    ```

## 📦 Building for Production (APK)

To build a signed, production-ready APK, follow these steps:

1.  **Generate a private signing key:**
    ```sh
    cd android/app
    keytool -genkey -v -keystore f1-countdown-key.keystore -alias f1-countdown-alias -keyalg RSA -keysize 2048 -validity 10000
    ```
2.  **Set up your Gradle variables** by adding your key's password and alias to the `~/.gradle/gradle.properties` file.
3.  **Add the signing configuration** to your `android/app/build.gradle` file.
4.  **Generate the release build:**
    ```sh
    cd android
    ./gradlew assembleRelease
    ```
    The final APK will be located at `android/app/build/outputs/apk/release/app-release.apk`.

## 🗺️ Roadmap

* [ ] Implement push notifications to alert users before a session starts.
* [ ] Add a "Standings" tab for Drivers and Constructors.
* [ ] Include race results after each Grand Prix.
* [ ] Add detailed circuit information and layout maps.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.