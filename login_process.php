<?php
session_start();
require 'config.php'; // קובץ החיבור למסד הנתונים

if (isset($_POST['g-recaptcha-response'])) {
    $recaptchaResponse = $_POST['g-recaptcha-response'];

    // אימות reCAPTCHA
    $recaptchaSecret = '6LdD5D4qAAAAAGNiEQ6sgtiswfmgs1pypB0PSVPc'; // Secret Key
    $apiKey = 'AIzaSyA4F3WlHJBEv2FJaDtxPSTb9_RnKz7gAFk'; // ה-API Key שלך
    $projectID = 'jumpi-1726090998040'; // Project ID

    $url = "https://recaptchaenterprise.googleapis.com/v1/projects/{$projectID}/assessments?key={$apiKey}";

    // שליחת הבקשה ל-reCAPTCHA Enterprise
    $data = [
        'event' => [
            'token' => $recaptchaResponse,
            'expectedAction' => 'login',
            'siteKey' => '6LdD5D4qAAAAAAK-u-OCdsOIpkw35N-fsq5xaNey'
        ]
    ];

    // הכנת הבקשה ושליחת הבקשה ל-reCAPTCHA Enterprise
    $options = [
        'http' => [
            'header' => "Content-Type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data),
        ],
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    $responseKeys = json_decode($response, true);

    // בדיקת תקפות ה-token
    if (!$responseKeys['tokenProperties']['valid']) {
        header("Location: login.php?error=אימות+CAPTCHA+נכשל");
        exit();
    }

    if (isset($_POST['username'], $_POST['password'])) {
        $username = trim($_POST['username']);
        $password = trim($_POST['password']);

        // בדיקת משתמש
        $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();

            if ($user['banned'] == 1) {
                header("Location: login.php?error=המשתמש+הזה+מורחק+מהמערכת");
                exit();
            }

            if (password_verify($password, $user['password'])) {
                // התחברות מוצלחת, יצירת טוקן
                $_SESSION['username'] = $user['username'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['coins'] = $user['coins'];
                $_SESSION['token'] = $user['token'];


                // יצירת טוקן
                $token = bin2hex(random_bytes(16)); // טוקן לדוגמה

                // שמירת הטוקן ב-SESSION
                $_SESSION['token'] = $token;

                // הפניה לדשבורד
                header("Location: dashboard.php");
                exit();
            } else {
                header("Location: login.php?error=סיסמא+שגויה");
                exit();
            }
        } else {
            header("Location: login.php?error=שם+משתמש+לא+קיים");
            exit();
        }
    } else {
        header("Location: login.php?error=יש+למלא+את+כל+השדות");
        exit();
    }
} else {
    header("Location: login.php?error=יש+למלא+את+ה-CAPTCHA");
    exit();
}
?>
