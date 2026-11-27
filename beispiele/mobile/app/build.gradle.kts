plugins {
    id("com.android.application")
}

android {
    namespace = "de.lernplattform.minishop"
    compileSdk = 35

    defaultConfig {
        applicationId = "de.lernplattform.minishop"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    // Keine Laufzeit-Bibliotheken: Die App nutzt nur das Android-SDK.
    testImplementation("junit:junit:4.13.2")
}
